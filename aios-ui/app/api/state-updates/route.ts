import { readStateUpdates } from '@/lib/cache/state-updates'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return Response.json(await readStateUpdates())
}
