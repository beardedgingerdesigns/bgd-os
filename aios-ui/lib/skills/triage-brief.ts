// Pure parser for the Markdown brief produced by /daily-inbox-triage and cached
// as TriageCacheEntry.output. NO Node.js built-ins — safe to import from client
// components (components/views/triage-view.tsx).
//
// The brief has two layers:
//   1. Human-readable prose sections ("## Reply today", "## Reply this week",
//      "## FYI ...", "## Archive candidates", "## Billing alerts", ...). Each
//      section is a list of `- **Name** — context` bullets.
//   2. A trailing <!-- TODOS_JSON_START -->...<!-- TODOS_JSON_END --> envelope
//      with structured `todos[]` (the machine surface used for row actions).
//
// extractTodosEnvelope already owns layer 2. This module owns layer 1 so the
// view can render readable, ranked rows even when the envelope is empty (the
// common "clean inbox, here's the watch list" case in the current cache).

import { stripTriageEnvelopes } from '@/lib/skills/triage-envelopes'

export type TriageSectionKind =
  | 'reply_today'
  | 'reply_week'
  | 'fyi'
  | 'archive'
  | 'billing'
  | 'other'

export interface TriageThread {
  // Display name / sender, pulled from `- **Name** — rest`. Falls back to the
  // whole bullet text when no bold lead is present.
  sender: string
  // Thread subject, from the indented `Subject:` sub-line of a reply card.
  subject: string | null
  // Summary of the latest inbound message, from `What they said:`. This is the
  // primary card preview — what the message actually says.
  summary: string | null
  // Status implication, from `Project context:` — what this means for the
  // project's current state (the memory snippet the skill attached).
  statusNote: string | null
  // Recommended action, from `Suggested next step:`.
  nextStep: string | null
  // Everything after the `—` (or the em/en dash) on the bullet line. Only used
  // as a fallback preview for single-line bullets (FYI / billing) that carry no
  // sub-fields; the `(domain) — *score*` heading tail is stripped out.
  context: string
  // Gmail thread id if the bullet or its `Thread:` sub-line carried one.
  threadId: string | null
  // Inline `Score: NN` if present.
  score: number | null
  // Inline `Waiting: N days` / `N days waiting`, or the card's `Last inbound:`.
  daysWaiting: number | null
}

export interface TriageSection {
  kind: TriageSectionKind
  title: string // raw header text, e.g. "Reply today"
  threads: TriageThread[]
}

export interface TriageBrief {
  // First H1 of the brief, e.g. "Inbox Triage — 2026-06-08 (morning_briefing)".
  heading: string | null
  // The bold one-line summary right under the H1, e.g.
  // "0 threads need reply. Inbox is clean as of 8:57pm CT." — display-only.
  summaryLine: string | null
  sections: TriageSection[]
}

const THREAD_ID_RE = /Thread:\s*`?([0-9a-f]{12,32})`?/i
const BARE_THREAD_ID_RE = /([0-9a-f]{12,32})/i
const SCORE_RE = /Score:\s*(\d{1,3})/i
const DAYS_RE = /(\d{1,3})\s*days?\s*(?:waiting|old)|(?:waiting|aging)\s*(\d{1,3})\s*days?/i
// Heading-tail noise on a reply card's bullet line — `(domain) — *score*`. Both
// are surfaced elsewhere (or deliberately dropped), so strip them from any
// fallback context rather than leaking literal `(foo.com) — *8*` onto the card.
const DOMAIN_PAREN_RE = /\([a-z0-9.-]+\.[a-z]{2,}\)/i
const STAR_SCORE_RE = /\*\d{1,3}\*/

// Indented `Key: value` sub-lines under a numbered reply card (the multi-line
// format the triage skill writes). These carry the real content — message
// summary and status implication — that the heading bullet does not.
const FIELD_RE =
  /^\s*(Subject|Last inbound|What they said|Project context|Suggested next step|Thread):\s*(.+?)\s*$/i

function attachField(thread: TriageThread, key: string, value: string): void {
  switch (key.toLowerCase()) {
    case 'subject':
      thread.subject = value
      break
    case 'what they said':
      thread.summary = value
      break
    case 'project context':
      thread.statusNote = value
      break
    case 'suggested next step':
      thread.nextStep = value
      break
    case 'last inbound': {
      const d = value.match(/(\d{1,3})\s*days?/i)
      if (d) thread.daysWaiting = Number(d[1])
      break
    }
    case 'thread': {
      const t = value.match(BARE_THREAD_ID_RE)
      if (t) thread.threadId = t[1]
      break
    }
  }
}

function classifyHeader(raw: string): TriageSectionKind {
  const h = raw.toLowerCase()
  if (h.includes('reply today') || h.includes('reply now')) return 'reply_today'
  if (h.includes('reply this week') || h.includes('this week')) return 'reply_week'
  if (h.includes('archive')) return 'archive'
  if (h.includes('billing') || h.includes('payment') || h.includes('alert')) return 'billing'
  if (h.includes('fyi') || h.includes('watch') || h.includes('context only')) return 'fyi'
  return 'other'
}

