import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TriageOutput } from '@/components/triage-output'

// REAL daily-inbox-triage skill output captured from
// aios-ui/.aios-cache/triage-latest.json on 2026-05-22 (the UAT run that
// surfaced GAP-04-01). Contains both the prose section AND the TODOS_JSON
// envelope with three threads scoped to inside-out-website,
// wild-rose-redesign, and terraplex-hub respectively.
const REAL_SKILL_OUTPUT = `I'll run the daily inbox triage. Let me load the Gmail tools first, then check for any overrides.Filtered the inbox. Three threads qualify for action today. Let me quickly check \`clients.yaml\` for the exact slug format before emitting the envelope.# Inbox Triage — 2026-05-22

**3 threads need reply. 3 today, 0 this week.**

## Reply today

1. **Melinda Dennis** (insideoutiowa.org) — *score 8*
   Subject: Logo/Check in
   Last inbound: ~21h ago (2026-05-21 1:41 PM CT)
   Project context: Content wrap was due Fri 5/15 but slipped after Tue went to Wild Rose.
   Suggested next step: Send the logo for course signs.
   Thread: \`19e4bd7fb716f3a4\`

2. **Wild Rose group** (Aaron + Krystal + Meghan + Jon) — *score 10*
   Subject: RE: Wild Rose content follow-up
   Last inbound: ~18h ago (2026-05-21 4:10 PM CT — Jon's confirm)
   Project context: 5/21 walkthrough done; launch slipped to mid/late June.
   Suggested next step: Send the 5/29 10am CT calendar invite.
   Thread: \`19e4b9fc73712783\`

3. **Cherity Strunk** (terraplexag.com) — *score 10*
   Subject: Please add to Dealer Portal!
   Last inbound: ~45h ago (2026-05-20 2:00 PM CT)
   Project context: BrandOS dealer migration in flight.
   Suggested next step: Open her email to see what she's asking.
   Thread: \`19e46c367dc2351f\`

## FYI / context only

- **Krystal Light** — *website meeting* (1d) — Already folded above.

---

Want me to draft a reply to any of these? Pick a number from "Reply today."

<!-- TODOS_JSON_START -->
\`\`\`json
{
  "generated_at": "2026-05-22T16:00:00Z",
  "todos": [
    {
      "id": "todo-1a2b3c4d",
      "type": "email_reply",
      "summary": "Reply to Melinda Dennis re: Logo/Check in",
      "context": "Content wrap was due Fri 5/15 but slipped after Tue went to Wild Rose.",
      "thread_id": "19e4bd7fb716f3a4",
      "client_slug": "inside-out",
      "project_slug": "inside-out-website",
      "suggested_action": "draft_reply",
      "action_params": { "thread_id": "19e4bd7fb716f3a4" },
      "status": "open"
    },
    {
      "id": "todo-5e6f7a8b",
      "type": "email_reply",
      "summary": "Reply to Wild Rose group re: 5/29 content meeting",
      "context": "5/21 walkthrough done; launch slipped to mid/late June.",
      "thread_id": "19e4b9fc73712783",
      "client_slug": "kirk-financial",
      "project_slug": "wild-rose-redesign",
      "suggested_action": "draft_reply",
      "action_params": { "thread_id": "19e4b9fc73712783" },
      "status": "open"
    },
    {
      "id": "todo-9c0d1e2f",
      "type": "email_reply",
      "summary": "Reply to Cherity Strunk re: Please add to Dealer Portal",
      "context": "BrandOS dealer migration in flight.",
      "thread_id": "19e46c367dc2351f",
      "client_slug": "terraplex",
      "project_slug": "terraplex-hub",
      "suggested_action": "draft_reply",
      "action_params": { "thread_id": "19e46c367dc2351f" },
      "status": "open"
    }
  ]
}
\`\`\`
<!-- TODOS_JSON_END -->`

// Synthetic legacy output (NO envelope) — keeps the prose-only fallback
// path covered. Mirrors the older daily-inbox-triage SKILL.md template
// from before the envelope was introduced.
const LEGACY_PROSE_ONLY = `# Inbox Triage

## Reply today

1. **Aaron Harn** (aaron.harn@wildrosecorporate.com)
   Subject: Walkthrough recap
   Thread: \`19abc123def456789\`

2. **Random Outsider** (random@example.com)
   Subject: Spam
   Thread: \`19fed987cba654321\`
`

