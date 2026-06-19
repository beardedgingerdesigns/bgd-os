// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import { RunTriageButton } from '@/components/run-triage-button'
import { TriageRunProvider } from '@/components/triage-run-provider'

// Build an SSE Response body from raw event strings.
function sse(...events: string[]): Response {
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(e))
      c.close()
    },
  })
  return new Response(stream, { status: 200 })
}

function renderButton() {
  return render(
    <TriageRunProvider>
      <RunTriageButton />
    </TriageRunProvider>,
  )
}

describe('RunTriageButton (shared run state)', () => {
  beforeEach(() => vi.restoreAllMocks())
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('posts to the run endpoint and settles back to idle on success', async () => {
    const fetchFn = vi.fn(async () =>
      sse(
        'event: start\ndata: {"at":"now"}\n\n',
        'event: stdout\ndata: {"chunk":"working"}\n\n',
        'event: done\ndata: {"status":"success","output":"x","exitCode":0,"durationMs":5}\n\n',
      ),
    )
    vi.stubGlobal('fetch', fetchFn)
    renderButton()

    fireEvent.click(screen.getByLabelText('Run triage now'))
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith('/api/triage/run', { method: 'POST' }))
    // Settles back to the idle label with no error.
    await waitFor(() => expect(screen.getByText('Run triage')).toBeTruthy())
    expect(screen.queryByText(/triage failed|timeout/)).toBeNull()
  })

  it('two buttons under one provider share the running state', async () => {
    // A never-resolving body keeps the run in flight so both buttons show it.
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    render(
      <TriageRunProvider>
        <RunTriageButton />
        <RunTriageButton />
      </TriageRunProvider>,
    )
    fireEvent.click(screen.getAllByLabelText('Run triage now')[0])
    await waitFor(() => expect(screen.getAllByText('process running')).toHaveLength(2))
  })

  it('surfaces an error on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      sse('event: done\ndata: {"status":"failed","error":"boom","exitCode":1,"durationMs":1}\n\n'),
    ))
    renderButton()
    fireEvent.click(screen.getByLabelText('Run triage now'))
    await waitFor(() => expect(screen.getByText('boom')).toBeTruthy())
  })
})
