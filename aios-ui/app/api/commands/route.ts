import { loadSlashCommands } from '@/lib/data/commands'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const commands = await loadSlashCommands()
  return Response.json(commands)
}
