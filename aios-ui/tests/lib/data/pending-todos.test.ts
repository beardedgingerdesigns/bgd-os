import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import type { PendingTodo } from '@/lib/types'

// Re-import fresh per test so paths.ts resolves CLAUDE_OS_ROOT to the temp dir
// at module-load time (constants are captured at import).

const SEED_PENDING = `# To-Do List

Items persist until explicitly completed.

## Format rules

- Each item starts with a checkbox

## Pending

- [ ] **Revive scheduled-triage** \`#ops\`
  - Added: 2026-06-12
  - Source: manual
  - Priority: high
  - Notes: zero runs since 6/8.

- [ ] **Review BrandOS dealer migration status** \`#review\`
  - Added: 2026-06-04
  - Source: manual
  - Client: terraplex / terraplex-hub
  - Priority: medium
  - Notes: New Heights still on Base 44.

- [ ] **Graduate voice.md into a taste library** \`#ops\`
  - Added: 2026-06-15
  - Source: skill:wiki
  - Priority: low

- [ ] **Item with no metadata at all**

- [x] **Already done item should be ignored** \`#ops\`
  - Added: 2026-06-01
  - Priority: high
`

const SEED_COMPLETED = `# Completed Items

Archive for items moved from \`pending.md\` when marked \`[x]\`.

## Completed

- [x] **An older completed thing** \`#ops\`
  - Added: 2026-05-01
`

interface Mod {
  loadPendingTodos: typeof import('@/lib/data/pending-todos').loadPendingTodos
  resolvePendingTodo: typeof import('@/lib/data/pending-todos').resolvePendingTodo
}

async function loadMod(): Promise<Mod> {
  vi.resetModules()
  return (await import('@/lib/data/pending-todos')) as unknown as Mod
}

describe('pending-todos data layer', () => {
  let tmpRoot: string
  let pendingPath: string
  let completedPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-pending-todos-'))
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

  it('parses only unchecked items under ## Pending', async () => {
    const { loadPendingTodos } = await loadMod()
    const todos = await loadPendingTodos()
    const summaries = todos.map(t => t.summary)
    expect(summaries).toContain('Revive scheduled-triage')
    expect(summaries).toContain('Item with no metadata at all')
    expect(summaries).not.toContain('Already done item should be ignored')
    // Header/format-rules bullets must never be parsed as todos.
    expect(summaries).not.toContain('Each item starts with a checkbox')
    expect(todos.length).toBe(4)
  })

  it('extracts metadata, hashtag, and defaults priority to medium', async () => {
    const { loadPendingTodos } = await loadMod()
    const todos = await loadPendingTodos()
    const byId = (s: string) => todos.find(t => t.summary === s) as PendingTodo

    const triage = byId('Revive scheduled-triage')
    expect(triage.priority).toBe('high')
    expect(triage.hashtag).toBe('ops')
    expect(triage.source).toBe('manual')
    expect(triage.added).toBe('2026-06-12')
    expect(triage.notes).toBe('zero runs since 6/8.')

    const brandos = byId('Review BrandOS dealer migration status')
    expect(brandos.client).toBe('terraplex / terraplex-hub')
    expect(brandos.priority).toBe('medium')

    const bare = byId('Item with no metadata at all')
    expect(bare.priority).toBe('medium')
    expect(bare.source).toBeUndefined()
    expect(bare.added).toBeUndefined()
  })

  it('assigns stable ids across reloads', async () => {
    const { loadPendingTodos } = await loadMod()
    const a = await loadPendingTodos()
    const b = await loadPendingTodos()
    expect(a.map(t => t.id)).toEqual(b.map(t => t.id))
    expect(new Set(a.map(t => t.id)).size).toBe(a.length)
  })

  it('dismiss removes the item from pending.md and does not touch completed.md', async () => {
    const { loadPendingTodos, resolvePendingTodo } = await loadMod()
    const before = await loadPendingTodos()
    const target = before.find(t => t.summary === 'Graduate voice.md into a taste library')!
    const result = await resolvePendingTodo(target.id, 'dismiss')
    expect(result.ok).toBe(true)

    const after = await loadPendingTodos()
    expect(after.map(t => t.summary)).not.toContain('Graduate voice.md into a taste library')
    expect(after.length).toBe(before.length - 1)

    const completed = await fs.readFile(completedPath, 'utf-8')
    expect(completed).not.toContain('Graduate voice.md')
    // Untouched items survive.
    expect(after.map(t => t.summary)).toContain('Revive scheduled-triage')
  })

  it('done removes from pending and prepends a checked block to completed.md', async () => {
    const { loadPendingTodos, resolvePendingTodo } = await loadMod()
    const before = await loadPendingTodos()
    const target = before.find(t => t.summary === 'Revive scheduled-triage')!
    const result = await resolvePendingTodo(target.id, 'done')
    expect(result.ok).toBe(true)

    const after = await loadPendingTodos()
    expect(after.map(t => t.summary)).not.toContain('Revive scheduled-triage')

    const completed = await fs.readFile(completedPath, 'utf-8')
    expect(completed).toContain('- [x] **Revive scheduled-triage**')
    // Prepended above the pre-existing completed entry.
    const newIdx = completed.indexOf('Revive scheduled-triage')
    const oldIdx = completed.indexOf('An older completed thing')
    expect(newIdx).toBeLessThan(oldIdx)
    // Header survives.
    expect(completed.startsWith('# Completed Items')).toBe(true)
  })

  it('returns not-found for an unknown id', async () => {
    const { resolvePendingTodo } = await loadMod()
    const result = await resolvePendingTodo('deadbeef', 'done')
    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })

  it('creates completed.md when it does not exist', async () => {
    const { loadPendingTodos, resolvePendingTodo } = await loadMod()
    await fs.rm(completedPath)
    const before = await loadPendingTodos()
    const target = before[0]
    await resolvePendingTodo(target.id, 'done')
    const completed = await fs.readFile(completedPath, 'utf-8')
    expect(completed).toContain('## Completed')
    expect(completed).toContain(`- [x] **${target.summary}**`)
  })

  it('leaves no temp files after a mutation', async () => {
    const { loadPendingTodos, resolvePendingTodo } = await loadMod()
    const before = await loadPendingTodos()
    await resolvePendingTodo(before[0].id, 'done')
    const entries = await fs.readdir(path.join(tmpRoot, 'todos'))
    expect(entries.filter(e => e.endsWith('.tmp'))).toHaveLength(0)
  })
})
