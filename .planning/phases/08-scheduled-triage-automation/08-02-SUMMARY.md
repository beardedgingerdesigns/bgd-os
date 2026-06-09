---
phase: 08-scheduled-triage-automation
plan: 02
subsystem: skills
tags: [triage, email, scheduled-tasks, gmail, todos, wiki-dispatch]
dependency_graph:
  requires:
    - "daily-inbox-triage SKILL.md (inherited logic for Steps 1-5)"
    - "clients.yaml (contact matching + project slug resolution)"
    - "aios-ui/.aios-cache/triage-latest.json (lookback window source)"
    - "aios-ui/.aios-cache/triage-overrides.json (operator override file)"
  provides:
    - ".claude/skills/scheduled-triage/SKILL.md (complete 10-step scheduled triage skill)"
    - "Lookback window computation from cache (D-03)"
    - "Unconditional Gmail draft creation (D-05, D-06)"
    - "Action item extraction to todos/pending.md with 7-day dedup (D-07)"
    - "Wiki dispatch files to raw/aios/ per thread per matched project (D-08, D-09, D-10)"
  affects:
    - "todos/pending.md (action items appended per run)"
    - "aios-ui/.aios-cache/triage-latest.json (overwritten per run)"
    - "{wiki}/raw/aios/triage-dispatch-*.md (created per qualifying thread)"
    - "Gmail Drafts (created per qualifying thread)"
tech_stack:
  added: []
  patterns:
    - "Atomic lock via mkdir /tmp/scheduled-triage.lock"
    - "Dynamic lookback window from ranAt timestamp in triage-latest.json"
    - "Deterministic dedup key: triage:{thread_id}:{action_type}:{client_slug}"
    - "Idempotent dispatch file path: triage-dispatch-YYYY-MM-DD-{slug}.md"
    - "Cache-write-last correctness guarantee (Step 9)"
key_files:
  created:
    - ".claude/skills/scheduled-triage/SKILL.md"
  modified: []
decisions:
  - "Atomic mkdir lock chosen over file-based lock -- mkdir is atomic on all POSIX filesystems; file-based lock has TOCTOU race window"
  - "7-day dedup window for todos (not session-scoped) -- prevents duplicate action items across runs while allowing legitimate recurrence after 7 days"
  - "Write cache LAST rule (Rule 10) -- if earlier steps fail, next run re-processes the same window; no threads are skipped due to partial-run cache writes"
  - "Heuristic-first classification for Step 8 dispatch -- reduces LLM calls on obvious cases; only ambiguous threads escalate"
  - "Desktop scheduled task execution model -- filesystem dependencies (todos/pending.md, wiki raw/aios/, triage-overrides.json) require local access; Cloud Routines deferred to future phase"
metrics:
  duration: "4min"
  completed_date: "2026-06-09"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
requirements_met:
  - TRIAGE-01
  - TRIAGE-02
  - TRIAGE-03
  - TRIAGE-04
  - TRIAGE-05
---

# Phase 08 Plan 02: Scheduled Triage SKILL.md Summary

**One-liner:** Complete 10-step scheduled triage skill with atomic locking, dynamic lookback from triage-latest.json, unconditional Gmail draft creation, 7-day dedup action item extraction to todos/pending.md, and idempotent wiki dispatch to raw/aios/.

## What Was Built

Created `.claude/skills/scheduled-triage/SKILL.md` -- a 440-line production-ready skill definition that transforms email triage from a manual morning ritual into an automated ambient infrastructure routine.

The skill inherits the proven thread-pulling, filtering, scoring, and context-gathering pipeline from `/daily-inbox-triage` (Steps 1-5) and adds four new automated capabilities:

- **Step 0:** Atomic mutex lock + dynamic lookback window computed from `triage-latest.json` (D-03). Four branches: first run (14d), weekend/holiday gap >48h (3d), overnight gap >12h (14h), mid-day check (ceil(elapsed+1)h).
- **Step 6:** Unconditional `mcp__claude_ai_Gmail__create_draft` for all reply-needed threads (D-05, D-06). No confirmation gate -- the key behavioral difference from the manual skill.
- **Step 7:** Action item extraction to `todos/pending.md` with deterministic dedup key (`triage:{thread_id}:{action_type}:{client_slug}`) and 7-day window (D-07, TRIAGE-03).
- **Step 8:** Wiki dispatch to `{wiki}/raw/aios/triage-dispatch-YYYY-MM-DD-{slug}.md` per thread per matched project, with YAML frontmatter including all required fields (D-08, D-09, D-10, TRIAGE-04, TRIAGE-05).
- **Step 9:** Cache-write-last correctness guarantee, PushNotification summary, lock release (D-04).

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SKILL.md with Steps 0-5 (lookback + inherited triage) | 379b76c | .claude/skills/scheduled-triage/SKILL.md (created, 440 lines) |
| 2 | Add Steps 6-9 (draft creation, action items, dispatch, cache) | 10dc402 | .claude/skills/scheduled-triage/SKILL.md (output contract references updated) |

## Deviations from Plan

### Scope adjustment

**1. [Rule 2 - Enhancement] Steps 0-9 written in Task 1, not split across two tasks**
- **Found during:** Task 1 execution
- **Why:** The plan's Task 1/Task 2 split was organizational -- Task 2 said "append Steps 6-9." Writing all steps together in a single cohesive document produced better cross-referencing (e.g., Step 5 output contract needed Step 9's cache shape to explain processedThreads). Task 2 became a verification + output contract refinement step.
- **Impact:** No behavioral drift. All acceptance criteria for both tasks satisfied in the final committed file.

## Known Stubs

None. The skill is complete and self-contained. All referenced paths are absolute. All tool names are explicit (`mcp__claude_ai_Gmail__create_draft`, `mcp__claude_ai_Gmail__list_drafts`, `mcp__claude_ai_Gmail__search_threads`, `mcp__claude_ai_Gmail__get_thread`).

## Threat Flags

None beyond what was documented in the plan's threat model. All mitigations implemented:
- T-08-02: Draft voice anchored to `references/voice.md`; never auto-sent
- T-08-04: Dispatch path validated against wiki `docs_paths` prefix before write
- T-08-06: pageSize capped at 50; lookback window bounds search volume

## Self-Check: PASSED

- FOUND: `.claude/skills/scheduled-triage/SKILL.md`
- FOUND: `.planning/phases/08-scheduled-triage-automation/08-02-SUMMARY.md`
- FOUND: commit 379b76c (Task 1)
- FOUND: commit 10dc402 (Task 2)
