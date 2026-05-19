export function formatMRR(amount: number | undefined): string {
  if (!amount) return '—'
  return `$${amount.toLocaleString('en-US')}/mo`
}

export function formatRelativeDate(iso: string, anchor: Date = new Date()): string {
  const date = new Date(iso + 'T00:00:00Z')
  const anchorDay = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()))
  const dayMs = 24 * 60 * 60 * 1000
  const diffDays = Math.round((anchorDay.getTime() - date.getTime()) / dayMs)

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`
  return iso
}
