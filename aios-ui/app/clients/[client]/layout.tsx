// aios-ui/app/clients/[client]/layout.tsx
import { notFound } from 'next/navigation'
import { getClient } from '@/lib/data/clients'

export default async function ClientLayout(props: LayoutProps<'/clients/[client]'>) {
  const { client: clientSlug } = await props.params
  const client = await getClient(clientSlug)
  if (!client) notFound()
  return <>{props.children}</>
}
