// aios-ui/components/sidebar-projects.tsx
import Link from 'next/link'
import { formatMRR } from '@/lib/format'
import type { Client } from '@/lib/types'

interface SidebarProjectsProps {
  client: Client
  activeProjectSlug?: string
}

export function SidebarProjects({ client, activeProjectSlug }: SidebarProjectsProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-border h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          ← AIOS
        </Link>
      </div>
      <div className="px-4 pb-4">
        <Link
          href={`/clients/${client.slug}`}
          className="text-sm font-medium hover:underline underline-offset-2 decoration-muted-foreground/40 truncate block"
        >
          {client.name}
        </Link>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-2">
          {client.bucket}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-2">
          Projects
        </div>
        {client.projects.length === 0 && (
          <p className="text-xs text-muted-foreground px-2.5 py-2">
            No projects on file.
          </p>
        )}
        <ul className="space-y-0.5">
          {client.projects.map(p => {
            const isActive = p.slug === activeProjectSlug
            return (
              <li key={p.slug}>
                <Link
                  href={`/clients/${client.slug}/projects/${p.slug}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block px-2.5 py-2 rounded-sm text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <span className="text-[11px] tabular-nums shrink-0 text-muted-foreground">
                      {formatMRR(p.mrr_monthly)}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
