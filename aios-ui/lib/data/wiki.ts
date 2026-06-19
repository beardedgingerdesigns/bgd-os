import fs from 'fs/promises'
import path from 'path'
import type {
  DecisionSummary,
  DecisionsBuckets,
  PendingFile,
  PendingIngestResult,
  WikiInfo,
  WikiLogEntry,
} from '@/lib/types'
import { getProject } from '@/lib/data/clients'
import { resolveDocsPaths } from '@/lib/data/references'

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

// ---------- 04-02: readWikiDecisions ----------

const DECISION_BUCKET_CAP = 20

/**
 * Parse a decision markdown file body into (title, firstParagraph).
 *  - Title = first `# H1`; falls back to humanized slug.
 *  - firstParagraph = first non-empty, non-`#`-prefixed contiguous block
 *    after the H1, joined with single spaces, capped at 300 chars.
 *  - YAML frontmatter (`---\n…\n---\n`) is stripped before parsing.
 */
function parseDecisionBody(
  body: string,
  slug: string
): { title: string; firstParagraph: string } {
  let working = body
  if (working.startsWith('---\n')) {
    const end = working.indexOf('\n---\n', 4)
    if (end !== -1) working = working.slice(end + 5)
  }
  const lines = working.split('\n')
  let title = ''
  let foundH1 = false
  const paraBuffer: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!foundH1) {
      const m = trimmed.match(/^#\s+(.+)$/)
      if (m) {
        title = m[1].trim()
        foundH1 = true
      }
      continue
    }
    if (trimmed.startsWith('#')) continue                  // skip subsequent headers
    if (trimmed === '') {
      if (paraBuffer.length > 0) break                     // end of first paragraph
      continue
    }
    paraBuffer.push(trimmed)
  }
  const firstParagraph = paraBuffer.join(' ').slice(0, 300)
  if (!title) {
    title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return { title, firstParagraph }
}

async function readDecisionDir(dir: string): Promise<DecisionSummary[]> {
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return []
  }
  const mdNames = entries.filter(n => n.endsWith('.md'))
  const summaries = await Promise.all(
    mdNames.map(async filename => {
      const filePath = path.join(dir, filename)
      const [body, stat] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        fs.stat(filePath),
      ])
      const slug = filename.replace(/\.md$/, '')
      const { title, firstParagraph } = parseDecisionBody(body, slug)
      return { slug, title, firstParagraph, filePath, modified: stat.mtime }
    })
  )
  summaries.sort((a, b) => b.modified.getTime() - a.modified.getTime())
  return summaries.slice(0, DECISION_BUCKET_CAP)
}

/**
 * Reads `<wikiPath>/decisions/active/*.md` and `<wikiPath>/decisions/deferred/*.md`,
 * returning a DecisionSummary per file. Missing directories yield empty arrays.
 *
 * Each bucket is sorted by mtime DESC and capped at 20 entries.
 * Files under `decisions/implemented/` or `decisions/superseded/` are ignored.
 */
export async function readWikiDecisions(wikiPath: string): Promise<DecisionsBuckets> {
  const [active, deferred] = await Promise.all([
    readDecisionDir(path.join(wikiPath, 'decisions', 'active')),
    readDecisionDir(path.join(wikiPath, 'decisions', 'deferred')),
  ])
  return { active, deferred }
}

// ---------- 04-02: readPendingIngest ----------

/**
 * Matches log.md H2 headers that mark an ingest pass, e.g.:
 *   ## [2026-05-15] ingest | wiki ingest
 *   ## 2026-05-01 — ingest first        (em-dash)
 *   ## 2026-05-10 - ingest with hyphen
 *   ## [2026-05-15] | ingest pipe-separated
 *
 * Bracketed and bare dates both supported; hyphen, em-dash, en-dash, and
 * pipe separators are all tolerated before the word "ingest".
 */
const INGEST_LOG_HEADER = /^##\s+\[?(\d{4}-\d{2}-\d{2})\]?\s*[-—–|]?\s*ingest\b/i

async function parseLastIngestAt(wikiPath: string): Promise<Date | null> {
  const logFile = path.join(wikiPath, 'log.md')
  let body: string
  try {
    body = await fs.readFile(logFile, 'utf-8')
  } catch {
    return null
  }
  const dates: Date[] = []
  for (const line of body.split('\n')) {
    const m = line.match(INGEST_LOG_HEADER)
    if (m) {
      // End-of-day so files dated the SAME day as the ingest header are
      // treated as already-ingested. New captures land minutes later.
      const d = new Date(m[1] + 'T23:59:59Z')
      if (!isNaN(d.getTime())) dates.push(d)
    }
  }
  if (dates.length === 0) return null
  dates.sort((a, b) => b.getTime() - a.getTime())
  return dates[0]
}

function detectKind(filename: string): PendingFile['kind'] {
  if (filename.startsWith('capture-')) return 'capture'
  if (filename.startsWith('chat-decision-')) return 'chat-decision'
  if (filename.startsWith('chat-session-')) return 'chat-session'
  if (filename.startsWith('triage-dispatch-')) return 'triage-dispatch'
  return 'other'
}

/**
 * Lists `<wikiPath>/raw/aios/*.md` files whose mtime is newer than the
 * most recent `## [YYYY-MM-DD] ingest |` header in `<wikiPath>/log.md`.
 *
 * - If raw/aios/ is missing → { count: 0, files: [], lastIngestAt: null }.
 * - If log.md is missing or contains no ingest header → ALL raw/aios/*.md
 *   files are returned as pending and lastIngestAt is null.
 * - Files sorted by mtime DESC. Non-`.md` entries are ignored.
 * - kind is parsed from filename prefix (capture-, chat-decision-,
 *   chat-session-, triage-dispatch-, other).
 */
export async function readPendingIngest(
  wikiPath: string
): Promise<PendingIngestResult> {
  const rawAiosDir = path.join(wikiPath, 'raw', 'aios')
  let entries: string[]
  try {
    entries = await fs.readdir(rawAiosDir)
  } catch {
    return { count: 0, files: [], lastIngestAt: null }
  }
  const lastIngestAt = await parseLastIngestAt(wikiPath)
  const mdNames = entries.filter(n => n.endsWith('.md'))
  const files: PendingFile[] = []
  for (const filename of mdNames) {
    const filePath = path.join(rawAiosDir, filename)
    const stat = await fs.stat(filePath)
    if (lastIngestAt === null || stat.mtime.getTime() > lastIngestAt.getTime()) {
      files.push({
        filename,
        filePath,
        mtime: stat.mtime,
        kind: detectKind(filename),
      })
    }
  }
  files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
  return { count: files.length, files, lastIngestAt }
}

// ---------- 04-05: resolveProjectWikiPath ----------

/**
 * resolveProjectWikiPath: given a (clientSlug, projectSlug), look up the
 * Project's docs_paths and return the absolute rootPath of the first
 * docs_paths entry that detectWiki() recognizes as a wiki. Returns null when
 * the project is unknown, has no docs_paths, or none of its docs_paths point
 * at a wiki.
 *
 * Used by lib/skills/capture.ts to decide whether to write directly into
 * `{wiki}/raw/aios/` (HUB-05) or fall back to the /capture skill subprocess.
 */
export async function resolveProjectWikiPath(
  clientSlug: string,
  projectSlug: string,
): Promise<string | null> {
  const project = await getProject(clientSlug, projectSlug)
  if (!project) return null
  const docsPaths = resolveDocsPaths(project.docs_paths)
  for (const dp of docsPaths) {
    const wiki = await detectWiki(dp)
    if (wiki) return wiki.rootPath
  }
  return null
}
