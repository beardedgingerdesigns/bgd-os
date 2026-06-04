// aios-ui/lib/content-classifier.ts
//
// Phase 07 — Plan 01: Layer 1 AIOS output filter.
//
// Heuristic content classifier. Pure function — zero side effects, no async
// I/O, no imports beyond type definitions. Returns a classification decision
// that gates whether content reaches any project wiki's raw/aios/ directory.
//
// Priority order:
//   1. Route context (explicit project scope from UI route params)
//   2. Frontmatter `project:` field (non-empty string)
//   3. Keyword scoring (operational vs. project signals)
//   4. Ambiguous fallback (project-relevant/low — let Layer 2 catch)

export type ContentClass = 'operational' | 'project-relevant'
export type ClassConfidence = 'high' | 'low'

export interface ClassificationResult {
  classification: ContentClass
  confidence: ClassConfidence
  reason: string
  matchedProject?: { clientSlug: string; projectSlug: string }
}

/**
 * Classify content as operational (stays in claude-os) or project-relevant
 * (routes to a project wiki's raw/aios/ staging directory).
 *
 * Designed to be called from every write surface BEFORE writeRawDrop.
 * If classification is "operational", the caller should skip the write.
 */
export function classifyContent(args: {
  frontmatter: Record<string, unknown>
  body: string
  source: 'capture-box' | 'chat-decision' | 'chat-session' | 'triage-dispatch'
  /** Already-resolved client/project from the UI route context. */
  routeContext?: { clientSlug: string; projectSlug: string }
}): ClassificationResult {
  // ---- Rule 1: Route-scoped content ----
  // Content arriving from a project-scoped surface (capture box on a project
  // page, chat drop from a project chat) is project-relevant by definition.
  // The operator already chose the project context.
  if (args.routeContext) {
    return {
      classification: 'project-relevant',
      confidence: 'high',
      reason: 'route-scoped to project',
      matchedProject: args.routeContext,
    }
  }

  // ---- Rule 2: Frontmatter project field ----
  // If frontmatter contains a non-empty `project:` string, trust it.
  const projectField = args.frontmatter.project
  if (typeof projectField === 'string' && projectField.trim().length > 0) {
    return {
      classification: 'project-relevant',
      confidence: 'high',
      reason: `frontmatter project: ${projectField}`,
    }
  }

  // ---- Rule 3: Keyword scoring ----
  const operationalSignals: RegExp[] = [
    /\b(AIOS|claude-os|system prompt|hook|skill definition)\b/i,
    /\b(cron|scheduled routine|waking hours)\b/i,
    /\b(memory\.md|decisions\/log|connections\.md)\b/i,
  ]
  const projectSignals: RegExp[] = [
    /\b(client|deliverable|launch date|deadline|invoice)\b/i,
    /\b(wireframe|mockup|deploy|staging|production)\b/i,
  ]

  const opScore = operationalSignals.filter(r => r.test(args.body)).length
  const projScore = projectSignals.filter(r => r.test(args.body)).length

  if (opScore > projScore + 1) {
    return {
      classification: 'operational',
      confidence: 'high',
      reason: 'operational keywords dominate',
    }
  }

  if (projScore > opScore + 1) {
    return {
      classification: 'project-relevant',
      confidence: 'low',
      reason: 'project keywords (no project match)',
    }
  }

  // ---- Rule 4: Ambiguous fallback ----
  // Default to project-relevant with low confidence. Better to have a
  // misrouted file in raw/aios/ than to silently discard project intelligence.
  // Layer 2 (wiki ingest evaluator) catches redundancy.
  return {
    classification: 'project-relevant',
    confidence: 'low',
    reason: 'ambiguous — needs LLM tiebreaker',
  }
}
