import fs from 'fs/promises'
import { TODOS_ACTIVITY_PATH } from '@/lib/paths'
import type { DelegationActionType } from '@/lib/types'

export interface ActivityEntry {
  timestamp: string
  actionType: DelegationActionType | 'bounced'
  clientSlug: string
  summary: string
  artifactPath: string
}

const HEADER = `# Activity Log

Actions completed by Claude via the delegation queue. Newest first.

`

const ENTRY_REGEX = /^- \[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\] \*\*(.+?)\*\* \| (.+?) \| (.+?) → (.+)$/

function formatEntry(e: ActivityEntry): string {
  return `- [${e.timestamp}] **${e.actionType}** | ${e.clientSlug} | ${e.summary} → ${e.artifactPath}`
}

function formatTimestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export async function appendActivity(
  actionType: DelegationActionType | 'bounced',
  clientSlug: string,
  summary: string,
  artifactPath: string,
): Promise<void> {
  const entry = formatEntry({
    timestamp: formatTimestamp(),
    actionType,
    clientSlug,
    summary,
    artifactPath,
  })

  const existing = await fs.readFile(TODOS_ACTIVITY_PATH, 'utf-8').catch(err => {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  })

  if (!existing) {
    await fs.writeFile(TODOS_ACTIVITY_PATH, `${HEADER}${entry}\n`, 'utf-8')
    return
  }

  // Insert after header (first blank line after the preamble)
  const lines = existing.split('\n')
  const insertIdx = lines.findIndex((l, i) => i > 0 && l.trim() === '' && lines[i - 1]?.trim() !== '') + 1 || lines.length
  lines.splice(insertIdx, 0, entry)
  await fs.writeFile(TODOS_ACTIVITY_PATH, lines.join('\n'), 'utf-8')
}

export async function loadRecentActivity(limit = 20): Promise<ActivityEntry[]> {
  const text = await fs.readFile(TODOS_ACTIVITY_PATH, 'utf-8').catch(err => {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw err
  })
  if (!text) return []

  const entries: ActivityEntry[] = []
  for (const line of text.split('\n')) {
    const m = line.match(ENTRY_REGEX)
    if (m) {
      entries.push({
        timestamp: m[1],
        actionType: m[2] as DelegationActionType | 'bounced',
        clientSlug: m[3],
        summary: m[4],
        artifactPath: m[5],
      })
      if (entries.length >= limit) break
    }
  }
  return entries
}
