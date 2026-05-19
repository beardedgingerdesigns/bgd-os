// aios-ui/components/project-card.tsx
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import { formatMRR } from '@/lib/format'
import type { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  clientSlug: string
  hasWiki?: boolean
}

export function ProjectCard({ project, clientSlug, hasWiki }: ProjectCardProps) {
  return (
    <Link href={`/clients/${clientSlug}/projects/${project.slug}`}>
      <Card className="hover:bg-accent/40 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{project.name}</CardTitle>
            {hasWiki && (
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" /> wiki
              </Badge>
            )}
          </div>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{project.status}</Badge>
            {project.contract && <span className="text-xs">{project.contract}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{formatMRR(project.mrr_monthly)}</div>
        </CardContent>
      </Card>
    </Link>
  )
}
