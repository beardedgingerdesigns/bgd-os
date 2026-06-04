# Roadmap: claude-os

## Overview

claude-os is Justin's personal AIOS — a local-only Next.js workspace combining filesystem-source-of-truth (`clients.yaml`, `references/`, `memory/`, `decisions/`, per-client wikis), Claude Code skills, and an append-only decisions log. Roadmap is split by milestone; each milestone covers a coherent slice of operator-facing capability. Completed milestones are archived to `.planning/milestones/` to keep this file small.

## Milestones

- [x] **v1.0 — AIOS UI v0→v2 (Local Operator Command Center)** ✅ SHIPPED 2026-05-22 — see [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Phases 1-4: read-only nav + MRR; live sync + daily triage; capture + ritual launchers; bidirectional hub with brief-hydrated chat, staged ingestion to `raw/aios/`, Receipt feed, Pending Ingestion. 267 tests, 9,932 LOC added, 5 ADRs locked.

## Milestone v2.0 — AIOS v2: Dispatcher + Strategic Partner

**Goal:** Re-architect AIOS around two jobs — a dispatcher that triages and routes work to project wikis, and a strategic business partner for cross-cutting BGD decisions, research, and planning.

---

### Phase 5: End-of-Session State Hook

**Goal:** Ship the Claude Code end-of-session hook that auto-generates STATE.md in project wikis and syncs a copy to claude-os `state/`.
**Requirements:** STATE-01, STATE-02, STATE-03, STATE-04

**Summary:** This is the foundational "last-known-state" layer that every downstream phase reads from. Project cards, triage dispatch, and prospect pipeline all depend on knowing where each project last stood.

**Success Criteria:**

1. A Claude Code hook fires at session end and produces a `STATE.md` in the active project wiki when the session substance threshold is met (edits + messages + commits).
2. Sessions below the threshold produce no file — no empty or boilerplate STATE.md written.
3. The LLM summary in STATE.md covers status, accomplishments, next steps, blockers, and key dates in a tight, scannable format.
4. A copy lands in claude-os `state/<slug>.md` within the same hook execution.
5. Rerunning the hook on an unchanged session produces no diff to existing STATE.md.

**Plans:** 2/2 plans complete
Plans:
**Wave 1**

- [x] 05-01-PLAN.md — Infrastructure + PostToolUse metrics accumulator hook

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-02-PLAN.md — SessionEnd state generator hook + settings wiring + verification

---

### Phase 6: Persistent To-Do List + Skill Lifecycle

**Goal:** Stand up the operator-level to-do list and retire/rewire skill lifecycle commands.
**Requirements:** TODO-01, TODO-02, TODO-03, TODO-04, SKILL-01, SKILL-02

**Summary:** Stand up the operator-level to-do list as a first-class AIOS artifact. Retire `/load-project` (wikis are now self-sufficient) and wire `/onboard-client` to trigger the full intake-to-kickoff lifecycle. Bundled together because both are low-infrastructure changes with no UI dependencies, and SKILL-02 touches the same onboarding data model the prospect pipeline (Phase 9) will consume.

**Success Criteria:**

1. `todos/pending.md` (or equivalent) exists in claude-os and survives across sessions.
2. Operator can add a to-do item manually and it persists until explicitly completed.
3. `/load-project` is retired — invoking it surfaces a deprecation notice pointing to the project wiki.
4. `/onboard-client` runs the full sequence: intake interview → `clients.yaml` entry → `/kickoff-project` → initial STATE.md → decisions log entry — in a single uninterrupted flow.
5. Email threads are never written to the to-do list (ephemeral triage output, not persistent actions).

**Plans:** 2/2 plans complete
Plans:
**Wave 1** *(parallel — no file overlap)*

- [x] 06-01-PLAN.md — Persistent to-do list artifact + /load-project deprecation
- [x] 06-02-PLAN.md — /onboard-client full lifecycle chain rewire

---

### Phase 7: Wiki Filtering (Two-Layer Intelligence)

**Goal:** Add intelligence to the staged ingestion pipeline with output filtering and wiki-side evaluation.
**Requirements:** WIKI-01, WIKI-02, WIKI-03, WIKI-04

**Summary:** Add intelligence to the staged ingestion pipeline that already exists from v1.0 (ADR 0004). AIOS gets an output filter (classify operational vs. project-relevant before writing to `raw/aios/`). The wiki ingest side gets an evaluation pass that produces promote/skip/flag outcomes and surfaces contradictions to the operator rather than silently overwriting.

**Success Criteria:**

1. Content classified as operational by the AIOS output filter does not appear in any project wiki's `raw/aios/` staging directory.
2. Content classified as project-relevant is staged to the correct project wiki (not broadcast to all wikis).
3. Wiki ingest run on a `raw/aios/` drop produces one of three outcomes per file: promoted to curated structure, skipped with logged reason, or flagged for operator review.
4. A flagged contradiction surfaces in the AIOS UI (or a notification surface) with the original and the incoming version side-by-side — operator resolves, file is not auto-promoted.
5. Heuristic classification handles the common cases; LLM is invoked only for ambiguous files.

**Plans:** 2/3 plans executed
Plans:
**Wave 1** *(parallel — no file overlap)*

- [x] 07-01-PLAN.md — Content classifier (Layer 1) + write surface integration
- [x] 07-02-PLAN.md — Ingest evaluator skill enhancement + type updates (Layer 2)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 07-03-PLAN.md — Flag resolution UI + resolve API endpoint

---

### Phase 8: Scheduled Triage Automation

**Requirements:** TRIAGE-01, TRIAGE-02, TRIAGE-03, TRIAGE-04, TRIAGE-05

**Summary:** Promote triage from a manually triggered skill to a scheduled routine (~2hr waking-hours intervals). Output expands to include inline draft replies, persistent action item extraction (writing to the Phase 6 to-do store), and dispatch handoffs to project wikis for project-relevant email intelligence. Depends on the to-do store (Phase 6) and the wiki dispatch filter (Phase 7).

**Success Criteria:**

1. Triage routine fires automatically on a ~2hr schedule during waking hours without operator intervention.
2. Each triage run produces a ranked list of unanswered threads with at least one draft reply per actionable thread.
3. Action items extracted from email content are written to the persistent to-do list and survive until explicitly completed.
4. Email threads containing project-relevant intelligence trigger a dispatch handoff written to the appropriate project wiki's `raw/aios/` staging directory.
5. Dispatch classification uses heuristic categories first; LLM tiebreaker fires only for ambiguous threads, keeping routine cost predictable.

---

### Phase 9: Prospect Pipeline

**Requirements:** PROSPECT-01, PROSPECT-02, PROSPECT-03, PROSPECT-04, PROSPECT-05

**Summary:** Build the knowledge-accumulation layer for inbound leads. Prospects live in `prospects/<slug>.md` and grow as triage tags relevant email threads. `/onboard-client` reads the accumulated prospect doc and asks only the questions not already answered. At conversion, a bucket flip + `/kickoff-project` seeded with prospect knowledge produces a richer starting wiki than a cold onboard. Depends on triage tagging (Phase 8) and the `/onboard-client` lifecycle (Phase 6).

**Success Criteria:**

1. `prospects/<slug>.md` exists for any contact tagged as a prospect via `clients.yaml` and grows with each triage pass that matches a relevant thread.
2. Running triage against an email from a known prospect contact updates the prospect doc with the new intelligence.
3. `/onboard-client` on a prospect with an existing doc skips questions already answered and surfaces gaps, producing a shorter, more targeted interview.
4. Conversion flow flips the record's bucket in `clients.yaml`, calls `/kickoff-project` with prospect doc content as seed context, and creates an initial STATE.md in the new wiki.
5. The new project wiki's STATE.md is synced to claude-os `state/` on creation.

---

### Phase 10: AIOS UI Rewrite

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07

**Summary:** Rebuild the AIOS UI around the dispatcher model. Dashboard replaces the current hub layout with triage queue, to-do list, project status cards (read-only, powered by Phase 5 STATE.md), MRR number, and prospect cards. Per-project chat, project briefs, and per-project Communications are retired. Strategic chat becomes an embedded terminal for cross-cutting business partner conversations. Depends on all prior phases — this phase is last because the UI surfaces intelligence, it doesn't create it.

**Success Criteria:**

1. Dashboard renders triage queue, to-do list, project cards, MRR widget, and prospect cards from live filesystem data.
2. Triage surface supports inline email reply revision with a send action — no external email client required for standard replies.
3. Clicking a project card opens the project in VS Code or a new Claude terminal session — no in-app project navigation.
4. Project cards display last-known-state (status, last activity, next step, blockers) sourced from `state/<slug>.md`.
5. Strategic chat is an embedded terminal scoped to the claude-os repo — no per-project chat surfaces remain.
6. Per-project chat, project brief caching, and per-project Communications section are removed from the UI and their backend endpoints cleaned up.

---

## Phase Numbering

- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions
- Phase numbering does NOT reset across milestones — next phase is Phase 5

## Progress

Milestone v1.0: 4/4 phases complete, 100%.
Milestone v2.0: 2/6 phases complete, 33% — Phase 7 planning complete.
