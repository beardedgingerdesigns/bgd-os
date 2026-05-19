import { runChatMessage } from '@/lib/skills/chat'
import { readChatSession } from '@/lib/cache/sessions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

interface MessageBody {
  message: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params
  const body = (await req.json()) as MessageBody
  if (!body?.message || typeof body.message !== 'string') {
    return Response.json({ error: 'message field required' }, { status: 400 })
  }

  const session = await readChatSession(client, project)
  if (!session) {
    return Response.json({ error: 'no active session — call /load first' }, { status: 409 })
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

      const result = await runChatMessage({
        sessionId: session.sessionId,
        message: body.message,
        onStdout: chunk => send('chunk', { text: chunk }),
      })

      send('done', result)
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
