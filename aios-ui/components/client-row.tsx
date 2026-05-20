// aios-ui/components/client-row.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatMRR } from '@/lib/format'
import { computeClientMRR } from '@/lib/data/mrr'
import type { Client } from '@/lib/types'

interface ClientRowProps {
  client: Client
}

export function ClientRow({ client }: ClientRowProps) {
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
      className="group flex items-center gap-4 py-3 hover:bg-muted/40 -mx-3 px-3 rounded-sm transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{client.name}</div>
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
