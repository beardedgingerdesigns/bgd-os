import { describe, it, expect } from 'vitest'
import { parseTriageBrief } from '@/lib/skills/triage-brief'

const BRIEF = `# Inbox Triage — 2026-06-19

**1 thread needs reply.**

## Reply today

1. **Meghan Wymore** (wildrosecorporate.com)
   Subject: Launch date
   Thread: \`abc123\`
`

function todosEnvelope(): string {
  const json = JSON.stringify({ generated_at: 'x', todos: [] })
  return `\n\n<!-- TODOS_JSON_START -->\n\`\`\`json\n${json}\n\`\`\`\n<!-- TODOS_JSON_END -->\n`
}

function stateEnvelope(): string {
  const json = JSON.stringify({
    generated_at: 'x',
    proposals: [{ slug: 'wild-rose-redesign', field: 'current_status', proposed: 'Go-live July 13' }],
  })
  return `\n\n<!-- STATE_UPDATES_JSON_START -->\n\`\`\`json\n${json}\n\`\`\`\n<!-- STATE_UPDATES_JSON_END -->\n`
}

describe('parseTriageBrief — envelope stripping (U5)', () => {
  it('strips the STATE_UPDATES_JSON envelope before prose parsing', () => {
    const s = JSON.stringify(parseTriageBrief(BRIEF + stateEnvelope()))
    expect(s).not.toContain('STATE_UPDATES_JSON')
    expect(s).not.toContain('Go-live July 13')
    expect(s).not.toContain('proposed')
    expect(s).toContain('Meghan Wymore') // real content survives
  })

  it('strips both TODOS_JSON and STATE_UPDATES_JSON envelopes', () => {
    const s = JSON.stringify(parseTriageBrief(BRIEF + todosEnvelope() + stateEnvelope()))
    expect(s).not.toContain('TODOS_JSON')
    expect(s).not.toContain('STATE_UPDATES_JSON')
    expect(s).toContain('Meghan Wymore')
  })

  it('leaves a brief with no envelope untouched', () => {
    expect(parseTriageBrief(BRIEF)).toEqual(parseTriageBrief(BRIEF + ''))
    expect(JSON.stringify(parseTriageBrief(BRIEF))).toContain('Meghan Wymore')
  })
})
