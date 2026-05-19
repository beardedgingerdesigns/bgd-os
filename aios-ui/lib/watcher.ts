import path from 'path'
import chokidar from 'chokidar'
import { revalidatePath } from 'next/cache'

import type { Client, InvalidationMessage, InvalidationScope } from '@/lib/types'
import { CLAUDE_OS_ROOT, MEMORY_ROOT, CLIENTS_YAML_PATH, DECISIONS_LOG_PATH, REFERENCES_DIR } from '@/lib/paths'
import { loadClients } from '@/lib/data/clients'
import { invalidationBus } from '@/lib/invalidation-bus'

interface ScopeArgs {
  claudeOsRoot: string
  clients: Client[]
  memoryProjectFrontmatter?: { client?: string; project?: string }
}

export function scopeForPath(absPath: string, args: ScopeArgs): InvalidationScope {
  const normalized = path.normalize(absPath)
  const root = path.normalize(args.claudeOsRoot)

  if (normalized === path.join(root, 'clients.yaml')) return { kind: 'global' }
  if (normalized === path.join(root, 'decisions/log.md')) return { kind: 'global' }

  const memFront = args.memoryProjectFrontmatter
  if (memFront?.client && memFront?.project) {
    return {
      kind: 'project',
      clientSlug: memFront.client,
      projectSlug: memFront.project,
    }
  }

  for (const client of args.clients) {
    for (const project of client.projects) {
      const docsPaths = project.docs_paths ?? []
      for (const dp of docsPaths) {
        const resolved = path.isAbsolute(dp) ? dp : path.join(root, dp)
        const normalizedDp = path.normalize(resolved)
        if (
          normalized === normalizedDp ||
          normalized.startsWith(normalizedDp.endsWith(path.sep) ? normalizedDp : normalizedDp + path.sep)
        ) {
          return { kind: 'project', clientSlug: client.slug, projectSlug: project.slug }
        }
      }
    }
  }

  return { kind: 'global' }
}

type RevalidateTarget = readonly [path: string, type?: 'page' | 'layout']

function pathsForScope(scope: InvalidationScope): RevalidateTarget[] {
  switch (scope.kind) {
    case 'global':
      return [
        ['/', undefined],
        ['/clients/[client]', 'page'],
        ['/clients/[client]/projects/[project]', 'page'],
      ]
    case 'client':
      return [[`/clients/${scope.clientSlug}`, undefined]]
    case 'project':
      return [
        [`/clients/${scope.clientSlug}`, undefined],
        [`/clients/${scope.clientSlug}/projects/${scope.projectSlug}`, undefined],
      ]
    case 'admin':
      return [['/admin', undefined]]
  }
}

interface WatcherHandle {
  close(): Promise<void>
}

let activeWatcher: WatcherHandle | null = null

export async function startWatcher(): Promise<WatcherHandle> {
  if (activeWatcher) return activeWatcher

  const clients = await loadClients().catch(() => [] as Client[])

  const watched: string[] = [
    CLIENTS_YAML_PATH,
    DECISIONS_LOG_PATH,
    REFERENCES_DIR,
    MEMORY_ROOT,
  ]
  for (const c of clients) {
    for (const p of c.projects) {
      for (const dp of p.docs_paths ?? []) {
        const resolved = path.isAbsolute(dp) ? dp : path.join(CLAUDE_OS_ROOT, dp)
        watched.push(resolved)
      }
    }
  }

  const watcher = chokidar.watch(watched, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
  })

  const handle = (eventName: string) => async (changedPath: string) => {
    try {
      const freshClients = await loadClients().catch(() => clients)
      const scope = scopeForPath(changedPath, { claudeOsRoot: CLAUDE_OS_ROOT, clients: freshClients })
      const msg: InvalidationMessage = {
        scope,
        reason: `${eventName}: ${path.relative(CLAUDE_OS_ROOT, changedPath) || changedPath}`,
        at: new Date().toISOString(),
      }
      for (const [p, type] of pathsForScope(scope)) {
        try {
          if (type) {
            revalidatePath(p, type)
          } else {
            revalidatePath(p)
          }
        } catch (_) { /* revalidatePath may noop outside request scope */ }
      }
      invalidationBus.publish(msg)
    } catch (err) {
      console.error('[watcher] handle error', err)
    }
  }

  watcher.on('add', handle('add'))
  watcher.on('change', handle('change'))
  watcher.on('unlink', handle('unlink'))

  activeWatcher = {
    close: async () => {
      await watcher.close()
      activeWatcher = null
    },
  }
  return activeWatcher
}
