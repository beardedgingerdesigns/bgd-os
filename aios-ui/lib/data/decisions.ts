import fs from 'fs/promises'
import { DECISIONS_LOG_PATH } from '@/lib/paths'
import type { DecisionEntry } from '@/lib/types'

const ENTRY_HEADER_REGEX = /^##\s+(\d{4}-\d{2}-\d{2})\s+[—-]\s+(.+?)\s*$/

export async function loadDecisions(): Promise<DecisionEntry[]> {
  const text = await fs.readFile(DECISIONS_LOG_PATH, 'utf-8').catch(err => {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw err
  })
  if (!text) return []

  const lines = text.split('\n')
  const entries: DecisionEntry[] = []
  let current: { date: string; title: string; bodyLines: string[] } | null = null

  for (const line of lines) {
    const match = line.match(ENTRY_HEADER_REGEX)
    if (match) {
      if (current) {
        entries.push(finalizeEntry(current))
      }
      current = { date: match[1], title: match[2], bodyLines: [] }
    } else if (current) {
      current.bodyLines.push(line)
    }
  }
  if (current) entries.push(finalizeEntry(current))

  // Sort descending by date (string sort works for YYYY-MM-DD).
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return entries
}

function finalizeEntry(c: { date: string; title: string; bodyLines: string[] }): DecisionEntry {
  const body = c.bodyLines.join('\n').trim()
  return {
    date: c.date,
    title: c.title,
    body,
    mentionedClients: [],   // populated by decisionsMentioning when filtering
    mentionedProjects: [],
  }
}

interface MentionQuery {
  clientName?: string
  projectName?: string
  clientSlug?: string
  projectSlug?: string
}

export async function decisionsMentioning(q: MentionQuery): Promise<DecisionEntry[]> {
  const entries = await loadDecisions()
  return entries.filter(entry => {
    const haystack = (entry.title + '\n' + entry.body).toLowerCase()
    const needles = [q.clientName, q.projectName, q.clientSlug, q.projectSlug]
      .filter((s): s is string => typeof s === 'string' && s.length > 0)
      .map(s => s.toLowerCase())
    return needles.some(n => haystack.includes(n))
  })
}

export function decisionsInLastNDays(
  entries: DecisionEntry[],
  days: number,
  anchor: Date = new Date()
): DecisionEntry[] {
  const cutoff = new Date(anchor)
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= cutoffIso)
}
