import { runDailyIngest } from '@/lib/skills/daily-ingest'
import { writeTriageCache } from '@/lib/cache/triage'
import type { TriageCacheEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch (_) { /* closed */ }
      }

      send('start', { at: new Date().toISOString() })

      const result = await runDailyIngest({
        timeoutMs: 90_000,
        onStdout: chunk => send('stdout', { chunk }),
      })

      send('done', result)

      if (result.status === 'success') {
        const entry: TriageCacheEntry = {
          ranAt: new Date().toISOString(),
          output: result.output,
          exitCode: result.exitCode,
          durationMs: result.durationMs,
        }
        await writeTriageCache(entry)
      }

      try { controller.close() } catch (_) { /* already closed */ }
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
