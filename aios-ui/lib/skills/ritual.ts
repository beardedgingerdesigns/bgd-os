import { spawn } from 'child_process'
import type { RitualRunResult, RitualSlug } from '@/lib/types'

const DEFAULT_TIMEOUT_MS = 300_000

const RITUAL_COMMANDS: Record<RitualSlug, string> = {
  'level-up': '/level-up',
  'weekly-status': '/weekly-project-status',
  'audit': '/audit',
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

interface RunRitualOptions {
  slug: RitualSlug
  claudeBin?: string
  args?: string[]
  timeoutMs?: number
  onStdout?: (chunk: string) => void
  signal?: AbortSignal
}

export async function runRitual(opts: RunRitualOptions): Promise<RitualRunResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const command = RITUAL_COMMANDS[opts.slug]
  // Base flags for the production path. Tests can override the flag list via
  // opts.args (e.g. ['--fail'] / ['--slow']). Either way, the ritual command
  // is always appended last so the subprocess + fixture can detect which
  // ritual is running.
  const baseArgs = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
  ]
  const effectiveArgs = [...(opts.args ?? baseArgs), command]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const start = Date.now()
  return new Promise<RitualRunResult>(resolve => {
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
