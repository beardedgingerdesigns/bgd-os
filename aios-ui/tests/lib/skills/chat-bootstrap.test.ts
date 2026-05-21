import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

// IMPORTANT: vi.mock hoists — module specifier matches what chat-bootstrap.ts
// imports, including the @ alias used everywhere in the codebase.
vi.mock('@/lib/indexer/build-brief', async () => {
  const actual = await vi.importActual<typeof import('@/lib/indexer/build-brief')>(
    '@/lib/indexer/build-brief',
  )
  return {
    ...actual,
    // buildBriefFor replaced per-test via dynamic mock below
    buildBriefFor: vi.fn(),
  }
})

vi.mock('@/lib/skills/gmail-context', () => ({
  fetchGmailContext: vi.fn(),
}))

vi.mock('@/lib/skills/calendar-context', () => ({
  fetchCalendarContext: vi.fn(),
}))

import {
  readBriefOrBuild,
  buildLiveContext,
  assembleSeedPrompt,
} from '@/lib/skills/chat-bootstrap'
import { briefPathFor, buildBriefFor } from '@/lib/indexer/build-brief'
import { fetchGmailContext } from '@/lib/skills/gmail-context'
import { fetchCalendarContext } from '@/lib/skills/calendar-context'

describe('readBriefOrBuild', () => {
  let tmpCache: string
  const prevCacheDir = process.env.AIOS_CACHE_DIR

  beforeEach(async () => {
    tmpCache = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-bootstrap-cache-'))
    process.env.AIOS_CACHE_DIR = tmpCache
    vi.mocked(buildBriefFor).mockReset()
  })

  afterEach(async () => {
    if (prevCacheDir === undefined) delete process.env.AIOS_CACHE_DIR
    else process.env.AIOS_CACHE_DIR = prevCacheDir
    await fs.rm(tmpCache, { recursive: true, force: true })
  })

  it('cache hit: returns file contents + mtime with source=cache (no buildBriefFor call)', async () => {
    const filePath = briefPathFor('inside-out', 'inside-out-website')
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, '# Cached brief body', 'utf-8')

    const result = await readBriefOrBuild('inside-out', 'inside-out-website')

    expect(result.source).toBe('cache')
    expect(result.brief).toContain('# Cached brief body')
    expect(result.builtAt).toBeInstanceOf(Date)
    expect(vi.mocked(buildBriefFor)).not.toHaveBeenCalled()
  })

  it('cache miss: invokes buildBriefFor + returns source=lazy-build', async () => {
    const filePath = briefPathFor('inside-out', 'inside-out-website')
    vi.mocked(buildBriefFor).mockImplementation(async () => {
      // Mock writes the file the way the real one would.
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, '# Freshly built brief', 'utf-8')
      return {
        status: 'success' as const,
        filePath,
        builtAt: new Date().toISOString(),
        durationMs: 5,
      }
    })

    const result = await readBriefOrBuild('inside-out', 'inside-out-website')

    expect(result.source).toBe('lazy-build')
    expect(result.brief).toContain('# Freshly built brief')
    expect(vi.mocked(buildBriefFor)).toHaveBeenCalledWith('inside-out', 'inside-out-website')
  })

  it('cache miss + buildBriefFor degrades to fallback: returns source=fallback', async () => {
    const filePath = briefPathFor('inside-out', 'inside-out-website')
    vi.mocked(buildBriefFor).mockImplementation(async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, '# Fallback brief from JS', 'utf-8')
      return {
        status: 'fallback' as const,
        filePath,
        builtAt: new Date().toISOString(),
        durationMs: 12,
        error: 'simulated',
      }
    })

    const result = await readBriefOrBuild('inside-out', 'inside-out-website')

    expect(result.source).toBe('fallback')
    expect(result.brief).toContain('# Fallback brief from JS')
  })
})

describe('buildLiveContext', () => {
  beforeEach(() => {
    vi.mocked(fetchGmailContext).mockReset()
    vi.mocked(fetchCalendarContext).mockReset()
  })

  it('runs gmail + calendar fetchers in parallel and returns both', async () => {
    vi.mocked(fetchGmailContext).mockResolvedValue('| gmail-row |')
    vi.mocked(fetchCalendarContext).mockResolvedValue('- cal-event')

    const result = await buildLiveContext('inside-out', 'inside-out-website')

    expect(result.gmail).toBe('| gmail-row |')
    expect(result.calendar).toBe('- cal-event')
    expect(result.fetchedAt).toBeInstanceOf(Date)
  })

  it('one fetcher rejecting does not affect the other (independent degradation)', async () => {
    vi.mocked(fetchGmailContext).mockRejectedValue(new Error('boom'))
    vi.mocked(fetchCalendarContext).mockResolvedValue('- cal-event')

    const result = await buildLiveContext('inside-out', 'inside-out-website')

    expect(result.gmail).toBe('')
    expect(result.calendar).toBe('- cal-event')
  })
})

describe('assembleSeedPrompt', () => {
  it('returns markdown with all sections when fields are populated', () => {
    const out = assembleSeedPrompt({
      projectLabel: 'Inside Out — Website redesign',
      brief: '# B\n\nBody.',
      gmail: '| Thread | Subject |',
      calendar: '- Event A',
    })
    expect(out).toContain('Inside Out — Website redesign — context bundle')
    expect(out).toContain('## Project brief')
    expect(out).toContain('# B')
    expect(out).toContain('## Recent Gmail threads (last 7d)')
    expect(out).toContain('| Thread | Subject |')
    expect(out).toContain('## Upcoming calendar events (next 7d)')
    expect(out).toContain('- Event A')
    expect(out).toContain("I'm working on Inside Out — Website redesign.")
  })

  it('falls back to placeholder strings when gmail and calendar are empty', () => {
    const out = assembleSeedPrompt({
      projectLabel: 'X',
      brief: '# B',
      gmail: '',
      calendar: '',
    })
    expect(out).toContain('No recent Gmail threads.')
    expect(out).toContain('No upcoming events.')
  })

  it('falls back to "_No brief available._" when brief is empty', () => {
    const out = assembleSeedPrompt({
      projectLabel: 'X',
      brief: '   ',
      gmail: '',
      calendar: '',
    })
    expect(out).toContain('_No brief available._')
  })
})
