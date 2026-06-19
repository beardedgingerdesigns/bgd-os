'use client'

import { useState } from 'react'
import { LayoutDashboard, Inbox, FolderKanban, CheckSquare } from 'lucide-react'
import { Toolbar } from './toolbar'
import { DashboardView } from './views/dashboard-view'
import { TriageView } from './views/triage-view'
import { ProjectsView } from './views/projects-view'
import { TodosView } from './views/todos-view'
import { ChatPanel } from './chat-panel'

export type ViewId = 'dashboard' | 'triage' | 'projects' | 'todos'

const VIEWS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'triage', label: 'Triage', icon: Inbox },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'todos', label: 'Todos', icon: CheckSquare },
]

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  triage: TriageView,
  projects: ProjectsView,
  todos: TodosView,
}

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const ActiveComponent = VIEW_COMPONENTS[activeView]

  return (
    <div className="app-shell">
      <Toolbar
        views={VIEWS}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="app-shell__context">
        <ActiveComponent />
      </div>
      <div className="app-shell__chat">
        <ChatPanel />
      </div>
    </div>
  )
}
