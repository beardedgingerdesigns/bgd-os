// aios-ui/components/wiki-display.tsx
//
// Phase 04 / Plan 03 (HUB-08) — Wiki content rendered as expandable sections
// on the Project page. Replaces the bare counts row that came out of
// detectWiki() with the actual decision + log content surfaced by 04-02's
// readWikiDecisions + readWikiLogEntries.
//
// This is an ASYNC SERVER COMPONENT — no client directive. The native
// <details>/<summary> primitive replaces a JS Collapsible because the
// project doesn't yet have @radix-ui/react-collapsible and details needs
// no JS to toggle.
import path from 'path'
import { BookOpen, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { readWikiDecisions, readWikiLogEntries } from '@/lib/data/wiki'
import type { DecisionSummary, WikiLogEntry } from '@/lib/types'

interface WikiDisplayProps {
  wikiPath: string
}

export async function WikiDisplay({ wikiPath }: WikiDisplayProps) {
  const [decisions, logEntries] = await Promise.all([
    readWikiDecisions(wikiPath),
    readWikiLogEntries(wikiPath, { limit: 5 }),
  ])
  const wikiName = path.basename(wikiPath)

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" /> Wiki — {wikiName}
        </h2>
        <a
          href={`vscode://file/${wikiPath}`}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          Open wiki folder <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <DecisionsSection
        title="Active decisions"
        decisions={decisions.active}
        emptyCopy="No active decisions in this wiki."
        defaultOpen
      />

      <LogSection entries={logEntries} />

      <DecisionsSection
        title="Deferred decisions"
        decisions={decisions.deferred}
        emptyCopy="No deferred decisions."
        defaultOpen={false}
      />
    </section>
  )
}

interface DecisionsSectionProps {
  title: string
  decisions: DecisionSummary[]
  emptyCopy: string
  defaultOpen: boolean
}

function DecisionsSection({
  title,
  decisions,
  emptyCopy,
  defaultOpen,
}: DecisionsSectionProps) {
  return (
    <details
      open={defaultOpen}
      className={defaultOpen ? 'mb-4 border-y border-border' : 'border-b border-border'}
    >
      <summary className="cursor-pointer py-3 flex items-center gap-2 font-medium">
        {title} <Badge variant="secondary">{decisions.length}</Badge>
      </summary>
      <ul className="divide-y divide-border">
        {decisions.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">{emptyCopy}</li>
        )}
        {decisions.map(d => (
          <li
            key={d.filePath}
            className="py-3 flex items-start justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{d.title}</div>
              {d.firstParagraph && (
                <div
                  className="text-sm text-muted-foreground mt-1"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {d.firstParagraph}
                </div>
              )}
            </div>
            <a
              href={`vscode://file/${d.filePath}`}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Open in editor <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

interface LogSectionProps {
  entries: WikiLogEntry[]
}

function LogSection({ entries }: LogSectionProps) {
  return (
    <details open className="mb-4 border-b border-border">
      <summary className="cursor-pointer py-3 flex items-center gap-2 font-medium">
        Recent log entries <Badge variant="secondary">{entries.length}</Badge>
      </summary>
      <ul className="divide-y divide-border">
        {entries.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">No log entries.</li>
        )}
        {entries.map(e => (
          <li
            key={`${e.path}-${e.date}-${e.title}`}
            className="py-3 flex items-start justify-between gap-4"
          >
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="font-mono text-xs text-muted-foreground shrink-0">
                {e.date}
              </span>
              <span className="text-sm truncate">{e.title}</span>
            </div>
            <a
              href={`vscode://file/${e.path}`}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
