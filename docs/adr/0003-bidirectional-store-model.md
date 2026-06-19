# ADR 0003 — Bidirectional store model for AIOS UI

**Status:** Accepted
**Date:** 2026-05-21
**Decision-makers:** Justin Lobaito
**Process:** Resolved during a `/grill-with-docs` session on the AIOS UI v2 "Bidirectional Hub" phase.

## Context

After the AIOS UI v1 build (per [ADR 0001](0001-aios-ui-architecture.md)), Justin reported that the UI felt "very read-only": he was filling information in but had no visibility into what was happening with it. Continuity between sessions was broken — opening a Project page tomorrow didn't surface what was captured or decided today. The wiki integration promised by `docs_paths` was cosmetic metadata (counts only). Chat was effectively unusable because the Project chat endpoint required a manual `/load-project` CLI call before any session would respond.

Four candidate models for what "central hub" should mean were considered in the grilling session:

1. **Consolidated view** — UI gets richer at reading (more sources surfaced), but work still happens in editor / terminal / Gmail.
2. **Unified workspace** — UI becomes where work HAPPENS; chat full-context, decisions write from chat to wiki on demand. One-way: UI is the verb.
3. **Bidirectional store** — UI is the seam. Anything that happens anywhere (Gmail reply, CLI session, wiki edit, capture) surfaces here. Anything done here propagates to durable storage.
4. **Session-to-session memory** — Continuity = pick up where you left off (last chat thread, last draft). UI remembers individual work sessions.

## Decision

Adopt the **bidirectional store** model. The AIOS UI is the seam between operator inputs (Gmail, calendar, CLI sessions, wiki edits) and durable storage (project wikis, decisions log, memory). Two-way pipe: inputs flow in and become visible; actions flow out to the right durable home.

Concretely, this means:

- **Inputs surfaced:** Gmail thread triage rows render per Project (filtered by `contacts`). Project chat hydrates from a pre-indexed brief plus live Gmail/calendar at session bootstrap. Wiki content (decisions, log entries) renders as expandable UI sections, not just counts.
- **Outputs propagated:** Captures, chat-decision promotions, and chat session closes all write to the project wiki's `raw/aios/` staging inbox. Triage overrides persist as a state file the daily-ingest Skill consults before filtering. Every write emits a Receipt feed entry (timestamp, kind, project, absolute file path, excerpt) so the operator sees what happened.

The rejected alternatives:

- **Consolidated view** — Doesn't solve the "I'm filling info in and I don't know what's happening" complaint; that's a write-visibility problem, not a read-richness problem.
- **Unified workspace** — Too close to building a full second application surface. The bidirectional model gets the same operator benefits with a much smaller build.
- **Session-to-session memory** — Useful, but a special case of bidirectional (chat session closes drop transcripts to `raw/aios/`, which the next session can ingest). Not a different model.

## Consequences

### Positive

- The "central hub" feeling becomes structural, not aspirational. Every write has a receipt; every project has a brief.
- The CLI surface stays intact. Bidirectional doesn't mean the UI is the only entry point; CLI captures and wiki edits flow into the UI via the file watcher just as before.
- Existing investments compound. `/load-project`, `/capture`, `/wiki`, daily-inbox-triage all stay canonical — the UI orchestrates them, doesn't replace them.

### Negative / accepted trade-offs

- More state to manage. Receipts, override files, indexed briefs, watcher lifecycle. Each adds a small surface area for bugs.
- More cross-repo writes. Captures from the AIOS UI land in external repo paths (`/Users/justinlobaito/repos/<project>/wiki/raw/aios/`). Mitigated by always showing the absolute path in receipts and by writing ONLY to the staging inbox (see [ADR 0004](0004-staged-ingestion-via-raw-aios.md)).
- The operator now has TWO durable artifacts of any chat session: the indexed brief (cache, rebuildable) and any dropped transcripts/decisions (immutable raw drops). Mental model has to differentiate.

### Reversibility

| Component | Cost to reverse |
|---|---|
| Receipt feed | Low — append-only log; remove the rendering and the writes still happen invisibly. |
| Indexed briefs | Low — chat can revert to the pre-v2 `/load-project` flow if briefs prove stale. |
| Raw-drop write path | Medium — operator workflows around `raw/aios/` and pending-ingestion would break; staged content would need re-routing. |
| Triage overrides | Low — the override file is read by the Skill; deleting the file restores pre-override behavior. |

The cluster as a whole is medium-cost to reverse, because the operator's mental model adapts to the bidirectional flow. Reverting would feel like a regression even if it's technically clean.

## Cross-references

- [CONTEXT.md](../../CONTEXT.md) — Receipt feed, Triage override, Project brief, Raw drop, Pending ingestion, Communications
- [ADR 0001 — AIOS UI architecture](0001-aios-ui-architecture.md) — the v1 architecture this builds on
- [ADR 0004 — Staged ingestion via raw/aios/](0004-staged-ingestion-via-raw-aios.md) — the write-path corollary
- [ADR 0005 — Chat hydration via indexed briefs](0005-chat-hydration-via-indexed-briefs.md) — the read-path corollary
- Plan: `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md`
