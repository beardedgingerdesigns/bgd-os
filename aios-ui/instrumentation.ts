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

  // Brief watcher (lib/indexer/watcher.ts) REMOVED per GAP-04-02 closure
  // (UAT 2026-05-22). A single clients.yaml save fan-outed subprocess spawns
  // to all ~22 projects, /load-project returned exit 1 universally, and
  // claude-mem/context-mode SQLite locks contended under the concurrent
  // PreToolUse writes — burning Justin's session quota uncontrollably.
  //
  // Replacement contract:
  //   - Briefs build LAZILY on first chat open per project
  //     (lib/skills/chat-bootstrap.ts → readBriefOrBuild → buildBriefFor)
  //   - The "Refresh context" button on the chat drawer explicitly re-invokes
  //     buildBriefFor via POST /api/chat/[client]/[project]/refresh
  //
  // HUB-02 success criterion ("brief reflects latest data when chat opens")
  // is satisfied via lazy-rebuild on stale cache + manual refresh. We do not
  // pre-warm briefs.
}
