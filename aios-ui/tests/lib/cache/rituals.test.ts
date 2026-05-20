import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { readRitualCache, writeRitualCache } from '@/lib/cache/rituals'
import type { RitualCacheEntry } from '@/lib/types'

let tempDir: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-rituals-'))
  process.env.AIOS_CACHE_DIR = tempDir
})

afterEach(async () => {
  delete process.env.AIOS_CACHE_DIR
  await fs.rm(tempDir, { recursive: true, force: true })
})

describe('readRitualCache', () => {
  it('returns null when no cache file exists', async () => {
    const cache = await readRitualCache('level-up')
    expect(cache).toBeNull()
  })

  it('returns the entry after writeRitualCache', async () => {
    const entry: RitualCacheEntry = {
      ritual: 'level-up',
      ranAt: '2026-05-19T15:00:00.000Z',
      output: '## Found one\nLeverage thing.',
      exitCode: 0,
      durationMs: 12_345,
    }
    await writeRitualCache(entry)
    const read = await readRitualCache('level-up')
    expect(read).toEqual(entry)
  })

  it('writes separate files per ritual', async () => {
    const a: RitualCacheEntry = {
      ritual: 'level-up',
      ranAt: '2026-05-19T15:00:00.000Z',
      output: 'A',
      exitCode: 0,
      durationMs: 1,
    }
    const b: RitualCacheEntry = {
      ritual: 'audit',
      ranAt: '2026-05-19T16:00:00.000Z',
      output: 'B',
      exitCode: 0,
      durationMs: 2,
    }
    await writeRitualCache(a)
    await writeRitualCache(b)
    expect((await readRitualCache('level-up'))?.output).toBe('A')
    expect((await readRitualCache('audit'))?.output).toBe('B')
    expect(await readRitualCache('weekly-status')).toBeNull()
  })

  it('returns null when cache JSON is malformed', async () => {
    const dir = path.join(tempDir, 'rituals')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'level-up.json'), '{ not json', 'utf-8')
    const result = await readRitualCache('level-up')
    expect(result).toBeNull()
  })
})
