// aios-ui/components/communications-section.tsx
//
// Phase 04 — Plan 04 (HUB-04): Project-page Communications surface. Reads the
// daily-inbox-triage cache (the markdown brief emitted by Step 5 of the
// skill), filters thread blocks down to ones that mention this project's
// contacts, and renders per-row Replied / Snooze 2d / Not me actions.
//
// Server component — wraps the client-side TriageOutput via the existing
// React server/client boundary.

import { readTriageCache } from '@/lib/cache/triage'
import { TriageOutput } from '@/components/triage-output'
import { formatRelativeDate } from '@/lib/format'

interface CommunicationsSectionProps {
  clientSlug: string
  projectSlug: string
  /**
   * Raw contact strings from project.contacts in clients.yaml — pass BOTH
   * plain emails and `@domain` patterns. The TriageOutput filter handles
   * both forms.
   */
  projectContacts: string[]
}

export async function CommunicationsSection({
  clientSlug: _clientSlug,
  projectSlug,
  projectContacts,
}: CommunicationsSectionProps) {
  const cache = await readTriageCache()

  if (!cache) {
    return (
      <section className="mb-10">
        <SectionHeader />
        <div className="p-5 rounded-md bg-card border border-dashed border-border text-sm text-muted-foreground">
          No daily triage cached. Run <span className="font-medium text-foreground">/daily-inbox-triage</span> from the Home page first.
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <SectionHeader ranAt={cache.ranAt} />
      <div className="p-4 rounded-md bg-card border border-border">
        <TriageOutput
          markdown={cache.output}
          projectSlug={projectSlug}
          projectContacts={projectContacts}
          renderRowActions
        />
      </div>
    </section>
  )
}

function SectionHeader({ ranAt }: { ranAt?: string } = {}) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-base font-semibold tracking-tight">Communications</h2>
      {ranAt && (
        <span className="text-xs text-muted-foreground tabular-nums">
          Last triage {formatRelative(ranAt)}
        </span>
      )}
    </div>
  )
}

function formatRelative(iso: string): string {
  try {
    return formatRelativeDate(iso.slice(0, 10))
  } catch {
    return iso
  }
}
