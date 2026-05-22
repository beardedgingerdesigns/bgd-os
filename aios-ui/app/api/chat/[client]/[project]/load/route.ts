import { runChatLoad } from '@/lib/skills/chat'
import { readBriefOrBuild, buildLiveContext, assembleSeedPrompt } from '@/lib/skills/chat-bootstrap'
import { writeChatSession } from '@/lib/cache/sessions'
import { getClient, getProject } from '@/lib/data/clients'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  // Phase 04 review CR-02: validate project exists before letting slugs flow
  // into buildBriefFor (cache-miss branch in readBriefOrBuild) and
  // writeChatSession. Without this, unknown slugs would write fallback briefs
  // for non-existent projects and bypass defense-in-depth path hardening.
  // Returning a 404 JSON response BEFORE opening the SSE stream is the cheapest
  // signal the client can act on; once the stream opens, the response status
  // is locked to 200.
  const clientObj = await getClient(client).catch(() => undefined)
  const projectObj = await getProject(client, project).catch(() => undefined)
  if (!projectObj) {
    return Response.json({ error: 'unknown project' }, { status: 404 })
  }
  const projectLabel = clientObj
    ? `${clientObj.name} — ${projectObj.name}`
    : `${client}/${project}`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* closed */ }
      }

      send('start', { at: new Date().toISOString() })

      // Per ADR 0005: read from cache (or lazy-build on first run), then
      // fetch live Gmail + calendar in parallel on top of the static brief.
      let briefResult: Awaited<ReturnType<typeof readBriefOrBuild>>
      let liveCtx: Awaited<ReturnType<typeof buildLiveContext>>
      try {
        ;[briefResult, liveCtx] = await Promise.all([
          readBriefOrBuild(client, project),
          buildLiveContext(client, project),
        ])
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

      // Emit brief metadata BEFORE starting the subprocess so the UI can
      // display "Brief loaded (built Nm ago)" immediately.
      send('brief-meta', {
        source: briefResult.source,
        builtAt: briefResult.builtAt.toISOString(),
      })

      const seed = assembleSeedPrompt({
        brief: briefResult.brief,
        gmail: liveCtx.gmail,
        calendar: liveCtx.calendar,
        projectLabel,
      })

      // Stream the seed itself to the UI first (preserves v1 UX pattern of
      // showing context before Claude's response), then the separator.
      send('chunk', { text: seed })
      send('chunk', { text: '\n\n---\n\n' })

      // runChatLoad is unchanged — it owns the claude --resume / session-id
      // contract (HUB-03). We pass the seed as the brief; it wraps it in its
      // own orient-yourself preamble before spawning claude.
      const result = await runChatLoad({
        brief: seed,
        projectLabel,
        onStdout: chunk => send('chunk', { text: chunk }),
        // Phase 04 review WR-05: forward the client-disconnect signal so the
        // subprocess is SIGTERMed instead of running to completion after the
        // operator collapses the drawer.
        signal: req.signal,
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
