'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X, Pencil, Loader2, GitCompareArrows } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { StateUpdateProposal, StateUpdateStore } from '@/lib/types'

// Per-proposal transient UI state, keyed by id.
interface RowState {
  pending?: 'apply' | 'dismiss'
  editing?: boolean
  draft?: string // edited proposed value while editing
  error?: string
  stale?: boolean // apply returned 409 — the state file moved since drafting
}

const FIELD_LABEL: Record<StateUpdateProposal['field'], string> = {
  status: 'status',
  current_status: 'current status',
  next_step: 'next step',
  blocker: 'blocker',
}

export function SyncView() {
  const [proposals, setProposals] = useState<StateUpdateProposal[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rows, setRows] = useState<Record<string, RowState>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/state-updates', { cache: 'no-store' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const body = (await res.json()) as StateUpdateStore
      setProposals(body.proposals ?? [])
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
      setProposals(curr => curr ?? [])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setRow = useCallback((id: string, patch: Partial<RowState>) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const clearRow = useCallback((id: string) => {
    setRows(prev => {
      const { [id]: _drop, ...rest } = prev
      return rest
    })
  }, [])

  const apply = useCallback(
    async (p: StateUpdateProposal) => {
      const row = rows[p.id]
      const edited = row?.editing && typeof row.draft === 'string' ? row.draft : undefined
      setRow(p.id, { pending: 'apply', error: undefined, stale: false })
      const snapshot = proposals
      setProposals(curr => (curr ? curr.filter(x => x.id !== p.id) : curr))
      try {
        const res = await fetch(`/api/state-updates/${encodeURIComponent(p.id)}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edited !== undefined ? { proposed: edited } : {}),
        })
        if (res.status === 409) {
          setProposals(snapshot) // restore — the file moved since drafting
          setRow(p.id, { pending: undefined, editing: false, stale: true })
          return
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
          throw new Error(typeof err.error === 'string' ? err.error : 'Request failed')
        }
        clearRow(p.id)
      } catch (e) {
        setProposals(snapshot)
        setRow(p.id, { pending: undefined, error: e instanceof Error ? e.message : String(e) })
      }
    },
    [proposals, rows, setRow, clearRow],
  )

  const dismiss = useCallback(
    async (p: StateUpdateProposal) => {
      setRow(p.id, { pending: 'dismiss', error: undefined })
      const snapshot = proposals
      setProposals(curr => (curr ? curr.filter(x => x.id !== p.id) : curr))
      try {
        const res = await fetch(`/api/state-updates/${encodeURIComponent(p.id)}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
          throw new Error(typeof err.error === 'string' ? err.error : 'Request failed')
        }
        clearRow(p.id)
      } catch (e) {
        setProposals(snapshot)
        setRow(p.id, { pending: undefined, error: e instanceof Error ? e.message : String(e) })
      }
    },
    [proposals, setRow, clearRow],
  )

  const groups = useMemo(() => {
    const map = new Map<string, StateUpdateProposal[]>()
    for (const p of proposals ?? []) {
      const arr = map.get(p.slug) ?? []
      arr.push(p)
      map.set(p.slug, arr)
    }
    return [...map.entries()]
  }, [proposals])

  if (proposals === null) {
    return (
      <div>
        <Header total={0} />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  const total = proposals.length

  return (
    <div>
      <Header total={total} />

      {loadError && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load proposals: {loadError}
        </div>
      )}

      {total === 0 && !loadError ? (
        <Empty />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([slug, items]) => (
            <section key={slug} aria-label={slug}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight">{slug}</h2>
                <Badge variant="muted" className="tabular-nums">
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3">
                {items.map(p => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    state={rows[p.id] ?? {}}
                    onApply={apply}
                    onDismiss={dismiss}
                    onEdit={id => setRow(id, { editing: true, draft: p.proposed })}
                    onDraft={(id, v) => setRow(id, { draft: v })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function Header({ total }: { total: number }) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h1 className="text-xl font-heading font-semibold tracking-tight">Sync</h1>
      {total > 0 && <span className="text-xs text-muted-foreground tabular-nums">{total} proposed</span>}
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <GitCompareArrows className="mb-3 size-8 text-brand" aria-hidden="true" />
      <p className="text-sm font-medium">No pending updates</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Triage proposes changes here when an email contradicts a project&apos;s state.
      </p>
    </div>
  )
}

interface ProposalCardProps {
  proposal: StateUpdateProposal
  state: RowState
  onApply: (p: StateUpdateProposal) => void
  onDismiss: (p: StateUpdateProposal) => void
  onEdit: (id: string) => void
  onDraft: (id: string, value: string) => void
}

function ProposalCard({ proposal, state, onApply, onDismiss, onEdit, onDraft }: ProposalCardProps) {
  const busy = Boolean(state.pending)
  const editing = Boolean(state.editing)

  return (
    <Card size="sm" className="px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {FIELD_LABEL[proposal.field]}
            </span>
            <Badge variant={proposal.confidence === 'high' ? 'brand' : 'muted'}>
              {proposal.confidence === 'high' ? 'high confidence' : 'review'}
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-sm">
            <p className="text-muted-foreground">
              <span className="select-none text-destructive">−</span> {proposal.current}
            </p>
            {editing ? (
              <textarea
                aria-label="Edit proposed value"
                value={state.draft ?? proposal.proposed}
                onChange={e => onDraft(proposal.id, e.target.value)}
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            ) : (
              <p className="font-medium">
                <span className="select-none text-emerald-600">+</span> {proposal.proposed}
              </p>
            )}
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
            {proposal.evidence.sender ?? 'unknown'} · {proposal.evidence.date} · {proposal.evidence.source}
          </p>

          {state.stale && (
            <p className="mt-2 text-xs text-amber-700">
              State changed since this was drafted — re-review before applying.
            </p>
          )}
          {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <Button size="sm" onClick={() => onApply(proposal)} disabled={busy} aria-label="Apply update">
            {state.pending === 'apply' ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            <span className="ml-1.5 text-xs">Apply</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(proposal.id)}
            disabled={busy || editing}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
            <span className="ml-1.5 text-xs">Edit</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDismiss(proposal)} disabled={busy} aria-label="Dismiss update">
            {state.pending === 'dismiss' ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
            <span className="ml-1.5 text-xs">Dismiss</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
