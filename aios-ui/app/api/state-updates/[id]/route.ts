import { dismissProposal } from '@/lib/cache/state-updates'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const dismissed = await dismissProposal(id)
  if (!dismissed) return Response.json({ error: 'not-found' }, { status: 404 })

  invalidationBus.publish({
    scope: { kind: 'admin' },
    reason: `state update dismissed: ${dismissed.slug}`,
    at: new Date().toISOString(),
  })

  return Response.json({ ok: true })
}
