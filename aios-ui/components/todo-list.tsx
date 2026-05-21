'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Loader2, Play, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Todo, TodoStatus, TodoType, TodosCacheEntry } from '@/lib/types'

interface TodoListProps {
  initial: TodosCacheEntry | null
}

const TYPE_LABEL: Record<TodoType, string> = {
  email_reply: 'Email reply',
  follow_up: 'Follow-up',
  calendar_check: 'Calendar',
  decision_log: 'Decision',
  generic: 'Todo',
}

const TYPE_BADGE_VARIANT: Record<TodoType, 'outline' | 'secondary'> = {
  email_reply: 'secondary',
  follow_up: 'outline',
  calendar_check: 'outline',
  decision_log: 'outline',
  generic: 'outline',
}

type ManualAction = 'done' | 'dismiss' | 'reopen'

// Per-todo UI state that lives outside the persisted todo (live output, errors,
// expanded toggles). Keyed by todo id.
interface UiState {
  expanded?: boolean
  acceptOutput?: string         // streamed text from the accept subprocess
  acceptError?: string | null
  pendingAction?: 'accept' | ManualAction
}

export function TodoList({ initial }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(() => initial?.todos ?? [])
  const [ui, setUi] = useState<Record<string, UiState>>({})
  const abortRefs = useRef<Record<string, AbortController>>({})

  // Sync with server data after a router.refresh() (driven by SSE invalidate).
  // We replace the canonical fields from initial; UI-only state (live output,
  // expanded toggles) is keyed separately so it survives the refresh.
  useEffect(() => {
    setTodos(initial?.todos ?? [])
  }, [initial])

  const counts = useMemo(() => {
    const c = { open: 0, done: 0, dismissed: 0, in_progress: 0 }
    for (const t of todos) {
      if (t.status === 'done') c.done++
      else if (t.status === 'dismissed') c.dismissed++
      else if (t.status === 'in_progress') c.in_progress++
      else c.open++
    }
    return c
  }, [todos])

  const patchUi = useCallback((id: string, patch: Partial<UiState>) => {
    setUi(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setUi(prev => ({ ...prev, [id]: { ...prev[id], expanded: !prev[id]?.expanded } }))
  }, [])

  const mutateTodo = useCallback(async (id: string, action: ManualAction) => {
    const prev = todos.find(t => t.id === id)
    if (!prev) return
    const optimisticStatus: TodoStatus =
      action === 'done' ? 'done' : action === 'dismiss' ? 'dismissed' : 'open'
    // Optimistic update so the click feels instant; SSE-driven router.refresh()
    // arrives a few ms later and reconciles with cache-truth.
    setTodos(curr => curr.map(t => (t.id === id ? { ...t, status: optimisticStatus } : t)))
    patchUi(id, { pendingAction: action })
    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        // Revert on failure.
        setTodos(curr => curr.map(t => (t.id === id ? prev : t)))
        const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
        patchUi(id, { acceptError: typeof err.error === 'string' ? err.error : 'Request failed' })
      }
    } catch (e) {
      setTodos(curr => curr.map(t => (t.id === id ? prev : t)))
      patchUi(id, { acceptError: e instanceof Error ? e.message : String(e) })
    } finally {
      patchUi(id, { pendingAction: undefined })
    }
  }, [todos, patchUi])

  const acceptTodo = useCallback(async (id: string) => {
    const target = todos.find(t => t.id === id)
    if (!target) return
    // Cancel any prior accept stream for this todo (defensive — UI disables the
    // button while pending, but a stale fetch from a prior render could exist).
    abortRefs.current[id]?.abort()
    const controller = new AbortController()
    abortRefs.current[id] = controller

    setTodos(curr => curr.map(t => (t.id === id ? { ...t, status: 'in_progress' } : t)))
    patchUi(id, { pendingAction: 'accept', acceptOutput: '', acceptError: null, expanded: true })

    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        signal: controller.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `status ${res.status}` }))
        throw new Error(typeof err.error === 'string' ? err.error : 'Accept failed')
      }
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const event of events) {
          const lines = event.split('\n')
          const eventLine = lines.find(l => l.startsWith('event: '))
          const dataLine = lines.find(l => l.startsWith('data: '))
          if (!dataLine) continue
          let payload: unknown
          try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
          const p = payload as Record<string, unknown>
          if (eventLine?.includes('chunk') && typeof p.text === 'string') {
            const text = p.text
            setUi(prev => ({
              ...prev,
              [id]: { ...prev[id], acceptOutput: (prev[id]?.acceptOutput ?? '') + text },
            }))
          }
          if (eventLine?.includes('done')) {
            if (p.status === 'success') {
              // Server already wrote 'done' to cache + published invalidate.
              // Update locally for instant feedback; router.refresh() will arrive shortly.
              setTodos(curr => curr.map(t => (t.id === id ? { ...t, status: 'done' } : t)))
            } else {
              setTodos(curr => curr.map(t => (t.id === id ? { ...t, status: 'open' } : t)))
              patchUi(id, {
                acceptError: typeof p.error === 'string' ? p.error : `Action ${String(p.status)}`,
              })
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // User navigated away; leave UI as-is.
      } else {
        setTodos(curr => curr.map(t => (t.id === id ? target : t)))
        patchUi(id, { acceptError: e instanceof Error ? e.message : String(e) })
      }
    } finally {
      patchUi(id, { pendingAction: undefined })
      delete abortRefs.current[id]
    }
  }, [todos, patchUi])

  if (!initial) {
    return (
      <section className="mb-10">
        <SectionHeader counts={null} />
        <div className="p-5 rounded-md bg-card border border-dashed border-border text-sm text-muted-foreground">
          No todos yet. Run <span className="font-medium text-foreground">/daily-inbox-triage</span> from the
          Daily ingest tile to generate today&apos;s queue.
        </div>
      </section>
    )
  }

  if (todos.length === 0) {
    return (
      <section className="mb-10">
        <SectionHeader counts={counts} generatedAt={initial.generatedAt} />
        <div className="p-5 rounded-md bg-card border border-border text-sm text-muted-foreground">
          Inbox is clean as of {formatTime(initial.generatedAt)}. Nothing to triage right now.
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <SectionHeader counts={counts} generatedAt={initial.generatedAt} />
      <div className="grid grid-cols-1 gap-3">
        {todos.map(t => (
          <TodoCard
            key={t.id}
            todo={t}
            ui={ui[t.id] ?? {}}
            onAccept={acceptTodo}
            onMutate={mutateTodo}
            onToggleExpanded={toggleExpanded}
          />
        ))}
      </div>
    </section>
  )
}

