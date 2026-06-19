import fs from 'fs/promises'
import path from 'path'
import { spawn } from 'child_process'
import { resolveProjectWikiPath } from '@/lib/data/wiki'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/wiki/ingest/{client}/{project}/resolve
 *
 * Resolves a flagged contradiction from the wiki ingest evaluation.
 * Body: { file: string, action: "accept" | "skip" }
 *
 * - "skip": Writes a resolution record to .resolved/{filename}.json.
 *   The raw drop is NOT modified (ADR 0004 immutability preserved).
 * - "accept": Spawns a /llm-wiki subprocess to promote the specific file,
 *   then writes a resolution record.
 *
 * The .resolved/ directory is a metadata layer. On subsequent ingest runs,
 * the skill checks .resolved/{filename}.json to skip already-resolved files.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ client: string; project: string }> },
) {
  const { client, project } = await params

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const { file, action } = body

  // Validate file param
  if (typeof file !== 'string' || file.trim() === '') {
    return Response.json({ error: 'file must be a non-empty string' }, { status: 400 })
  }

  // Validate action param
  if (action !== 'accept' && action !== 'skip') {
    return Response.json(
      { error: 'action must be "accept" or "skip"' },
      { status: 400 },
    )
  }

  // T-07-07 mitigation: reject path traversal in file param
  const sanitized = path.basename(file)
  if (sanitized !== file || file.includes('/') || file.includes('\\') || file.includes('..')) {
    return Response.json(
      { error: 'file must be a simple filename (no path separators)' },
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

  const resolvedDir = path.join(wikiPath, 'raw', 'aios', '.resolved')
  const resolvedFile = path.join(resolvedDir, `${sanitized}.json`)

  // Verify the raw drop actually exists before resolving
  const rawDropPath = path.join(wikiPath, 'raw', 'aios', sanitized)
  try {
    await fs.access(rawDropPath)
  } catch {
    return Response.json(
      { error: `file not found in raw/aios/: ${sanitized}` },
      { status: 404 },
    )
  }

  try {
    await fs.mkdir(resolvedDir, { recursive: true })

    if (action === 'skip') {
      // Write resolution record. Do NOT modify the raw drop (ADR 0004).
      await fs.writeFile(
        resolvedFile,
        JSON.stringify(
          {
            action: 'skip',
            resolvedAt: new Date().toISOString(),
            reason: 'operator chose to keep existing wiki content',
          },
          null,
          2,
        ),
        'utf-8',
      )

      return Response.json({ ok: true, action: 'skip', file: sanitized })
    }

    // action === 'accept': promote via /llm-wiki subprocess
    const filePath = path.join(wikiPath, 'raw', 'aios', sanitized)

    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        'claude',
        [
          '--print',
          '--permission-mode', 'bypassPermissions',
          `/llm-wiki ${filePath}`,
        ],
        {
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: process.env.CLAUDE_OS_ROOT ?? process.cwd(),
        },
      )

      let stderr = ''

      child.stderr.on('data', (d: Buffer) => {
        stderr += d.toString()
      })

      const timer = setTimeout(() => {
        try { child.kill('SIGKILL') } catch { /* already exited */ }
        reject(new Error('promotion subprocess timed out after 120s'))
      }, 120_000)

      child.on('error', (err: Error) => {
        clearTimeout(timer)
        reject(err)
      })

      child.on('close', (code: number | null) => {
        clearTimeout(timer)
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(stderr.trim() || `promotion subprocess exited ${code}`))
        }
      })
    })

    // Write resolution record after successful promotion
    await fs.writeFile(
      resolvedFile,
      JSON.stringify(
        {
          action: 'accept',
          resolvedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      'utf-8',
    )

    return Response.json({ ok: true, action: 'accept', file: sanitized })
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
