import { mutateTodo } from '@/lib/cache/todos'
import { invalidationBus } from '@/lib/invalidation-bus'
import type { TodoStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Manual-state actions only. Subprocess-running "accept" lives at /accept so we
// don't conflate fast JSON mutations with long SSE streams in one handler.
const ALLOWED_ACTIONS = new Set<string>(['done', 'dismiss', 'reopen'])

const ACTION_TO_STATUS: Record<string, TodoStatus> = {
  done: 'done',
  dismiss: 'dismissed',
  reopen: 'open',
}

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

  const result = await mutateTodo(id, ACTION_TO_STATUS[action])
  if (!result.ok) {
    const status = result.reason === 'no-cache' ? 404 : 404
    return Response.json({ error: result.reason }, { status })
  }

  invalidationBus.publish({
    scope: { kind: 'admin' },
    reason: `todo ${id} ${action}`,
    at: new Date().toISOString(),
  })

  return Response.json({ ok: true, todo: result.todo })
}
