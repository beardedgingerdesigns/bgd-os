import { ExternalLink } from 'lucide-react'
import { TriageRowActions } from '@/components/triage-row-actions'
import { extractTodosEnvelope } from '@/lib/skills/todos-envelope'
import { stripTriageEnvelopes } from '@/lib/skills/triage-envelopes'
import type { Todo } from '@/lib/types'

interface TriageOutputProps {
  markdown: string
  /**
   * When set with `projectContacts`, the rendered output is filtered down to
   * thread blocks that mention at least one contact. Blocks without a thread
   * ID still render (e.g., section headers like "## Reply today"), but only
   * if a kept thread block followed them — see filterByContacts below.
   */
  projectSlug?: string
  /**
   * Plain emails (`meghan@wildrosecasino.com`) match exact-string substrings.
   * Domain patterns (`@wildrosecasino.com`) match any occurrence of the
   * substring after the `@` (i.e. anywhere `wildrosecasino.com` appears).
   */
  projectContacts?: string[]
  /** When true, render TriageRowActions beneath each Gmail link line. */
  renderRowActions?: boolean
}

const GMAIL_LINK_BASE = 'https://mail.google.com/mail/u/0/#inbox/'
// Match lines like:  Thread: `19e20c28fc120342`
const THREAD_ID_REGEX = /Thread:\s*`?([0-9a-f]{12,20})`?/g

// Block boundary heuristic: a new block starts when a line begins with `## `,
// `### `, `1.`, `2.`, `- **`, or `Thread:` after a blank line — see
// daily-inbox-triage SKILL.md Step 5 output template.
const BLOCK_BOUNDARY = /^(##+\s|\d+\.\s|-\s\*\*|Thread:\s)/


interface ThreadBlock {
  lines: string[]
  threadId: string | null
}

function splitIntoBlocks(markdown: string): ThreadBlock[] {
  const lines = markdown.split('\n')
  const blocks: ThreadBlock[] = []
  let current: string[] = []

  const flush = () => {
    if (current.length === 0) return
    const body = current.join('\n')
    const m = body.match(/Thread:\s*`?([0-9a-f]{12,20})`?/)
    blocks.push({ lines: [...current], threadId: m ? m[1] : null })
    current = []
  }

  for (const line of lines) {
    if (BLOCK_BOUNDARY.test(line) && current.length > 0) {
      flush()
    }
    current.push(line)
  }
  flush()
  return blocks
}

function contactMatches(block: ThreadBlock, contacts: string[]): boolean {
  const body = block.lines.join('\n').toLowerCase()
  for (const raw of contacts) {
    if (!raw) continue
    const needle = raw.startsWith('@') ? raw.slice(1).toLowerCase() : raw.toLowerCase()
    if (!needle) continue
    if (body.includes(needle)) return true
  }
  return false
}

function filterByContacts(markdown: string, contacts: string[]): string {
  const blocks = splitIntoBlocks(markdown)
  const kept: ThreadBlock[] = []
  for (const b of blocks) {
    // Only filter blocks that contain a thread ID; preserve standalone
    // headers/intro text that has no thread.
    if (b.threadId === null) {
      kept.push(b)
      continue
    }
    if (contactMatches(b, contacts)) {
      kept.push(b)
    }
  }
  return kept.map(b => b.lines.join('\n')).join('\n')
}

/**
 * Structured render path (GAP-04-01).
 *
 * When the skill emits a `<!-- TODOS_JSON_START -->...<!-- TODOS_JSON_END -->`
 * envelope (the contract daily-inbox-triage SKILL.md guarantees), we use it
 * as the PRIMARY data source for per-row actions. The prose markdown above
 * the envelope is human-readable but ambiguous to substring-filter (it
 * contains display names like "Wild Rose group", not email addresses), which
 * was the UAT-04 failure mode. The envelope carries `project_slug` matched
 * exactly against `clients.yaml`, so filtering is deterministic.
 *
 * The envelope itself is suppressed from rendered output — it's a system
 * marker, not operator-facing.
 */
function renderTodosStructured(
  todos: Todo[],
  projectSlug: string,
): React.ReactElement | null {
  const scoped = todos.filter(t => t.project_slug === projectSlug)
  if (scoped.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No threads scoped to this project in the latest triage run.
      </p>
    )
  }
  return (
    <ul className="space-y-4 list-none p-0 m-0">
      {scoped.map(todo => {
        const threadId = todo.thread_id
        return (
          <li
            key={todo.id}
            className="border border-border rounded-md p-3 bg-background/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-foreground/90 text-sm leading-snug">
                  {todo.summary}
                </div>
                {todo.context && (
                  <p className="mt-1 text-sm text-muted-foreground leading-snug">
                    {todo.context}
                  </p>
                )}
                {threadId && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <a
                      href={`${GMAIL_LINK_BASE}${threadId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                    >
                      <code className="text-xs">{threadId}</code>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
              {threadId && (
                <div className="shrink-0">
                  <TriageRowActions threadId={threadId} projectSlug={projectSlug} />
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function TriageOutput({
  markdown,
  projectSlug,
  projectContacts,
  renderRowActions,
}: TriageOutputProps) {
  // Primary path (GAP-04-01): when row actions are requested AND the skill
  // emitted a TODOS_JSON envelope, render structured rows from the envelope.
  // This is the operator-facing surface for Communications on a Project page.
  if (renderRowActions && projectSlug) {
    const envelope = extractTodosEnvelope(markdown)
    if (envelope) {
      return (
        <article className="max-w-none text-sm leading-7 text-foreground/90">
          {renderTodosStructured(envelope.todos, projectSlug)}
        </article>
      )
    }
  }

  // Fallback / legacy path: no envelope (older cache, or admin dashboard
  // usage where rows aren't requested). Run the original prose-block filter
  // by contacts and render the markdown with Gmail-link rewrites in place.
  // We still strip the envelope markers if any happen to be present, so the
  // operator never sees the raw <!-- TODOS_JSON_START --> markers as text.
  const withoutEnvelope = stripTriageEnvelopes(markdown)

  const filtered =
    projectSlug && projectContacts && projectContacts.length > 0
      ? filterByContacts(withoutEnvelope, projectContacts)
      : withoutEnvelope

  const enhanced = filtered.replace(THREAD_ID_REGEX, (match, id) => {
    return `Thread: [\`${id}\`](${GMAIL_LINK_BASE}${id})`
  })

  return (
    <article className="prose prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-7 text-foreground/90">
      {enhanced.split('\n').map((line, i) => {
        const linkMatch = line.match(/\[`([^`]+)`\]\((https:\/\/mail\.google\.com[^)]+)\)/)
        if (linkMatch) {
          const before = line.slice(0, linkMatch.index!)
          const [, id, url] = linkMatch
          const after = line.slice((linkMatch.index ?? 0) + linkMatch[0].length)
          return (
            <div key={i}>
              <div>
                {before}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                >
                  <code className="text-sm">{id}</code>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {after}
              </div>
              {renderRowActions && projectSlug && (
                <TriageRowActions threadId={id} projectSlug={projectSlug} />
              )}
            </div>
          )
        }
        return <div key={i}>{line}</div>
      })}
    </article>
  )
}
