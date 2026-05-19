import { describe, it, expect } from 'vitest'
import path from 'path'
import { detectWiki, readWikiLogEntries } from '@/lib/data/wiki'

const FIXTURE_WIKI_ROOT = path.resolve(__dirname, '../../fixtures/external-wiki')

describe('wiki detector', () => {
  it('detects a wiki via wiki/WIKI-CLAUDE.md one level down', async () => {
    // docs_paths pointed at the parent of `wiki/` (e.g. .../docs/)
    const candidate = path.join(FIXTURE_WIKI_ROOT, 'docs')
    const info = await detectWiki(candidate)
    expect(info).not.toBeNull()
    expect(info!.hasWikiClaudeMd).toBe(true)
    expect(info!.rootPath).toBe(path.join(candidate, 'wiki'))
  })

  it('detects a wiki via WIKI-CLAUDE.md at the directory root', async () => {
    const candidate = path.join(FIXTURE_WIKI_ROOT, 'docs/wiki')
    const info = await detectWiki(candidate)
    expect(info).not.toBeNull()
    expect(info!.rootPath).toBe(candidate)
  })

  it('returns null when no wiki markers are present', async () => {
    const candidate = path.resolve(__dirname, '../../fixtures/claude-os/references')
    const info = await detectWiki(candidate)
    expect(info).toBeNull()
  })

  it('counts active and deferred decisions', async () => {
    const wikiRoot = path.join(FIXTURE_WIKI_ROOT, 'docs/wiki')
    const info = await detectWiki(wikiRoot)
    expect(info!.decisionsActive).toBe(1)
    expect(info!.decisionsDeferred).toBe(0)
  })
})

describe('wiki log entries', () => {
  it('returns log entries sorted by date descending', async () => {
    const wikiRoot = path.join(FIXTURE_WIKI_ROOT, 'docs/wiki')
    const entries = await readWikiLogEntries(wikiRoot, { limit: 10 })
    expect(entries.length).toBe(1)
    expect(entries[0].filename).toBe('2026-05-15-example-ingest.md')
    expect(entries[0].date).toBe('2026-05-15')
  })
})
