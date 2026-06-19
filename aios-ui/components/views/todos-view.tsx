'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X, Loader2, CheckCircle2 } from 'lucide-react'
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

// Per-todo transient UI state (which action is in-flight), keyed by id.
interface RowState {
  pending?: ResolveAction
  error?: string
}

export function TodosView() {
  const [todos, setTodos] = useState<PendingTodo[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rows, setRows] = useState<Record<string, RowState>>({})

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

  useEffect(() => {
    load()
  }, [load])

  const resolve = useCallback(async (id: string, action: ResolveAction) => {
    setRows(prev => ({ ...prev, [id]: { pending: action } }))
    // Optimistic removal — both actions take the item off the pending list.
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
      setRows(prev => {
        const { [id]: _drop, ...rest } = prev
        return rest
      })
    } catch (e) {
      // Revert the optimistic removal and surface the error on the row.
      setTodos(snapshot)
      setRows(prev => ({ ...prev, [id]: { error: e instanceof Error ? e.message : String(e) } }))
    }
  }, [todos])

  const groups = useMemo(() => {
    const map: Record<TodoPriority, PendingTodo[]> = { high: [], medium: [], low: [] }
    for (const t of todos ?? []) map[t.priority].push(t)
    return map
  }, [todos])

  if (todos === null) {
    return (
      <div>
        <Header total={0} />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  const total = todos.length

  return (
    <div>
      <Header total={total} />

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

function Header({ total }: { total: number }) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h1 className="text-xl font-heading font-semibold tracking-tight">Todos</h1>
      {total > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {total} open
        </span>
      )}
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
}

function TodoRow({ todo, state, onResolve }: TodoRowProps) {
  const isPending = Boolean(state.pending)

  return (
    <Card size="sm" className="px-4">
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
          </div>

          {todo.notes && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{todo.notes}</p>
          )}

          {state.error && (
            <p className="mt-2 text-xs text-destructive">{state.error}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onResolve(todo.id, 'dismiss')}
            disabled={isPending}
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
