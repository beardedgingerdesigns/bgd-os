// aios-ui/components/sidebar-projects.tsx
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { formatMRR } from '@/lib/format'
import type { Client } from '@/lib/types'

interface SidebarProjectsProps {
  client: Client
  activeProjectSlug?: string
}

export function SidebarProjects({ client, activeProjectSlug }: SidebarProjectsProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-border h-full p-4">
      <div className="mb-4">
        <Link
          href={`/clients/${client.slug}`}
          className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {client.name}
        </Link>
      </div>
      <Separator className="mb-4" />
      <nav className="space-y-1">
        {client.projects.map(p => {
          const isActive = p.slug === activeProjectSlug
          return (
            <Link
              key={p.slug}
              href={`/clients/${client.slug}/projects/${p.slug}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-accent text-foreground' : 'hover:bg-accent/40 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <span className="text-xs shrink-0">{formatMRR(p.mrr_monthly)}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
