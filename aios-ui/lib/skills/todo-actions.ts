import { spawn } from 'child_process'
import type { Todo, TodoType } from '@/lib/types'

const DEFAULT_TIMEOUT_MS = 300_000 // 5min — actions may hit MCP servers

// Maps a todo's suggested_action (with type as a fallback) to the prompt we
// hand to `claude --print`. Some actions are real slash-commands today (when
// matching skills exist), others are free-text prompts. The registry is the
// one place to change behavior as new skills land — UI never sees the prompt.
//
// PRINCIPLE: the prompt is always self-contained. Do not assume claude has
// any prior session context. Pass the todo's summary + context inline.
export function buildActionPrompt(todo: Todo): string {
  const action = todo.suggested_action || fallbackActionForType(todo.type)
  switch (action) {
    case 'draft_reply':
      return draftReplyPrompt(todo)
    case 'follow_up':
      return followUpPrompt(todo)
    case 'log_decision':
      return logDecisionPrompt(todo)
    case 'calendar_check':
      return calendarCheckPrompt(todo)
    case 'generic':
    default:
      return genericPrompt(todo)
  }
}

function fallbackActionForType(type: TodoType): string {
  switch (type) {
    case 'email_reply': return 'draft_reply'
    case 'follow_up':   return 'follow_up'
    case 'decision_log': return 'log_decision'
    case 'calendar_check': return 'calendar_check'
    case 'generic':
    default: return 'generic'
  }
}

function projectLine(todo: Todo): string {
  if (!todo.client_slug) return ''
  const proj = todo.project_slug ? `/${todo.project_slug}` : ''
  return `Project: ${todo.client_slug}${proj}\n`
}

function contextBlock(todo: Todo): string {
  return todo.context ? `Context: ${todo.context}\n` : ''
}

function draftReplyPrompt(todo: Todo): string {
  const threadId = (todo.action_params?.thread_id as string | undefined) ?? todo.thread_id
  const threadRef = threadId ? `Gmail thread id: ${threadId}` : 'Gmail thread (id unknown — search by sender + subject)'
  return [
    `Task: ${todo.summary}`,
    projectLine(todo),
    contextBlock(todo),
    threadRef,
    '',
    'Steps:',
    '1. Fetch the thread with mcp__claude_ai_Gmail__get_thread.',
    '2. Read references/voice.md for tone.',
    '3. If a related project memory file is mentioned in the context, read it for any relevant state.',
    '4. Draft a reply using mcp__claude_ai_Gmail__create_draft. Do NOT send.',
    '5. Print the draft body in your response so I can review.',
    '',
    'Rules: draft-only, never send. Match the voice. Keep it short.',
  ].filter(Boolean).join('\n')
}

function followUpPrompt(todo: Todo): string {
  return [
    `Task: ${todo.summary}`,
    projectLine(todo),
    contextBlock(todo),
    '',
    'Draft a short follow-up message I can send. Use references/voice.md for tone.',
    'Print the draft in chat — do not create a Gmail draft yet unless I confirm.',
  ].filter(Boolean).join('\n')
}

function logDecisionPrompt(todo: Todo): string {
  // /gsd-capture is a real skill that knows how to route to decisions/log.md.
  // Pass the summary as the capture body; capture handles its own destination.
  return `/gsd-capture ${todo.summary}${todo.context ? ` — ${todo.context}` : ''}`
}

function calendarCheckPrompt(todo: Todo): string {
  return [
    `Task: ${todo.summary}`,
    contextBlock(todo),
    '',
    'Pull today\'s + tomorrow\'s Google Calendar events with mcp__claude_ai_Google_Calendar__list_events.',
    'Highlight conflicts, prep gaps, and anything that touches an active project.',
  ].filter(Boolean).join('\n')
}

function genericPrompt(todo: Todo): string {
  return [
    todo.summary,
    projectLine(todo),
    contextBlock(todo),
    '',
    'Help me complete this. Ask me one clarifying question if you need to, then do it.',
  ].filter(Boolean).join('\n')
}

// ---------- subprocess spawn (mirrors lib/skills/ritual.ts) ----------

interface RunTodoActionOptions {
  todo: Todo
  claudeBin?: string
  args?: string[]
  timeoutMs?: number
  onStdout?: (chunk: string) => void
  signal?: AbortSignal
}

export interface TodoActionResult {
  status: 'success' | 'failed' | 'timeout'
  output: string
  exitCode: number
  durationMs: number
  error?: string
}

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

export async function runTodoAction(opts: RunTodoActionOptions): Promise<TodoActionResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const prompt = buildActionPrompt(opts.todo)
  // Tests can override args entirely (e.g. ['--fail']); production prepends the
  // standard flag set and appends the prompt last.
  const baseArgs = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
  ]
  const effectiveArgs = [...(opts.args ?? baseArgs), prompt]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const start = Date.now()
  return new Promise<TodoActionResult>(resolve => {
    let lineBuffer = ''
    let aggregatedText = ''
    let stderr = ''
    let settled = false

    const processLine = (line: string) => {
      const delta = extractTextDelta(line)
      if (delta !== null) {
        aggregatedText += delta
        opts.onStdout?.(delta)
      }
    }

    const child = spawn(claudeBin, effectiveArgs, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.env.CLAUDE_OS_ROOT ?? process.cwd(),
    })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({
        status: 'timeout',
        output: aggregatedText,
        exitCode: -1,
        durationMs: Date.now() - start,
        error: `Subprocess exceeded ${timeoutMs}ms`,
      })
    }, timeoutMs)

    const onAbort = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.kill('SIGKILL')
      resolve({
        status: 'failed',
        output: aggregatedText,
        exitCode: -1,
        durationMs: Date.now() - start,
        error: 'Aborted by client',
      })
    }
    if (opts.signal) {
      if (opts.signal.aborted) {
        onAbort()
        return
      }
      opts.signal.addEventListener('abort', onAbort, { once: true })
    }

    child.stdout.on('data', d => {
      lineBuffer += d.toString()
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''
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
        output: aggregatedText,
        exitCode: -1,
        durationMs: Date.now() - start,
        error: err.message,
      })
    })

    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (lineBuffer.trim()) processLine(lineBuffer)
      const durationMs = Date.now() - start
      if (code === 0) {
        resolve({ status: 'success', output: aggregatedText, exitCode: 0, durationMs })
      } else {
        resolve({
          status: 'failed',
          output: aggregatedText,
          exitCode: code ?? -1,
          durationMs,
          error: stderr.trim() || `exit ${code}`,
        })
      }
    })
  })
}
