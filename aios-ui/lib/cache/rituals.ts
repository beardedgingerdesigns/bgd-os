import fs from 'fs/promises'
import path from 'path'
import type { RitualCacheEntry, RitualSlug } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

function ritualsDir(): string {
  return path.join(cacheDir(), 'rituals')
}

export function ritualCachePath(slug: RitualSlug): string {
  return path.join(ritualsDir(), `${slug}.json`)
}

export async function readRitualCache(slug: RitualSlug): Promise<RitualCacheEntry | null> {
  try {
    const raw = await fs.readFile(ritualCachePath(slug), 'utf-8')
    return JSON.parse(raw) as RitualCacheEntry
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    if (err instanceof SyntaxError) return null  // malformed cache → treat as missing
    throw err
  }
}

export async function writeRitualCache(entry: RitualCacheEntry): Promise<void> {
  await fs.mkdir(ritualsDir(), { recursive: true })
  await fs.writeFile(ritualCachePath(entry.ritual), JSON.stringify(entry, null, 2), 'utf-8')
}
