// aios-ui/components/breadcrumb.tsx
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {c.href ? (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
