// aios-ui/components/recent-activity-feed.tsx
import { FileText, BookOpen, Lightbulb } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import type { ActivityEntry, ActivityKind } from '@/lib/types'

interface RecentActivityFeedProps {
  entries: ActivityEntry[]
  title?: string
  emptyMessage?: string
}

const kindIcon: Record<ActivityKind, typeof FileText> = {
  decision: Lightbulb,
  'wiki-log': BookOpen,
  'memory-update': FileText,
}

const kindLabel: Record<ActivityKind, string> = {
  decision: 'decision',
  'wiki-log': 'wiki',
  'memory-update': 'memory',
}

export function RecentActivityFeed({
  entries,
  title = 'Recent activity',
  emptyMessage = 'Nothing in the last 30 days.',
}: RecentActivityFeedProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">Last 30 days · filesystem</span>
      </div>

      {entries.length === 0 ? (
        <div className="border-y border-border py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {entries.map((e, i) => {
            const Icon = kindIcon[e.kind]
            return (
              <li key={i} className="flex items-start gap-3 py-3">
                <span
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-muted/60 text-muted-foreground"
                  aria-hidden
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium shrink-0">
                      {kindLabel[e.kind]}
                    </span>
                    <span className="text-sm font-medium truncate">{e.title}</span>
                  </div>
                  {e.description && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {e.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/80 mt-1 tabular-nums">
                    {formatRelativeDate(e.date)} · {e.source}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
