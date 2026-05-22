'use client'

// aios-ui/components/chat-message-drop-button.tsx
//
// Phase 04 — Plan 08 (HUB-05): per-AI-message "Drop to raw" button.
// Renders a small inline button on each assistant message that POSTs to
// /api/chat/[client]/[project]/drop-decision.
// On success: label changes to "Dropped" for 2s then the button is permanently
// disabled for this render (state is local — no persistence needed).

import { useState } from 'react'

interface ChatMessageDropButtonProps {
  clientSlug: string
  projectSlug: string
  userTurn: string
  assistantTurn: string
  disabled?: boolean
}

type DropState = 'idle' | 'loading' | 'success' | 'error'

export function ChatMessageDropButton({
  clientSlug,
  projectSlug,
  userTurn,
  assistantTurn,
  disabled = false,
}: ChatMessageDropButtonProps) {
  const [state, setState] = useState<DropState>('idle')
  const [errorText, setErrorText] = useState<string>('')
  const [permanentlyDropped, setPermanentlyDropped] = useState(false)

  async function handleDrop() {
    if (disabled || state === 'loading' || permanentlyDropped) return
    setState('loading')
    setErrorText('')
    try {
      const res = await fetch(`/api/chat/${clientSlug}/${projectSlug}/drop-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userTurn, assistantTurn }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorText(body.error ?? `Error ${res.status}`)
        setState('error')
        return
      }
      setState('success')
      // Show "Dropped" feedback for 2s then lock permanently.
      setTimeout(() => {
        setPermanentlyDropped(true)
        setState('idle')
      }, 2000)
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Network error')
      setState('error')
    }
  }

  const isDisabled = disabled || state === 'loading' || permanentlyDropped

  const label =
    permanentlyDropped
      ? 'Dropped'
      : state === 'success'
        ? 'Dropped'
        : state === 'loading'
          ? 'Dropping…'
          : 'Drop to raw'

  return (
    <div className="mt-1 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => void handleDrop()}
        disabled={isDisabled}
        className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-default underline-offset-2 hover:underline transition-colors"
      >
        {label}
      </button>
      {state === 'error' && errorText && (
        <span className="text-[11px] text-destructive">{errorText}</span>
      )}
    </div>
  )
}
