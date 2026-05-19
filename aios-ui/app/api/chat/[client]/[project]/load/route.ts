import { runChatLoad } from '@/lib/skills/chat'
import { buildProjectBrief } from '@/lib/skills/chat-brief'
import { writeChatSession } from '@/lib/cache/sessions'
import { getClient, getProject } from '@/lib/data/clients'

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

      // Build the brief from the data layer (clients.yaml, memory, references,
      // decisions, wiki). This is what previously came from `/load-project` —
      // but doing it in JS avoids the slash-command-breaks-resumability bug.
      let brief: string
      let projectLabel: string
      try {
        const clientObj = await getClient(client)
        const projectObj = await getProject(client, project)
        projectLabel = clientObj && projectObj
          ? `${clientObj.name} — ${projectObj.name}`
          : `${client}/${project}`
        brief = await buildProjectBrief(client, project)
      } catch (err) {
        send('done', {
          status: 'failed',
          sessionId: null,
          output: '',
          exitCode: -1,
          durationMs: 0,
          error: `Failed to build brief: ${err instanceof Error ? err.message : String(err)}`,
        })
        try { controller.close() } catch { /* already closed */ }
        return
      }

      // Stream the brief itself to the UI first so the user sees the context
      // before Claude's response. Followed by a separator + Claude's reply.
      send('chunk', { text: brief })
      send('chunk', { text: '\n\n---\n\n' })

      const result = await runChatLoad({
        brief,
        projectLabel,
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
