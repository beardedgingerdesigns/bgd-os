import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import {
  findTodo,
  mutateTodo,
  readTodosCache,
  todosCachePath,
  writeTodosCache,
} from '@/lib/cache/todos'
import type { Todo, TodosCacheEntry } from '@/lib/types'

describe('todos cache', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-todos-cache-'))
    process.env.AIOS_CACHE_DIR = tmpDir
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('returns null when no cache exists', async () => {
    const result = await readTodosCache()
    expect(result).toBeNull()
  })

  it('round-trips a cache entry via atomic temp+rename', async () => {
    const entry: TodosCacheEntry = {
      generatedAt: '2026-05-20T08:00:00Z',
      todos: [
        {
          id: 'todo-abc12345',
          type: 'email_reply',
          summary: 'Reply to Scott re: AR email',
          context: 'Inside Out website — content wrap by Fri.',
          thread_id: '18f1234567890abc',
          client_slug: 'inside-out',
          project_slug: 'inside-out-website',
          suggested_action: 'draft_reply',
          action_params: { thread_id: '18f1234567890abc' },
          status: 'open',
        },
      ],
    }
    await writeTodosCache(entry)
    const got = await readTodosCache()
    expect(got).toEqual(entry)
  })

  it('todosCachePath honors AIOS_CACHE_DIR', () => {
    expect(todosCachePath()).toBe(path.join(tmpDir, 'todos-today.json'))
  })

  it('leaves no temp files after a successful write', async () => {
    await writeTodosCache({ generatedAt: '2026-05-20T08:00:00Z', todos: [] })
    const entries = await fs.readdir(tmpDir)
    expect(entries.filter(e => e.endsWith('.tmp'))).toHaveLength(0)
    expect(entries).toContain('todos-today.json')
  })
})

describe('mutateTodo + findTodo', () => {
  let tmpDir: string
  const seed: TodosCacheEntry = {
    generatedAt: '2026-05-20T08:00:00Z',
    todos: [
      makeTodo('todo-a', 'Reply to Scott', 'open'),
      makeTodo('todo-b', 'Reply to Deann', 'open'),
    ],
  }

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-todos-mutate-'))
    process.env.AIOS_CACHE_DIR = tmpDir
    await writeTodosCache(seed)
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
    delete process.env.AIOS_CACHE_DIR
  })

  it('mutates the targeted todo and leaves siblings untouched', async () => {
    const result = await mutateTodo('todo-a', 'done')
    expect(result).toEqual({ ok: true, todo: { ...seed.todos[0], status: 'done' } })
    const after = await readTodosCache()
    expect(after?.todos.find(t => t.id === 'todo-a')?.status).toBe('done')
    expect(after?.todos.find(t => t.id === 'todo-b')?.status).toBe('open')
  })

  it('returns not-found when the id does not exist', async () => {
    const result = await mutateTodo('todo-missing', 'done')
    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })

  it('returns no-cache when no cache file exists', async () => {
    await fs.rm(todosCachePath())
    const result = await mutateTodo('todo-a', 'done')
    expect(result).toEqual({ ok: false, reason: 'no-cache' })
  })

  it('findTodo returns the matching todo', async () => {
    const got = await findTodo('todo-b')
    expect(got?.summary).toBe('Reply to Deann')
  })

  it('findTodo returns null on miss', async () => {
    expect(await findTodo('nope')).toBeNull()
  })
})

function makeTodo(id: string, summary: string, status: Todo['status']): Todo {
  return {
    id,
    type: 'email_reply',
    summary,
    suggested_action: 'draft_reply',
    status,
  }
}
