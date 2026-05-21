import { describe, it, expect } from 'vitest'

import {
  buildChatDecisionMarkdown,
  buildChatSessionMarkdown,
} from '@/lib/skills/chat-writeback'

describe('buildChatDecisionMarkdown', () => {
  it('produces frontmatter + both turn headings with trimmed content', () => {
    const dropAt = new Date('2026-05-21T15:30:00Z')
    const md = buildChatDecisionMarkdown({
      projectLabel: 'Wild Rose Casino — Site relaunch',
      userTurn: '  What is the launch date for Wild Rose?\n',
      assistantTurn: '\nLaunch is currently slipped to mid/late June 2026.  ',
      dropAt,
    })
    expect(md).toContain('---')
    expect(md).toContain('project: Wild Rose Casino — Site relaunch')
    expect(md).toContain('dropped_at: 2026-05-21T15:30:00.000Z')
    expect(md).toContain('kind: chat-decision')
    expect(md).toContain('## User')
    expect(md).toContain('## Assistant')
    expect(md).toContain('What is the launch date for Wild Rose?')
    expect(md).toContain('Launch is currently slipped to mid/late June 2026.')
    // Content should be trimmed in the output.
    expect(md).not.toContain('  What is the launch')
  })
})

describe('buildChatSessionMarkdown', () => {
  it('produces frontmatter + transcript heading + alternating role sub-headings', () => {
    const md = buildChatSessionMarkdown({
      projectLabel: 'Wild Rose Casino — Site relaunch',
      sessionId: 'sess_abc123',
      startedAt: '2026-05-21T15:00:00.000Z',
      closedAt: '2026-05-21T15:30:00.000Z',
      messages: [
        { role: 'user', content: 'Question one' },
        { role: 'assistant', content: 'Answer one' },
        { role: 'user', content: 'Question two' },
      ],
    })
    expect(md).toContain('project: Wild Rose Casino — Site relaunch')
    expect(md).toContain('session_id: sess_abc123')
    expect(md).toContain('started_at: 2026-05-21T15:00:00.000Z')
    expect(md).toContain('closed_at: 2026-05-21T15:30:00.000Z')
    expect(md).toContain('kind: chat-session')
    expect(md).toContain('## Transcript')
    expect(md).toContain('### User\n\nQuestion one')
    expect(md).toContain('### Assistant\n\nAnswer one')
    expect(md).toContain('### User\n\nQuestion two')
  })

  it('trims each message content', () => {
    const md = buildChatSessionMarkdown({
      projectLabel: 'p',
      sessionId: 's',
      startedAt: 'a',
      closedAt: 'b',
      messages: [{ role: 'user', content: '   hi there   ' }],
    })
    expect(md).toContain('### User\n\nhi there')
    expect(md).not.toContain('### User\n\n   hi there')
  })
})
