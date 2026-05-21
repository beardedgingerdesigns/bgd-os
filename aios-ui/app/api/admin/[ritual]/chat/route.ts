import { runChatLoad, runChatMessage } from '@/lib/skills/chat'
import { buildRitualChatSeed } from '@/lib/skills/ritual-chat'
import { RITUAL_SLUGS, type RitualSlug } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

function isRitualSlug(value: string): value is RitualSlug {
  return (RITUAL_SLUGS as readonly string[]).includes(value)
}

interface ChatBody {
  message?: unknown
  report?: unknown            // required on the first turn
  sessionId?: unknown         // required on subsequent turns
}

// SSE event vocabulary (mirrors /api/triage/run + /api/admin/[ritual]):
//   start  { at }
//   chunk  { text }
//   done   { status, sessionId, output, exitCode, durationMs, error? }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ ritual: string }> },
) {
  const { ritual } = await params
  if (!isRitualSlug(ritual)) {
    return Response.json({ error: `Unknown ritual: ${ritual}` }, { status: 404 })
  }

  let body: ChatBody
  try {
    body = (await req.json()) as ChatBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return Response.json({ error: 'message is required' }, { status: 400 })
  }

  const sessionId = typeof body.sessionId === 'string' && body.sessionId.length > 0
    ? body.sessionId
    : null
  const report = typeof body.report === 'string' ? body.report : null

  // First turn: seed a fresh session with the report + message. Subsequent
  // turns: resume the existing session. Caller is responsible for providing
  // the report on turn 1; we don't cache it server-side (the conversation
  // history retains it via --resume).
  if (!sessionId && !report) {
    return Response.json(
      { error: 'first turn requires `report`; subsequent turns require `sessionId`' },
      { status: 400 },
    )
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
        if (sessionId) {
          const result = await runChatMessage({
            sessionId,
            message,
            onStdout: chunk => send('chunk', { text: chunk }),
          })
          send('done', { ...result, sessionId })
        } else {
          const seed = buildRitualChatSeed({ ritual, report: report!, firstMessage: message })
          const result = await runChatLoad({
            brief: seed,
            // projectLabel only shows up if the default args are used; we pass
            // the full seed inline so this label is mostly cosmetic for logs.
            projectLabel: `ritual ${ritual}`,
            // Override the default args so runChatLoad uses our custom seed
            // verbatim instead of wrapping it in its own "I'm working on…" intro.
            args: [
              '--print',
              '--permission-mode', 'bypassPermissions',
              '--output-format', 'stream-json',
              '--include-partial-messages',
              '--verbose',
              seed,
            ],
            onStdout: chunk => send('chunk', { text: chunk }),
          })
          send('done', result)
        }
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
