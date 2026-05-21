'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Play, RefreshCw } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import { TriageOutput } from '@/components/triage-output'
import type { TriageCacheEntry } from '@/lib/types'

interface DailyIngestModalProps {
  initialCache: TriageCacheEntry | null
}

export function DailyIngestModal({ initialCache }: DailyIngestModalProps) {
  const [open, setOpen] = useState(false)
  const [cache, setCache] = useState<TriageCacheEntry | null>(initialCache)
  const [running, setRunning] = useState(false)
  const [liveOutput, setLiveOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!open) return
    void fetch('/api/triage/latest').then(async r => {
      const data = (await r.json()) as TriageCacheEntry | null
      setCache(data)
    })
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

  async function runIngest() {
    setRunning(true)
    setLiveOutput('')
    setError(null)
    try {
      const res = await fetch('/api/triage/run', { method: 'POST' })
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
          const dataLine = event.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          const payload = JSON.parse(dataLine.slice(6))
          if (payload?.chunk) setLiveOutput(prev => prev + payload.chunk)
          if (payload?.status === 'success') {
            setCache({
              ranAt: new Date().toISOString(),
              output: payload.output,
              exitCode: payload.exitCode,
              durationMs: payload.durationMs,
            })
          }
          if (payload?.status === 'failed' || payload?.status === 'timeout') {
            setError(payload.error ?? `Subprocess ${payload.status}`)
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }

  const cachedDate = cache ? cache.ranAt.slice(0, 10) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Run daily ingest</Button>} />
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily inbox triage</DialogTitle>
          <DialogDescription>
            Runs <code className="text-xs">/daily-inbox-triage</code>. Items link out to Gmail.
            {cachedDate && (
              <>
                {' '}Last run: <strong>{formatRelativeDate(cachedDate)}</strong>.
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
              Running the skill — <strong>{Math.floor(elapsedMs / 1000)}s</strong> elapsed.
              {liveOutput ? ' Streaming live output.' : ' Waiting for first chunk…'}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <TriageOutput markdown={running && liveOutput ? liveOutput : (cache?.output ?? '_No cached triage yet. Click "Run again" to start._')} />
        </div>

        <DialogFooter>
          <Button onClick={runIngest} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : cache ? <RefreshCw className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {cache ? 'Run again' : 'Run now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
