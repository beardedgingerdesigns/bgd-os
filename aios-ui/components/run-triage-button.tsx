'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Play } from 'lucide-react'
import { useTriageRun } from '@/components/triage-run-provider'

interface Props {
  className?: string
}

// Thin control over the shared triage run (see TriageRunProvider). Running state
// is global, so this button reflects an in-flight run no matter which view
// started it.
export function RunTriageButton({ className }: Props) {
  const { running, error, run } = useTriageRun()

  return (
    <div className={className}>
      <Button size="sm" variant="outline" onClick={run} disabled={running} aria-label="Run triage now">
        {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
        <span className="ml-1.5 text-xs">{running ? 'process running' : 'Run triage'}</span>
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
