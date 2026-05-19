// aios-ui/app/clients/[client]/projects/[project]/page.tsx
import { notFound } from 'next/navigation'
import { getClient, getProject } from '@/lib/data/clients'
import { composeRecentActivity } from '@/lib/data/activity'
import { detectWiki } from '@/lib/data/wiki'
import { resolveDocsPaths, loadReferenceFile } from '@/lib/data/references'
import { loadMemoryForProject } from '@/lib/data/memory'
import { SidebarProjects } from '@/components/sidebar-projects'
import { Breadcrumb } from '@/components/breadcrumb'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMRR, formatRelativeDate } from '@/lib/format'
import { BookOpen, FileText } from 'lucide-react'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ client: string; project: string }>
}) {
  const { client: clientSlug, project: projectSlug } = await params
  const client = await getClient(clientSlug)
  if (!client) notFound()
  const project = await getProject(clientSlug, projectSlug)
  if (!project) notFound()

  const [activity, memory] = await Promise.all([
    composeRecentActivity({
      scope: 'project',
      clientSlug,
      clientName: client.name,
      projectSlug,
      projectName: project.name,
      days: 30,
    }),
    loadMemoryForProject(clientSlug, projectSlug),
  ])

  // Inspect docs_paths for wiki presence + collect any plain reference files.
  const docsPaths = resolveDocsPaths(project.docs_paths)
  let wikiInfo = null
  const refFiles = []
  for (const p of docsPaths) {
    const wiki = await detectWiki(p)
    if (wiki) {
      wikiInfo = wiki
      continue
    }
    const ref = await loadReferenceFile(p)
    if (ref) refFiles.push(ref)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProjects client={client} activeProjectSlug={project.slug} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumb
            crumbs={[
              { label: client.name, href: `/clients/${client.slug}` },
              { label: project.name },
            ]}
          />

          <header className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  <span className="capitalize">{client.name}</span> · <span className="capitalize">{project.status}</span>
                  {project.contract && <> · {project.contract}</>}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{formatMRR(project.mrr_monthly)}</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {(project.contacts ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contacts on file.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {(project.contacts ?? [])
                      .filter(c => !c.startsWith('@'))
                      .map(c => (
                        <li key={c} className="truncate">
                          <a className="hover:underline" href={`mailto:${c}`}>{c}</a>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Source files</CardTitle>
                <CardDescription>`docs_paths` for this project</CardDescription>
              </CardHeader>
              <CardContent>
                {!wikiInfo && refFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No docs paths registered.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {wikiInfo && (
                      <li className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div>
                            <Badge variant="secondary">LLM-wiki</Badge>{' '}
                            <span className="font-mono text-xs">{wikiInfo.rootPath}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {wikiInfo.decisionsActive} active · {wikiInfo.decisionsDeferred} deferred decisions ·{' '}
                            {wikiInfo.recentLogEntries.length} recent log entries
                          </div>
                        </div>
                      </li>
                    )}
                    {refFiles.map(ref => (
                      <li key={ref.path} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="font-mono text-xs truncate">{ref.path}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated {formatRelativeDate(ref.mtime.toISOString().slice(0, 10))}
                          </div>
                        </div>
                      </li>
                    ))}
                    {memory.map(m => (
                      <li key={m.path} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-sm">{m.description || m.name}</div>
                          <div className="font-mono text-xs text-muted-foreground truncate">{m.path}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated {formatRelativeDate(m.mtime.toISOString().slice(0, 10))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <section>
            <RecentActivityFeed entries={activity} title={`Recent activity — ${project.name}`} />
          </section>

          <section className="mt-8">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Chat panel</CardTitle>
                <CardDescription>Coming in v2</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The project chat with auto-loaded `/load-project` context ships in v2.
                  For now, run <code className="text-xs">/load {project.slug}</code> in
                  terminal Claude Code for full chat context.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
