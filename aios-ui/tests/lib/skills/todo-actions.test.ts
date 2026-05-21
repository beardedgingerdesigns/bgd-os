import { describe, it, expect } from 'vitest'
import path from 'path'

import { buildActionPrompt, runTodoAction } from '@/lib/skills/todo-actions'
import type { Todo } from '@/lib/types'

const FAKE_CLAUDE = path.resolve(__dirname, '../../fixtures/fake-claude.sh')

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 'todo-x',
    type: 'email_reply',
    summary: 'Reply to Scott re: AR for May',
    context: 'Inside Out — content wrap by Fri 5/15.',
    thread_id: '18f1234567890abc',
    client_slug: 'inside-out',
    project_slug: 'inside-out-website',
    suggested_action: 'draft_reply',
    action_params: { thread_id: '18f1234567890abc' },
    status: 'open',
    ...overrides,
  }
}

describe('buildActionPrompt', () => {
  it('draft_reply includes thread id, voice ref, and draft-only rule', () => {
    const p = buildActionPrompt(makeTodo({}))
    expect(p).toContain('18f1234567890abc')
    expect(p).toContain('references/voice.md')
    expect(p).toMatch(/draft-only|never send/i)
    expect(p).toContain('inside-out/inside-out-website')
  })

  it('draft_reply falls back to action_params thread_id when top-level missing', () => {
    const todo = makeTodo({ thread_id: undefined, action_params: { thread_id: 'abc123' } })
    const p = buildActionPrompt(todo)
    expect(p).toContain('abc123')
  })

  it('log_decision invokes the /gsd-capture slash command verbatim', () => {
    const p = buildActionPrompt(
      makeTodo({ type: 'decision_log', suggested_action: 'log_decision', summary: 'Locked Pelcro pricing' }),
    )
    expect(p.startsWith('/gsd-capture ')).toBe(true)
    expect(p).toContain('Locked Pelcro pricing')
  })

  it('calendar_check pulls today + tomorrow from Google Calendar MCP', () => {
    const p = buildActionPrompt(
      makeTodo({ type: 'calendar_check', suggested_action: 'calendar_check' }),
    )
    expect(p).toContain('mcp__claude_ai_Google_Calendar__list_events')
    expect(p).toMatch(/today/i)
  })

  it('generic prompt embeds summary + context', () => {
    const p = buildActionPrompt(
      makeTodo({ type: 'generic', suggested_action: 'generic', summary: 'Do thing X' }),
    )
    expect(p).toContain('Do thing X')
    expect(p).toContain('Inside Out')
  })

  it('falls back to type-derived action when suggested_action is missing', () => {
    const p = buildActionPrompt(
      makeTodo({ suggested_action: '', type: 'email_reply' }),
    )
    expect(p).toContain('18f1234567890abc') // proves draft_reply branch
  })

  it('omits client/project line when client_slug is missing', () => {
    const p = buildActionPrompt(
      makeTodo({ client_slug: undefined, project_slug: undefined, suggested_action: 'generic', type: 'generic' }),
    )
    expect(p).not.toContain('Project: ')
  })
})

describe('runTodoAction', () => {
  it('captures stdout, exit code, and duration on success', async () => {
    const result = await runTodoAction({
      todo: makeTodo({}),
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
    const result = await runTodoAction({
      todo: makeTodo({}),
      claudeBin: FAKE_CLAUDE,
      args: ['--fail'],
      timeoutMs: 10_000,
    })
    expect(result.status).toBe('failed')
    expect(result.exitCode).toBe(2)
    expect(result.error).toContain('simulated failure')
  })

  it('returns timeout status when subprocess exceeds timeoutMs', async () => {
    const result = await runTodoAction({
      todo: makeTodo({}),
      claudeBin: FAKE_CLAUDE,
      args: ['--slow'],
      timeoutMs: 500,
    })
    expect(result.status).toBe('timeout')
  })
})
