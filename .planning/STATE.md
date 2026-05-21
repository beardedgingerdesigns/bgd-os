# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** The UI must render Justin's current operating reality and let him push captures + run rituals from the same page he's looking at, without losing continuity across sessions.
**Current focus:** Phase 4 — AIOS UI v2 Bidirectional Hub (Wave 1 — data layer)

## Current Position

Phase: 4 of 4 (AIOS UI v2 — Bidirectional Hub)
Plan: 04-05 complete (wiki-aware capture + receipt emission — resolveProjectWikiPath helper + runCapture wiki branch + HUB-06 multi-regex extractor with receipt-suppression; HUB-05 capture branch + HUB-06 capture branch satisfied); next plan TBD by orchestrator
Status: 5/9 plans complete in Phase 4 (Wave 1 partially landed: 04-02 done; 04-01 commits exist on branch but no SUMMARY yet; Wave 2: 04-03 done, 04-04 done, 04-05 done, 04-06 done)
Last activity: 2026-05-21 — Completed Plan 04-05: wiki-aware capture + receipts + 8 new tests (230/230 repo-wide pass, build clean)

Progress: [█████████░] ~90% (Phases 1-3 shipped historically; Phase 4: 5/9 plans done)

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
| 4. AIOS UI v2 | 04-02: 2 tasks, ~25 min, 4 commits, 20 tests · 04-03: 3 tasks, ~12 min, 4 commits, 7 tests · 04-04: 3 tasks, ~8 min, 4 commits, 16 tests · 04-05: 2 tasks, ~8 min, 3 commits, 8 tests · 04-06: 3 tasks, ~24 min, 5 commits, 16 tests | ~15 min | ~15 min |

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
- **Plan 04-02** (2026-05-21): `lastIngestAt` uses end-of-day UTC (`23:59:59Z`) so same-day captures dropped after an ingest header are NOT falsely flagged pending; bucket cap of 20 enforced inside the reader, not the caller; `decisions/implemented/` and `decisions/superseded/` deliberately excluded from hub display.
- **Plan 04-03** (2026-05-21): Native `<details>`/`<summary>` chosen over `@radix-ui/react-collapsible` — dep isn't installed and details handles open-by-default, accessibility, and no-JS toggle for free. WikiDisplay paragraph clamp uses an inline `-webkit-line-clamp` style instead of a Tailwind class (Tailwind 4 here doesn't ship a stable line-clamp utility). Component tests use `react-dom/server.renderToStaticMarkup` rather than RTL because vitest is configured `environment: 'node'`.
- **Plan 04-06** (2026-05-21): Memory frontmatter parsed via `gray-matter` not regex — matches `lib/data/memory.ts` and handles both top-level (`client`/`project`) and metadata-nested (`metadata.client`/`metadata.project`) shapes; the regex sketched in the plan would have missed every existing memory file. `buildBriefFor` always WRITES the brief (subprocess on success, JS fallback on failure) so chat hydration in 04-07 always has something to read. Watcher uses dependency-injected builder (`opts.buildBriefFor`) instead of `vi.mock` — keeps tests in plain function-call land. `__test_dispatchChange` returns a Promise so tests can await async frontmatter reads BEFORE advancing fake timers (libuv I/O is not gated by `vi.advanceTimersByTimeAsync`). Untracked changes inside `references/` rebuild ALL projects (conservative — references are routinely cross-cutting).
- **Plan 04-04** (2026-05-21): Atomic temp+rename used for `triage-overrides.json` (sessions.ts skipped this; overrides need it because a half-written file would surface as a visible UI bug). TriageOutput filter operates on parsed markdown blocks (not individual lines) so the Gmail-link line keeps its surrounding context. No undo control on TriageRowActions — operator re-runs `/daily-inbox-triage` to refresh; adding undo would need a DELETE/clear endpoint. SKILL.md edited at the project-local path inside the phase worktree; main-repo copy will sync on merge. Plan-checker iteration 1 warning about user-global path (`~/.claude/skills/`) verified clean.
- **Plan 04-05** (2026-05-21): `resolveProjectWikiPath` kept in `lib/data/wiki.ts` — adding `getProject` + `resolveDocsPaths` imports introduced no circular dependency (verified via `tsc --noEmit` clean + 230/230 tests + clean `next build`). HUB-06 absolute-path-required invariant enforced via ordered `PATH_REGEXES` array with explicit receipt-SUPPRESSION when no regex matches (rather than emitting an empty `file_written` field). Subprocess `appendReceipt` is awaited inside the close handler before `resolve()` so callers + tests observe the receipt on disk synchronously. Required (not optional) `clientSlug`/`projectSlug` on `RunCaptureOptions` so stale call sites surface at compile time. Per-test fixture-mutation pattern (`clients.yaml` snapshot → patch placeholder → `invalidateClients()` → restore) is the working answer for injecting tmpdir paths into the shared YAML fixture.

### Pending Todos

[From `.planning/todos/pending/` — ideas captured during sessions]

None yet (fresh `.planning/` initialization).

Pre-v4 follow-ups carried over from ADR 0002:
- BRDO-01: backfill `mrr_monthly:` on Inside Out, ToneQuest, IowaEverywhere, Partners For Sight, future Wild Rose / Thermal Kitchen
- BRDO-02: run `/onboard-client` for the 5 BrandOS dealers; resolve "under terraplex Client vs. own Client" per dealer
- BRDO-03: rename `terraplex-hub` → `terraplex-distributor` once dealer migration is no longer happening inside it

### Blockers/Concerns

- **Pre-existing tsc errors on baseline.** `app/clients/[client]/layout.tsx` and `page.tsx` reference Next.js 16 typed-route globals `LayoutProps` / `PageProps` that resolve via `.next/types/**`. `tsc --noEmit` standalone flags them; a `next build` materializes the types. Logged in `.planning/phases/04-bidirectional-hub/deferred-items.md` for a later route-types cleanup plan. NOT a 04-02 regression.
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
Stopped at: Completed Plan 04-05 — wiki-aware capture + HUB-06 receipt emission shipped on `phase/04-bidirectional-hub` worktree. 3 atomic commits (`3d5a160` feat helper+tests, `979db09` test RED, `116910b` feat GREEN). 8 new tests (4 wiki + 4 capture), 230/230 repo-wide pass, build clean. HUB-05 (capture branch) + HUB-06 (capture branch) satisfied.
Resume file: `.planning/phases/04-bidirectional-hub/04-05-SUMMARY.md`. Next action: orchestrator picks up the next Phase 4 plan. Phase 4 status: 5/9 plans done (Wave 1: 04-02; Wave 2: 04-03, 04-04, 04-05, 04-06; 04-01 commits on branch but no SUMMARY yet).
