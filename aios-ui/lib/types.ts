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

// ---------- 04-bidirectional-hub: wiki decision summaries + pending ingest ----------

export interface DecisionSummary {
  slug: string                  // filename without .md (e.g. "001-use-postgres")
  title: string                 // first H1 of file, fallback to humanized slug
  firstParagraph: string        // first non-empty, non-header paragraph; '' if none
  filePath: string              // absolute path
  modified: Date                // fs.stat mtime
}

export interface DecisionsBuckets {
  active: DecisionSummary[]
  deferred: DecisionSummary[]
}

export interface PendingFile {
  filename: string              // e.g. "capture-2026-05-21-meghan-handoff.md"
  filePath: string              // absolute
  mtime: Date
  kind: 'capture' | 'chat-decision' | 'chat-session' | 'other'  // parsed from filename prefix
}

export interface PendingIngestResult {
  count: number
  files: PendingFile[]          // sorted by mtime DESC
  lastIngestAt: Date | null     // most recent "## [YYYY-MM-DD] ingest |" header, or null
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

// ---------- v3.5: structured daily todos ----------

export type TodoType =
  | 'email_reply'
  | 'follow_up'
  | 'calendar_check'
  | 'decision_log'
  | 'generic'

export type TodoStatus = 'open' | 'in_progress' | 'done' | 'dismissed'

export interface Todo {
  id: string
  type: TodoType
  summary: string
  context?: string
  thread_id?: string
  client_slug?: string
  project_slug?: string
  suggested_action: string
  action_params?: Record<string, unknown>
  status: TodoStatus
}

export interface TodosCacheEntry {
  generatedAt: string                                  // ISO timestamp the envelope was extracted
  todos: Todo[]
}

// ---------- v2: chat panel ----------

export interface ChatSession {
  clientSlug: string
  projectSlug: string
  sessionId: string                       // captured from claude stream-json session_id field
  startedAt: string                       // ISO timestamp
}

export interface ChatSessionsFile {
  // key shape: `${clientSlug}/${projectSlug}` — flat map keyed by compound slug.
  sessions: Record<string, ChatSession>
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
  status?: 'streaming' | 'done' | 'error'
  error?: string
}

export interface ChatLoadResult {
  status: 'success' | 'failed' | 'timeout'
  sessionId: string | null                // captured from stream-json; null on failure
  output: string                          // aggregated assistant text from the /load run
  exitCode: number
  durationMs: number
  error?: string
}

export interface ChatMessageResult {
  status: 'success' | 'failed' | 'timeout'
  output: string                          // aggregated assistant text
  exitCode: number
  durationMs: number
  error?: string
}

// ---------- v3: capture box + admin rituals ----------

export interface CaptureRunResult {
  status: 'success' | 'failed' | 'timeout'
  output: string                          // aggregated assistant text from /capture
  exitCode: number
  durationMs: number
  error?: string
}

export const RITUAL_SLUGS = ['level-up', 'weekly-status', 'audit'] as const

export type RitualSlug = (typeof RITUAL_SLUGS)[number]

export interface RitualRunResult {
  status: 'success' | 'failed' | 'timeout'
  output: string                          // aggregated assistant text
  exitCode: number
  durationMs: number
  error?: string
}

export interface RitualCacheEntry {
  ritual: RitualSlug
  ranAt: string                           // ISO timestamp
  output: string                          // raw Markdown produced by the skill
  exitCode: number
  durationMs: number
}

// ---------- Phase 04: bidirectional hub (raw drops + receipts) ----------

export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session'

export type ReceiptKind =
  | 'capture'
  | 'todo'
  | 'triage_override'
  | 'chat_drop'
  | 'chat_session_close'
  | 'wiki_ingest'

export interface Receipt {
  id: string                              // e.g. "rcpt_<nanoid>"
  ts: string                              // ISO-8601
  kind: ReceiptKind
  project_slug: string                    // empty string allowed for cross-project receipts
  file_written: string                    // absolute path
  excerpt: string                         // first 240 chars of body (or summary)
  actor: string                           // e.g. "capture-box", "todo-list", "triage-row-actions"
}
