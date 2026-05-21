export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return

  // Existing file watcher (lib/watcher.ts) — drives Next.js cache invalidation
  // on clients.yaml / references / docs_paths changes.
  try {
    const { startWatcher } = await import('@/lib/watcher')
    await startWatcher()
    // eslint-disable-next-line no-console
    console.log('[aios-ui] file watcher started')
  } catch (err) {
    console.error('[aios-ui] failed to start file watcher', err)
  }

  // New brief watcher (lib/indexer/watcher.ts) — rebuilds .aios-cache/briefs/<slug>.md
  // on changes to clients.yaml, references/, memory/, docs_paths, and wiki raw/aios/.
  // Best-effort: a failure here must not block the file watcher above (and vice versa).
  // First-run policy is LAZY (briefs build on first chat open per project, plan 04-07);
  // the watcher only REBUILDS already-existing briefs during this boot path.
  try {
    const { startBriefWatcher } = await import('@/lib/indexer/watcher')
    await startBriefWatcher()
    // eslint-disable-next-line no-console
    console.log('[aios-ui] brief watcher started')
  } catch (err) {
    console.error('[aios-ui] failed to start brief watcher', err)
  }
}
