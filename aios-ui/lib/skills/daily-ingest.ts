import { spawn } from 'child_process'
import type { TriageRunResult } from '@/lib/types'

interface RunOptions {
  claudeBin?: string                                   // path to claude CLI (default: 'claude')
  args?: string[]                                      // extra args (default: ['--print', '/daily-inbox-triage'])
  timeoutMs?: number                                   // default 60_000
  onStdout?: (chunk: string) => void                   // optional streaming callback
}

const DEFAULT_TIMEOUT_MS = 60_000

export async function runDailyIngest(opts: RunOptions = {}): Promise<TriageRunResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const args = opts.args ?? ['--print', '/daily-inbox-triage']
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const start = Date.now()
  return new Promise<TriageRunResult>(resolve => {
    let stdout = ''
    let stderr = ''
    let settled = false

    const child = spawn(claudeBin, args, { shell: false })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({
        status: 'timeout',
        exitCode: -1,
        output: stdout,
        durationMs: Date.now() - start,
        error: `Subprocess exceeded ${timeoutMs}ms`,
      })
    }, timeoutMs)

    child.stdout.on('data', d => {
      const chunk = d.toString()
      stdout += chunk
      opts.onStdout?.(chunk)
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
        output: stdout,
        durationMs: Date.now() - start,
        error: err.message,
      })
    })

    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const durationMs = Date.now() - start
      if (code === 0) {
        resolve({ status: 'success', exitCode: 0, output: stdout, durationMs })
      } else {
        resolve({
          status: 'failed',
          exitCode: code ?? -1,
          output: stdout,
          durationMs,
          error: stderr.trim() || `exit ${code}`,
        })
      }
    })
  })
}
