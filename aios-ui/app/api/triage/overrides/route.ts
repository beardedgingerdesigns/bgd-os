import { readOverrides } from '@/lib/cache/triage-overrides'

// Read-only companion to the override write endpoint ([threadId]/route.ts).
// The triage view fetches this alongside /api/triage/latest so it can subtract
// already-resolved threads from the rendered brief — without it, dismissed /
// snoozed cards reappear on every reload (the brief is regenerated, the
// operator's per-thread decision lives only here).
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const overrides = await readOverrides()
  return Response.json(overrides)
}
