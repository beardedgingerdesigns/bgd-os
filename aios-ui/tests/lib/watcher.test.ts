import { describe, it, expect } from 'vitest'

import { scopeForPath } from '@/lib/watcher'
import type { Client } from '@/lib/types'

const clients: Client[] = [
  {
    slug: 'inside-out',
    name: 'Inside Out Iowa',
    bucket: 'paying',
    projects: [
      {
        slug: 'inside-out-website',
        name: 'Website redesign',
        status: 'active',
        docs_paths: ['references/inside-out-project.md'],
      },
    ],
  },
  {
    slug: 'iowaeverywhere',
    name: 'IowaEverywhere',
    bucket: 'paying',
    projects: [
      {
        slug: 'iowaeverywhere-v2',
        name: 'V2 Planning',
        status: 'active',
        docs_paths: ['/Users/justinlobaito/repos/iowa-everywhere/docs/'],
      },
    ],
  },
]

describe('scopeForPath', () => {
  const root = '/Users/justinlobaito/repos/claude-os'

  it('maps clients.yaml to global scope', () => {
    expect(
      scopeForPath(`${root}/clients.yaml`, { claudeOsRoot: root, clients }),
    ).toEqual({ kind: 'global' })
  })

  it('maps decisions/log.md to global scope', () => {
    expect(
      scopeForPath(`${root}/decisions/log.md`, { claudeOsRoot: root, clients }),
    ).toEqual({ kind: 'global' })
  })

  it('maps a memory file with frontmatter slugs to a project scope', () => {
    expect(
      scopeForPath('/Users/justinlobaito/.claude/projects/x/memory/project_foo.md', {
        claudeOsRoot: root,
        clients,
        memoryProjectFrontmatter: { client: 'inside-out', project: 'inside-out-website' },
      }),
    ).toEqual({
      kind: 'project',
      clientSlug: 'inside-out',
      projectSlug: 'inside-out-website',
    })
  })

  it('maps a reference doc registered to a project to that project scope', () => {
    expect(
      scopeForPath(`${root}/references/inside-out-project.md`, { claudeOsRoot: root, clients }),
    ).toEqual({
      kind: 'project',
      clientSlug: 'inside-out',
      projectSlug: 'inside-out-website',
    })
  })

  it('maps a file inside an external wiki docs_paths to the owning project', () => {
    expect(
      scopeForPath(
        '/Users/justinlobaito/repos/iowa-everywhere/docs/wiki/decisions/active/2026-05-19-foo.md',
        { claudeOsRoot: root, clients },
      ),
    ).toEqual({
      kind: 'project',
      clientSlug: 'iowaeverywhere',
      projectSlug: 'iowaeverywhere-v2',
    })
  })

  it('falls back to global for an unrecognized path', () => {
    expect(
      scopeForPath(`${root}/randomfile.md`, { claudeOsRoot: root, clients }),
    ).toEqual({ kind: 'global' })
  })
})
