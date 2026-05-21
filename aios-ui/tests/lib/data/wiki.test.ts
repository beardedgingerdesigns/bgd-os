import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import {
  detectWiki,
  readWikiLogEntries,
  readWikiDecisions,
  readPendingIngest,
} from '@/lib/data/wiki'

const FIXTURE_WIKI_ROOT = path.resolve(__dirname, '../../fixtures/external-wiki')

// Helper: create an isolated tmpdir wiki for a single test.
async function mkTmpWiki(prefix = 'wiki-test-'): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

// Helper: write a markdown file and force its mtime so ordering is deterministic.
async function writeMd(filePath: string, body: string, mtime?: Date): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, body, 'utf-8')
  if (mtime) {
    await fs.utimes(filePath, mtime, mtime)
  }
}

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

describe('readWikiDecisions', () => {
  let tmpWiki: string

  beforeEach(async () => {
    tmpWiki = await mkTmpWiki('readWikiDecisions-')
  })

  afterEach(async () => {
    await fs.rm(tmpWiki, { recursive: true, force: true })
  })

  it('returns empty buckets when decisions/ directory is missing', async () => {
    const result = await readWikiDecisions(tmpWiki)
    expect(result).toEqual({ active: [], deferred: [] })
  })

  it('returns empty buckets when active/ and deferred/ subdirs are missing', async () => {
    await fs.mkdir(path.join(tmpWiki, 'decisions'), { recursive: true })
    const result = await readWikiDecisions(tmpWiki)
    expect(result).toEqual({ active: [], deferred: [] })
  })

  it('reads active and deferred decisions and parses title from first H1', async () => {
    await writeMd(
      path.join(tmpWiki, 'decisions/active/001-use-postgres.md'),
      '# Use Postgres for primary store\n\nWe need transactional guarantees.\n'
    )
    await writeMd(
      path.join(tmpWiki, 'decisions/deferred/002-mq-choice.md'),
      '# Defer message queue choice\n\nDeferred until traffic justifies.\n'
    )

    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.length).toBe(1)
    expect(result.deferred.length).toBe(1)
    expect(result.active[0].slug).toBe('001-use-postgres')
    expect(result.active[0].title).toBe('Use Postgres for primary store')
    expect(result.active[0].firstParagraph).toBe('We need transactional guarantees.')
    expect(result.active[0].filePath).toBe(
      path.join(tmpWiki, 'decisions/active/001-use-postgres.md')
    )
    expect(result.active[0].modified).toBeInstanceOf(Date)
    expect(result.deferred[0].slug).toBe('002-mq-choice')
    expect(result.deferred[0].title).toBe('Defer message queue choice')
  })

  it('falls back to humanized slug as title when file has no H1', async () => {
    await writeMd(
      path.join(tmpWiki, 'decisions/active/no-header-decision.md'),
      'Just body content, no heading.\n'
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.length).toBe(1)
    expect(result.active[0].title).toBe('No Header Decision')
  })

  it('strips frontmatter before parsing title and paragraph', async () => {
    const body = [
      '---',
      'tags: [arch]',
      'status: active',
      '---',
      '# Decision with frontmatter',
      '',
      'Frontmatter-stripped paragraph.',
      '',
    ].join('\n')
    await writeMd(path.join(tmpWiki, 'decisions/active/fm.md'), body)
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active[0].title).toBe('Decision with frontmatter')
    expect(result.active[0].firstParagraph).toBe('Frontmatter-stripped paragraph.')
  })

  it('returns empty firstParagraph when only headers exist after H1', async () => {
    await writeMd(
      path.join(tmpWiki, 'decisions/active/headers-only.md'),
      '# Title\n\n## Subhead\n\n### Another\n'
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active[0].firstParagraph).toBe('')
  })

  it('joins multi-line paragraphs with spaces and caps at 300 chars', async () => {
    const longLine = 'a'.repeat(200)
    const otherLine = 'b'.repeat(200)
    await writeMd(
      path.join(tmpWiki, 'decisions/active/long.md'),
      `# Long\n\n${longLine}\n${otherLine}\n\nnext paragraph ignored\n`
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active[0].firstParagraph.length).toBe(300)
    // First 200 'a's, then exactly one space, then 'b's — proves single-space join.
    expect(result.active[0].firstParagraph.startsWith('a'.repeat(200) + ' b')).toBe(true)
    // And no double-space artifact.
    expect(result.active[0].firstParagraph).not.toMatch(/  /)
  })

  it('sorts entries by mtime descending', async () => {
    const older = new Date('2026-01-01T12:00:00Z')
    const newer = new Date('2026-05-01T12:00:00Z')
    await writeMd(
      path.join(tmpWiki, 'decisions/active/older.md'),
      '# Older decision\n\nbody\n',
      older
    )
    await writeMd(
      path.join(tmpWiki, 'decisions/active/newer.md'),
      '# Newer decision\n\nbody\n',
      newer
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.map(d => d.slug)).toEqual(['newer', 'older'])
  })

  it('caps each bucket at 20 entries', async () => {
    for (let i = 0; i < 25; i++) {
      const idx = String(i).padStart(2, '0')
      // Force distinct mtimes so order is stable.
      const mtime = new Date(2026, 0, 1, 0, 0, i)
      await writeMd(
        path.join(tmpWiki, `decisions/active/d-${idx}.md`),
        `# Decision ${idx}\n\nbody ${idx}\n`,
        mtime
      )
    }
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.length).toBe(20)
    // Newest 20 are kept (i=5..24); slug for the newest (i=24) is 'd-24'.
    expect(result.active[0].slug).toBe('d-24')
  })

  it('ignores decisions/implemented and decisions/superseded directories', async () => {
    await writeMd(
      path.join(tmpWiki, 'decisions/implemented/done.md'),
      '# Done decision\n\nbody\n'
    )
    await writeMd(
      path.join(tmpWiki, 'decisions/superseded/old.md'),
      '# Old decision\n\nbody\n'
    )
    await writeMd(
      path.join(tmpWiki, 'decisions/active/live.md'),
      '# Live decision\n\nbody\n'
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.length).toBe(1)
    expect(result.active[0].slug).toBe('live')
    expect(result.deferred.length).toBe(0)
  })

  it('ignores non-.md files in active/ and deferred/', async () => {
    await writeMd(
      path.join(tmpWiki, 'decisions/active/real.md'),
      '# Real\n\nbody\n'
    )
    await fs.mkdir(path.join(tmpWiki, 'decisions/active'), { recursive: true })
    await fs.writeFile(
      path.join(tmpWiki, 'decisions/active/notes.txt'),
      'not markdown',
      'utf-8'
    )
    const result = await readWikiDecisions(tmpWiki)
    expect(result.active.length).toBe(1)
    expect(result.active[0].slug).toBe('real')
  })
})

