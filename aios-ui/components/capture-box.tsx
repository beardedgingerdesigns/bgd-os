'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, Check, AlertCircle } from 'lucide-react'

interface CaptureBoxProps {
  clientSlug: string
  projectSlug: string
  projectName: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export function CaptureBox({ clientSlug, projectSlug, projectName }: CaptureBoxProps) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function submit() {
    const payload = text.trim()
    if (!payload || status.kind === 'submitting') return
    setStatus({ kind: 'submitting' })

    let aggregated = ''
    try {
      const res = await fetch(`/api/capture/${clientSlug}/${projectSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payload }),
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let finalEvent: { status: string; output: string; error?: string } | null = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const events = buf.split('\n\n')
        buf = events.pop() ?? ''
        for (const event of events) {
          const eventLine = event.split('\n').find(l => l.startsWith('event: '))
          const dataLine = event.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          let payload: unknown
          try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
          const p = payload as Record<string, unknown>
          if (eventLine?.includes('chunk') && typeof p.text === 'string') {
            aggregated += p.text
          }
          if (eventLine?.includes('done')) {
            finalEvent = p as { status: string; output: string; error?: string }
          }
        }
      }
      if (finalEvent?.status === 'success') {
        const summary = (finalEvent.output || aggregated).trim().split('\n').slice(0, 3).join(' ')
        setStatus({ kind: 'success', message: summary || 'Captured.' })
        setText('')
      } else {
        setStatus({
          kind: 'error',
          message: finalEvent?.error ?? finalEvent?.status ?? 'Capture failed.',
        })
      }
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setText('')
      setStatus({ kind: 'idle' })
    }
  }

  const submitting = status.kind === 'submitting'

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Capture
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">
          ⌘↵ to send
        </span>
      </div>
      <div className="border-y border-border py-3 space-y-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Type a memory, decision, commitment for ${projectName}…`}
          rows={3}
          disabled={submitting}
          aria-label={`Capture text for ${projectName}`}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/70 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs flex-1 min-w-0" aria-live="polite">
            {status.kind === 'submitting' && (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Capturing…
              </span>
            )}
            {status.kind === 'success' && (
              <span className="inline-flex items-center gap-2 text-brand">
                <Check className="h-3 w-3" />
                <span className="truncate">{status.message}</span>
              </span>
            )}
            {status.kind === 'error' && (
              <span className="inline-flex items-center gap-2 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span className="truncate">{status.message}</span>
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => void submit()}
            disabled={!text.trim() || submitting}
            aria-label="Capture"
          >
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Capture
          </Button>
        </div>
      </div>
    </section>
  )
}
