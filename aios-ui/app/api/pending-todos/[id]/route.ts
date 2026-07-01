import {
  resolvePendingTodo,
  snoozePendingTodo,
  unsnoozePendingTodo,
  blockPendingTodo,
  unblockPendingTodo,
  clearReviewReason,
  updateActionContext,
  demoteTodo,
  type ResolveAction,
} from '@/lib/data/pending-todos'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_ACTIONS = new Set<string>([
  'done', 'dismiss', 'snooze', 'unsnooze', 'block', 'unblock',
  'clear-review', 'edit-context', 'demote',
])

interface MutationBody {
  action?: string
  until?: string   // ISO date for snooze
  text?: string    // free text for block
  context?: string // new action context for edit-context
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

  if (action === 'snooze' && !body.until) {
    return Response.json({ error: 'snooze requires an "until" date' }, { status: 400 })
  }
  if (action === 'block' && !body.text) {
    return Response.json({ error: 'block requires a "text" value' }, { status: 400 })
  }

  let result
  switch (action) {
    case 'snooze':
      result = await snoozePendingTodo(id, body.until!)
      break
    case 'unsnooze':
      result = await unsnoozePendingTodo(id)
      break
    case 'block':
      result = await blockPendingTodo(id, body.text!)
      break
    case 'unblock':
      result = await unblockPendingTodo(id)
      break
    case 'clear-review':
      result = await clearReviewReason(id)
      break
    case 'edit-context':
      if (!body.context) return Response.json({ error: 'edit-context requires a "context" value' }, { status: 400 })
      result = await updateActionContext(id, body.context)
      // Also clear the review reason since we're retrying
      if (result.ok) await clearReviewReason(id)
      break
    case 'demote':
      result = await demoteTodo(id)
      break
    default:
      result = await resolvePendingTodo(id, action as ResolveAction)
  }

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
