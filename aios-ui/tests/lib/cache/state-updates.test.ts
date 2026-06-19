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
  reconcileStateUpdates,
  markApplied,
  dedupeKeyFor,
  stateUpdatesPath,
} from '@/lib/cache/state-updates'
import type { StateUpdateProposal } from '@/lib/types'

// Build a state/inbox-triage.md-shaped string carrying a STATE_UPDATES_JSON envelope.
function envelopeMd(proposals: Array<Record<string, unknown>>): string {
  const json = JSON.stringify({ generated_at: '2026-06-19T16:00:00Z', proposals })
  return `# brief\n\n<!-- STATE_UPDATES_JSON_START -->\n\`\`\`json\n${json}\n\`\`\`\n<!-- STATE_UPDATES_JSON_END -->\n`
}

function rawProposal(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: 'wild-rose',
    field: 'current_status',
    current: '(not yet tracked)',
    proposed: 'Go-live moved July 1 to July 13',
    evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
    confidence: 'high',
    stateUpdatedAt: '2026-06-09',
    ...over,
  }
}

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

  describe('reconcileStateUpdates', () => {
    it('adds a new proposal from an envelope with derived id/createdAt/dedupeKey', async () => {
      const added = await reconcileStateUpdates(envelopeMd([rawProposal()]), '2026-06-19T16:30:00Z')
      expect(added).toBe(1)
      const [p] = (await readStateUpdates()).proposals
      expect(p.slug).toBe('wild-rose')
      expect(p.proposed).toBe('Go-live moved July 1 to July 13')
      expect(p.id).toMatch(/^su-[0-9a-f]{8}$/)
      expect(p.createdAt).toBe('2026-06-19T16:30:00Z')
      expect(p.dedupeKey).toBe(dedupeKeyFor('wild-rose', 'current_status', 'Go-live moved July 1 to July 13'))
    })

    it('is idempotent — reconciling the same markdown twice adds once', async () => {
      const md = envelopeMd([rawProposal()])
      expect(await reconcileStateUpdates(md, '2026-06-19T16:30:00Z')).toBe(1)
      expect(await reconcileStateUpdates(md, '2026-06-19T17:00:00Z')).toBe(0)
      expect((await readStateUpdates()).proposals).toHaveLength(1)
    })

    it('respects dismissed dedupeKeys', async () => {
      const key = dedupeKeyFor('wild-rose', 'current_status', 'Go-live moved July 1 to July 13')
      await writeStateUpdates({ proposals: [], dismissed: [key] })
      expect(await reconcileStateUpdates(envelopeMd([rawProposal()]), '2026-06-19T16:30:00Z')).toBe(0)
      expect((await readStateUpdates()).proposals).toHaveLength(0)
    })

    it('does not duplicate a proposal already pending', async () => {
      await reconcileStateUpdates(envelopeMd([rawProposal()]), '2026-06-19T16:30:00Z')
      // same proposed → same dedupeKey, even via a different id path
      const again = await reconcileStateUpdates(envelopeMd([rawProposal({ current: 'changed note' })]), '2026-06-19T17:00:00Z')
      expect(again).toBe(0)
      expect((await readStateUpdates()).proposals).toHaveLength(1)
    })

    it('writes once for a multi-proposal envelope (batch)', async () => {
      const added = await reconcileStateUpdates(
        envelopeMd([
          rawProposal({ slug: 'a', proposed: 'A live' }),
          rawProposal({ slug: 'b', proposed: 'B blocked' }),
        ]),
        '2026-06-19T16:30:00Z',
      )
      expect(added).toBe(2)
      expect((await readStateUpdates()).proposals.map(p => p.slug)).toEqual(['a', 'b'])
    })

    it('dedupes identical proposals within one envelope', async () => {
      const added = await reconcileStateUpdates(envelopeMd([rawProposal(), rawProposal()]), '2026-06-19T16:30:00Z')
      expect(added).toBe(1)
    })

    it('serializes concurrent reconciles without dropping a proposal', async () => {
      const [a, b] = await Promise.all([
        reconcileStateUpdates(envelopeMd([rawProposal({ slug: 'x', proposed: 'X' })]), '2026-06-19T16:30:00Z'),
        reconcileStateUpdates(envelopeMd([rawProposal({ slug: 'y', proposed: 'Y' })]), '2026-06-19T16:30:01Z'),
      ])
      expect(a + b).toBe(2)
      expect((await readStateUpdates()).proposals.map(p => p.slug).sort()).toEqual(['x', 'y'])
    })

    it('returns 0 and writes nothing when there is no envelope', async () => {
      expect(await reconcileStateUpdates('# brief with no envelope', '2026-06-19T16:30:00Z')).toBe(0)
      // store file should not have been created
      await expect(fs.access(stateUpdatesPath())).rejects.toThrow()
    })

    it('dedupeKeyFor is stable for identical proposed and differs otherwise', () => {
      expect(dedupeKeyFor('s', 'status', 'same')).toBe(dedupeKeyFor('s', 'status', 'same'))
      expect(dedupeKeyFor('s', 'status', 'a')).not.toBe(dedupeKeyFor('s', 'status', 'b'))
    })

    it('markApplied removes the proposal and records its dedupeKey in dismissed', async () => {
      await addProposal(makeProposal())
      const applied = await markApplied('su-abc12345')
      expect(applied?.id).toBe('su-abc12345')
      const store = await readStateUpdates()
      expect(store.proposals).toHaveLength(0)
      expect(store.dismissed).toContain('wild-rose:current_status:hash1')
    })

    it('after markApplied, re-reconciling the same envelope does not resurrect the proposal', async () => {
      const md = envelopeMd([rawProposal()])
      await reconcileStateUpdates(md, '2026-06-19T16:30:00Z')
      const { proposals } = await readStateUpdates()
      await markApplied(proposals[0].id)
      expect(await reconcileStateUpdates(md, '2026-06-19T17:00:00Z')).toBe(0)
      expect((await readStateUpdates()).proposals).toHaveLength(0)
    })
  })
})
