import { readTriageState } from '@/lib/data/triage-state'
import { readTriageCache } from '@/lib/cache/triage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // state/inbox-triage.md is the source of truth — written by both the
  // scheduled cowork triage and the in-app run. Fall back to the legacy
  // run cache only if the state file is absent.
  const entry = (await readTriageState()) ?? (await readTriageCache())
  return Response.json(entry)
}
