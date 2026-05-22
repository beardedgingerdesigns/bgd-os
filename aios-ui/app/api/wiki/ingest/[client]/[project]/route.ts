import path from 'path'
import { runWikiIngest } from '@/lib/skills/wiki-ingest'
import { appendReceipt } from '@/lib/cache/receipts'
import { resolveProjectWikiPath } from '@/lib/data/wiki'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 360

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  const wikiPath = await resolveProjectWikiPath(client, project)
  if (!wikiPath) {
    return new Response(
      JSON.stringify({ error: 'no wiki path resolved for this project' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
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

      send('start', { at: new Date().toISOString(), wikiPath })

      let result
      try {
        result = await runWikiIngest({
          wikiPath,
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
        // Build a one-line summary for the receipt excerpt.
        let summaryStr: string
        if (result.summary) {
          const { promoted, deferred, contested } = result.summary
          summaryStr = `promoted ${promoted.length}, deferred ${deferred.length}, contested ${contested.length}`
        } else {
          summaryStr = 'ingest complete (no structured summary)'
        }

        await appendReceipt({
          id: `rcpt_${Math.random().toString(36).slice(2, 12)}`,
          ts: new Date().toISOString(),
          kind: 'wiki_ingest',
          project_slug: project,
          file_written: path.join(wikiPath, 'log.md'),
          excerpt: summaryStr,
          actor: 'pending-ingestion-section',
        })

        invalidationBus.publish({
          scope: { kind: 'project', clientSlug: client, projectSlug: project },
          reason: 'wiki ingest complete',
          at: new Date().toISOString(),
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
