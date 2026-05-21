import { describe, it, expect } from 'vitest'
import path from 'path'

import { fetchGmailContext } from '@/lib/skills/gmail-context'

const FAKE_GMAIL = path.resolve(__dirname, '../../fixtures/fake-claude-gmail.sh')

describe('fetchGmailContext', () => {
  it('aggregates text deltas from a successful subprocess into the returned string', async () => {
    const out = await fetchGmailContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      daysBack: 7,
      claudeBin: FAKE_GMAIL,
      timeoutMs: 10_000,
    })
    expect(out).toContain('Subject A')
    expect(out).toContain('meghan')
    // The fake fixture emits the Markdown table header too — confirms we
    // didn't strip useful content.
    expect(out).toContain('| Thread ID |')
    // Stream envelopes should never leak into the aggregated text.
    expect(out).not.toContain('stream_event')
    expect(out).not.toContain('hook_started')
  })

  it('degrades to empty string on non-zero subprocess exit', async () => {
    const out = await fetchGmailContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      claudeBin: FAKE_GMAIL,
      timeoutMs: 10_000,
      // Pass --fail via env (which the fixture honours) — the prompt string
      // is owned by gmail-context.ts and isn't forwarded as argv.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ envOverride: { GMAIL_FAKE_MODE: 'fail' } } as any),
    })
    expect(out).toBe('')
  })

  it('degrades to empty string when the subprocess exceeds timeoutMs', async () => {
    const start = Date.now()
    const out = await fetchGmailContext({
      projectName: 'Inside Out Website',
      contacts: ['meghan@example.com'],
      claudeBin: FAKE_GMAIL,
      timeoutMs: 200,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ envOverride: { GMAIL_FAKE_MODE: 'slow' } } as any),
    })
    expect(out).toBe('')
    expect(Date.now() - start).toBeLessThan(2_000)
  })

  it('still resolves when contacts list is empty (prompt uses placeholder)', async () => {
    const out = await fetchGmailContext({
      projectName: 'Inside Out Website',
      contacts: [],
      claudeBin: FAKE_GMAIL,
      timeoutMs: 10_000,
    })
    // Successful spawn — same fake output.
    expect(out).toContain('Subject A')
  })
})
