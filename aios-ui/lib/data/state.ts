import fs from 'fs/promises'
import path from 'path'
import { CLAUDE_OS_ROOT } from '@/lib/paths'

export const STATE_DIR = path.join(CLAUDE_OS_ROOT, 'state')

// "blocked" sorts ahead of everything; the rest are treated as in-progress.
export type ProjectHealth = 'blocked' | 'active'

export interface ProjectStateCard {
  slug: string                  // filename without .md
  title: string                 // H1 title (with "Project State:" prefix stripped)
  updated: string | null        // ISO date from **Updated:**, null if unparseable
  status: string | null         // value from **Status:**
  health: ProjectHealth         // blocked (has blockers or status says so) vs active
  currentStatus: string         // body of the "## Current Status" section
  nextSteps: string[]           // checklist/bullet items under "## Next Steps"
  blockers: string[]            // bullet items under "## Blockers" ("None" → empty)
  stale: boolean                // updated date is >7 days before `now`
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function stripTitle(h1: string): string {
  return h1.replace(/^project state:\s*/i, '').trim()
}

// Pulls the text block under a `## <heading>` until the next `## ` or EOF.
function sectionBody(markdown: string, heading: string): string {
  const lines = markdown.split('\n')
  const out: string[] = []
  let inSection = false
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (inSection) break
      inSection = line.replace(/^##\s+/, '').trim().toLowerCase() === heading.toLowerCase()
      continue
    }
    if (inSection) out.push(line)
  }
  return out.join('\n').trim()
}

function parseBullets(block: string): string[] {
  return block
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^[-*]\s+/.test(l))
    .map(l => l.replace(/^[-*]\s+(\[[ xX]\]\s+)?/, '').trim())
    .filter(Boolean)
}

// A blocker line that opens with "None" is a non-blocker ("None.", "None
// blocking today's call. Outstanding: ...") — the qualifier after it is
// commentary, not an actual blocker. Drop those.
function isNoBlocker(line: string): boolean {
  return /^none\b/i.test(line.trim())
}

// A "Blockers" section that is empty or opens with "None" means no blockers.
function parseBlockers(block: string): string[] {
  if (!block) return []
  const bullets = parseBullets(block)
  const lines = bullets.length > 0
    ? bullets
    // Some files write blockers as bare lines rather than bullets.
    : block.split('\n').map(l => l.trim()).filter(Boolean)
  return lines.filter(l => !isNoBlocker(l))
}

function deriveHealth(status: string | null, blockers: string[]): ProjectHealth {
  if (blockers.length > 0) return 'blocked'
  if (status && /block/i.test(status)) return 'blocked'
  return 'active'
}

export function parseStateFile(slug: string, markdown: string, now: Date = new Date()): ProjectStateCard {
  const h1Match = markdown.match(/^#\s+(.+)$/m)
  const title = h1Match ? stripTitle(h1Match[1]) : slug

  const updatedMatch = markdown.match(/\*\*Updated:\*\*\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/)
  const updated = updatedMatch ? updatedMatch[1] : null

  const statusMatch = markdown.match(/\*\*Status:\*\*\s*([^\n|]+)/)
  const status = statusMatch ? statusMatch[1].trim() : null

  let stale = false
  if (updated) {
    const updatedMs = new Date(updated + 'T00:00:00Z').getTime()
    stale = now.getTime() - updatedMs > SEVEN_DAYS_MS
  }

  const blockers = parseBlockers(sectionBody(markdown, 'Blockers'))

  return {
    slug,
    title,
    updated,
    status,
    health: deriveHealth(status, blockers),
    currentStatus: sectionBody(markdown, 'Current Status'),
    nextSteps: parseBullets(sectionBody(markdown, 'Next Steps')),
    blockers,
    stale,
  }
}

export async function loadStateCards(now: Date = new Date()): Promise<ProjectStateCard[]> {
  let entries: string[]
  try {
    entries = await fs.readdir(STATE_DIR)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }

  const files = entries.filter(f => f.endsWith('.md'))
  const cards = await Promise.all(
    files.map(async file => {
      const slug = file.replace(/\.md$/, '')
      const text = await fs.readFile(path.join(STATE_DIR, file), 'utf-8')
      return parseStateFile(slug, text, now)
    }),
  )

  // Most recently updated first; nulls sink to the bottom.
  return cards.sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''))
}

// Projects view ordering: blocked projects first, then by recency (newest
// first), with undated cards sinking to the bottom of each group.
export async function loadProjectStateCards(now: Date = new Date()): Promise<ProjectStateCard[]> {
  const cards = await loadStateCards(now)
  return cards.sort((a, b) => {
    if (a.health !== b.health) return a.health === 'blocked' ? -1 : 1
    return (b.updated ?? '').localeCompare(a.updated ?? '')
  })
}
