'use client'

// Lets sibling views (e.g. the triage cards' "Draft reply") hand a seeded
// prompt to the always-mounted AIOS ChatPanel. The panel watches `pending` and
// sends it once its session is connected. `nonce` makes repeat sends of the
// same text distinct so the panel's effect re-fires.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface PendingPrompt {
  text: string
  nonce: number
}

interface ChatComposeValue {
  pending: PendingPrompt | null
  compose: (text: string) => void
  clear: () => void
}

const ChatComposeContext = createContext<ChatComposeValue | null>(null)

export function ChatComposeProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingPrompt | null>(null)

  const compose = useCallback((text: string) => {
    setPending(prev => ({ text, nonce: (prev?.nonce ?? 0) + 1 }))
  }, [])

  const clear = useCallback(() => setPending(null), [])

  const value = useMemo(
    () => ({ pending, compose, clear }),
    [pending, compose, clear],
  )

  return (
    <ChatComposeContext.Provider value={value}>
      {children}
    </ChatComposeContext.Provider>
  )
}

export function useChatCompose(): ChatComposeValue {
  const ctx = useContext(ChatComposeContext)
  if (!ctx) {
    throw new Error('useChatCompose must be used within ChatComposeProvider')
  }
  return ctx
}
