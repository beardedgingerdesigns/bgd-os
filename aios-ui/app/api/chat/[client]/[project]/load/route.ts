import { runChatLoad } from '@/lib/skills/chat'
import { writeChatSession } from '@/lib/cache/sessions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* closed */ }
      }

      send('start', { at: new Date().toISOString() })

      const result = await runChatLoad({
        projectSlug: project,
        onStdout: chunk => send('chunk', { text: chunk }),
      })

      send('done', result)

      if (result.status === 'success' && result.sessionId) {
        await writeChatSession({
          clientSlug: client,
          projectSlug: project,
          sessionId: result.sessionId,
          startedAt: new Date().toISOString(),
        })
      }

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
