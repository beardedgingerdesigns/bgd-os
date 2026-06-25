---
plan: 09-05
status: complete
started: 2026-06-25
completed: 2026-06-25
---

# Summary: Weekly Status Pipeline + Board Prospect Resolution

## What was built
- Step 3.5 in weekly-project-status: scans `prospects/` for active/warm entries, builds conditional Prospect Pipeline table with cooling alerts. Section omitted when pipeline is empty.
- ask-the-board Phase 1: prospect doc path resolution — kebab-case slugs in questions matched against `prospects/` and `prospects/converted/`, included in advisor context files

## Notes
- ask-the-board is a user-level skill (~/.claude/skills/), not in this repo. Edit saved but not committed to claude-os.

## Self-Check: PASSED
- weekly-project-status: 3 "Prospect Pipeline" refs, 2 "prospects/" refs
- ask-the-board: prospect doc resolution logic added with both path checks

## Commits
1. `f35e17b` — feat(09-05): add Prospect Pipeline section to weekly status
2. (ask-the-board edit saved to user-level skill, not repo-tracked)
