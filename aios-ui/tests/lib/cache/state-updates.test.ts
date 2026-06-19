import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import {
  readStateUpdates,
  writeStateUpdates,
  addProposal,
  removeProposal,
  dismissProposal,
  stateUpdatesPath,
} from '@/lib/cache/state-updates'
import type { StateUpdateProposal } from '@/lib/types'

function makeProposal(over: Partial<StateUpdateProposal> = {}): StateUpdateProposal {
  return {
    id: 'su-abc12345',
    slug: 'wild-rose',
    field: 'current_status',
    current: 'Launch window mid/late June',
    proposed: 'Launch slipped to mid-July',
    evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
    confidence: 'high',
    stateUpdatedAt: '2026-06-09',
    dedupeKey: 'wild-rose:current_status:hash1',
    createdAt: '2026-06-19T13:45:00Z',
    ...over,
  }
}

describe('state-updates store', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-state-updates-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('returns an empty store when no file exists', async () => {
    expect(await readStateUpdates()).toEqual({ proposals: [], dismissed: [] })
  })

  it('stateUpdatesPath honors AIOS_CACHE_DIR', () => {
    expect(stateUpdatesPath()).toBe(path.join(tmpDir, 'pending-state-updates.json'))
  })

  it('addProposal appends and round-trips', async () => {
    const p = makeProposal()
    expect(await addProposal(p)).toBe(true)
    expect((await readStateUpdates()).proposals).toEqual([p])
  })

  it('addProposal skips a dedupeKey already pending', async () => {
    await addProposal(makeProposal())
    const added = await addProposal(makeProposal({ id: 'su-other' })) // same dedupeKey
    expect(added).toBe(false)
    expect((await readStateUpdates()).proposals).toHaveLength(1)
  })

  it('addProposal skips a dedupeKey already dismissed', async () => {
    await writeStateUpdates({ proposals: [], dismissed: ['wild-rose:current_status:hash1'] })
    expect(await addProposal(makeProposal())).toBe(false)
    expect((await readStateUpdates()).proposals).toHaveLength(0)
  })

  it('dismissProposal removes it and records the dedupeKey', async () => {
    await addProposal(makeProposal())
    const dismissed = await dismissProposal('su-abc12345')
    expect(dismissed?.id).toBe('su-abc12345')
    const store = await readStateUpdates()
    expect(store.proposals).toHaveLength(0)
    expect(store.dismissed).toContain('wild-rose:current_status:hash1')
  })

  it('removeProposal drops the matching id without touching dismissed', async () => {
    await addProposal(makeProposal())
    await addProposal(makeProposal({ id: 'su-2', dedupeKey: 'k2' }))
    const removed = await removeProposal('su-abc12345')
    expect(removed?.id).toBe('su-abc12345')
    const store = await readStateUpdates()
    expect(store.proposals.map(p => p.id)).toEqual(['su-2'])
    expect(store.dismissed).toEqual([])
  })
})
