'use client'

// aios-ui/components/triage-row-actions.tsx
//
// Phase 04 — Plan 04 (HUB-04 / HUB-09): per-row override actions for the
// Project page's Communications section. The actions live in a kebab (⋮) menu
// to match the Inbox Triage view (views/triage-view.tsx).
//
// Optimistic UX: click → "pending" → POST → flip to the chosen state; on error
// show an inline message. Undo clears the override via DELETE (added with the
// /api/triage/override DELETE endpoint).

import { useState, useCallback } from 'react'
import { Check, Clock, RotateCcw, UserX } from 'lucide-react'
import { KebabMenu, Menu, kebabItemClass } from '@/components/ui/kebab-menu'
import type { TriageOverrideStatus } from '@/lib/types'

interface TriageRowActionsProps {
  threadId: string
  projectSlug: string
}

type RowState =
  | { kind: 'idle' }
  | { kind: 'pending'; action: TriageOverrideStatus }
  | { kind: 'done'; action: TriageOverrideStatus }
  | { kind: 'error'; message: string }

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

const DONE_LABEL: Record<TriageOverrideStatus, string> = {
  replied: 'Marked replied',
  snoozed: 'Snoozed for 2 days',
  not_me: 'Marked not me',
  dismissed: 'Dismissed',
}

export function TriageRowActions({ threadId, projectSlug }: TriageRowActionsProps) {
  const [state, setState] = useState<RowState>({ kind: 'idle' })
  const [undoing, setUndoing] = useState(false)

  const submit = useCallback(
    async (status: TriageOverrideStatus) => {
      setState({ kind: 'pending', action: status })
      const body: Record<string, string> = { status, project_slug: projectSlug }
      if (status === 'snoozed') {
        body.snooze_until = new Date(Date.now() + TWO_DAYS_MS).toISOString()
      }
      try {
        const res = await fetch(`/api/triage/override/${encodeURIComponent(threadId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
          throw new Error(typeof err.error === 'string' ? err.error : 'Request failed')
        }
        setState({ kind: 'done', action: status })
      } catch (e) {
        setState({
          kind: 'error',
          message: e instanceof Error ? e.message : String(e),
        })
      }
    },
    [threadId, projectSlug],
  )

  const undo = useCallback(async () => {
    setUndoing(true)
    try {
      const res = await fetch(`/api/triage/override/${encodeURIComponent(threadId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
        throw new Error(typeof err.error === 'string' ? err.error : 'Request failed')
      }
      setState({ kind: 'idle' })
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : String(e) })
    } finally {
      setUndoing(false)
    }
  }, [threadId])

  const isPending = state.kind === 'pending'

  return (
    <div className="flex items-center gap-1.5">
      {state.kind === 'done' && (
        <span className="text-xs italic text-muted-foreground">
          {DONE_LABEL[state.action]}
        </span>
      )}
      <KebabMenu busy={isPending || undoing} label={`Actions for thread ${threadId}`}>
        {state.kind === 'done' ? (
          <Menu.Item onClick={undo} disabled={undoing} className={kebabItemClass}>
            <RotateCcw className="h-4 w-4" />
            Undo
          </Menu.Item>
        ) : (
          <>
            <Menu.Item onClick={() => submit('replied')} className={kebabItemClass}>
              <Check className="h-4 w-4" />
              Mark replied
            </Menu.Item>
            <Menu.Item onClick={() => submit('snoozed')} className={kebabItemClass}>
              <Clock className="h-4 w-4" />
              Snooze 2 days
            </Menu.Item>
            <Menu.Item onClick={() => submit('not_me')} className={kebabItemClass}>
              <UserX className="h-4 w-4" />
              Not me
            </Menu.Item>
          </>
        )}
      </KebabMenu>
      {state.kind === 'error' && (
        <span className="text-xs text-destructive">{state.message}</span>
      )}
    </div>
  )
}
