import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

import { buildProjectBrief } from '@/lib/skills/chat-brief'
import { CLAUDE_OS_ROOT } from '@/lib/paths'

const DEFAULT_TIMEOUT_MS = 60_000  // ADR 0005 — /load-project should finish in 5-15s; 60s is safety margin

interface BuildBriefOptions {
  claudeBin?: string                                   // path to claude CLI (default: 'claude')
  claudeArgs?: string[]                                // extra args appended after the /load-project slash command (used by tests)
  timeoutMs?: number                                   // hard timeout; default 60s
}

export type BuildBriefStatus = 'success' | 'fallback'

export interface BuildBriefResult {
  status: BuildBriefStatus
  filePath: string
  builtAt: string
  durationMs: number
  error?: string                                       // populated when status === 'fallback'
}

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

/**
 * Phase 04 review CR-02 / WR-08: defense-in-depth path guard. Resolve the
 * caller's target path and verify it stays inside the briefs/ subtree under
 * cacheDir(). Throws if a malicious slug (containing `..`, NULs, or absolute
 * path fragments) ever escapes Next.js's segment normalization. The route
 * handlers also validate slugs via getProject(), but this is the last line
 * of defense before fs.writeFile().
 */
export function briefPathFor(clientSlug: string, projectSlug: string): string {
  const briefsRoot = path.resolve(path.join(cacheDir(), 'briefs'))
  const target = path.resolve(briefsRoot, `${clientSlug}__${projectSlug}.md`)
  if (target !== briefsRoot && !target.startsWith(briefsRoot + path.sep)) {
    throw new Error(`brief path escaped briefs root: ${target}`)
  }
  // Also guard against the slug pair resolving to the briefs dir itself
  // (e.g. both slugs empty) — we need a regular file, not the directory.
  if (target === briefsRoot) {
    throw new Error('brief path resolved to briefs root directory')
  }
  return target
}

// Pull text out of one line of `claude --print --output-format stream-json`.
// Matches the parser shape used in lib/skills/daily-ingest.ts + lib/skills/chat.ts —
// kept inline (small) instead of factored out to avoid a cross-file dependency
// during the indexer scaffold. If a third caller appears, lift to lib/skills/stream-json.ts.
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

interface SubprocessOutcome {
  ok: boolean
  text: string
  error?: string
}

function runLoadProjectSubprocess(
  claudeBin: string,
  projectSlug: string,
  extraArgs: string[],
  timeoutMs: number,
): Promise<SubprocessOutcome> {
  // Slash command first, extra test/debug args appended after — claude treats
  // them as additional positional args which the test fixture parses for
  // --fail / --slow modes.
  const args = [
    '--print',
    '--permission-mode', 'bypassPermissions',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    `/load-project ${projectSlug}`,
    ...extraArgs,
  ]
  return new Promise<SubprocessOutcome>(resolve => {
    let lineBuffer = ''
    let aggregatedText = ''
    let stderr = ''
    let settled = false

    const processLine = (line: string) => {
      const delta = extractTextDelta(line)
      if (delta !== null) aggregatedText += delta
    }

    const child = spawn(claudeBin, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.env.CLAUDE_OS_ROOT ?? CLAUDE_OS_ROOT,
    })

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({ ok: false, text: aggregatedText, error: `subprocess timeout after ${timeoutMs}ms` })
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
      resolve({ ok: false, text: aggregatedText, error: err.message })
    })

    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (lineBuffer.trim()) processLine(lineBuffer)
      if (code === 0) {
        resolve({ ok: true, text: aggregatedText })
      } else {
        resolve({
          ok: false,
          text: aggregatedText,
          error: stderr.trim() || `exit ${code}`,
        })
      }
    })
  })
}

/**
 * Build a project's hydration brief (ADR 0005).
 *
 * Primary path: spawn `claude --print '/load-project <slug>'`, aggregate text
 * deltas from stream-json, and write the result to .aios-cache/briefs/<slug>.md.
 *
 * Fallback path: if the subprocess fails or times out, fall back to the
 * filesystem-only buildProjectBrief from lib/skills/chat-brief.ts and write
 * that to the same path. The brief is ALWAYS written (graceful degradation),
 * so chat hydration always has SOMETHING to read.
 *
 * Note: this function is intentionally lazy at first call. The watcher only
 * REBUILDS existing briefs; first-build is triggered by chat hydration in 04-07.
 */
export async function buildBriefFor(
  clientSlug: string,
  projectSlug: string,
  opts: BuildBriefOptions = {},
): Promise<BuildBriefResult> {
  const claudeBin = opts.claudeBin ?? 'claude'
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const filePath = briefPathFor(clientSlug, projectSlug)
  const start = Date.now()

  // Ensure briefs/ exists once up front so both branches can write.
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  const outcome = await runLoadProjectSubprocess(
    claudeBin,
    projectSlug,
    opts.claudeArgs ?? [],
    timeoutMs,
  )

  if (outcome.ok && outcome.text.length > 0) {
    await fs.writeFile(filePath, outcome.text, 'utf-8')
    return {
      status: 'success',
      filePath,
      builtAt: new Date().toISOString(),
      durationMs: Date.now() - start,
    }
  }

  // Fallback — log the cause then degrade to the filesystem brief.
  // eslint-disable-next-line no-console
  console.warn(
    `[indexer] /load-project subprocess failed for ${clientSlug}/${projectSlug}: ${outcome.error ?? 'unknown'} — falling back to buildProjectBrief`,
  )
  const fallbackText = await buildProjectBrief(clientSlug, projectSlug)
  await fs.writeFile(filePath, fallbackText, 'utf-8')
  return {
    status: 'fallback',
    filePath,
    builtAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    error: outcome.error ?? 'subprocess produced no output',
  }
}
