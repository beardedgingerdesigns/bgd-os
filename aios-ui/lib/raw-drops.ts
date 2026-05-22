// aios-ui/lib/raw-drops.ts
//
// Phase 04 — bidirectional hub: helpers for writing raw drops into the wiki
// under {wiki}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md (ADR 0004).
//
// Every write surface in Wave 2+ uses these helpers — do not change the
// exported contract without coordinated downstream updates (see PLAN 04-01).

import fs from 'fs/promises'
import path from 'path'
import type { RawDropKind } from '@/lib/types'

export type { RawDropKind }

const MAX_SLUG_LEN = 60
const MAX_COLLISION_SUFFIX = 99

/**
 * slugify: lowercase, hyphenate non-alphanumeric runs, trim leading/trailing
 * hyphens, cap at 60 chars. Returns 'untitled' when the result is empty.
 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LEN)
    // Re-trim in case the slice introduced a trailing hyphen.
    .replace(/-+$/g, '')
  return slug.length > 0 ? slug : 'untitled'
}

/**
 * Phase 04 review WR-08: defense-in-depth path guard. Resolve both root and
 * target and verify the target stays inside the root subtree. Catches:
 *   - relative `..` segments in slug/kind that escape raw/aios/
 *   - absolute path injection (wouldn't be possible from slugify output,
 *     but kind and wikiPath are caller-supplied)
 *   - symlink-bypass IS NOT covered (path.resolve does not follow symlinks).
 *     The realpath equivalent is intentionally NOT done here — wikiPath
 *     itself is trusted-ish (read from clients.yaml) and a malicious symlink
 *     inside the wiki is an out-of-band compromise.
 *
 * Throws on escape so callers see a hard error instead of silently writing
 * outside the expected tree.
 */
function assertInside(root: string, target: string): void {
  const absRoot = path.resolve(root)
  const absTarget = path.resolve(target)
  if (absTarget !== absRoot && !absTarget.startsWith(absRoot + path.sep)) {
    throw new Error(`raw-drop path escaped root: target=${absTarget} root=${absRoot}`)
  }
}

/**
 * buildRawDropPath: returns the canonical absolute path
 * `${wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`.
 *
 * Phase 04 review WR-08: verifies the resolved path stays inside
 * `{wikiPath}/raw/aios/`. If slugify() were ever bypassed or kind were
 * caller-supplied with `..`, the assertion would catch it before fs.writeFile.
 */
export function buildRawDropPath(args: {
  wikiPath: string
  kind: RawDropKind
  date?: Date
  slug: string
}): string {
  const date = args.date ?? new Date()
  const dateStr = date.toISOString().slice(0, 10)
  const rawAiosDir = path.join(args.wikiPath, 'raw', 'aios')
  const target = path.join(
    rawAiosDir,
    `${args.kind}-${dateStr}-${args.slug}.md`,
  )
  assertInside(rawAiosDir, target)
  return target
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p)
    return true
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw err
  }
}

/**
 * writeRawDrop: ensures `raw/aios/` exists, writes the body to the computed
 * path, and on filename collision appends `-2`, `-3`, ... (up to `-99`).
 *
 * Returns the absolute file path written and a 240-char excerpt of the body.
 */
export async function writeRawDrop(args: {
  wikiPath: string
  kind: RawDropKind
  slug: string
  body: string
  date?: Date
}): Promise<{ filePath: string; excerpt: string }> {
  const basePath = buildRawDropPath({
    wikiPath: args.wikiPath,
    kind: args.kind,
    date: args.date,
    slug: args.slug,
  })
  const dir = path.dirname(basePath)
  await fs.mkdir(dir, { recursive: true })

  let candidate = basePath
  if (await fileExists(candidate)) {
    let suffix = 2
    const { dir: candidateDir, name, ext } = path.parse(basePath)
    while (suffix <= MAX_COLLISION_SUFFIX) {
      candidate = path.join(candidateDir, `${name}-${suffix}${ext}`)
      if (!(await fileExists(candidate))) break
      suffix++
    }
    if (suffix > MAX_COLLISION_SUFFIX) {
      throw new Error(
        `writeRawDrop: exhausted collision suffixes 2..${MAX_COLLISION_SUFFIX} for ${basePath}`,
      )
    }
  }

  // Phase 04 review WR-08: re-assert the final candidate path stays inside the
  // raw/aios/ tree. Catches collision-suffix arithmetic accidents.
  assertInside(path.join(args.wikiPath, 'raw', 'aios'), candidate)

  await fs.writeFile(candidate, args.body, 'utf-8')
  return { filePath: candidate, excerpt: args.body.slice(0, 240) }
}
