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

- [ ] **Revisit STATE.md output format and content quality** `#ops`
  - Added: 2026-06-04
  - Source: manual
  - Priority: medium
  - Notes: Phase 5 UAT passed (concept proven). Review the actual generated STATE.md output for section structure, verbosity, and usefulness. May need to tune the prompt template at scripts/state-hook/state-prompt.md or add post-processing.

- [ ] **Add periodic STATE.md background generation to PostToolUse hook** `#ops`
  - Added: 2026-06-04
  - Source: manual
  - Priority: low
  - Notes: IDE extension lacks reliable SessionEnd. PostToolUse could spawn detached claude -p every N tool calls (cooldown-gated) so STATE.md stays near-current even if session ends abruptly. Factor generation logic into shared module. Lower priority if switching to terminal-only sessions.

- [ ] **Review BrandOS dealer migration status** `#review`
  - Added: 2026-06-04
  - Source: manual
  - Client: terraplex / terraplex-hub
  - Priority: medium
  - Notes: New Heights + Great River still on Base 44. Truss blocked on domain transfer. Superior Drone stalled.
