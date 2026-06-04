# Phase 7: Wiki Filtering (Two-Layer Intelligence) - Research

**Researched:** 2026-06-04
**Domain:** Claude Code skill authoring, markdown-based content classification, wiki ingestion pipeline
**Confidence:** HIGH

## Summary

Phase 7 adds intelligence to the existing staged ingestion pipeline established by ADR 0004. The pipeline today is a dumb pipe: AIOS writes to `{wiki}/raw/aios/`, and `llm-wiki` promotes to curated structure on operator demand. This phase inserts two filtering layers:

**Layer 1 (AIOS output filter):** Before content reaches `raw/aios/`, classify it as "operational" (stays in claude-os, never touches any wiki) or "project-relevant" (routes to the correct project wiki). This filter sits at the write surfaces: `capture.ts`, `drop-decision`, `drop-session`, and the triage dispatch introduced in Phase 8. Heuristic rules handle the common cases (frontmatter `project:` field, `clients.yaml` contact matching, content keyword patterns). LLM is invoked only when heuristics are ambiguous.

**Layer 2 (Wiki ingest evaluator):** When the `/ingest-aios-drops` skill runs, instead of blindly promoting every pending file, it evaluates each drop against the current wiki state. Three outcomes: **promote** (genuinely new information), **skip** (redundant with existing wiki content), **flag** (contradicts existing knowledge). Flagged files surface to the operator with a side-by-side view. This layer is a skill enhancement (modify the existing `/ingest-aios-drops` SKILL.md), not a new application module.

**Primary recommendation:** Both layers are Claude Code skill definitions (markdown SKILL.md files), not application code. Layer 1 needs a thin TypeScript classification function in `aios-ui/lib/` that the existing write surfaces call. Layer 2 is a skill rewrite. The UI already has the `contested` array in its `WikiIngestSummary` type -- it just needs to render it.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIKI-01 | AIOS output filter classifies content as operational vs. project-relevant before staging to `raw/aios/` | Layer 1 architecture: heuristic classifier at the write surface, intercepts before `writeRawDrop()` call |
| WIKI-02 | Wiki ingest evaluates incoming `raw/aios/` files against current wiki knowledge | Layer 2 architecture: enhanced `/ingest-aios-drops` skill reads wiki state before promoting each file |
| WIKI-03 | Wiki ingest produces three outcomes: promote, skip, flag | Skill summary envelope already has `promoted`, `deferred`, `contested` arrays; `contested` = flag |
| WIKI-04 | Flagged contradictions surface to operator for resolution rather than auto-overwriting | `WikiIngestModal` already renders `contested` count; needs expansion to show side-by-side diff view |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Content classification (operational vs. project) | TypeScript library (`aios-ui/lib/`) | -- | Heuristic logic runs in Node.js at write time; no browser involvement |
| Project routing (which wiki gets the drop) | TypeScript library (`aios-ui/lib/`) | -- | `resolveProjectWikiPath()` already handles this; classifier adds gate before it |
| LLM tiebreaker for ambiguous classification | Claude Code skill | -- | Skill definition; invoked via subprocess only for edge cases |
| Wiki knowledge comparison | Claude Code skill | -- | LLM reads wiki state + incoming file; produces promote/skip/flag verdict |
| Contradiction surfacing | Frontend Server (SSR) | Browser/Client | SSE streams the ingest result; React component renders the flag detail |
| Operator resolution of flags | Browser/Client | API/Backend | UI shows side-by-side; operator action hits an API route to resolve |

## Standard Stack

### Core (already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16 | App Router, API routes, SSE streaming | Already the AIOS UI framework per ADR 0001 [VERIFIED: codebase] |
| Vitest | 4.x | Unit + integration tests | Already configured with 267+ tests [VERIFIED: codebase] |
| `js-yaml` | (installed in aios-ui) | Parse `clients.yaml` for project routing | Already used by state hook + clients reader [VERIFIED: codebase] |
| `gray-matter` | (installed in aios-ui) | Parse frontmatter from raw drops | Already used by memory reader [VERIFIED: codebase] |

### Supporting (no new packages needed)

