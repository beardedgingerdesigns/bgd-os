import type { Bucket, ProjectStatus } from '@/lib/types'

// Maps domain enums onto Badge variants so the visual encoding is consistent
// across every surface that renders status/bucket. Variant names match the
// cva entries in components/ui/badge.tsx.

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'brand'
  | 'accent'
  | 'muted'

export function bucketBadge(bucket: Bucket): { variant: BadgeVariant; label: string } {
  switch (bucket) {
    case 'paying':    return { variant: 'success', label: 'Paying' }
    case 'prospects': return { variant: 'accent', label: 'Prospects' }
    case 'internal':  return { variant: 'muted', label: 'Internal' }
  }
}

export function statusBadge(status: ProjectStatus): { variant: BadgeVariant; label: string } {
  switch (status) {
    case 'active':   return { variant: 'success', label: 'Active' }
    case 'paused':   return { variant: 'warning', label: 'Paused' }
    case 'done':     return { variant: 'info', label: 'Done' }
    case 'archived': return { variant: 'muted', label: 'Archived' }
  }
}
