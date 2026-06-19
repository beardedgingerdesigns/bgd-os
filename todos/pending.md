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

- [ ] **Scrub stale /load-project mentions from onboard-client skill and EXPANSIONS.md** `#ops`
  - Added: 2026-06-12
  - Source: skill:audit
  - Priority: low
  - Notes: load-project retired to archives/skills/ 2026-06-12. onboard-client SKILL.md still describes itself as its intake counterpart.

- [ ] **Re-engage Co-Line Manufacturing** `#client`
  - Added: 2026-06-13
  - Source: manual
  - Client: co-line-mfg
  - Priority: medium
  - Notes: Existing $75/mo Craft maintenance client; website redesign stalled. Justin wants to reconnect and reopen the conversation. Lead with the relationship + stalled redesign; the AI-pivot angle is optional/later, not the opener.

- [x] **Add "define done" gate to /level-up Method spec template** `#ops`
  - Added: 2026-06-15
  - Source: skill:wiki (Nate Herk 6 AI Skills digest)
  - Priority: medium
  - Notes: Shipped 2026-06-16. New Step 6 in Method interview — mandatory done-state before building. Skill stops if user can't define it.

- [x] **Add agent-vs-workflow gate to /level-up** `#ops`
  - Added: 2026-06-15
  - Source: skill:wiki (Nate Herk 6 AI Skills digest)
  - Priority: medium
  - Notes: Shipped 2026-06-16. Added to EAD step (Step 2) — "vending machine or slot machine?" Default to deterministic. New critical rule #8.

- [ ] **Graduate voice.md into a taste library** `#ops`
  - Added: 2026-06-15
  - Source: skill:wiki (Nate Herk 6 AI Skills digest)
  - Priority: low
  - Notes: Currently voice.md is rules (no em dashes, don't fake voice). Upgrade to include saved good/bad examples with *why*, so AI instructions get richer taste signal. Would fix the recurring "match my tone" corrections from retro pattern #8.

- [ ] **Ship BrandOS landing page on brandosportal.com** `#brandos`
  - Added: 2026-06-15
  - Source: skill:wiki (Nate Herk 6 AI Skills digest)
  - Client: terraplex / brandos
  - Priority: medium
  - Notes: "Build in public to be discoverable" (Nate skill #6) is the argument for shipping content, not just the product. Domain purchased 2026-06-14; DNS not yet wired (DigitalOcean). First step: point nameservers, then stand up a coming-soon/value-prop page.

- [ ] **Keep investing in AIOS context capture** `#ops`
  - Added: 2026-06-15
  - Source: skill:wiki (Nate Herk 6 AI Skills digest)
  - Priority: low
  - Notes: Nate's skill #3 confirms private context is the moat — generic prompting produces generic output. Keep refining dispatch/wrap/wiki-staging pipeline. Not a discrete task; this is a standing principle. Review quarterly.

- [ ] **Terraplex: update homepage graphic to I19 photo** `#client`
  - Added: 2026-06-18
  - Source: skill:dispatch (Terraplex Monthly Status 2026-06-09)
  - Client: terraplex-hub
  - Priority: medium
  - Notes: Swap lower-right homepage image. Cherity also sending R40 spec sheet + YouTube training videos.

- [ ] **Terraplex: build dealer portal training section** `#client`
  - Added: 2026-06-18
  - Source: skill:dispatch (Terraplex Monthly Status 2026-06-09)
  - Client: terraplex-hub
  - Priority: medium
  - Notes: Incorporate YouTube training videos into the dealer portal. Waiting on Cherity to send the videos.

- [ ] **Terraplex: create rollout plan for website redesign + portal features** `#client`
  - Added: 2026-06-18
  - Source: skill:dispatch (Terraplex Monthly Status 2026-06-09)
  - Client: terraplex-hub
  - Priority: medium

- [ ] **GAN: confirm 6/19 10am with Delaney and send calendar invite** `#client`
  - Added: 2026-06-18
  - Source: skill:dispatch (session wrap 2026-06-12)
  - Client: global-ag-network
  - Priority: high
  - Notes: Current hold is personal only. Also need to answer her email-license question.

- [ ] **GAN: push repo to remote** `#ops`
  - Added: 2026-06-18
  - Source: skill:dispatch (session wrap 2026-06-12)
  - Client: global-ag-network
  - Priority: low
  - Notes: Repo currently local-only at /repos/global-ag-network/.
