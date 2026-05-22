'use client'

// aios-ui/components/wiki-ingest-modal.tsx
// Client component — SSE consumer for the wiki ingest endpoint.
// Mirrors RitualModal pattern: POST → ReadableStream → SSE events → live output.

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import type { WikiIngestSummary } from '@/lib/skills/wiki-ingest'

interface Props {
  clientSlug: string
  projectSlug: string
  open: boolean
  onClose: () => void
}

type Status = 'idle' | 'streaming' | 'success' | 'failed'

export function WikiIngestModal({ clientSlug, projectSlug, open, onClose }: Props) {
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [summary, setSummary] = useState<WikiIngestSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasStartedRef = useRef(false)
  const outputEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll live output
  useEffect(() => {
    if (status === 'streaming') {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [output, status])

  // Start the ingest stream when the modal opens (once per open session)
  useEffect(() => {
    if (!open) {
      hasStartedRef.current = false
      return
    }
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    void runIngest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function runIngest() {
    setOutput('')
    setStatus('streaming')
    setSummary(null)
    setError(null)

    try {
      const res = await fetch(`/api/wiki/ingest/${clientSlug}/${projectSlug}`, {
        method: 'POST',
      })

      if (!res.body) {
        setStatus('failed')
        setError('No response body from server')
        return
      }

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

          let data: unknown
          try { data = JSON.parse(dataLine.slice(6)) } catch { continue }
          const p = data as Record<string, unknown>

          if (eventLine?.includes('chunk') && typeof p.text === 'string') {
            setOutput(prev => prev + (p.text as string))
          }

          if (eventLine?.includes('done')) {
            if (p.status === 'success') {
              setStatus('success')
              if (p.summary && typeof p.summary === 'object') {
                const s = p.summary as Record<string, unknown>
                setSummary({
                  promoted: Array.isArray(s.promoted) ? (s.promoted as string[]) : [],
                  deferred: Array.isArray(s.deferred) ? (s.deferred as string[]) : [],
                  contested: Array.isArray(s.contested) ? (s.contested as string[]) : [],
                })
              }
            } else {
              setStatus('failed')
              setError(typeof p.error === 'string' ? p.error : `Ingest ${String(p.status)}`)
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus('failed')
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wiki Ingest</DialogTitle>
          <DialogDescription>
            Running <code className="font-mono text-xs">/ingest-aios-drops</code> to promote
            pending raw drops into the wiki.
          </DialogDescription>
        </DialogHeader>

        {status === 'streaming' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {output ? 'Streaming ingest output…' : 'Starting ingest subprocess…'}
            </span>
          </div>
        )}

        {error && (
          <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/*
          Phase 04 review WR-02: <div> inside <pre> is invalid HTML and triggers
          a React hydration warning in dev. The sentinel must live outside the
          <pre> so its bounding rect is stable for scrollIntoView. Moved the
          overflow-y to the wrapper so the scroll container owns the sentinel.
        */}
        <div className="border-t border-border pt-3">
          <div className="max-h-[40vh] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-7 text-foreground/90">
              {output || (status === 'idle' ? 'Waiting to start…' : '')}
            </pre>
            <div ref={outputEndRef} />
          </div>
        </div>

        {status === 'success' && summary && (
          <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            <span className="font-medium text-emerald-300">Ingest complete:</span>{' '}
            <span className="text-foreground/80">
              promoted {summary.promoted.length}, deferred {summary.deferred.length}, contested {summary.contested.length}
            </span>
          </div>
        )}

        {status === 'success' && !summary && (
          <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-300">
            Ingest complete.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
