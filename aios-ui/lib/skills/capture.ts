import { spawn } from 'child_process'
import type { CaptureRunResult } from '@/lib/types'
import { resolveProjectWikiPath } from '@/lib/data/wiki'
import { slugify, writeRawDrop } from '@/lib/raw-drops'
import { appendReceipt } from '@/lib/cache/receipts'
import { classifyContent } from '@/lib/content-classifier'
import matter from 'gray-matter'

const DEFAULT_TIMEOUT_MS = 90_000

// HUB-06: every capture receipt MUST carry an absolute file path. When the
// /capture subprocess succeeds but its stdout does not expose a parseable
// absolute .md path, we SUPPRESS the receipt rather than emit one with an
// empty file_written field. PATH_REGEXES are tried in order; first match wins.
const PATH_REGEXES: RegExp[] = [
  /(?:Wrote|Created|Saved)\s+(?:.*?\s+(?:to|:)\s+)?(\/[^\s'"`]+\.md)/i,
  /(?:file|path)[:=]\s*"?(\/[^\s'"`]+\.md)"?/i,
  /Captured to\s+(\/[^\s'"`]+\.md)/i,
  /(\/Users\/[^\s'"`]+\.md)/,
]

// Phase 04 review WR-03: YAML-safe scalar formatter for frontmatter values.
// Kept as a local copy of the helper in chat-writeback.ts (matches the
// existing per-file duplication pattern noted by IN-01; a shared lift to
// lib/skills/stream-json.ts or similar can fold these together later).
function yamlScalar(value: string): string {
  const needsQuoting =
    value.length === 0 ||
    /:\s|:$/.test(value) ||
    /[\n\r\t]/.test(value) ||
    /^[-?:[\]{},#&*!|>'"%@`]/.test(value) ||
    /^\s|\s$/.test(value)
  if (!needsQuoting) return value
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  return `"${escaped}"`
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

function newReceiptId(): string {
  return `rcpt_${Math.random().toString(36).slice(2, 12)}`
}

interface RunCaptureOptions {
  claudeBin?: string
  /** Raw text the operator typed in the capture box. */
  text: string
  /** Human-readable label for the project (auto-prepended to the prompt). */
  projectLabel: string
  /** Required so the wiki-aware branch and receipts can route correctly. */
  clientSlug: string
  /** Required so the wiki-aware branch and receipts can route correctly. */
  projectSlug: string
  args?: string[]
  timeoutMs?: number
  onStdout?: (chunk: string) => void
  /**
   * Phase 04 review WR-05: abort signal from the SSE route. When the client
   * disconnects, the route forwards req.signal here so we can SIGTERM the
   * in-flight subprocess instead of letting it run to completion (and burn
   * MCP quota) after the operator is gone.
   */
  signal?: AbortSignal
}

export async function runCapture(opts: RunCaptureOptions): Promise<CaptureRunResult> {
  // ---------- HUB-05: wiki-aware branch ----------
  //
  // When the Project has a wiki in its docs_paths, write directly into
  // `{wiki}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` via writeRawDrop and skip
  // the /capture subprocess entirely. The brief indexer picks the new file
  // up on its next rebuild and the receipt-feed dock surfaces the path link.
  const wikiPath = await resolveProjectWikiPath(opts.clientSlug, opts.projectSlug)
  // Phase 04 review WR-04: track whether we entered the wiki branch and bailed
  // so the subprocess fallback's receipt can flag the operator that the wiki
  // write failed. Without this, the operator sees a normal-looking subprocess
  // receipt pointing at the global inbox with no indication that their capture
  // missed the project's wiki.
  let wikiFallbackError: string | null = null
  if (wikiPath) {
    try {
      const slug = slugify(opts.text)
      const body = [
        '---',
        `project: ${yamlScalar(opts.projectLabel)}`,
        `captured_at: ${new Date().toISOString()}`,
        `source: aios-ui capture-box`,
        '---',
        '',
        opts.text,
        '',
      ].join('\n')

      // Phase 07 — Layer 1 classifier gate: classify before writing to raw/aios/.
      const parsed = matter(body)
      const classification = classifyContent({
        frontmatter: parsed.data as Record<string, unknown>,
        body: parsed.content,
        source: 'capture-box',
        routeContext: { clientSlug: opts.clientSlug, projectSlug: opts.projectSlug },
      })
      if (classification.classification === 'operational') {
        console.log('[capture] classified as operational; not staging to wiki', classification.reason)
        return {
          status: 'success',
          output: 'Classified as operational content (not staged to wiki)',
          exitCode: 0,
          durationMs: 0,
        }
      }

      const { filePath, excerpt } = await writeRawDrop({
        wikiPath,
        kind: 'capture',
        slug,
        body,
      })
      await appendReceipt({
        id: newReceiptId(),
        ts: new Date().toISOString(),
        kind: 'capture',
        project_slug: opts.projectSlug,
        file_written: filePath,
        excerpt,
        actor: 'capture-box',
      })
      return {
        status: 'success',
        output: filePath,
        exitCode: 0,
        durationMs: 0,
        fileWritten: filePath,
      }
    } catch (err) {
      // Wiki write failed (EACCES, ENOTDIR, exhausted collision suffixes…).
      // Fall through to the subprocess branch so the capture is not lost.
      // Phase 04 review WR-04: record the cause so the subprocess fallback's
      // receipt can be tagged 'capture-box (wiki fallback)' instead of plain
      // 'capture-box' — gives the operator a visible signal that the wiki
      // intent failed even though the capture itself survived.
      wikiFallbackError = err instanceof Error ? err.message : String(err)
      console.warn('[capture] wiki-aware write failed, falling back to subprocess', err)
    }
  }

  // ---------- Subprocess branch (existing /capture skill) ----------
  const claudeBin = opts.claudeBin ?? 'claude'
  // The /capture skill reads the prompt as the thing to capture. Prefix the
  // project label so the skill can frontmatter the destination correctly.
  const prompt = `[Project: ${opts.projectLabel}]\n\n${opts.text}`

  const args = opts.args ?? [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    `/capture ${prompt}`,
  ]
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const start = Date.now()
  return new Promise<CaptureRunResult>(resolve => {
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

    // Phase 04 review WR-05: abort wiring. SIGTERM the child if the SSE
    // client disconnects mid-stream. Subprocess side-effects that have
    // already fired (raw-drop write, receipt append) survive — abort only
    // stops further work, it does not roll back what already happened.
    const onAbort = (): void => {
      if (settled) return
      settled = true
      try { child.kill('SIGTERM') } catch { /* already exited */ }
      clearTimeout(timer)
      resolve({
        status: 'failed',
        output: aggregatedText,
        exitCode: -1,
        durationMs: Date.now() - start,
        error: 'aborted by client',
      })
    }
    if (opts.signal) {
      if (opts.signal.aborted) {
        onAbort()
      } else {
        opts.signal.addEventListener('abort', onAbort, { once: true })
      }
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
        // HUB-06: try multi-regex extraction. If any regex matches, emit a
        // receipt with the parsed absolute path. If NONE match, suppress the
        // receipt (warn loudly) — the capture itself still succeeded.
        let fileWritten: string | null = null
        for (const re of PATH_REGEXES) {
          const m = aggregatedText.match(re)
          if (m?.[1]) {
            fileWritten = m[1]
            break
          }
        }
        const finalize = async (): Promise<void> => {
          if (fileWritten) {
            // Phase 04 review WR-04: when the subprocess branch executes
            // because the wiki branch failed (not because the project lacked
            // a wiki), tag the receipt so the operator can see the wiki
            // intent did not land. The path link still points at the
            // subprocess output, so no work is lost.
            const actor = wikiFallbackError
              ? 'capture-box (wiki fallback)'
              : 'capture-box'
            const excerpt = wikiFallbackError
              ? `[wiki write failed: ${wikiFallbackError.slice(0, 80)}] ${opts.text.slice(0, 160)}`
              : opts.text.slice(0, 240)
            await appendReceipt({
              id: newReceiptId(),
              ts: new Date().toISOString(),
              kind: 'capture',
              project_slug: opts.projectSlug,
              file_written: fileWritten,
              excerpt,
              actor,
            })
          } else {
            console.warn(
              '[capture] subprocess succeeded but no path parseable from stdout; receipt suppressed to honor HUB-06',
            )
          }
        }
        // appendReceipt is async; we must await it before resolving so callers
        // (and tests) observe the receipt on disk by the time runCapture returns.
        finalize().then(() => {
          resolve({
            status: 'success',
            output: aggregatedText,
            exitCode: 0,
            durationMs,
            fileWritten: fileWritten ?? undefined,
          })
        }, err => {
          // Receipt write itself failed — degrade gracefully. The capture
          // subprocess succeeded, so return success but no fileWritten.
          console.warn('[capture] receipt write failed; returning success without fileWritten', err)
          resolve({
            status: 'success',
            output: aggregatedText,
            exitCode: 0,
            durationMs,
          })
        })
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
