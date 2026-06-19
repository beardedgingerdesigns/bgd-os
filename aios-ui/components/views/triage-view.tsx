'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RunTriageButton } from '@/components/run-triage-button'
import { extractTodosEnvelope } from '@/lib/skills/todos-envelope'
import {
  parseTriageBrief,
  type TriageSection,
  type TriageSectionKind,
  type TriageThread,
} from '@/lib/skills/triage-brief'
import type { TodosCacheEntry, TriageCacheEntry, TriageOverrideStatus } from '@/lib/types'

const GMAIL_LINK_BASE = 'https://mail.google.com/mail/u/0/#inbox/'
const STALE_THRESHOLD_MS = 14 * 60 * 60 * 1000
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

// Sections render top-to-bottom in this priority. Reply sections lead; passive
// context (FYI / billing / archive) trails.
const SECTION_ORDER: TriageSectionKind[] = [
  'reply_today',
  'reply_week',
  'fyi',
  'billing',
  'other',
  'archive',
]

const SECTION_LABEL: Record<TriageSectionKind, string> = {
  reply_today: 'Reply today',
  reply_week: 'Reply this week',
  fyi: 'FYI / context only',
  billing: 'Billing alerts',
  archive: 'Archive candidates',
  other: 'Other',
}

function isReplySection(kind: TriageSectionKind): boolean {
  return kind === 'reply_today' || kind === 'reply_week'
}

function scoreVariant(score: number): 'destructive' | 'warning' | 'muted' {
  if (score >= 70) return 'destructive'
  if (score >= 40) return 'warning'
  return 'muted'
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'unknown'
  const diffMs = Date.now() - then
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  if (hours < 1) {
    const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)))
    return `${mins}m ago`
  }
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface OverrideState {
  kind: 'idle' | 'pending' | 'done' | 'error'
  action?: TriageOverrideStatus
  message?: string
}

const DONE_LABEL: Record<TriageOverrideStatus, string> = {
  replied: 'Marked replied',
  snoozed: 'Snoozed 2 days',
  not_me: 'Marked not me',
  dismissed: 'Dismissed',
}

