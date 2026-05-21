# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** The UI must render Justin's current operating reality and let him push captures + run rituals from the same page he's looking at, without losing continuity across sessions.
**Current focus:** Phase 4 — AIOS UI v2 Bidirectional Hub (awaiting plan import)

## Current Position

Phase: 4 of 4 (AIOS UI v2 — Bidirectional Hub)
Plan: TBD — to be imported from `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md` via `/gsd-import`
Status: Ready to import plan
Last activity: 2026-05-21 — `/gsd-new-project` ingest completed; 5 LOCKED ADRs + v3 SPEC + v3 plan synthesized into PROJECT/REQUIREMENTS/ROADMAP

Progress: [████████░░] ~75% (Phases 1-3 shipped historically; Phase 4 not started)

## Performance Metrics

**Velocity:**
- Total plans completed: n/a (Phases 1-3 shipped before `.planning/` setup; no per-plan timing recorded)
- Average duration: n/a
- Total execution time: per ADR 0001 estimate, ~5-10 hours of Claude Code time for v0+v1+v3 across the historical phases

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. AIOS UI v0 | — | — | — |
| 2. AIOS UI v1 | — | — | — |
| 3. AIOS UI v3 | 9 tasks (per plan) | — | — |
| 4. AIOS UI v2 | TBD | — | — |

**Recent Trend:**
- Phase 3 (v3) shipped 2026-05-19 per implementation plan + recent commits (`502e751 feat(aios-ui): dashboard todos with subprocess action triggers`, etc.)
- Trend: Stable — v3 landed cleanly; ADRs 0003/0004/0005 written 2026-05-21 to unblock Phase 4

*Updated after each plan completion.*

## Accumulated Context

### Decisions

All decisions are logged in PROJECT.md Key Decisions table — 13 LOCKED decisions sourced from ADRs 0001-0005. Recent decisions affecting current work (Phase 4):

- **ADR 0003** (Phase 4): Bidirectional store model — AIOS UI is the seam between operator inputs and durable storage; two-way pipe; rejected read-only-only views
- **ADR 0004** (Phase 4): Staged ingestion via `raw/aios/` — AIOS writes only to staging; promotion is `llm-wiki`'s job; three kinds (capture, chat-decision, chat-session); files immutable
- **ADR 0005** (Phase 4): Chat hydration via pre-built indexed briefs — supersedes ADR 0001 §6 mechanism; background indexer + chokidar; dynamic data (Gmail, calendar) fetched live at bootstrap

### Pending Todos

[From `.planning/todos/pending/` — ideas captured during sessions]

None yet (fresh `.planning/` initialization).

Pre-v4 follow-ups carried over from ADR 0002:
- BRDO-01: backfill `mrr_monthly:` on Inside Out, ToneQuest, IowaEverywhere, Partners For Sight, future Wild Rose / Thermal Kitchen
- BRDO-02: run `/onboard-client` for the 5 BrandOS dealers; resolve "under terraplex Client vs. own Client" per dealer
- BRDO-03: rename `terraplex-hub` → `terraplex-distributor` once dealer migration is no longer happening inside it

### Blockers/Concerns

- **Phase 4 plan not yet imported.** ROADMAP Phase 4 plan list is `TBD`. Next required action: run `/gsd-import` against `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md` to populate Plans.
- **v3 risk carries forward into v4.** `/capture` skill behavior is not pinned (could refuse, ask for clarification, or write to unexpected location); the v4 chat → `/capture` pipeline inherits this. Mitigation: UI surfaces whatever the skill outputs and the operator re-submits.
- **Subprocess concurrency.** A capture + ritual + chat session at the same time all spawn `claude` subprocesses with the same cwd. v3 SPEC notes "should be fine but unverified"; v4 will amplify exposure (chat is long-running).

## Deferred Items

Items acknowledged and carried forward:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Capture UX | Global / client-level capture surface (CAPX-01, CAPX-02) | Deferred to v3.1+ | v3 SPEC non-goals |
| Capture UX | Cmd+K capture palette (CAPX-03) | Deferred to v3.1+ | v3 SPEC non-goals |
| Capture UX | Preview-then-confirm capture (CAPX-04) | Deferred to v3.1+ | v3 SPEC non-goals |
| Capture UX | Recent captures history surface (CAPX-05) | Deferred to v3.1+ | v3 SPEC non-goals |
| Ritual UX | Refactor `DailyIngestModal` + `RitualModal` into shared base (RITX-01) | Deferred to v3.1+ | v3 SPEC non-goals |
| Ritual UX | Multi-tab ritual locking (RITX-02) | Deferred to v3.1+ | v3 SPEC non-goals |
| Ritual UX | Abort / cancel mid-stream (RITX-03) | Deferred to v3.1+ | v3 SPEC non-goals |
| Ritual UX | Rich markdown rendering for ritual output (RITX-04) | Deferred to v3.1+ | v3 SPEC non-goals |
| Ritual UX | Real-time tile badge update (RITX-05) | Deferred to v3.1+ | v3 SPEC non-goals |
| Admin | `business-plans` tile content (ADMC-01) | Deferred to v3.1+ | v3 SPEC non-goals |
| Admin | `references/research/` browsing surface (ADMC-02) | Deferred | v3 SPEC non-goals |
| BrandOS | Dealer onboarding migration (BRDO-01/02/03) | Deferred | ADR 0002 follow-ups |

## Session Continuity

Last session: 2026-05-21
Stopped at: `/gsd-new-project` produced PROJECT.md + REQUIREMENTS.md + ROADMAP.md + STATE.md from synthesized intel. Phase 4 plan import is the next action.
Resume file: None — next step is `/gsd-import /Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md` to populate Phase 4 plans.
