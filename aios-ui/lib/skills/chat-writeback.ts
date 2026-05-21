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

export function buildChatDecisionMarkdown(args: {
  projectLabel: string
  userTurn: string
  assistantTurn: string
  dropAt: Date
}): string {
  return [
    '---',
    `project: ${args.projectLabel}`,
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
    `project: ${args.projectLabel}`,
    `session_id: ${args.sessionId}`,
    `started_at: ${args.startedAt}`,
    `closed_at: ${args.closedAt}`,
    'kind: chat-session',
    '---',
    '',
    '## Transcript',
    '',
    transcript,
  ].join('\n')
}
