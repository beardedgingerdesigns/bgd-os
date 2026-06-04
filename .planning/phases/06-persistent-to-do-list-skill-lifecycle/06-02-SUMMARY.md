---
phase: 06-persistent-to-do-list-skill-lifecycle
plan: 02
subsystem: skills
tags: [markdown, skill-lifecycle, skill-chaining, onboard-client, kickoff-project, state-hook]

# Dependency graph
requires:
  - phase: 05-session-state-hooks
    provides: "SessionEnd hook that auto-generates STATE.md in project wikis"
  - phase: 06-persistent-to-do-list-skill-lifecycle
    provides: "Plan 06-01 retired /load-project, removing stale references"
provides:
  - "Rewired /onboard-client skill with full intake-to-kickoff lifecycle chain"
  - "Phase 6 (Kickoff) chains to /kickoff-project with graceful failure handling"
  - "Phase 7 (Initial STATE.md) seeds STATE.md in wiki root + state/<slug>.md"
  - "Phase 8 (Final Close) expanded with wiki and STATE.md status"
affects: [08-triage-automation, 10-ui-simplification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skill chaining: one skill invokes another via sequential instruction with confirmation prompt and graceful degradation"
    - "STATE.md format parity: initial seed matches scripts/state-hook/state-prompt.md format for downstream hook compatibility"
    - "Graceful chain degradation: core writes complete before optional chain steps; chain failure does not lose registry data"

key-files:
  created: []
  modified:
    - ".claude/skills/onboard-client/SKILL.md"

key-decisions:
  - "Confirmation prompt before kickoff chain (not auto-chain) to give operator control over the optional wiki seed step"
  - "Phase 7 skips entirely if kickoff was skipped or failed, deferring STATE.md creation to the SessionEnd hook on first working session"

patterns-established:
  - "Skill chaining with AskUserQuestion confirmation: operator can skip optional chain steps without losing core writes"
  - "Initial STATE.md format matches hook-generated format exactly for seamless downstream updates"

requirements-completed: [SKILL-02]

# Metrics
duration: 3min
completed: 2026-06-04
---

# Phase 06 Plan 02: /onboard-client Full Lifecycle Chain Summary

**Rewired /onboard-client with three new phases (Kickoff, Initial STATE.md, Final Close) chaining intake through /kickoff-project wiki seed with graceful degradation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-04T06:39:03Z
- **Completed:** 2026-06-04T06:41:53Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added Phase 6 (Kickoff) that chains /onboard-client to /kickoff-project with operator confirmation prompt and graceful failure handling
- Added Phase 7 (Initial STATE.md) that seeds STATE.md in the wiki root and syncs to state/<slug>.md using the exact state-prompt.md format
- Expanded Phase 6 (Close) into Phase 8 (Final Close) with wiki and STATE.md status in the checklist
- Updated decisions log template with wiki and STATE.md status lines, removed /load-project references
- Expanded output contract from 6 to 8 artifacts, added rules 10 (graceful chain degradation) and 11 (STATE.md format parity)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewire /onboard-client with full lifecycle chain** - `e9d55e2` (feat)

## Files Created/Modified
- `.claude/skills/onboard-client/SKILL.md` - Rewired with Phases 6-8 (Kickoff chain, Initial STATE.md, Final Close), expanded output contract and critical implementation rules

## Decisions Made
- Operator confirmation prompt before kickoff chain (AskUserQuestion with Continue/Skip) rather than auto-chaining. Gives the operator control since kickoff runs an 11-phase sub-skill that takes significant time.
- Phase 7 skips entirely when kickoff was skipped or failed, relying on the SessionEnd hook to create STATE.md automatically during the first working session. This avoids writing STATE.md for a project that has no wiki yet.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None -- no external service configuration required.

## Next Phase Readiness
- /onboard-client now walks the full intake-to-kickoff lifecycle in one flow
- Running /onboard-client will chain through /kickoff-project (with operator confirmation) and seed initial STATE.md
- Phase 06 is complete (both plans: 06-01 persistent to-do list + /load-project retirement, 06-02 /onboard-client lifecycle chain)
- Ready for Phase 07+ execution

## Self-Check: PASSED

All files exist, all commits verified in git log.

---
*Phase: 06-persistent-to-do-list-skill-lifecycle*
*Completed: 2026-06-04*
