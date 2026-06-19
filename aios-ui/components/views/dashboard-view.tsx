'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatTile } from '@/components/stat-tile'
import { formatMRR, formatRelativeDate } from '@/lib/format'
import type { DashboardData } from '@/app/api/dashboard/route'
import type { ProjectStateCard } from '@/lib/data/state'

function statusVariant(status: string | null): 'success' | 'warning' | 'info' | 'muted' {
  const s = (status ?? '').toLowerCase()
  if (s.includes('block')) return 'warning'
  if (s.includes('track') || s.includes('done') || s.includes('complete')) return 'success'
  if (s.includes('wrap') || s.includes('progress')) return 'info'
  return 'muted'
}

function StateCard({ card }: { card: ProjectStateCard }) {
  return (
    <Card className="gap-4 py-5 shadow-[var(--shadow-card)]">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate">{card.title}</span>
          {card.status && (
            <Badge variant={statusVariant(card.status)} className="shrink-0">
              {card.status}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5">
        {card.currentStatus && (
          <p className="text-sm leading-relaxed text-card-foreground/90 line-clamp-4">
            {card.currentStatus}
          </p>
        )}
        {card.nextSteps.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Next Steps
            </div>
            <ul className="space-y-1.5">
              {card.nextSteps.slice(0, 3).map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-snug">
                  <span className="text-brand mt-px shrink-0">→</span>
                  <span className="line-clamp-2">{step}</span>
                </li>
              ))}
              {card.nextSteps.length > 3 && (
                <li className="text-xs text-muted-foreground/70 pl-4">
                  +{card.nextSteps.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error(`dashboard fetch failed (${res.status})`)
        return res.json() as Promise<DashboardData>
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
      <h1 className="text-xl font-heading font-semibold tracking-tight mb-6">Dashboard</h1>

      {error && (
        <p className="text-sm text-destructive mb-6">Could not load dashboard: {error}</p>
      )}

      {!data && !error && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatTile
              label="Total MRR"
              value={formatMRR(data.totalMRR)}
              tone="brand"
            />
            <StatTile
              label="Open Todos"
              value={String(data.openTodos)}
              tone="accent"
            />
            <StatTile
              label="Active Projects"
              value={String(data.activeProjects)}
              tone="neutral"
            />
            <StatTile
              label="Needs Reply"
              value={String(data.threadsNeedingReply)}
              tone="neutral"
            />
          </div>

          <h2 className="text-[11px] font-heading font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Project State
          </h2>

          {data.cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No project state files yet.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {data.cards.map(card => (
                <StateCard key={card.slug} card={card} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
