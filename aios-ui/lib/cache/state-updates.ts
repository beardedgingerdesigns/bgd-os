import fs from 'fs/promises'
import path from 'path'
import type { StateUpdateProposal, StateUpdateStore } from '@/lib/types'

// Mirrors lib/cache/triage.ts: a single JSON file under .aios-cache holding the
// triage-drafted state-update proposals and the set of dismissed dedupeKeys.
function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function stateUpdatesPath(): string {
  return path.join(cacheDir(), 'pending-state-updates.json')
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

export async function writeStateUpdates(store: StateUpdateStore): Promise<void> {
  await fs.mkdir(cacheDir(), { recursive: true })
  await fs.writeFile(stateUpdatesPath(), JSON.stringify(store, null, 2), 'utf-8')
}

// Append a proposal unless its dedupeKey is already pending or was dismissed.
// Returns true when added, false when skipped as a duplicate.
export async function addProposal(proposal: StateUpdateProposal): Promise<boolean> {
  const store = await readStateUpdates()
  const seen =
    store.proposals.some(p => p.dedupeKey === proposal.dedupeKey) ||
    store.dismissed.includes(proposal.dedupeKey)
  if (seen) return false
  store.proposals.push(proposal)
  await writeStateUpdates(store)
  return true
}

// Remove a proposal by id (used after a successful apply). Returns it, or null.
export async function removeProposal(id: string): Promise<StateUpdateProposal | null> {
  const store = await readStateUpdates()
  const idx = store.proposals.findIndex(p => p.id === id)
  if (idx === -1) return null
  const [removed] = store.proposals.splice(idx, 1)
  await writeStateUpdates(store)
  return removed
}

// Dismiss a proposal: drop it and remember its dedupeKey so triage won't
// re-propose the same change. Returns the dismissed proposal, or null.
export async function dismissProposal(id: string): Promise<StateUpdateProposal | null> {
  const store = await readStateUpdates()
  const idx = store.proposals.findIndex(p => p.id === id)
  if (idx === -1) return null
  const [removed] = store.proposals.splice(idx, 1)
  if (!store.dismissed.includes(removed.dedupeKey)) store.dismissed.push(removed.dedupeKey)
  await writeStateUpdates(store)
  return removed
}
