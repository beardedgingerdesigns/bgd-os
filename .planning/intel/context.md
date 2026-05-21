# Context — synthesized intel

Running notes from DOC-type sources and ADR Context/Consequences sections. Provenance attribution per entry.

---

## Topic: AIOS UI build phasing (operator intent, not architecture lock)

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §"Build phasing"
- The build proceeds in 4 slices per Justin's confirmation in the grilling session:
  - **v0** — Read-only nav (Home + Client + Project pages), MRR widget. ~1 Claude Code session.
  - **v1** — File watcher + SSE invalidation + daily-ingest modal. ~1 session.
  - **v2** — Chat panel + CLI subprocess + SSE streaming + auto-load on drawer expand. ~1-2 sessions.
  - **v3** — Capture boxes (Project + Home) + Admin surface (operator chat, skill buttons, internal projects, `references/research/`). ~1 session.
- Phasing exists for de-risking, not human capacity. Total: ~5-10 hours of Claude Code time across the 4 slices.

## Topic: Why v3 exists (operator pain that motivated the v3 spec)

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Goals + §Summary
- Today capturing a memory means switching to a terminal and running the skill manually. v3 makes it a textarea + ⌘↵ on the page you're already looking at.
- Surface weekly/monthly rituals (`level-up`, `weekly-project-status`, `audit`) inside the UI, with cached "last run" state so operator sees at a glance which rituals are overdue.
- Reuse v1's `DailyIngestModal` pattern visually and architecturally — same modal shape, same streaming output, same re-run-button affordance. User is already familiar.

## Topic: v3 non-goals + deferred items

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Non-goals + §Open items deferred to v3.1+
- Deliberately out of v3 scope (deferred to v3.1+ or beyond):
  - Global / client-level capture surface (project pages only in v3)
  - Cmd+K capture palette
  - Capture preview-then-confirm step (multi-turn capture)
  - Recent captures history surface
  - Business plans & research tile content (placeholder only)
  - Refactor of `DailyIngestModal` + `RitualModal` into shared base
  - Multi-tab locking for ritual concurrency
  - Abort / cancel mid-stream
  - Rich markdown rendering for ritual output (currently plain mono pre-wrap)
  - Real-time tile badge update when ritual finishes (badge is server-side, refreshes on page reload)
  - The two impeccable-deferred P0s (global app shell, chat as docked rail) — separate UI track

## Topic: v3 implementation milestones

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/plans/2026-05-19-aios-ui-v3.md`
- Task-by-task implementation plan reusing v1/v2 streaming subprocess + cache patterns. Each task is failing-test → confirm fail → implement → confirm pass → commit.
- 9 tasks: (1) v3 types, (2) capture subprocess wrapper TDD, (3) capture API route, (4) CaptureBox component + mount, (5) rituals cache module TDD, (6) ritual subprocess wrapper TDD, (7) rituals API route, (8) RitualTile + RitualModal, (9) Admin page assembly + e2e verification.
- Tech stack: Next.js 16 (App Router, RSC + client components), React 19, Tailwind 4, shadcn/ui v4 (Card / Button / Dialog), Lucide icons, Vitest, child_process.spawn, fs/promises.
- One commit per task, convention `feat(aios-ui): <description>`.

## Topic: v3 risks (operator's own self-assessment)

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Risks
- `/capture` skill behavior is not pinned. The skill could decide to do something the UI doesn't anticipate (ask for clarification, refuse, write to an unexpected location). UI surfaces whatever the skill outputs; operator re-submits.
- Timeout values are guesses. 90s for capture might be too tight if skill consults the wiki. 5 min for rituals might be too tight for weekly-status if Gmail is slow.
- Tile cache staleness — "Last ran Xd ago" misleads if cache file is hand-edited or deleted.
- Subprocess concurrency — a capture and ritual at the same time both spawn `claude` subprocesses with same cwd. Should be fine but unverified.

## Topic: Bidirectional store — operator complaint that motivated ADR 0003

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0003-bidirectional-store-model.md` §Context
- After v1, Justin reported the UI felt "very read-only": filling info in but no visibility into what was happening. Continuity broken — opening a Project page tomorrow didn't surface what was captured/decided today.
- Wiki integration promised by `docs_paths` was cosmetic metadata (counts only).
- Chat was effectively unusable because the Project chat endpoint required a manual `/load-project` CLI call before any session would respond.

## Topic: Staged ingestion — pivot rationale during the v2 grilling session

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0004-staged-ingestion-via-raw-aios.md` §Process + Context
- Initial design had AIOS writing directly to curated wiki structure. Justin pivoted mid-session to staged ingestion via `raw/aios/` because direct writes would require AIOS to reimplement decision numbering, slug generation, ADR templating, and `index.md` / `log.md` maintenance per wiki — duplicating `llm-wiki`'s job and creating drift. Also blurs authorship in git history.
- Same pattern as how PDFs and meeting notes already land in `raw/` — AIOS becomes just another source.

## Topic: Chat hydration — operator pain that motivated ADR 0005

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0005-chat-hydration-via-indexed-briefs.md` §Context
- v1 Project chat endpoint at `aios-ui/app/api/chat/[client]/[project]/message/route.ts` errors out with `"no active session — call /load first"`. The intent in ADR 0001 §6 was that the chat panel would auto-fire `/load {slug}` on first drawer expand. In practice the wiring never landed — operator has to drop to CLI to prep a session before UI chat works.
- ADR 0005 closes this gap with pre-built indexed briefs.

## Topic: BrandOS dealer onboarding open questions

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0002-mrr-data-model.md` §"Open follow-ups"
- **Data migration:** add `mrr_monthly:` to existing Projects with revenue (Inside Out, ToneQuest, IowaEverywhere, Partners For Sight, future Wild Rose / Thermal Kitchen if on retainer). Pre-v0 task.
- **Dealer onboarding:** run `/onboard-client` for each of the 5 BrandOS dealers Justin listed. Resolve the "under terraplex Client vs. own Client" question per dealer.
- **Rename consideration:** `terraplex-hub` Project may want to be renamed to `terraplex-distributor` once the dealer migration work is no longer happening inside it.

## Topic: Cross-references (graph)

- 0001 ↔ 0002 (mutual sibling cluster — AIOS UI architecture + MRR data model, both 2026-05-19)
- 0003 → 0001 (extends v1 architecture into v2 bidirectional model)
- 0004 → 0003 (write-path corollary of bidirectional)
- 0005 → 0001 §6 + 0003 (read-path corollary; supersedes 0001 §6 mechanism)
- v3 spec → component/route paths (no ADR refs)
- v3 plan → v3 spec
- All ADRs reference `CONTEXT.md` (canonical glossary) — present in repo per cross-refs but not part of this ingest set.
- ADRs 0003/0004/0005 reference `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md` — out of repo, not ingested.
