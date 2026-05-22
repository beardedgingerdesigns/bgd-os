// aios-ui/components/project-receipts-slice.tsx
// Server component — shows the last 10 receipts for the current project.
// Placed between RecentActivityFeed and ChatDrawer on the project page.

import { readRecentReceipts } from '@/lib/cache/receipts'
import type { ReceiptKind } from '@/lib/types'

interface Props {
  projectSlug: string
}

const KIND_CHIP: Record<ReceiptKind, string> = {
  capture: 'bg-blue-500/15 text-blue-300',
  todo: 'bg-zinc-500/15 text-zinc-300',
  triage_override: 'bg-amber-500/15 text-amber-300',
  chat_drop: 'bg-violet-500/15 text-violet-300',
  chat_session_close: 'bg-cyan-500/15 text-cyan-300',
  wiki_ingest: 'bg-emerald-500/15 text-emerald-300',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Date.now() - then
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

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + '…'
}

export async function ProjectReceiptsSlice({ projectSlug }: Props) {
  const all = await readRecentReceipts(100)
  const slice = all.filter(r => r.project_slug === projectSlug).slice(0, 10)

  return (
    <section className="mb-10">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
        Receipts — last 10 for this project
      </h2>

      {slice.length === 0 ? (
        <p className="text-sm text-muted-foreground">No receipts yet for this project.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {slice.map(r => (
            <li key={r.id} className="py-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-zinc-300">
                <span className="text-muted-foreground/60 tabular-nums">{relativeTime(r.ts)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span
                  className={
                    'inline-flex rounded px-1.5 py-0.5 text-[0.65rem] font-medium ' +
                    (KIND_CHIP[r.kind] ?? 'bg-zinc-500/15 text-zinc-300')
                  }
                >
                  {r.kind}
                </span>
              </div>
              <div className="mt-1 text-foreground/80">{truncate(r.excerpt, 80)}</div>
              <a
                href={`vscode://file/${r.file_written}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-mono text-[0.7rem] text-blue-300 underline underline-offset-2 hover:text-blue-200 break-all"
                title="Open in VS Code"
              >
                {r.file_written}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
