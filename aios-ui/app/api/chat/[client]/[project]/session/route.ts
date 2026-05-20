import { readChatSession } from '@/lib/cache/sessions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params
  const session = await readChatSession(client, project)
  return Response.json(session)
}
