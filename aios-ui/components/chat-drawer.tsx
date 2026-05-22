'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { ChatMessageView } from '@/components/chat-message'
import type { ChatMessage, ChatSession } from '@/lib/types'

interface ChatDrawerProps {
  clientSlug: string
  projectSlug: string
  projectName: string
}

interface BriefMeta {
  source: string
  builtAt: string
}

/** How many minutes ago a Date was (e.g. "3m ago", "65m ago"). */
function minutesAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60_000)
  if (mins <= 0) return 'just now'
  return `${mins}m ago`
}

/**
 * Fire-and-forget POST to /drop-session with the current messages.
 * Empty sessions (no messages or all-empty) are silently skipped by the
 * endpoint itself, but we also guard here to avoid a network round-trip.
 * We intentionally do NOT clear messages after the call — the operator's
 * view is preserved until the next page refresh / new session.
 */
async function postDropSession(
  clientSlug: string,
  projectSlug: string,
  messages: ChatMessage[],
): Promise<void> {
  if (messages.length === 0) return
  try {
    await fetch(`/api/chat/${clientSlug}/${projectSlug}/drop-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
  } catch {
    // Best-effort — operator will see the session file on the next open if
    // it was partially written; a missing receipt is acceptable here.
  }
}

export function ChatDrawer({ clientSlug, projectSlug, projectName }: ChatDrawerProps) {
  const [expanded, setExpanded] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [briefMeta, setBriefMeta] = useState<BriefMeta | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track the previous expanded value so we can detect expand→collapse
  // transitions for the auto-drop-session trigger.
  const prevExpandedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const streamInto = useCallback(async (
    res: Response,
    targetMessageIndex: number,
  ): Promise<void> => {
    if (!res.body) throw new Error('No response body')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const events = buf.split('\n\n')
      buf = events.pop() ?? ''
      for (const rawEvent of events) {
        const lines = rawEvent.split('\n')
        // Parse the SSE event name (e.g. "event: brief-meta") + data.
        const eventLine = lines.find(l => l.startsWith('event: '))
        const dataLine = lines.find(l => l.startsWith('data: '))
        if (!dataLine) continue
        let payload: unknown
        try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
        const p = payload as Record<string, unknown>

        // Route brief-meta separately; don't add it to messages.
        const eventName = eventLine ? eventLine.slice(7) : ''
        if (eventName === 'brief-meta') {
          if (typeof p.source === 'string' && typeof p.builtAt === 'string') {
            setBriefMeta({ source: p.source, builtAt: p.builtAt })
          }
          continue
        }

        if (typeof p?.text === 'string') {
          const t = p.text
          setMessages(prev => {
            const next = [...prev]
            next[targetMessageIndex] = {
              ...next[targetMessageIndex],
              content: next[targetMessageIndex].content + t,
            }
            return next
          })
        }
        if (p?.status === 'success') {
          setMessages(prev => {
            const next = [...prev]
            next[targetMessageIndex] = { ...next[targetMessageIndex], status: 'done' }
            return next
          })
        }
        if (p?.status === 'failed' || p?.status === 'timeout') {
          setMessages(prev => {
            const next = [...prev]
            next[targetMessageIndex] = {
              ...next[targetMessageIndex],
              status: 'error',
              error: (p.error as string) ?? `Subprocess ${p.status as string}`,
            }
            return next
          })
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!expanded || hasLoaded) return
    setHasLoaded(true)
    void (async () => {
      const sessionRes = await fetch(`/api/chat/${clientSlug}/${projectSlug}/session`)
      const existing = (await sessionRes.json()) as ChatSession | null
      if (existing) {
        setSession(existing)
        setMessages([{
          role: 'assistant',
          status: 'done',
          content: `_Resumed session from ${new Date(existing.startedAt).toLocaleString()}. Ask anything to continue._`,
        }])
        return
      }
      setMessages([{ role: 'assistant', status: 'streaming', content: '' }])
      setLoading(true)
      try {
        const res = await fetch(`/api/chat/${clientSlug}/${projectSlug}/load`, { method: 'POST' })
        await streamInto(res, 0)
      } catch (e) {
        setMessages(prev => {
          const next = [...prev]
          if (next[0]) {
            next[0] = { ...next[0], status: 'error', error: e instanceof Error ? e.message : String(e) }
          }
          return next
        })
      } finally {
        const sRes = await fetch(`/api/chat/${clientSlug}/${projectSlug}/session`)
        setSession((await sRes.json()) as ChatSession | null)
        setLoading(false)
      }
    })()
  }, [expanded, hasLoaded, clientSlug, projectSlug, streamInto])

  // Auto-drop session transcript when the drawer collapses (expanded true → false)
  // AND there are actual chat messages (not just the empty-drawer state).
  useEffect(() => {
    const wasExpanded = prevExpandedRef.current
    prevExpandedRef.current = expanded
    if (wasExpanded && !expanded && messages.length > 0) {
      void postDropSession(clientSlug, projectSlug, messages)
    }
  }, [expanded, messages, clientSlug, projectSlug])

  /** POST /refresh → clear UI state → trigger a fresh /load on next expand. */
  const onRefreshContext = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await fetch(`/api/chat/${clientSlug}/${projectSlug}/refresh`, { method: 'POST' })
    } catch {
      // ignore — next load will just see stale brief
    } finally {
      // Reset drawer to "not yet loaded" state — the next expand will re-run /load.
      setMessages([])
      setSession(null)
      setBriefMeta(null)
      setHasLoaded(false)
      setLoading(false)
    }
  }, [loading, clientSlug, projectSlug])

  /**
   * "New session" — drop the current transcript, then reset UI state so the
   * next expand triggers a fresh /load with new context.
   */
  const onNewSession = useCallback(async () => {
    if (loading) return
    // Drop the current session transcript before resetting.
    await postDropSession(clientSlug, projectSlug, messages)
    setMessages([])
    setSession(null)
    setBriefMeta(null)
    setHasLoaded(false)
  }, [loading, clientSlug, projectSlug, messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [
      ...prev,
      { role: 'user', status: 'done', content: text },
      { role: 'assistant', status: 'streaming', content: '' },
    ])
    setLoading(true)
    const assistantIndex = messages.length + 1
    try {
      const res = await fetch(`/api/chat/${clientSlug}/${projectSlug}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (res.status === 409) {
        setMessages(prev => {
          const next = [...prev]
          next[assistantIndex] = {
            ...next[assistantIndex],
            status: 'error',
            error: 'No active session. Reopen the drawer to load context.',
          }
          return next
        })
        return
      }
      await streamInto(res, assistantIndex)
    } catch (e) {
      setMessages(prev => {
        const next = [...prev]
        next[assistantIndex] = {
          ...next[assistantIndex],
          status: 'error',
          error: e instanceof Error ? e.message : String(e),
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const initialLoading = loading && messages.length <= 1 && !session

  /**
   * Walk the messages array backwards from index i to find the most recent
   * user turn before an assistant message. Returns undefined when not found
   * (e.g. the first assistant message before any user input).
   */
  function findPriorUserTurn(msgs: ChatMessage[], assistantIdx: number): string | undefined {
    for (let j = assistantIdx - 1; j >= 0; j--) {
      if (msgs[j].role === 'user') return msgs[j].content
    }
    return undefined
  }

  return (
    <Card className={expanded ? '' : 'border-dashed'}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-controls="chat-drawer-body"
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-xl"
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-medium">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mr-2">
                Chat
              </span>
              {projectName}
            </CardTitle>
            <span
              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-hidden
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </span>
          </div>
        </CardHeader>
      </button>
      {expanded && (
        <CardContent id="chat-drawer-body">
          {briefMeta && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                Brief loaded ({briefMeta.source}) — built {minutesAgo(new Date(briefMeta.builtAt))}
              </span>
              <button
                type="button"
                onClick={() => void onRefreshContext()}
                disabled={loading}
                className="hover:text-foreground underline-offset-2 hover:underline disabled:opacity-50"
              >
                Refresh context
              </button>
            </div>
          )}
          <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-4">
            {initialLoading && (
              <div className="space-y-3" aria-live="polite" aria-busy="true">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading project context
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/3 rounded-sm bg-muted/60 animate-pulse" />
                  <div className="h-3 w-5/6 rounded-sm bg-muted/60 animate-pulse" />
                  <div className="h-3 w-1/2 rounded-sm bg-muted/60 animate-pulse" />
                </div>
              </div>
            )}
            {!initialLoading && messages.map((m, i) => (
              <ChatMessageView
                key={i}
                message={m}
                clientSlug={clientSlug}
                projectSlug={projectSlug}
                priorUserTurn={m.role === 'assistant' ? findPriorUserTurn(messages, i) : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={session ? 'Ask anything · Cmd+Enter to send' : 'Loading context…'}
                disabled={loading && !session}
                rows={2}
                aria-label={`Message ${projectName}`}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/70 disabled:opacity-60"
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Send message">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {session && messages.length > 0 && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => void onNewSession()}
                  disabled={loading}
                  className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50 underline-offset-2 hover:underline transition-colors"
                >
                  New session
                </button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
