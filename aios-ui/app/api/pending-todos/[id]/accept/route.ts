import { loadPendingTodos, resolvePendingTodo } from '@/lib/data/pending-todos'
import { runPendingTodoAction, type TodoActionResult } from '@/lib/skills/pending-todo-actions'
import { appendActivity } from '@/lib/data/activity-log'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const todos = await loadPendingTodos()
  const todo = todos.find(t => t.id === id)
  if (!todo) {
    return Response.json({ error: 'todo not found' }, { status: 404 })
  }

  const isActionable = todo.action || (todo.actionType !== 'generic')
  if (!isActionable) {
    return Response.json({ error: 'This item has no actionable delegation type' }, { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* closed */ }
      }

      send('start', { at: new Date().toISOString(), todoId: id })

      let result: TodoActionResult
      try {
        result = await runPendingTodoAction({
          todo,
          onStdout: chunk => send('chunk', { text: chunk }),
          signal: req.signal,
        })
      } catch (err) {
        result = {
          status: 'failed',
          output: '',
          exitCode: -1,
          durationMs: 0,
          error: err instanceof Error ? err.message : String(err),
        }
      }

      send('done', { ...result, todoId: id })

      const actionType = todo.action ?? (todo.actionType === 'email' ? 'draft-email' : 'draft-email')
      const clientSlug = todo.client?.split('/')[0]?.trim() ?? 'aios'

      if (result.status === 'success') {
        await resolvePendingTodo(id, 'done')
        const artifact = actionType === 'update-state'
          ? `state/${clientSlug}.md`
          : 'Gmail draft'
        await appendActivity(actionType, clientSlug, todo.summary, artifact)
      } else {
        await appendActivity('bounced', clientSlug, todo.summary, result.error ?? 'Unknown error')
      }

      invalidationBus.publish({
        scope: { kind: 'admin' },
        reason: `pending todo ${id} ${result.status === 'success' ? 'completed' : 'reverted'}`,
        at: new Date().toISOString(),
      })

      try { controller.close() } catch { /* already closed */ }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
