import { describe, it, expect } from 'vitest'
import path from 'path'

import { runDailyIngest } from '@/lib/skills/daily-ingest'

const FAKE_CLAUDE = path.resolve(__dirname, '../../fixtures/fake-claude.sh')

describe('runDailyIngest', () => {
  it('captures stdout, exit code, and duration on success', async () => {
    const result = await runDailyIngest({
      claudeBin: FAKE_CLAUDE,
      args: [],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.exitCode).toBe(0)
    expect(result.output).toContain('Inbox Triage')
    expect(result.durationMs).toBeGreaterThan(0)
  })

  it('returns failed status when subprocess exits non-zero', async () => {
    const result = await runDailyIngest({
      claudeBin: FAKE_CLAUDE,
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).toBe(2)
    expect(result.error).toContain('simulated failure')
  })

  it('returns timeout status when subprocess exceeds timeoutMs', async () => {
    const result = await runDailyIngest({
      claudeBin: FAKE_CLAUDE,
      args: ['--slow'],
      timeoutMs: 500,
    })
    expect(result.status).toBe('timeout')
  })
})
