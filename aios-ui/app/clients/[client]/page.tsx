// aios-ui/app/clients/[client]/page.tsx
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/data/clients'
import { computeClientMRR } from '@/lib/data/mrr'
import { composeRecentActivity } from '@/lib/data/activity'
import { detectWiki } from '@/lib/data/wiki'
import { resolveDocsPaths } from '@/lib/data/references'
import { Breadcrumb } from '@/components/breadcrumb'
import { ProjectRow } from '@/components/project-row'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { formatMRR } from '@/lib/format'
import { SidebarProjects } from '@/components/sidebar-projects'
import type { Project, ProjectStatus } from '@/lib/types'

const STATUS_ORDER: { key: ProjectStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'done', label: 'Done' },
  { key: 'archived', label: 'Archived' },
]

export default async function ClientPage(props: PageProps<'/clients/[client]'>) {
  const { client: clientSlug } = await props.params
  const client = await getClient(clientSlug)
  if (!client) notFound()

  const mrr = computeClientMRR(client)
  const activity = await composeRecentActivity({
    scope: 'client',
    clientSlug: client.slug,
    clientName: client.name,
    days: 30,
  })

  const contactSet = new Set<string>()
  for (const p of client.projects) {
    for (const c of p.contacts ?? []) {
      if (!c.startsWith('@')) contactSet.add(c)
    }
  }
  const contacts = Array.from(contactSet).sort()

  const projectsWithWiki = await Promise.all(
    client.projects.map(async p => {
      const docsPaths = resolveDocsPaths(p.docs_paths)
      for (const dp of docsPaths) {
        const wiki = await detectWiki(dp)
        if (wiki) return { project: p, hasWiki: true }
      }
      return { project: p, hasWiki: false }
    })
  )

  const byStatus: Record<ProjectStatus, { project: Project; hasWiki: boolean }[]> = {
    active: [],
    paused: [],
    done: [],
    archived: [],
  }
  for (const entry of projectsWithWiki) byStatus[entry.project.status].push(entry)

  const activeCount = byStatus.active.length

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProjects client={client} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-5xl mx-auto px-6 py-10">
          <Breadcrumb crumbs={[{ label: client.name }]} />

          {/* HEADER — integrated MRR + bucket */}
          <header className="flex items-end justify-between gap-6 mb-8">
            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold tracking-tight truncate">
                  {client.name}
                </h1>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">
                  {client.bucket}
                </span>
              </div>
              {client.notes && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{client.notes}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Client MRR
              </div>
              <div className="text-2xl font-semibold tabular-nums leading-none mt-1.5">
                {formatMRR(mrr)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 tabular-nums">
                {activeCount} active {activeCount === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </header>

          {/* CONTACTS — inline strip */}
          {contacts.length > 0 && (
            <section className="border-y border-border py-3 mb-12">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Contacts
                </span>
                <ul className="flex items-baseline gap-x-4 gap-y-1 flex-wrap text-sm">
                  {contacts.map(c => (
                    <li key={c}>
                      <a
                        className="text-foreground/90 hover:text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40"
                        href={`mailto:${c}`}
                      >
                        {c}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* PROJECTS — sectioned by status */}
          <div className="space-y-10 mb-14">
            {STATUS_ORDER.map(({ key, label }) => {
              const list = byStatus[key]
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
                    {list.map(({ project, hasWiki }) => (
                      <ProjectRow
                        key={project.slug}
                        project={project}
                        clientSlug={client.slug}
                        hasWiki={hasWiki}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          <RecentActivityFeed
            entries={activity}
            title={`Recent activity — ${client.name}`}
          />
        </main>
      </div>
    </div>
  )
}
