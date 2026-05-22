// Pure parser for the <!-- TODOS_JSON_START --> ... <!-- TODOS_JSON_END --> envelope
// emitted by the daily-inbox-triage skill. NO Node.js built-ins — safe to import
// from client components (e.g. components/triage-output.tsx). Split out of
// lib/skills/daily-ingest.ts (which imports child_process) to avoid leaking
// server-only deps into client bundles.

import type { Todo, TodosCacheEntry, TodoStatus, TodoType } from '@/lib/types'

const TODOS_ENVELOPE_RE =
  /<!--\s*TODOS_JSON_START\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*TODOS_JSON_END\s*-->/i

const TODO_TYPES: TodoType[] = ['email_reply', 'follow_up', 'calendar_check', 'decision_log', 'generic']
const TODO_STATUSES: TodoStatus[] = ['open', 'in_progress', 'done', 'dismissed']

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function coerceTodo(raw: unknown, index: number): Todo | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const summary = asString(r.summary)
  if (!summary) return null
  const typeRaw = r.type
  const type = (TODO_TYPES as string[]).includes(typeof typeRaw === 'string' ? typeRaw : '')
    ? (typeRaw as TodoType)
    : 'generic'
  const statusRaw = r.status
  const status = (TODO_STATUSES as string[]).includes(typeof statusRaw === 'string' ? statusRaw : '')
    ? (statusRaw as TodoStatus)
    : 'open'
  const id = asString(r.id) ?? `todo-${index}-${Math.random().toString(36).slice(2, 10)}`
  const suggested_action = asString(r.suggested_action) ?? (type === 'email_reply' ? 'draft_reply' : 'generic')
  const action_params =
    typeof r.action_params === 'object' && r.action_params !== null
      ? (r.action_params as Record<string, unknown>)
      : undefined

  return {
    id,
    type,
    summary,
    context: asString(r.context),
    thread_id: asString(r.thread_id),
    client_slug: asString(r.client_slug),
    project_slug: asString(r.project_slug),
    suggested_action,
    action_params,
    status,
  }
}

// Extract the structured envelope from a completed triage run's aggregated text.
// Returns null if the envelope is missing or malformed — callers should treat that
// as "markdown-only run, no todos to cache" and continue without writing the cache.
export function extractTodosEnvelope(output: string): TodosCacheEntry | null {
  const match = output.match(TODOS_ENVELOPE_RE)
  if (!match) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(match[1])
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.todos)) return null
  const todos = obj.todos
    .map((t, i) => coerceTodo(t, i))
    .filter((t): t is Todo => t !== null)
  const generatedAt = asString(obj.generated_at) ?? new Date().toISOString()
  return { generatedAt, todos }
}
