import { revalidatePath } from 'next/cache'
import {
  addProject,
  ClientNotFoundError,
  DuplicateSlugError,
  InvalidSlugError,
  MalformedYamlError,
  slugify,
} from '@/lib/data/clients-mutations'
import { invalidationBus } from '@/lib/invalidation-bus'
import type { ProjectStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CreateProjectBody {
  name?: unknown
  slug?: unknown
  status?: unknown
  contract?: unknown
  mrr_monthly?: unknown
  docs_paths?: unknown
  contacts?: unknown
}

function asStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string }> },
) {
  const { client: clientSlug } = await params

  let body: CreateProjectBody
  try {
    body = (await req.json()) as CreateProjectBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }
  const explicitSlug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const slug = explicitSlug || slugify(name)
  const status = body.status
  const contract = typeof body.contract === 'string' ? body.contract : undefined
  const mrr_monthly =
    typeof body.mrr_monthly === 'number'
      ? body.mrr_monthly
      : typeof body.mrr_monthly === 'string' && body.mrr_monthly.trim() !== ''
        ? Number(body.mrr_monthly)
        : undefined
  if (mrr_monthly !== undefined && Number.isNaN(mrr_monthly)) {
    return Response.json({ error: 'mrr_monthly must be a number' }, { status: 400 })
  }
  const docs_paths = asStringList(body.docs_paths)
  const contacts = asStringList(body.contacts)

  try {
    const project = await addProject(clientSlug, {
      slug,
      name,
      status: status as ProjectStatus,
      contract,
      mrr_monthly,
      docs_paths,
      contacts,
    })
    bestEffortRevalidate(['/', `/clients/${clientSlug}`])
    invalidationBus.publish({
      scope: { kind: 'client', clientSlug },
      reason: `project ${project.slug} created`,
      at: new Date().toISOString(),
    })
    return Response.json({ ok: true, project }, { status: 201 })
  } catch (err) {
    return errorResponse(err)
  }
}

function bestEffortRevalidate(paths: string[]): void {
  for (const p of paths) {
    try { revalidatePath(p) } catch { /* missing render context — fine */ }
  }
}

function errorResponse(err: unknown): Response {
  if (err instanceof DuplicateSlugError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 409 })
  }
  if (err instanceof ClientNotFoundError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 404 })
  }
  if (err instanceof InvalidSlugError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 400 })
  }
  if (err instanceof MalformedYamlError) {
    return Response.json({ error: err.message, kind: err.kind }, { status: 500 })
  }
  const message = err instanceof Error ? err.message : String(err)
  return Response.json({ error: message }, { status: 500 })
}
