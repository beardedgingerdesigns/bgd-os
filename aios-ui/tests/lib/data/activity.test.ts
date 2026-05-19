import { describe, it, expect } from 'vitest'
import { composeRecentActivity } from '@/lib/data/activity'

describe('recent-activity composer', () => {
  it('aggregates entries from decisions and memory sources, sorted descending', async () => {
    const activity = await composeRecentActivity({
      scope: 'global',
      days: 365,                        // wide window so fixture entries fit
      anchorDate: new Date('2026-05-19'),
    })
    expect(activity.length).toBeGreaterThan(0)
    const dates = activity.map(a => a.date)
    // Descending order
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1] >= dates[i]).toBe(true)
    }
  })

  it('scope=client only returns entries mentioning that client', async () => {
    const activity = await composeRecentActivity({
      scope: 'client',
      clientSlug: 'inside-out',
      clientName: 'Inside Out Iowa',
      days: 365,
      anchorDate: new Date('2026-05-19'),
    })
    expect(activity.every(a => a.title.toLowerCase().includes('inside out'))).toBe(true)
  })

  it('honors the days window', async () => {
    const activity = await composeRecentActivity({
      scope: 'global',
      days: 30,
      anchorDate: new Date('2026-05-19'),
    })
    // The 2026-04-01 fixture entry must be excluded by a 30-day window from 2026-05-19.
    expect(activity.find(a => a.date === '2026-04-01')).toBeUndefined()
  })
})
