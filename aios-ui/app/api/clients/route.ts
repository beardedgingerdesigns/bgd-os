import { revalidatePath } from 'next/cache'
import {
  addClient,
  ClientNotFoundError,
  DuplicateSlugError,
  InvalidSlugError,
  MalformedYamlError,
  slugify,
} from '@/lib/data/clients-mutations'
import { invalidationBus } from '@/lib/invalidation-bus'
import type { Bucket } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CreateClientBody {
  name?: unknown
  slug?: unknown
  bucket?: unknown
  notes?: unknown
}

export async function POST(req: Request) {
  let body: CreateClientBody
  try {
    body = (await req.json()) as CreateClientBody
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }
  const explicitSlug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const slug = explicitSlug || slugify(name)
  const bucket = body.bucket
  const notes = typeof body.notes === 'string' ? body.notes : undefined

  try {
    const client = await addClient({ slug, name, bucket: bucket as Bucket, notes })
    // revalidatePath is a Next-only optimization for static caching. In tests
    // or any non-render context it throws — best-effort it so the mutation
    // result still reaches the caller (SSE invalidate handles live refresh).
    bestEffortRevalidate(['/', '/admin'])
    invalidationBus.publish({
      scope: { kind: 'global' },
      reason: `client ${client.slug} created`,
      at: new Date().toISOString(),
    })
    return Response.json({ ok: true, client }, { status: 201 })
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
    // Server-side data integrity problem — surface as 500 so the form can show
    // a "contact admin / check the file" message instead of "fix your input".
    return Response.json({ error: err.message, kind: err.kind }, { status: 500 })
  }
  const message = err instanceof Error ? err.message : String(err)
  return Response.json({ error: message }, { status: 500 })
}
