import fs from 'fs/promises'
import path from 'path'
import type { WikiInfo, WikiLogEntry } from '@/lib/types'

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function countMdFiles(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir)
    return entries.filter(e => e.endsWith('.md')).length
  } catch {
    return 0
  }
}

/**
 * Mirrors /load-project Step 4a detection. A directory is a wiki root if:
 *  - It contains WIKI-CLAUDE.md directly, OR
 *  - It contains wiki/WIKI-CLAUDE.md one level down, OR
 *  - It contains both decisions/ and log/ as siblings.
 */
export async function detectWiki(candidateDir: string): Promise<WikiInfo | null> {
  // Case 1: WIKI-CLAUDE.md at the candidate root.
  if (await pathExists(path.join(candidateDir, 'WIKI-CLAUDE.md'))) {
    return buildInfo(candidateDir, true)
  }
  // Case 2: wiki/WIKI-CLAUDE.md one level down.
  const childWikiRoot = path.join(candidateDir, 'wiki')
  if (await pathExists(path.join(childWikiRoot, 'WIKI-CLAUDE.md'))) {
    return buildInfo(childWikiRoot, true)
  }
  // Case 3: structural markers — decisions/ + log/ siblings.
  if (
    (await pathExists(path.join(candidateDir, 'decisions'))) &&
    (await pathExists(path.join(candidateDir, 'log')))
  ) {
    return buildInfo(candidateDir, false)
  }
  return null
}

async function buildInfo(rootPath: string, hasWikiClaudeMd: boolean): Promise<WikiInfo> {
  const [decisionsActive, decisionsDeferred, recentLogEntries] = await Promise.all([
    countMdFiles(path.join(rootPath, 'decisions/active')),
    countMdFiles(path.join(rootPath, 'decisions/deferred')),
    readWikiLogEntries(rootPath, { limit: 10 }),
  ])
  return {
    rootPath,
    hasWikiClaudeMd,
    decisionsActive,
    decisionsDeferred,
    recentLogEntries,
  }
}

interface ReadOptions {
  limit?: number
}

const LOG_FILENAME_DATE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/
// Matches H2 headers like:  ## [2026-05-12] schema | wiki scaffold created
// Both `[YYYY-MM-DD]` (bracketed) and `YYYY-MM-DD` (bare) are accepted so the
// parser is forgiving across slight wiki conventions.
const LOG_H2_HEADER = /^##\s+\[?(\d{4}-\d{2}-\d{2})\]?\s*[-—]?\s*(.*)$/

export async function readWikiLogEntries(
  wikiRoot: string,
  options: ReadOptions = {}
): Promise<WikiLogEntry[]> {
  // Convention A — directory of dated files (`log/YYYY-MM-DD-slug.md`).
  const logDir = path.join(wikiRoot, 'log')
  try {
    const filenames = await fs.readdir(logDir)
    const entries: WikiLogEntry[] = filenames
      .filter(n => n.endsWith('.md'))
      .map(filename => {
        const match = filename.match(LOG_FILENAME_DATE)
        const date = match?.[1] ?? '0000-00-00'
        const slugFromFilename = match?.[2] ?? filename.replace(/\.md$/, '')
        return {
          filename,
          date,
          title: slugFromFilename.replace(/-/g, ' '),
          path: path.join(logDir, filename),
        }
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    const limit = options.limit ?? entries.length
    return entries.slice(0, limit)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    // Fall through only when the directory doesn't exist or isn't a dir; any
    // other read error should bubble.
    if (code !== 'ENOENT' && code !== 'ENOTDIR') throw err
  }

  // Convention B — single `log.md` with `## [YYYY-MM-DD] …` H2 headers.
  // Matches wild-rose-style wikis where the log is one append-only file
  // rather than one-file-per-entry.
  const logFile = path.join(wikiRoot, 'log.md')
  let body: string
  try {
    body = await fs.readFile(logFile, 'utf-8')
  } catch {
    return []
  }
  const collected: WikiLogEntry[] = []
  for (const line of body.split('\n')) {
    const m = line.match(LOG_H2_HEADER)
    if (!m) continue
    const date = m[1]
    const title = (m[2] ?? '').trim() || 'untitled'
    collected.push({
      filename: 'log.md',
      date,
      title,
      path: logFile,
    })
  }
  collected.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  const limit = options.limit ?? collected.length
  return collected.slice(0, limit)
}
