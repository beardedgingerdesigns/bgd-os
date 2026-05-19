// aios-ui/components/recent-activity-feed.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BookOpen, Lightbulb } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import type { ActivityEntry } from '@/lib/types'

interface RecentActivityFeedProps {
  entries: ActivityEntry[]
  title?: string
  emptyMessage?: string
}

const kindIcon = {
  decision: Lightbulb,
  'wiki-log': BookOpen,
  'memory-update': FileText,
}

export function RecentActivityFeed({
  entries,
  title = 'Recent activity',
  emptyMessage = 'Nothing in the last 30 days.',
}: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Filesystem-derived. Last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e, i) => {
              const Icon = kindIcon[e.kind]
              return (
                <li key={i} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    {e.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {e.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeDate(e.date)} · {e.source}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
