import fs from 'fs/promises'

import { briefPathFor, buildBriefFor } from '@/lib/indexer/build-brief'
import { fetchGmailContext } from '@/lib/skills/gmail-context'
import { fetchCalendarContext } from '@/lib/skills/calendar-context'
import { getProject } from '@/lib/data/clients'

/**
 * Chat bootstrap helpers — coordinate the cached brief, live gmail + calendar
 * fetches, and the seed-prompt assembly that the /load route hands to
 * runChatLoad. Lives outside the existing chat.ts / chat-brief.ts files so:
 *
 *  - The chat.ts subprocess wiring (which owns the HUB-03 claude --resume
 *    contract) stays untouched.
 *  - The static "JS fallback" brief in chat-brief.ts also stays untouched —
 *    it's still used by lib/indexer/build-brief.ts as the fallback.
 *
 * Per ADR 0005: live gmail + calendar are fetched at chat open, NOT embedded
 * in the static brief.
 */

export type BriefSource = 'cache' | 'lazy-build' | 'fallback'

export interface BriefRead {
  brief: string
  builtAt: Date
  source: BriefSource
}

/**
 * Read the cached brief for (client, project). If the cache file is missing,
 * lazily call buildBriefFor (which itself can degrade to a JS fallback) and
 * read whatever it produced. Always returns a brief — chat hydration must
 * have something to feed the subprocess.
 */
export async function readBriefOrBuild(
  clientSlug: string,
  projectSlug: string,
): Promise<BriefRead> {
  const filePath = briefPathFor(clientSlug, projectSlug)
  try {
    const [brief, stat] = await Promise.all([
      fs.readFile(filePath, 'utf-8'),
      fs.stat(filePath),
    ])
    return { brief, builtAt: stat.mtime, source: 'cache' }
  } catch {
    // Cache miss — lazy build (per ADR 0005 first-run policy).
    const built = await buildBriefFor(clientSlug, projectSlug)
    const brief = await fs.readFile(built.filePath, 'utf-8').catch(() => '')
    return {
      brief,
      builtAt: new Date(built.builtAt),
      source: built.status === 'success' ? 'lazy-build' : 'fallback',
    }
  }
}

export interface LiveContext {
  gmail: string
  calendar: string
  fetchedAt: Date
}

/**
 * Fetch live gmail + calendar context in parallel. Each fetcher already
 * degrades to '' internally on subprocess failure; we additionally wrap each
 * promise in .catch(() => '') so a rejection (e.g. data-layer lookup
 * exception) does not collapse the other fetch.
 */
export async function buildLiveContext(
  clientSlug: string,
  projectSlug: string,
): Promise<LiveContext> {
  // Best-effort lookup of project metadata. If clients.yaml is malformed or
  // the project isn't registered, fall back to the slug — the fetchers don't
  // strictly need the contacts list (empty contacts → placeholder prompt).
  let projectName = projectSlug
  let contacts: string[] = []
  try {
    const project = await getProject(clientSlug, projectSlug)
    if (project) {
      projectName = project.name
      // Skip @-domain wildcards which are search patterns, not addresses.
      contacts = (project.contacts ?? []).filter(c => !c.startsWith('@'))
    }
  } catch {
    // ignore — fetchers will use the fallback contact list.
  }

  const [gmail, calendar] = await Promise.all([
    fetchGmailContext({ projectName, contacts }).catch(() => ''),
    fetchCalendarContext({ projectName, contacts }).catch(() => ''),
  ])

  return { gmail, calendar, fetchedAt: new Date() }
}

export interface AssembleSeedPromptArgs {
  brief: string
  gmail: string
  calendar: string
  projectLabel: string
}

/**
 * Compose the seed user-message that runChatLoad sends as the FIRST turn to
 * the spawned claude subprocess. Existing chat.ts wraps this in its own
 * orient-yourself preamble before sending — we keep that contract intact by
 * returning a self-contained context bundle that reads cleanly even if
 * chat.ts's wrapping changed in the future.
 */
export function assembleSeedPrompt(args: AssembleSeedPromptArgs): string {
  const briefBody = args.brief.trim() || '_No brief available._'
  const gmailBody = args.gmail.trim() || 'No recent Gmail threads.'
  const calendarBody = args.calendar.trim() || 'No upcoming events.'
  return [
    `# ${args.projectLabel} — context bundle`,
    '',
    '## Project brief',
    briefBody,
    '',
    '## Recent Gmail threads (last 7d)',
    gmailBody,
    '',
    '## Upcoming calendar events (next 7d)',
    calendarBody,
    '',
    '---',
    '',
    `I'm working on ${args.projectLabel}. Briefly orient yourself using the above and offer to help. Keep your initial response short — I'll ask follow-ups.`,
  ].join('\n')
}
