import { describe, it, expect } from 'vitest'
import { applyProposal } from '@/lib/data/state-merge'
import type { StateUpdateProposal } from '@/lib/types'

const BASE = `# Project State: Wild Rose Casino

**Updated:** 2026-06-09
**Status:** On track

## Current Status

Launch window mid/late June; banquet to follow.

## Next Steps

- Confirm launch date with Meghan
- Prep ticketing

## Blockers

None.
`

function proposal(over: Partial<StateUpdateProposal>): StateUpdateProposal {
  return {
    id: 'su-1',
    slug: 'wild-rose',
    field: 'status',
    current: '',
    proposed: '',
    evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
    confidence: 'high',
    stateUpdatedAt: '2026-06-09',
    dedupeKey: 'k',
    createdAt: '2026-06-19T13:45:00Z',
    ...over,
  }
}

const TODAY = '2026-06-19'

describe('applyProposal', () => {
  it('replaces Status and bumps Updated', () => {
    const r = applyProposal(BASE, proposal({ field: 'status', current: 'On track', proposed: 'At risk' }), TODAY)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).toContain('**Status:** At risk')
    expect(r.markdown).toContain('**Updated:** 2026-06-19')
    expect(r.markdown).not.toContain('2026-06-09')
  })

  it('prepends a dated, attributed line under Current Status and keeps existing text', () => {
    const r = applyProposal(
      BASE,
      proposal({ field: 'current_status', proposed: 'Launch slipped to mid-July' }),
      TODAY,
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).toContain('- 2026-06-19: Launch slipped to mid-July (via triage)')
    expect(r.markdown).toContain('Launch window mid/late June; banquet to follow.')
    // The new line sits inside Current Status, above the existing text.
    const lines = r.markdown.split('\n')
    const h = lines.findIndex(l => l.trim() === '## Current Status')
    const bulletIdx = lines.findIndex(l => l.includes('Launch slipped to mid-July'))
    const existingIdx = lines.findIndex(l => l.includes('Launch window mid/late June'))
    expect(bulletIdx).toBeGreaterThan(h)
    expect(bulletIdx).toBeLessThan(existingIdx)
  })

  it('replaces a matching Next Steps bullet', () => {
    const r = applyProposal(
      BASE,
      proposal({ field: 'next_step', current: 'Prep ticketing', proposed: 'Prep ticketing + parking' }),
      TODAY,
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).toContain('- Prep ticketing + parking')
    expect(r.markdown).not.toMatch(/- Prep ticketing\n/)
  })

  it('appends a new Next Steps bullet when none matches', () => {
    const r = applyProposal(
      BASE,
      proposal({ field: 'next_step', current: 'does-not-exist', proposed: 'Book photographer' }),
      TODAY,
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).toContain('- Book photographer')
    expect(r.markdown).toContain('- Confirm launch date with Meghan')
  })

  it('adds a Blocker bullet', () => {
    const r = applyProposal(
      BASE,
      proposal({ field: 'blocker', current: '', proposed: 'Domain transfer stuck' }),
      TODAY,
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).toContain('- Domain transfer stuck')
  })

  it('clears a Blocker bullet when proposed is empty', () => {
    const withBlocker = BASE.replace('None.', '- Domain transfer stuck')
    const r = applyProposal(
      withBlocker,
      proposal({ field: 'blocker', current: 'Domain transfer stuck', proposed: '' }),
      TODAY,
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.markdown).not.toContain('Domain transfer stuck')
  })

  it('refuses (stale) when the file Updated date moved since drafting', () => {
    const r = applyProposal(
      BASE,
      proposal({ field: 'status', proposed: 'At risk', stateUpdatedAt: '2026-06-01' }),
      TODAY,
    )
    expect(r).toEqual({ ok: false, reason: 'stale' })
  })

  it('returns field-not-found for a Status proposal on a file with no Status line', () => {
    const noStatus = BASE.replace('**Status:** On track\n', '')
    const r = applyProposal(noStatus, proposal({ field: 'status', proposed: 'At risk' }), TODAY)
    expect(r).toEqual({ ok: false, reason: 'field-not-found' })
  })
})
