import { describe, it, expect } from 'vitest'
import { loadDecisions, decisionsMentioning, decisionsInLastNDays } from '@/lib/data/decisions'

describe('decisions log loader', () => {
  it('parses entries from the fixture decisions log', async () => {
    const entries = await loadDecisions()
    expect(entries.length).toBe(3)
    expect(entries[0].date).toBe('2026-05-18')
    expect(entries[0].title).toBe('Inside Out content wrap-up')
  })

  it('parses dates in descending order (most recent first)', async () => {
    const entries = await loadDecisions()
    const dates = entries.map(e => e.date)
    expect(dates).toEqual(['2026-05-18', '2026-05-10', '2026-04-01'])
  })

  it('filters by mention of a client or project name (case-insensitive substring)', async () => {
    const filtered = await decisionsMentioning({
      clientName: 'Inside Out Iowa',
      projectName: 'Website redesign',
      clientSlug: 'inside-out',
      projectSlug: 'inside-out-website',
    })
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toContain('Inside Out')
  })

  it('returns entries within the last N days of a given anchor date', async () => {
    const entries = await loadDecisions()
    const recent = decisionsInLastNDays(entries, 30, new Date('2026-05-19'))
    expect(recent.map(r => r.date)).toEqual(['2026-05-18', '2026-05-10'])
  })
})
