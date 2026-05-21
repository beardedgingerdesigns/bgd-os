'use client'

// aios-ui/components/triage-row-actions.tsx
//
// Phase 04 — Plan 04 (HUB-04 / HUB-09): per-row override actions rendered
// inline beneath each Gmail-link line in the Project page's Communications
// section.
//
// Optimistic UX: click → set local state to "pending" → POST → on success
// flip to the chosen state; on error revert and show inline message.
//
// No undo control in this iteration — operator can run /daily-inbox-triage
// again to refresh the queue. (Reverting would need a DELETE/clear endpoint.)

import { useState, useCallback } from 'react'
import { Check, Clock, UserX, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  if (state.kind === 'done') {
    return (
      <div className="mt-1 text-xs text-muted-foreground italic">
        {DONE_LABEL[state.action]}
      </div>
    )
  }

  const isPending = state.kind === 'pending'

  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <Button
        size="xs"
        variant="outline"
        onClick={() => submit('replied')}
        disabled={isPending}
        aria-label={`Mark thread ${threadId} replied`}
      >
        {isPending && state.action === 'replied' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        <span className="ml-1">Replied</span>
      </Button>
      <Button
        size="xs"
        variant="outline"
        onClick={() => submit('snoozed')}
        disabled={isPending}
        aria-label={`Snooze thread ${threadId} for 2 days`}
      >
        {isPending && state.action === 'snoozed' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        <span className="ml-1">Snooze 2d</span>
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => submit('not_me')}
        disabled={isPending}
        aria-label={`Mark thread ${threadId} not me`}
      >
        {isPending && state.action === 'not_me' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <UserX className="h-3 w-3" />
        )}
        <span className="ml-1">Not me</span>
      </Button>
      {state.kind === 'error' && (
        <span className="text-xs text-destructive">{state.message}</span>
      )}
    </div>
  )
}
