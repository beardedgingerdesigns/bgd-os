// aios-ui/app/api/triage/override/[threadId]/route.ts
//
// Phase 04 — Plan 04 (HUB-04 / HUB-09): per-thread triage override endpoint.
// Body: { status: TriageOverrideStatus; snooze_until?: string; project_slug?: string }
//
// Writes the override atomically, appends a triage_override receipt, and
// publishes a global invalidation so the receipt dock + any project page
// listening on SSE refetches.

import { writeOverride, deleteOverride, overridesPath } from '@/lib/cache/triage-overrides'
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

// Phase 04 review WR-06: bound the inputs that flow into the overrides JSON
// keyspace and into receipt excerpts. threadId is the JSON object key, so an
// unbounded value would inflate the file on every call. project_slug is also
// kept tight because it's surfaced in receipt UI.
//
// The Gmail thread-id shape (canonical) is 12-20 hex chars — same regex used
// in components/triage-output.tsx:27 to pull thread IDs out of the triage
// output. Loosened the upper bound a touch (to 32) here to absorb any
// future thread-id growth without forcing a coordinated change to the regex
// in the parser.
//
// project_slug shape mirrors clients.yaml conventions: lowercase
// alphanumeric + dashes, 1-64 chars. Empty/omitted is allowed (triage
// receipts surfaced outside any project use '').
const VALID_THREAD_ID = /^[0-9a-f]{6,32}$/i
const VALID_PROJECT_SLUG = /^[a-z0-9-]{1,64}$/

function randomReceiptId(): string {
  // Lightweight unique-enough id — no crypto dep needed for an audit trail.
  return `rcpt_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params

  // Phase 04 review WR-06: validate threadId BEFORE doing any work. Reject
  // unbounded or shape-violating strings so the overrides JSON file cannot be
  // inflated with garbage on every call.
  if (!VALID_THREAD_ID.test(threadId)) {
    return Response.json(
      { error: 'invalid threadId (expected 6-32 hex chars)' },
      { status: 400 },
    )
  }

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

  // Phase 04 review WR-06: bound project_slug too. Allow omission and empty
  // string (current callers do not always include it) but reject any non-
  // empty value that violates the slug shape.
  if (body.project_slug !== undefined && body.project_slug !== '' && !VALID_PROJECT_SLUG.test(body.project_slug)) {
    return Response.json(
      { error: 'invalid project_slug (expected 1-64 chars [a-z0-9-])' },
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

// DELETE clears any override for a thread — the "undo" behind a Replied / Snooze
// / Dismiss row action. Idempotent: clearing an absent override still returns
// ok, so a double-click or stale UI can't 404. Next triage run re-evaluates the
// thread normally (the skill reads this file at Step 2.0).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params

  if (!VALID_THREAD_ID.test(threadId)) {
    return Response.json(
      { error: 'invalid threadId (expected 6-32 hex chars)' },
      { status: 400 },
    )
  }

  await deleteOverride(threadId)

  const nowIso = new Date().toISOString()
  await appendReceipt({
    id: randomReceiptId(),
    ts: nowIso,
    kind: 'triage_override',
    project_slug: '',
    file_written: overridesPath(),
    excerpt: `cleared override for thread ${threadId}`,
    actor: 'triage-row-actions',
  })

  invalidationBus.publish({
    scope: { kind: 'global' },
    reason: `triage override ${threadId} cleared`,
    at: nowIso,
  })

  return Response.json({ ok: true })
}
