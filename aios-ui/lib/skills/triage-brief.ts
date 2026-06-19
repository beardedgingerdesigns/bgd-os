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
  // Everything after the `—` (or the em/en dash). Carries subject + context +
  // suggested next step as the skill wrote it. Display-only.
  context: string
  // Gmail thread id if the bullet (or an adjacent `Thread:` line) carried one.
  threadId: string | null
  // Inline `Score: NN` if present.
  score: number | null
  // Inline `Waiting: N days` / `N days waiting` if present.
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
const SCORE_RE = /Score:\s*(\d{1,3})/i
const DAYS_RE = /(\d{1,3})\s*days?\s*(?:waiting|old)|(?:waiting|aging)\s*(\d{1,3})\s*days?/i

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
    context: cleanContext(context),
    threadId: tid ? tid[1] : null,
    score: score ? Number(score[1]) : null,
    daysWaiting: days ? Number(days[1] ?? days[2]) : null,
  }
}

// Drop the TODOS_JSON envelope before prose parsing so its fenced JSON never
// gets mistaken for a section body.
const ENVELOPE_RE =
  /<!--\s*TODOS_JSON_START\s*-->[\s\S]*?<!--\s*TODOS_JSON_END\s*-->/i

export function parseTriageBrief(markdown: string): TriageBrief {
  const body = markdown.replace(ENVELOPE_RE, '')
  const lines = body.split('\n')

  let heading: string | null = null
  let summaryLine: string | null = null
  const sections: TriageSection[] = []
  let current: TriageSection | null = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '')
    const h1 = line.match(/^#\s+(.*)$/)
    if (h1) {
      heading = h1[1].trim()
      continue
    }
    const h2 = line.match(/^#{2,3}\s+(.*)$/)
    if (h2) {
      const title = h2[1].trim()
      current = { kind: classifyHeader(title), title, threads: [] }
      sections.push(current)
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
    // List items become threads inside the current section.
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(line) && current) {
      current.threads.push(parseThread(stripBullet(line)))
    }
  }

  return { heading, summaryLine, sections }
}
