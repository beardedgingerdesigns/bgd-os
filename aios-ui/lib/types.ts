// aios-ui/lib/types.ts

export type Bucket = 'paying' | 'prospects' | 'internal'

export type ProjectStatus = 'active' | 'paused' | 'done' | 'archived'

export interface Project {
  slug: string
  name: string
  status: ProjectStatus
  contract?: string
  mrr_monthly?: number
  docs_paths?: string[]
  contacts?: string[]
}

export interface Client {
  slug: string
  name: string
  bucket: Bucket
  notes?: string
  projects: Project[]
}

export interface ClientsFile {
  clients: Client[]
}

export interface MemoryFile {
  path: string                  // absolute path
  name: string                  // frontmatter `name:` field
  description: string           // frontmatter `description:` field
  client?: string               // frontmatter `client:` (or `metadata.client:`)
  project?: string              // frontmatter `project:` (or `metadata.project:`)
  body: string                  // markdown body (without frontmatter)
  mtime: Date                   // file system mtime
}

export interface DecisionEntry {
  date: string                  // ISO date from the `## YYYY-MM-DD — Title` header
  title: string                 // the title portion of that header
  body: string                  // everything between this header and the next `---` or `## ` boundary
  mentionedClients: string[]    // client slugs detected in the body (case-insensitive substring match on client name)
  mentionedProjects: string[]   // project slugs detected likewise
}

export interface WikiInfo {
  rootPath: string              // absolute path to the wiki root (the dir containing WIKI-CLAUDE.md)
  hasWikiClaudeMd: boolean
  decisionsActive: number       // count of files in decisions/active/
  decisionsDeferred: number
  recentLogEntries: WikiLogEntry[] // last 10 by filename date
}

export interface WikiLogEntry {
  filename: string              // e.g. 2026-05-18-wiki-bootstrap.md
  date: string                  // parsed from filename (YYYY-MM-DD)
  title: string                 // first H1 of the file, fallback to filename
  path: string                  // absolute path
}

export type ActivityKind = 'decision' | 'wiki-log' | 'memory-update'

export interface ActivityEntry {
  date: string                  // ISO date
  kind: ActivityKind
  title: string
  description?: string          // optional one-line preview
  source: string                // human-readable source label, e.g. "decisions/log.md" or "Iowa Everywhere wiki"
  href?: string                 // optional clickable target (path or anchor)
}

// ---------- v1: file watcher + daily-ingest ----------

export type InvalidationScope =
  | { kind: 'global' }                                 // applies to every page
  | { kind: 'client'; clientSlug: string }             // applies to one client + its projects
  | { kind: 'project'; clientSlug: string; projectSlug: string }
  | { kind: 'admin' }                                  // reserved for v3

export interface InvalidationMessage {
  scope: InvalidationScope
  reason: string                                       // human-readable, e.g. "decisions/log.md changed"
  at: string                                           // ISO timestamp
}

export interface TriageCacheEntry {
  ranAt: string                                        // ISO timestamp the skill ran
  output: string                                       // raw Markdown produced by /daily-inbox-triage
  exitCode: number                                     // 0 if subprocess succeeded
  durationMs: number                                   // wall-clock runtime
}

export interface TriageRunResult {
  status: 'success' | 'failed' | 'timeout'
  exitCode: number
  output: string
  durationMs: number
  error?: string
}
