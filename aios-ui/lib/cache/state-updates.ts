import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import type { StateUpdateProposal, StateUpdateStore } from '@/lib/types'
import { extractStateUpdatesEnvelope } from '@/lib/skills/state-updates-envelope'

// Mirrors lib/cache/triage.ts: a single JSON file under .aios-cache holding the
// triage-drafted state-update proposals and the set of dismissed dedupeKeys.
function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function stateUpdatesPath(): string {
  return path.join(cacheDir(), 'pending-state-updates.json')
}

// Single-process serialization for the store's read-modify-write ops. The Sync
// view and the nav badge both GET /api/state-updates on the same `invalidate`
// event, so reconcile can run concurrently with itself (and with apply/dismiss).
// A promise chain serializes them; one Node process means an in-process lock
// suffices. ponytail: in-process only — needs file locking if this ever goes multi-process.
let lockTail: Promise<unknown> = Promise.resolve()
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lockTail.then(fn, fn)
  lockTail = result.then(() => undefined, () => undefined)
  return result
}

export async function readStateUpdates(): Promise<StateUpdateStore> {
  try {
    const raw = await fs.readFile(stateUpdatesPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<StateUpdateStore>
    return { proposals: parsed.proposals ?? [], dismissed: parsed.dismissed ?? [] }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { proposals: [], dismissed: [] }
    throw err
  }
}

// Atomic write (temp + rename) so a concurrent reader never sees a torn file.
// Mirrors the apply route's atomicWrite (app/api/state-updates/[id]/apply/route.ts).
// Cleans up the temp file if rename fails (cross-device, ENOSPC) so failures
// don't accumulate orphaned .tmp files.
export async function writeStateUpdates(store: StateUpdateStore): Promise<void> {
  const dest = stateUpdatesPath()
  await fs.mkdir(cacheDir(), { recursive: true })
  const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf-8')
  try {
    await fs.rename(tmp, dest)
  } catch (err) {
    await fs.unlink(tmp).catch(() => undefined)
    throw err
  }
}

// Shared dedupe predicate: a dedupeKey already pending or dismissed is a dup.
// Used by both addProposal and reconcileStateUpdates so there is one source of truth.
function isDuplicate(store: StateUpdateStore, dedupeKey: string): boolean {
  return store.proposals.some(p => p.dedupeKey === dedupeKey) || store.dismissed.includes(dedupeKey)
}

export function dedupeKeyFor(slug: string, field: string, proposed: string): string {
  const hash = crypto.createHash('sha256').update(proposed).digest('hex').slice(0, 8)
  return `${slug}:${field}:${hash}`
}

// Append a proposal unless its dedupeKey is already pending or was dismissed.
// Returns true when added, false when skipped as a duplicate.
export async function addProposal(proposal: StateUpdateProposal): Promise<boolean> {
  return withLock(async () => {
    const store = await readStateUpdates()
    if (isDuplicate(store, proposal.dedupeKey)) return false
    store.proposals.push(proposal)
    await writeStateUpdates(store)
    return true
  })
}

// Remove a proposal by id. Returns it, or null. Does not touch `dismissed`.
export async function removeProposal(id: string): Promise<StateUpdateProposal | null> {
  return withLock(async () => {
    const store = await readStateUpdates()
    const idx = store.proposals.findIndex(p => p.id === id)
    if (idx === -1) return null
    const [removed] = store.proposals.splice(idx, 1)
    await writeStateUpdates(store)
    return removed
  })
}

// Remove a proposal after it was applied AND record its dedupeKey in `dismissed`.
// Without this, the still-frozen STATE_UPDATES_JSON envelope in inbox-triage.md
// would be re-reconciled on the next GET and resurrect the applied proposal —
// now clobber-stale, so un-appliable (a permanent ghost) until the next triage
// run overwrites the file. Suppressing the dedupeKey closes that loop.
export async function markApplied(id: string): Promise<StateUpdateProposal | null> {
  return withLock(async () => {
    const store = await readStateUpdates()
    const idx = store.proposals.findIndex(p => p.id === id)
    if (idx === -1) return null
    const [removed] = store.proposals.splice(idx, 1)
    if (!store.dismissed.includes(removed.dedupeKey)) store.dismissed.push(removed.dedupeKey)
    await writeStateUpdates(store)
    return removed
  })
}

// Dismiss a proposal: drop it and remember its dedupeKey so triage won't
// re-propose the same change. Returns the dismissed proposal, or null.
export async function dismissProposal(id: string): Promise<StateUpdateProposal | null> {
  return withLock(async () => {
    const store = await readStateUpdates()
    const idx = store.proposals.findIndex(p => p.id === id)
    if (idx === -1) return null
    const [removed] = store.proposals.splice(idx, 1)
    if (!store.dismissed.includes(removed.dedupeKey)) store.dismissed.push(removed.dedupeKey)
    await writeStateUpdates(store)
    return removed
  })
}

// Reconcile triage-emitted proposals (the STATE_UPDATES_JSON envelope inside
// state/inbox-triage.md) into the store. Derives id/createdAt/dedupeKey here so
// the skill only emits semantic fields. Batched (one read-modify-write) under
// the lock; idempotent via dedupeKey. Returns the number of new proposals added.
export async function reconcileStateUpdates(markdown: string, now: string): Promise<number> {
  const envelope = extractStateUpdatesEnvelope(markdown)
  if (!envelope || envelope.proposals.length === 0) return 0

  return withLock(async () => {
    const store = await readStateUpdates()
    const seenThisBatch = new Set<string>()
    let added = 0
    for (const raw of envelope.proposals) {
      const dedupeKey = dedupeKeyFor(raw.slug, raw.field, raw.proposed)
      if (seenThisBatch.has(dedupeKey) || isDuplicate(store, dedupeKey)) continue
      seenThisBatch.add(dedupeKey)
      store.proposals.push({
        ...raw,
        id: `su-${crypto.randomBytes(4).toString('hex')}`,
        dedupeKey,
        createdAt: now,
      })
      added++
    }
    if (added > 0) await writeStateUpdates(store)
    return added
  })
}
