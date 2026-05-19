import { spawn } from 'child_process'
import type { TriageRunResult } from '@/lib/types'

interface RunOptions {
  claudeBin?: string                                   // path to claude CLI (default: 'claude')
  args?: string[]                                      // extra args (default: ['--print', '/daily-inbox-triage'])
  timeoutMs?: number                                   // default 60_000
  onStdout?: (chunk: string) => void                   // optional streaming callback
}

const DEFAULT_TIMEOUT_MS = 300_000 // 5min default — most skills that hit MCP servers need real time

export async function runDailyIngest(opts: RunOptions = {}): Promise<TriageRunResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  // `--permission-mode bypassPermissions` is load-bearing: in `--print` mode
  // the skill cannot answer the MCP permission prompt interactively, so without
  // this flag Claude returns "I need permission to access Gmail..." instead of
  // running /daily-inbox-triage. The user clicking the button IS authorization.
  const args = opts.args ?? ['--print', '--permission-mode', 'bypassPermissions', '/daily-inbox-triage']
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