This phase introduces **zero new dependencies**. All classification logic is pure TypeScript string/regex matching. The LLM tiebreaker uses the existing `claude` CLI subprocess pattern (same as capture, ritual, triage, ingest). The wiki evaluator is a skill definition (markdown), not a library.

## Architecture Patterns

### System Architecture Diagram

```
                          AIOS Session (claude-os)
                                   |
                    +--------------+--------------+
                    |              |              |
              Capture Box    Chat Drop     Triage Dispatch
                    |              |         (Phase 8)
                    v              v              |
         +------------------------------------------+
         |        Layer 1: AIOS Output Filter       |
         |  (aios-ui/lib/content-classifier.ts)     |
         |                                          |
         |  1. Read frontmatter (project:, kind:)   |
         |  2. Match against clients.yaml contacts  |
         |  3. Keyword heuristics                   |
         |  4. LLM tiebreaker (ambiguous only)      |
         +----+----------------+--------------------+
              |                |
         OPERATIONAL      PROJECT-RELEVANT
              |                |
         (stays in         routes to correct
          claude-os,       wiki via clients.yaml
          no raw/aios/)         |
                               v
                     {wiki}/raw/aios/<drop>.md
                               |
                    (operator clicks "Run Ingest")
                               |
                               v
         +------------------------------------------+
         |     Layer 2: Wiki Ingest Evaluator       |
         |  (/ingest-aios-drops skill, enhanced)    |
         |                                          |
         |  For each pending file:                  |
         |  1. Read file content                    |
         |  2. Read relevant wiki pages             |
         |  3. Compare: new? redundant? conflict?   |
         |  4. Emit verdict per file                |
         +----+----------+----------+--------------+
              |          |          |
          PROMOTE      SKIP      FLAG
              |          |          |
         llm-wiki    log reason   surface to
         ingest      + skip       operator
         as today                 w/ diff
```

### Recommended Project Structure

```
aios-ui/
  lib/
    content-classifier.ts     # NEW: Layer 1 heuristic classifier
    content-classifier.test.ts  # (in tests/lib/)
    raw-drops.ts              # EXISTING: writeRawDrop (add classifier gate)
    skills/
      capture.ts              # EXISTING: add classifier call before writeRawDrop
      wiki-ingest.ts          # EXISTING: parse enhanced summary envelope
  components/
    wiki-ingest-modal.tsx     # EXISTING: expand to render flagged contradictions
    wiki-flag-detail.tsx      # NEW: side-by-side contradiction viewer
.claude/skills/
  ingest-aios-drops/
    SKILL.md                  # EXISTING: enhance with evaluation logic
```

### Pattern 1: Heuristic-First Classification

**What:** A pure-function classifier that takes content metadata (frontmatter, body text, source surface) and returns a classification decision with a confidence score.

**When to use:** Every time content is about to be written to `raw/aios/`.

**Example:**

```typescript
// aios-ui/lib/content-classifier.ts

export type ContentClass = 'operational' | 'project-relevant'
export type ClassConfidence = 'high' | 'low'

export interface ClassificationResult {
  classification: ContentClass
  confidence: ClassConfidence
  reason: string
  matchedProject?: { clientSlug: string; projectSlug: string }
}

/**
 * Heuristic classifier. Returns HIGH confidence for clear cases,
 * LOW confidence when LLM tiebreaker should be invoked.
 */
export function classifyContent(args: {
  frontmatter: Record<string, unknown>
  body: string
  source: 'capture-box' | 'chat-decision' | 'chat-session' | 'triage-dispatch'
  /** Already-resolved client/project from the UI route context */
  routeContext?: { clientSlug: string; projectSlug: string }
}): ClassificationResult {
  // Rule 1: If the content arrives from a project-scoped surface
  // (capture box on a project page, chat drop from a project chat),
  // it is project-relevant by definition -- the operator already
  // chose the project context.
  if (args.routeContext) {
    return {
      classification: 'project-relevant',
      confidence: 'high',
      reason: 'route-scoped to project',
      matchedProject: args.routeContext,
    }
  }

  // Rule 2: Frontmatter contains a project: field that maps to clients.yaml
  const projectField = args.frontmatter.project
  if (typeof projectField === 'string' && projectField.trim()) {
    // Attempt to resolve against clients.yaml
    // (implementation detail: fuzzy match on project name)
    return {
      classification: 'project-relevant',
      confidence: 'high',
      reason: `frontmatter project: ${projectField}`,
    }
  }

  // Rule 3: Operational keywords dominate the content
  const operationalSignals = [
    /\b(AIOS|claude-os|system prompt|hook|skill definition)\b/i,
    /\b(cron|scheduled routine|waking hours)\b/i,
    /\b(memory\.md|decisions\/log|connections\.md)\b/i,
  ]
  const projectSignals = [
    /\b(client|deliverable|launch date|deadline|invoice)\b/i,
    /\b(wireframe|mockup|deploy|staging|production)\b/i,
  ]

  const opScore = operationalSignals.filter(r => r.test(args.body)).length
  const projScore = projectSignals.filter(r => r.test(args.body)).length

  if (opScore > projScore + 1) {
    return { classification: 'operational', confidence: 'high', reason: 'operational keywords' }
  }
  if (projScore > opScore + 1) {
    return { classification: 'project-relevant', confidence: 'low', reason: 'project keywords (no project match)' }
  }

  // Ambiguous -- LOW confidence signals need for LLM tiebreaker
  return { classification: 'project-relevant', confidence: 'low', reason: 'ambiguous -- needs LLM tiebreaker' }
}
```

