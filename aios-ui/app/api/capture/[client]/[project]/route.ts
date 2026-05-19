import { runCapture } from '@/lib/skills/capture'
import { getClient, getProject } from '@/lib/data/clients'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

interface CaptureRequestBody {
  text: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params
  let body: CaptureRequestBody
  try {
    body = (await req.json()) as CaptureRequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const text = (body.text ?? '').trim()
  if (!text) {
    return new Response(JSON.stringify({ error: 'Empty capture text' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
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

      // Resolve project. Unknown client/project gets a hard fail (don't silently
      // capture against a bogus label).
      let projectLabel: string
      try {
        const clientObj = await getClient(client)
        const projectObj = await getProject(client, project)
        if (!clientObj || !projectObj) {
          send('done', {
            status: 'failed',
            output: '',
            exitCode: -1,
            durationMs: 0,
            error: `Unknown project: ${client}/${project}`,
          })
          try { controller.close() } catch { /* already closed */ }
          return
        }
        projectLabel = `${clientObj.name} — ${projectObj.name}`
      } catch (err) {
        send('done', {
          status: 'failed',
          output: '',
          exitCode: -1,
          durationMs: 0,
          error: `Failed to resolve project: ${err instanceof Error ? err.message : String(err)}`,
        })
        try { controller.close() } catch { /* already closed */ }
        return
      }

      const result = await runCapture({
        text,
        projectLabel,
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
