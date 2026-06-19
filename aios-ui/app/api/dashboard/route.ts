import fs from 'fs/promises'
import path from 'path'
import { loadClients } from '@/lib/data/clients'
import { computeTotalMRR } from '@/lib/data/mrr'
import { readTodosCache } from '@/lib/cache/todos'
import { loadStateCards, STATE_DIR, type ProjectStateCard } from '@/lib/data/state'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export interface DashboardData {
  totalMRR: number
  openTodos: number
  activeProjects: number
  threadsNeedingReply: number
  cards: ProjectStateCard[]
}

// Triage count comes from state/inbox-triage.md frontmatter (threads_needing_reply).
// File is optional — absent means nothing is queued, so default to 0.
async function readThreadsNeedingReply(): Promise<number> {
  const filePath = path.join(STATE_DIR, 'inbox-triage.md')
  let text: string
  try {
    text = await fs.readFile(filePath, 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return 0
    throw err
  }
  const match = text.match(/^threads_needing_reply:\s*(\d+)/m)
  return match ? parseInt(match[1], 10) : 0
}

export async function GET() {
  const [clients, todosCache, cards, threadsNeedingReply] = await Promise.all([
    loadClients(),
    readTodosCache(),
    loadStateCards(),
    readThreadsNeedingReply(),
  ])

  const openTodos = (todosCache?.todos ?? []).filter(t => t.status === 'open').length

  const activeProjects = clients.reduce(
    (sum, c) => sum + c.projects.filter(p => p.status === 'active').length,
    0,
  )

  const data: DashboardData = {
    totalMRR: computeTotalMRR(clients),
    openTodos,
    activeProjects,
    threadsNeedingReply,
    cards,
  }

  return Response.json(data)
}
