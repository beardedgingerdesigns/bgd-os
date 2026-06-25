'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Send, RotateCcw } from 'lucide-react'
import { ChatMessageView } from '@/components/chat-message'
import { useChatCompose } from '@/components/chat-compose-provider'
import type { ChatMessage, SlashCommand } from '@/lib/types'

const MAX_INPUT_HEIGHT = 160 // px — textarea grows to here, then scrolls
const MAX_MENU_RESULTS = 8

// Rank commands for the slash menu: exact > prefix > substring > subsequence,
// shorter names first. Mirrors the terminal's fuzzy command picker.
function fuzzyScore(query: string, name: string): number {
  if (!query) return 1
  if (name === query) return 1000
  if (name.startsWith(query)) return 500 - name.length
  if (name.includes(query)) return 200 - name.length
  let qi = 0
  for (let i = 0; i < name.length && qi < query.length; i++) {
    if (name[i] === query[qi]) qi++
  }
  return qi === query.length ? 50 - name.length : 0
}

function matchCommands(query: string, commands: SlashCommand[]): SlashCommand[] {
  const q = query.toLowerCase()
  return commands
    .map(c => ({ c, score: fuzzyScore(q, c.name.toLowerCase()) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name))
    .slice(0, MAX_MENU_RESULTS)
    .map(x => x.c)
}

export function ChatPanel() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [commands, setCommands] = useState<SlashCommand[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuDismissed, setMenuDismissed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Load the available slash commands once for the autocomplete menu.
  useEffect(() => {
    fetch('/api/commands')
      .then(res => (res.ok ? (res.json() as Promise<SlashCommand[]>) : []))
      .then(setCommands)
      .catch(() => { /* menu just stays empty */ })
  }, [])

  // The slash menu shows when the whole input is a bare command token: a
  // leading "/" with no space yet. Once a space is typed, it's a real message.
  const commandQuery = useMemo(() => {
    const m = /^\/(\S*)$/.exec(input)
    return m ? m[1] : null
  }, [input])

  const matches = useMemo(
    () => (commandQuery === null ? [] : matchCommands(commandQuery, commands)),
    [commandQuery, commands],
  )
  const menuOpen = matches.length > 0 && !menuDismissed

  useEffect(() => { setActiveIndex(0) }, [commandQuery])

  const autoGrow = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }, [])

  const resetInput = useCallback(() => {
    setInput('')
    const el = inputRef.current
    if (el) el.style.height = 'auto'
  }, [])

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
        // The event name lives on the SSE `event:` line, not inside the data.
        const eventName = lines.find(l => l.startsWith('event: '))?.slice(7).trim()
        const dataLine = lines.find(l => l.startsWith('data: '))
        if (!dataLine) continue
        let payload: unknown
        try { payload = JSON.parse(dataLine.slice(6)) } catch { continue }
        const p = payload as Record<string, unknown>

        if (eventName === 'chunk' && typeof p.text === 'string') {
          setMessages(prev => {
            const copy = [...prev]
            const msg = copy[targetMessageIndex]
            if (msg) copy[targetMessageIndex] = { ...msg, content: msg.content + p.text }
            return copy
          })
        }
        if (eventName === 'done' && typeof p.sessionId === 'string') {
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

  const submit = useCallback(async (raw: string) => {
    const text = raw.trim()
    if (!text || loading || !sessionId) return
    setLoading(true)

    const userMsg: ChatMessage = { role: 'user', content: text }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])

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
  }, [loading, sessionId, messages.length, streamInto])

  const sendMessage = useCallback(() => {
    if (!input.trim() || loading || !sessionId) return
    resetInput()
    void submit(input)
  }, [input, loading, sessionId, resetInput, submit])

  // A sibling view (triage "Draft reply") can seed a prompt; send it once the
  // session is connected and idle. submit() and the guards keep this from
  // double-firing — clear() flips `pending` to null after the first send.
  const { pending, clear } = useChatCompose()
  useEffect(() => {
    if (!pending || !connected || !sessionId || loading) return
    void submit(pending.text)
    clear()
  }, [pending, connected, sessionId, loading, submit, clear])

  const acceptCommand = useCallback((cmd: SlashCommand) => {
    setInput(`/${cmd.name} `)
    setMenuDismissed(false)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      autoGrow()
    })
  }, [autoGrow])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => (i + 1) % matches.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => (i - 1 + matches.length) % matches.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        acceptCommand(matches[activeIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenuDismissed(true)
        return
      }
    }
    // Enter sends; Shift+Enter inserts a newline (textarea default).
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [menuOpen, matches, activeIndex, acceptCommand, sendMessage])

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-brand animate-pulse'}`} />
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
        <div className="relative flex items-end gap-2">
          {menuOpen && (
            <ul
              className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-[var(--shadow-elevated)]"
              role="listbox"
            >
              {matches.map((cmd, i) => (
                <li
                  key={cmd.name}
                  role="option"
                  aria-selected={i === activeIndex}
                  // onMouseDown (not click) so it fires before the textarea blurs.
                  onMouseDown={e => { e.preventDefault(); acceptCommand(cmd) }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`cursor-pointer px-3 py-1.5 ${i === activeIndex ? 'bg-accent/10' : ''}`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">/{cmd.name}</span>
                  </div>
                  {cmd.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {cmd.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => { setInput(e.target.value); setMenuDismissed(false); autoGrow() }}
            onKeyDown={handleKeyDown}
            placeholder={connected ? 'Message AIOS…  (/ for commands)' : 'Connecting…'}
            disabled={!connected || loading}
            className="flex-1 resize-none px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
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
