'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Play } from 'lucide-react'

interface Props {
  // Called once the run finishes successfully — the host view re-fetches its data.
  onComplete?: () => void
  className?: string
}

// Runs /daily-inbox-triage via the existing /api/triage/run SSE endpoint (which
// now also drafts Sync state proposals via the skill's reconcile step). Compact
// inline control: shows elapsed time while running, surfaces errors, and calls
// onComplete on success. The run route publishes an invalidation, so the Sync
// badge updates on its own.
export function RunTriageButton({ onComplete, className }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!running) {
      setElapsed(0)
      return
    }
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500)
    return () => clearInterval(id)
  }, [running])

  const run = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/triage/run', { method: 'POST' })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let failure: string | null = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const event of events) {
          const dataLine = event.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          let payload: { status?: string; error?: string }
          try {
            payload = JSON.parse(dataLine.slice(6))
          } catch {
            continue
          }
          if (payload.status === 'failed' || payload.status === 'timeout') {
            failure = payload.error ?? `triage ${payload.status}`
          }
        }
      }
      if (failure) {
        setError(failure)
        return
      }
      onComplete?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }, [onComplete])

  return (
    <div className={className}>
      <Button size="sm" variant="outline" onClick={run} disabled={running} aria-label="Run triage now">
        {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
        <span className="ml-1.5 text-xs">{running ? `Running… ${elapsed}s` : 'Run triage'}</span>
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
