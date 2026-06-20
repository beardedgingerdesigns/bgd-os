'use client'

import { useCallback, useEffect, useState } from 'react'
import { RunTriageButton } from '@/components/run-triage-button'
import { useTriageRun } from '@/components/triage-run-provider'
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
      <CardContent className="space-y-4 px-5">
        {card.currentStatus && (
          <p className="text-sm leading-relaxed text-card-foreground/90 line-clamp-4">
            {card.currentStatus}
          </p>
        )}
        {card.blockers.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-destructive font-medium mb-2">
              Blockers
            </div>
            <ul className="space-y-1.5">
              {card.blockers.slice(0, 2).map((b, i) => (
                <li key={i} className="flex gap-2 text-xs text-destructive/90 leading-snug">
                  <span className="mt-px shrink-0">!</span>
                  <span className="line-clamp-2">{b}</span>
                </li>
              ))}
            </ul>
          </div>
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
  const { completedCount } = useTriageRun()

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (!res.ok) throw new Error(`dashboard fetch failed (${res.status})`)
      setData((await res.json()) as DashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  // Load on mount and whenever a triage run completes (from any view).
  useEffect(() => {
    void load()
  }, [load, completedCount])

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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* ponytail: Total MRR tile temporarily hidden — restore this block + revert grid to lg:grid-cols-4 to bring it back
            <StatTile
              label="Total MRR"
              value={formatMRR(data.totalMRR)}
              tone="brand"
            />
            */}
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

          <section className="mb-8">
            <h2 className="text-[11px] font-heading font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h2>
            <div className="flex flex-wrap items-start gap-2">
              <RunTriageButton />
            </div>
          </section>

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
