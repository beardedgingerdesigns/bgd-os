import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { CLAUDE_OS_ROOT } from '@/lib/paths'
import type { SlashCommand } from '@/lib/types'

// The chat is a `claude` session in claude-os, so the slash commands it accepts
// are Justin's skills. Scan user-level first, then project-level; dedupe by name
// (first seen wins). Plugin-namespaced skills are intentionally out of scope.
const SKILL_DIRS = [
  path.join(os.homedir(), '.claude/skills'),
  path.join(CLAUDE_OS_ROOT, '.claude/skills'),
]

// Pull `name:` / `description:` from a SKILL.md YAML frontmatter block.
function parseFrontmatter(md: string): { name?: string; description?: string } {
  if (!md.startsWith('---')) return {}
  const end = md.indexOf('\n---', 3)
  const block = end === -1 ? md : md.slice(0, end)
  return {
    name: block.match(/^name:\s*(.+)$/m)?.[1].trim(),
    description: block.match(/^description:\s*(.+)$/m)?.[1].trim(),
  }
}

export async function loadSlashCommands(): Promise<SlashCommand[]> {
  const byName = new Map<string, SlashCommand>()

  for (const dir of SKILL_DIRS) {
    let slugs: string[]
    try {
      slugs = await fs.readdir(dir)
    } catch {
      continue // dir absent — skip
    }
    for (const slug of slugs) {
      let md: string
      try {
        md = await fs.readFile(path.join(dir, slug, 'SKILL.md'), 'utf-8')
      } catch {
        continue // not a skill dir
      }
      const { name, description } = parseFrontmatter(md)
      const cmd = name ?? slug
      if (!byName.has(cmd)) byName.set(cmd, { name: cmd, description: description ?? '' })
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}