describe('readPendingIngest', () => {
  let tmpWiki: string

  beforeEach(async () => {
    tmpWiki = await mkTmpWiki('readPendingIngest-')
  })

  afterEach(async () => {
    await fs.rm(tmpWiki, { recursive: true, force: true })
  })

  it('returns empty result when raw/aios/ directory is missing', async () => {
    const result = await readPendingIngest(tmpWiki)
    expect(result).toEqual({ count: 0, files: [], lastIngestAt: null })
  })

  it('returns all raw/aios files as pending when log.md is missing', async () => {
    const earlier = new Date('2026-05-10T12:00:00Z')
    const later = new Date('2026-05-12T12:00:00Z')
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-10-foo.md'),
      '# foo\n',
      earlier
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-12-bar.md'),
      '# bar\n',
      later
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.count).toBe(2)
    expect(result.lastIngestAt).toBeNull()
    // Sorted by mtime DESC.
    expect(result.files.map(f => f.filename)).toEqual([
      'capture-2026-05-12-bar.md',
      'capture-2026-05-10-foo.md',
    ])
  })

  it('returns all raw/aios files as pending when log.md has no ingest headers', async () => {
    await writeMd(
      path.join(tmpWiki, 'log.md'),
      '# Log\n\n## [2026-05-15] schema | bootstrap\n\nsomething else\n'
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-10-foo.md'),
      '# foo\n',
      new Date('2026-05-10T12:00:00Z')
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.count).toBe(1)
    expect(result.lastIngestAt).toBeNull()
  })

  it('marks only files newer than last ingest header as pending', async () => {
    // Last ingest = 2026-05-15. End-of-day = 2026-05-15T23:59:59Z.
    await writeMd(
      path.join(tmpWiki, 'log.md'),
      '# Log\n\n## [2026-05-15] ingest | wiki ingest pass\n\nsummary\n'
    )
    const before = new Date('2026-05-14T12:00:00Z')
    const afterDay = new Date('2026-05-20T12:00:00Z')
    const afterDay2 = new Date('2026-05-21T08:00:00Z')
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-14-foo.md'),
      '# foo\n',
      before
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-20-bar.md'),
      '# bar\n',
      afterDay
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/chat-decision-2026-05-21-baz.md'),
      '# baz\n',
      afterDay2
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.count).toBe(2)
    expect(result.files.map(f => f.filename)).toEqual([
      'chat-decision-2026-05-21-baz.md',
      'capture-2026-05-20-bar.md',
    ])
    expect(result.lastIngestAt).not.toBeNull()
    expect(result.lastIngestAt!.toISOString().startsWith('2026-05-15')).toBe(true)
  })

  it('picks the most recent ingest header when log.md has multiple', async () => {
    await writeMd(
      path.join(tmpWiki, 'log.md'),
      [
        '# Log',
        '',
        '## [2026-05-01] ingest | first',
        'body',
        '',
        '## [2026-05-15] ingest | second',
        'body',
        '',
        '## [2026-05-10] ingest | out-of-order',
        'body',
        '',
      ].join('\n')
    )
    // File between 5/10 and 5/15 — should be pre-ingest.
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-12-foo.md'),
      '# foo\n',
      new Date('2026-05-12T12:00:00Z')
    )
    // File after 5/15 — should be pending.
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-20-bar.md'),
      '# bar\n',
      new Date('2026-05-20T12:00:00Z')
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.count).toBe(1)
    expect(result.files[0].filename).toBe('capture-2026-05-20-bar.md')
    expect(result.lastIngestAt!.toISOString().startsWith('2026-05-15')).toBe(true)
  })

  it('tolerates bare-date and em/en-dash ingest headers', async () => {
    await writeMd(
      path.join(tmpWiki, 'log.md'),
      [
        '# Log',
        '',
        '## 2026-05-01 — ingest first',     // bare date, em-dash
        'body',
        '',
        '## 2026-05-10 - ingest with hyphen',
        'body',
        '',
        '## [2026-05-15] | ingest pipe-separated',
        'body',
        '',
      ].join('\n')
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-20-bar.md'),
      '# bar\n',
      new Date('2026-05-20T12:00:00Z')
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.lastIngestAt).not.toBeNull()
    expect(result.lastIngestAt!.toISOString().startsWith('2026-05-15')).toBe(true)
    expect(result.count).toBe(1)
  })

  it('classifies file kinds by filename prefix', async () => {
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-foo.md'),
      '#\n',
      new Date('2026-05-20T12:00:00Z')
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/chat-decision-foo.md'),
      '#\n',
      new Date('2026-05-20T12:00:01Z')
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/chat-session-foo.md'),
      '#\n',
      new Date('2026-05-20T12:00:02Z')
    )
    await writeMd(
      path.join(tmpWiki, 'raw/aios/something-else-foo.md'),
      '#\n',
      new Date('2026-05-20T12:00:03Z')
    )
    const result = await readPendingIngest(tmpWiki)
    const byName = Object.fromEntries(result.files.map(f => [f.filename, f.kind]))
    expect(byName['capture-foo.md']).toBe('capture')
    expect(byName['chat-decision-foo.md']).toBe('chat-decision')
    expect(byName['chat-session-foo.md']).toBe('chat-session')
    expect(byName['something-else-foo.md']).toBe('other')
  })

  it('ignores non-.md files in raw/aios/', async () => {
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-2026-05-20-foo.md'),
      '# foo\n',
      new Date('2026-05-20T12:00:00Z')
    )
    await fs.writeFile(
      path.join(tmpWiki, 'raw/aios/notes.txt'),
      'not markdown',
      'utf-8'
    )
    await fs.writeFile(
      path.join(tmpWiki, 'raw/aios/.DS_Store'),
      '',
      'utf-8'
    )
    const result = await readPendingIngest(tmpWiki)
    expect(result.count).toBe(1)
    expect(result.files[0].filename).toBe('capture-2026-05-20-foo.md')
  })

  it('returns absolute file paths', async () => {
    await writeMd(
      path.join(tmpWiki, 'raw/aios/capture-foo.md'),
      '# foo\n',
      new Date('2026-05-20T12:00:00Z')
    )
    const result = await readPendingIngest(tmpWiki)
    expect(path.isAbsolute(result.files[0].filePath)).toBe(true)
    expect(result.files[0].filePath).toBe(
      path.join(tmpWiki, 'raw/aios/capture-foo.md')
    )
  })
})
