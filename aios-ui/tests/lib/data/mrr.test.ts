import { describe, it, expect } from 'vitest'
import { computeTotalMRR, computeClientMRR } from '@/lib/data/mrr'
import { loadClients } from '@/lib/data/clients'

describe('MRR computation', () => {
  it('sums mrr_monthly across paying-bucket active projects only', async () => {
    const clients = await loadClients()
    const total = computeTotalMRR(clients)
    // Inside Out 400 + Wild Rose 1000 = 1400 from paying buckets, active only.
    // Paused project (500) and Revolution (prospects) excluded.
    // Project-with-wiki adds 200. Total = 1600.
    expect(total).toBe(1600)
  })

  it('excludes prospects bucket', async () => {
    const clients = await loadClients()
    const revolution = clients.find(c => c.slug === 'revolution')!
    expect(computeClientMRR(revolution)).toBe(0)
  })

  it('excludes paused projects even in paying clients', async () => {
    const clients = await loadClients()
    const kirk = clients.find(c => c.slug === 'kirk-financial')!
    // Wild Rose (1000, active) counts; paused-project (500) does not.
    expect(computeClientMRR(kirk)).toBe(1000)
  })

  it('returns 0 for a client with no mrr_monthly anywhere', async () => {
    const clientWithNoMRR = {
      slug: 'x',
      name: 'X',
      bucket: 'paying' as const,
      projects: [
        { slug: 'a', name: 'A', status: 'active' as const },
      ],
    }
    expect(computeClientMRR(clientWithNoMRR)).toBe(0)
  })
})
