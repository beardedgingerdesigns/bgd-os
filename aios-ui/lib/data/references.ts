import fs from 'fs/promises'
import path from 'path'
import { CLAUDE_OS_ROOT } from '@/lib/paths'

export interface ReferenceFile {
  path: string
  body: string
  mtime: Date
}

export function resolveDocsPaths(docsPaths: string[] | undefined): string[] {
  if (!docsPaths || docsPaths.length === 0) return []
  return docsPaths.map(p => (path.isAbsolute(p) ? p : path.join(CLAUDE_OS_ROOT, p)))
}

export async function loadReferenceFile(absPath: string): Promise<ReferenceFile | null> {
  try {
    // Stat first so a directory path (a wiki root or other folder in docs_paths
    // that didn't match detectWiki) returns null instead of crashing the page
    // with EISDIR. Skipping cleanly here matches the ENOENT contract.
    const stat = await fs.stat(absPath)
    if (!stat.isFile()) return null
    const body = await fs.readFile(absPath, 'utf-8')
    return { path: absPath, body, mtime: stat.mtime }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT' || code === 'EISDIR') return null
    throw err
  }
}
