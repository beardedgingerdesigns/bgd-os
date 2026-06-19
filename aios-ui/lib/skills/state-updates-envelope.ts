// Pure parser for the <!-- STATE_UPDATES_JSON_START --> ... <!-- STATE_UPDATES_JSON_END -->
// envelope emitted by the daily-inbox-triage skill (Step 9). NO Node.js built-ins —
// safe to import from client components. Mirrors lib/skills/todos-envelope.ts.

import type { RawStateUpdateProposal, StateUpdateField } from '@/lib/types'

const STATE_UPDATES_ENVELOPE_RE =
  /<!--\s*STATE_UPDATES_JSON_START\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*STATE_UPDATES_JSON_END\s*-->/i

const FIELDS: StateUpdateField[] = ['status', 'current_status', 'next_step', 'blocker']

export interface RawStateUpdatesEnvelope {
  generatedAt: string
  proposals: RawStateUpdateProposal[]
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

// A proposal needs a slug, a valid field, and a non-empty `proposed` to be
// actionable. `current` defaults to '', confidence to 'low'. Anything else → null.
function coerceProposal(raw: unknown): RawStateUpdateProposal | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>

  const slug = asString(r.slug)
  const proposed = asString(r.proposed)
  if (!slug || !proposed) return null

  const field = (FIELDS as string[]).includes(typeof r.field === 'string' ? r.field : '')
    ? (r.field as StateUpdateField)
    : null
  if (!field) return null

  const ev = (typeof r.evidence === 'object' && r.evidence !== null
    ? r.evidence
    : {}) as Record<string, unknown>

  return {
    slug,
    field,
    current: typeof r.current === 'string' ? r.current : '',
    proposed,
    evidence: {
      source: 'triage',
      threadId: asString(ev.threadId) ?? null,
      sender: asString(ev.sender) ?? null,
      date: asString(ev.date) ?? '',
    },
    confidence: r.confidence === 'high' ? 'high' : 'low',
    stateUpdatedAt: asString(r.stateUpdatedAt) ?? null,
  }
}

// Extract the STATE_UPDATES_JSON envelope from triage output (e.g. the content
// of state/inbox-triage.md). Returns null when the envelope is missing or
// malformed; an envelope with "proposals": [] returns an empty array (not null).
export function extractStateUpdatesEnvelope(output: string): RawStateUpdatesEnvelope | null {
  const match = output.match(STATE_UPDATES_ENVELOPE_RE)
  if (!match) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(match[1])
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.proposals)) return null
  const proposals = obj.proposals
    .map(coerceProposal)
    .filter((p): p is RawStateUpdateProposal => p !== null)
  const generatedAt = asString(obj.generated_at) ?? new Date().toISOString()
  return { generatedAt, proposals }
}
