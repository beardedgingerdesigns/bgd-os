import type { Client, Project } from '@/lib/types'

function isCountedProject(project: Project): boolean {
  return project.status === 'active' && typeof project.mrr_monthly === 'number'
}

export function computeClientMRR(client: Client): number {
  if (client.bucket !== 'paying') return 0
  return client.projects
    .filter(isCountedProject)
    .reduce((sum, p) => sum + (p.mrr_monthly ?? 0), 0)
}

export function computeTotalMRR(clients: Client[]): number {
  return clients.reduce((sum, c) => sum + computeClientMRR(c), 0)
}