### Pattern 2: Skill-Level Wiki Evaluation (Layer 2)

**What:** The `/ingest-aios-drops` skill gains an evaluation step between reading a file and promoting it.

**When to use:** During each ingest run, per-file.

**Example (SKILL.md enhancement, Step 3 modification):**

```markdown
### Step 3: Evaluate and process each pending file

For each pending file (in mtime ascending order):

1. Read the file contents (frontmatter + body).
2. **Evaluation pass** (NEW):
   a. Identify the topic/entity the file describes.
   b. Read existing wiki pages that cover the same topic
      (search index.md for matching terms, check decisions/active/ for related slugs).
   c. Compare the incoming content against existing wiki knowledge:
      - If the file contains information NOT in any existing wiki page: **PROMOTE**.
      - If the file's content is substantially covered by existing wiki pages
        (same facts, same dates, same decisions): **SKIP** with logged reason.
      - If the file's content CONTRADICTS an existing wiki page
        (different date for same event, reversed decision, conflicting status): **FLAG**.
3. For PROMOTE files: invoke the llm-wiki ingest flow as before.
4. For SKIP files: append skip reason to the structured summary. Do not promote.
5. For FLAG files: include in the `contested` array with the contradiction detail.
   Do NOT promote. The operator resolves flags before promotion.
```

### Pattern 3: Existing Pipeline Integration Points

**What:** The existing codebase already has infrastructure that supports this phase with minimal new code.

**Evidence from codebase investigation:**

1. **`WikiIngestSummary` already has `contested: string[]`** -- the type in `wiki-ingest.ts` includes the `contested` array, and `WikiIngestModal` already renders the contested count. The plumbing exists; it just never gets populated.

2. **`INGEST_SUMMARY_RE`** regex in `wiki-ingest.ts` already parses the `contested` field from the skill's JSON envelope. No new parsing needed.

3. **`writeRawDrop()` in `raw-drops.ts`** is the single chokepoint for all raw drop writes. Adding a classifier gate here (or in the callers) is straightforward.

4. **Route context already carries `clientSlug` + `projectSlug`** in all three write surfaces (`capture.ts`, `drop-decision/route.ts`, `drop-session/route.ts`). The classifier gets its project context for free.

5. **`readPendingIngest()` in `wiki.ts`** already reads and parses pending files with their metadata. The ingest skill can leverage this structure.

### Anti-Patterns to Avoid

- **Over-engineering the classifier:** The existing write surfaces already have project context from the route params. Most captures and chat drops are inherently project-scoped because the operator chose the project in the UI. The classifier's main job is handling edge cases (triage dispatch in Phase 8, content that mentions multiple projects). Don't build a complex NLP pipeline when regex + frontmatter covers 90% of cases.

- **Breaking the immutability contract:** ADR 0004 says files in `raw/aios/` are immutable once written. The evaluator in Layer 2 must NOT modify, rename, or delete files in `raw/aios/`. Skip/flag verdicts are metadata in the ingest summary, not file mutations.

