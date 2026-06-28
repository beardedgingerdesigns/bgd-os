import { runChatMessage } from '@/lib/skills/chat'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(req: Request) {
  const body = (await req.json()) as { sessionId: string; message: string }
  const { sessionId, message } = body

  if (!sessionId || !message) {
    return Response.json({ error: 'sessionId and message required' }, { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* closed */ }
      }

      send('start', { at: new Date().toISOString() })

      try {
        // ponytail: date prefix on every resumed turn so stale sessions learn today's date
        const now = new Date()
        const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const dated = `[${today}] ${message}`
        const result = await runChatMessage({
          sessionId,
          message: dated,
          onStdout: (chunk) => send('chunk', { text: chunk }),
        })

        send('done', {
          status: result.status,
          output: result.output,
          exitCode: result.exitCode,
          durationMs: result.durationMs,
          error: result.error,
        })
      } catch (err) {
        send('done', {
          status: 'failed',
          output: '',
          exitCode: -1,
          durationMs: 0,
          error: err instanceof Error ? err.message : String(err),
        })
      }

      controller.close()
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
