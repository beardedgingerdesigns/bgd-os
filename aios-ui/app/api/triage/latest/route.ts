import { readTriageCache } from '@/lib/cache/triage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const cache = await readTriageCache()
  return Response.json(cache)
}
