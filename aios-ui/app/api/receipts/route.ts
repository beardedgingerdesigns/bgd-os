// aios-ui/app/api/receipts/route.ts
//
// Phase 04 — GET the most-recent receipts for the bottom-right dock. The dock
// also opens an SSE connection to /api/receipts/stream to know when to refetch.

import { readRecentReceipts } from '@/lib/cache/receipts'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const receipts = await readRecentReceipts(20)
  return Response.json({ receipts })
}
