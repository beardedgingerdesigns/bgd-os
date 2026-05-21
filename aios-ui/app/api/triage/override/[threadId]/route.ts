// aios-ui/app/api/triage/override/[threadId]/route.ts
//
// Phase 04 — Plan 04 (HUB-04 / HUB-09): per-thread triage override endpoint.
// Body: { status: TriageOverrideStatus; snooze_until?: string; project_slug?: string }
//
// Writes the override atomically, appends a triage_override receipt, and
// publishes a global invalidation so the receipt dock + any project page
// listening on SSE refetches.

import { writeOverride, overridesPath } from '@/lib/cache/triage-overrides'
import { appendReceipt } from '@/lib/cache/receipts'
import { invalidationBus } from '@/lib/invalidation-bus'
import type { TriageOverride, TriageOverrideStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const VALID_STATUSES: ReadonlySet<TriageOverrideStatus> = new Set([
  'replied',
  'snoozed',
  'not_me',
  'dismissed',
])

interface OverrideRequestBody {
  status?: string
  snooze_until?: string
  project_slug?: string
}

function isValidStatus(s: string | undefined): s is TriageOverrideStatus {
  return typeof s === 'string' && VALID_STATUSES.has(s as TriageOverrideStatus)
}

function randomReceiptId(): string {
  // Lightweight unique-enough id — no crypto dep needed for an audit trail.
  return `rcpt_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params

  let body: OverrideRequestBody
  try {
    body = (await req.json()) as OverrideRequestBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  if (!isValidStatus(body.status)) {
    return Response.json(
      { error: `status must be one of ${[...VALID_STATUSES].join(', ')}` },
      { status: 400 },
    )
  }
  const status: TriageOverrideStatus = body.status

  if (status === 'snoozed' && !body.snooze_until) {
    return Response.json(
      { error: 'snooze_until required when status=snoozed' },
      { status: 400 },
    )
  }

  const nowIso = new Date().toISOString()
  const override: TriageOverride = {
    status,
    marked_at: nowIso,
  }
  if (body.snooze_until) override.snooze_until = body.snooze_until

  await writeOverride(threadId, override)

  await appendReceipt({
    id: randomReceiptId(),
    ts: nowIso,
    kind: 'triage_override',
    project_slug: body.project_slug ?? '',
    file_written: overridesPath(),
    excerpt: `${status} for thread ${threadId}`,
    actor: 'triage-row-actions',
  })

  invalidationBus.publish({
    scope: { kind: 'global' },
    reason: `triage override ${threadId} ${status}`,
    at: nowIso,
  })

  return Response.json({ ok: true })
}
