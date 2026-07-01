import { spawn } from 'child_process'
import type { PendingTodo } from '@/lib/types'
import type { TodoActionResult } from '@/lib/skills/todo-actions'

const DEFAULT_TIMEOUT_MS = 300_000

export { type TodoActionResult }

export function buildPendingActionPrompt(todo: PendingTodo): string {
  // Prefer new delegation action type over legacy auto-detected type
  if (todo.action) {
    switch (todo.action) {
      case 'draft-email':
        return pendingEmailPrompt(todo)
      case 'update-state':
        return pendingUpdateStatePrompt(todo)
      case 'stage-wiki':
        return pendingStageWikiPrompt(todo)
      case 'research':
        throw new Error('research action type is not yet supported')
    }
  }
  switch (todo.actionType) {
    case 'email':
      return pendingEmailPrompt(todo)
    case 'calendar':
      return pendingCalendarPrompt(todo)
    default:
      throw new Error('Generic action type is not yet supported')
  }
}

function clientLine(todo: PendingTodo): string {
  return todo.client ? `Project: ${todo.client}\n` : ''
}

function notesBlock(todo: PendingTodo): string {
  return todo.notes ? `Context: ${todo.notes}\n` : ''
}

function pendingEmailPrompt(todo: PendingTodo): string {
  return [
    `Task: ${todo.summary}`,
    clientLine(todo),
    todo.actionContext ? `Action context: ${todo.actionContext}\n` : '',
    notesBlock(todo),
    'Steps:',
    '1. Search Gmail for the relevant thread using mcp__claude_ai_Gmail__search_threads with keywords from the task summary.',
    '2. Read references/voice.md for tone.',
    '3. If a client is mentioned, check state/<client>.md for project context.',
    '4. Draft the email using mcp__claude_ai_Gmail__create_draft. Do NOT send.',
    '5. Print the draft body in your response so I can review.',
    '',
    'Rules: draft-only, never send. Match the voice. Keep it short.',
  ].filter(Boolean).join('\n')
}

function pendingUpdateStatePrompt(todo: PendingTodo): string {
  const slug = todo.client?.split('/')[0]?.trim()
  return [
    `Task: ${todo.summary}`,
    clientLine(todo),
    todo.actionContext ? `Action context: ${todo.actionContext}\n` : '',
    notesBlock(todo),
    'Steps:',
    slug
      ? `1. Read the current state file at state/${slug}.md.`
      : '1. Identify which state file to update based on the task context.',
    '2. Apply the changes described in the action context above.',
    '3. Update the **Updated:** field to today\'s date.',
    '4. Write the updated file.',
    '5. Print a one-line summary of what changed.',
    '',
    'Rules: only modify the state file. Do not touch other files.',
  ].filter(Boolean).join('\n')
}

function pendingStageWikiPrompt(todo: PendingTodo): string {
  const slug = todo.client?.split('/')[0]?.trim()
  return [
    `Task: ${todo.summary}`,
    clientLine(todo),
    todo.actionContext ? `Action context: ${todo.actionContext}\n` : '',
    notesBlock(todo),
    'Steps:',
    '1. Read clients.yaml to find docs_paths for the client.',
    slug
      ? `2. Look for a wiki at the first docs_path for client "${slug}". Stage content to {wiki}/raw/aios/.`
      : '2. Stage content to docs/wiki/raw/research/ (no client specified).',
    '3. Write a markdown file with the content described in the action context.',
    '4. Name the file descriptively with today\'s date, e.g. terraplex-meeting-notes-2026-07-01.md.',
    '5. Print the file path you wrote to.',
    '',
    'Rules: write ONLY to raw/aios/ staging. Never write directly to curated wiki pages.',
  ].filter(Boolean).join('\n')
}

function pendingCalendarPrompt(todo: PendingTodo): string {
  return [
    `Task: ${todo.summary}`,
    clientLine(todo),
    notesBlock(todo),
    'Steps:',
    '1. Check my Google Calendar for availability using mcp__claude_ai_Google_Calendar__list_events.',
    '2. If a client is mentioned, check state/<client>.md and clients.yaml for contact info.',
    '3. Create the calendar event using mcp__claude_ai_Google_Calendar__create_event with attendees and a suggested time.',
    '4. Print the event details in your response so I can review.',
  ].filter(Boolean).join('\n')
}

// ---------- subprocess spawn (same pattern as todo-actions.ts) ----------

function extractTextDelta(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  let parsed: unknown
  try { parsed = JSON.parse(trimmed) } catch { return null }
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

interface RunPendingTodoActionOptions {
  todo: PendingTodo
  onStdout?: (chunk: string) => void
  signal?: AbortSignal
  timeoutMs?: number
}

export async function runPendingTodoAction(
  opts: RunPendingTodoActionOptions,
): Promise<TodoActionResult> {
  const prompt = buildPendingActionPrompt(opts.todo)
  const claudeBin = 'claude'
  const args = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    prompt,
  ]
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

    const child = spawn(claudeBin, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.env.CLAUDE_OS_ROOT ?? process.cwd(),
    })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({ status: 'timeout', output: aggregatedText, exitCode: -1, durationMs: Date.now() - start, error: `Subprocess exceeded ${timeoutMs}ms` })
    }, timeoutMs)

    const onAbort = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.kill('SIGKILL')
      resolve({ status: 'failed', output: aggregatedText, exitCode: -1, durationMs: Date.now() - start, error: 'Aborted by client' })
    }
    if (opts.signal) {
      if (opts.signal.aborted) { onAbort(); return }
      opts.signal.addEventListener('abort', onAbort, { once: true })
    }

    child.stdout.on('data', (d: Buffer) => {
      lineBuffer += d.toString()
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''
      for (const line of lines) processLine(line)
    })
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    child.on('error', err => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ status: 'failed', output: aggregatedText, exitCode: -1, durationMs: Date.now() - start, error: err.message })
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
        resolve({ status: 'failed', output: aggregatedText, exitCode: code ?? -1, durationMs, error: stderr.trim() || `exit ${code}` })
      }
    })
  })
}
