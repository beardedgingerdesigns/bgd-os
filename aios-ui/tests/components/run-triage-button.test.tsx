// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import { RunTriageButton } from '@/components/run-triage-button'

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

describe('RunTriageButton', () => {
  beforeEach(() => vi.restoreAllMocks())
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('runs and calls onComplete on success', async () => {
    const fetchFn = vi.fn(async () =>
      sse(
        'event: start\ndata: {"at":"now"}\n\n',
        'event: stdout\ndata: {"chunk":"working"}\n\n',
        'event: done\ndata: {"status":"success","output":"x","exitCode":0,"durationMs":5}\n\n',
      ),
    )
    vi.stubGlobal('fetch', fetchFn)
    const onComplete = vi.fn()
    render(<RunTriageButton onComplete={onComplete} />)

    fireEvent.click(screen.getByLabelText('Run triage now'))
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
    expect(fetchFn).toHaveBeenCalledWith('/api/triage/run', { method: 'POST' })
  })

  it('surfaces an error and does not call onComplete on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      sse('event: done\ndata: {"status":"failed","error":"boom","exitCode":1,"durationMs":1}\n\n'),
    ))
    const onComplete = vi.fn()
    render(<RunTriageButton onComplete={onComplete} />)

    fireEvent.click(screen.getByLabelText('Run triage now'))
    await waitFor(() => expect(screen.getByText('boom')).toBeTruthy())
    expect(onComplete).not.toHaveBeenCalled()
  })
})
