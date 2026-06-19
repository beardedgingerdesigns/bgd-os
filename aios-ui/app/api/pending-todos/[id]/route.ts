import { resolvePendingTodo, type ResolveAction } from '@/lib/data/pending-todos'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_ACTIONS = new Set<string>(['done', 'dismiss'])

interface MutationBody {
  action?: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let body: MutationBody
  try {
    body = (await req.json()) as MutationBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const action = body?.action
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return Response.json(
      { error: `action must be one of ${[...ALLOWED_ACTIONS].join(', ')}` },
      { status: 400 },
    )
  }

  const result = await resolvePendingTodo(id, action as ResolveAction)
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 404 })
  }

  invalidationBus.publish({
    scope: { kind: 'admin' },
    reason: `pending todo ${id} ${action}`,
    at: new Date().toISOString(),
  })

  return Response.json({ ok: true, todo: result.todo })
}
