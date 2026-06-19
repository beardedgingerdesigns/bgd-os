'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

// Shared triage-run state, mounted above the swappable views so a run persists
// across in-app navigation: every RunTriageButton reads the same `running`, and
// `completedCount` lets each view re-fetch when a run finishes regardless of
// which view kicked it off.
//
// Scope: in-app session only. A hard page reload resets this, and it does not
// yet reflect runs started by the scheduled background task — that would need a
// server-side run-status endpoint.
interface TriageRunValue {
  running: boolean
  error: string | null
  completedCount: number
  run: () => void
}

const TriageRunContext = createContext<TriageRunValue | null>(null)

export function TriageRunProvider({ children }: { children: React.ReactNode }) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const inFlight = useRef(false)

  const run = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
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
      if (failure) setError(failure)
      else setCompletedCount(c => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
      inFlight.current = false
    }
  }, [])

  return (
    <TriageRunContext.Provider value={{ running, error, completedCount, run }}>
      {children}
    </TriageRunContext.Provider>
  )
}

export function useTriageRun(): TriageRunValue {
  const ctx = useContext(TriageRunContext)
  if (!ctx) throw new Error('useTriageRun must be used within TriageRunProvider')
  return ctx
}
