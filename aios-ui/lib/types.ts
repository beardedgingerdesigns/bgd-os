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
  kind: 'capture' | 'chat-decision' | 'chat-session' | 'triage-dispatch' | 'other'  // parsed from filename prefix
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

// ---------- U6: persistent todos sourced from todos/pending.md ----------
//
// Distinct from the ephemeral `Todo`/`TodosCacheEntry` above (those are triage
// output cached in .aios-cache/todos-today.json). PendingTodo mirrors the
// markdown list at todos/pending.md: a durable, hand-and-skill-curated list
// grouped by priority. Marking one done moves it to completed.md per that
// file's own format rules.

export type TodoPriority = 'high' | 'medium' | 'low'

export type PendingTodoActionType = 'email' | 'calendar' | 'generic'

export type DelegationActionType = 'draft-email' | 'update-state' | 'stage-wiki' | 'research'

export interface PendingTodo {
  id: string                    // stable hash of summary + added date
  summary: string               // bold first-line text
  hashtag?: string              // `#category` tag on the summary line
  added?: string                // YYYY-MM-DD
  source?: string               // manual | triage | onboard | skill:<name>
  client?: string               // client-slug or client-slug / project-slug
  priority: TodoPriority        // defaults to 'medium' when unspecified
  notes?: string                // one-line context
  snoozedUntil?: string         // ISO date; hidden from active list until then
  blockedOn?: string            // free text; visually muted, sorts below actionable
  actionType: PendingTodoActionType // detected from summary keywords
  action?: DelegationActionType // explicit action from Action: metadata; undefined = human-only
  actionContext?: string        // freeform context for Claude to execute the action
  reviewReason?: string         // set when an action bounced; shows what went wrong
}

export interface PendingTodosResult {
  todos: PendingTodo[]
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

export interface SlashCommand {
  name: string         // command/skill name, without the leading slash
  description: string  // one-line summary (may be truncated for display)
}

// ---------- state write-back: triage-drafted proposals reviewed in Sync ----------

// Proposable state-file fields. `**Updated:**` is not here — Apply always bumps
// it as a side effect, it is never proposed on its own.
export type StateUpdateField = 'status' | 'current_status' | 'next_step' | 'blocker'

export interface StateUpdateProposal {
  id: string                                   // su-<8 hex>
  slug: string                                 // state/<slug>.md
  field: StateUpdateField
  current: string                              // value being contradicted (for the diff / matching)
  proposed: string                             // drafted replacement value
  evidence: {
    source: 'triage'
    threadId: string | null
    sender: string | null
    date: string                               // YYYY-MM-DD of the evidence
  }
  confidence: 'high' | 'low'                   // high = explicit attributable fact; low = inference
  stateUpdatedAt: string | null                // state file's **Updated:** date at draft time (clobber guard)
  dedupeKey: string                            // slug:field:hash(proposed) — blocks re-proposal
  createdAt: string                            // ISO timestamp the proposal was drafted
}

export interface StateUpdateStore {
  proposals: StateUpdateProposal[]
  dismissed: string[]                          // dedupeKeys the operator dismissed; never re-proposed
}

// What the triage skill emits in the STATE_UPDATES_JSON envelope: semantic
// fields only. The reconcile step derives id, createdAt, and dedupeKey.
export type RawStateUpdateProposal = Omit<StateUpdateProposal, 'id' | 'createdAt' | 'dedupeKey'>

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
  /**
   * Absolute path of the markdown file written for this capture, when one is
   * known. Set by:
   *   - the wiki-aware branch (always present on success in that branch);
   *   - the subprocess branch when its stdout exposes a parseable absolute
   *     `.md` path that the HUB-06 multi-regex extractor matched.
   * Left undefined when the subprocess branch could not parse a path
   * (operator-facing: receipt is suppressed to honor HUB-06's absolute-path
   * requirement) or when the capture failed.
   */
  fileWritten?: string
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

export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session' | 'triage-dispatch'

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

// ---------- Phase 04 — Plan 04: triage row overrides (HUB-04, HUB-09) ----------
//
// Per-thread override state written by the Project-page "Replied / Snooze 2d /
// Not me" actions. The daily-inbox-triage skill reads this file BEFORE
// surfacing threads so the operator's manual decision always wins.

export type TriageOverrideStatus = 'replied' | 'snoozed' | 'not_me' | 'dismissed'

export interface TriageOverride {
  status: TriageOverrideStatus
  marked_at: string                       // ISO-8601
  snooze_until?: string                   // ISO-8601, required when status==='snoozed'
}

// Keyed by Gmail thread ID.
export interface TriageOverridesFile {
  [threadId: string]: TriageOverride
}
