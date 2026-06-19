'use client'

import type { LucideIcon } from 'lucide-react'
import type { ViewId } from './app-shell'

interface ToolbarProps {
  views: { id: ViewId; label: string; icon: LucideIcon }[]
  activeView: ViewId
  onViewChange: (view: ViewId) => void
  badges?: Partial<Record<ViewId, number>>
}

export function Toolbar({ views, activeView, onViewChange, badges }: ToolbarProps) {
  return (
    <nav className="app-shell__toolbar" aria-label="Main navigation">
      {views.map(({ id, label, icon: Icon }) => {
        const count = badges?.[id] ?? 0
        return (
          <button
            key={id}
            className={`toolbar-btn relative ${activeView === id ? 'toolbar-btn--active' : ''}`}
            onClick={() => onViewChange(id)}
            title={count > 0 ? `${label} (${count})` : label}
            aria-label={count > 0 ? `${label}, ${count} pending` : label}
            aria-current={activeView === id ? 'page' : undefined}
          >
            <Icon size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-brand-foreground tabular-nums">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
