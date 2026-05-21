import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import yaml from 'js-yaml'

// We re-import clients-mutations and paths fresh per test so the CLAUDE_OS_ROOT
// env var resolves to the temp dir at module-load time. Without resetModules,
// the first import locks in the production path.

const SEED_YAML = `# Top of file — must survive every mutation.
# Documentation for fields.

clients:
  - slug: inside-out
    name: Inside Out Iowa
    bucket: paying
    projects:
      - slug: inside-out-website
        name: Website redesign
        status: active
        contract: "$400/mo Bonsai"
        mrr_monthly: 400
        contacts:
          - mdennis@insideoutiowa.org
          # TODO: confirm secondary contact
      - slug: another-project
        name: Another project
        status: paused
  - slug: empty-client
    name: Empty Client
    bucket: prospects
    projects: []
`

interface MutationModule {
  addClient: typeof import('@/lib/data/clients-mutations').addClient
  addProject: typeof import('@/lib/data/clients-mutations').addProject
  removeClient: typeof import('@/lib/data/clients-mutations').removeClient
  removeProject: typeof import('@/lib/data/clients-mutations').removeProject
  DuplicateSlugError: typeof import('@/lib/data/clients-mutations').DuplicateSlugError
  ClientNotFoundError: typeof import('@/lib/data/clients-mutations').ClientNotFoundError
  InvalidSlugError: typeof import('@/lib/data/clients-mutations').InvalidSlugError
  MalformedYamlError: typeof import('@/lib/data/clients-mutations').MalformedYamlError
}

async function loadMutations(): Promise<MutationModule> {
  vi.resetModules()
  return (await import('@/lib/data/clients-mutations')) as unknown as MutationModule
}

async function readFile(yamlPath: string): Promise<string> {
  return fs.readFile(yamlPath, 'utf-8')
}

