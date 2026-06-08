# Phase 8: Scheduled Triage Automation - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Promote email triage from a manually-triggered skill (`/daily-inbox-triage`) to a scheduled routine that fires automatically during waking hours. The routine produces draft replies, extracts action items into the persistent to-do store (Phase 6), and dispatches project-relevant intelligence to wiki staging directories via the classification pipeline (Phase 7). This phase builds the automation layer — it does not redesign the triage logic itself.

</domain>

<decisions>
## Implementation Decisions

### Schedule & Trigger
- **D-01:** Use Claude Code `/schedule` to create the cron-style routine. Runs as a remote agent on Anthropic's infra — fires even when laptop is closed.
- **D-02:** Waking hours defined as 7am–9pm CT, weekdays only (Mon–Fri). Weekends remain manual-trigger only.
- **D-03:** First morning run (7am) uses a wider lookback window to cover overnight + any weekend gap. Mid-day runs scan only since the last run.
- **D-04:** Output lands in a cache file AND a push notification summary is sent via PushNotification tool (e.g. "3 threads need replies — highest priority: Pyro check-in"). File is the persistent record; notification is the nudge.

### Draft Reply Depth
- **D-05:** Draft replies are full, ready-to-send emails matching `references/voice.md` register. Review-and-send, not write-from-scratch.
- **D-06:** Drafts are created as actual Gmail drafts via the Gmail MCP `create_draft` tool on the thread. Open Gmail and it's sitting there ready to send.

### Action Item Extraction
- **D-07:** Before appending a new to-do, scan `todos/pending.md` for similar items (same client + similar description). Skip duplicates to prevent pile-up from recurring threads.

### Dispatch Routing
- **D-08:** Each dispatched thread gets its own file in the matched project wiki's `raw/aios/` (e.g. `capture-2026-06-08-pyro-trade-show-materials.md`). One file per thread, not batched.
- **D-09:** Multi-project threads dispatch to ALL matched projects. Each wiki gets the full thread context. Some duplication accepted to avoid missed intelligence.
- **D-10:** Dispatched files use YAML frontmatter with structured metadata (thread ID, sender, date, subject, matched contacts, urgency). Body is a summary of the project-relevant content, not raw email text.

### Claude's Discretion
- **Draft coverage threshold:** Claude picks a sensible filter for which threads get full draft replies vs. which get a brief mention. Should lean toward explicit commitments and clear reply-needed signals, skipping newsletters/notifications/no-reply senders. Urgency and age of thread are good tiebreakers.
- **Action item extraction threshold:** Claude picks the right sensitivity. Should lean toward explicit commitments and concrete requests over soft suggestions. Somewhere between "only 'send me X by Friday'" and "anything that might need follow-up."
- **Action item priority assignment:** Claude auto-assigns priority using urgency cues (deadline mentions = high, routine requests = medium, soft suggestions = low). User can override later.
- **Dispatch metadata balance:** Claude picks the right level of structured frontmatter vs. body content. Frontmatter should enable programmatic filtering; body should give the wiki ingest pipeline enough context to classify.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data Model & Write Path
- `docs/adr/0004-staged-ingestion-via-raw-aios.md` — Defines the `raw/aios/` staging convention and file naming (`<kind>-YYYY-MM-DD-<slug>.md`). All dispatched files must follow this.
- `clients.yaml` — Client/project registry with `contacts:` arrays (email + @domain patterns) used for thread-to-project matching.

### Prior Phase Outputs (Dependencies)
- `todos/pending.md` — Phase 6 to-do store format. New items appended with `Source: triage`, checkbox format, priority, client slug.
- `.planning/phases/07-wiki-filtering-two-layer-intelligence/` — Phase 7 classification pipeline (heuristic-first, LLM-tiebreaker). Dispatch filter in Phase 8 should reuse or align with this approach.

### Voice & Style
- `references/voice.md` — Draft replies must match this register. Casual but professional. Short sentences. No em dashes.

### Existing Triage Infrastructure
- `aios-ui/app/api/triage/` — Existing triage API routes (run, latest, override). May need to understand for cache format compatibility.
- `aios-ui/.aios-cache/` — Where triage output currently lands. Scheduled routine should write to the same location or a compatible one.

### Scheduling
- Claude Code `/schedule` documentation — Remote agent cron infrastructure. Routine definition format, PushNotification tool availability, session constraints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `aios-ui/app/api/triage/run/route.ts` — Existing triage run endpoint that shells out to `claude` CLI with the daily-inbox-triage prompt. The scheduled routine replaces this trigger mechanism but the triage logic itself may be reusable.
- `aios-ui/app/api/triage/latest/route.ts` — Serves cached triage results. Scheduled routine output should be compatible with this endpoint.
- `aios-ui/components/triage-row-actions.tsx` — Row-level actions on triage output. Existing UI patterns for reviewing triage results.
- `aios-ui/components/daily-ingest-modal.tsx` — Current modal that shows triage output. Phase 10 will rebuild this, but format compatibility matters now.

### Established Patterns
- Skills shell out to `claude` CLI subprocess (`child_process.spawn`). The scheduled routine is a different execution model (remote agent, not local subprocess).
- `clients.yaml` `contacts:` arrays are the canonical source for email-to-project matching. Weekly-project-status and daily-inbox-triage both use this pattern.
- To-do items follow the format in `todos/pending.md`: checkbox, bold summary, indented metadata (Added, Source, Client, Priority, Notes).

### Integration Points
- Gmail MCP tools: `search_threads`, `get_thread`, `create_draft` — the scheduled routine needs all three.
- PushNotification tool — available in remote scheduled agents.
- `raw/aios/` directories in project wikis — dispatch target for project-relevant intelligence.
- `todos/pending.md` — append target for extracted action items.

</code_context>

<specifics>
## Specific Ideas

- Morning run (7am CT) should feel like a morning briefing — comprehensive, covering the overnight gap
- Mid-day runs should be lighter — just "what changed since I last looked"
- Push notification should be concise enough to be useful at a glance (thread count + highest priority item)
- Gmail drafts mean Justin can review in his existing email workflow — no new tool to check

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 8-Scheduled Triage Automation*
*Context gathered: 2026-06-08*
