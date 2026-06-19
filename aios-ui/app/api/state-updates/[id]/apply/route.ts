import fs from 'fs/promises'
import path from 'path'
import { readStateUpdates, markApplied } from '@/lib/cache/state-updates'
import { applyProposal } from '@/lib/data/state-merge'
import { STATE_DIR } from '@/lib/data/state'
import { invalidationBus } from '@/lib/invalidation-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ApplyBody {
  proposed?: string // optional edited value from the Sync "Edit" affordance
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(tmp, content, 'utf-8')
  await fs.rename(tmp, filePath)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let body: ApplyBody = {}
  try {
    body = (await req.json()) as ApplyBody
  } catch {
    /* empty / missing body is fine — apply the stored value */
  }

  const store = await readStateUpdates()
  const proposal = store.proposals.find(p => p.id === id)
  if (!proposal) return Response.json({ error: 'not-found' }, { status: 404 })

  // An edited, non-empty proposed value overrides the drafted one.
  const effective =
    typeof body.proposed === 'string' && body.proposed.trim() !== ''
      ? { ...proposal, proposed: body.proposed }
      : proposal

  const filePath = path.join(STATE_DIR, `${proposal.slug}.md`)
  let markdown: string
  try {
    markdown = await fs.readFile(filePath, 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return Response.json({ error: 'state-file-missing' }, { status: 404 })
    }
    throw err
  }

  const result = applyProposal(markdown, effective, todayISODate())
  if (!result.ok) {
    // stale → 409 (file moved since drafting; re-review); field-not-found → 422
    return Response.json({ error: result.reason }, { status: result.reason === 'stale' ? 409 : 422 })
  }

  await atomicWrite(filePath, result.markdown)
  // markApplied (not removeProposal) so the frozen triage envelope can't
  // resurrect this proposal on the next reconcile-on-read GET.
  await markApplied(id)
  invalidationBus.publish({
    scope: { kind: 'admin' },
    reason: `state update applied: ${proposal.slug}`,
    at: new Date().toISOString(),
  })

  return Response.json({ ok: true, slug: proposal.slug })
}
