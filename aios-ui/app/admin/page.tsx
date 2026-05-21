// aios-ui/app/admin/page.tsx
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { RitualTile } from '@/components/ritual-tile'
import { TodoList } from '@/components/todo-list'
import { readRitualCache } from '@/lib/cache/rituals'
import { readTodosCache } from '@/lib/cache/todos'
import type { RitualSlug } from '@/lib/types'

interface RitualConfig {
  slug: RitualSlug
  title: string
  description: string
}

const RITUALS: RitualConfig[] = [
  {
    slug: 'level-up',
    title: 'Level-up',
    description: 'Weekly automation hunt — find one process worth automating and ship it.',
  },
  {
    slug: 'weekly-status',
    title: 'Weekly status',
    description: 'Cross-project status synthesis — projects, risks, what is owed.',
  },
  {
    slug: 'audit',
    title: 'Audit',
    description: 'Four Cs scoreboard for the AIOS setup. Top-3 fixes ranked.',
  },
]

export default async function AdminPage() {
  const [caches, todos] = await Promise.all([
    Promise.all(RITUALS.map(r => readRitualCache(r.slug))),
    readTodosCache(),
  ])

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Admin' }]} />

      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Operator rituals + strategic work.
        </p>
      </header>

      <TodoList initial={todos} />

      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {RITUALS.map((r, i) => (
            <RitualTile
              key={r.slug}
              slug={r.slug}
              title={r.title}
              description={r.description}
              initialCache={caches[i]}
            />
          ))}

          {/* Placeholder tile — v3.1 */}
          <div
            className="p-5 rounded-md bg-card border border-dashed border-border flex flex-col gap-3 opacity-70"
            aria-label="Business plans + research, coming in v3.1"
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                business-plans
              </div>
              <div className="text-base font-semibold tracking-tight mt-1">
                Business plans & research
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Free-form strategic prompt surface. Coming in v3.1.
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      <Link
        href="/"
        className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back home
      </Link>
    </main>
  )
}
