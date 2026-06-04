'use client'

// aios-ui/components/wiki-flag-detail.tsx
// Side-by-side contradiction viewer with resolution action buttons.
// Surfaces flagged entries from the wiki ingest evaluation pass (WIKI-04).

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ContestedEntry } from '@/lib/skills/wiki-ingest'

interface Props {
  entry: ContestedEntry
  clientSlug: string
  projectSlug: string
  onResolved: (file: string, action: 'accept' | 'skip') => void
}

const severityStyles: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-muted text-muted-foreground border-border',
}

export function WikiFlagDetail({ entry, clientSlug, projectSlug, onResolved }: Props) {
  const [resolvedAction, setResolvedAction] = useState<'accept' | 'skip' | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const severity = entry.contradiction.severity
  const badgeClass = severityStyles[severity] ?? severityStyles.medium

  async function handleResolve(action: 'accept' | 'skip') {
    setIsResolving(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/wiki/ingest/${clientSlug}/${projectSlug}/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: entry.file, action }),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }))
        setError(typeof body.error === 'string' ? body.error : `HTTP ${res.status}`)
        setIsResolving(false)
        return
      }

      setResolvedAction(action)
      setIsResolving(false)
      onResolved(entry.file, action)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setIsResolving(false)
    }
  }

  return (
    <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <code className="font-mono text-xs text-foreground/80">{entry.file}</code>
        <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeClass}`}>
          {severity}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Incoming</span>
          <p className="mt-0.5 text-foreground/90">{entry.contradiction.incoming_claim}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Existing ({entry.contradiction.existing_page})
          </span>
          <p className="mt-0.5 text-foreground/90">{entry.contradiction.existing_claim}</p>
        </div>
      </div>

      {resolvedAction ? (
        <div className="text-sm text-emerald-400">
          Resolved: {resolvedAction === 'skip' ? 'kept existing' : 'accepted incoming'}
        </div>
      ) : (
        <>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isResolving}
              onClick={() => handleResolve('skip')}
            >
              Keep existing
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isResolving}
              onClick={() => handleResolve('accept')}
            >
              Accept incoming
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Review manually
            </Button>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </>
      )}
    </div>
  )
}
