'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check, X, Loader2, CheckCircle2, Play, Clock, PauseCircle, Eye, EyeOff,
  AlertTriangle, RotateCcw, Pencil, ArrowDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KebabMenu, Menu, kebabItemClass, kebabItemDestructiveClass } from '@/components/ui/kebab-menu'
import { cn } from '@/lib/utils'
import type { PendingTodo, TodoPriority, DelegationActionType } from '@/lib/types'

type ResolveAction = 'done' | 'dismiss'

const PRIORITY_ORDER: TodoPriority[] = ['high', 'medium', 'low']

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
}

interface RowState {
  pending?: ResolveAction | 'snooze' | 'unsnooze' | 'block' | 'unblock' | 'demote' | 'edit-context'
  error?: string
  // Do It streaming
  acceptOutput?: string
  acceptError?: string | null
  pendingAccept?: boolean
  showOutput?: boolean
  // Snooze picker
  showSnooze?: boolean
  // Block input
  showBlock?: boolean
  blockText?: string
  // Edit context input
  showEditContext?: boolean
}

function isSnoozed(todo: PendingTodo): boolean {
  if (!todo.snoozedUntil) return false
  return new Date(todo.snoozedUntil) > new Date()
}

function sortBlockedLast(todos: PendingTodo[]): PendingTodo[] {
  return [...todos].sort((a, b) => {
    const aBlocked = a.blockedOn ? 1 : 0
    const bBlocked = b.blockedOn ? 1 : 0
    return aBlocked - bBlocked
  })
}

