import { describe, it, expect } from 'vitest'
import { loadMemoryForProject } from '@/lib/data/memory'

describe('memory loader', () => {
  it('returns memory files matching client + project slugs', async () => {
    const matches = await loadMemoryForProject('inside-out', 'inside-out-website')
    expect(matches.length).toBe(1)
    expect(matches[0].name).toBe('Inside Out — test fixture')
    expect(matches[0].client).toBe('inside-out')
    expect(matches[0].project).toBe('inside-out-website')
  })

  it('returns matches for a different project', async () => {
    const matches = await loadMemoryForProject('kirk-financial', 'wild-rose')
    expect(matches.length).toBe(1)
    expect(matches[0].name).toBe('other-test')
  })

  it('returns an empty array when no memory matches', async () => {
    const matches = await loadMemoryForProject('does-not-exist', 'nope')
    expect(matches).toEqual([])
  })

  it('captures file mtime as a Date', async () => {
    const matches = await loadMemoryForProject('inside-out', 'inside-out-website')
    expect(matches[0].mtime).toBeInstanceOf(Date)
  })
})
