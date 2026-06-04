import { describe, it, expect } from 'vitest'
import {
  classifyContent,
  type ContentClass,
  type ClassConfidence,
  type ClassificationResult,
} from '@/lib/content-classifier'

describe('content-classifier', () => {
  describe('route-scoped content', () => {
    it('returns project-relevant/high when routeContext is provided', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'some random text',
        source: 'capture-box',
        routeContext: { clientSlug: 'terraplex', projectSlug: 'hub' },
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('high')
      expect(result.reason).toContain('route-scoped')
      expect(result.matchedProject).toEqual({
        clientSlug: 'terraplex',
        projectSlug: 'hub',
      })
    })

    it('returns route-scoped classification for chat-decision source', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'AIOS hook skill definition cron',
        source: 'chat-decision',
        routeContext: { clientSlug: 'wild-rose', projectSlug: 'redesign' },
      })
      // routeContext overrides operational keywords
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('high')
      expect(result.reason).toContain('route-scoped')
    })
  })

  describe('frontmatter project field', () => {
    it('returns project-relevant/high when frontmatter contains project field', () => {
      const result = classifyContent({
        frontmatter: { project: 'Wild Rose redesign' },
        body: 'some content about the project',
        source: 'capture-box',
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('high')
      expect(result.reason).toContain('frontmatter project')
    })

    it('falls back to keyword analysis when frontmatter project is empty string', () => {
      const result = classifyContent({
        frontmatter: { project: '' },
        body: 'this text has no strong signals either way',
        source: 'capture-box',
      })
      // Should NOT return project-relevant/high from frontmatter
      // Should return keyword-based fallback (ambiguous in this case)
      expect(result.confidence).toBe('low')
    })
  })

  describe('operational keyword detection', () => {
    it('returns operational/high when operational keywords dominate', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'Updated the AIOS hook for the skill definition. Also adjusted the cron scheduled routine and modified memory.md and decisions/log entries.',
        source: 'triage-dispatch',
      })
      expect(result.classification).toBe('operational')
      expect(result.confidence).toBe('high')
    })

    it('does not classify as operational when opScore equals projScore plus one', () => {
      // Two operational signals, one project signal => opScore (2) === projScore (1) + 1
      // Should NOT be operational (threshold is > not >=)
      const result = classifyContent({
        frontmatter: {},
        body: 'The AIOS hook for the cron job. The client needs it.',
        source: 'triage-dispatch',
      })
      // opScore = 2 (AIOS + cron), projScore = 1 (client)
      // 2 > 1 + 1 is false, so not operational
      expect(result.classification).toBe('project-relevant')
    })
  })

  describe('project keyword detection', () => {
    it('returns project-relevant/low when project keywords dominate', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'The client needs the deliverable by the launch date deadline. We need to deploy to staging and then production.',
        source: 'triage-dispatch',
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('low')
    })
  })

  describe('ambiguous/edge cases', () => {
    it('returns project-relevant/low with ambiguous reason when signals are balanced', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'general text with no keywords',
        source: 'capture-box',
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('low')
      expect(result.reason).toContain('ambiguous')
    })

    it('returns project-relevant/low for empty body with no frontmatter project', () => {
      const result = classifyContent({
        frontmatter: {},
        body: '',
        source: 'chat-session',
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('low')
      expect(result.reason).toContain('ambiguous')
    })

    it('routeContext takes priority over operational keywords in body', () => {
      const result = classifyContent({
        frontmatter: {},
        body: 'AIOS hook skill definition cron scheduled routine memory.md decisions/log',
        source: 'capture-box',
        routeContext: { clientSlug: 'bgd-hq', projectSlug: 'internal' },
      })
      expect(result.classification).toBe('project-relevant')
      expect(result.confidence).toBe('high')
      expect(result.matchedProject).toEqual({
        clientSlug: 'bgd-hq',
        projectSlug: 'internal',
      })
    })
  })
})
