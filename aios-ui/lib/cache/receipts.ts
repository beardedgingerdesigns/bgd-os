// aios-ui/lib/cache/receipts.ts
//
// Phase 04 — append-only NDJSON persistence for Receipts (ADR 0003 §"Outputs
// propagated"). Every write surface emits one row here; the bottom-right dock
// renders the last 20 to prove writes are happening.

import fs from 'fs/promises'
import path from 'path'
import type { Receipt } from '@/lib/types'
import { invalidationBus } from '@/lib/invalidation-bus'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function receiptsPath(): string {
  return path.join(cacheDir(), 'receipts.jsonl')
}

/**
 * appendReceipt: append a single JSON line to receipts.jsonl. Creates the
 * cache dir if missing, then publishes a global invalidation so any open
 * receipt-feed docks refresh.
 */
export async function appendReceipt(receipt: Receipt): Promise<void> {
  const dir = cacheDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.appendFile(receiptsPath(), JSON.stringify(receipt) + '\n', 'utf-8')
  invalidationBus.publish({
    scope: { kind: 'global' },
    reason: `receipt ${receipt.kind}`,
    at: new Date().toISOString(),
  })
}

/**
 * readRecentReceipts: returns the most-recent `limit` receipts (default 20)
 * in newest-first order. Tolerates a missing file (returns []) and skips
 * malformed lines silently.
 */
export async function readRecentReceipts(limit = 20): Promise<Receipt[]> {
  let raw: string
  try {
    raw = await fs.readFile(receiptsPath(), 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
  const parsed: Receipt[] = []
  for (const line of raw.split('\n')) {
    if (!line) continue
    try {
      parsed.push(JSON.parse(line) as Receipt)
    } catch {
      // Skip malformed lines silently.
    }
  }
  parsed.reverse()
  return parsed.slice(0, limit)
}
