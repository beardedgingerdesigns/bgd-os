import { runChatLoad } from '@/lib/skills/chat'
import { writeChatSession } from '@/lib/cache/sessions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST() {
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
        const result = await runChatLoad({
          brief: 'You are the AIOS operator console. Justin is sitting at the dashboard. Read CLAUDE.md for context. Be ready to run skills (/brief, /daily-inbox-triage, /dispatch, /wrap, etc.), answer questions about projects, and help with decisions. Keep your initial response to 1-2 sentences.',
          projectLabel: 'AIOS Operator Console',
          onStdout: (chunk) => send('chunk', { text: chunk }),
        })

        if (result.sessionId) {
          await writeChatSession({
            clientSlug: '_aios',
            projectSlug: '_aios',
            sessionId: result.sessionId,
            startedAt: new Date().toISOString(),
          })
        }

        send('done', {
          status: result.status,
          sessionId: result.sessionId,
          output: result.output,
          exitCode: result.exitCode,
          durationMs: result.durationMs,
          error: result.error,
        })
      } catch (err) {
        send('done', {
          status: 'failed',
          sessionId: null,
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
