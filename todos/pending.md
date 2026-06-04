# To-Do List

Items persist until explicitly completed. Completed items are moved to `completed.md`.

## Format rules

- Each item starts with a pending checkbox `[ ]` or completed checkbox `[x]`
- Bold summary on the first line, optional `#hashtag` category tag
- Indented metadata lines below the summary:
  - **Added:** date in YYYY-MM-DD format
  - **Source:** one of `manual`, `triage`, `onboard`, `skill:<name>`
  - **Client:** client-slug / project-slug compound form from `clients.yaml` (only if applicable)
  - **Priority:** one of `high`, `medium`, `low`
  - **Notes:** optional one-line context
- New items are appended at the bottom of the `## Pending` section
- When an item is done, mark its checkbox `[x]` and move it to `completed.md`

**Email threads do NOT belong here.** Only extracted action items from triage belong in this list. Raw email threads remain in `aios-ui/.aios-cache/todos-today.json` as ephemeral triage output.

## Pending

- [ ] **Verify Phase 5 STATE.md hook fires correctly on next session end** `#ops`
  - Added: 2026-06-04
  - Source: manual
  - Priority: high
  - Notes: Confirm state-session-end.js produces valid STATE.md in a project wiki after the next non-claude-os session closes.

- [ ] **Review BrandOS dealer migration status** `#review`
  - Added: 2026-06-04
  - Source: manual
  - Client: terraplex / terraplex-hub
  - Priority: medium
  - Notes: New Heights + Great River still on Base 44. Truss blocked on domain transfer. Superior Drone stalled.
