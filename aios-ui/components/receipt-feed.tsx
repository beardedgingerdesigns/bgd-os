'use client'

// aios-ui/components/receipt-feed.tsx
//
// Phase 04 — bottom-right dock that proves writes are happening. Fetches the
// last 20 receipts from /api/receipts on mount, then subscribes to
// /api/receipts/stream and refetches whenever any write surface appends a row.
//
// Collapsed: a pill ("Receipts (N)" with unseen-count badge).
// Expanded: a panel listing the receipts with vscode://file/ deep links.

import { useEffect, useMemo, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { Receipt, ReceiptKind } from '@/lib/types'

const LAST_SEEN_KEY = 'aios.receipts.lastSeenAt'

const KIND_CHIP: Record<ReceiptKind, string> = {
  capture:            'bg-blue-500/15 text-blue-300',
  todo:               'bg-zinc-500/15 text-zinc-300',
  triage_override:    'bg-amber-500/15 text-amber-300',
  chat_drop:          'bg-violet-500/15 text-violet-300',
  chat_session_close: 'bg-cyan-500/15 text-cyan-300',
  wiki_ingest:        'bg-emerald-500/15 text-emerald-300',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Date.now() - then
  if (diff < 0) return 'just now'
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + '…'
}

export function ReceiptFeed() {
  const [expanded, setExpanded] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [lastSeenAt, setLastSeenAt] = useState<string>('')

  // Hydrate lastSeenAt from localStorage on mount.
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LAST_SEEN_KEY) ?? ''
      setLastSeenAt(v)
    } catch {
      // ignore (e.g. storage disabled)
    }
  }, [])

  // Fetch on mount + subscribe to SSE; refetch on every "receipt" event.
  useEffect(() => {
    let cancelled = false
    const refetch = async () => {
      try {
        const res = await fetch('/api/receipts', { cache: 'no-store' })
        if (!res.ok) return
        const body = (await res.json()) as { receipts: Receipt[] }
        if (!cancelled) setReceipts(body.receipts ?? [])
      } catch {
        // network errors during dev are fine; SSE will trigger another fetch
      }
    }
    refetch()

    const es = new EventSource('/api/receipts/stream')
    es.addEventListener('receipt', () => {
      refetch()
    })
    es.onerror = () => {
      // Browser auto-reconnects; no action needed.
    }

    return () => {
      cancelled = true
      es.close()
    }
  }, [])

  const unseenCount = useMemo(() => {
    if (!lastSeenAt) return receipts.length
    return receipts.filter(r => r.ts > lastSeenAt).length
  }, [receipts, lastSeenAt])

  // Phase 04 review WR-07: mark seen on COLLAPSE, not on expand. Previously
  // we set lastSeenAt the moment the panel opened, which marked even rows
  // the operator never scrolled to as "seen" (correctness nit) and was
  // sensitive to same-millisecond receipt arrivals (potential off-by-one in
  // the strict r.ts > lastSeenAt comparison). Marking on collapse gives the
  // operator the natural "I've seen what was on screen" semantics and is
  // immune to receipts that arrive while the panel is open — those will
  // still show as unseen until the operator closes the panel.
  const toggle = () => {
    setExpanded(prev => {
      const next = !prev
      if (!next) {
        // Just collapsed — mark everything currently in receipts as seen.
        const nowIso = new Date().toISOString()
        try {
          window.localStorage.setItem(LAST_SEEN_KEY, nowIso)
        } catch {
          // ignore
        }
        setLastSeenAt(nowIso)
      }
      return next
    })
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-zinc-900/95 px-3 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-foreground/15 shadow-lg backdrop-blur hover:bg-zinc-800/95"
        aria-label={`Receipts (${unseenCount} unseen)`}
        data-slot="receipt-feed-pill"
      >
        <span>Receipts</span>
        <span
          className={
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.7rem] font-semibold ' +
            (unseenCount > 0
              ? 'bg-blue-500/25 text-blue-200'
              : 'bg-zinc-700/60 text-zinc-300')
          }
        >
          {unseenCount}
        </span>
        <ChevronUp className="size-3.5" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-[420px] max-h-[60vh] flex-col overflow-hidden rounded-xl bg-zinc-900/95 ring-1 ring-foreground/15 shadow-xl backdrop-blur"
      data-slot="receipt-feed-panel"
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">Receipts</span>
          <span className="text-xs text-zinc-400">last {receipts.length}</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-zinc-300 hover:bg-zinc-800/80"
          aria-label="Collapse receipts"
        >
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {receipts.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-500">
            No receipts yet. Writes from the UI will appear here.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/5">
            {receipts.map(r => (
              <li key={r.id} className="px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-zinc-300">
                  <span className="text-zinc-500">{relativeTime(r.ts)}</span>
                  <span className="text-zinc-600">·</span>
                  <span
                    className={
                      'inline-flex rounded px-1.5 py-0.5 text-[0.65rem] font-medium ' +
                      (KIND_CHIP[r.kind] ?? 'bg-zinc-500/15 text-zinc-300')
                    }
                  >
                    {r.kind}
                  </span>
                  {r.project_slug ? (
                    <>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">{r.project_slug}</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-1 text-zinc-200">{truncate(r.excerpt, 80)}</div>
                <a
                  href={`vscode://file/${r.file_written}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-mono text-[0.7rem] text-blue-300 underline underline-offset-2 hover:text-blue-200 break-all"
                  title="Open in VS Code"
                >
                  {r.file_written}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
