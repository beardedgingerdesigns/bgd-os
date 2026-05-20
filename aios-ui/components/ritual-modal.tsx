'use client'

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
import { Loader2, Play, RefreshCw } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import type { RitualCacheEntry, RitualSlug } from '@/lib/types'

interface RitualModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: RitualSlug
  title: string
  description: string
  initialCache: RitualCacheEntry | null
}

export function RitualModal({
  open,
  onOpenChange,
  slug,
  title,
  description,
  initialCache,
}: RitualModalProps) {
  const [cache, setCache] = useState<RitualCacheEntry | null>(initialCache)
  const [running, setRunning] = useState(false)
  const [liveOutput, setLiveOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { setCache(initialCache) }, [initialCache])

  useEffect(() => {
    if (!open) abortRef.current?.abort()
  }, [open])

  useEffect(() => {
    if (!running) {
      setElapsedMs(0)
      return
    }
    const startedAt = Date.now()
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 500)
    return () => clearInterval(id)
  }, [running])

  async function runRitual() {
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setLiveOutput('')
    setError(null)
    try {
      const res = await fetch(`/api/admin/${slug}`, { method: 'POST', signal: controller.signal })
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
          const eventLine = event.split('\n').find(l => l.startsWith('event: '))
          const dataLine = event.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          let data: unknown
          try { data = JSON.parse(dataLine.slice(6)) } catch { continue }
          const p = data as Record<string, unknown>
          if (eventLine?.includes('chunk') && typeof p.text === 'string') {
            setLiveOutput(prev => prev + (p.text as string))
          }
          if (eventLine?.includes('done')) {
            if (p.status === 'success') {
              setCache({
                ritual: slug,
                ranAt: new Date().toISOString(),
                output: typeof p.output === 'string' ? p.output : '',
                exitCode: typeof p.exitCode === 'number' ? p.exitCode : -1,
                durationMs: typeof p.durationMs === 'number' ? p.durationMs : 0,
              })
            } else {
              setError((p.error as string) ?? `Ritual ${p.status as string}`)
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }

  const cachedDate = cache ? cache.ranAt.slice(0, 10) : null
  const displayOutput =
    running && liveOutput
      ? liveOutput
      : (cache?.output ?? '_Never run. Click below to start._')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {cachedDate && (
              <>
                {' '}Last ran: <strong>{formatRelativeDate(cachedDate)}</strong>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {running && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Running — <strong>{Math.floor(elapsedMs / 1000)}s</strong> elapsed.
              {liveOutput ? ' Streaming live output.' : ' Waiting for first chunk…'}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed text-foreground/90">
            {displayOutput}
          </pre>
        </div>

        <DialogFooter>
          <Button onClick={runRitual} disabled={running}>
            {running
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : cache
                ? <RefreshCw className="h-4 w-4 mr-2" />
                : <Play className="h-4 w-4 mr-2" />}
            {cache ? 'Run again' : 'Run now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
