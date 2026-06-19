import { readStateUpdates, reconcileStateUpdates } from '@/lib/cache/state-updates'
import { readTriageState } from '@/lib/data/triage-state'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Reconcile triage-emitted proposals (the STATE_UPDATES_JSON envelope inside
  // state/inbox-triage.md) before returning. Both triage paths write that file
  // and the scheduled path has no post-run hook, so the read path is the single
  // place that covers both. Idempotent via dedupeKey, serialized in the store.
  const triage = await readTriageState()
  if (triage) await reconcileStateUpdates(triage.output, new Date().toISOString())
  return Response.json(await readStateUpdates())
}
