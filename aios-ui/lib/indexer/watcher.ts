import path from 'path'
import fs from 'fs/promises'
import chokidar from 'chokidar'
import matter from 'gray-matter'

import { CLAUDE_OS_ROOT, CLIENTS_YAML_PATH, MEMORY_ROOT, REFERENCES_DIR } from '@/lib/paths'
import { loadClients } from '@/lib/data/clients'
import { detectWiki } from '@/lib/data/wiki'
import { buildBriefFor as defaultBuildBriefFor, type BuildBriefResult } from '@/lib/indexer/build-brief'
import type { Client } from '@/lib/types'

const DEBOUNCE_MS = 500

interface StartBriefWatcherOptions {
  /** Override the brief builder (used by tests to avoid spawning real subprocesses). */
  buildBriefFor?: (
    clientSlug: string,
    projectSlug: string,
    opts?: Record<string, unknown>,
  ) => Promise<BuildBriefResult | { status: string }>
}

export interface BriefWatcherHandle {
  close(): Promise<void>
  getWatchedPaths(): string[]
}

interface ProjectKey {
  clientSlug: string
  projectSlug: string
}

interface ActiveWatcherState {
  handle: BriefWatcherHandle
  clients: Client[]
  builder: NonNullable<StartBriefWatcherOptions['buildBriefFor']>
  debounceTimers: Map<string, NodeJS.Timeout>
  // Resolved docs_path → owning project (so reverse mapping is O(1) per change).
  docsPathOwner: Map<string, ProjectKey>
  // raw/aios/ dir → owning project
  rawAiosOwner: Map<string, ProjectKey>
  watchedPaths: string[]
}

let active: ActiveWatcherState | null = null

function projectKey(client: string, project: string): string {
  return `${client}__${project}`
}

function allProjectKeys(clients: Client[]): ProjectKey[] {
  const out: ProjectKey[] = []
  for (const c of clients) {
    for (const p of c.projects) {
      out.push({ clientSlug: c.slug, projectSlug: p.slug })
    }
  }
  return out
}

function pathIsInside(parent: string, child: string): boolean {
  const p = path.normalize(parent)
  const c = path.normalize(child)
  if (c === p) return true
  const withSep = p.endsWith(path.sep) ? p : p + path.sep
  return c.startsWith(withSep)
}

/**
 * Read memory file frontmatter for client/project tags.
 * Returns null if the file doesn't exist or has no usable tags.
 * Mirrors lib/data/memory.ts — accepts both top-level (client/project) and
 * metadata-nested (metadata.client/metadata.project) shapes.
 */
