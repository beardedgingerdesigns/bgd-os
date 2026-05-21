import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import type { Todo, TodoStatus, TodosCacheEntry } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function todosCachePath(): string {
  return path.join(cacheDir(), 'todos-today.json')
}

export async function readTodosCache(): Promise<TodosCacheEntry | null> {
  try {
    const raw = await fs.readFile(todosCachePath(), 'utf-8')
    return JSON.parse(raw) as TodosCacheEntry
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

// Atomic write: serialize to a temp file in the same dir, fsync, then rename.
// Same-directory rename is atomic on POSIX, so readers never see a half-written file.
export async function writeTodosCache(entry: TodosCacheEntry): Promise<void> {
  const dir = cacheDir()
  await fs.mkdir(dir, { recursive: true })
  const finalPath = todosCachePath()
  const tmpPath = path.join(
    dir,
    `.todos-today.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`,
  )
  const payload = JSON.stringify(entry, null, 2) + os.EOL
  const fh = await fs.open(tmpPath, 'w')
  try {
    await fh.writeFile(payload, 'utf-8')
    await fh.sync()
  } finally {
    await fh.close()
  }
  await fs.rename(tmpPath, finalPath)
}

export type MutateTodoResult =
  | { ok: true; todo: Todo }
  | { ok: false; reason: 'no-cache' | 'not-found' }

// Read → mutate one todo's status → atomic write. Returns the updated todo on
// success so the caller doesn't need a second read to inspect the new state.
// Not safe under concurrent mutation from multiple processes (we don't take a
// filesystem lock); fine for the single-process Next.js server we run.
export async function mutateTodo(id: string, status: TodoStatus): Promise<MutateTodoResult> {
  const entry = await readTodosCache()
  if (!entry) return { ok: false, reason: 'no-cache' }
  const idx = entry.todos.findIndex(t => t.id === id)
  if (idx < 0) return { ok: false, reason: 'not-found' }
  const updated: Todo = { ...entry.todos[idx], status }
  const next: TodosCacheEntry = {
    ...entry,
    todos: entry.todos.map((t, i) => (i === idx ? updated : t)),
  }
  await writeTodosCache(next)
  return { ok: true, todo: updated }
}

export async function findTodo(id: string): Promise<Todo | null> {
  const entry = await readTodosCache()
  if (!entry) return null
  return entry.todos.find(t => t.id === id) ?? null
}