- **Auto-resolving contradictions:** WIKI-04 explicitly requires operator resolution. The system must NOT auto-overwrite existing wiki content when a contradiction is detected. The temptation will be to use a "latest wins" heuristic -- resist it.

- **Blocking writes on LLM latency:** The LLM tiebreaker (for ambiguous Layer 1 classifications) should NOT block the write path synchronously. If classification is ambiguous, default to writing to `raw/aios/` (project-relevant with low confidence) and let Layer 2 catch errors. Better to have a misrouted file in raw/aios/ than a 30-second capture delay.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parsing | Custom regex parser | `gray-matter` (already installed) | Handles YAML edge cases, multi-line values, quoted strings |
| Project resolution from content | New routing logic | `resolveProjectWikiPath()` + `getProject()` (already in `wiki.ts` and `clients.ts`) | Tested, handles edge cases (missing wikis, multiple docs_paths) |
| LLM subprocess invocation | New spawn wrapper | Existing `claude --print --permission-mode bypassPermissions` pattern from `wiki-ingest.ts` | Consistent with all other skill invocations in the project |
| SSE streaming for flag UI | Custom WebSocket | Existing SSE pattern from `WikiIngestModal` + `/api/wiki/ingest/` route | Already handles streaming, error states, structured summary parsing |

## Common Pitfalls

### Pitfall 1: Operational Content Definition Ambiguity

**What goes wrong:** "Operational" vs. "project-relevant" is not always clear-cut. A triage email that mentions a client deadline is both operational (triage metadata) and project-relevant (deadline intelligence). A `/level-up` output might suggest an automation for a specific client.

**Why it happens:** The AIOS serves as both a personal operating system (operational) and a dispatcher to project wikis (project-relevant). Content generated during AIOS operations often contains project intelligence as a side effect.

**How to avoid:** Define "operational" narrowly. Operational = content whose primary consumer is the AIOS itself (triage queue rankings, audit scores, level-up suggestions, system configuration). If content contains ANY actionable project intelligence (dates, decisions, status updates, client feedback), classify as project-relevant even if it was generated by an operational process. When in doubt, route to `raw/aios/` -- Layer 2 catches redundancy.

**Warning signs:** Operator complaining that project intelligence is getting lost. Files in `raw/aios/` that are all triage/audit metadata with no project content. Check both directions.

### Pitfall 2: Contradiction Detection False Positives

**What goes wrong:** The wiki evaluator flags normal knowledge evolution as "contradictions." A project status changing from "active" to "paused" is not a contradiction -- it is an update. A decision being superseded is not a contradiction -- it is a revision.

**Why it happens:** Naive string comparison treats any difference as a conflict. The evaluator needs to distinguish between additive updates (new information), corrections (fixing errors), evolution (status changes), and genuine contradictions (two conflicting claims about the same fact at the same point in time).

**How to avoid:** The evaluation prompt must explicitly instruct the LLM to distinguish these categories. "A status update is not a contradiction. A superseded decision is not a contradiction. A contradiction is when two sources claim different facts about the same event or entity at the same point in time." Include examples in the skill definition.

**Warning signs:** High flag rate. Operator constantly resolving "contradictions" that are just normal updates. Flag fatigue leads to ignoring genuine contradictions.

### Pitfall 3: Phase 8 Dependency Surface

**What goes wrong:** Phase 8 (Scheduled Triage Automation) introduces triage dispatch -- writing project-relevant email intelligence to project wikis. This is a new write surface that Layer 1 must handle. If Phase 7 is designed without considering this, Phase 8 will need to retrofit the classifier.

**Why it happens:** Phase 7's existing write surfaces (capture box, chat drop, chat session) all carry explicit project context from the UI route. Triage dispatch is different: it starts from an email thread, matches against `clients.yaml` contacts, and needs the classifier to route to the correct wiki. This is the first write surface where project context is inferred rather than explicit.

**How to avoid:** Design the classifier interface to accept both explicit project context (`routeContext`) and inferred context (contact email matching). Test the classifier with email-style inputs that match `clients.yaml` contact patterns. The classifier's `routeContext` parameter should be optional, and the fallback path (heuristic matching) should work for Phase 8's use case.

