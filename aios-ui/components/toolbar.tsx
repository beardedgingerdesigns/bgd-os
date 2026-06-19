'use client'

import type { LucideIcon } from 'lucide-react'
import type { ViewId } from './app-shell'

interface ToolbarProps {
  views: { id: ViewId; label: string; icon: LucideIcon }[]
  activeView: ViewId
  onViewChange: (view: ViewId) => void
}

export function Toolbar({ views, activeView, onViewChange }: ToolbarProps) {
  return (
    <nav className="app-shell__toolbar" aria-label="Main navigation">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`toolbar-btn ${activeView === id ? 'toolbar-btn--active' : ''}`}
          onClick={() => onViewChange(id)}
          title={label}
          aria-label={label}
          aria-current={activeView === id ? 'page' : undefined}
        >
          <Icon size={20} />
        </button>
      ))}
    </nav>
  )
}
