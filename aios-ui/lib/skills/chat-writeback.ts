// aios-ui/lib/skills/chat-writeback.ts
//
// Phase 04 — bidirectional hub (Plan 08, HUB-05 + HUB-06): markdown body
// builders for the two chat write-back surfaces.
//
//  - buildChatDecisionMarkdown: per-message "Drop to raw" payload. Captures
//    the prior user turn + the AI's reply under '## User' / '## Assistant'.
//  - buildChatSessionMarkdown:  full-transcript drop on chat-session close.
//    Each message becomes a '### User' / '### Assistant' block under a single
//    '## Transcript' heading.
//
// Both shapes are read by the /llm-wiki ingest pass (04-09); changing them
// requires a coordinated update to that skill.

/**
 * Phase 04 review WR-03: YAML-safe scalar formatter for frontmatter values.
 *
 * Returns the input as a plain unquoted scalar when it's safe (the common
 * case — no YAML metacharacters), and as a double-quoted escaped scalar when
 * the value contains characters that would otherwise break frontmatter
 * parsing (colon followed by space, leading dash/colon/quote/etc., embedded
 * newlines). This preserves test fixtures and existing wiki files that
 * already have unquoted values like `project: Wild Rose Casino — Site
 * relaunch`, while defending against future projectLabel/sessionId values
 * that contain risky characters.
 *
 * Risky characters (per YAML 1.2 spec subset we care about):
 *  - ":" followed by space or end-of-string → starts a new mapping
 *  - leading "-", "?", ":", "[", "]", "{", "}", ",", "#", "&", "*", "!",
 *    "|", ">", "'", '"', "%", "@", "`" → indicator chars at start
 *  - "\n", "\r", "\t" → control chars
 *  - leading or trailing whitespace
 */
function yamlScalar(value: string): string {
  const needsQuoting =
    value.length === 0 ||
    /:\s|:$/.test(value) ||
    /[\n\r\t]/.test(value) ||
    /^[-?:[\]{},#&*!|>'"%@`]/.test(value) ||
    /^\s|\s$/.test(value)
  if (!needsQuoting) return value
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  return `"${escaped}"`
}

export function buildChatDecisionMarkdown(args: {
  projectLabel: string
  userTurn: string
  assistantTurn: string
  dropAt: Date
}): string {
  return [
    '---',
    `project: ${yamlScalar(args.projectLabel)}`,
    `dropped_at: ${args.dropAt.toISOString()}`,
    'kind: chat-decision',
    '---',
    '',
    '## User',
    args.userTurn.trim(),
    '',
    '## Assistant',
    args.assistantTurn.trim(),
    '',
  ].join('\n')
}

export function buildChatSessionMarkdown(args: {
  projectLabel: string
  sessionId: string
  startedAt: string
  closedAt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}): string {
  const transcript = args.messages
    .map(m => {
      const heading = m.role === 'user' ? '### User' : '### Assistant'
      return `${heading}\n\n${m.content.trim()}\n`
    })
    .join('\n')
  return [
    '---',
    `project: ${yamlScalar(args.projectLabel)}`,
    `session_id: ${yamlScalar(args.sessionId)}`,
    `started_at: ${yamlScalar(args.startedAt)}`,
    `closed_at: ${yamlScalar(args.closedAt)}`,
    'kind: chat-session',
    '---',
    '',
    '## Transcript',
    '',
    transcript,
  ].join('\n')
}
