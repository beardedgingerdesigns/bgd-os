import { findTodo, mutateTodo } from '@/lib/cache/todos'
import { runTodoAction, type TodoActionResult } from '@/lib/skills/todo-actions'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const todo = await findTodo(id)
  if (!todo) {
    return Response.json({ error: 'todo not found' }, { status: 404 })
  }

  // Mark in_progress upfront so a parallel viewer sees the running state even
  // before the subprocess emits anything. The SSE invalidate triggers refresh
  // on connected clients, so the optimistic "Accepting…" state reconciles
  // with cache-truth.
  await mutateTodo(id, 'in_progress')
  invalidationBus.publish({
    scope: { kind: 'admin' },
    reason: `todo ${id} accepted`,
    at: new Date().toISOString(),
  })

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
        result = await runTodoAction({
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

      // On success, persist the terminal status so a page reload shows "Done".
      // On failure, revert to 'open' so the user can retry without a manual reopen.
      const terminalStatus = result.status === 'success' ? 'done' : 'open'
      await mutateTodo(id, terminalStatus)
      invalidationBus.publish({
        scope: { kind: 'admin' },
        reason: `todo ${id} ${result.status === 'success' ? 'completed' : 'reverted'}`,
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
