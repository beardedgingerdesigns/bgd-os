import { describe, it, expect } from 'vitest'
import { loadClients, getClient, getProject } from '@/lib/data/clients'

describe('clients data loader', () => {
  it('loads all clients from the fixture YAML', async () => {
    const clients = await loadClients()
    expect(clients.length).toBeGreaterThanOrEqual(4)
    expect(clients.map(c => c.slug)).toContain('inside-out')
    expect(clients.map(c => c.slug)).toContain('kirk-financial')
    expect(clients.map(c => c.slug)).toContain('revolution')
  })

  it('parses bucket values correctly', async () => {
    const clients = await loadClients()
    const insideOut = clients.find(c => c.slug === 'inside-out')!
    expect(insideOut.bucket).toBe('paying')

    const revolution = clients.find(c => c.slug === 'revolution')!
    expect(revolution.bucket).toBe('prospects')
  })

  it('parses nested projects with mrr_monthly as a number', async () => {
    const clients = await loadClients()
    const kirk = clients.find(c => c.slug === 'kirk-financial')!
    const wildRose = kirk.projects.find(p => p.slug === 'wild-rose')!
    expect(wildRose.mrr_monthly).toBe(1000)
    expect(wildRose.status).toBe('active')
  })

  it('getClient returns the named client or undefined', async () => {
    const client = await getClient('inside-out')
    expect(client?.name).toBe('Inside Out Iowa')

    const missing = await getClient('does-not-exist')
    expect(missing).toBeUndefined()
  })

  it('getProject returns the project under the given client', async () => {
    const project = await getProject('inside-out', 'inside-out-website')
    expect(project?.mrr_monthly).toBe(400)

    const missing = await getProject('inside-out', 'does-not-exist')
    expect(missing).toBeUndefined()
  })
})
