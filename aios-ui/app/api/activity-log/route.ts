import { loadRecentActivity } from '@/lib/data/activity-log'

export const dynamic = 'force-dynamic'

export async function GET() {
  const entries = await loadRecentActivity()
  return Response.json({ entries })
}
