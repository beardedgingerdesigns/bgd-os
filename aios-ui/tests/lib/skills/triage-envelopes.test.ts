import { describe, it, expect } from 'vitest'
import { stripTriageEnvelopes } from '@/lib/skills/triage-envelopes'

const todos = (body: string) => `<!-- TODOS_JSON_START -->${body}<!-- TODOS_JSON_END -->`
const state = (body: string) => `<!-- STATE_UPDATES_JSON_START -->${body}<!-- STATE_UPDATES_JSON_END -->`

describe('stripTriageEnvelopes', () => {
  it('strips a TODOS_JSON envelope', () => {
    expect(stripTriageEnvelopes(`a ${todos('x')} b`)).toBe('a b')
  })

  it('strips a STATE_UPDATES_JSON envelope', () => {
    expect(stripTriageEnvelopes(`a ${state('x')} b`)).toBe('a b')
  })

  it('strips both envelopes and keeps the prose between them', () => {
    const out = stripTriageEnvelopes(`a ${todos('1')} mid ${state('2')} z`)
    expect(out).not.toContain('TODOS_JSON')
    expect(out).not.toContain('STATE_UPDATES_JSON')
    expect(out).toContain('mid')
  })

  it('per-type pairing: an orphan TODOS_START does not swallow prose up to a STATE_END', () => {
    // A cross-type alternation regex would match TODOS_START..STATE_END and delete
    // "KEEP". Per-type pairing leaves the orphan marker but spares the prose.
    const out = stripTriageEnvelopes(`before <!-- TODOS_JSON_START --> KEEP ${state('json')} after`)
    expect(out).toContain('KEEP') // prose preserved
    expect(out).not.toContain('STATE_UPDATES_JSON') // well-formed STATE envelope still stripped
  })

  it('leaves text with no envelopes unchanged', () => {
    expect(stripTriageEnvelopes('plain text, no markers')).toBe('plain text, no markers')
  })
})
