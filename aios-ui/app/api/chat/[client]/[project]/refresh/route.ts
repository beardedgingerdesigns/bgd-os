import { buildBriefFor } from '@/lib/indexer/build-brief'
import { deleteChatSession } from '@/lib/cache/sessions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * POST /api/chat/[client]/[project]/refresh
 *
 * Re-runs buildBriefFor so the next /load picks up a fresh brief, and
 * clears the active session so the drawer reopens in "load" mode (no --resume).
 *
 * Body: none.
 * Response: { ok: true, builtAt: ISO, status: 'success' | 'fallback' }
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params
  const result = await buildBriefFor(client, project)
  await deleteChatSession(client, project)
  return Response.json({ ok: true, builtAt: result.builtAt, status: result.status })
}
