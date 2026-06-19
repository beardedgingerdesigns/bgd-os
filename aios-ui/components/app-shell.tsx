'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, Inbox, FolderKanban, CheckSquare, GitCompareArrows } from 'lucide-react'
import { Toolbar } from './toolbar'
import { DashboardView } from './views/dashboard-view'
import { TriageView } from './views/triage-view'
import { ProjectsView } from './views/projects-view'
import { TodosView } from './views/todos-view'
import { SyncView } from './views/sync-view'
import { ChatPanel } from './chat-panel'
import { TriageRunProvider } from './triage-run-provider'
import type { StateUpdateStore } from '@/lib/types'

export type ViewId = 'dashboard' | 'triage' | 'projects' | 'todos' | 'sync'

const VIEWS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'triage', label: 'Triage', icon: Inbox },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'todos', label: 'Todos', icon: CheckSquare },
  { id: 'sync', label: 'Sync', icon: GitCompareArrows },
]

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  triage: TriageView,
  projects: ProjectsView,
  todos: TodosView,
  sync: SyncView,
}

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const [syncCount, setSyncCount] = useState(0)
  const ActiveComponent = VIEW_COMPONENTS[activeView]

  // Badge count for the Sync nav item. Fetch once, then re-fetch whenever the
  // server publishes an invalidation (apply/dismiss/triage write) over SSE.
  useEffect(() => {
    let cancelled = false
    const fetchCount = () => {
      fetch('/api/state-updates', { cache: 'no-store' })
        .then(r => (r.ok ? (r.json() as Promise<StateUpdateStore>) : null))
        .then(d => {
          if (!cancelled && d) setSyncCount(d.proposals?.length ?? 0)
        })
        .catch(() => { /* badge just stays put */ })
    }
    fetchCount()
    const es = new EventSource('/api/sse')
    es.addEventListener('invalidate', fetchCount)
    return () => {
      cancelled = true
      es.close()
    }
  }, [])

  return (
    <TriageRunProvider>
      <div className="app-shell">
        <Toolbar
          views={VIEWS}
          activeView={activeView}
          onViewChange={setActiveView}
          badges={{ sync: syncCount }}
        />
        <div className="app-shell__context">
          <ActiveComponent />
        </div>
        <div className="app-shell__chat">
          <ChatPanel />
        </div>
      </div>
    </TriageRunProvider>
  )
}
