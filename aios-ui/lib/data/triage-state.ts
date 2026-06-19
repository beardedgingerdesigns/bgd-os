import fs from 'fs/promises'
import path from 'path'
import { STATE_DIR } from '@/lib/paths'
import type { TriageCacheEntry } from '@/lib/types'

const TRIAGE_STATE_PATH = path.join(STATE_DIR, 'inbox-triage.md')

// state/inbox-triage.md is the single canonical triage artifact — written by
// both /daily-inbox-triage (in-app run) and /scheduled-triage (cowork run).
// Reading freshness from here keeps the Triage view in sync no matter which
// path produced it; the in-app run's JSON cache only ever saw its own runs.
//
// `last_run` frontmatter is authoritative for the timestamp; fall back to the
// file's mtime if it's missing or unparseable. The full markdown is returned
// as `output` — parseTriageBrief + extractTodosEnvelope already consume it.
export async function readTriageState(): Promise<TriageCacheEntry | null> {
  let md: string
  let mtime: Date
  try {
    md = await fs.readFile(TRIAGE_STATE_PATH, 'utf-8')
    mtime = (await fs.stat(TRIAGE_STATE_PATH)).mtime
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }

  let ranAt = mtime.toISOString()
  const lastRun = md.match(/^last_run:\s*(.+)$/m)?.[1].trim()
  if (lastRun) {
    const parsed = new Date(lastRun)
    if (!Number.isNaN(parsed.getTime())) ranAt = parsed.toISOString()
  }

  return { ranAt, output: md, exitCode: 0, durationMs: 0 }
}
