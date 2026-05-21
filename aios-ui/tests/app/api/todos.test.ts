import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import { POST } from '@/app/api/todos/[id]/route'
import { readTodosCache, writeTodosCache } from '@/lib/cache/todos'
import type { Todo, TodosCacheEntry } from '@/lib/types'

function makeTodo(id: string, status: Todo['status'] = 'open'): Todo {
  return {
    id,
    type: 'email_reply',
    summary: `Todo ${id}`,
    suggested_action: 'draft_reply',
    status,
  }
}

function asParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('POST /api/todos/[id]', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-todos-route-'))
    process.env.AIOS_CACHE_DIR = tmpDir
    const seed: TodosCacheEntry = {
      generatedAt: '2026-05-20T08:00:00Z',
      todos: [makeTodo('todo-a'), makeTodo('todo-b')],
    }
    await writeTodosCache(seed)
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('marks a todo done and persists to the cache file', async () => {
    const req = new Request('http://test/api/todos/todo-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'done' }),
    })
    const res = await POST(req, asParams('todo-a'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.todo.status).toBe('done')

    const after = await readTodosCache()
    expect(after?.todos.find(t => t.id === 'todo-a')?.status).toBe('done')
    expect(after?.todos.find(t => t.id === 'todo-b')?.status).toBe('open')
  })

  it('dismiss maps to dismissed status', async () => {
    const req = new Request('http://test/api/todos/todo-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss' }),
    })
    const res = await POST(req, asParams('todo-a'))
    expect(res.status).toBe(200)
    const after = await readTodosCache()
    expect(after?.todos.find(t => t.id === 'todo-a')?.status).toBe('dismissed')
  })

  it('reopen maps to open status', async () => {
    await writeTodosCache({
      generatedAt: '2026-05-20T08:00:00Z',
      todos: [makeTodo('todo-a', 'done')],
    })
    const req = new Request('http://test/api/todos/todo-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reopen' }),
    })
    const res = await POST(req, asParams('todo-a'))
    expect(res.status).toBe(200)
    const after = await readTodosCache()
    expect(after?.todos.find(t => t.id === 'todo-a')?.status).toBe('open')
  })

  it('rejects an unknown action', async () => {
    const req = new Request('http://test/api/todos/todo-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'explode' }),
    })
    const res = await POST(req, asParams('todo-a'))
    expect(res.status).toBe(400)
  })

  it('returns 404 when the todo id is missing from the cache', async () => {
    const req = new Request('http://test/api/todos/ghost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'done' }),
    })
    const res = await POST(req, asParams('ghost'))
    expect(res.status).toBe(404)
  })

  it('rejects malformed JSON body', async () => {
    const req = new Request('http://test/api/todos/todo-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req, asParams('todo-a'))
    expect(res.status).toBe(400)
  })
})
