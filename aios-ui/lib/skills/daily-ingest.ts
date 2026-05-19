import { spawn } from 'child_process'
import type { TriageRunResult } from '@/lib/types'

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

    const child = spawn(claudeBin, args, { shell: false })

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