**Warning signs:** The classifier only works when `routeContext` is provided. No test cases for email-originated content.

### Pitfall 4: Stale Wiki State During Batch Ingest

**What goes wrong:** The evaluator reads wiki state at the start of the ingest run. If it promotes file A (which adds new info to the wiki), then evaluates file B against the pre-promotion state, it may incorrectly flag B as "new" when A already covered the same topic.

**Why it happens:** The `/ingest-aios-drops` skill processes files sequentially. If promotion happens via llm-wiki (which touches multiple wiki pages), the state changes between files.

**How to avoid:** The skill already processes files in mtime ascending order (oldest first). After each promotion, the evaluator should re-read any wiki pages that were modified. Alternatively, accept this as a known limitation and document it: "evaluation is approximate during batch ingest; consecutive related drops may both promote."

**Warning signs:** Duplicate content in wiki after batch ingest of related captures.

## Code Examples

### Example 1: Classifier Integration in capture.ts

```typescript
// In aios-ui/lib/skills/capture.ts, runCapture function
// BEFORE the writeRawDrop call, add classification gate:

import { classifyContent } from '@/lib/content-classifier'
import matter from 'gray-matter'

// ... inside runCapture, after wikiPath resolution:
if (wikiPath) {
  const parsed = matter(body)
  const classification = classifyContent({
    frontmatter: parsed.data,
    body: parsed.content,
    source: 'capture-box',
    routeContext: { clientSlug: opts.clientSlug, projectSlug: opts.projectSlug },
  })

  if (classification.classification === 'operational') {
    // Do NOT write to raw/aios/. Log the classification and return.
    console.log('[capture] classified as operational; not staging to wiki', classification.reason)
    return {
      status: 'success',
      output: 'Classified as operational content (not staged to wiki)',
      exitCode: 0,
      durationMs: 0,
    }
  }

  // Proceed with writeRawDrop as before...
}
```

### Example 2: Enhanced Ingest Skill Summary Envelope

```json
{
  "promoted": ["capture-2026-06-04-thermal-kitchen-launch-date.md"],
  "deferred": [],
  "contested": [
    {
      "file": "chat-decision-2026-06-04-launch-shifted-to-july.md",
      "contradiction": {
        "incoming_claim": "Launch date moved to July 15",
        "existing_claim": "Launch date is June 16 (per wiki/pages/timeline.md)",
        "existing_page": "wiki/pages/timeline.md",
        "severity": "high"
      }
    }
  ],
  "skipped": [
    {
      "file": "capture-2026-06-04-status-check.md",
      "reason": "Content fully covered by existing wiki/overview.md (same status, same next steps)"
    }
  ]
}
```

Note: This extends the current `contested: string[]` to `contested: object[]` for richer flag data. The `WikiIngestSummary` type in `wiki-ingest.ts` needs a corresponding update. The `skipped` field is new (currently mapped to `deferred` in the skill but semantically distinct).

### Example 3: Flag Resolution UI Pattern

