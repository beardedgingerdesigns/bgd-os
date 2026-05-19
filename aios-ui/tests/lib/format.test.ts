import { describe, it, expect } from 'vitest'
import { formatMRR, formatRelativeDate } from '@/lib/format'

describe('formatMRR', () => {
  it('formats whole-dollar amounts with /mo suffix', () => {
    expect(formatMRR(400)).toBe('$400/mo')
    expect(formatMRR(1000)).toBe('$1,000/mo')
    expect(formatMRR(4250)).toBe('$4,250/mo')
  })

  it('renders em-dash for undefined or zero', () => {
    expect(formatMRR(undefined)).toBe('—')
    expect(formatMRR(0)).toBe('—')
  })
})

describe('formatRelativeDate', () => {
  const anchor = new Date('2026-05-19T12:00:00Z')

  it('formats today / yesterday correctly', () => {
    expect(formatRelativeDate('2026-05-19', anchor)).toBe('today')
    expect(formatRelativeDate('2026-05-18', anchor)).toBe('yesterday')
  })

  it('formats within-week dates as "N days ago"', () => {
    expect(formatRelativeDate('2026-05-15', anchor)).toBe('4 days ago')
  })

  it('formats older dates as the ISO date', () => {
    expect(formatRelativeDate('2026-04-01', anchor)).toBe('2026-04-01')
  })
})
