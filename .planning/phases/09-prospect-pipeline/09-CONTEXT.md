# Phase 9: Prospect Pipeline - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the knowledge-accumulation layer for inbound leads. Prospects live as full-dossier markdown files at `prospects/<slug>.md` that grow with each triage pass. The scheduled triage routine (Phase 8) dispatches email intel directly into prospect docs. A dedicated `/convert-prospect` command flips a prospect to an active client, seeds the project wiki with accumulated knowledge, and chains to `/onboard-client` with pre-filled context. Weekly project status surfaces the prospect pipeline when prospects exist.

</domain>

<decisions>
## Implementation Decisions

### Prospect Doc Structure
- **D-01:** Prospect docs live at `prospects/<slug>.md` in claude-os. New top-level directory.
- **D-02:** Full dossier format. Each doc accumulates email intel, manual notes, meeting summaries, pricing discussions, contact maps, and problem maps.
- **D-03:** Structured YAML frontmatter + freeform markdown body. Frontmatter includes: status, contacts (map of all seen contacts with name/email/role/last_interaction), first_seen, last_activity, source. No estimated_value or estimated_mrr fields. Pricing strategy emerges through AIOS conversations in the Pricing Strategy section.
- **D-04:** Body sections: Timeline (reverse-chrono, newest first), Pricing Strategy (human + AIOS working surface), Problem Map (business problems the prospect has mentioned), Notes (freeform manual observations), Next Steps (what needs to happen to advance the deal).
- **D-05:** Timeline is reverse-chrono (newest at top). When you open the doc, the most recent intel is immediately visible. /onboard-client reads from top for freshest context.
- **D-06:** Prospect docs are board-readable. /ask-the-board can reference `prospects/<slug>.md` when a prospect slug is mentioned, giving advisors the full dossier for pricing, positioning, and strategy advice.

### Triage-to-Prospect Wiring
- **D-07:** Hybrid registration model. Justin can manually register a prospect anytime. Triage also flags unrecognized business senders in the FYI section as potential prospects, but does not auto-create entries. Justin acts on the nudge when he chooses.
- **D-08:** Triage dispatches intel directly into the prospect doc's Timeline section. No raw/aios/ staging. The prospect doc IS the accumulation surface. Simpler than the wiki pipeline since there's no curation layer.
- **D-09:** Prospects get the same triage treatment as clients: scored, draft replies created via Gmail drafts for reply-needed threads, action items extracted. Faster response = better first impression.
- **D-10:** Prospect doc is scaffolded immediately at registration time (not on first triage match). Created with frontmatter + empty sections, ready for intel before the first triage hit.

### Conversion Flow
- **D-11:** Explicit conversion command (`/convert-prospect <slug>`). Reads the prospect doc, flips the bucket, then chains to /onboard-client with context pre-loaded. Separate from /onboard-client to make the conversion intentional.
- **D-12:** Conversion does NOT flip directly to `bucket: paying`. It sets `bucket: active` (signed but not yet invoicing). Bucket moves to `paying` when the first invoice goes out. Tracks the gap between "yes" and "money in."
- **D-13:** After conversion: archive original to `prospects/converted/<slug>.md` AND seed the new project wiki with prospect doc content (timeline, problem map, pricing strategy staged into wiki raw/). Belt and suspenders. Nothing lost.

### Prospect Lifecycle Signals
- **D-14:** Five status values in frontmatter: `active` | `warm` | `cold` | `dead` | `converted`.
- **D-15:** Auto-flip after threshold. If `last_activity` > 30 days, status auto-flips to `cold`. If > 90 days, auto-flips to `dead`. Keeps the pipeline clean without manual maintenance.
- **D-16:** `last_activity` in frontmatter is updated by triage on each match. This is the data source for the auto-flip thresholds.
- **D-17:** Weekly project status includes a "Prospect Pipeline" section, but only when active/warm prospects exist. If pipeline is empty, no clutter.

### Claude's Discretion
- **Triage nudge format:** Claude picks the right format for flagging unrecognized business senders in the FYI section. Should be noticeable but not noisy.
- **Problem Map extraction depth:** Claude decides how aggressively to extract problem signals from email threads. Should lean toward explicit mentions of pain points, not inferences.
- **Auto-flip notification:** Claude decides whether to notify Justin when a prospect auto-flips to cold or dead (push notification, inline mention in weekly status, or silent).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Client Registry & Contact Matching
- `clients.yaml` -- Client/project registry. Prospects use `bucket: prospect`. Contact matching for triage uses `contacts:` arrays. The `bucket:` field taxonomy expands to include `active` (between prospect and paying).

### Prior Phase Outputs (Dependencies)
- `.claude/skills/scheduled-triage/SKILL.md` -- Phase 8 triage skill. Steps 1-8 need to be extended to handle prospect-bucket entries (dispatch to prospect docs instead of wiki raw/aios/).
- `.claude/skills/onboard-client/SKILL.md` -- Phase 6 onboard skill. `/convert-prospect` chains to this after pre-filling from prospect doc.
- `todos/pending.md` -- Phase 6 to-do store. Triage already writes here for clients; same treatment for prospects.
- `docs/adr/0004-staged-ingestion-via-raw-aios.md` -- Staged ingestion convention. Prospect docs bypass this (direct write), but conversion seeds wiki raw/ following this convention.

### Voice & Style
- `references/voice.md` -- Draft replies for prospect threads must match this register.

### Board Integration
- `docs/wiki/advisors/` -- Advisory board. Prospect docs should be discoverable by /ask-the-board for pricing and strategy deliberation.

### Weekly Status
- `.claude/skills/weekly-project-status/SKILL.md` -- Needs prospect pipeline section added (conditional on prospect existence).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `clients.yaml` `bucket:` field already has `prospects` as a value (1 entry currently). Data model partially exists.
- `/onboard-client` skill already handles the full lifecycle chain (intake -> clients.yaml -> /kickoff-project -> STATE.md -> decisions log). Conversion flow chains to this.
- Scheduled triage SKILL.md Steps 1-4 already match emails to projects via clients.yaml contacts. Same matching extends to prospects.
- `aios-ui/.aios-cache/triage-latest.json` processedThreads field enables triage to track prospect thread processing.

### Established Patterns
- Frontmatter + freeform body pattern used throughout AIOS (memory files, decisions, wiki pages). Prospect docs follow the same convention.
- Direct file writes from skills (not via API routes). Triage writes directly to prospect docs like it writes to todos/pending.md.
- Reverse-chrono timeline follows the same pattern as triage output.

### Integration Points
- Scheduled triage SKILL.md Step 8 (wiki dispatch) needs a parallel path for prospect-bucket entries that writes to `prospects/<slug>.md` instead of `{wiki}/raw/aios/`.
- `/weekly-project-status` SKILL.md needs a conditional prospect pipeline section.
- `/ask-the-board` needs prospect doc path resolution when a prospect slug is mentioned.

</code_context>

<specifics>
## Specific Ideas

- Pricing Strategy section is a working surface for AIOS conversations, not a static field. Justin wants to query AIOS against pricing strategies while prospecting, using the prospect doc as the context anchor.
- Contact map tracks everyone seen in threads (name, email, role, last interaction), not just a primary contact. Mirrors how real deals involve multiple stakeholders.
- The `bucket: active` intermediate state tracks the gap between "prospect said yes" and "first invoice sent." This is a real business lifecycle distinction.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 09-prospect-pipeline*
*Context gathered: 2026-06-09*
