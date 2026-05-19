// aios-ui/app/admin/page.tsx
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'

export default function AdminPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Admin' }]} />

      <header className="mb-10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Coming in v3
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Operator rituals + strategic work. Placeholder for now.
        </p>
      </header>

      <section className="border-y border-border py-3 mb-10">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Planned
          </span>
          <ul className="flex items-baseline gap-x-4 gap-y-1 flex-wrap text-sm text-muted-foreground">
            <li>level-up</li>
            <li>audit</li>
            <li>weekly status</li>
            <li>business plans &amp; research</li>
          </ul>
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
