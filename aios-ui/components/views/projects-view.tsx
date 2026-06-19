'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/format'
import type { StateData } from '@/app/api/state/route'
import type { ProjectStateCard } from '@/lib/data/state'

function statusVariant(status: string | null): 'success' | 'warning' | 'info' | 'muted' {
  const s = (status ?? '').toLowerCase()
  if (s.includes('block')) return 'warning'
  if (s.includes('track') || s.includes('done') || s.includes('complete')) return 'success'
  if (s.includes('wrap') || s.includes('progress')) return 'info'
  return 'muted'
}

function firstSentences(text: string, count: number): string {
  const prose = text.replace(/\s+/g, ' ').trim()
  if (!prose) return prose
  const sentences = prose.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g)
  if (!sentences) return prose
  return sentences.slice(0, count).join(' ').trim()
}

function ProjectCard({ card }: { card: ProjectStateCard }) {
  const summary = card.currentStatus ? firstSentences(card.currentStatus, 2) : ''
  const nextStep = card.nextSteps[0] ?? null

  return (
    <Card className={card.stale ? 'gap-3 opacity-60' : 'gap-3'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate">{card.title}</span>
          {card.status && (
            <Badge variant={statusVariant(card.status)} className="shrink-0">
              {card.status}
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {card.updated ? (
            <span>Updated {formatRelativeDate(card.updated)}</span>
          ) : (
            <span>No update date</span>
          )}
          {card.stale && (
            <Badge variant="warning" className="shrink-0">
              Stale
            </Badge>
          )}
          {card.health === 'blocked' && (
            <Badge variant="destructive" className="shrink-0">
              Blocked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary && (
          <p className="text-sm leading-relaxed text-card-foreground/90 line-clamp-3">
            {summary}
          </p>
        )}

        {card.blockers.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-destructive font-medium mb-1.5">
              Blockers
            </div>
            <ul className="space-y-1">
              {card.blockers.slice(0, 2).map((b, i) => (
                <li key={i} className="flex gap-2 text-xs text-destructive/90 leading-snug">
                  <span className="mt-px shrink-0">!</span>
                  <span className="line-clamp-2">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextStep && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
              Next Step
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground leading-snug">
              <span className="text-brand mt-px shrink-0">→</span>
              <span className="line-clamp-2">{nextStep}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProjectsView() {
  const [data, setData] = useState<StateData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/state')
      .then(res => {
        if (!res.ok) throw new Error(`projects fetch failed (${res.status})`)
        return res.json() as Promise<StateData>
      })
      .then(d => {
        if (!cancelled) setData(d)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 className="text-xl font-heading font-semibold tracking-tight mb-6">Projects</h1>

      {error && (
        <p className="text-sm text-destructive mb-6">Could not load projects: {error}</p>
      )}

      {!data && !error && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}

      {data && data.cards.length === 0 && (
        <p className="text-sm text-muted-foreground">No project state files yet.</p>
      )}

      {data && data.cards.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {data.cards.map(card => (
            <ProjectCard key={card.slug} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}
