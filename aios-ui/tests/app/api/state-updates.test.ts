import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import type { StateUpdateProposal, StateUpdateStore } from '@/lib/types'
import { dedupeKeyFor } from '@/lib/cache/state-updates'

// state/inbox-triage.md carrying a STATE_UPDATES_JSON envelope (what triage writes).
function triageEnvelopeMd(proposals: Array<Record<string, unknown>>): string {
  const json = JSON.stringify({ generated_at: '2026-06-19T16:00:00Z', proposals })
  return `---\nlast_run: 2026-06-19T16:00:00Z\n---\n\n# brief\n\n<!-- STATE_UPDATES_JSON_START -->\n\`\`\`json\n${json}\n\`\`\`\n<!-- STATE_UPDATES_JSON_END -->\n`
}

const ENV_PROPOSAL = {
  slug: 'wild-rose',
  field: 'current_status',
  current: '(not yet tracked)',
  proposed: 'Go-live July 13',
  evidence: { source: 'triage', threadId: null, sender: null, date: '2026-06-19' },
  confidence: 'high',
  stateUpdatedAt: '2026-06-09',
}

// STATE_DIR is captured from CLAUDE_OS_ROOT at module load, so the routes must
// be re-imported fresh per test after the env is set (same pattern as the
// pending-todos route test).

const STATE_FILE = `# Project State: Wild Rose Casino

**Updated:** 2026-06-09
**Status:** On track

## Current Status

Launch window mid/late June; banquet to follow.

## Next Steps

- Confirm launch date with Meghan

## Blockers

None.
`

function proposal(over: Partial<StateUpdateProposal> = {}): StateUpdateProposal {
  return {
    id: 'su-1',
    slug: 'wild-rose',
    field: 'current_status',
    current: 'Launch window mid/late June',
    proposed: 'Launch slipped to mid-July',
    evidence: { source: 'triage', threadId: 't1', sender: 'meghan@x.com', date: '2026-06-19' },
    confidence: 'high',
    stateUpdatedAt: '2026-06-09',
    dedupeKey: 'wild-rose:current_status:hash1',
    createdAt: '2026-06-19T13:45:00Z',
    ...over,
  }
}

interface Routes {
  GET: typeof import('@/app/api/state-updates/route').GET
  POST: typeof import('@/app/api/state-updates/[id]/apply/route').POST
  DELETE: typeof import('@/app/api/state-updates/[id]/route').DELETE
}

async function loadRoutes(): Promise<Routes> {
  vi.resetModules()
  const list = await import('@/app/api/state-updates/route')
  const apply = await import('@/app/api/state-updates/[id]/apply/route')
  const dismiss = await import('@/app/api/state-updates/[id]/route')
  return { GET: list.GET, POST: apply.POST, DELETE: dismiss.DELETE }
}

function asParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('state-updates API routes', () => {
  let tmpRoot: string
  let tmpCache: string
  let statePath: string
  let storePath: string

  async function seedStore(store: StateUpdateStore): Promise<void> {
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8')
  }
  async function readStore(): Promise<StateUpdateStore> {
    return JSON.parse(await fs.readFile(storePath, 'utf-8')) as StateUpdateStore
  }

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-state-route-'))
    tmpCache = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-state-cache-'))
    await fs.mkdir(path.join(tmpRoot, 'state'), { recursive: true })
    statePath = path.join(tmpRoot, 'state/wild-rose.md')
    storePath = path.join(tmpCache, 'pending-state-updates.json')
    await fs.writeFile(statePath, STATE_FILE, 'utf-8')
    await seedStore({ proposals: [proposal()], dismissed: [] })
    process.env.CLAUDE_OS_ROOT = tmpRoot
    process.env.AIOS_CACHE_DIR = tmpCache
  })

  afterEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true })
    await fs.rm(tmpCache, { recursive: true, force: true })
    delete process.env.CLAUDE_OS_ROOT
    delete process.env.AIOS_CACHE_DIR
  })

  it('GET returns the store', async () => {
    const { GET } = await loadRoutes()
    const body = (await (await GET()).json()) as StateUpdateStore
    expect(body.proposals).toHaveLength(1)
    expect(body.proposals[0].slug).toBe('wild-rose')
  })

  it('POST apply writes the state file and removes the proposal', async () => {
    const { POST } = await loadRoutes()
    const res = await POST(new Request('http://test/apply', { method: 'POST' }), asParams('su-1'))
    expect(res.status).toBe(200)

    const file = await fs.readFile(statePath, 'utf-8')
    expect(file).toContain('Launch slipped to mid-July (via triage)')
    expect(file).not.toContain('**Updated:** 2026-06-09') // bumped to today
    expect((await readStore()).proposals).toHaveLength(0)
  })

  it('POST apply on a stale proposal returns 409 and changes nothing', async () => {
    await seedStore({ proposals: [proposal({ stateUpdatedAt: '2026-06-01' })], dismissed: [] })
    const { POST } = await loadRoutes()
    const res = await POST(new Request('http://test/apply', { method: 'POST' }), asParams('su-1'))
    expect(res.status).toBe(409)

    const file = await fs.readFile(statePath, 'utf-8')
    expect(file).toBe(STATE_FILE) // untouched
    expect((await readStore()).proposals).toHaveLength(1) // still pending
  })

  it('POST apply honors an edited proposed value', async () => {
    const { POST } = await loadRoutes()
    const req = new Request('http://test/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposed: 'Launch moved to August' }),
    })
    const res = await POST(req, asParams('su-1'))
    expect(res.status).toBe(200)
    const file = await fs.readFile(statePath, 'utf-8')
    expect(file).toContain('Launch moved to August (via triage)')
    expect(file).not.toContain('Launch slipped to mid-July')
  })

  it('POST apply on an unknown id returns 404', async () => {
    const { POST } = await loadRoutes()
    const res = await POST(new Request('http://test/apply', { method: 'POST' }), asParams('ghost'))
    expect(res.status).toBe(404)
  })

  it('DELETE dismiss removes the proposal and records the dedupeKey', async () => {
    const { DELETE } = await loadRoutes()
    const res = await DELETE(new Request('http://test/x', { method: 'DELETE' }), asParams('su-1'))
    expect(res.status).toBe(200)
    const store = await readStore()
    expect(store.proposals).toHaveLength(0)
    expect(store.dismissed).toContain('wild-rose:current_status:hash1')
  })

  describe('GET reconciles the STATE_UPDATES_JSON envelope (U4)', () => {
    const triagePath = () => path.join(tmpRoot, 'state/inbox-triage.md')

    it('surfaces a proposal emitted in the triage envelope', async () => {
      await seedStore({ proposals: [], dismissed: [] })
      await fs.writeFile(triagePath(), triageEnvelopeMd([ENV_PROPOSAL]), 'utf-8')
      const { GET } = await loadRoutes()
      const body = (await (await GET()).json()) as StateUpdateStore
      expect(body.proposals).toHaveLength(1)
      expect(body.proposals[0].proposed).toBe('Go-live July 13')
      expect(body.proposals[0].id).toMatch(/^su-[0-9a-f]{8}$/)
    })

    it('is idempotent across two GETs', async () => {
      await seedStore({ proposals: [], dismissed: [] })
      await fs.writeFile(triagePath(), triageEnvelopeMd([ENV_PROPOSAL]), 'utf-8')
      const { GET } = await loadRoutes()
      await (await GET()).json()
      const body = (await (await GET()).json()) as StateUpdateStore
      expect(body.proposals).toHaveLength(1)
    })

    it('leaves the store unchanged when the triage file has no envelope', async () => {
      await seedStore({ proposals: [proposal()], dismissed: [] })
      await fs.writeFile(triagePath(), '# brief, no envelope here', 'utf-8')
      const { GET } = await loadRoutes()
      const body = (await (await GET()).json()) as StateUpdateStore
      expect(body.proposals).toHaveLength(1)
      expect(body.proposals[0].id).toBe('su-1')
    })

    it('does not resurrect a dismissed proposal', async () => {
      const key = dedupeKeyFor('wild-rose', 'current_status', 'Go-live July 13')
      await seedStore({ proposals: [], dismissed: [key] })
      await fs.writeFile(triagePath(), triageEnvelopeMd([ENV_PROPOSAL]), 'utf-8')
      const { GET } = await loadRoutes()
      const body = (await (await GET()).json()) as StateUpdateStore
      expect(body.proposals).toHaveLength(0)
    })

    it('returns the store without error when no triage file exists', async () => {
      await seedStore({ proposals: [proposal()], dismissed: [] })
      // no inbox-triage.md written
      const { GET } = await loadRoutes()
      const body = (await (await GET()).json()) as StateUpdateStore
      expect(body.proposals).toHaveLength(1)
    })

    it('does not resurrect an applied proposal on the next reconcile-on-read', async () => {
      await seedStore({ proposals: [], dismissed: [] })
      await fs.writeFile(triagePath(), triageEnvelopeMd([ENV_PROPOSAL]), 'utf-8')
      const { GET, POST } = await loadRoutes()

      // First GET reconciles the envelope into the store.
      const first = (await (await GET()).json()) as StateUpdateStore
      expect(first.proposals).toHaveLength(1)
      const { id, dedupeKey } = first.proposals[0]

      // Apply it (state file Updated 2026-06-09 matches the proposal's stateUpdatedAt).
      const res = await POST(new Request('http://test/apply', { method: 'POST' }), asParams(id))
      expect(res.status).toBe(200)

      // The triage file is unchanged (still carries the envelope). The next GET
      // must NOT re-add the applied proposal — markApplied recorded its dedupeKey.
      const second = (await (await GET()).json()) as StateUpdateStore
      expect(second.proposals).toHaveLength(0)
      expect(second.dismissed).toContain(dedupeKey)
    })
  })
})