// Strip leading list markers and surrounding whitespace from a bullet line.
function stripBullet(line: string): string {
  return line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').trim()
}

// Split a bullet into a bold "sender" lead and the trailing context. Handles
// `- **Name (Project)** — rest`, `- **Name** - rest`, and bullets with no bold.
function parseBullet(bullet: string): { sender: string; context: string } {
  const bold = bullet.match(/^\*\*(.+?)\*\*\s*(?:[—–-]\s*)?(.*)$/)
  if (bold) {
    return { sender: bold[1].trim(), context: bold[2].trim() }
  }
  // No bold lead: try to split on the first dash separator.
  const dash = bullet.match(/^(.+?)\s+[—–]\s+(.*)$/)
  if (dash) {
    return { sender: dash[1].trim(), context: dash[2].trim() }
  }
  return { sender: bullet.trim(), context: '' }
}

// Tokens we lift into structured fields (score, days, thread id) shouldn't also
// appear in the display context line, where they'd render redundantly next to
// the badge. Strip them and tidy the leftover punctuation.
function cleanContext(context: string): string {
  return context
    .replace(THREAD_ID_RE, '')
    .replace(SCORE_RE, '')
    .replace(DAYS_RE, '')
    .replace(DOMAIN_PAREN_RE, '')
    .replace(STAR_SCORE_RE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s.,;—–-]+|[\s.,;]+$/g, '')
    .trim()
}

function parseThread(bullet: string): TriageThread {
  const { sender, context } = parseBullet(bullet)
  const tid = bullet.match(THREAD_ID_RE)
  const score = bullet.match(SCORE_RE)
  const days = bullet.match(DAYS_RE)
  return {
    sender,
    subject: null,
    summary: null,
    statusNote: null,
    nextStep: null,
    context: cleanContext(context),
    threadId: tid ? tid[1] : null,
    score: score ? Number(score[1]) : null,
    daysWaiting: days ? Number(days[1] ?? days[2]) : null,
  }
}

export function parseTriageBrief(markdown: string): TriageBrief {
  // Drop the TODOS_JSON / STATE_UPDATES_JSON envelopes before prose parsing so
  // their fenced JSON never gets mistaken for a section body.
  const body = stripTriageEnvelopes(markdown)
  const lines = body.split('\n')

  let heading: string | null = null
  let summaryLine: string | null = null
  const sections: TriageSection[] = []
  let current: TriageSection | null = null
  // The card opened by the most recent bullet, so its indented sub-fields
  // (Subject / What they said / Project context / ...) attach to it.
  let currentThread: TriageThread | null = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '')
    const h1 = line.match(/^#\s+(.*)$/)
    if (h1) {
      heading = h1[1].trim()
      currentThread = null
      continue
    }
    const h2 = line.match(/^#{2,3}\s+(.*)$/)
    if (h2) {
      const title = h2[1].trim()
      current = { kind: classifyHeader(title), title, threads: [] }
      sections.push(current)
      currentThread = null
      continue
    }
    // Bold one-liner summary directly under the H1, before any section.
    if (!current && summaryLine === null) {
      const bold = line.match(/^\*\*(.+?)\*\*\s*$/)
      if (bold) {
        summaryLine = bold[1].trim()
        continue
      }
    }
    // List items open a new thread inside the current section.
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(line) && current) {
      currentThread = parseThread(stripBullet(line))
      current.threads.push(currentThread)
      continue
    }
    // Indented `Key: value` sub-lines fill the card opened above.
    if (currentThread) {
      const field = line.match(FIELD_RE)
      if (field) attachField(currentThread, field[1], field[2])
    }
  }

  return { heading, summaryLine, sections }
}

// Seed prompt for the AIOS chat when the operator clicks "Draft reply" on a
// triage card. The chat agent already carries the AIOS context (voice,
// draft-only Gmail), so this just hands it the thread specifics it needs.
export function buildDraftReplyPrompt(thread: TriageThread): string {
  const subject = thread.subject ? ` re: "${thread.subject}"` : ''
  const threadRef = thread.threadId ? ` (Gmail thread ${thread.threadId})` : ''
  const lines = [`Draft a reply to ${thread.sender}${subject}${threadRef}.`]
  if (thread.summary) lines.push(`They wrote: ${thread.summary}`)
  if (thread.statusNote) lines.push(`Project context: ${thread.statusNote}`)
  if (thread.nextStep) lines.push(`Suggested angle: ${thread.nextStep}`)
  lines.push(
    'Write it in my voice and save it as a Gmail draft (draft only — do not send), then show me the draft text.',
  )
  return lines.join('\n')
}
