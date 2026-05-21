import { describe, it, expect } from 'vitest'
import path from 'path'

import { extractTodosEnvelope, runDailyIngest } from '@/lib/skills/daily-ingest'

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

describe('extractTodosEnvelope', () => {
  it('returns null when no envelope is present (markdown-only output)', () => {
    const out = '# Inbox Triage — today\n\nNothing urgent. Inbox clean.'
    expect(extractTodosEnvelope(out)).toBeNull()
  })

  it('parses a well-formed envelope appended to markdown', () => {
    const out = `# Inbox Triage — 2026-05-20

## Reply today
1. **Scott** (insideoutiowa.org) — *9*
   Subject: AR for May
   Last inbound: 4 days ago
   Project context: Content wrap by Fri 5/15.
   Suggested next step: Send AR email draft.
   Thread: 18f1234567890abc

<!-- TODOS_JSON_START -->
\`\`\`json
{
  "generated_at": "2026-05-20T08:00:00Z",
  "todos": [
    {
      "id": "todo-abc12345",
      "type": "email_reply",
      "summary": "Reply to Scott re: AR for May",
      "context": "Content wrap by Fri 5/15.",
      "thread_id": "18f1234567890abc",
      "client_slug": "inside-out",
      "project_slug": "inside-out-website",
      "suggested_action": "draft_reply",
      "action_params": { "thread_id": "18f1234567890abc" },
      "status": "open"
    }
  ]
}
\`\`\`
<!-- TODOS_JSON_END -->`
    const env = extractTodosEnvelope(out)
    expect(env).not.toBeNull()
    expect(env!.generatedAt).toBe('2026-05-20T08:00:00Z')
    expect(env!.todos).toHaveLength(1)
    expect(env!.todos[0].id).toBe('todo-abc12345')
    expect(env!.todos[0].type).toBe('email_reply')
    expect(env!.todos[0].client_slug).toBe('inside-out')
    expect(env!.todos[0].status).toBe('open')
  })

  it('parses an empty-todos envelope (clean inbox case)', () => {
    const out = `# Inbox Triage\n\nInbox is clean.\n
<!-- TODOS_JSON_START -->
\`\`\`json
{ "generated_at": "2026-05-20T08:00:00Z", "todos": [] }
\`\`\`
<!-- TODOS_JSON_END -->`
    const env = extractTodosEnvelope(out)
    expect(env).not.toBeNull()
    expect(env!.todos).toEqual([])
  })

  it('returns null for malformed JSON inside the envelope', () => {
    const out = `markdown
<!-- TODOS_JSON_START -->
\`\`\`json
{ "todos": [ { "id": "a", "summary": ]
\`\`\`
<!-- TODOS_JSON_END -->`
    expect(extractTodosEnvelope(out)).toBeNull()
  })

  it('coerces unknown type to generic and unknown status to open', () => {
    const out = `markdown
<!-- TODOS_JSON_START -->
\`\`\`json
{
  "generated_at": "2026-05-20T08:00:00Z",
  "todos": [
    { "id": "t1", "type": "weird", "summary": "Do thing", "status": "alien" }
  ]
}
\`\`\`
<!-- TODOS_JSON_END -->`
    const env = extractTodosEnvelope(out)
    expect(env).not.toBeNull()
    expect(env!.todos[0].type).toBe('generic')
    expect(env!.todos[0].status).toBe('open')
  })

  it('drops todo entries with no summary string', () => {
    const out = `markdown
<!-- TODOS_JSON_START -->
\`\`\`json
{
  "generated_at": "2026-05-20T08:00:00Z",
  "todos": [
    { "id": "t1", "type": "email_reply", "summary": "" },
    { "id": "t2", "type": "email_reply", "summary": "Good one" }
  ]
}
\`\`\`
<!-- TODOS_JSON_END -->`
    const env = extractTodosEnvelope(out)
    expect(env).not.toBeNull()
    expect(env!.todos).toHaveLength(1)
    expect(env!.todos[0].id).toBe('t2')
  })
})