async function readMemoryProjectFrontmatter(
  filePath: string,
): Promise<{ client: string; project: string } | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = matter(raw)
    const data = (parsed.data ?? {}) as Record<string, unknown>
    const metadata = (data.metadata ?? {}) as Record<string, unknown>
    const client = (data.client ?? metadata.client) as string | undefined
    const project = (data.project ?? metadata.project) as string | undefined
    if (typeof client === 'string' && typeof project === 'string') {
      return { client, project }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Determine which (client, project) pairs are affected by a change at `changedPath`.
 * Returns an empty array for paths we don't recognize (which is treated as "fall
 * through to global" by the caller — but defensively we map to all).
 */
async function affectedProjects(
  changedPath: string,
  state: ActiveWatcherState,
): Promise<ProjectKey[]> {
  const normalized = path.normalize(changedPath)

  // Global triggers — clients.yaml rebuilds everything.
  if (normalized === path.normalize(CLIENTS_YAML_PATH)) {
    return allProjectKeys(state.clients)
  }

  // Memory dir — try to resolve via frontmatter to a single project.
  if (pathIsInside(MEMORY_ROOT, normalized)) {
    const tags = await readMemoryProjectFrontmatter(normalized)
    if (tags) {
      const match = state.clients
        .flatMap(c => c.projects.map(p => ({ clientSlug: c.slug, projectSlug: p.slug })))
        .find(k => k.clientSlug === tags.client && k.projectSlug === tags.project)
      if (match) return [match]
    }
    // Unknown frontmatter (or unreadable) — conservative: rebuild all.
    return allProjectKeys(state.clients)
  }

  // Owned docs_path or raw/aios dir? Walk the longest-first match so a
  // file inside an external-wiki raw/aios/ matches that owner before a
  // shorter docs_path prefix.
  const docsCandidates = [...state.docsPathOwner.entries()]
    .sort((a, b) => b[0].length - a[0].length)
  for (const [dp, owner] of docsCandidates) {
    if (pathIsInside(dp, normalized) || normalized === dp) {
      return [owner]
    }
  }
  const rawCandidates = [...state.rawAiosOwner.entries()]
    .sort((a, b) => b[0].length - a[0].length)
  for (const [rp, owner] of rawCandidates) {
    if (pathIsInside(rp, normalized) || normalized === rp) {
      return [owner]
    }
  }

  // References/ but not in any project's docs_paths — conservative: rebuild all.
  // (References can be globally relevant context.)
  if (pathIsInside(REFERENCES_DIR, normalized)) {
    return allProjectKeys(state.clients)
  }

  // Unknown path. Default to all (conservative, matches lib/watcher.ts global default).
  return allProjectKeys(state.clients)
}

function scheduleRebuild(state: ActiveWatcherState, key: ProjectKey): void {
  const k = projectKey(key.clientSlug, key.projectSlug)
  const existing = state.debounceTimers.get(k)
  if (existing) clearTimeout(existing)
  const timer = setTimeout(() => {
    state.debounceTimers.delete(k)
    Promise.resolve(state.builder(key.clientSlug, key.projectSlug)).catch(err => {
      // eslint-disable-next-line no-console
      console.warn(`[brief-watcher] buildBriefFor failed for ${k}`, err)
    })
  }, DEBOUNCE_MS)
  state.debounceTimers.set(k, timer)
}

async function handleChange(state: ActiveWatcherState, changedPath: string): Promise<void> {
  try {
    const affected = await affectedProjects(changedPath, state)
    for (const key of affected) scheduleRebuild(state, key)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[brief-watcher] handler error', err)
  }
}

export async function startBriefWatcher(
  opts: StartBriefWatcherOptions = {},
): Promise<BriefWatcherHandle> {
  if (active) return active.handle

  const builder = opts.buildBriefFor ?? defaultBuildBriefFor
  const clients = await loadClients().catch(() => [] as Client[])

  // Build reverse mappings.
  const docsPathOwner = new Map<string, ProjectKey>()
  const rawAiosOwner = new Map<string, ProjectKey>()

  for (const c of clients) {
    for (const p of c.projects) {
      const docs = p.docs_paths ?? []
      for (const dp of docs) {
        const resolved = path.isAbsolute(dp) ? dp : path.join(CLAUDE_OS_ROOT, dp)
        const normalized = path.normalize(resolved)
        docsPathOwner.set(normalized, { clientSlug: c.slug, projectSlug: p.slug })

        // Walk up to find a wiki and register its raw/aios/ dir for subscription.
        // For docs_path that points at a file (e.g. references/inside-out-project.md),
        // detectWiki won't match — skip. For docs_path that points at a dir
        // containing or being a wiki, register raw/aios/.
        const wiki = await detectWiki(resolved).catch(() => null)
        if (wiki) {
          const rawAios = path.normalize(path.join(wiki.rootPath, 'raw', 'aios'))
          rawAiosOwner.set(rawAios, { clientSlug: c.slug, projectSlug: p.slug })
        }
      }
    }
  }

  // Build chokidar subscription list — dedupe and drop ENOENT entries lazily
  // (chokidar tolerates missing paths but will log warnings; that's fine).
  const watchedSet = new Set<string>([
    path.normalize(CLIENTS_YAML_PATH),
    path.normalize(REFERENCES_DIR),
    path.normalize(MEMORY_ROOT),
  ])
  for (const dp of docsPathOwner.keys()) watchedSet.add(dp)
  for (const rp of rawAiosOwner.keys()) watchedSet.add(rp)
  const watchedPaths = [...watchedSet]

  const watcher = chokidar.watch(watchedPaths, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
  })

  const state: ActiveWatcherState = {
    clients,
    builder,
    debounceTimers: new Map(),
    docsPathOwner,
    rawAiosOwner,
    watchedPaths,
    handle: {
      close: async () => {
        for (const t of state.debounceTimers.values()) clearTimeout(t)
        state.debounceTimers.clear()
        await watcher.close()
        if (active && active.handle === state.handle) active = null
      },
      getWatchedPaths: () => [...state.watchedPaths],
    },
  }

  const dispatch = (changed: string) => {
    void handleChange(state, changed)
  }
  watcher.on('add', dispatch)
  watcher.on('change', dispatch)
  watcher.on('unlink', dispatch)

  active = state
  return state.handle
}

export async function stopBriefWatcher(): Promise<void> {
  if (!active) return
  const h = active.handle
  await h.close()
}

// ---------- test seams (not part of the public API) ----------

/**
 * Dispatch a "change" event for tests, bypassing chokidar.
 * Returns the in-flight handler promise so callers can `await` it before
 * advancing fake timers (necessary because affectedProjects() does async
 * filesystem reads for memory frontmatter — fake timers don't wait on libuv I/O).
 */
export function __test_dispatchChange(changedPath: string): Promise<void> {
  if (!active) throw new Error('[brief-watcher] __test_dispatchChange called before start')
  return handleChange(active, changedPath)
}

/** Hard-reset the singleton without closing chokidar (test cleanup). */
export function __test_resetSingleton(): void {
  if (active) {
    for (const t of active.debounceTimers.values()) clearTimeout(t)
    active.debounceTimers.clear()
  }
  active = null
}
