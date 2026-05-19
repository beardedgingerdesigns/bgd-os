// aios-ui/components/client-card.tsx
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMRR } from '@/lib/format'
import type { Client } from '@/lib/types'
import { computeClientMRR } from '@/lib/data/mrr'

interface ClientCardProps {
  client: Client
}

export function ClientCard({ client }: ClientCardProps) {
  const mrr = computeClientMRR(client)
  const activeCount = client.projects.filter(p => p.status === 'active').length
  return (
    <Link href={`/clients/${client.slug}`}>
      <Card className="hover:bg-accent/40 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <Badge variant="outline" className="capitalize">{client.bucket}</Badge>
          </div>
          <CardDescription>
            {activeCount} active {activeCount === 1 ? 'project' : 'projects'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{formatMRR(mrr)}</div>
        </CardContent>
      </Card>
    </Link>
  )
}
