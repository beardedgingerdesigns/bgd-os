'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { formatRelativeDate } from '@/lib/format'
import { RitualModal } from '@/components/ritual-modal'
import type { RitualCacheEntry, RitualSlug } from '@/lib/types'

interface RitualTileProps {
  slug: RitualSlug
  title: string
  description: string
  initialCache: RitualCacheEntry | null
}

export function RitualTile({ slug, title, description, initialCache }: RitualTileProps) {
  const [open, setOpen] = useState(false)
  const lastRanLabel = initialCache
    ? `Last ran ${formatRelativeDate(initialCache.ranAt.slice(0, 10))}`
    : 'Never run'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left p-5 rounded-md bg-card border border-border hover:border-brand/40 hover:bg-muted/40 transition-colors flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open ${title} ritual`}
      >
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {slug}
          </div>
          <div className="text-base font-semibold tracking-tight mt-1">{title}</div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground tabular-nums">{lastRanLabel}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-brand transition-colors">
            run <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </button>

      <RitualModal
        open={open}
        onOpenChange={setOpen}
        slug={slug}
        title={title}
        description={description}
        initialCache={initialCache}
      />
    </>
  )
}
