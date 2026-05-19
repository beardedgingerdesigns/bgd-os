import { loadDecisions, decisionsMentioning, decisionsInLastNDays } from '@/lib/data/decisions'
import { loadAllMemory, loadMemoryForProject } from '@/lib/data/memory'
import type { ActivityEntry, MemoryFile, DecisionEntry } from '@/lib/types'

export interface ComposeOptions {
  scope: 'global' | 'client' | 'project'
  clientSlug?: string
  clientName?: string
  projectSlug?: string
  projectName?: string
  days?: number
  anchorDate?: Date
}

export async function composeRecentActivity(opts: ComposeOptions): Promise<ActivityEntry[]> {
  const days = opts.days ?? 30
  const anchor = opts.anchorDate ?? new Date()

  let decisions: DecisionEntry[]
  if (opts.scope === 'global') {
    decisions = await loadDecisions()
  } else {
    decisions = await decisionsMentioning({
      clientName: opts.clientName,
      projectName: opts.projectName,
      clientSlug: opts.clientSlug,
      projectSlug: opts.projectSlug,
    })
  }
  decisions = decisionsInLastNDays(decisions, days, anchor)

  let memory: MemoryFile[]
  if (opts.scope === 'project' && opts.clientSlug && opts.projectSlug) {
    memory = await loadMemoryForProject(opts.clientSlug, opts.projectSlug)
  } else if (opts.scope === 'client' && opts.clientSlug) {
    memory = (await loadAllMemory()).filter(m => m.client === opts.clientSlug)
  } else {
    memory = await loadAllMemory()
  }

  // Apply the same time window to memory mtimes.
  const cutoff = new Date(anchor)
  cutoff.setDate(cutoff.getDate() - days)
  memory = memory.filter(m => m.mtime >= cutoff)

  // For scoped views, only include decisions that mention the scope in the title
  // (body-only mentions are too noisy for a targeted activity feed).
  const titleNeedles: string[] = []
  if (opts.scope !== 'global') {
    if (opts.clientName) titleNeedles.push(opts.clientName.toLowerCase())
    if (opts.clientSlug) titleNeedles.push(opts.clientSlug.toLowerCase())
    if (opts.projectName) titleNeedles.push(opts.projectName.toLowerCase())
    if (opts.projectSlug) titleNeedles.push(opts.projectSlug.toLowerCase())
  }

  const decisionEntries: ActivityEntry[] = decisions
    .filter(d => {
      if (titleNeedles.length === 0) return true
      const titleLower = d.title.toLowerCase()
      return titleNeedles.some(n => titleLower.includes(n))
    })
    .map(d => ({
      date: d.date,
      kind: 'decision' as const,
      title: d.title,
      source: 'decisions/log.md',
    }))

  const memoryEntries: ActivityEntry[] = memory.map(m => ({
    date: m.mtime.toISOString().slice(0, 10),
    kind: 'memory-update',
    title: m.name,
    description: m.description,
    source: 'memory',
  }))

  const all = [...decisionEntries, ...memoryEntries]
  all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return all
}
