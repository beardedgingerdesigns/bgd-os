// aios-ui/app/clients/[client]/projects/[project]/page.tsx
import { notFound } from 'next/navigation'
import { getClient, getProject } from '@/lib/data/clients'
import { composeRecentActivity } from '@/lib/data/activity'
import { detectWiki } from '@/lib/data/wiki'
import { resolveDocsPaths, loadReferenceFile } from '@/lib/data/references'
import { loadMemoryForProject } from '@/lib/data/memory'
import { readTodosCache } from '@/lib/cache/todos'
import { SidebarProjects } from '@/components/sidebar-projects'
import { Breadcrumb } from '@/components/breadcrumb'
import { RecentActivityFeed } from '@/components/recent-activity-feed'
import { WikiDisplay } from '@/components/wiki-display'
import { formatMRR, formatRelativeDate } from '@/lib/format'
import { FileText } from 'lucide-react'
import { ChatDrawer } from '@/components/chat-drawer'
import { CaptureBox } from '@/components/capture-box'
import { CommunicationsSection } from '@/components/communications-section'
import { PendingIngestionSection } from '@/components/pending-ingestion-section'
import { ProjectReceiptsSlice } from '@/components/project-receipts-slice'
import { DeleteEntityDialog } from '@/components/delete-entity-dialog'
import { TodoList } from '@/components/todo-list'
import { Badge } from '@/components/ui/badge'
import { statusBadge } from '@/lib/badge-tones'

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

  const [activity, memory, todosCache] = await Promise.all([
    composeRecentActivity({
      scope: 'project',
      clientSlug,
      clientName: client.name,
      projectSlug,
      projectName: project.name,
      days: 30,
    }),
    loadMemoryForProject(clientSlug, projectSlug),
    readTodosCache(),
  ])

  // Filter the global todo queue down to this project. Skip rendering the
  // section entirely if nothing matches — project pages shouldn't broadcast
  // "no todos for today" the way the global dashboard does.
  const scopedTodos = todosCache
    ? todosCache.todos.filter(
        t => t.client_slug === clientSlug && t.project_slug === projectSlug,
      )
    : []
  const projectTodos = scopedTodos.length > 0 && todosCache
    ? { generatedAt: todosCache.generatedAt, todos: scopedTodos }
    : null

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

  const contacts = (project.contacts ?? []).filter(c => !c.startsWith('@'))
  // allContacts preserves both plain emails AND '@domain' patterns; the
  // Communications filter needs both forms to match Gmail thread bodies that
  // mention senders by domain rather than full address.
  const allContacts = project.contacts ?? []
  // Source-files section only renders non-wiki rows now; the wiki gets its
  // own dedicated WikiDisplay block above this section (04-03).
  const hasNonWikiSourceFiles = refFiles.length > 0 || memory.length > 0

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProjects client={client} activeProjectSlug={project.slug} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-5xl mx-auto px-6 py-10">
          <Breadcrumb
            crumbs={[
              { label: client.name, href: `/clients/${client.slug}` },
              { label: project.name },
            ]}
          />

          {/* HEADER — integrated status + MRR */}
          <header className="flex items-end justify-between gap-6 mb-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight truncate">
                  {project.name}
                </h1>
                <Badge variant={statusBadge(project.status).variant} className="shrink-0">
                  {statusBadge(project.status).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <span>{client.name}</span>
                {project.contract && <> · <span>{project.contract}</span></>}
              </p>
            </div>
            <div className="flex items-end gap-6 shrink-0">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  MRR
                </div>
                <div className="text-2xl font-semibold tabular-nums leading-none mt-1.5">
                  {formatMRR(project.mrr_monthly)}
                </div>
              </div>
              <DeleteEntityDialog
                entityLabel={project.name}
                confirmSlug={project.slug}
                entityKind="project"
                endpoint={`/api/clients/${client.slug}/projects/${project.slug}`}
                redirectTo={`/clients/${client.slug}`}
              />
            </div>
          </header>

          {/* CONTACTS — inline strip */}
          {contacts.length > 0 && (
            <section className="border-y border-border py-3 mb-10">
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

          {projectTodos && <TodoList initial={projectTodos} />}

          {/* WIKI — expandable decision + log sections (04-03 / HUB-08).
              Replaces the bare counts row that previously lived inside
              "Source files" when a wiki was detected. */}
          {wikiInfo && <WikiDisplay wikiPath={wikiInfo.rootPath} />}

          {/* SOURCE FILES — inline list, no card. Wiki row is now rendered
              by WikiDisplay above; this section only holds ref files +
              memory rows. */}
          {hasNonWikiSourceFiles && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Source files
                </h2>
                <span className="text-xs text-muted-foreground">docs_paths · memory</span>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {refFiles.map(ref => (
                  <li key={ref.path} className="flex items-start gap-3 py-3">
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-muted/60 text-muted-foreground"
                      aria-hidden
                    >
                      <FileText className="h-3 w-3" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium shrink-0">
                          ref
                        </span>
                        <span className="font-mono text-xs truncate">{ref.path}</span>
                      </div>
                      <div className="text-xs text-muted-foreground/80 mt-1 tabular-nums">
                        Updated {formatRelativeDate(ref.mtime.toISOString().slice(0, 10))}
                      </div>
                    </div>
                  </li>
                ))}
                {memory.map(m => (
                  <li key={m.path} className="flex items-start gap-3 py-3">
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-muted/60 text-muted-foreground"
                      aria-hidden
                    >
                      <FileText className="h-3 w-3" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium shrink-0">
                          memory
                        </span>
                        <span className="text-sm font-medium truncate">
                          {m.description || m.name}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground truncate mt-0.5">
                        {m.path}
                      </div>
                      <div className="text-xs text-muted-foreground/80 mt-1 tabular-nums">
                        Updated {formatRelativeDate(m.mtime.toISOString().slice(0, 10))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* COMMUNICATIONS — per-project triage with row overrides (04-04).
              Inserted AFTER source files, BEFORE CaptureBox. */}
          <CommunicationsSection
            clientSlug={client.slug}
            projectSlug={project.slug}
            projectContacts={allContacts}
          />

          {/* PENDING INGESTION — raw/aios/ drop counter + Run wiki ingest button (04-09 / HUB-07).
              Inserted AFTER CommunicationsSection, BEFORE CaptureBox. */}
          <PendingIngestionSection
            clientSlug={client.slug}
            projectSlug={project.slug}
            wikiPath={wikiInfo?.rootPath ?? null}
          />

          <section className="mb-10">
            <CaptureBox
              clientSlug={client.slug}
              projectSlug={project.slug}
              projectName={project.name}
            />
          </section>

          <section className="mb-10">
            <RecentActivityFeed
              entries={activity}
              title={`Recent activity — ${project.name}`}
            />
          </section>

          {/* PER-PROJECT RECEIPTS — last 10 receipts for this project (04-09 / HUB-06).
              Inserted AFTER RecentActivityFeed, BEFORE ChatDrawer. */}
          <ProjectReceiptsSlice projectSlug={project.slug} />

          <section>
            <ChatDrawer
              clientSlug={client.slug}
              projectSlug={project.slug}
              projectName={project.name}
            />
          </section>
        </main>
      </div>
    </div>
  )
}
