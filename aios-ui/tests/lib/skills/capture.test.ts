import { describe, it, expect } from 'vitest'
import path from 'path'

import { runCapture } from '@/lib/skills/capture'

const FAKE_CAPTURE = path.resolve(__dirname, '../../fixtures/fake-claude-capture.sh')

describe('runCapture', () => {
  it('streams text deltas and aggregates the assistant output', async () => {
    let streamed = ''
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'test capture content',
      projectLabel: 'Inside Out — Website redesign',
      timeoutMs: 10_000,
      onStdout: chunk => { streamed += chunk },
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Captured to memory')
    expect(result.output).toContain('feedback_capture_test')
    expect(streamed).toBe(result.output)
  })

  it('returns failed status on subprocess error', async () => {
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'x',
      projectLabel: 'x',
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).toBe(2)
    expect(result.error).toContain('simulated capture failure')
  })

  it('returns timeout status when subprocess exceeds the timeout', async () => {
    const result = await runCapture({
      claudeBin: FAKE_CAPTURE,
      text: 'x',
      projectLabel: 'x',
      args: ['--slow'],
      timeoutMs: 500,
    })
    expect(result.status).toBe('timeout')
  })
})
