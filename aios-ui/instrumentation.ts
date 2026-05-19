export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return

  try {
    const { startWatcher } = await import('@/lib/watcher')
    await startWatcher()
    // eslint-disable-next-line no-console
    console.log('[aios-ui] file watcher started')
  } catch (err) {
    console.error('[aios-ui] failed to start file watcher', err)
  }
}
