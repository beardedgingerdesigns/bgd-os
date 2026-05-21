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
import { Loader2, Play, RefreshCw, Send } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import { ChatMessageView } from '@/components/chat-message'
import type { ChatMessage, RitualCacheEntry, RitualSlug } from '@/lib/types'

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

  // Chat state for follow-up Q&A on the report. The session is captured on the
  // first turn so subsequent turns can `--resume` instead of re-pasting the
  // report. Resetting these whenever the ritual re-runs keeps chat scoped to
  // the report on screen.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  const chatAbortRef = useRef<AbortController | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setCache(initialCache) }, [initialCache])

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort()
      chatAbortRef.current?.abort()
    }
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function runRitual() {
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setLiveOutput('')
    setError(null)
    // Re-running invalidates the prior chat — the report has changed.
    setChatMessages([])
    setChatSessionId(null)
    setChatInput('')
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

  async function sendChat() {
    const message = chatInput.trim()
    if (!message || chatLoading) return
    const report = (cache?.output ?? liveOutput ?? '').trim()
    if (!report) return

    // Optimistic user echo + a streaming assistant placeholder.
    const userMsg: ChatMessage = { role: 'user', content: message, status: 'done' }
    const assistantIdx = chatMessages.length + 1
    setChatMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', status: 'streaming' }])
    setChatInput('')
    setChatLoading(true)

    const controller = new AbortController()
    chatAbortRef.current = controller

    try {
      const res = await fetch(`/api/admin/${slug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(
          chatSessionId
            ? { sessionId: chatSessionId, message }
            : { report, message },
        ),
      })
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
          const lines = event.split('\n')
          const eventLine = lines.find(l => l.startsWith('event: '))
          const dataLine = lines.find(l => l.startsWith('data: '))
          if (!dataLine) continue
          let data: unknown
          try { data = JSON.parse(dataLine.slice(6)) } catch { continue }
          const p = data as Record<string, unknown>
          if (eventLine?.includes('chunk') && typeof p.text === 'string') {
            const text = p.text
            setChatMessages(prev => {
              const next = [...prev]
              if (next[assistantIdx]) {
                next[assistantIdx] = { ...next[assistantIdx], content: next[assistantIdx].content + text }
              }
              return next
            })
          }
          if (eventLine?.includes('done')) {
            if (p.status === 'success') {
              setChatMessages(prev => {
                const next = [...prev]
                if (next[assistantIdx]) {
                  next[assistantIdx] = { ...next[assistantIdx], status: 'done' }
                }
                return next
              })
              if (typeof p.sessionId === 'string' && p.sessionId.length > 0) {
                setChatSessionId(p.sessionId)
              }
            } else {
              setChatMessages(prev => {
                const next = [...prev]
                if (next[assistantIdx]) {
                  next[assistantIdx] = {
                    ...next[assistantIdx],
                    status: 'error',
                    error: typeof p.error === 'string' ? p.error : `Subprocess ${String(p.status)}`,
                  }
                }
                return next
              })
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setChatMessages(prev => {
        const next = [...prev]
        if (next[assistantIdx]) {
          next[assistantIdx] = {
            ...next[assistantIdx],
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
          }
        }
        return next
      })
    } finally {
      setChatLoading(false)
      chatAbortRef.current = null
    }
  }

  function onChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void sendChat()
    }
  }

  const cachedDate = cache ? cache.ranAt.slice(0, 10) : null
  const displayOutput =
    running && liveOutput
      ? liveOutput
      : (cache?.output ?? '_Never run. Click below to start._')
  const hasReport = Boolean((cache?.output ?? liveOutput ?? '').trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl sm:max-w-4xl max-h-[85vh] overflow-y-auto">
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
          <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-7 text-foreground/90">
            {displayOutput}
          </pre>
        </div>

        {/* Follow-up chat about this report. Only renders when there's
            something to chat about. */}
        {hasReport && (
          <div className="border-t border-border pt-3 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Ask follow-ups
            </div>
            {chatMessages.length > 0 && (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {chatMessages.map((m, i) => <ChatMessageView key={i} message={m} />)}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={onChatKeyDown}
                placeholder="Ask anything about this report · Cmd+Enter to send"
                rows={2}
                disabled={chatLoading || running}
                aria-label={`Ask follow-up about ${title} report`}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/70 disabled:opacity-60"
              />
              <Button
                onClick={sendChat}
                disabled={chatLoading || running || chatInput.trim().length === 0}
                aria-label="Send follow-up"
              >
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

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