function ThreadRow({
  thread,
  highlight,
}: {
  thread: TriageThread
  highlight: boolean
}) {
  const [state, setState] = useState<OverrideState>({ kind: 'idle' })

  const submit = useCallback(
    async (status: TriageOverrideStatus) => {
      if (!thread.threadId) return
      setState({ kind: 'pending', action: status })
      const body: Record<string, string> = { status }
      if (status === 'snoozed') {
        body.snooze_until = new Date(Date.now() + TWO_DAYS_MS).toISOString()
      }
      try {
        const res = await fetch(
          `/api/triage/override/${encodeURIComponent(thread.threadId)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        )
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
    [thread.threadId],
  )

  const draftReply = useCallback(() => {
    // U7 (chat panel) will consume this. For now, surface the full thread
    // context so the wiring target is obvious during integration.
    console.log('[triage] draft reply context', {
      sender: thread.sender,
      context: thread.context,
      threadId: thread.threadId,
      gmailUrl: thread.threadId ? `${GMAIL_LINK_BASE}${thread.threadId}` : null,
    })
  }, [thread])

  const isPending = state.kind === 'pending'
  const resolved = state.kind === 'done'

  return (
    <li
      className={`rounded-lg border p-3 transition-colors ${
        resolved
          ? 'border-border bg-muted/40 opacity-60'
          : highlight
            ? 'border-brand/40 bg-brand-muted/40'
            : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {thread.sender}
            </span>
            {thread.daysWaiting !== null && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {thread.daysWaiting}d waiting
              </span>
            )}
          </div>
          {thread.context && (
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              {thread.context}
            </p>
          )}
        </div>
        {thread.score !== null && (
          <Badge variant={scoreVariant(thread.score)} className="shrink-0">
            {thread.score}
          </Badge>
        )}
      </div>

      {thread.threadId && (
        <div className="mt-2 flex items-center gap-2">
          <a
            href={`${GMAIL_LINK_BASE}${thread.threadId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <code className="text-xs">{thread.threadId}</code>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {resolved && state.action ? (
        <div className="mt-2 text-xs italic text-muted-foreground">
          {DONE_LABEL[state.action]}
        </div>
      ) : (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={draftReply}
            aria-label={`Draft reply to ${thread.sender}`}
          >
            <MessageSquarePlus className="h-3 w-3" />
            <span className="ml-1">Draft reply</span>
          </Button>
          {thread.threadId && (
            <>
              <Button
                size="xs"
                variant="outline"
                onClick={() => submit('replied')}
                disabled={isPending}
                aria-label={`Mark ${thread.sender} replied`}
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
                aria-label={`Snooze ${thread.sender} for 2 days`}
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
                onClick={() => submit('dismissed')}
                disabled={isPending}
                aria-label={`Dismiss ${thread.sender}`}
              >
                {isPending && state.action === 'dismissed' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span className="ml-1">Dismiss</span>
              </Button>
            </>
          )}
          {state.kind === 'error' && (
            <span className="text-xs text-destructive">{state.message}</span>
          )}
        </div>
      )}
    </li>
  )
}

function SectionCard({ section }: { section: TriageSection }) {
  const reply = isReplySection(section.kind)
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          {SECTION_LABEL[section.kind] ?? section.title}
          <Badge variant={reply ? 'brand' : 'muted'}>{section.threads.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {section.threads.map((thread, i) => (
            <ThreadRow key={`${thread.sender}-${i}`} thread={thread} highlight={reply} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

interface LoadState {
  kind: 'loading' | 'ready' | 'error'
  entry?: TriageCacheEntry | null
  envelope?: TodosCacheEntry | null
  message?: string
}

export function TriageView() {
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' })

  const fetchLatest = useCallback(async () => {
    setLoad({ kind: 'loading' })
    try {
      const res = await fetch('/api/triage/latest', { cache: 'no-store' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const entry = (await res.json()) as TriageCacheEntry | null
      const envelope = entry?.output ? extractTodosEnvelope(entry.output) : null
      setLoad({ kind: 'ready', entry, envelope })
    } catch (e) {
      setLoad({
        kind: 'error',
        message: e instanceof Error ? e.message : String(e),
      })
    }
  }, [])

  useEffect(() => {
    void fetchLatest()
  }, [fetchLatest])

  const brief = useMemo(() => {
    if (load.kind !== 'ready' || !load.entry?.output) return null
    return parseTriageBrief(load.entry.output)
  }, [load])

  const orderedSections = useMemo(() => {
    if (!brief) return []
    return [...brief.sections]
      .filter(s => s.threads.length > 0)
      .sort((a, b) => SECTION_ORDER.indexOf(a.kind) - SECTION_ORDER.indexOf(b.kind))
  }, [brief])

  const totalThreads = orderedSections.reduce((n, s) => n + s.threads.length, 0)
  const replyCount = orderedSections
    .filter(s => isReplySection(s.kind))
    .reduce((n, s) => n + s.threads.length, 0)

  const ranAt = load.entry?.ranAt ?? null
  const isStale =
    ranAt !== null && Date.now() - new Date(ranAt).getTime() > STALE_THRESHOLD_MS

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Inbox Triage
          </h1>
          {ranAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last run {formatRelative(ranAt)}
              {replyCount > 0 && ` · ${replyCount} need reply`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RunTriageButton onComplete={fetchLatest} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void fetchLatest()}
            disabled={load.kind === 'loading'}
            aria-label="Refresh triage"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${load.kind === 'loading' ? 'animate-spin' : ''}`}
            />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {isStale && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Triage is over 14 hours old. Run <code>/daily-inbox-triage</code> for a
            fresh queue.
          </span>
        </div>
      )}

      {load.kind === 'loading' && (
        <p className="text-sm text-muted-foreground">Loading triage…</p>
      )}

      {load.kind === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Could not load triage: {load.message}</span>
        </div>
      )}

      {load.kind === 'ready' && !load.entry && (
        <EmptyState message="No triage has run yet. Run /daily-inbox-triage to build your queue." />
      )}

      {load.kind === 'ready' && load.entry && totalThreads === 0 && (
        <EmptyState message={brief?.summaryLine ?? 'Inbox is clean.'} />
      )}

      {load.kind === 'ready' && totalThreads > 0 && (
        <div className="flex flex-col gap-5">
          {orderedSections.map(section => (
            <SectionCard key={section.title} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted">
          <Inbox className="h-6 w-6 text-brand" />
        </div>
        <div>
          <p className="font-heading text-base font-medium text-foreground">
            Inbox is clean
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
