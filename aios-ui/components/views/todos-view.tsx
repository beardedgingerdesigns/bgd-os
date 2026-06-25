'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check, X, Loader2, CheckCircle2, Play, Clock, PauseCircle, Eye, EyeOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PendingTodo, TodoPriority } from '@/lib/types'

type ResolveAction = 'done' | 'dismiss'

const PRIORITY_ORDER: TodoPriority[] = ['high', 'medium', 'low']

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
}

interface RowState {
  pending?: ResolveAction | 'snooze' | 'unsnooze' | 'block' | 'unblock'
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

  const toggleRowState = useCallback((id: string, field: 'showSnooze' | 'showBlock') => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], [field]: !prev[id]?.[field] } }))
  }, [])

  // Filter + group
  const { activeTodos, snoozedCount } = useMemo(() => {
    const all = todos ?? []
    const snoozed = all.filter(isSnoozed)
    const active = showSnoozed ? all : all.filter(t => !isSnoozed(t))
    return { activeTodos: active, snoozedCount: snoozed.length }
  }, [todos, showSnoozed])

  const groups = useMemo(() => {
    const map: Record<TodoPriority, PendingTodo[]> = { high: [], medium: [], low: [] }
    for (const t of activeTodos) map[t.priority].push(t)
    // Sort blocked last within each group
    for (const p of PRIORITY_ORDER) map[p] = sortBlockedLast(map[p])
    return map
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
          {PRIORITY_ORDER.map(priority => {
            const items = groups[priority]
            if (items.length === 0) return null
            return (
              <section key={priority} aria-label={PRIORITY_LABEL[priority]}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {PRIORITY_LABEL[priority]}
                  </h2>
                  <Badge variant={priority === 'high' ? 'brand' : 'muted'} className="tabular-nums">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map(todo => (
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
                      onToggle={toggleRowState}
                    />
                  ))}
                </div>
              </section>
            )
          })}
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
  onToggle: (id: string, field: 'showSnooze' | 'showBlock') => void
}

function TodoRow({
  todo, state, onResolve, onDoIt, onAbortDoIt, onSnooze, onUnsnooze,
  onBlock, onUnblock, onToggle,
}: TodoRowProps) {
  const isPending = Boolean(state.pending)
  const isBlocked = Boolean(todo.blockedOn)
  const isSnoozedNow = isSnoozed(todo)
  const canDoIt = todo.actionType === 'email' || todo.actionType === 'calendar'

  return (
    <Card size="sm" className={cn('px-4', isBlocked && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{todo.summary}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
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

        <div className="flex shrink-0 flex-col gap-1">
          {/* Do It */}
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

          {/* Done */}
          <Button
            size="sm"
            variant="default"
            onClick={() => onResolve(todo.id, 'done')}
            disabled={isPending || state.pendingAccept}
            aria-label="Mark done"
          >
            {state.pending === 'done'
              ? <Loader2 className="size-3.5 animate-spin" />
              : <Check className="size-3.5" />}
            <span className="ml-1.5 text-xs">Done</span>
          </Button>

          {/* Snooze / Unsnooze */}
          {isSnoozedNow ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUnsnooze(todo.id)}
              disabled={isPending}
              aria-label="Un-snooze"
            >
              {state.pending === 'unsnooze'
                ? <Loader2 className="size-3.5 animate-spin" />
                : <Clock className="size-3.5" />}
              <span className="ml-1.5 text-xs">Wake</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(todo.id, 'showSnooze')}
              disabled={isPending || state.pendingAccept}
              aria-label="Snooze"
            >
              <Clock className="size-3.5" />
              <span className="ml-1.5 text-xs">Snooze</span>
            </Button>
          )}

          {/* Block / Unblock */}
          {isBlocked ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUnblock(todo.id)}
              disabled={isPending}
              aria-label="Clear block"
            >
              {state.pending === 'unblock'
                ? <Loader2 className="size-3.5 animate-spin" />
                : <PauseCircle className="size-3.5" />}
              <span className="ml-1.5 text-xs">Unblock</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(todo.id, 'showBlock')}
              disabled={isPending || state.pendingAccept}
              aria-label="Mark blocked"
            >
              <PauseCircle className="size-3.5" />
              <span className="ml-1.5 text-xs">Blocked</span>
            </Button>
          )}

          {/* Dismiss */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onResolve(todo.id, 'dismiss')}
            disabled={isPending || state.pendingAccept}
            aria-label="Dismiss"
          >
            {state.pending === 'dismiss'
              ? <Loader2 className="size-3.5 animate-spin" />
              : <X className="size-3.5" />}
            <span className="ml-1.5 text-xs">Dismiss</span>
          </Button>
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
