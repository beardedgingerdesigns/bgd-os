// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent, within } from '@testing-library/react'
import type { StateUpdateProposal } from '@/lib/types'
import { SyncView } from '@/components/views/sync-view'

function proposal(over: Partial<StateUpdateProposal> & { id: string }): StateUpdateProposal {
  return {
    slug: 'wild-rose',
    field: 'current_status',
    current: 'Launch window mid/late June',
    proposed: 'Launch slipped to mid-July',
    evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
    confidence: 'high',
    stateUpdatedAt: '2026-06-09',
    dedupeKey: 'k',
    createdAt: '2026-06-19T13:45:00Z',
    ...over,
  }
}

const SAMPLE = [
  proposal({ id: 'su-1' }),
  proposal({
    id: 'su-2',
    slug: 'tonequest',
    field: 'status',
    current: 'Launched',
    proposed: 'Behind / slipping',
    confidence: 'low',
    evidence: { source: 'triage', threadId: 't2', sender: 'editor@tonequest.com', date: '2026-06-18' },
  }),
]

// applyStatus lets a test force the apply route's response code.
function mockFetch(proposals: StateUpdateProposal[], applyStatus = 200) {
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url)
    const method = init?.method ?? 'GET'
    if (u.endsWith('/api/state-updates') && method === 'GET') {
      return new Response(JSON.stringify({ proposals, dismissed: [] }), { status: 200 })
    }
    if (u.includes('/apply')) {
      return applyStatus === 200
        ? new Response(JSON.stringify({ ok: true, slug: 'wild-rose' }), { status: 200 })
        : new Response(JSON.stringify({ error: 'stale' }), { status: applyStatus })
    }
    if (method === 'DELETE') {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
    return new Response('{}', { status: 200 })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('SyncView', () => {
  beforeEach(() => vi.restoreAllMocks())
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders a proposal diff, evidence, and confidence label', async () => {
    mockFetch(SAMPLE)
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy())
    expect(screen.getByText(/Launch window mid\/late June/)).toBeTruthy()
    expect(screen.getByText('high confidence')).toBeTruthy()
    expect(screen.getByText('review')).toBeTruthy() // the low-confidence one
    expect(screen.getByText(/meghan@x\.com/)).toBeTruthy()
  })

  it('shows the empty state when no proposals', async () => {
    mockFetch([])
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText('No pending updates')).toBeTruthy())
  })

  it('optimistically removes a card and POSTs apply', async () => {
    const fetchFn = mockFetch([proposal({ id: 'su-1' })])
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy())

    fireEvent.click(screen.getByLabelText('Apply update'))
    await waitFor(() => expect(screen.queryByText(/Launch slipped to mid-July/)).toBeNull())
    const call = fetchFn.mock.calls.find(c => String(c[0]).includes('/api/state-updates/su-1/apply'))
    expect(call).toBeTruthy()
  })

  it('keeps the card and shows a re-review note when apply is stale (409)', async () => {
    mockFetch([proposal({ id: 'su-1' })], 409)
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy())

    fireEvent.click(screen.getByLabelText('Apply update'))
    await waitFor(() => expect(screen.getByText(/re-review before applying/)).toBeTruthy())
    // Card is still present.
    expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy()
  })

  it('edits the proposed value and sends it on apply', async () => {
    const fetchFn = mockFetch([proposal({ id: 'su-1' })])
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy())

    fireEvent.click(screen.getByLabelText('Edit'))
    const textarea = screen.getByLabelText('Edit proposed value') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Launch moved to August' } })
    fireEvent.click(screen.getByLabelText('Apply update'))

    await waitFor(() => {
      const call = fetchFn.mock.calls.find(c => String(c[0]).includes('/su-1/apply'))
      expect(call).toBeTruthy()
      expect(JSON.parse((call![1] as RequestInit).body as string)).toEqual({ proposed: 'Launch moved to August' })
    })
  })

  it('dismisses a card via DELETE', async () => {
    const fetchFn = mockFetch([proposal({ id: 'su-1' })])
    render(<SyncView />)
    await waitFor(() => expect(screen.getByText(/Launch slipped to mid-July/)).toBeTruthy())

    fireEvent.click(screen.getByLabelText('Dismiss update'))
    await waitFor(() => expect(screen.queryByText(/Launch slipped to mid-July/)).toBeNull())
    const del = fetchFn.mock.calls.find(
      c => String(c[0]).includes('/api/state-updates/su-1') && (c[1] as RequestInit)?.method === 'DELETE',
    )
    expect(del).toBeTruthy()
  })
})
