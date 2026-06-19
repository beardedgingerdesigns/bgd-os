import { cn } from '@/lib/utils'

type Tone = 'brand' | 'accent' | 'neutral'

interface StatTileProps {
  label: string
  value: string                // pre-formatted (MRR string, number-with-commas, etc.)
  hint?: string                // smaller secondary line under the value
  tone?: Tone
  className?: string
}

// Top-of-dashboard stat tile. Light-native: white card, soft lift, big tabular
// numeral. The `brand` tone (MRR) gets a warm wash so it reads as the loudest
// thing on the page — money has color. Other tiles stay quiet white.
export function StatTile({ label, value, hint, tone = 'neutral', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-[var(--shadow-card)]',
        tone === 'brand'
          ? 'border-brand/25 bg-brand-muted'
          : 'border-border bg-card',
        className,
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="text-3xl font-semibold tabular-nums leading-none mt-2">
        {value}
      </div>
      {hint && (
        <div className="text-xs text-muted-foreground mt-2 tabular-nums">
          {hint}
        </div>
      )}
    </div>
  )
}
