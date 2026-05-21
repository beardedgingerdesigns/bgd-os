import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import {
  appendReceipt,
  readRecentReceipts,
  receiptsPath,
} from '@/lib/cache/receipts'
import { invalidationBus } from '@/lib/invalidation-bus'
import type { Receipt } from '@/lib/types'

function makeReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: `rcpt_${Math.random().toString(36).slice(2, 10)}`,
    ts: '2026-05-21T12:00:00Z',
    kind: 'capture',
    project_slug: 'test-project',
    file_written: '/tmp/example.md',
    excerpt: 'sample excerpt',
    actor: 'unit-test',
    ...overrides,
  }
}

describe('receipts cache', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-receipts-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('receiptsPath honors AIOS_CACHE_DIR', () => {
    expect(receiptsPath()).toBe(path.join(tmpDir, 'receipts.jsonl'))
  })

  it('readRecentReceipts returns [] when the file does not exist', async () => {
    expect(await readRecentReceipts()).toEqual([])
  })

  it('appendReceipt writes one JSON line ending in \\n', async () => {
    const r = makeReceipt({ id: 'rcpt_a' })
    await appendReceipt(r)
    const raw = await fs.readFile(receiptsPath(), 'utf-8')
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw.split('\n').filter(Boolean)).toHaveLength(1)
    expect(JSON.parse(raw.trim())).toEqual(r)
  })

  it('readRecentReceipts default limit is 20', async () => {
    for (let i = 0; i < 25; i++) {
      await appendReceipt(makeReceipt({ id: `rcpt_${i}`, ts: `2026-05-21T12:00:${String(i).padStart(2, '0')}Z` }))
    }
    const got = await readRecentReceipts()
    expect(got).toHaveLength(20)
  })

  it('readRecentReceipts(3) returns the 3 most-recent (last-appended) in newest-first order', async () => {
    for (let i = 0; i < 5; i++) {
      await appendReceipt(makeReceipt({ id: `rcpt_${i}` }))
    }
    const got = await readRecentReceipts(3)
    expect(got.map(r => r.id)).toEqual(['rcpt_4', 'rcpt_3', 'rcpt_2'])
  })

  it('readRecentReceipts skips malformed lines without throwing', async () => {
    await fs.mkdir(tmpDir, { recursive: true })
    const good1 = makeReceipt({ id: 'rcpt_good_1' })
    const good2 = makeReceipt({ id: 'rcpt_good_2' })
    const file =
      JSON.stringify(good1) + '\n' +
      'not-valid-json\n' +
      '{not closed\n' +
      JSON.stringify(good2) + '\n'
    await fs.writeFile(receiptsPath(), file, 'utf-8')
    const got = await readRecentReceipts()
    expect(got.map(r => r.id)).toEqual(['rcpt_good_2', 'rcpt_good_1'])
  })

  it('appendReceipt publishes a global invalidation message', async () => {
    const listener = vi.fn()
    const unsubscribe = invalidationBus.subscribe(listener)
    try {
      await appendReceipt(makeReceipt({ id: 'rcpt_pub', kind: 'capture' }))
      expect(listener).toHaveBeenCalledTimes(1)
      const msg = listener.mock.calls[0][0]
      expect(msg.scope).toEqual({ kind: 'global' })
      expect(msg.reason).toContain('receipt')
      expect(msg.reason).toContain('capture')
      expect(typeof msg.at).toBe('string')
    } finally {
      unsubscribe()
    }
  })

  it('appendReceipt creates the cache dir if missing', async () => {
    // Point at a nested dir that does not yet exist
    const nested = path.join(tmpDir, 'deeper', 'still-deeper')
    process.env.AIOS_CACHE_DIR = nested
    await appendReceipt(makeReceipt({ id: 'rcpt_nested' }))
    const stat = await fs.stat(path.join(nested, 'receipts.jsonl'))
    expect(stat.isFile()).toBe(true)
  })
})

describe('GET /api/receipts', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-receipts-route-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('returns 200 with { receipts: [] } when nothing has been written', async () => {
    const { GET } = await import('@/app/api/receipts/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ receipts: [] })
  })

  it('returns the last 20 receipts newest first', async () => {
    for (let i = 0; i < 25; i++) {
      await appendReceipt(makeReceipt({ id: `rcpt_${i}` }))
    }
    const { GET } = await import('@/app/api/receipts/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.receipts).toHaveLength(20)
    expect(body.receipts[0].id).toBe('rcpt_24')
    expect(body.receipts[19].id).toBe('rcpt_5')
  })
})
