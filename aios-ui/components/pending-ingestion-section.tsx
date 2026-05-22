// aios-ui/components/pending-ingestion-section.tsx
// Server component — reads raw/aios/ pending drops via readPendingIngest and
// surfaces the count + file list + Run wiki ingest button (Phase 04 HUB-07).

import path from 'path'
import { readPendingIngest } from '@/lib/data/wiki'
import { RunIngestButton } from '@/components/run-ingest-button'

interface Props {
  clientSlug: string
  projectSlug: string
  wikiPath: string | null
}

const KIND_CHIP: Record<string, string> = {
  capture: 'bg-blue-500/15 text-blue-300',
  'chat-decision': 'bg-violet-500/15 text-violet-300',
  'chat-session': 'bg-cyan-500/15 text-cyan-300',
  other: 'bg-zinc-500/15 text-zinc-300',
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  if (diff < 0) return 'just now'
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export async function PendingIngestionSection({ clientSlug, projectSlug, wikiPath }: Props) {
  if (!wikiPath) {
    return (
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Pending Ingestion
        </h2>
        <p className="text-sm text-muted-foreground">No wiki configured for this project.</p>
      </section>
    )
  }

  const result = await readPendingIngest(wikiPath)

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Pending Ingestion ({result.count})
        </h2>
      </div>

      {result.count === 0 ? (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>All AIOS drops have been ingested into the wiki.</p>
          {result.lastIngestAt && (
            <p className="text-xs text-muted-foreground/70">
              Last ingest: {relativeTime(result.lastIngestAt)}
            </p>
          )}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border border-y border-border mb-4">
            {result.files.map(file => (
              <li key={file.filePath} className="flex items-center gap-3 py-2.5">
                <span
                  className={
                    'inline-flex rounded px-1.5 py-0.5 text-[0.65rem] font-medium shrink-0 ' +
                    (KIND_CHIP[file.kind] ?? KIND_CHIP.other)
                  }
                >
                  {file.kind}
                </span>
                <a
                  href={`vscode://file/${file.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-foreground/80 hover:text-foreground hover:underline underline-offset-2 truncate flex-1"
                  title={`Open ${file.filePath} in VS Code`}
                >
                  {path.basename(file.filePath)}
                </a>
                <span className="text-xs text-muted-foreground/60 shrink-0 tabular-nums">
                  {relativeTime(file.mtime)}
                </span>
              </li>
            ))}
          </ul>
          <RunIngestButton
            clientSlug={clientSlug}
            projectSlug={projectSlug}
            count={result.count}
          />
        </>
      )}
    </section>
  )
}
