import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import yaml from 'js-yaml'

const SEED_YAML = `# Header comment must survive

clients:
  - slug: inside-out
    name: Inside Out Iowa
    bucket: paying
    projects:
      - slug: inside-out-website
        name: Website redesign
        status: active
`

async function loadClientsRoute() {
  vi.resetModules()
  return await import('@/app/api/clients/route')
}

async function loadProjectsRoute() {
  vi.resetModules()
  return await import('@/app/api/clients/[client]/projects/route')
}

async function loadClientDeleteRoute() {
  vi.resetModules()
  return await import('@/app/api/clients/[client]/route')
}

async function loadProjectDeleteRoute() {
  vi.resetModules()
  return await import('@/app/api/clients/[client]/projects/[project]/route')
}

describe('POST /api/clients', () => {
  let tmpRoot: string
  let yamlPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-clients-route-'))
    yamlPath = path.join(tmpRoot, 'clients.yaml')
    await fs.writeFile(yamlPath, SEED_YAML, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  it('creates a new client and returns 201', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Acme Co', bucket: 'prospects' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.client.slug).toBe('acme-co')

    const text = await fs.readFile(yamlPath, 'utf-8')
    expect(text).toContain('# Header comment must survive')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string }> }
    expect(parsed.clients.map(c => c.slug)).toContain('acme-co')
  })

  it('honors an explicit slug', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Acme Co', slug: 'acme', bucket: 'prospects' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.client.slug).toBe('acme')
  })

  it('returns 409 on slug collision', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inside Out Conflicting', slug: 'inside-out', bucket: 'paying' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('returns 400 when name is missing', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket: 'prospects' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid bucket', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Foo', bucket: 'enterprise' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 on malformed JSON', async () => {
    const { POST } = await loadClientsRoute()
    const req = new Request('http://test/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/clients/[client]/projects', () => {
  let tmpRoot: string
  let yamlPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-projects-route-'))
    yamlPath = path.join(tmpRoot, 'clients.yaml')
    await fs.writeFile(yamlPath, SEED_YAML, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  it('appends a project under an existing client', async () => {
    const { POST } = await loadProjectsRoute()
    const req = new Request('http://test/api/clients/inside-out/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Launch',
        status: 'active',
        contract: '$500/mo Bonsai',
        mrr_monthly: 500,
        docs_paths: ['references/new-launch.md'],
        contacts: ['ops@example.com'],
      }),
    })
    const res = await POST(req, { params: Promise.resolve({ client: 'inside-out' }) })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.project.slug).toBe('new-launch')

    const text = await fs.readFile(yamlPath, 'utf-8')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    const inside = parsed.clients.find(c => c.slug === 'inside-out')
    expect(inside?.projects.map(p => p.slug)).toEqual(['inside-out-website', 'new-launch'])
  })

  it('returns 404 for an unknown client', async () => {
    const { POST } = await loadProjectsRoute()
    const req = new Request('http://test/api/clients/ghost/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X', status: 'active' }),
    })
    const res = await POST(req, { params: Promise.resolve({ client: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('returns 409 on intra-client project slug collision', async () => {
    const { POST } = await loadProjectsRoute()
    const req = new Request('http://test/api/clients/inside-out/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Conflicting', slug: 'inside-out-website', status: 'active' }),
    })
    const res = await POST(req, { params: Promise.resolve({ client: 'inside-out' }) })
    expect(res.status).toBe(409)
  })

  it('coerces mrr_monthly from a numeric string', async () => {
    const { POST } = await loadProjectsRoute()
    const req = new Request('http://test/api/clients/inside-out/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Numeric String', status: 'active', mrr_monthly: '750' }),
    })
    const res = await POST(req, { params: Promise.resolve({ client: 'inside-out' }) })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.project.mrr_monthly).toBe(750)
  })

  it('returns 400 when mrr_monthly is not numeric', async () => {
    const { POST } = await loadProjectsRoute()
    const req = new Request('http://test/api/clients/inside-out/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bad', status: 'active', mrr_monthly: 'not a number' }),
    })
    const res = await POST(req, { params: Promise.resolve({ client: 'inside-out' }) })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/clients/[client]', () => {
  let tmpRoot: string
  let yamlPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-client-del-'))
    yamlPath = path.join(tmpRoot, 'clients.yaml')
    await fs.writeFile(yamlPath, SEED_YAML, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  it('removes a client (cascading projects) and returns 200', async () => {
    const { DELETE } = await loadClientDeleteRoute()
    const req = new Request('http://test/api/clients/inside-out', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ client: 'inside-out' }) })
    expect(res.status).toBe(200)
    const text = await fs.readFile(yamlPath, 'utf-8')
    expect(text).toContain('# Header comment must survive')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string }> }
    expect(parsed.clients.map(c => c.slug)).not.toContain('inside-out')
  })

  it('returns 404 for an unknown client', async () => {
    const { DELETE } = await loadClientDeleteRoute()
    const req = new Request('http://test/api/clients/ghost', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ client: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('returns 400 for an invalid slug', async () => {
    const { DELETE } = await loadClientDeleteRoute()
    const req = new Request('http://test/api/clients/Bad%20Slug', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ client: 'Bad Slug' }) })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/clients/[client]/projects/[project]', () => {
  let tmpRoot: string
  let yamlPath: string

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-project-del-'))
    yamlPath = path.join(tmpRoot, 'clients.yaml')
    await fs.writeFile(yamlPath, SEED_YAML, 'utf-8')
    process.env.CLAUDE_OS_ROOT = tmpRoot
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
  })

  it('removes a project and leaves the client + comment intact', async () => {
    const { DELETE } = await loadProjectDeleteRoute()
    const req = new Request('http://test/api/clients/inside-out/projects/inside-out-website', { method: 'DELETE' })
    const res = await DELETE(req, {
      params: Promise.resolve({ client: 'inside-out', project: 'inside-out-website' }),
    })
    expect(res.status).toBe(200)
    const text = await fs.readFile(yamlPath, 'utf-8')
    expect(text).toContain('# Header comment must survive')
    const parsed = yaml.load(text) as { clients: Array<{ slug: string; projects: Array<{ slug: string }> }> }
    const io = parsed.clients.find(c => c.slug === 'inside-out')
    expect(io?.projects.map(p => p.slug)).not.toContain('inside-out-website')
  })

  it('returns 404 when project is missing', async () => {
    const { DELETE } = await loadProjectDeleteRoute()
    const req = new Request('http://test/api/clients/inside-out/projects/ghost', { method: 'DELETE' })
    const res = await DELETE(req, {
      params: Promise.resolve({ client: 'inside-out', project: 'ghost' }),
    })
    expect(res.status).toBe(404)
  })

  it('returns 404 when client is missing', async () => {
    const { DELETE } = await loadProjectDeleteRoute()
    const req = new Request('http://test/api/clients/ghost/projects/x', { method: 'DELETE' })
    const res = await DELETE(req, {
      params: Promise.resolve({ client: 'ghost', project: 'x' }),
    })
    expect(res.status).toBe(404)
  })
})
