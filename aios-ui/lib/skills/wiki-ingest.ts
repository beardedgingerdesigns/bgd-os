import { spawn } from 'child_process'

const DEFAULT_TIMEOUT_MS = 300_000 // 5 min — ingest passes can be slow on large wikis

// Copied from daily-ingest.ts / ritual.ts. Parses a single line of
// `claude --print --output-format stream-json` output, returning the text
// content of any text_delta event, or null for everything else.
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

// Matches the structured summary envelope emitted by the /ingest-aios-drops skill:
//   <!-- INGEST_SUMMARY_START -->
//   ```json
//   { ... }
//   ```
//   <!-- INGEST_SUMMARY_END -->
// Lazy multi-line match. Case-insensitive for the marker names.
const INGEST_SUMMARY_RE =
  /<!--\s*INGEST_SUMMARY_START\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*INGEST_SUMMARY_END\s*-->/i

export interface WikiIngestSummary {
  promoted: string[]
  deferred: string[]
  contested: string[]
}

export interface WikiIngestResult {
  status: 'success' | 'failed' | 'timeout'
  output: string
  exitCode: number
  durationMs: number
  error?: string
  summary?: WikiIngestSummary
}

export interface RunWikiIngestOptions {
  wikiPath: string
  claudeBin?: string
  timeoutMs?: number
  onStdout?: (chunk: string) => void
}

/**
 * runWikiIngest: spawns `claude` with the /ingest-aios-drops skill,
 * streams stdout as text deltas, and on success parses the
 * INGEST_SUMMARY_START / INGEST_SUMMARY_END structured envelope.
 *
 * Mirrors runRitual and runDailyIngest patterns exactly.
 */
export async function runWikiIngest(opts: RunWikiIngestOptions): Promise<WikiIngestResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const args = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    `/ingest-aios-drops ${opts.wikiPath}`,
  ]

  const start = Date.now()
  return new Promise<WikiIngestResult>(resolve => {
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
      resolve({
        status: 'timeout',
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
        // Attempt to parse the structured summary envelope.
        const match = aggregatedText.match(INGEST_SUMMARY_RE)
        let summary: WikiIngestSummary | undefined
        if (match) {
          try {
            const parsed = JSON.parse(match[1]) as Record<string, unknown>
            summary = {
              promoted: Array.isArray(parsed.promoted) ? (parsed.promoted as string[]) : [],
              deferred: Array.isArray(parsed.deferred) ? (parsed.deferred as string[]) : [],
              contested: Array.isArray(parsed.contested) ? (parsed.contested as string[]) : [],
            }
          } catch {
            // Malformed JSON inside markers — skip summary, still treat as success
          }
        }
        resolve({ status: 'success', output: aggregatedText, exitCode: 0, durationMs, summary })
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
