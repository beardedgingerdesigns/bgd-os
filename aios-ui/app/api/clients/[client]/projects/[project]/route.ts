import { revalidatePath } from 'next/cache'
import {
  ClientNotFoundError,
  InvalidSlugError,
  MalformedYamlError,
  removeProject,
} from '@/lib/data/clients-mutations'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client: clientSlug, project: projectSlug } = await params
  try {
    await removeProject(clientSlug, projectSlug)
    bestEffortRevalidate(['/', `/clients/${clientSlug}`, `/clients/${clientSlug}/projects/${projectSlug}`])
    invalidationBus.publish({
      scope: { kind: 'client', clientSlug },
      reason: `project ${projectSlug} deleted`,
      at: new Date().toISOString(),
    })
    return Response.json({ ok: true, clientSlug, projectSlug })
  } catch (err) {
    return errorResponse(err)
  }
}

function errorResponse(err: unknown): Response {
  if (err instanceof ClientNotFoundError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 404 })
  }
  if (err instanceof InvalidSlugError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 400 })
  }
  if (err instanceof MalformedYamlError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 500 })
  }
  const message = err instanceof Error ? err.message : String(err)
  return Response.json({ error: message }, { status: 500 })
}

function bestEffortRevalidate(paths: string[]): void {
  for (const p of paths) {
    try { revalidatePath(p) } catch { /* missing render context — fine */ }
  }
}
