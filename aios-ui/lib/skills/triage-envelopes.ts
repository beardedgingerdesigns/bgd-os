// Pure, client-safe. Strips the machine-only envelopes the daily-inbox-triage
// skill embeds in its brief / state/inbox-triage.md (TODOS_JSON for the dashboard
// todo cards, STATE_UPDATES_JSON for the Sync queue) so operators never see them
// as text and prose parsing never mistakes their fenced JSON for content.
//
// Per-type pairing — NOT a cross-type alternation. Each START only closes on its
// OWN END, so a malformed/unterminated envelope of one type leaves its marker
// visible rather than swallowing all prose up to the next type's END marker.

const ENVELOPE_RES: RegExp[] = [
  /<!--\s*TODOS_JSON_START\s*-->[\s\S]*?<!--\s*TODOS_JSON_END\s*-->\s*/gi,
  /<!--\s*STATE_UPDATES_JSON_START\s*-->[\s\S]*?<!--\s*STATE_UPDATES_JSON_END\s*-->\s*/gi,
]

export function stripTriageEnvelopes(markdown: string): string {
  return ENVELOPE_RES.reduce((md, re) => md.replace(re, ''), markdown)
}
