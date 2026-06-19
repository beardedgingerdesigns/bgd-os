'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, RotateCcw } from 'lucide-react'
import { ChatMessageView } from '@/components/chat-message'
import type { ChatMessage } from '@/lib/types'

const AIOS_CLIENT = '_aios'
const AIOS_PROJECT = '_aios'

export function ChatPanel() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const streamInto = useCallback(async (
    res: Response,
    targetMessageIndex: number,
  ): Promise<string | null> => {
    if (!res.body) throw new Error('No response body')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let capturedSessionId: string | null = null
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const events = buf.split('\n\n')
      buf = events.pop() ?? ''
      for (const rawEvent of events) {
        const lines = rawEvent.split('\n')
        const dataLine = lines.find(l => l.startsWith('data: '))
        if (!dataLine) continue
        let payload: unknown
        try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
        const p = payload as Record<string, unknown>

        if (p.type === 'chunk' && typeof p.text === 'string') {
          setMessages(prev => {
            const copy = [...prev]
            const msg = copy[targetMessageIndex]
            if (msg) copy[targetMessageIndex] = { ...msg, content: msg.content + p.text }
            return copy
          })
        }
        if (p.type === 'done' && typeof p.sessionId === 'string') {
          capturedSessionId = p.sessionId
        }
      }
    }
    return capturedSessionId
  }, [])

  const startSession = useCallback(async () => {
    setLoading(true)
    setMessages([])
    const assistantIdx = 0
    setMessages([{ role: 'assistant', content: '' }])
    try {
      const res = await fetch(`/api/chat/aios/load`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error(`Load failed: ${res.status}`)
      const sid = await streamInto(res, assistantIdx)
      if (sid) setSessionId(sid)
      setConnected(true)
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection error: ${e instanceof Error ? e.message : String(e)}`,
      }])
    } finally {
      setLoading(false)
    }
  }, [streamInto])

  useEffect(() => {
    startSession()
  }, [startSession])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading || !sessionId) return
    setInput('')
    setLoading(true)

    const userMsg: ChatMessage = { role: 'user', content: text }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }

    setMessages(prev => {
      const next = [...prev, userMsg, assistantMsg]
      return next
    })

    try {
      const res = await fetch(`/api/chat/aios/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      })
      if (!res.ok) throw new Error(`Message failed: ${res.status}`)
      const targetIdx = messages.length + 1
      await streamInto(res, targetIdx)
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, sessionId, messages.length, streamInto])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-brand animate-pulse'}`} />
          <span className="text-sm font-medium font-heading">AIOS</span>
          {sessionId && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {sessionId.slice(0, 8)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={startSession}
          disabled={loading}
          title="New session"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessageView key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? 'Message AIOS...' : 'Connecting...'}
            disabled={!connected || loading}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!input.trim() || loading || !connected}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
