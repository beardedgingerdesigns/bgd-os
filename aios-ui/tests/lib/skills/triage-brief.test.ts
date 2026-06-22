import { describe, it, expect } from 'vitest'
import { buildDraftReplyPrompt, parseTriageBrief } from '@/lib/skills/triage-brief'

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

const CARD_BRIEF = `# Inbox Triage — 2026-06-21

**1 thread needs reply.**

## Reply today
1. **Meghan Wymore** (wildrosecorporate.com) — *8*
   Subject: Wild Rose Web
   Last inbound: 2 days ago
   What they said: Go-live is moving to Monday July 13. She has backend questions and wants a call next week.
   Project context: Wild Rose $1,000/mo. Servd billing FAILED — site offline June 23.
   Suggested next step: Confirm July 13, offer call times, address Servd billing.
   Thread: 19ee011cb1ffea52
`

describe('parseTriageBrief — multi-line reply card', () => {
  const thread = parseTriageBrief(CARD_BRIEF).sections[0].threads[0]

  it('extracts the message summary and status implication as separate fields', () => {
    expect(thread.summary).toContain('Go-live is moving to Monday July 13')
    expect(thread.statusNote).toContain('Servd billing FAILED')
    expect(thread.nextStep).toContain('Confirm July 13')
    expect(thread.subject).toBe('Wild Rose Web')
  })

  it('pulls thread id and days-waiting from the sub-lines', () => {
    expect(thread.threadId).toBe('19ee011cb1ffea52')
    expect(thread.daysWaiting).toBe(2)
  })

  it('never leaks the `(domain) — *score*` heading tail into context', () => {
    expect(thread.context).not.toContain('*8*')
    expect(thread.context).not.toContain('wildrosecorporate.com')
  })

  it('builds a draft-reply prompt from the parsed card', () => {
    const prompt = buildDraftReplyPrompt(thread)
    expect(prompt).toContain('Draft a reply to Meghan Wymore')
    expect(prompt).toContain('Wild Rose Web') // subject
    expect(prompt).toContain('19ee011cb1ffea52') // thread id for the draft target
    expect(prompt).toContain('draft only') // never auto-send
  })
})
