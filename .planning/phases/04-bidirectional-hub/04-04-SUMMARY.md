---
phase: 04-bidirectional-hub
plan: 04
subsystem: ui
tags: [next.js-16, react, vitest, gmail-triage, raw-drops, receipts]

# Dependency graph
requires:
  - phase: 04-bidirectional-hub
    provides: receipt persistence (appendReceipt), raw-drops helpers, types (Receipt, ReceiptKind), invalidationBus (04-01)
  - phase: 04-bidirectional-hub
    provides: WikiDisplay wired into Project page above Source-files block (04-03)
provides:
  - "Per-thread triage override persistence (.aios-cache/triage-overrides.json)"
  - "POST /api/triage/override/[threadId] endpoint with receipt emission + global invalidation"
  - "daily-inbox-triage SKILL.md Step 2.0 + 2.1: override-aware + Gmail thread-participant check"
  - "TriageRowActions client component (Replied / Snooze 2d / Not me, optimistic UX)"
  - "TriageOutput projectSlug/projectContacts filter + renderRowActions opt-in"
  - "CommunicationsSection on Project page, filtered to project contacts"
affects: [04-09 (Pending Ingestion section sibling), future plans that consume triage state]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic JSON write via temp+rename (sessions.ts skipped this; overrides need it because a half-written file would surface as a visible UI bug)"
    - "Thread-block parsing heuristic in TriageOutput: new block on lines starting with '## ', '### ', '1.', '2.', '- **', or 'Thread:'"
    - "Server-component CommunicationsSection wrapping client-component TriageOutput (matches WikiDisplay pattern from 04-03)"

key-files:
  created:
    - aios-ui/lib/cache/triage-overrides.ts
    - aios-ui/app/api/triage/override/[threadId]/route.ts
    - aios-ui/components/triage-row-actions.tsx
    - aios-ui/components/communications-section.tsx
    - aios-ui/tests/lib/cache/triage-overrides.test.ts
    - aios-ui/tests/app/api/triage-override.test.ts
  modified:
    - aios-ui/lib/types.ts
    - aios-ui/components/triage-output.tsx
    - aios-ui/app/clients/[client]/projects/[project]/page.tsx
    - .claude/skills/daily-inbox-triage/SKILL.md

key-decisions:
  - "Atomic temp+rename for overrides.json. Rationale: a half-written JSON file would visibly break the next /daily-inbox-triage run."
  - "TriageOutput filter operates on parsed markdown blocks (not individual lines) so the Gmail-link line keeps its surrounding context (Subject, score, project memory)."
  - "Server/client split: CommunicationsSection (server) reads triage cache; TriageOutput (component) and TriageRowActions (client) handle interactivity."
  - "No undo control on TriageRowActions. Operator re-runs /daily-inbox-triage to refresh. Adding undo would need a DELETE/clear endpoint and per-row revert UI; not scoped for HUB-04/09."
  - "Edited the SKILL.md at the project-local path inside the phase worktree. Main-repo copy will sync on merge. Plan-checker iteration 1 warning about user-global path (~/.claude/skills/) verified: no leakage in any edited file."

patterns-established:
  - "Triage row override pattern: optimistic UI then POST then flip to 'done' on success, revert + inline error on failure. Mirrors todo-list.tsx but simpler (no SSE stream, no abort controller)."
  - "Contact-match filter pattern: support both plain emails AND @domain substrings; pass project.contacts raw (unfiltered) when domain matches are needed."

requirements-completed: [HUB-04, HUB-09]

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 04 Plan 04: Per-project Triage with Per-row Override Summary

**Per-thread override file + POST endpoint + override-aware daily-inbox-triage skill + Communications section on the Project page with Replied/Snooze 2d/Not me row actions.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-21T22:11:09Z
- **Completed:** 2026-05-21T22:19:06Z
- **Tasks:** 3
- **Files modified/created:** 10

## Accomplishments

- Operator can mark any inbox-triage row Replied / Snooze 2d / Not me from the Project page. Click writes `.aios-cache/triage-overrides.json` and emits a `triage_override` receipt.
- `/daily-inbox-triage` skill now reads the override file BEFORE the inbound/age heuristic and respects the operator's manual decision. It also calls `mcp__claude_ai_Gmail__get_thread` to check whether Justin has replied anywhere in the thread. Closes the "daily ingest assumes I haven't replied even when I have" complaint.
- Per-project filter on the Project page: triage rows are filtered to threads mentioning the project's contacts (plain emails OR `@domain` substring), so opening Wild Rose shows only Wild Rose threads.
- 222/222 Vitest suite green. `next build` clean. The `/api/triage/override/[threadId]` route is in the route table.

## Task Commits

1. **Task 1 (RED): failing tests** ... `676f479` (test). 2 test files, 16 tests defined, both files failed at module-not-found.
2. **Task 1 (GREEN): types + cache + route** ... `cfbd4e2` (feat). `lib/cache/triage-overrides.ts` + `POST /api/triage/override/[threadId]` + types; 16/16 tests pass.
3. **Task 2: SKILL.md Step 2.0 + 2.1** ... `afbaab0` (feat). Override-aware filter + Gmail thread-participant check; TODOS_JSON_START envelope preserved verbatim.
4. **Task 3: row actions + filter + Communications section** ... `b866cf6` (feat). `TriageRowActions` + `TriageOutput` extended props + `CommunicationsSection` server component + Project page wiring.

