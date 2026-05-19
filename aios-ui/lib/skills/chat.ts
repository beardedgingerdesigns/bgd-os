import { spawn } from 'child_process'
import type { ChatLoadResult, ChatMessageResult } from '@/lib/types'

const DEFAULT_TIMEOUT_MS = 300_000

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

function extractSessionId(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    const type = parsed?.type
    // Skip `system` hook events — they emit session_ids tied to the SessionStart
    // hook lifecycle (a daemon-level session), NOT the conversation session that
    // --resume can pick up. Only trust session_id from real conversation events:
    //   - "stream_event" (per-token streaming envelope)
    //   - "result" (final summary at end of --print run)
    //   - "assistant" (complete assistant message envelope)
    if (type !== 'stream_event' && type !== 'result' && type !== 'assistant') return null
    const sid = parsed?.session_id
    return typeof sid === 'string' ? sid : null
  } catch {
    return null
  }
}

interface RunChatLoadOptions {
  claudeBin?: string
  /** Pre-built markdown brief (use lib/skills/chat-brief.ts). Passed as the seed user message. */
  brief: string
  /** Human-readable label for the project (used in prompt phrasing). */
  projectLabel: string
  args?: string[]
  timeoutMs?: number
  onStdout?: (chunk: string) => void
}

/**
 * Start a resumable chat session by sending the project brief as the first
 * user message. We deliberately do NOT use `claude --print "/load <slug>"`
 * because slash commands invoked via --print create non-resumable sessions.
 * Plain text prompts with the brief embedded create normal sessions that
 * `--resume` can pick up for subsequent turns.
 */
export async function runChatLoad(opts: RunChatLoadOptions): Promise<ChatLoadResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const seedPrompt = `I'm working on ${opts.projectLabel}. Here is the context I have on the project so far:

${opts.brief}

---

Please briefly orient yourself: confirm what you see, flag anything that looks load-bearing or at-risk, and offer to help. Keep your initial response short — I'll ask follow-ups.`

  const args = opts.args ?? [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    seedPrompt,
  ]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  return runStreamingClaude(claudeBin, args, timeoutMs, opts.onStdout, true)
}

interface RunChatMessageOptions {
  claudeBin?: string
  sessionId: string
  message: string
  args?: string[]
  timeoutMs?: number
  onStdout?: (chunk: string) => void
}

export async function runChatMessage(
  opts: RunChatMessageOptions,
): Promise<ChatMessageResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const args = opts.args ?? [
    '--print',
    '--resume', opts.sessionId,
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    opts.message,
  ]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const result = await runStreamingClaude(claudeBin, args, timeoutMs, opts.onStdout, false)
  return {
    status: result.status,
    output: result.output,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    error: result.error,
  }
}

function runStreamingClaude(
  claudeBin: string,
  args: string[],
  timeoutMs: number,
  onStdout: ((chunk: string) => void) | undefined,
  captureSessionId: boolean,
): Promise<ChatLoadResult> {
  const start = Date.now()
  return new Promise<ChatLoadResult>(resolve => {
    let lineBuffer = ''
    let aggregatedText = ''
    let sessionId: string | null = null
    let stderr = ''
    let settled = false

    const processLine = (line: string) => {
      const delta = extractTextDelta(line)
      if (delta !== null) {
        aggregatedText += delta
        onStdout?.(delta)
      }
      if (captureSessionId && sessionId === null) {
        const sid = extractSessionId(line)
        if (sid) sessionId = sid
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
        sessionId,
        output: aggregatedText,
        exitCode: -1,
        durationMs: Date.now() - start,
        error: `Subprocess exceeded ${timeoutMs}ms`,
      })
    }, timeoutMs)

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
        sessionId: null,
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
        resolve({
          status: 'success',
          sessionId,
          output: aggregatedText,
          exitCode: 0,
          durationMs,
        })
      } else {
        resolve({
          status: 'failed',
          sessionId: null,
          output: aggregatedText,
          exitCode: code ?? -1,
          durationMs,
          error: stderr.trim() || `exit ${code}`,
        })
      }
    })
  })
}