describe('clients-mutations', () => {
  let tmpRoot: string
  let yamlPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-clients-mut-'))
    yamlPath = path.join(tmpRoot, 'clients.yaml')
    await fs.writeFile(yamlPath, SEED_YAML, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  // ---- addClient ----

  it('addClient appends a new entry and preserves the header comment', async () => {
    const { addClient } = await loadMutations()
    const client = await addClient({
      slug: 'acme-co',
      name: 'Acme Co',
      bucket: 'prospects',
      notes: 'New lead.',
    })
    expect(client.slug).toBe('acme-co')
    const text = await readFile(yamlPath)
    expect(text.startsWith('# Top of file — must survive every mutation.')).toBe(true)
    expect(text).toContain('# TODO: confirm secondary contact')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; name: string; bucket: string }> }
    expect(parsed.clients.map(c => c.slug)).toContain('acme-co')
    expect(parsed.clients.find(c => c.slug === 'acme-co')?.bucket).toBe('prospects')
  })

  it('addClient slugifies via the route, but here pass an explicit slug to verify validation', async () => {
    const { addClient, InvalidSlugError } = await loadMutations()
    await expect(addClient({
      slug: 'Bad Slug!',
      name: 'Bad',
      bucket: 'prospects',
    })).rejects.toBeInstanceOf(InvalidSlugError)
  })

  it('addClient throws DuplicateSlugError on collision', async () => {
    const { addClient, DuplicateSlugError } = await loadMutations()
    await expect(addClient({
      slug: 'inside-out',
      name: 'Conflicting',
      bucket: 'paying',
    })).rejects.toBeInstanceOf(DuplicateSlugError)
  })

  it('addClient rejects unknown bucket', async () => {
    const { addClient, InvalidSlugError } = await loadMutations()
    await expect(addClient({
      slug: 'foo',
      name: 'Foo',
      // @ts-expect-error — intentionally invalid
      bucket: 'enterprise',
    })).rejects.toBeInstanceOf(InvalidSlugError)
  })

  // ---- addProject ----

  it('addProject appends to a client with expanded projects', async () => {
    const { addProject } = await loadMutations()
    const project = await addProject('inside-out', {
      slug: 'new-launch',
      name: 'New launch',
      status: 'active',
      contract: '$500/mo Bonsai',
      mrr_monthly: 500,
      contacts: ['ops@insideoutiowa.org'],
    })
    expect(project.slug).toBe('new-launch')
    const text = await readFile(yamlPath)
    expect(text).toContain('# TODO: confirm secondary contact')
    expect(text).toContain('# Top of file — must survive every mutation.')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    const inside = parsed.clients.find(c => c.slug === 'inside-out')
    expect(inside?.projects.map(p => p.slug)).toEqual([
      'inside-out-website',
      'another-project',
      'new-launch',
    ])
  })

  it('addProject expands inline empty array `projects: []`', async () => {
    const { addProject } = await loadMutations()
    await addProject('empty-client', {
      slug: 'first-gig',
      name: 'First gig',
      status: 'active',
    })
    const text = await readFile(yamlPath)
    expect(text).not.toMatch(/empty-client[\s\S]*projects: \[\]/)
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    const ec = parsed.clients.find(c => c.slug === 'empty-client')
    expect(ec?.projects).toEqual([{ slug: 'first-gig', name: 'First gig', status: 'active' }])
  })

  it('addProject + addClient flow — create then immediately add first project', async () => {
    const { addClient, addProject } = await loadMutations()
    await addClient({ slug: 'fresh-co', name: 'Fresh Co', bucket: 'prospects' })
    const project = await addProject('fresh-co', {
      slug: 'kickoff',
      name: 'Kickoff project',
      status: 'active',
    })
    expect(project.slug).toBe('kickoff')
    const text = await readFile(yamlPath)
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    expect(parsed.clients.find(c => c.slug === 'fresh-co')?.projects).toEqual([
      { slug: 'kickoff', name: 'Kickoff project', status: 'active' },
    ])
  })

  it('addProject throws ClientNotFoundError for unknown client', async () => {
    const { addProject, ClientNotFoundError } = await loadMutations()
    await expect(addProject('ghost', {
      slug: 'x',
      name: 'X',
      status: 'active',
    })).rejects.toBeInstanceOf(ClientNotFoundError)
  })

  it('addProject throws DuplicateSlugError when slug collides within a client', async () => {
    const { addProject, DuplicateSlugError } = await loadMutations()
    await expect(addProject('inside-out', {
      slug: 'inside-out-website',
      name: 'Conflicting',
      status: 'active',
    })).rejects.toBeInstanceOf(DuplicateSlugError)
  })

  it('addProject rejects invalid status', async () => {
    const { addProject, InvalidSlugError } = await loadMutations()
    await expect(addProject('inside-out', {
      slug: 'x',
      name: 'X',
      // @ts-expect-error — intentionally invalid
      status: 'launched',
    })).rejects.toBeInstanceOf(InvalidSlugError)
  })

  it('addProject rejects negative mrr', async () => {
    const { addProject, InvalidSlugError } = await loadMutations()
    await expect(addProject('inside-out', {
      slug: 'x',
      name: 'X',
      status: 'active',
      mrr_monthly: -10,
    })).rejects.toBeInstanceOf(InvalidSlugError)
  })

  it('after a successful addClient, loadClients() sees the new entry on next read', async () => {
    const { addClient } = await loadMutations()
    await addClient({ slug: 'reread-test', name: 'Reread', bucket: 'internal' })
    // Re-import clients loader fresh so it picks up the new CLAUDE_OS_ROOT.
    vi.resetModules()
    const { loadClients } = await import('@/lib/data/clients')
    const all = await loadClients()
    expect(all.find(c => c.slug === 'reread-test')?.name).toBe('Reread')
  })

  it('leaves no temp files after a successful write', async () => {
    const { addClient } = await loadMutations()
    await addClient({ slug: 'cleanup', name: 'Cleanup', bucket: 'internal' })
    const entries = await fs.readdir(tmpRoot)
    expect(entries.filter(e => e.endsWith('.tmp'))).toHaveLength(0)
    expect(entries).toContain('clients.yaml')
  })

  // ---- removeClient ----

  it('removeClient drops the client + cascades its projects, preserving comments', async () => {
    const { removeClient } = await loadMutations()
    await removeClient('inside-out')
    const text = await readFile(yamlPath)
    expect(text).toContain('# Top of file — must survive every mutation.')
    expect(text).toContain('empty-client')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string }> }
    expect(parsed.clients.map(c => c.slug)).toEqual(['empty-client'])
  })

  it('removeClient throws ClientNotFoundError for unknown slug', async () => {
    const { removeClient, ClientNotFoundError } = await loadMutations()
    await expect(removeClient('ghost')).rejects.toBeInstanceOf(ClientNotFoundError)
  })

  it('removeClient preserves the empty-client below the removed inside-out', async () => {
    const { removeClient } = await loadMutations()
    await removeClient('inside-out')
    const text = await readFile(yamlPath)
    expect(text).toContain('- slug: empty-client')
    expect(text).not.toContain('- slug: inside-out\n')
  })

  // ---- removeProject ----

  it('removeProject drops the targeted project and leaves siblings + comments', async () => {
    const { removeProject } = await loadMutations()
    await removeProject('inside-out', 'inside-out-website')
    const text = await readFile(yamlPath)
    expect(text).toContain('# Top of file — must survive every mutation.')
    expect(text).toContain('- slug: another-project')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    const io = parsed.clients.find(c => c.slug === 'inside-out')
    expect(io?.projects.map(p => p.slug)).toEqual(['another-project'])
  })

  it('removeProject collapses to projects: [] when the last project is removed', async () => {
    const { removeProject } = await loadMutations()
    await removeProject('inside-out', 'inside-out-website')
    await removeProject('inside-out', 'another-project')
    const text = await readFile(yamlPath)
    expect(text).toMatch(/inside-out[\s\S]*?projects: \[\]/)
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: unknown }> }
    const io = parsed.clients.find(c => c.slug === 'inside-out')
    expect(io?.projects).toEqual([])
  })

  it('removeProject throws ClientNotFoundError for unknown client', async () => {
    const { removeProject, ClientNotFoundError } = await loadMutations()
    await expect(removeProject('ghost', 'x')).rejects.toBeInstanceOf(ClientNotFoundError)
  })

  it('removeProject throws ClientNotFoundError for unknown project under existing client', async () => {
    const { removeProject, ClientNotFoundError } = await loadMutations()
    await expect(removeProject('inside-out', 'never-existed')).rejects.toBeInstanceOf(ClientNotFoundError)
  })

  it('addProject after removeProject works (re-using a slug)', async () => {
    const { removeProject, addProject } = await loadMutations()
    await removeProject('inside-out', 'inside-out-website')
    const project = await addProject('inside-out', {
      slug: 'inside-out-website',
      name: 'Redo',
      status: 'active',
    })
    expect(project.slug).toBe('inside-out-website')
  })
})

describe('slugify', () => {
  it('kebab-cases, lowercases, strips punctuation', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('Inside Out, Iowa!')).toBe('inside-out-iowa')
    expect(slugify('Foo  Bar')).toBe('foo-bar')
    expect(slugify('  leading/trailing  ')).toBe('leading-trailing')
    expect(slugify('Café Münch')).toBe('cafe-munch')
  })
})
