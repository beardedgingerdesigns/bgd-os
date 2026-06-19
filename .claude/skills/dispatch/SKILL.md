---
name: dispatch
description: The AIOS read-and-route pipeline. Processes every drop sitting in the inbox (archives/raw/) and routes each item to where it belongs — project material to that project's wiki raw/aios/ staging, OS-level knowledge to context/ or references/, decisions to decisions/log.md, action items to todos/pending.md, ephemera stays archived. Updates state/<slug>.md with the thin delta per touched project. Use when Justin says "/dispatch", "process the inbox", "route these drops", "I dropped files in for you", "ingest this transcript/PDF", or any time a meeting transcript, Gemini notes PDF, screenshot, or document lands in archives/raw/ and needs to flow into the system.
---

# Dispatch

You are the AIOS dispatcher. Drops land in **one inbox**: `archives/raw/`. Your job is to read each item, decide where it belongs, route it there, and leave a thin state update behind. You never do deep project work here — you hand context to the right destination and move on.

## Pipeline

### 1. Inventory

List `archives/raw/`. Anything not yet routed is work. A routed item has a matching line in `archives/raw/ROUTING-LOG.md` (create the log on first run; one line per item: date, filename, destination(s), one-line gist).

### 2. Classify each item

Read the item (use Gemini transcript attribution rules from memory — e.g. Cherity speaks under Jack Schroeder's account in Terraplex meetings). Match it to a project via `clients.yaml` (slugs, contacts, domains). Verify proper nouns against the registry rather than inheriting variant spellings — ask once if a name doesn't resolve.

Then apply **the filter**: *does this change what the project knows about itself?*

- Launch date moved, new stakeholder, scope/pricing shift, decision made → **wiki-worthy**
- "Tuesday works", "resend the logo", scheduling chatter → **operational**, dies at the AIOS layer
- Cross-cutting business intelligence (pricing thesis, market insight, partnership terms) → **OS-level**, not project-level

### 3. Route

| Content type | Destination |
|---|---|
| Project material (wiki-worthy) | `{project wiki}/raw/aios/` per `clients.yaml` docs_paths — **staging only, never curated pages** (ADR 0004). Name it `YYYY-MM-DD-<gist>.md` with a frontmatter note of source + date. |
| OS-level knowledge | `context/` (canonical facts) or `references/` (frameworks, guides, briefs) |
| A decision Justin made | Propose an entry for `decisions/log.md` (decision, why, alternatives, owner) |
| Action items | Append to `todos/pending.md` in its documented format (Source: `skill:dispatch`) |
| Advisor content (videos, transcripts from board members) | `docs/wiki/advisors/<advisor>/raw/` |
| Ephemera / already-routed originals | Stays in `archives/raw/` — log it and leave it. Never delete. |

One item can route to multiple destinations (a transcript may yield a wiki staging file + a todo + a decision).

### 4. Update state

For each project touched, update `state/<slug>.md`: bump **Updated** date, adjust **Status**, add what changed to current status, and revise **Next Steps**. Keep it thin — state files are the springboard layer, not transcripts. If no state file exists for an active project, create one matching the existing format (Accomplishments / Current Status / Next Steps).

### 5. Report

Summarize: items processed, where each went, state files touched, todos added, anything that needs Justin's eyes (decisions to confirm, unresolved names, items that didn't classify cleanly).

## Rules

- **Stage, never curate.** Project wikis own their curated structure. You write only to their `raw/aios/`.
- **Never delete a drop.** The inbox doubles as the immutable archive. Route copies/summaries outward; originals stay.
- **Identity = email address**, not first name. Two senders sharing a name on different domains are different people.
- **Thin deltas.** A state update is 1-5 lines of change, not a retelling.
- **Don't invent outcomes.** If a transcript implies but doesn't state a decision, flag it as a question for Justin instead of logging it.
