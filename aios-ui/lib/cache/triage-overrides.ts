// aios-ui/lib/cache/triage-overrides.ts
//
// Phase 04 — Plan 04 (HUB-04 / HUB-09): per-thread triage override persistence.
// The daily-inbox-triage skill MUST read this file before deciding whether
// Justin still "owes a reply" — see /Users/justinlobaito/repos/claude-os/
// .claude/skills/daily-inbox-triage/SKILL.md, Step 2.0.
//
// Atomic writes: read → mutate → write to <path>.tmp → rename to <path>.
// Rename is atomic on POSIX same-fs; sessions.ts cuts a corner here, but
// triage overrides are touched from a button-click path with no debounce, so
// a half-written JSON file would surface as a noticeable bug.

import fs from 'fs/promises'
import path from 'path'
import type { TriageOverride, TriageOverridesFile } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function overridesPath(): string {
  return path.join(cacheDir(), 'triage-overrides.json')
}

export async function readOverrides(): Promise<TriageOverridesFile> {
  try {
    const raw = await fs.readFile(overridesPath(), 'utf-8')
    return JSON.parse(raw) as TriageOverridesFile
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw err
  }
}

async function atomicWrite(file: TriageOverridesFile): Promise<void> {
  const dir = cacheDir()
  await fs.mkdir(dir, { recursive: true })
  const finalPath = overridesPath()
  const tmpPath = `${finalPath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(file, null, 2), 'utf-8')
  try {
    await fs.rename(tmpPath, finalPath)
  } catch (err) {
    // Best-effort cleanup: if rename failed, drop the half-written tmp so we
    // don't leave litter that confuses the next read.
    await fs.unlink(tmpPath).catch(() => {})
    throw err
  }
}

export async function writeOverride(
  threadId: string,
  override: TriageOverride,
): Promise<void> {
  const file = await readOverrides()
  file[threadId] = override
  await atomicWrite(file)
}

export async function deleteOverride(threadId: string): Promise<void> {
  const file = await readOverrides()
  if (!(threadId in file)) return
  delete file[threadId]
  await atomicWrite(file)
}
