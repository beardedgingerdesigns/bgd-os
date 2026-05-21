// aios-ui/app/api/chat/[client]/[project]/drop-session/route.ts
//
// Phase 04 — Plan 08 (HUB-05 + HUB-06): chat-session transcript drop.
// Body: { messages: Array<{ role: 'user' | 'assistant'; content: string }> }
//
// Writes `{wiki}/raw/aios/chat-session-YYYY-MM-DD-<sessionId>.md` via
// writeRawDrop, appends a `chat_session_close` receipt. Empty-messages
// requests return { ok: true, skipped: true } with no file/receipt side
// effects — see plan acceptance.
//
// Naming discipline: same `projectObj` pattern as drop-decision (no shadowing
// the `project` route param).

import { resolveProjectWikiPath } from '@/lib/data/wiki'
import { writeRawDrop, slugify } from '@/lib/raw-drops'
import { appendReceipt } from '@/lib/cache/receipts'
import { buildChatSessionMarkdown } from '@/lib/skills/chat-writeback'
import { readChatSession } from '@/lib/cache/sessions'
import { getClient, getProject } from '@/lib/data/clients'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface DropSessionBody {
  messages?: Array<{ role?: unknown; content?: unknown }>
}

function newReceiptId(): string {
  return `rcpt_${Math.random().toString(36).slice(2, 12)}`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  let body: DropSessionBody
  try {
    body = (await req.json()) as DropSessionBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : []
  const messages = rawMessages
    .filter(
      m =>
        (m?.role === 'user' || m?.role === 'assistant') &&
        typeof m?.content === 'string' &&
        (m.content as string).trim().length > 0,
    )
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content as string,
    }))

  if (messages.length === 0) {
    // Operator collapsed an empty drawer — no-op, no file, no receipt.
    return Response.json({ ok: true, skipped: true })
  }

  const wikiPath = await resolveProjectWikiPath(client, project)
  if (!wikiPath) {
    return Response.json(
      { error: 'no wiki path resolved for this project' },
      { status: 400 },
    )
  }

  const clientObj = await getClient(client)
  const projectObj = await getProject(client, project)
  const projectLabel =
    clientObj && projectObj
      ? `${clientObj.name} — ${projectObj.name}`
      : `${client}/${project}`

  const session = await readChatSession(client, project)
  const sessionId = session?.sessionId ?? `no-session-id-${Date.now()}`
  const startedAt = session?.startedAt ?? new Date().toISOString()
  const closedAt = new Date().toISOString()

  const md = buildChatSessionMarkdown({
    projectLabel,
    sessionId,
    startedAt,
    closedAt,
    messages,
  })

  const { filePath, excerpt } = await writeRawDrop({
    wikiPath,
    kind: 'chat-session',
    slug: slugify(sessionId),
    body: md,
  })

  const receiptId = newReceiptId()
  await appendReceipt({
    id: receiptId,
    ts: closedAt,
    kind: 'chat_session_close',
    project_slug: project,
    file_written: filePath,
    excerpt,
    actor: 'chat-drawer',
  })

  return Response.json({ ok: true, filePath })
}