## Files Created/Modified

- `aios-ui/lib/types.ts` ... added `TriageOverrideStatus`, `TriageOverride`, `TriageOverridesFile`.
- `aios-ui/lib/cache/triage-overrides.ts` ... read/write/delete with atomic temp+rename.
- `aios-ui/app/api/triage/override/[threadId]/route.ts` ... POST handler. Validates status, writes override, appends `triage_override` receipt, publishes invalidation.
- `aios-ui/components/triage-row-actions.tsx` ... client component with three buttons + optimistic state + inline error.
- `aios-ui/components/triage-output.tsx` ... new optional props (`projectSlug`, `projectContacts`, `renderRowActions`); thread-block parsing + contact match filter; renders `<TriageRowActions />` beneath each Gmail-link line when opt-in.
- `aios-ui/components/communications-section.tsx` ... server component, reads `readTriageCache()`, renders empty-state when no cache.
- `aios-ui/app/clients/[client]/projects/[project]/page.tsx` ... added `CommunicationsSection` AFTER the Source-files block, BEFORE `CaptureBox`. Added `allContacts` (raw, includes `@domain`) for the filter.
- `aios-ui/tests/lib/cache/triage-overrides.test.ts` ... 9 tests covering read/write/delete + atomic rename + dir creation.
- `aios-ui/tests/app/api/triage-override.test.ts` ... 7 tests covering happy paths, validation errors, receipt emission.
- `.claude/skills/daily-inbox-triage/SKILL.md` (project-local, in worktree) ... new Step 2.0 (override file read) + Step 2.1 (Gmail participant check) + Step 2.2 (existing heuristic + the two new filter rules); TODOS_JSON envelope contract preserved.

## Decisions Made

- **Atomic write via temp+rename** for `triage-overrides.json`. Rationale: `sessions.ts` does a direct `fs.writeFile`, but a half-written sessions file is invisible (sessions are read at chat-start). A half-written overrides file would surface immediately the next time the operator looks at the queue.
- **Thread-block parsing heuristic.** Markdown structure from `daily-inbox-triage` Step 5: numbered list items under `## Reply today` headers, each block ending with `Thread: \`<id>\``. The split regex matches lines starting with `## `, `### `, `1.`, `2.`, `- **`, or `Thread: `. Blocks without a thread ID (headers, intro text) always pass through; blocks with a thread ID only pass if any contact substring is found in the block body. Documented here for future refinement if Step 5 output format changes.
- **`@domain` patterns handled by stripping the leading `@`.** A contact like `@wildrosecasino.com` matches any occurrence of `wildrosecasino.com` in the block body (case-insensitive substring). Plain emails match as-is.
- **CommunicationsSection inserted after Source-files, before CaptureBox.** Plan 04-09 (Pending Ingestion) will need to insert in the same region and must place itself AFTER this node per its plan.

## Deviations from Plan

None. Plan executed exactly as written.

The plan-checker iteration 1 warning about user-global skill paths was verified throughout: every edited file points to either `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-overrides.json` or `/Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md` (project-local). No reference to `/Users/justinlobaito/.claude/skills/` exists in any edited file.

## Issues Encountered

- The SKILL.md at `/Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md` (main repo) and at `/Users/justinlobaito/repos/claude-os/.worktrees/phase-04-bidirectional-hub/.claude/skills/daily-inbox-triage/SKILL.md` (this worktree) are separate files. The plan named the main-repo path explicitly; I edited the worktree copy so the change lands in the phase branch. The main-repo copy will sync at merge. This is the normal worktree workflow, not a deviation.

## User Setup Required

None. No external service configuration required. The `.aios-cache/triage-overrides.json` file is created lazily on first POST.

## Next Phase Readiness

- HUB-04 (per-project triage view) and HUB-09 (per-row override) both delivered.
- Plan 04-09 (Pending Ingestion section) can now insert AFTER `CommunicationsSection` on the Project page using the explicit anchor documented in this plan.
- Skill update will take effect on next `/daily-inbox-triage` run.

## Self-Check: PASSED

All files referenced in `key-files.created` confirmed present:
- `aios-ui/lib/cache/triage-overrides.ts` ... FOUND
- `aios-ui/app/api/triage/override/[threadId]/route.ts` ... FOUND
- `aios-ui/components/triage-row-actions.tsx` ... FOUND
- `aios-ui/components/communications-section.tsx` ... FOUND
- `aios-ui/tests/lib/cache/triage-overrides.test.ts` ... FOUND
- `aios-ui/tests/app/api/triage-override.test.ts` ... FOUND

All commits referenced confirmed in `git log`:
- `676f479` ... FOUND (test)
- `cfbd4e2` ... FOUND (feat)
- `afbaab0` ... FOUND (feat)
- `b866cf6` ... FOUND (feat)

---
*Phase: 04-bidirectional-hub*
*Completed: 2026-05-21*
