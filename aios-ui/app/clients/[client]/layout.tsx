// aios-ui/app/clients/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/data/clients'
import { SidebarProjects } from '@/components/sidebar-projects'

export default async function ClientLayout(props: LayoutProps<'/clients/[client]'>) {
  const { client: clientSlug } = await props.params
  const client = await getClient(clientSlug)
  if (!client) notFound()

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProjects client={client} />
      <div className="flex-1 overflow-y-auto">{props.children}</div>
    </div>
  )
}
