# Synthesis — entry point for downstream consumers

**Mode:** new (no prior `.planning/` context)
**Generated:** 2026-05-21 by `gsd-doc-synthesizer`
**Source corpus:** 7 classified documents under `.planning/intel/classifications/`

---

## Doc counts by type

| Type | Count | Notes |
|---|---|---|
| ADR | 5 | All LOCKED (`Status: Accepted`, `precedence: 0`) |
| SPEC | 1 | AIOS UI v3 design spec |
| PRD | 0 | None in ingest set |
| DOC | 1 | AIOS UI v3 implementation plan |
| UNKNOWN | 0 | All classifications `high` confidence with manifest override |
| **Total** | **7** | |

## Decisions locked

13 distinct decisions extracted across 5 LOCKED ADRs:

- ADR 0001 (`docs/adr/0001-aios-ui-architecture.md`) → 7 decisions: local-only deploy, additive viewer, CLI subprocess chat, in-memory index + chokidar, drill-down nav, project chat auto-load on first expand, daily-ingest modal
- ADR 0002 (`docs/adr/0002-mrr-data-model.md`) → 3 decisions: structured `mrr_monthly` field, paying+active scope filter, dealers-as-Projects
- ADR 0003 (`docs/adr/0003-bidirectional-store-model.md`) → 1 decision: bidirectional store model
- ADR 0004 (`docs/adr/0004-staged-ingestion-via-raw-aios.md`) → 1 decision: staged ingestion via `raw/aios/` (writes-only-to-staging)
- ADR 0005 (`docs/adr/0005-chat-hydration-via-indexed-briefs.md`) → 1 decision: pre-built indexed briefs (supersedes ADR 0001 §6 mechanism)

Full detail: `.planning/intel/decisions.md`

## Requirements

0 PRDs in this ingest → no formal requirements extracted. `.planning/intel/requirements.md` is intentionally empty.

Operator-facing features described in the v3 SPEC (CaptureBox, Admin ritual launcher) are represented as technical constraints in `constraints.md` and operator-intent context in `context.md`, per the SPEC + DOC classification.

## Constraints

6 constraints extracted from 1 SPEC (`docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md`):

- CON-v3-capture-pipeline (api-contract + protocol) — corrected to align with locked ADR 0004 write-target
- CON-v3-admin-ritual-launcher (api-contract + protocol)
- CON-v3-types (schema)
- CON-v3-cache-layout (schema)
- CON-v3-error-handling (nfr)
- CON-v3-testing (nfr)

Full detail: `.planning/intel/constraints.md`

## Context topics

8 context topics from ADR Context/Consequences sections + the v3 DOC plan:

- AIOS UI build phasing (4-slice plan from ADR 0001)
- Why v3 exists (operator pain motivating the SPEC)
- v3 non-goals + deferred items
- v3 implementation milestones (9-task TDD plan)
- v3 risks (operator self-assessment)
- Bidirectional store — operator complaint motivating ADR 0003
- Staged ingestion — pivot rationale (ADR 0004)
- Chat hydration — operator pain motivating ADR 0005
- BrandOS dealer onboarding open questions (ADR 0002 follow-ups)
- Cross-references graph

Full detail: `.planning/intel/context.md`

## Conflicts

**0 blockers, 0 competing-variants, 3 auto-resolved (INFO).**

All five LOCKED ADRs are coherent. The two newer LOCKED ADRs (0004, 0005) are explicit corollary/refinement of older locked ADRs (0003, 0001 respectively) — supersession by newer LOCKED ADR is not LOCKED-vs-LOCKED contradiction.

Auto-resolved items:

1. **ADR 0004 > v3 SPEC on capture write-target.** v3 SPEC implied capture routes to "memory, wiki, decisions log" (curated paths). ADR 0004 (LOCKED, newer) restricts AIOS writes to `raw/aios/` staging only. ADR wins; SPEC plumbing remains valid with corrected target.
2. **ADR 0005 refines ADR 0001 §6 mechanism (not contradiction).** ADR 0001 specified auto-load on first chat expand; the wiring "never landed" (ADR 0005 Context). ADR 0005 moves brief build to background indexer + cache. Same `/load-project` subprocess produces the content. Supersession, not contradiction.
3. **ADR 0001 §4 "no persistent cache" vs v3 ritual cache + ADR 0005 brief cache.** Different layers — ADR 0001's prohibition applies to the filesystem-derived in-memory index. `.aios-cache/` sidecar for session IDs / skill outputs was already in ADR 0001 §3. No contradiction.

Full report: `.planning/INGEST-CONFLICTS.md`

## Cycle detection

Cross-ref graph: ADRs 0001↔0002 form a 2-cycle (mutual sibling refs) but no contradictory claims. Other refs are acyclic chains (0003 → 0001, 0004 → 0003, 0005 → 0001 + 0003). v3 spec/plan refer to file paths, not other docs in the ingest set. No synthesis loops; max traversal depth well under 50.

## Pointers

- Decisions intel: `/Users/justinlobaito/repos/claude-os/.planning/intel/decisions.md`
- Requirements intel: `/Users/justinlobaito/repos/claude-os/.planning/intel/requirements.md` (empty)
- Constraints intel: `/Users/justinlobaito/repos/claude-os/.planning/intel/constraints.md`
- Context intel: `/Users/justinlobaito/repos/claude-os/.planning/intel/context.md`
- Conflicts report: `/Users/justinlobaito/repos/claude-os/.planning/INGEST-CONFLICTS.md`
- Per-doc classifications: `/Users/justinlobaito/repos/claude-os/.planning/intel/classifications/*.json`
