import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// paths.ts captures CLAUDE_OS_ROOT at module-load, and the route imports it
// transitively — re-import the route fresh per test after setting the env.

const SEED_PENDING = `# To-Do List

## Pending

- [ ] **First high item** \`#ops\`
  - Added: 2026-06-12
  - Source: manual
  - Priority: high

- [ ] **Second medium item** \`#client\`
  - Added: 2026-06-04
  - Source: triage
  - Client: terraplex-hub
  - Priority: medium
`

const SEED_COMPLETED = `# Completed Items

## Completed
`

interface RouteMod {
  POST: typeof import('@/app/api/pending-todos/[id]/route').POST
}
interface ListMod {
  GET: typeof import('@/app/api/pending-todos/route').GET
}
interface DataMod {
  loadPendingTodos: typeof import('@/lib/data/pending-todos').loadPendingTodos
}

async function loadRoute(): Promise<RouteMod & ListMod & DataMod> {
  vi.resetModules()
  const route = (await import('@/app/api/pending-todos/[id]/route')) as RouteMod
  const list = (await import('@/app/api/pending-todos/route')) as ListMod
  const data = (await import('@/lib/data/pending-todos')) as DataMod
  return { ...route, ...list, ...data }
}

function asParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('pending-todos API routes', () => {
  let tmpRoot: string
  let pendingPath: string
  let completedPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-pending-route-'))
    await fs.mkdir(path.join(tmpRoot, 'todos'), { recursive: true })
    pendingPath = path.join(tmpRoot, 'todos/pending.md')
    completedPath = path.join(tmpRoot, 'todos/completed.md')
    await fs.writeFile(pendingPath, SEED_PENDING, 'utf-8')
    await fs.writeFile(completedPath, SEED_COMPLETED, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  it('GET returns parsed todos', async () => {
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.todos).toHaveLength(2)
    expect(body.todos[0].summary).toBe('First high item')
    expect(body.todos[0].priority).toBe('high')
  })

  it('POST done removes from pending and writes to completed', async () => {
    const { GET, POST, loadPendingTodos } = await loadRoute()
    const listRes = await GET()
    const { todos } = await listRes.json()
    const target = todos.find((t: { summary: string }) => t.summary === 'First high item')

    const req = new Request(`http://test/api/pending-todos/${target.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'done' }),
    })
    const res = await POST(req, asParams(target.id))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    const remaining = await loadPendingTodos()
    expect(remaining.map(t => t.summary)).not.toContain('First high item')
    const completed = await fs.readFile(completedPath, 'utf-8')
    expect(completed).toContain('- [x] **First high item**')
  })

  it('POST dismiss removes without writing to completed', async () => {
    const { GET, POST, loadPendingTodos } = await loadRoute()
    const { todos } = await (await GET()).json()
    const target = todos.find((t: { summary: string }) => t.summary === 'Second medium item')

    const req = new Request(`http://test/api/pending-todos/${target.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss' }),
    })
    const res = await POST(req, asParams(target.id))
    expect(res.status).toBe(200)

    const remaining = await loadPendingTodos()
    expect(remaining.map(t => t.summary)).not.toContain('Second medium item')
    const completed = await fs.readFile(completedPath, 'utf-8')
    expect(completed).not.toContain('Second medium item')
  })

  it('rejects an unknown action with 400', async () => {
    const { GET, POST } = await loadRoute()
    const { todos } = await (await GET()).json()
    const req = new Request(`http://test/api/pending-todos/${todos[0].id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'explode' }),
    })
    const res = await POST(req, asParams(todos[0].id))
    expect(res.status).toBe(400)
  })

  it('returns 404 for an unknown id', async () => {
    const { POST } = await loadRoute()
    const req = new Request('http://test/api/pending-todos/ghost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'done' }),
    })
    const res = await POST(req, asParams('ghost'))
    expect(res.status).toBe(404)
  })

  it('rejects malformed JSON with 400', async () => {
    const { POST } = await loadRoute()
    const req = new Request('http://test/api/pending-todos/x', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req, asParams('x'))
    expect(res.status).toBe(400)
  })
})
