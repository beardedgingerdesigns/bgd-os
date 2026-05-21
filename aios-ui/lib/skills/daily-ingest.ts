import { spawn } from 'child_process'
import type { Todo, TodosCacheEntry, TodoStatus, TodoType, TriageRunResult } from '@/lib/types'

interface RunOptions {
  claudeBin?: string                                   // path to claude CLI (default: 'claude')
  args?: string[]                                      // extra args (default below)
  timeoutMs?: number                                   // default 300_000
  onStdout?: (chunk: string) => void                   // streaming callback (text deltas only)
}

const DEFAULT_TIMEOUT_MS = 300_000 // 5min default — most skills that hit MCP servers need real time

// Pull out the text from a single line of `claude --print --output-format stream-json`.
// Returns null if the line isn't a text-delta event (system hooks, tool use, message
// envelopes, partial-line garbage, etc. all yield null).
function extractTextDelta(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  if (obj.type !== 'stream_event') return null
  const event = obj.event as Record<string, unknown> | undefined
  if (!event || event.type !== 'content_block_delta') return null
  const delta = event.delta as Record<string, unknown> | undefined
  if (!delta || delta.type !== 'text_delta') return null
  const text = delta.text
  return typeof text === 'string' ? text : null
}

export async function runDailyIngest(opts: RunOptions = {}): Promise<TriageRunResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  // stream-json gives us real per-token streaming; --verbose is required by Claude Code
  // when combined with --print + stream-json; --permission-mode bypassPermissions lets the
  // skill call MCP tools without interactive prompts (button click = authorization).
  const args = opts.args ?? [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    '/daily-inbox-triage',
  ]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const start = Date.now()
  return new Promise<TriageRunResult>(resolve => {
    let lineBuffer = ''      // accumulates partial lines from stdout chunks
    let aggregatedText = ''  // concatenation of every text-delta — this is what gets cached
    let stderr = ''
    let settled = false

    const processLine = (line: string) => {
      const delta = extractTextDelta(line)
      if (delta !== null) {
        aggregatedText += delta
        opts.onStdout?.(delta)
      }
    }

    // stdio: ignore stdin so claude doesn't print "no stdin data received in 3s"
    // when run from Next.js. Pipe stdout + stderr so we can capture both.
    const child = spawn(claudeBin, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({
        status: 'timeout',
        exitCode: -1,
        output: aggregatedText,
        durationMs: Date.now() - start,
        error: `Subprocess exceeded ${timeoutMs}ms`,
      })
    }, timeoutMs)

    child.stdout.on('data', d => {
      lineBuffer += d.toString()
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''  // last element may be a partial line; keep buffered
      for (const line of lines) processLine(line)
    })

    child.stderr.on('data', d => {
      stderr += d.toString()
    })

    child.on('error', err => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({
        status: 'failed',
        exitCode: -1,
        output: aggregatedText,
        durationMs: Date.now() - start,
        error: err.message,
      })
    })

    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      // Process any remaining buffered line (e.g., final line without trailing newline)
      if (lineBuffer.trim()) processLine(lineBuffer)
      const durationMs = Date.now() - start
      if (code === 0) {
        resolve({ status: 'success', exitCode: 0, output: aggregatedText, durationMs })
      } else {
        resolve({
          status: 'failed',
          exitCode: code ?? -1,
          output: aggregatedText,
          durationMs,
          error: stderr.trim() || `exit ${code}`,
        })
      }
    })
  })
}

// ---- structured todos envelope ----

// Skill emits a fenced JSON block between TODOS_JSON_START / TODOS_JSON_END markers.
// Capture lazily so we get the LAST block if the model accidentally emits two; the
// `[\s\S]` matches across newlines.
const TODOS_ENVELOPE_RE = /<!--\s*TODOS_JSON_START\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*TODOS_JSON_END\s*-->/i

const TODO_TYPES: TodoType[] = ['email_reply', 'follow_up', 'calendar_check', 'decision_log', 'generic']
const TODO_STATUSES: TodoStatus[] = ['open', 'in_progress', 'done', 'dismissed']

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function coerceTodo(raw: unknown, index: number): Todo | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const summary = asString(r.summary)
  if (!summary) return null
  const typeRaw = r.type
  const type = (TODO_TYPES as string[]).includes(typeof typeRaw === 'string' ? typeRaw : '')
    ? (typeRaw as TodoType)
    : 'generic'
  const statusRaw = r.status
  const status = (TODO_STATUSES as string[]).includes(typeof statusRaw === 'string' ? statusRaw : '')
    ? (statusRaw as TodoStatus)
    : 'open'
  const id = asString(r.id) ?? `todo-${index}-${Math.random().toString(36).slice(2, 10)}`
  const suggested_action = asString(r.suggested_action) ?? (type === 'email_reply' ? 'draft_reply' : 'generic')
  const action_params =
    typeof r.action_params === 'object' && r.action_params !== null
      ? (r.action_params as Record<string, unknown>)
      : undefined

  return {
    id,
    type,
    summary,
    context: asString(r.context),
    thread_id: asString(r.thread_id),
    client_slug: asString(r.client_slug),
    project_slug: asString(r.project_slug),
    suggested_action,
    action_params,
    status,
  }
}

// Extract the structured envelope from a completed triage run's aggregated text.
// Returns null if the envelope is missing or malformed — callers should treat that
// as "markdown-only run, no todos to cache" and continue without writing the cache.
export function extractTodosEnvelope(output: string): TodosCacheEntry | null {
  const match = output.match(TODOS_ENVELOPE_RE)
  if (!match) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(match[1])
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.todos)) return null
  const todos = obj.todos
    .map((t, i) => coerceTodo(t, i))
    .filter((t): t is Todo => t !== null)
  const generatedAt = asString(obj.generated_at) ?? new Date().toISOString()
  return { generatedAt, todos }
}
