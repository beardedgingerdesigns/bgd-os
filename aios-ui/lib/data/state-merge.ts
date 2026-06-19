import type { StateUpdateProposal } from '@/lib/types'

// Applies a single triage-drafted proposal to a state-file markdown string.
// Pure and clock-free: `today` is injected so the result is deterministic.
// Mirrors the section/field shapes parsed in lib/data/state.ts.

export type ApplyResult =
  | { ok: true; markdown: string }
  | { ok: false; reason: 'stale' | 'field-not-found' }

const UPDATED_DATE_RE = /\*\*Updated:\*\*\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/

export function fileUpdatedDate(markdown: string): string | null {
  const m = markdown.match(UPDATED_DATE_RE)
  return m ? m[1] : null
}

function bumpUpdated(markdown: string, today: string): string {
  return markdown.replace(UPDATED_DATE_RE, `**Updated:** ${today}`)
}

// [headingIdx, endExclusive) where end is the next `## ` heading or EOF.
function sectionSpan(lines: string[], heading: string): { start: number; end: number } | null {
  const start = lines.findIndex(
    l => /^##\s+/.test(l) && l.replace(/^##\s+/, '').trim().toLowerCase() === heading.toLowerCase(),
  )
  if (start === -1) return null
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) { end = i; break }
  }
  return { start, end }
}

function isBullet(line: string): boolean {
  return /^\s*[-*]\s+/.test(line)
}

function bulletText(line: string): string {
  return line.replace(/^\s*[-*]\s+(\[[ xX]\]\s+)?/, '').trim()
}

// Last index inside the section that holds content (trailing blank lines excluded).
function appendIndex(lines: string[], span: { start: number; end: number }): number {
  let at = span.end
  while (at - 1 > span.start && lines[at - 1].trim() === '') at--
  return at
}

function applyStatus(markdown: string, proposed: string): string | null {
  const re = /(\*\*Status:\*\*\s*)([^\n|]*)/
  if (!re.test(markdown)) return null
  return markdown.replace(re, `$1${proposed.trim()}`)
}

function prependCurrentStatus(lines: string[], proposed: string, today: string): string[] | null {
  const span = sectionSpan(lines, 'Current Status')
  if (!span) return null
  let at = span.start + 1
  if (at < span.end && lines[at] !== undefined && lines[at].trim() === '') at++
  // Bullet + blank line so the existing paragraph isn't absorbed as a lazy
  // continuation of the list item.
  return [...lines.slice(0, at), `- ${today}: ${proposed.trim()} (via triage)`, '', ...lines.slice(at)]
}

function applyNextStep(lines: string[], current: string, proposed: string): string[] | null {
  const span = sectionSpan(lines, 'Next Steps')
  if (!span) return null
  const wanted = current.trim()
  if (wanted) {
    for (let i = span.start + 1; i < span.end; i++) {
      if (isBullet(lines[i]) && bulletText(lines[i]) === wanted) {
        lines[i] = lines[i].replace(/^(\s*[-*]\s+(?:\[[ xX]\]\s+)?).*/, `$1${proposed.trim()}`)
        return lines
      }
    }
  }
  const at = appendIndex(lines, span)
  return [...lines.slice(0, at), `- ${proposed.trim()}`, ...lines.slice(at)]
}

function applyBlocker(lines: string[], current: string, proposed: string): string[] | null {
  const span = sectionSpan(lines, 'Blockers')
  if (!span) return null
  // Empty `proposed` clears the blocker named by `current`.
  if (proposed.trim() === '') {
    const wanted = current.trim()
    for (let i = span.start + 1; i < span.end; i++) {
      if (isBullet(lines[i]) && bulletText(lines[i]) === wanted) {
        return [...lines.slice(0, i), ...lines.slice(i + 1)]
      }
    }
    return null // nothing matched to clear
  }
  const at = appendIndex(lines, span)
  return [...lines.slice(0, at), `- ${proposed.trim()}`, ...lines.slice(at)]
}

export function applyProposal(
  markdown: string,
  proposal: StateUpdateProposal,
  today: string,
): ApplyResult {
  // Clobber guard: refuse if the file moved since the proposal was drafted.
  if (fileUpdatedDate(markdown) !== (proposal.stateUpdatedAt ?? null)) {
    return { ok: false, reason: 'stale' }
  }

  let result: string | null
  if (proposal.field === 'status') {
    result = applyStatus(markdown, proposal.proposed)
  } else {
    const lines = markdown.split('\n')
    const next =
      proposal.field === 'current_status'
        ? prependCurrentStatus(lines, proposal.proposed, today)
        : proposal.field === 'next_step'
          ? applyNextStep(lines, proposal.current, proposal.proposed)
          : applyBlocker(lines, proposal.current, proposal.proposed)
    result = next ? next.join('\n') : null
  }

  if (result === null) return { ok: false, reason: 'field-not-found' }
  return { ok: true, markdown: bumpUpdated(result, today) }
}
