// aios-ui/app/clients/[client]/page.tsx
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/data/clients'
import { computeClientMRR } from '@/lib/data/mrr'
import { composeRecentActivity } from '@/lib/data/activity'
import { detectWiki } from '@/lib/data/wiki'
import { resolveDocsPaths } from '@/lib/data/references'
import { Breadcrumb } from '@/components/breadcrumb'
import { ProjectCard } from '@/components/project-card'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMRR } from '@/lib/format'

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

  // Union of contacts across all projects.
  const contactSet = new Set<string>()
  for (const p of client.projects) {
    for (const c of p.contacts ?? []) {
      if (!c.startsWith('@')) contactSet.add(c)
    }
  }
  const contacts = Array.from(contactSet).sort()

  // Detect wiki presence per project for the badge.
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

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <Breadcrumb crumbs={[{ label: client.name }]} />

      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>
          {client.notes && (
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{client.notes}</p>
          )}
        </div>
        <Badge variant="outline" className="capitalize">{client.bucket}</Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardDescription>Client MRR</CardDescription>
            <CardTitle className="text-3xl">{formatMRR(mrr)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Primary contacts</CardTitle>
            <CardDescription>Across all projects under this client</CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts on file.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                {contacts.map(c => (
                  <li key={c} className="truncate">
                    <a className="hover:underline" href={`mailto:${c}`}>{c}</a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsWithWiki.map(({ project, hasWiki }) => (
            <ProjectCard
              key={project.slug}
              project={project}
              clientSlug={client.slug}
              hasWiki={hasWiki}
            />
          ))}
        </div>
      </section>

      <section>
        <RecentActivityFeed entries={activity} title={`Recent activity — ${client.name}`} />
      </section>
    </main>
  )
}
