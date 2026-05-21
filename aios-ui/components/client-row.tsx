// aios-ui/components/client-row.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatMRR } from '@/lib/format'
import { computeClientMRR } from '@/lib/data/mrr'
import { cn } from '@/lib/utils'
import type { Bucket, Client } from '@/lib/types'

interface ClientRowProps {
  client: Client
  /** Open todos targeting this client today (status open or in_progress). Drives the pill. */
  activeTodoCount?: number
}

// Bucket-keyed avatar background. Pastel-toned to match the bucket Badge but
// a touch more saturated so the avatar reads as a real "identity" cue not
// a status chip clone.
const BUCKET_AVATAR_STYLE: Record<Bucket, string> = {
  paying:    'bg-emerald-500/20 text-emerald-200',
  prospects: 'bg-brand-secondary-muted text-brand-secondary',
  internal:  'bg-muted/70 text-foreground/80',
}

function firstLetter(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return '?'
  // Use the first letter of the first word — handles "Inside Out Iowa" → "I".
  // Intl-segmented to keep emoji/CJK from rendering as two visual cells.
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(trimmed)
  const first = seg[Symbol.iterator]().next().value
  return first ? first.segment.toUpperCase() : '?'
}

export function ClientRow({ client, activeTodoCount = 0 }: ClientRowProps) {
  const mrr = computeClientMRR(client)
  const activeCount = client.projects.filter(p => p.status === 'active').length
  const otherCount = client.projects.length - activeCount

  const meta: string[] = []
  if (activeCount > 0) {
    meta.push(`${activeCount} active ${activeCount === 1 ? 'project' : 'projects'}`)
  }
  if (otherCount > 0) {
    meta.push(`${otherCount} other`)
  }
  if (meta.length === 0) meta.push('no projects')

  return (
    <Link
      href={`/clients/${client.slug}`}
      className="group flex items-center gap-3 py-3 hover:bg-muted/40 -mx-3 px-3 rounded-sm transition-colors"
    >
      <div
        className={cn(
          'shrink-0 flex items-center justify-center h-9 w-9 rounded-full text-sm font-semibold',
          BUCKET_AVATAR_STYLE[client.bucket],
        )}
        aria-hidden
      >
        {firstLetter(client.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{client.name}</span>
          {activeTodoCount > 0 && (
            <span
              className="shrink-0 inline-flex items-center rounded-full bg-brand-secondary text-white px-1.5 py-0.5 text-[10px] font-medium tabular-nums leading-none"
              aria-label={`${activeTodoCount} open ${activeTodoCount === 1 ? 'todo' : 'todos'}`}
            >
              {activeTodoCount} {activeTodoCount === 1 ? 'todo' : 'todos'}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{meta.join(' · ')}</div>
      </div>
      <div className="text-sm font-medium tabular-nums shrink-0 text-right text-foreground/90">
        {formatMRR(mrr)}
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
        aria-hidden
      />
    </Link>
  )
}
