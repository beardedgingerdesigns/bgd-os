import { loadProjectStateCards, type ProjectStateCard } from '@/lib/data/state'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export interface StateData {
  cards: ProjectStateCard[]
}

export async function GET() {
  const cards = await loadProjectStateCards()
  const data: StateData = { cards }
  return Response.json(data)
}
