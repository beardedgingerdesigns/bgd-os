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
    const [body, stat] = await Promise.all([
      fs.readFile(absPath, 'utf-8'),
      fs.stat(absPath),
    ])
    return { path: absPath, body, mtime: stat.mtime }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}
