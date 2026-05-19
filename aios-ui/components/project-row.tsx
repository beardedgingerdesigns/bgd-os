// aios-ui/components/project-row.tsx
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { formatMRR } from '@/lib/format'
import type { Project } from '@/lib/types'

interface ProjectRowProps {
  project: Project
  clientSlug: string
  hasWiki?: boolean
}

export function ProjectRow({ project, clientSlug, hasWiki }: ProjectRowProps) {
  return (
    <Link
      href={`/clients/${clientSlug}/projects/${project.slug}`}
      className="group flex items-center gap-4 py-3 hover:bg-muted/40 -mx-3 px-3 rounded-sm transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{project.name}</span>
          {hasWiki && (
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/80 shrink-0"
              title="LLM-wiki present"
            >
              <BookOpen className="h-3 w-3" />
              wiki
            </span>
          )}
        </div>
        {project.contract && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{project.contract}</div>
        )}
      </div>
      <div className="text-sm font-medium tabular-nums shrink-0 text-right text-foreground/90">
        {formatMRR(project.mrr_monthly)}
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
        aria-hidden
      />
    </Link>
  )
}
