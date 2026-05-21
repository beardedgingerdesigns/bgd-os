// aios-ui/app/page.tsx
import Link from 'next/link'
import { loadClients } from '@/lib/data/clients'
import { computeTotalMRR } from '@/lib/data/mrr'
import { readTodosCache } from '@/lib/cache/todos'
import { ClientRow } from '@/components/client-row'
import { DailyIngestButton } from '@/components/daily-ingest-button'
import { NewClientDialog } from '@/components/new-client-dialog'
import { TodoList } from '@/components/todo-list'
import { StatTile } from '@/components/stat-tile'
import { formatMRR } from '@/lib/format'
import type { Bucket, Client } from '@/lib/types'

type BucketKey = Bucket

const BUCKET_ORDER: { key: BucketKey; label: string }[] = [
  { key: 'paying', label: 'Paying' },
  { key: 'prospects', label: 'Prospects' },
  { key: 'internal', label: 'Internal' },
]

export default async function Home() {
  const [clients, todos] = await Promise.all([
    loadClients(),
    readTodosCache(),
  ])
  const totalMRR = computeTotalMRR(clients)

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

  // Count "active" todos (open or running) per client_slug so each ClientRow
  // can render a pill. Done/dismissed todos don't count — they shouldn't pull
  // attention to a client that's already cleared today's queue.
  const activeTodoCountByClient: Record<string, number> = {}
  let openTodoCount = 0
  for (const t of todos?.todos ?? []) {
    if (t.status === 'done' || t.status === 'dismissed') continue
    openTodoCount += 1
    if (!t.client_slug) continue
    activeTodoCountByClient[t.client_slug] = (activeTodoCountByClient[t.client_slug] ?? 0) + 1
  }

  // Active projects across all clients (excluding paused/done/archived).
  let activeProjectCount = 0
  for (const c of clients) {
    activeProjectCount += c.projects.filter(p => p.status === 'active').length
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* HEADER — title + date */}
      <header className="flex items-end justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AIOS</h1>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">{dateLabel}</p>
        </div>
      </header>

      {/* HERO STATS — 3 tiles, brand-tinted */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatTile
          tone="brand"
          label="Total MRR"
          value={formatMRR(totalMRR)}
          hint={`${payingCount} paying · ${prospectCount} ${prospectCount === 1 ? 'prospect' : 'prospects'}`}
        />
        <StatTile
          tone="accent"
          label="Open todos"
          value={String(openTodoCount)}
          hint={openTodoCount === 0 ? 'inbox is clean' : 'across today’s queue'}
        />
        <StatTile
          tone="neutral"
          label="Active projects"
          value={String(activeProjectCount)}
          hint={`${clients.length} ${clients.length === 1 ? 'client' : 'clients'} total`}
        />
      </section>

      {/* OPERATOR STRIP — daily ingest + new client + admin link */}
      <div className="flex items-center justify-between gap-4 border-y border-border py-2.5 mb-12">
        <DailyIngestButton />
        <div className="flex items-center gap-3">
          <NewClientDialog />
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
            <span className="text-[9px] tracking-wider text-muted-foreground/60">soon</span>
          </Link>
        </div>
      </div>

      {/* TWO-COLUMN BODY — clients left, todos sidebar right (stacked on small screens). */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 mb-14">
        {/* CLIENTS — sectioned list */}
        <div className="space-y-10 min-w-0">
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
                  {list.map(c => (
                    <ClientRow
                      key={c.slug}
                      client={c}
                      activeTodoCount={activeTodoCountByClient[c.slug] ?? 0}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* TODOS — sticky sidebar adjacent to the client list */}
        <aside className="lg:sticky lg:top-10 lg:self-start min-w-0">
          <div className="lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-1">
            {/* Soft orange wash anchors the "live" panel without competing
                with the brand-gold MRR tile above. Pseudo-element so the
                gradient doesn't fight the TodoList's own card backgrounds. */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-2 h-32 rounded-2xl bg-[radial-gradient(120%_80%_at_50%_0%,rgb(241_136_33_/_0.12),transparent_70%)]"
              />
              <div className="relative">
                <TodoList initial={todos} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
