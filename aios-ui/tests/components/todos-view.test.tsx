// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent, within } from '@testing-library/react'
import type { PendingTodo } from '@/lib/types'
import { TodosView } from '@/components/views/todos-view'

function todo(partial: Partial<PendingTodo> & { id: string; summary: string; priority: PendingTodo['priority'] }): PendingTodo {
  return { actionType: 'generic', ...partial }
}

const SAMPLE: PendingTodo[] = [
  todo({ id: 'h1', summary: 'High one', priority: 'high', source: 'manual', hashtag: 'ops', added: '2026-06-12' }),
  todo({ id: 'h2', summary: 'High two', priority: 'high', source: 'skill:dispatch', client: 'global-ag-network' }),
  todo({ id: 'm1', summary: 'Medium one', priority: 'medium', source: 'triage' }),
  todo({ id: 'l1', summary: 'Low one', priority: 'low', notes: 'a note' }),
]

function mockFetchOnce(todos: PendingTodo[]) {
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url)
    if (u.endsWith('/api/pending-todos') && (!init || init.method === undefined)) {
      return new Response(JSON.stringify({ todos }), { status: 200 })
    }
    // mutation route
    return new Response(JSON.stringify({ ok: true, todo: todos[0] }), { status: 200 })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('TodosView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders todos grouped by priority with per-group counts', async () => {
    mockFetchOnce(SAMPLE)
    render(<TodosView />)

    await waitFor(() => expect(screen.getByText('High one')).toBeTruthy())

    const high = screen.getByLabelText('High priority')
    expect(within(high).getByText('High one')).toBeTruthy()
    expect(within(high).getByText('High two')).toBeTruthy()
    // Count badge shows 2 for the high group.
    expect(within(high).getByText('2')).toBeTruthy()

    expect(screen.getByLabelText('Medium priority')).toBeTruthy()
    expect(screen.getByLabelText('Low priority')).toBeTruthy()

    // Source + client metadata surface.
    expect(screen.getByText('global-ag-network')).toBeTruthy()
    expect(screen.getByText('a note')).toBeTruthy()
  })

  it('shows the all-clear empty state when no todos', async () => {
    mockFetchOnce([])
    render(<TodosView />)
    await waitFor(() => expect(screen.getByText('All clear')).toBeTruthy())
  })

  it('optimistically removes a todo when Done is clicked', async () => {
    const fetchFn = mockFetchOnce(SAMPLE)
    render(<TodosView />)
    await waitFor(() => expect(screen.getByText('High one')).toBeTruthy())

    const card = screen.getByText('High one').closest('[data-slot="card"]') as HTMLElement
    const doneBtn = within(card).getByLabelText('Mark done')
    fireEvent.click(doneBtn)

    await waitFor(() => expect(screen.queryByText('High one')).toBeNull())
    // POST was issued to the mutation route with action: done.
    const postCall = fetchFn.mock.calls.find(c => String(c[0]).includes('/api/pending-todos/h1'))
    expect(postCall).toBeTruthy()
    expect(JSON.parse((postCall![1] as RequestInit).body as string)).toEqual({ action: 'done' })
  })
})
