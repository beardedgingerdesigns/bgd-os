import { runRitual } from '@/lib/skills/ritual'
import { writeRitualCache } from '@/lib/cache/rituals'
import { RITUAL_SLUGS, type RitualRunResult, type RitualSlug } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

function isRitualSlug(value: string): value is RitualSlug {
  return (RITUAL_SLUGS as readonly string[]).includes(value)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ ritual: string }> },
) {
  const { ritual } = await params
  if (!isRitualSlug(ritual)) {
    return new Response(JSON.stringify({ error: `Unknown ritual: ${ritual}` }), {
      status: 404,
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

      let result: RitualRunResult
      try {
        result = await runRitual({
          slug: ritual,
          onStdout: chunk => send('chunk', { text: chunk }),
        })
      } catch (err) {
        send('done', {
          status: 'failed',
          output: '',
          exitCode: -1,
          durationMs: 0,
          error: err instanceof Error ? err.message : String(err),
        })
        try { controller.close() } catch { /* already closed */ }
        return
      }

      send('done', result)

      if (result.status === 'success') {
        await writeRitualCache({
          ritual,
          ranAt: new Date().toISOString(),
          output: result.output,
          exitCode: result.exitCode,
          durationMs: result.durationMs,
        })
        revalidatePath('/admin')
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
