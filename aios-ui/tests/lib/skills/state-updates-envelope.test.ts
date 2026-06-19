import { describe, it, expect } from 'vitest'
import { extractStateUpdatesEnvelope } from '@/lib/skills/state-updates-envelope'

function envelope(json: string): string {
  return `Some brief prose.\n\n<!-- STATE_UPDATES_JSON_START -->\n\`\`\`json\n${json}\n\`\`\`\n<!-- STATE_UPDATES_JSON_END -->\n`
}

const oneProposal = {
  generated_at: '2026-06-19T16:00:00Z',
  proposals: [
    {
      slug: 'wild-rose-redesign',
      field: 'current_status',
      current: '(not yet tracked)',
      proposed: 'Go-live moved July 1 to July 13',
      evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
      confidence: 'high',
      stateUpdatedAt: '2026-06-09',
    },
  ],
}

describe('extractStateUpdatesEnvelope', () => {
  it('parses a valid envelope with one proposal', () => {
    const result = extractStateUpdatesEnvelope(envelope(JSON.stringify(oneProposal)))
    expect(result).not.toBeNull()
    expect(result!.proposals).toHaveLength(1)
    const p = result!.proposals[0]
    expect(p.slug).toBe('wild-rose-redesign')
    expect(p.field).toBe('current_status')
    expect(p.proposed).toBe('Go-live moved July 1 to July 13')
    expect(p.confidence).toBe('high')
    expect(p.stateUpdatedAt).toBe('2026-06-09')
    expect(p.evidence.threadId).toBe('t1')
    expect(result!.generatedAt).toBe('2026-06-19T16:00:00Z')
  })

  it('returns all proposals in order', () => {
    const two = {
      proposals: [
        { slug: 'a', field: 'status', proposed: 'On hold' },
        { slug: 'b', field: 'blocker', proposed: 'Waiting on domain transfer' },
      ],
    }
    const result = extractStateUpdatesEnvelope(envelope(JSON.stringify(two)))
    expect(result!.proposals.map(p => p.slug)).toEqual(['a', 'b'])
  })

  it('returns an empty array for "proposals": []', () => {
    const result = extractStateUpdatesEnvelope(envelope(JSON.stringify({ proposals: [] })))
    expect(result).not.toBeNull()
    expect(result!.proposals).toEqual([])
  })

  it('defaults current to "", confidence to low, evidence fields to null/""', () => {
    const minimal = { proposals: [{ slug: 'x', field: 'next_step', proposed: 'Ship it' }] }
    const p = extractStateUpdatesEnvelope(envelope(JSON.stringify(minimal)))!.proposals[0]
    expect(p.current).toBe('')
    expect(p.confidence).toBe('low')
    expect(p.evidence).toEqual({ source: 'triage', threadId: null, sender: null, date: '' })
    expect(p.stateUpdatedAt).toBeNull()
  })

  it('drops proposals missing slug or proposed, or with an invalid field', () => {
    const mixed = {
      proposals: [
        { slug: 'ok', field: 'status', proposed: 'Live' },
        { field: 'status', proposed: 'no slug' },
        { slug: 'noproposed', field: 'status' },
        { slug: 'badfield', field: 'launch_date', proposed: 'x' },
      ],
    }
    const result = extractStateUpdatesEnvelope(envelope(JSON.stringify(mixed)))
    expect(result!.proposals).toHaveLength(1)
    expect(result!.proposals[0].slug).toBe('ok')
  })

  it('returns null when markers are absent', () => {
    expect(extractStateUpdatesEnvelope('just a brief, no envelope')).toBeNull()
  })

  it('returns null when JSON inside the markers is malformed', () => {
    expect(extractStateUpdatesEnvelope(envelope('{ not valid json'))).toBeNull()
  })

  it('returns null when parsed JSON has no proposals array', () => {
    expect(extractStateUpdatesEnvelope(envelope(JSON.stringify({ generated_at: 'x' })))).toBeNull()
    expect(extractStateUpdatesEnvelope(envelope('"a string"'))).toBeNull()
  })
})