```typescript
// Rendering a flagged contradiction in WikiIngestModal
// The modal already renders promoted/deferred/contested counts.
// Expand the contested section to show the detail.

{status === 'success' && summary?.contested.length > 0 && (
  <div className="space-y-3">
    <div className="text-sm font-medium text-amber-400">
      {summary.contested.length} file(s) flagged for review
    </div>
    {summary.contested.map((flag, i) => (
      <div key={i} className="rounded border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="text-sm font-mono text-foreground/80">{flag.file}</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Incoming</div>
            <div className="text-foreground/90">{flag.contradiction.incoming_claim}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Existing ({flag.contradiction.existing_page})</div>
            <div className="text-foreground/90">{flag.contradiction.existing_claim}</div>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline">Keep existing</Button>
          <Button size="sm" variant="outline">Accept incoming</Button>
          <Button size="sm" variant="outline">Review manually</Button>
        </div>
      </div>
    ))}
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AIOS writes directly to curated wiki | Staged ingestion via `raw/aios/` | ADR 0004, 2026-05-21 | All writes go through staging inbox |
| No classification on writes | (This phase) Heuristic + LLM classifier | Phase 7 | Operational content filtered before staging |
| Blind promotion of all raw drops | (This phase) Evaluate against wiki state | Phase 7 | Skip redundant, flag contradictions |
| `contested` array always empty | (This phase) Populated by evaluator | Phase 7 | Operator sees contradictions before promotion |

**Key insight:** The infrastructure for this phase largely exists already. The `WikiIngestSummary` type has `contested`. The modal renders it. The skill has the envelope format. The missing piece is the intelligence -- the actual classification logic and evaluation logic that populates these fields.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Capture box, chat-drop, and chat-session are the only current write surfaces to `raw/aios/` | Architecture Patterns | If there are other write surfaces, they need classifier integration too |
| A2 | The `contested` array in `WikiIngestSummary` is currently always empty (never populated) | Code Examples | If it is already populated by some path, the enhancement may conflict |
| A3 | `gray-matter` is already installed in aios-ui dependencies | Standard Stack | If not, it needs to be added (but it is referenced in Phase 4 plan 06 decisions) |
| A4 | The LLM tiebreaker can use the same `claude --print --bare --model haiku` pattern as the state hook | Architecture Patterns | If haiku is insufficient for classification, may need a larger model |
| A5 | Phase 8 triage dispatch will be the next write surface added after this phase | Common Pitfalls | If other write surfaces appear first, they also need classifier integration |

## Open Questions

1. **What constitutes "operational" content in practice?**
   - What we know: The AIOS generates several kinds of content -- triage queue rankings, audit reports, level-up suggestions, system configuration, skill definitions. These feel operational.
   - What's unclear: Where is the exact line? A triage run that surfaces "Wild Rose launch moved to July" contains project intelligence embedded in operational output.
   - Recommendation: Start with a narrow operational definition (only AIOS system metadata). Let Layer 2 handle the redundancy of over-routing to wikis. Expand the operational category based on operator feedback.

2. **Should the `skipped` category be separate from `deferred` in the skill envelope?**
   - What we know: Currently the skill uses `deferred` for "could not process" and `contested` for "conflicts." A skip-because-redundant is semantically different from both.
   - What's unclear: Whether the UI should distinguish "deferred due to error" from "skipped due to redundancy."
   - Recommendation: Add `skipped` as a distinct field. Deferred = error/retry later. Skipped = intentionally not promoted. This is cleaner for the operator.

3. **Flag resolution flow: inline in modal or separate view?**
   - What we know: The `WikiIngestModal` is a streaming overlay that auto-starts on open. Flags need operator attention after the ingest completes.
   - What's unclear: Whether the modal should stay open with resolution controls, or whether flags should persist somewhere (a file? a new UI surface?) for later resolution.
   - Recommendation: Inline in the modal for now. The modal already stays open after completion. Add resolution buttons. If the operator closes without resolving, the flagged files remain in `raw/aios/` (they were never promoted) and will appear again on the next ingest run. No persistence layer needed beyond the files themselves.

4. **How should the classifier handle multi-project content?**
   - What we know: A chat session might discuss multiple projects. A triage dispatch might mention several clients in one email thread.
   - What's unclear: Should the content be split and routed to multiple wikis, or routed to the "primary" project?
   - Recommendation: Route to the primary project (the one in the route context, or the one with the strongest contact/keyword match). Do not split content. If the operator wants it in multiple wikis, they capture it twice. Splitting introduces complexity with no clear benefit at this scale.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `aios-ui/vitest.config.ts` |
| Quick run command | `cd aios-ui && npx vitest run --reporter=verbose` |
| Full suite command | `cd aios-ui && npm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIKI-01 | Content classified as operational does not reach `raw/aios/` | unit | `cd aios-ui && npx vitest run tests/lib/content-classifier.test.ts -x` | Wave 0 |
| WIKI-01 | Content classified as project-relevant routes to correct wiki | unit | `cd aios-ui && npx vitest run tests/lib/content-classifier.test.ts -x` | Wave 0 |
| WIKI-01 | LLM tiebreaker invoked only for low-confidence classifications | unit | `cd aios-ui && npx vitest run tests/lib/content-classifier.test.ts -x` | Wave 0 |
| WIKI-02 | Ingest evaluates incoming file against wiki state | unit (skill contract) | `cd aios-ui && npx vitest run tests/lib/skills/wiki-ingest.test.ts -x` | Existing (extend) |
| WIKI-03 | Promote outcome writes to wiki via llm-wiki | integration | `cd aios-ui && npx vitest run tests/lib/skills/wiki-ingest.test.ts -x` | Existing (extend) |
| WIKI-03 | Skip outcome logs reason, does not promote | unit | `cd aios-ui && npx vitest run tests/lib/skills/wiki-ingest.test.ts -x` | Existing (extend) |
| WIKI-03 | Flag outcome populates contested array | unit | `cd aios-ui && npx vitest run tests/lib/skills/wiki-ingest.test.ts -x` | Existing (extend) |
| WIKI-04 | Flagged contradiction renders in WikiIngestModal with side-by-side | component | `cd aios-ui && npx vitest run tests/components/wiki-ingest-modal.test.tsx -x` | Wave 0 |

