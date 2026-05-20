import { describe, it, expect } from 'vitest'
import path from 'path'

import { runChatLoad, runChatMessage } from '@/lib/skills/chat'

const FAKE_CHAT = path.resolve(__dirname, '../../fixtures/fake-claude-chat.sh')

describe('runChatLoad', () => {
  it('captures session_id from stream-json + aggregates assistant text', async () => {
    const result = await runChatLoad({
      claudeBin: FAKE_CHAT,
      brief: '# Inside Out Iowa\n\nTest brief.',
      projectLabel: 'Inside Out — Website redesign',
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.sessionId).toBe('sess_loaded_xyz')
    expect(result.output).toContain('Loaded')
    expect(result.output).toContain('Project context attached')
  })

  it('returns failed status on subprocess error', async () => {
    const result = await runChatLoad({
      claudeBin: FAKE_CHAT,
      brief: '# X\n\nTest brief.',
      projectLabel: 'X',
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.sessionId).toBeNull()
  })
})

describe('runChatMessage', () => {
  it('uses --resume to continue a session + streams the reply', async () => {
    const result = await runChatMessage({
      claudeBin: FAKE_CHAT,
      sessionId: 'sess_existing_001',
      message: 'what is the latest?',
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('success')
    expect(result.output).toContain('Got it')
    expect(result.output).toContain('reply')
  })
})
