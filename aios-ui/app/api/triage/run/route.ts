import { extractTodosEnvelope, runDailyIngest } from '@/lib/skills/daily-ingest'
import { writeTriageCache } from '@/lib/cache/triage'
import { writeTodosCache } from '@/lib/cache/todos'
import type { TriageCacheEntry } from '@/lib/types'

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
        } catch (_) { /* closed */ }
      }

      send('start', { at: new Date().toISOString() })

      const result = await runDailyIngest({
        timeoutMs: 300_000, // 5min — /daily-inbox-triage pulls 50 threads and scores each
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
        // Envelope is additive — older skill versions still produce markdown only.
        // Cache miss = leave previous todos in place; cache hit = overwrite for today.
        const todos = extractTodosEnvelope(result.output)
        if (todos) await writeTodosCache(todos)
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
