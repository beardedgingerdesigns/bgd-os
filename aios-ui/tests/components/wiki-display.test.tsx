import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import { WikiDisplay } from '@/components/wiki-display'

// Helper: create an isolated tmpdir wiki for a single test.
async function mkTmpWiki(prefix = 'wiki-display-test-'): Promise<string> {
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

// vitest config sets environment: 'node' (not jsdom) and aios-ui server
// components are async functions that return JSX. We render to a static HTML
// string and assert on substrings — this matches how the RSC tree gets
// flattened on first load and avoids pulling jsdom + RTL into the test
// environment for a single component.
async function renderWikiDisplay(wikiPath: string): Promise<string> {
  const tree = await WikiDisplay({ wikiPath })
  return renderToStaticMarkup(tree)
}

describe('WikiDisplay', () => {
  let tmpWiki: string

  beforeEach(async () => {
    tmpWiki = await mkTmpWiki()
  })

  afterEach(async () => {
    await fs.rm(tmpWiki, { recursive: true, force: true })
  })

  it('renders exactly three <details> sections', async () => {
    const html = await renderWikiDisplay(tmpWiki)
    const matches = html.match(/<details/g) ?? []
    expect(matches.length).toBe(3)
  })

  it('shows empty-state copy for each section when the wiki is bare', async () => {
    const html = await renderWikiDisplay(tmpWiki)
    expect(html).toContain('No active decisions in this wiki.')
    expect(html).toContain('No log entries.')
    expect(html).toContain('No deferred decisions.')
  })

  it('renders "Open wiki folder" link with vscode://file/{wikiPath}', async () => {
    const html = await renderWikiDisplay(tmpWiki)
    // The href is escaped — quotes get encoded; vscode://file/ + path itself
    // shouldn't be encoded.
    expect(html).toContain(`href="vscode://file/${tmpWiki}"`)
    expect(html).toContain('Open wiki folder')
  })

  it('renders active decisions with title, first paragraph, and editor link', async () => {
    const decisionPath = path.join(
      tmpWiki,
      'decisions',
      'active',
      '001-use-postgres.md',
    )
    await writeMd(
      decisionPath,
      '# Use Postgres\n\nWe chose Postgres because it offers strong consistency and our team already operates it.\n',
    )

    const html = await renderWikiDisplay(tmpWiki)
    expect(html).toContain('Use Postgres')
    expect(html).toContain('We chose Postgres because it offers strong consistency')
    expect(html).toContain(`href="vscode://file/${decisionPath}"`)
  })

  it('reflects accurate counts in section badges', async () => {
    // 2 active, 1 deferred
    await writeMd(
      path.join(tmpWiki, 'decisions', 'active', '001-a.md'),
      '# A\n\nfirst.\n',
    )
    await writeMd(
      path.join(tmpWiki, 'decisions', 'active', '002-b.md'),
      '# B\n\nsecond.\n',
    )
    await writeMd(
      path.join(tmpWiki, 'decisions', 'deferred', '003-c.md'),
      '# C\n\nthird.\n',
    )
    // 1 log entry
    await writeMd(
      path.join(tmpWiki, 'log', '2026-05-15-something.md'),
      '# Something happened\n',
    )

    const html = await renderWikiDisplay(tmpWiki)
    // Each badge sits inside its own section. We check the section's title
    // immediately precedes the badge text in the rendered HTML.
    // Slice on each section to keep the assertion local.
    const activeIdx = html.indexOf('Active decisions')
    const recentIdx = html.indexOf('Recent log entries')
    const deferredIdx = html.indexOf('Deferred decisions')
    expect(activeIdx).toBeGreaterThan(-1)
    expect(recentIdx).toBeGreaterThan(activeIdx)
    expect(deferredIdx).toBeGreaterThan(recentIdx)

    const activeChunk = html.slice(activeIdx, recentIdx)
    const recentChunk = html.slice(recentIdx, deferredIdx)
    const deferredChunk = html.slice(deferredIdx)

    expect(activeChunk).toMatch(/>\s*2\s*</)
    expect(recentChunk).toMatch(/>\s*1\s*</)
    expect(deferredChunk).toMatch(/>\s*1\s*</)
  })

  it('caps recent log entries at 5 and links each to vscode://file/{logPath}', async () => {
    // 7 log entries — only the 5 most recent should appear.
    for (let i = 1; i <= 7; i++) {
      const dateStr = `2026-05-${String(i + 10).padStart(2, '0')}`
      await writeMd(
        path.join(tmpWiki, 'log', `${dateStr}-entry-${i}.md`),
        `# entry ${i}\n`,
      )
    }
    const html = await renderWikiDisplay(tmpWiki)
    // Most recent dates surface; oldest two get dropped by the limit.
    expect(html).toContain('2026-05-17')
    expect(html).toContain('2026-05-13')
    expect(html).not.toContain('2026-05-11')
    expect(html).not.toContain('2026-05-12')

    // Each surfaced row links to its file via vscode://file/.
    expect(html).toContain(
      `href="vscode://file/${path.join(tmpWiki, 'log', '2026-05-17-entry-7.md')}"`,
    )
  })

  it('renders Active decisions and Recent log open by default; Deferred decisions closed', async () => {
    const html = await renderWikiDisplay(tmpWiki)
    // Count `open=""` attributes (React renders `open` as `open=""` in
    // renderToStaticMarkup). Exactly two of three <details> should have it.
    const openAttrs = html.match(/<details[^>]*open[^>]*>/g) ?? []
    expect(openAttrs.length).toBe(2)
  })
})
