import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { WikiFlagDetail } from '@/components/wiki-flag-detail'
import type { ContestedEntry } from '@/lib/skills/wiki-ingest'

// Sample contested entry for testing
const sampleEntry: ContestedEntry = {
  file: 'capture-2026-06-01-launch-date.md',
  contradiction: {
    incoming_claim: 'Launch date moved to July 15',
    existing_claim: 'Launch date is June 16',
    existing_page: 'wiki/pages/timeline.md',
    severity: 'high',
  },
}

const mediumEntry: ContestedEntry = {
  file: 'capture-2026-06-02-pricing.md',
  contradiction: {
    incoming_claim: 'Tier 1 pricing is $500/mo',
    existing_claim: 'Tier 1 pricing is $750/mo',
    existing_page: 'wiki/pages/pricing.md',
    severity: 'medium',
  },
}

const noop = () => {}

describe('WikiFlagDetail', () => {
  it('renders incoming and existing claims side by side', () => {
    const html = renderToStaticMarkup(
      <WikiFlagDetail
        entry={sampleEntry}
        clientSlug="test-client"
        projectSlug="test-project"
        onResolved={noop}
      />,
    )
    expect(html).toContain('Launch date moved to July 15')
    expect(html).toContain('Launch date is June 16')
    expect(html).toContain('wiki/pages/timeline.md')
  })

  it('renders severity badge text', () => {
    const html = renderToStaticMarkup(
      <WikiFlagDetail
        entry={sampleEntry}
        clientSlug="test-client"
        projectSlug="test-project"
        onResolved={noop}
      />,
    )
    expect(html).toContain('high')
    // Verify the destructive styling is applied for high severity
    expect(html).toContain('bg-destructive')
  })

  it('renders three action buttons', () => {
    const html = renderToStaticMarkup(
      <WikiFlagDetail
        entry={sampleEntry}
        clientSlug="test-client"
        projectSlug="test-project"
        onResolved={noop}
      />,
    )
    expect(html).toContain('Keep existing')
    expect(html).toContain('Accept incoming')
    expect(html).toContain('Review manually')
  })

  it('renders the filename in monospace', () => {
    const html = renderToStaticMarkup(
      <WikiFlagDetail
        entry={sampleEntry}
        clientSlug="test-client"
        projectSlug="test-project"
        onResolved={noop}
      />,
    )
    expect(html).toContain('capture-2026-06-01-launch-date.md')
    expect(html).toContain('font-mono')
  })

  it('renders medium severity with amber styling', () => {
    const html = renderToStaticMarkup(
      <WikiFlagDetail
        entry={mediumEntry}
        clientSlug="test-client"
        projectSlug="test-project"
        onResolved={noop}
      />,
    )
    expect(html).toContain('medium')
    expect(html).toContain('text-amber-400')
  })
})
