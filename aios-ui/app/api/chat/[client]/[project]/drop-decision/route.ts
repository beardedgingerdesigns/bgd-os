// aios-ui/app/api/chat/[client]/[project]/drop-decision/route.ts
//
// Phase 04 — Plan 08 (HUB-05 + HUB-06): per-AI-message "Drop to raw" endpoint.
// Body: { userTurn: string; assistantTurn: string }
//
// Writes `{wiki}/raw/aios/chat-decision-YYYY-MM-DD-<slug>.md` via writeRawDrop,
// appends a `chat_drop` receipt, and returns the absolute file path.
//
// Naming discipline (Plan-checker iteration 1 fix): the route param
// `project` MUST NOT be shadowed by a local `const project = await getProject(...)`
// — that would TDZ-error on the slug param. Use `projectObj` instead. The
// chat-drop test verifies receipts.project_slug equals the route-param slug.

import { resolveProjectWikiPath } from '@/lib/data/wiki'
import { writeRawDrop, slugify } from '@/lib/raw-drops'
import { appendReceipt } from '@/lib/cache/receipts'
import { buildChatDecisionMarkdown } from '@/lib/skills/chat-writeback'
import { getClient, getProject } from '@/lib/data/clients'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface DropDecisionBody {
  userTurn?: unknown
  assistantTurn?: unknown
}

function newReceiptId(): string {
  return `rcpt_${Math.random().toString(36).slice(2, 12)}`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  let body: DropDecisionBody
  try {
    body = (await req.json()) as DropDecisionBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const userTurn = body.userTurn
  const assistantTurn = body.assistantTurn
  if (typeof userTurn !== 'string' || userTurn.trim().length === 0) {
    return Response.json({ error: 'userTurn required (non-empty string)' }, { status: 400 })
  }
  if (typeof assistantTurn !== 'string' || assistantTurn.trim().length === 0) {
    return Response.json(
      { error: 'assistantTurn required (non-empty string)' },
      { status: 400 },
    )
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

  const slug = slugify(assistantTurn.slice(0, 60))
  const md = buildChatDecisionMarkdown({
    projectLabel,
    userTurn,
    assistantTurn,
    dropAt: new Date(),
  })
  const { filePath, excerpt } = await writeRawDrop({
    wikiPath,
    kind: 'chat-decision',
    slug,
    body: md,
  })

  const receiptId = newReceiptId()
  await appendReceipt({
    id: receiptId,
    ts: new Date().toISOString(),
    kind: 'chat_drop',
    // NB: this is the route-param slug, NOT projectObj.slug. Tests assert
    // this equality to catch any future shadowing regression.
    project_slug: project,
    file_written: filePath,
    excerpt,
    actor: 'chat-drawer',
  })

  return Response.json({ ok: true, filePath, receiptId })
}
