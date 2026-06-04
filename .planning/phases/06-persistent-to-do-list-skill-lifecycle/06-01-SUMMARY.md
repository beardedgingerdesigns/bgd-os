---
phase: 06-persistent-to-do-list-skill-lifecycle
plan: 01
subsystem: skills
tags: [markdown, to-do, skill-lifecycle, deprecation]

# Dependency graph
requires:
  - phase: 05-session-state-hooks
    provides: "SessionEnd hook that auto-generates STATE.md in project wikis"
provides:
  - "Persistent to-do list artifact at todos/pending.md with structured markdown format"
  - "Archive file at todos/completed.md for completed items"
  - "Retired /load-project skill with deprecation notice and preserved trigger phrases"
affects: [08-triage-automation, 10-ui-simplification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Structured markdown to-do format with parseable metadata (Added, Source, Client, Priority, Notes)"
    - "Skill deprecation via redirect pattern (preserve trigger phrases, replace execution body)"

key-files:
  created:
    - "todos/pending.md"
    - "todos/completed.md"
  modified:
    - ".claude/skills/load-project/SKILL.md"

key-decisions:
  - "Preamble checkbox example reworded to avoid false grep match on verification (inline code backtick-wrapped [ ] still matched grep)"
  - "Email thread exclusion rule encoded directly in preamble, not just in comments"

patterns-established:
  - "To-do item format: checkbox + bold summary + hashtag + indented metadata lines (Added, Source, Client, Priority, Notes)"
  - "Skill deprecation: DEPRECATED prefix in description, bike-method-phase: retired, informational body with redirect instructions"

requirements-completed: [TODO-01, TODO-02, TODO-03, TODO-04, SKILL-01]

# Metrics
duration: 2min
completed: 2026-06-04
---

# Phase 06 Plan 01: Persistent To-Do List + /load-project Retirement Summary

**Persistent to-do list as first-class AIOS artifact with structured markdown format, plus /load-project skill retired with deprecation notice preserving all trigger phrases**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-04T06:33:00Z
- **Completed:** 2026-06-04T06:35:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created persistent to-do list at todos/pending.md with structured format supporting both manual and automated (triage) writes
- Seeded 2 real action items from current open work (Phase 5 hook verification, BrandOS dealer migration review)
- Retired /load-project skill with deprecation notice while preserving all 6 trigger phrases for Claude Code recognition

## Task Commits

Each task was committed atomically:

1. **Task 1: Create persistent to-do list artifact (todos/ directory)** - `d5e6431` (feat)
2. **Task 2: Retire /load-project skill with deprecation notice** - `c5dbde1` (feat)

## Files Created/Modified
- `todos/pending.md` - Persistent to-do list with format rules preamble, 2 seed items, email thread exclusion rule
- `todos/completed.md` - Archive file for completed items with reverse-chronological ordering guidance
- `.claude/skills/load-project/SKILL.md` - Replaced 344-line execution body with deprecation notice and redirect to project wikis

## Decisions Made
- Reworded the format rules preamble to avoid using bare `- [ ]` (which grep matched as a real item), using descriptive text with backtick-wrapped `[ ]` and `[x]` instead
- Email thread exclusion rule placed directly in the preamble as a visible callout, not buried in comments

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed preamble checkbox example causing false grep match**
- **Found during:** Task 1 verification
- **Issue:** The format rules preamble contained `- [ ]` in an example line, causing the verification command to count 3 checkboxes instead of 2 seed items
- **Fix:** Reworded to "Each item starts with a pending checkbox `[ ]` or completed checkbox `[x]`" to avoid the grep match
- **Files modified:** todos/pending.md
- **Verification:** grep -c count returns 2 after fix
- **Committed in:** d5e6431 (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor phrasing adjustment. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- To-do format is ready for Phase 8 triage automation to write extracted action items with Source: triage metadata
- /load-project deprecation notice is live; invoking "/load brandos" will show the redirect message
- Plan 06-02 (onboard-client rewiring) can proceed independently

## Self-Check: PASSED

All files exist, all commits verified in git log.

---
*Phase: 06-persistent-to-do-list-skill-lifecycle*
*Completed: 2026-06-04*