export function TodosView() {
  const [todos, setTodos] = useState<PendingTodo[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [showSnoozed, setShowSnoozed] = useState(false)
  const abortRefs = useRef<Record<string, AbortController>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/pending-todos', { cache: 'no-store' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const body = (await res.json()) as { todos: PendingTodo[] }
      setTodos(body.todos ?? [])
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
      setTodos(curr => curr ?? [])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resolve = useCallback(async (id: string, action: ResolveAction) => {
    setRows(prev => ({ ...prev, [id]: { pending: action } }))
    const snapshot = todos
    setTodos(curr => (curr ? curr.filter(t => t.id !== id) : curr))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
        throw new Error(typeof err.error === 'string' ? err.error : 'Request failed')
      }
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setTodos(snapshot)
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [todos])

  const doIt = useCallback(async (id: string) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], pendingAccept: true, acceptOutput: '', acceptError: null, showOutput: true } }))
    const controller = new AbortController()
    abortRefs.current[id] = controller

    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if ('text' in data) {
                setRows(prev => ({
                  ...prev,
                  [id]: { ...prev[id], acceptOutput: (prev[id]?.acceptOutput ?? '') + data.text },
                }))
              }
              if ('status' in data) {
                const success = data.status === 'success'
                if (success) {
                  setTodos(curr => curr ? curr.filter(t => t.id !== id) : curr)
                }
                setRows(prev => ({
                  ...prev,
                  [id]: {
                    ...prev[id],
                    pendingAccept: false,
                    acceptError: success ? null : (data.error ?? 'Action failed'),
                  },
                }))
              }
            } catch { /* skip malformed SSE */ }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setRows(prev => ({
          ...prev,
          [id]: { ...prev[id], pendingAccept: false, acceptError: e instanceof Error ? e.message : String(e) },
        }))
      }
    } finally {
      delete abortRefs.current[id]
    }
  }, [])

  const abortDoIt = useCallback((id: string) => {
    abortRefs.current[id]?.abort()
    setRows(prev => ({ ...prev, [id]: { ...prev[id], pendingAccept: false, acceptError: 'Aborted' } }))
  }, [])

  const snooze = useCallback(async (id: string, until: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'snooze', showSnooze: false } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'snooze', until }),
      })
      if (!res.ok) throw new Error('Snooze failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const unsnooze = useCallback(async (id: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'unsnooze' } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsnooze' }),
      })
      if (!res.ok) throw new Error('Unsnooze failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const block = useCallback(async (id: string, text: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'block', showBlock: false } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', text }),
      })
      if (!res.ok) throw new Error('Block failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const unblock = useCallback(async (id: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'unblock' } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock' }),
      })
      if (!res.ok) throw new Error('Unblock failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const demote = useCallback(async (id: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'demote' } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demote' }),
      })
      if (!res.ok) throw new Error('Demote failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const editContext = useCallback(async (id: string, context: string) => {
    setRows(prev => ({ ...prev, [id]: { pending: 'edit-context', showEditContext: false } }))
    try {
      const res = await fetch(`/api/pending-todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit-context', context }),
      })
      if (!res.ok) throw new Error('Edit context failed')
      await load()
      setRows(prev => { const { [id]: _, ...rest } = prev; return rest })
    } catch (e) {
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [load])

  const toggleRowState = useCallback((id: string, field: 'showSnooze' | 'showBlock' | 'showEditContext') => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], [field]: !prev[id]?.[field] } }))
  }, [])

  // Activity feed
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([])
  useEffect(() => {
    fetch('/api/activity-log', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { entries: [] })
      .then((body: { entries: ActivityEntry[] }) => setActivityEntries(body.entries ?? []))
      .catch(() => {})
  }, [todos])

  // Filter + group
  const { activeTodos, snoozedCount } = useMemo(() => {
    const all = todos ?? []
    const snoozed = all.filter(isSnoozed)
    const active = showSnoozed ? all : all.filter(t => !isSnoozed(t))
    return { activeTodos: active, snoozedCount: snoozed.length }
  }, [todos, showSnoozed])

  const { delegationQueue, humanOnly } = useMemo(() => {
    const delegation: PendingTodo[] = []
    const human: PendingTodo[] = []
    for (const t of activeTodos) {
      if (t.action) delegation.push(t)
      else human.push(t)
    }
    return {
      delegationQueue: sortBlockedLast(delegation),
      humanOnly: sortBlockedLast(human),
    }
  }, [activeTodos])

  if (todos === null) {
    return (
      <div>
        <Header total={0} snoozedCount={0} showSnoozed={false} onToggleSnoozed={() => {}} />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  const total = activeTodos.length

  return (
    <div>
      <Header
        total={total}
        snoozedCount={snoozedCount}
        showSnoozed={showSnoozed}
        onToggleSnoozed={() => setShowSnoozed(s => !s)}
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn&apos;t load todos: {loadError}
        </div>
      )}

      {total === 0 && !loadError ? (
        <AllClear />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Delegation queue */}
          {delegationQueue.length > 0 && (
            <section aria-label="Delegation queue">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight">Delegation Queue</h2>
                <Badge variant="brand" className="tabular-nums">{delegationQueue.length}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {delegationQueue.map(todo => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    state={rows[todo.id] ?? {}}
                    onResolve={resolve}
                    onDoIt={doIt}
                    onAbortDoIt={abortDoIt}
                    onSnooze={snooze}
                    onUnsnooze={unsnooze}
                    onBlock={block}
                    onUnblock={unblock}
                    onDemote={demote}
                    onEditContext={editContext}
                    onToggle={toggleRowState}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Needs you (human-only) */}
          {humanOnly.length > 0 && (
            <section aria-label="Needs you" className="opacity-70">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">Needs You</h2>
                <Badge variant="muted" className="tabular-nums">{humanOnly.length}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {humanOnly.map(todo => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    state={rows[todo.id] ?? {}}
                    onResolve={resolve}
                    onDoIt={doIt}
                    onAbortDoIt={abortDoIt}
                    onSnooze={snooze}
                    onUnsnooze={unsnooze}
                    onBlock={block}
                    onUnblock={unblock}
                    onDemote={demote}
                    onEditContext={editContext}
                    onToggle={toggleRowState}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Activity feed */}
          {activityEntries.length > 0 && (
            <ActivityFeed entries={activityEntries} />
          )}
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  total: number
  snoozedCount: number
  showSnoozed: boolean
  onToggleSnoozed: () => void
}

function Header({ total, snoozedCount, showSnoozed, onToggleSnoozed }: HeaderProps) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h1 className="text-xl font-heading font-semibold tracking-tight">Todos</h1>
      <div className="flex items-center gap-3">
        {snoozedCount > 0 && (
          <button
            onClick={onToggleSnoozed}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSnoozed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            <span className="tabular-nums">{snoozedCount} snoozed</span>
          </button>
        )}
        {total > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {total} open
          </span>
        )}
      </div>
    </div>
  )
}

function AllClear() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <CheckCircle2 className="mb-3 size-8 text-brand" aria-hidden="true" />
      <p className="text-sm font-medium">All clear</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Nothing pending. New items land here from triage, dispatch, and manual capture.
      </p>
    </div>
  )
}

interface TodoRowProps {
  todo: PendingTodo
  state: RowState
  onResolve: (id: string, action: ResolveAction) => void | Promise<void>
  onDoIt: (id: string) => void | Promise<void>
  onAbortDoIt: (id: string) => void
  onSnooze: (id: string, until: string) => void | Promise<void>
  onUnsnooze: (id: string) => void | Promise<void>
  onBlock: (id: string, text: string) => void | Promise<void>
  onUnblock: (id: string) => void | Promise<void>
  onDemote: (id: string) => void | Promise<void>
  onEditContext: (id: string, context: string) => void | Promise<void>
  onToggle: (id: string, field: 'showSnooze' | 'showBlock' | 'showEditContext') => void
}

function TodoRow({
  todo, state, onResolve, onDoIt, onAbortDoIt, onSnooze, onUnsnooze,
  onBlock, onUnblock, onDemote, onEditContext, onToggle,
}: TodoRowProps) {
  const isPending = Boolean(state.pending)
  const isBlocked = Boolean(todo.blockedOn)
  const isSnoozedNow = isSnoozed(todo)
  const canDoIt = Boolean(todo.action) || todo.actionType === 'email' || todo.actionType === 'calendar'

  return (
    <Card size="sm" className={cn('px-4', isBlocked && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{todo.summary}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {todo.action && (
              <Badge variant="brand" className="text-[10px] uppercase tracking-wider">
                {todo.action}
              </Badge>
            )}
            {todo.source && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {todo.source}
              </Badge>
            )}
            {todo.hashtag && (
              <Badge variant="muted" className="text-[10px] tracking-wide">
                #{todo.hashtag}
              </Badge>
            )}
            {todo.client && (
              <span className="text-[11px] text-muted-foreground">{todo.client}</span>
            )}
            {todo.added && (
              <span className="text-[11px] text-muted-foreground tabular-nums">
                · {todo.added}
              </span>
            )}
            {isSnoozedNow && (
              <Badge variant="muted" className="text-[10px]">
                snoozed until {todo.snoozedUntil}
              </Badge>
            )}
          </div>

          {todo.blockedOn && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Waiting on: {todo.blockedOn}
            </p>
          )}

          {todo.notes && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{todo.notes}</p>
          )}

          {/* Review state — bounced action */}
          {todo.reviewReason && (
            <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3" />
                <span className="font-medium">Bounced:</span>
                <span>{todo.reviewReason}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onDoIt(todo.id)} className="h-6 text-[10px]">
                  <RotateCcw className="size-3 mr-1" />Retry
                </Button>
                <Button size="sm" variant="outline" onClick={() => onToggle(todo.id, 'showEditContext')} className="h-6 text-[10px]">
                  <Pencil className="size-3 mr-1" />Edit Context
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDemote(todo.id)} className="h-6 text-[10px]">
                  <ArrowDown className="size-3 mr-1" />Demote
                </Button>
              </div>
            </div>
          )}

          {/* Edit context input for review state */}
          {state.showEditContext && (
            <EditContextInput
              todoId={todo.id}
              currentContext={todo.actionContext ?? ''}
              onEditContext={onEditContext}
            />
          )}

          {/* Do It streaming output */}
          {state.showOutput && state.acceptOutput && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-md bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {state.acceptOutput}
            </div>
          )}

          {state.acceptError && (
            <p className="mt-2 text-xs text-destructive">{state.acceptError}</p>
          )}

          {state.error && (
            <p className="mt-2 text-xs text-destructive">{state.error}</p>
          )}

          {/* Snooze picker */}
          {state.showSnooze && <SnoozePicker todoId={todo.id} onSnooze={onSnooze} />}

          {/* Block input */}
          {state.showBlock && <BlockInput todoId={todo.id} onBlock={onBlock} />}
        </div>

        <div className="flex shrink-0 items-start gap-1">
          {/* Primary action: Do It (when applicable) or Done */}
          {canDoIt && !state.pendingAccept && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onDoIt(todo.id)}
              disabled={isPending}
              aria-label="Do it"
            >
              <Play className="size-3.5" />
              <span className="ml-1.5 text-xs">Do It</span>
            </Button>
          )}
          {state.pendingAccept && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onAbortDoIt(todo.id)}
              aria-label="Stop"
            >
              <Loader2 className="size-3.5 animate-spin" />
              <span className="ml-1.5 text-xs">Stop</span>
            </Button>
          )}
          {!canDoIt && !state.pendingAccept && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onResolve(todo.id, 'done')}
              disabled={isPending}
              aria-label="Mark done"
            >
              {state.pending === 'done'
                ? <Loader2 className="size-3.5 animate-spin" />
                : <Check className="size-3.5" />}
              <span className="ml-1.5 text-xs">Done</span>
            </Button>
          )}

          {/* Kebab menu for secondary actions */}
          <KebabMenu
            busy={isPending}
            label={`Actions for ${todo.summary}`}
          >
            {/* Done (when Do It is the primary) */}
            {canDoIt && (
              <Menu.Item
                onClick={() => onResolve(todo.id, 'done')}
                className={kebabItemClass}
              >
                <Check className="h-4 w-4" />
                Done
              </Menu.Item>
            )}

            {/* Snooze / Unsnooze */}
            {isSnoozedNow ? (
              <Menu.Item
                onClick={() => onUnsnooze(todo.id)}
                className={kebabItemClass}
              >
                <Clock className="h-4 w-4" />
                Un-snooze
              </Menu.Item>
            ) : (
              <Menu.Item
                onClick={() => onToggle(todo.id, 'showSnooze')}
                className={kebabItemClass}
              >
                <Clock className="h-4 w-4" />
                Snooze
              </Menu.Item>
            )}

            {/* Block / Unblock */}
            {isBlocked ? (
              <Menu.Item
                onClick={() => onUnblock(todo.id)}
                className={kebabItemClass}
              >
                <PauseCircle className="h-4 w-4" />
                Clear block
              </Menu.Item>
            ) : (
              <Menu.Item
                onClick={() => onToggle(todo.id, 'showBlock')}
                className={kebabItemClass}
              >
                <PauseCircle className="h-4 w-4" />
                Blocked
              </Menu.Item>
            )}

            <Menu.Separator className="my-1 h-px bg-border" />

            {/* Dismiss */}
            <Menu.Item
              onClick={() => onResolve(todo.id, 'dismiss')}
              className={kebabItemDestructiveClass}
            >
              <X className="h-4 w-4" />
              Dismiss
            </Menu.Item>
          </KebabMenu>
        </div>
      </div>
    </Card>
  )
}

function SnoozePicker({ todoId, onSnooze }: { todoId: string; onSnooze: (id: string, until: string) => void }) {
  const [customDate, setCustomDate] = useState('')

  const tomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const nextMonday = () => {
    const d = new Date()
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
    return d.toISOString().split('T')[0]
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => onSnooze(todoId, tomorrow())}>
        <span className="text-xs">Tomorrow</span>
      </Button>
      <Button size="sm" variant="outline" onClick={() => onSnooze(todoId, nextMonday())}>
        <span className="text-xs">Next week</span>
      </Button>
      <input
        type="date"
        value={customDate}
        onChange={e => setCustomDate(e.target.value)}
        min={tomorrow()}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs"
      />
      {customDate && (
        <Button size="sm" variant="outline" onClick={() => onSnooze(todoId, customDate)}>
          <span className="text-xs">Snooze</span>
        </Button>
      )}
    </div>
  )
}

interface ActivityEntry {
  timestamp: string
  actionType: string
  clientSlug: string
  summary: string
  artifactPath: string
}

const ACTION_LABEL: Record<string, string> = {
  'draft-email': 'Email drafted',
  'update-state': 'State updated',
  'stage-wiki': 'Staged to wiki',
  'research': 'Research completed',
  'bounced': 'Bounced',
}

function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section aria-label="Recent activity">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">Recent Activity</h2>
        <Badge variant="muted" className="tabular-nums">{entries.length}</Badge>
      </div>
      <div className="flex flex-col gap-1">
        {entries.map((entry, i) => (
          <div key={`${entry.timestamp}-${i}`} className="flex items-baseline gap-2 px-1 py-1 text-xs text-muted-foreground">
            <span className="tabular-nums shrink-0">{entry.timestamp}</span>
            <Badge
              variant={entry.actionType === 'bounced' ? 'destructive' : 'muted'}
              className="text-[9px] shrink-0"
            >
              {ACTION_LABEL[entry.actionType] ?? entry.actionType}
            </Badge>
            <span className="truncate">{entry.summary}</span>
            <span className="shrink-0 text-[10px]">→ {entry.artifactPath}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function EditContextInput({ todoId, currentContext, onEditContext }: {
  todoId: string; currentContext: string; onEditContext: (id: string, context: string) => void
}) {
  const [text, setText] = useState(currentContext)

  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Updated action context..."
        className="min-h-[60px] w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
        autoFocus
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => { if (text.trim()) onEditContext(todoId, text.trim()) }}
        disabled={!text.trim()}
        className="self-start"
      >
        <span className="text-xs">Save & Retry</span>
      </Button>
    </div>
  )
}

function BlockInput({ todoId, onBlock }: { todoId: string; onBlock: (id: string, text: string) => void }) {
  const [text, setText] = useState('')

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Waiting on..."
        className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
        onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onBlock(todoId, text.trim()) }}
        autoFocus
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => { if (text.trim()) onBlock(todoId, text.trim()) }}
        disabled={!text.trim()}
      >
        <span className="text-xs">Block</span>
      </Button>
    </div>
  )
}
