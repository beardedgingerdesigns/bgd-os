import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { MEMORY_ROOT } from '@/lib/paths'
import type { MemoryFile } from '@/lib/types'

async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
      .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'MEMORY.md')
      .map(e => path.join(dir, e.name))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

async function readMemoryFile(filePath: string): Promise<MemoryFile> {
  const raw = await fs.readFile(filePath, 'utf-8')
  const stat = await fs.stat(filePath)
  const parsed = matter(raw)
  const data = parsed.data ?? {}
  // Frontmatter may store client/project at top level OR under metadata:
  const client = data.client ?? data.metadata?.client
  const project = data.project ?? data.metadata?.project
  return {
    path: filePath,
    name: data.name ?? path.basename(filePath, '.md'),
    description: data.description ?? '',
    client,
    project,
    body: parsed.content,
    mtime: stat.mtime,
  }
}

export async function loadMemoryForProject(
  clientSlug: string,
  projectSlug: string
): Promise<MemoryFile[]> {
  const files = await listMarkdownFiles(MEMORY_ROOT)
  const parsed = await Promise.all(files.map(readMemoryFile))
  return parsed.filter(m => m.client === clientSlug && m.project === projectSlug)
}

export async function loadAllMemory(): Promise<MemoryFile[]> {
  const files = await listMarkdownFiles(MEMORY_ROOT)
  return Promise.all(files.map(readMemoryFile))
}
