import { cn } from '@/lib/utils'

type Tone = 'brand' | 'accent' | 'neutral'

interface StatTileProps {
  label: string
  value: string                // pre-formatted (MRR string, number-with-commas, etc.)
  hint?: string                // smaller secondary line under the value
  tone?: Tone
  className?: string
}

// Top-of-dashboard hero tile. Soft brand-tinted gradient overlay + big tabular
// numeral. Modeled on the dashboard-screenshot reference but constrained to
// the BGD palette so it doesn't read as a generic SaaS template.
export function StatTile({ label, value, hint, tone = 'neutral', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-5',
        // Soft inner gradient — colored corner glow without a hard tint.
        // Pseudo-element keeps the gradient out of the content's stacking ctx.
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-100',
        tone === 'brand' &&
          'before:bg-[radial-gradient(120%_80%_at_0%_0%,rgb(253_180_20_/_0.18),transparent_55%)]',
        tone === 'accent' &&
          'before:bg-[radial-gradient(120%_80%_at_0%_0%,rgb(241_136_33_/_0.18),transparent_55%)]',
        tone === 'neutral' &&
          'before:bg-[radial-gradient(120%_80%_at_0%_0%,rgb(255_255_255_/_0.04),transparent_55%)]',
        className,
      )}
    >
      <div className="relative">
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
    </div>
  )
}
