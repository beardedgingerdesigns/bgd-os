import { readTriageCache } from '@/lib/cache/triage'
import { DailyIngestModal } from '@/components/daily-ingest-modal'
import { formatRelativeDate } from '@/lib/format'

export async function DailyIngestButton() {
  const cache = await readTriageCache()
  const lastRunLabel = cache ? `Last triage: ${formatRelativeDate(cache.ranAt.slice(0, 10))}` : 'No triage run yet'

  return (
    <div className="flex items-center gap-3">
      <DailyIngestModal initialCache={cache} />
      <span className="text-xs text-muted-foreground">{lastRunLabel}</span>
    </div>
  )
}
