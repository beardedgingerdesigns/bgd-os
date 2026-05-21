// aios-ui/app/api/receipts/stream/route.ts
//
// Phase 04 — SSE endpoint dedicated to the receipt-feed dock. We subscribe to
// the global invalidationBus and emit a "receipt" event on every global-scope
// invalidation. The dock receives the nudge and refetches /api/receipts. We
// intentionally do NOT push receipt payloads through SSE — payload assembly
// stays on the GET route to keep this stream cheap.

import type { NextRequest } from 'next/server'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          )
        } catch (_) {
          // Connection closed; suppress.
        }
      }

      send('hello', { ok: true })

      const heartbeat = setInterval(
        () => send('ping', { at: new Date().toISOString() }),
        30_000,
      )

      const unsubscribe = invalidationBus.subscribe(msg => {
        if (msg.scope.kind === 'global') {
          send('receipt', { at: msg.at, reason: msg.reason })
        }
      })

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch (_) {
          /* already closed */
        }
      })
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
