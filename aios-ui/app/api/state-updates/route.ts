import { readStateUpdates, reconcileStateUpdates } from '@/lib/cache/state-updates'
import { readTriageState } from '@/lib/data/triage-state'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Reconcile triage-emitted proposals (the STATE_UPDATES_JSON envelope inside
  // state/inbox-triage.md) before returning. Both triage paths write that file
  // and the scheduled path has no post-run hook, so the read path is the single
  // place that covers both. Idempotent via dedupeKey, serialized in the store.
  //
  // Best-effort: reconcile is enrichment, not the response. A triage-file read
  // error (non-ENOENT) or a store-write fault must not 500 the Sync view + badge
  // — degrade to serving the last persisted store.
  try {
    const triage = await readTriageState()
    if (triage) await reconcileStateUpdates(triage.output, new Date().toISOString())
  } catch (err) {
    console.error('[state-updates GET] reconcile failed, serving persisted store:', err)
  }
  return Response.json(await readStateUpdates())
}
