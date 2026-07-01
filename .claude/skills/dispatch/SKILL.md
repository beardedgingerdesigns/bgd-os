---
name: dispatch
description: The AIOS read-and-route pipeline. Processes every drop sitting in the inbox (archives/raw/) and routes each item to where it belongs — project material to project wiki + AIOS wiki, OS-level knowledge to the wiki, decisions to decisions/log.md, action items to todos/pending.md, ephemera stays archived. Updates state/<slug>.md with the thin delta per touched project. Use when Justin says "/dispatch", "process the inbox", "route these drops", "I dropped files in for you", "ingest this transcript/PDF", or any time a meeting transcript, Gemini notes PDF, screenshot, or document lands in archives/raw/ and needs to flow into the system.
---

# Dispatch

You are the AIOS dispatcher. Drops land in **one inbox**: `archives/raw/`. Your job is to read each item, decide where it belongs, route it there, and leave a thin state update behind. You never do deep project work here — you hand context to the right destination and move on.

**Everything flows through AIOS first.** Drops always land here before reaching project wikis. This ensures AIOS gets the business-level context (dates, decisions, status changes) even when the deep content routes to a project.

## Pipeline

### 1. Inventory

List `archives/raw/`. Anything not yet routed is work. A routed item has a matching line in `archives/raw/ROUTING-LOG.md` (create the log on first run; one line per item: date, filename, destination(s), one-line gist).

### 2. Classify each item

Read the item. Check for `dispatch_to` frontmatter first — if present (e.g., from `/gemini-sweep`), use it as routing hints instead of re-inferring. Only `project-wiki` hints are expected — never `aios-wiki`; dispatch makes the business-vs-project classification itself. Otherwise, match to a project via `clients.yaml` (slugs, contacts, domains). Use Gemini transcript attribution rules from memory (e.g., Cherity speaks under Jack Schroeder's account in Terraplex meetings). Verify proper nouns against the registry rather than inheriting variant spellings — ask once if a name doesn't resolve.

Then apply **the filter**: *does this change what the project knows about itself?*

- Launch date moved, new stakeholder, scope/pricing shift, decision made → **wiki-worthy**
- "Tuesday works", "resend the logo", scheduling chatter → **operational**, dies at the AIOS layer
- Cross-cutting business intelligence (pricing thesis, market insight, partnership terms) → **OS-level**, routes to AIOS wiki

### 3. Route

Each item can route to **multiple destinations**. A Gemini transcript may yield a project wiki staging file + an AIOS wiki entry (via `/wiki log`) + a todo + a state update.

| Content type | Destination |
|---|---|
| Project material (wiki-worthy) | `{project wiki}/raw/aios/` per `clients.yaml` docs_paths — **staging only, never curated pages** (ADR 0004). Name it `YYYY-MM-DD-<gist>.md` with frontmatter noting source + date. |
| Gemini meeting files (kind: gemini-sweep) | `{project wiki}/raw/gemini/` for full content. Create the directory if it doesn't exist. Also log to AIOS wiki (see below). |
| OS-level knowledge | AIOS wiki directly via `/wiki log`. Dispatch runs inside claude-os, so the AIOS wiki is its own wiki — write directly, don't stage. |
| A decision Justin made | Propose an entry for `decisions/log.md` (decision, why, alternatives, owner) |
| Action items | Append to `todos/pending.md` in its documented format (Source: `skill:dispatch`) |
| Advisor content (videos, transcripts from board members) | `docs/wiki/advisors/<advisor>/raw/` |
| Ephemera / already-routed originals | Stays in `archives/raw/` — log it and leave it. Never delete. |

#### AIOS wiki for project-routed items

When an item routes to a project wiki, also check: does it contain business-level intelligence AIOS should know? Date changes, status shifts, pricing, decisions, new contacts — anything that affects the springboard layer. If yes, write a **thin summary** (not the full content) directly to the AIOS wiki via `/wiki log`. This keeps `/brief` and the dashboard informed.

### 4. Update state

For each project touched, update `state/<slug>.md`: bump **Updated** date, adjust **Status**, add what changed to current status, and revise **Next Steps**. Keep it thin — state files are the springboard layer, not transcripts. If no state file exists for an active project, create one matching the existing format (Accomplishments / Current Status / Next Steps).

### 5. Report

Summarize: items processed, where each went (project wiki + AIOS wiki + state), what was staged to which project wikis so the developer knows what's waiting for ingestion, todos added, anything that needs Justin's eyes (decisions to confirm, unresolved names, items that didn't classify cleanly).

## Rules

- **AIOS-first.** Every drop flows through AIOS before reaching project wikis. AIOS always gets at minimum the business-level delta.
- **Stage to project wikis (cross-repo). Write directly to AIOS wiki via `/wiki log` (own repo).** Project wikis own their curated structure — write only to their `raw/aios/` or `raw/gemini/`.
- **Classify first, write second.** Read all items, classify everything (business-level vs project-level vs todo vs decision vs ephemera), then write. No interleaved classify-and-write.
- **Honor dispatch_to frontmatter.** When present (from /gemini-sweep or other collectors), use the routing hints. Don't re-infer what the collector already determined.
- **Never delete a drop.** The inbox doubles as the immutable archive. Route copies/summaries outward; originals stay.
- **Identity = email address**, not first name. Two senders sharing a name on different domains are different people.
- **Thin deltas.** A state update is 1-5 lines of change, not a retelling.
- **Don't invent outcomes.** If a transcript implies but doesn't state a decision, flag it as a question for Justin instead of logging it.
