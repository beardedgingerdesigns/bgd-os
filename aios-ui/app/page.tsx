// aios-ui/app/page.tsx
import { loadClients } from '@/lib/data/clients'
import { computeTotalMRR } from '@/lib/data/mrr'
import { composeRecentActivity } from '@/lib/data/activity'
import { MRRWidget } from '@/components/mrr-widget'
import { ClientCard } from '@/components/client-card'
import { AdminCard } from '@/components/admin-card'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { DailyIngestButton } from '@/components/daily-ingest-button'

export default async function Home() {
  const clients = await loadClients()
  const totalMRR = computeTotalMRR(clients)
  const paidClientCount = clients.filter(c => c.bucket === 'paying').length
  const activity = await composeRecentActivity({ scope: 'global', days: 30 })

  // Order client cards: paying first, then prospects, then internal — alpha within each.
  const order = { paying: 0, prospects: 1, internal: 2 } as const
  const sortedClients = [...clients].sort((a, b) => {
    const diff = order[a.bucket] - order[b.bucket]
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">AIOS</h1>
        <p className="text-muted-foreground text-sm mt-1">Local-only tracker — read-only v0</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <MRRWidget total={totalMRR} paidClientCount={paidClientCount} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          <AdminCard />
          <DailyIngestButton />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Clients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClients.map(client => (
            <ClientCard key={client.slug} client={client} />
          ))}
        </div>
      </section>

      <section>
        <RecentActivityFeed entries={activity} title="Recent activity across all projects" />
      </section>
    </main>
  )
}