describe('TriageOutput — structured envelope path (GAP-04-01)', () => {
  it('parses the TODOS_JSON envelope and renders only project-scoped rows', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={REAL_SKILL_OUTPUT}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    // Wild Rose todo's summary IS rendered.
    expect(html).toContain('Wild Rose group re: 5/29 content meeting')
    // Other projects' todos are NOT rendered.
    expect(html).not.toContain('Melinda Dennis re: Logo')
    expect(html).not.toContain('Cherity Strunk')
    // Wild Rose thread_id IS rendered as a Gmail link.
    expect(html).toContain('19e4b9fc73712783')
    expect(html).toContain('https://mail.google.com/mail/u/0/#inbox/19e4b9fc73712783')
  })

  it('suppresses the TODOS_JSON envelope markers from rendered output', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={REAL_SKILL_OUTPUT}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    // Envelope markers MUST NOT appear as text.
    expect(html).not.toContain('TODOS_JSON_START')
    expect(html).not.toContain('TODOS_JSON_END')
    // Raw JSON keys from the envelope MUST NOT leak through.
    expect(html).not.toContain('"generated_at"')
    expect(html).not.toContain('"action_params"')
  })

  it('suppresses prose preamble (Reply today / Archive / etc) when envelope is present', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={REAL_SKILL_OUTPUT}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    // Operator should see structured rows ONLY, not the raw skill prose.
    expect(html).not.toContain('Inbox Triage — 2026-05-22')
    expect(html).not.toContain('Want me to draft a reply')
  })

  it('renders empty-state message when envelope contains no todos for the project', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={REAL_SKILL_OUTPUT}
        projectSlug="some-other-project"
        projectContacts={['@example.com']}
        renderRowActions
      />,
    )
    expect(html).toContain('No threads scoped to this project')
  })

  it('renders a TriageRowActions kebab trigger per row', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={REAL_SKILL_OUTPUT}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    // Actions moved into a kebab (⋮) menu. The menu items render in a portal
    // on open, so SSR markup carries the trigger (with its aria-label) rather
    // than the item labels.
    expect(html).toContain('Actions for thread 19e4b9fc73712783')
  })
})

describe('TriageOutput — legacy markdown-only fallback (no envelope)', () => {
  it('falls back to the prose-block filter when no TODOS_JSON envelope is present', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={LEGACY_PROSE_ONLY}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    // Aaron block (matches contact domain) survives with its thread id.
    expect(html).toContain('aaron.harn@wildrosecorporate.com')
    expect(html).toContain('19abc123def456789')
    // Random outsider thread block (no matching contact) is filtered out.
    // The legacy filter only drops Thread: blocks for non-matching contacts;
    // it intentionally preserves null-threadId blocks (numbered preamble
    // lines) so headers/intro prose stays put. So we assert the THREAD ID
    // is gone, not the entire numbered line.
    expect(html).not.toContain('19fed987cba654321')
  })

  it('renders Gmail link for the kept thread in legacy mode', () => {
    const html = renderToStaticMarkup(
      <TriageOutput
        markdown={LEGACY_PROSE_ONLY}
        projectSlug="wild-rose-redesign"
        projectContacts={['@wildrosecorporate.com']}
        renderRowActions
      />,
    )
    expect(html).toContain('https://mail.google.com/mail/u/0/#inbox/19abc123def456789')
  })
})

describe('TriageOutput — admin dashboard mode (renderRowActions=false)', () => {
  it('renders the markdown as prose even when an envelope is present (no row actions)', () => {
    // When renderRowActions is false (e.g. the admin dashboard usage), the
    // structured envelope is NOT the primary surface — we render the full
    // prose. But the envelope markers + JSON are still suppressed.
    const html = renderToStaticMarkup(
      <TriageOutput markdown={REAL_SKILL_OUTPUT} />,
    )
    expect(html).toContain('Inbox Triage — 2026-05-22')
    expect(html).not.toContain('TODOS_JSON_START')
    expect(html).not.toContain('"generated_at"')
  })
})

describe('TriageOutput — STATE_UPDATES_JSON envelope suppression (U5)', () => {
  const STATE_ENVELOPE_OUTPUT = `# Inbox Triage — 2026-06-19

Prose the operator should see.

<!-- STATE_UPDATES_JSON_START -->
\`\`\`json
{ "generated_at": "2026-06-19T16:00:00Z", "proposals": [ { "slug": "wild-rose-redesign", "field": "current_status", "proposed": "Go-live July 13", "confidence": "high" } ] }
\`\`\`
<!-- STATE_UPDATES_JSON_END -->`

  it('strips the STATE_UPDATES_JSON envelope from prose output', () => {
    const html = renderToStaticMarkup(<TriageOutput markdown={STATE_ENVELOPE_OUTPUT} />)
    expect(html).toContain('Prose the operator should see.')
    expect(html).not.toContain('STATE_UPDATES_JSON_START')
    expect(html).not.toContain('STATE_UPDATES_JSON_END')
    expect(html).not.toContain('Go-live July 13') // proposed value must not leak as text
  })

  it('strips both envelopes when both are present', () => {
    const html = renderToStaticMarkup(<TriageOutput markdown={REAL_SKILL_OUTPUT + '\n' + STATE_ENVELOPE_OUTPUT} />)
    expect(html).not.toContain('TODOS_JSON_START')
    expect(html).not.toContain('STATE_UPDATES_JSON_START')
    expect(html).not.toContain('Go-live July 13')
  })
})
