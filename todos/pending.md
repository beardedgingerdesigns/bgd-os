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

- [ ] **Jon AI-services partnership — parked (Jon keeps punting)** `#ops`
  - Added: 2026-06-12
  - Source: skill:audit
  - Priority: low
  - Notes: The 5/30 pitch never happened — Jon keeps deferring. AI-services pivot (proof point #2) is parked as mapped exploration until Jon re-engages (decision 2026-06-13). No action; re-activate only if Jon initiates.

- [ ] **Consolidate or graduate Deploy Answers references** `#ops`
  - Added: 2026-06-12
  - Source: skill:audit
  - Priority: low
  - Notes: references/deploy-answers.md + deploy-answers-brand-brief.md + docs/deploy-answers/ + state/deploy-answers.md. Over the one-brief rule. Either consolidate to one brief or /kickoff-project it into its own repo wiki.

- [ ] **Align /kickoff-project with /wiki skill conventions** `#ops`
  - Added: 2026-06-12
  - Source: manual
  - Priority: medium
  - Notes: kickoff-project hardcodes Iowa Everywhere as template and reimplements wiki bootstrap + ingest inline. Should delegate Phase 4 to /wiki init and Phase 8 to /wiki ingest. Unique kickoff work (PM interview, AIOS gather, gut-check, clients.yaml) stays.

- [ ] **Scrub stale /load-project mentions from onboard-client skill and EXPANSIONS.md** `#ops`
  - Added: 2026-06-12
  - Source: skill:audit
  - Priority: low
  - Notes: load-project retired to archives/skills/ 2026-06-12. onboard-client SKILL.md still describes itself as its intake counterpart.

- [ ] **Revive scheduled-triage — dead since Sun 6/8 8:57pm CT** `#ops`
  - Added: 2026-06-12
  - Source: manual
  - Priority: high
  - Notes: Stub installed at ~/.claude/scheduled-tasks/scheduled-inbox-triage/ on 6/8 10:38pm; zero runs since (skip log empty = trigger never fires). Stub's relative skill path fixed to absolute 6/12. Remaining: verify the Desktop scheduled task is enabled and firing; confirm next run writes triage-latest.json. Until then, run /daily-inbox-triage manually each morning. ALSO: retro-weekly stub created 6/12 at ~/.claude/scheduled-tasks/retro-weekly/ (Fri afternoon: /retro then /level-up) — needs its schedule attached in the Desktop app on the same rail; verifying the triage fix verifies both.

- [ ] **Re-engage Co-Line Manufacturing** `#client`
  - Added: 2026-06-13
  - Source: manual
  - Client: co-line-mfg
  - Priority: medium
  - Notes: Existing $75/mo Craft maintenance client; website redesign stalled. Justin wants to reconnect and reopen the conversation. Lead with the relationship + stalled redesign; the AI-pivot angle is optional/later, not the opener.
