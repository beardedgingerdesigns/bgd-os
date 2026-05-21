import { ExternalLink } from 'lucide-react'
import { TriageRowActions } from '@/components/triage-row-actions'

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

export function TriageOutput({
  markdown,
  projectSlug,
  projectContacts,
  renderRowActions,
}: TriageOutputProps) {
  const filtered =
    projectSlug && projectContacts && projectContacts.length > 0
      ? filterByContacts(markdown, projectContacts)
      : markdown

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
