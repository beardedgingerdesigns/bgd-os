import { loadPendingTodos } from '@/lib/data/pending-todos'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const todos = await loadPendingTodos()
  return Response.json({ todos })
}
