---
name: brief
description: The springboard. On-demand decision dashboard answering "where does everything stand and what needs a decision from me right now?" Reads only what the AIOS already holds — state/*.md, todos/pending.md, the decisions log tail, context/priorities.md, and today's calendar — and synthesizes it into a tight brief. Use when Justin says "/brief", "brief me", "where do things stand", "what needs me today", "morning brief", or opens a session wanting the lay of the land before deciding anything. Lighter and faster than /weekly-project-status (no per-project research agents, no Gmail fetch).
---

# Brief

Read these, synthesize a decision-ready dashboard in under 40 lines. No email fetch (that's `/daily-inbox-triage`), no research agents (that's `/weekly-project-status`).

## Sources

- `context/priorities.md` — the quarter's frame
- `state/*.md` — per-project state (flag Updated dates >7 days as possibly stale)
- `state/inbox-triage.md` — latest triage (flag `last_run` >14h on weekdays as dead schedule; surface "Reply today" count and any score >=10 by name)
- `aios-ui/.aios-cache/pending-state-updates.json` — triage-drafted state-update proposals awaiting review (read the `proposals` array; count only)
- `todos/pending.md`
- `decisions/log.md` — last 2-3 entries
- `clients.yaml` `docs_paths` (directory entries = project wikis) — for each, count files in `raw/aios/` and `raw/gemini/` to find uningested drops. Count only (ignore dotfiles like `.gitkeep`); never read or move the files. Skip any path that doesn't exist or isn't readable — fail silently, one missing wiki never aborts the brief.
- Google Calendar: today + next 3 days (skip silently if MCP unavailable)

## Sections (this order)

1. **Needs a decision** — what's blocked on Justin. Leads even if empty.
2. **In motion** — one line per project: status, next step, owner.
3. **Blocked / waiting** — who owes what, since when.
4. **The money line** — MRR vs quarter target and the gap.
5. **Pending wiki ingestion** — projects whose wiki has files staged in `raw/aios/` or `raw/gemini/`, with per-project file count: "3 projects have uningested drops: brandos (34 files), wild-rose (4 files)." These are staged drops awaiting `/dispatch` / `/wiki ingest` — surface them so they don't rot silently. Omit this section entirely when every project is clean (no zero-count noise).

End with calendar collisions or deadline pressure within 72h.

## Constraints

- Every line earns its place by changing what Justin does today. Synthesize, don't dump.
- Surface staleness — don't paper over state files or priorities that look overtaken.
- If `pending-state-updates.json` has proposals, surface the count once near the staleness flags: "N state updates proposed — review in Sync." Brief is read-only: never apply or write state; the Sync view owns that.
- If Justin makes a decision, suggest `decisions/log.md`.
- Route follow-ups: project deep-dive → that repo. Email → `/daily-inbox-triage`. Full board → `/weekly-project-status`.
