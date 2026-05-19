import { getClient, getProject } from '@/lib/data/clients'
import { loadMemoryForProject } from '@/lib/data/memory'
import { decisionsMentioning, decisionsInLastNDays } from '@/lib/data/decisions'
import { resolveDocsPaths, loadReferenceFile } from '@/lib/data/references'
import { detectWiki } from '@/lib/data/wiki'

/**
 * Build a markdown brief summarising a project's state from the filesystem-
 * derived data layer. This intentionally does NOT call the /load-project
 * Claude Code skill, because slash commands invoked via `claude --print`
 * create non-resumable sessions (Claude Code design quirk as of 2026-05).
 *
 * The brief is passed as the first user message in a chat session so the
 * resulting session IS resumable for subsequent turns.
 *
 * v2 scope: clients.yaml + memory + references + decisions log + wiki info.
 * Not included: Gmail / Calendar (those require MCP and live in /daily-
 * inbox-triage's domain).
 */
export async function buildProjectBrief(
  clientSlug: string,
  projectSlug: string,
): Promise<string> {
  const client = await getClient(clientSlug)
  if (!client) {
    return `# Unknown client: ${clientSlug}\n\nNo client found in \`clients.yaml\`.`
  }
  const project = await getProject(clientSlug, projectSlug)
  if (!project) {
    return `# Unknown project: ${projectSlug}\n\nNo project found under ${client.name}.`
  }

  const sections: string[] = []

  // Header
  sections.push(`# ${client.name} — ${project.name}`)

  // Status line
  const statusBits = [`**Status:** ${project.status}`]
  if (project.contract) statusBits.push(`**Contract:** ${project.contract}`)
  if (project.mrr_monthly) statusBits.push(`**MRR:** $${project.mrr_monthly.toLocaleString('en-US')}/mo`)
  statusBits.push(`**Bucket:** ${client.bucket}`)
  sections.push(statusBits.join(' · '))

  // Contacts (skip @-domain wildcards which are search patterns, not addresses)
  const realContacts = (project.contacts ?? []).filter(c => !c.startsWith('@'))
  if (realContacts.length > 0) {
    sections.push(`## Contacts\n${realContacts.map(c => `- ${c}`).join('\n')}`)
  }

  // Recent decisions from claude-os/decisions/log.md (last 60 days)
  try {
    const matchingDecisions = await decisionsMentioning({
      clientName: client.name,
      projectName: project.name,
      clientSlug,
      projectSlug,
    })
    const recent = decisionsInLastNDays(matchingDecisions, 60)
    if (recent.length > 0) {
      const lines = recent.slice(0, 8).map(d => `- **[${d.date}]** ${d.title}`)
      sections.push(`## Recent cross-project decisions (last 60d, top 8)\n${lines.join('\n')}`)
    }
  } catch {
    // decisions log may be missing; non-fatal
  }

  // Memory snippets for this project
  const memory = await loadMemoryForProject(clientSlug, projectSlug)
  if (memory.length > 0) {
    const lines = memory.slice(0, 8).map(m => {
      const desc = m.description ? m.description.replace(/\n/g, ' ') : m.name
      return `- ${desc}`
    })
    sections.push(`## Project memory (top ${Math.min(8, memory.length)} entries)\n${lines.join('\n')}`)
  }

  // Reference docs + LLM-wiki info from docs_paths
  const docsPaths = resolveDocsPaths(project.docs_paths)
  const docsLines: string[] = []
  for (const dp of docsPaths) {
    const wiki = await detectWiki(dp)
    if (wiki) {
      docsLines.push(
        `- **LLM-wiki** at \`${wiki.rootPath}\` — ${wiki.decisionsActive} active decisions, ${wiki.decisionsDeferred} deferred, ${wiki.recentLogEntries.length} recent log entries`,
      )
      continue
    }
    const file = await loadReferenceFile(dp)
    if (file) {
      // Take first ~30 lines as an excerpt
      const excerpt = file.body.split('\n').slice(0, 30).join('\n').trim()
      docsLines.push(`- **Reference doc:** \`${dp}\`\n\n${excerpt}\n`)
    }
  }
  if (docsLines.length > 0) {
    sections.push(`## Project sources\n${docsLines.join('\n\n')}`)
  }

  return sections.join('\n\n')
}
