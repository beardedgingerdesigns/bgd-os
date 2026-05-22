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
  //
  // TEMPORARY UAT GATE (2026-05-22, GAP-04-02): a clients.yaml save fan-outs subprocess
  // spawns to ALL projects, /load-project fails universally with exit 1, and quota
  // burns down. Disabled via AIOS_DISABLE_BRIEF_WATCHER=1 until gap-closure lands.
  if (process.env.AIOS_DISABLE_BRIEF_WATCHER === '1') {
    console.log('[aios-ui] brief watcher DISABLED via AIOS_DISABLE_BRIEF_WATCHER=1')
  } else {
    try {
      const { startBriefWatcher } = await import('@/lib/indexer/watcher')
      await startBriefWatcher()
      // eslint-disable-next-line no-console
      console.log('[aios-ui] brief watcher started')
    } catch (err) {
      console.error('[aios-ui] failed to start brief watcher', err)
    }
  }
}
