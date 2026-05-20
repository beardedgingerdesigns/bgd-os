import { describe, it, expect } from 'vitest'
import path from 'path'

import { runRitual } from '@/lib/skills/ritual'

const FAKE_RITUAL = path.resolve(__dirname, '../../fixtures/fake-claude-ritual.sh')

describe('runRitual', () => {
  it('maps "level-up" slug to /level-up command and streams output', async () => {
    let streamed = ''
    const result = await runRitual({
      slug: 'level-up',
      claudeBin: FAKE_RITUAL,
      timeoutMs: 10_000,
      onStdout: chunk => { streamed += chunk },
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Ran /level-up')
    expect(result.output).toContain('Ritual complete')
    expect(streamed).toBe(result.output)
  })

  it('maps "weekly-status" slug to /weekly-project-status', async () => {
    const result = await runRitual({
      slug: 'weekly-status',
      claudeBin: FAKE_RITUAL,
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Ran /weekly-project-status')
  })

  it('maps "audit" slug to /audit', async () => {
    const result = await runRitual({
      slug: 'audit',
      claudeBin: FAKE_RITUAL,
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Ran /audit')
  })

  it('returns failed status on subprocess error', async () => {
    const result = await runRitual({
      slug: 'level-up',
      claudeBin: FAKE_RITUAL,
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).toBe(2)
  })

  it('returns timeout status when subprocess exceeds timeout', async () => {
    const result = await runRitual({
      slug: 'level-up',
      claudeBin: FAKE_RITUAL,
      args: ['--slow'],
      timeoutMs: 500,
    })
    expect(result.status).toBe('timeout')
  })
})