function SectionHeader({
  counts,
  generatedAt,
}: {
  counts: { open: number; done: number; dismissed: number; in_progress?: number } | null
  generatedAt?: string
}) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-base font-semibold tracking-tight">Today&apos;s todos</h2>
      <div className="text-xs text-muted-foreground tabular-nums">
        {counts && (
          <span>
            {counts.open} open
            {counts.in_progress ? ` · ${counts.in_progress} running` : ''}
            {counts.done > 0 && ` · ${counts.done} done`}
            {counts.dismissed > 0 && ` · ${counts.dismissed} dismissed`}
          </span>
        )}
        {generatedAt && <span className="ml-2">· {formatTime(generatedAt)}</span>}
      </div>
    </div>
  )
}

interface TodoCardProps {
  todo: Todo
  ui: UiState
  onAccept: (id: string) => void | Promise<void>
  onMutate: (id: string, action: ManualAction) => void | Promise<void>
  onToggleExpanded: (id: string) => void
}

function TodoCard({ todo, ui, onAccept, onMutate, onToggleExpanded }: TodoCardProps) {
  const isResolved = todo.status === 'done' || todo.status === 'dismissed'
  const isRunning = todo.status === 'in_progress' || ui.pendingAction === 'accept'
  const isPending = Boolean(ui.pendingAction)
  const hasContext = Boolean(todo.context)
  const hasLiveOutput = Boolean(ui.acceptOutput && ui.acceptOutput.length > 0)
  const showExpanded = ui.expanded || isRunning || hasLiveOutput

  return (
    <article
      className={cn(
        'p-4 rounded-md bg-card border border-border transition-colors',
        isResolved && 'opacity-60',
        isRunning && 'border-brand/40',
      )}
      aria-label={`Todo: ${todo.summary}`}
      aria-busy={isRunning || undefined}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={TYPE_BADGE_VARIANT[todo.type]} className="text-[10px] uppercase tracking-wider">
              {TYPE_LABEL[todo.type]}
            </Badge>
            {todo.status === 'done' && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Done</Badge>
            )}
            {todo.status === 'dismissed' && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Dismissed</Badge>
            )}
            {todo.status === 'in_progress' && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Running…</Badge>
            )}
            {todo.client_slug && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {todo.client_slug}
                {todo.project_slug ? ` · ${todo.project_slug}` : ''}
              </span>
            )}
          </div>
          <p
            className={cn(
              'mt-2 text-sm font-medium leading-snug',
              (todo.status === 'done' || todo.status === 'dismissed') && 'line-through text-muted-foreground',
            )}
          >
            {todo.summary}
          </p>
          {(hasContext || hasLiveOutput || ui.acceptError) && (
            <button
              type="button"
              onClick={() => onToggleExpanded(todo.id)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              aria-expanded={showExpanded}
            >
              {showExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {showExpanded ? 'Hide details' : 'Show details'}
            </button>
          )}
          {showExpanded && hasContext && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {todo.context}
            </p>
          )}
          {showExpanded && (hasLiveOutput || isRunning) && (
            <div className="mt-3 rounded-md bg-muted/40 border border-border p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
                Action output
              </div>
              <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed text-foreground/90">
                {ui.acceptOutput || (isRunning ? 'Waiting for first chunk…' : '')}
              </pre>
            </div>
          )}
          {showExpanded && ui.acceptError && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {ui.acceptError}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {!isResolved && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onAccept(todo.id)}
                disabled={isPending}
                aria-label="Accept and run action"
              >
                {ui.pendingAction === 'accept'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Play className="h-3.5 w-3.5" />}
                <span className="ml-1.5 text-xs">
                  {ui.pendingAction === 'accept' ? 'Running' : 'Accept'}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMutate(todo.id, 'done')}
                disabled={isPending}
                aria-label="Mark done without running action"
              >
                <Check className="h-3.5 w-3.5" />
                <span className="ml-1.5 text-xs">Done</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMutate(todo.id, 'dismiss')}
                disabled={isPending}
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
                <span className="ml-1.5 text-xs">Dismiss</span>
              </Button>
            </>
          )}
          {isResolved && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMutate(todo.id, 'reopen')}
              disabled={isPending}
              aria-label="Reopen"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="ml-1.5 text-xs">Reopen</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return iso
  }
}
