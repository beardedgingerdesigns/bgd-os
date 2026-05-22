import { buildBriefFor } from '@/lib/indexer/build-brief'
import { deleteChatSession } from '@/lib/cache/sessions'
import { getProject } from '@/lib/data/clients'

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
 *
 * Phase 04 review CR-02: gate on getProject() before letting raw slugs flow
 * into buildBriefFor / deleteChatSession. Both compose filesystem paths from
 * the slug strings; unknown slugs would write fallback briefs into the cache
 * for non-existent projects (operational pollution) and bypass defense-in-
 * depth path-traversal hardening.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params
  const projectObj = await getProject(client, project).catch(() => undefined)
  if (!projectObj) {
    return Response.json({ error: 'unknown project' }, { status: 404 })
  }
  const result = await buildBriefFor(client, project)
  await deleteChatSession(client, project)
  return Response.json({ ok: true, builtAt: result.builtAt, status: result.status })
}
