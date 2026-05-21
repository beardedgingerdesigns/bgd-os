import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import { POST } from '@/app/api/triage/override/[threadId]/route'
import { readOverrides } from '@/lib/cache/triage-overrides'
import { readRecentReceipts } from '@/lib/cache/receipts'

function asParams(threadId: string): { params: Promise<{ threadId: string }> } {
  return { params: Promise.resolve({ threadId }) }
}

describe('POST /api/triage/override/[threadId]', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-triage-override-route-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('happy path: status=replied writes to file and emits one receipt', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'replied', project_slug: 'wild-rose' }),
    })
    const res = await POST(req, asParams('abc123'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    const overrides = await readOverrides()
    expect(overrides.abc123).toBeDefined()
    expect(overrides.abc123.status).toBe('replied')
    expect(typeof overrides.abc123.marked_at).toBe('string')

    const receipts = await readRecentReceipts()
    expect(receipts).toHaveLength(1)
    expect(receipts[0].kind).toBe('triage_override')
    expect(receipts[0].project_slug).toBe('wild-rose')
    expect(receipts[0].excerpt).toBe('replied for thread abc123')
  })

  it('happy path: status=snoozed with snooze_until persists the snooze_until', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'snoozed',
        snooze_until: '2026-05-23T12:00:00Z',
        project_slug: 'wild-rose',
      }),
    })
    const res = await POST(req, asParams('abc123'))
    expect(res.status).toBe(200)

    const overrides = await readOverrides()
    expect(overrides.abc123.status).toBe('snoozed')
    expect(overrides.abc123.snooze_until).toBe('2026-05-23T12:00:00Z')
  })

  it('rejects status=snoozed without snooze_until', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'snoozed' }),
    })
    const res = await POST(req, asParams('abc123'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('snooze_until')
  })

  it('rejects invalid status', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'bogus' }),
    })
    const res = await POST(req, asParams('abc123'))
    expect(res.status).toBe(400)
  })

  it('rejects non-JSON body', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req, asParams('abc123'))
    expect(res.status).toBe(400)
  })

  it('accepts not_me and dismissed statuses', async () => {
    const req1 = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'not_me' }),
    })
    expect((await POST(req1, asParams('abc123'))).status).toBe(200)

    const req2 = new Request('http://test/api/triage/override/abc456', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' }),
    })
    expect((await POST(req2, asParams('abc456'))).status).toBe(200)
  })

  it('empty project_slug defaults to empty string in receipt', async () => {
    const req = new Request('http://test/api/triage/override/abc123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'replied' }),
    })
    expect((await POST(req, asParams('abc123'))).status).toBe(200)
    const receipts = await readRecentReceipts()
    expect(receipts[0].project_slug).toBe('')
  })
})
