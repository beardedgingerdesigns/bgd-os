// aios-ui/app/page.tsx
import Link from 'next/link'
import { loadClients } from '@/lib/data/clients'
import { computeTotalMRR } from '@/lib/data/mrr'
import { composeRecentActivity } from '@/lib/data/activity'
import { ClientRow } from '@/components/client-row'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { DailyIngestButton } from '@/components/daily-ingest-button'
import { formatMRR } from '@/lib/format'
import type { Bucket, Client } from '@/lib/types'

type BucketKey = Bucket

const BUCKET_ORDER: { key: BucketKey; label: string }[] = [
  { key: 'paying', label: 'Paying' },
  { key: 'prospects', label: 'Prospects' },
  { key: 'internal', label: 'Internal' },
]

export default async function Home() {
  const clients = await loadClients()
  const totalMRR = computeTotalMRR(clients)
  const activity = await composeRecentActivity({ scope: 'global', days: 30 })

  const byBucket: Record<BucketKey, Client[]> = {
    paying: [],
    prospects: [],
    internal: [],
  }
  for (const c of clients) byBucket[c.bucket].push(c)
  for (const k of Object.keys(byBucket) as BucketKey[]) {
    byBucket[k].sort((a, b) => a.name.localeCompare(b.name))
  }

  const payingCount = byBucket.paying.length
  const prospectCount = byBucket.prospects.length

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* HEADER — integrated MRR */}
      <header className="flex items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AIOS</h1>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">{dateLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Total MRR
          </div>
          <div className="text-3xl font-semibold tabular-nums leading-none mt-1.5">
            {formatMRR(totalMRR)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 tabular-nums">
            {payingCount} paying · {prospectCount} {prospectCount === 1 ? 'prospect' : 'prospects'}
          </div>
        </div>
      </header>

      {/* OPERATOR STRIP — daily ingest + admin link */}
      <div className="flex items-center justify-between gap-4 border-y border-border py-2.5 mb-12">
        <DailyIngestButton />
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin
          <span className="text-[9px] tracking-wider text-muted-foreground/60">soon</span>
        </Link>
      </div>

      {/* CLIENTS — sectioned list */}
      <div className="space-y-10 mb-14">
        {BUCKET_ORDER.map(({ key, label }) => {
          const list = byBucket[key]
          if (list.length === 0) return null
          return (
            <section key={key}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {label}
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {list.length}
                </span>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {list.map(c => <ClientRow key={c.slug} client={c} />)}
              </div>
            </section>
          )
        })}
      </div>

      {/* ACTIVITY */}
      <RecentActivityFeed entries={activity} title="Recent activity" />
    </main>
  )
}
