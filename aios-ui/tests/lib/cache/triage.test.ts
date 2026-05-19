import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import { readTriageCache, writeTriageCache, triageCachePath } from '@/lib/cache/triage'

describe('triage cache', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-triage-cache-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('returns null when no cache exists', async () => {
    const result = await readTriageCache()
    expect(result).toBeNull()
  })

  it('round-trips a cache entry', async () => {
    const entry = {
      ranAt: '2026-05-19T08:00:00Z',
      output: '# Inbox Triage\n\nSample queue.',
      exitCode: 0,
      durationMs: 12345,
    }
    await writeTriageCache(entry)
    const got = await readTriageCache()
    expect(got).toEqual(entry)
  })

  it('triageCachePath honors AIOS_CACHE_DIR', () => {
    expect(triageCachePath()).toBe(path.join(tmpDir, 'triage-latest.json'))
  })
})
