import fs from 'fs/promises'
import path from 'path'
import type { TriageCacheEntry } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function triageCachePath(): string {
  return path.join(cacheDir(), 'triage-latest.json')
}

export async function readTriageCache(): Promise<TriageCacheEntry | null> {
  try {
    const raw = await fs.readFile(triageCachePath(), 'utf-8')
    return JSON.parse(raw) as TriageCacheEntry
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function writeTriageCache(entry: TriageCacheEntry): Promise<void> {
  await fs.mkdir(cacheDir(), { recursive: true })
  await fs.writeFile(triageCachePath(), JSON.stringify(entry, null, 2), 'utf-8')
}
