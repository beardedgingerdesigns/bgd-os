import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import {
  readOverrides,
  writeOverride,
  deleteOverride,
  overridesPath,
} from '@/lib/cache/triage-overrides'

describe('triage overrides cache', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-triage-overrides-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('overridesPath honors AIOS_CACHE_DIR', () => {
    expect(overridesPath()).toBe(path.join(tmpDir, 'triage-overrides.json'))
  })

  it('readOverrides returns {} when the file does not exist', async () => {
    expect(await readOverrides()).toEqual({})
  })

  it('writeOverride creates the file with one entry; readOverrides returns it', async () => {
    await writeOverride('abc123', {
      status: 'replied',
      marked_at: '2026-05-21T12:00:00Z',
    })
    const got = await readOverrides()
    expect(got).toEqual({
      abc123: { status: 'replied', marked_at: '2026-05-21T12:00:00Z' },
    })
  })

  it('writeOverride twice with same id overwrites the entry', async () => {
    await writeOverride('abc123', {
      status: 'replied',
      marked_at: '2026-05-21T12:00:00Z',
    })
    await writeOverride('abc123', {
      status: 'snoozed',
      marked_at: '2026-05-21T13:00:00Z',
      snooze_until: '2026-05-23T13:00:00Z',
    })
    const got = await readOverrides()
    expect(got.abc123.status).toBe('snoozed')
    expect(got.abc123.snooze_until).toBe('2026-05-23T13:00:00Z')
  })

  it('writeOverride preserves other entries', async () => {
    await writeOverride('thread-a', { status: 'replied', marked_at: '2026-05-21T12:00:00Z' })
    await writeOverride('thread-b', { status: 'not_me', marked_at: '2026-05-21T12:01:00Z' })
    const got = await readOverrides()
    expect(Object.keys(got).sort()).toEqual(['thread-a', 'thread-b'])
    expect(got['thread-a'].status).toBe('replied')
    expect(got['thread-b'].status).toBe('not_me')
  })

  it('deleteOverride removes a key', async () => {
    await writeOverride('abc123', { status: 'replied', marked_at: '2026-05-21T12:00:00Z' })
    await deleteOverride('abc123')
    const got = await readOverrides()
    expect(got).toEqual({})
  })

  it('deleteOverride does not error when key is absent', async () => {
    await expect(deleteOverride('does-not-exist')).resolves.not.toThrow()
  })

  it('writeOverride leaves no .tmp file behind (atomic rename completed)', async () => {
    await writeOverride('abc123', { status: 'replied', marked_at: '2026-05-21T12:00:00Z' })
    const entries = await fs.readdir(tmpDir)
    expect(entries).toContain('triage-overrides.json')
    expect(entries.filter(e => e.endsWith('.tmp'))).toEqual([])
  })

  it('writeOverride creates the cache dir if missing', async () => {
    const nested = path.join(tmpDir, 'deeper', 'still-deeper')
    process.env.AIOS_CACHE_DIR = nested
    await writeOverride('xyz', { status: 'dismissed', marked_at: '2026-05-21T12:00:00Z' })
    const stat = await fs.stat(path.join(nested, 'triage-overrides.json'))
    expect(stat.isFile()).toBe(true)
  })
})