### Sampling Rate

- **Per task commit:** `cd aios-ui && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd aios-ui && npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/lib/content-classifier.test.ts` -- covers WIKI-01
- [ ] `tests/components/wiki-ingest-modal.test.tsx` -- covers WIKI-04 (new component tests)
- [ ] Extend `tests/lib/skills/wiki-ingest.test.ts` -- covers WIKI-02, WIKI-03

## Project Constraints (from CLAUDE.md)

The following directives from CLAUDE.md apply to this phase:

1. **Staged ingestion is law:** AIOS writes ONLY to `{wiki}/raw/aios/`. Never to curated wiki paths. Per ADR 0004, locked.
2. **`raw/aios/` files are immutable:** Once written, never modified. Layer 2 evaluation must NOT modify files.
3. **Filesystem is source of truth:** No database, no SQLite, no persistent cache. Per ADR 0001 S4.
4. **UI shells out to `claude` CLI for skill invocation:** Per ADR 0001 S2. The ingest evaluator runs as a skill subprocess.
5. **Single operator, local-only:** No auth, no multi-user. Per ADR 0001 S1.
6. **`clients.yaml` is the canonical registry:** Project routing uses `clients.yaml` `contacts:` and `docs_paths:`.
7. **Voice rules apply to any operator-facing content:** But this phase is infrastructure, not external content.
8. **Don't let `references/` become the wiki:** This phase reinforces the graduated knowledge pattern by routing content to the correct project wiki.

## Sources

### Primary (HIGH confidence)
- ADR 0004 (`docs/adr/0004-staged-ingestion-via-raw-aios.md`) -- foundational architecture for staged ingestion
- `/ingest-aios-drops` SKILL.md (`.claude/skills/ingest-aios-drops/SKILL.md`) -- current ingest workflow
- `aios-ui/lib/raw-drops.ts` -- writeRawDrop implementation
- `aios-ui/lib/data/wiki.ts` -- readPendingIngest, resolveProjectWikiPath
- `aios-ui/lib/skills/wiki-ingest.ts` -- WikiIngestSummary type, INGEST_SUMMARY_RE
- `aios-ui/lib/skills/capture.ts` -- capture write surface
- `aios-ui/lib/skills/chat-writeback.ts` -- chat drop markdown builders
- `aios-ui/app/api/chat/[client]/[project]/drop-decision/route.ts` -- chat decision write surface
- `aios-ui/app/api/chat/[client]/[project]/drop-session/route.ts` -- chat session write surface
- `aios-ui/components/wiki-ingest-modal.tsx` -- existing UI for ingest results
- `clients.yaml` -- project registry with contacts and docs_paths
- Wild Rose wiki `raw/aios/` samples -- real-world drop format verification

### Secondary (MEDIUM confidence)
- llm-wiki SKILL.md (`~/.claude/skills/llm-wiki/SKILL.md`) -- wiki structure conventions
- daily-inbox-triage SKILL.md -- triage pattern for Phase 8 dependency understanding

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing infrastructure
- Architecture: HIGH -- both layers map cleanly to existing write surfaces and ingest flow
- Pitfalls: HIGH -- derived from direct codebase investigation and real raw drop samples

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (stable -- infrastructure phase with no external dependency drift)
