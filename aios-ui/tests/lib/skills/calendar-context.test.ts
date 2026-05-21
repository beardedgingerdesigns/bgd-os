import { describe, it, expect } from 'vitest'
import path from 'path'

import { fetchCalendarContext } from '@/lib/skills/calendar-context'

const FAKE_CAL = path.resolve(__dirname, '../../fixtures/fake-claude-calendar.sh')

describe('fetchCalendarContext', () => {
  it('aggregates bullet-list text deltas from a successful subprocess', async () => {
    const out = await fetchCalendarContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      daysForward: 7,
      claudeBin: FAKE_CAL,
      timeoutMs: 10_000,
    })
    expect(out).toContain('Kickoff sync')
    expect(out).toContain('Walk-through')
    expect(out).not.toContain('stream_event')
    expect(out).not.toContain('hook_started')
  })

  it('degrades to empty string on non-zero subprocess exit', async () => {
    const out = await fetchCalendarContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      claudeBin: FAKE_CAL,
      timeoutMs: 10_000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ envOverride: { CALENDAR_FAKE_MODE: 'fail' } } as any),
    })
    expect(out).toBe('')
  })

  it('degrades to empty string when the subprocess exceeds timeoutMs', async () => {
    const start = Date.now()
    const out = await fetchCalendarContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      claudeBin: FAKE_CAL,
      timeoutMs: 200,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ envOverride: { CALENDAR_FAKE_MODE: 'slow' } } as any),
    })
    expect(out).toBe('')
    expect(Date.now() - start).toBeLessThan(2_000)
  })
})
