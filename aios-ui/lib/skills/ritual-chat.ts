import type { RitualSlug } from '@/lib/types'

const RITUAL_LABEL: Record<RitualSlug, string> = {
  'level-up': 'Level-up',
  'weekly-status': 'Weekly status',
  'audit': 'Audit',
}

interface SeedRitualChatOptions {
  ritual: RitualSlug
  report: string             // the raw ritual output we want to discuss
  firstMessage: string       // the user's first follow-up question
}

// Compose the seed prompt that starts a follow-up chat about a ritual report.
// We deliberately re-paste the full report into the prompt so the conversation
// session doesn't need access to any cache — `claude --print --resume` only
// keeps the message history, not server-side state. The seed:
//   1. Names the ritual so model context picks up the right rules from CLAUDE.md
//   2. Wraps the report in a single fenced block so the model treats it as one
//      artifact rather than a series of inline instructions
//   3. Appends the user's actual question last so the model knows what to do
//      with the artifact.
export function buildRitualChatSeed(opts: SeedRitualChatOptions): string {
  const label = RITUAL_LABEL[opts.ritual] ?? opts.ritual
  return [
    `I just ran the **${label}** ritual. Here is the full report:`,
    '',
    '```',
    opts.report.trim(),
    '```',
    '',
    `My follow-up: ${opts.firstMessage.trim()}`,
    '',
    'Stay scoped to this report — don\'t re-run the ritual, just answer using what\'s above plus any project memory you already have. Keep responses short unless I ask for depth.',
  ].join('\n')
}
