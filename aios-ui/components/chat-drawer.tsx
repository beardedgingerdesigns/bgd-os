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

export function ChatDrawer({ clientSlug, projectSlug, projectName }: ChatDrawerProps) {
  const [expanded, setExpanded] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      for (const event of events) {
        const dataLine = event.split('\n').find(l => l.startsWith('data: '))
        if (!dataLine) continue
        let payload: unknown
        try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
        const p = payload as Record<string, unknown>
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

  return (
    <Card className={expanded ? '' : 'border-dashed'}>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Chat — {projectName}</CardTitle>
          <Button variant="ghost" size="icon">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">Expanding for the first time — loading project context…</p>
            )}
            {messages.map((m, i) => <ChatMessageView key={i} message={m} />)}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={session ? 'Ask anything — Cmd+Enter to send' : 'Loading context…'}
                disabled={loading && !session}
                rows={2}
                className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
