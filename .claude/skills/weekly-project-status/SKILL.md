---
name: weekly-project-status
description: Use each Monday morning, or when Justin asks "what's on my plate this week", "where do all my projects stand", "what's at risk", "give me a project status board", or any variant of cross-project synthesis. Produces a per-project status brief by synthesizing memory, decisions, recent Gmail, and upcoming Calendar events.
bike-method-phase: 1
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

Produces a **weekly project status board** across all active BGD engagements by synthesizing five sources Justin already maintains:

1. `memory/project_*.md` (filtered by frontmatter `client:` / `project:` keys)
2. `decisions/log.md` (entries within the last 14 days + open follow-ups) — **cross-cutting AIOS / business decisions**
3. **LLM-wiki activity per project** — `decisions/active/`, `decisions/deferred/`, recent `log/*.md` in each project's wiki (when registered in `clients.yaml` `docs_paths:`). This is the **project-internal** decision record. See Step 2.5.
4. Gmail per project (last 7 days of inbound/outbound for the project's contacts)
5. Google Calendar (upcoming events tagged to project participants in the next 14 days)

Closes the second half of stated top pain in `context/about-me.md` ("keeping all concurrent projects in one place") and the Tier-1 project/task tracking domain gap from the AIOS audit — without adopting a 4th external system.

**LLM-wiki integration.** Justin is rolling the `llm-wiki` pattern out across every project. Going forward, project-internal decisions live in `{project-repo}/docs/wiki/decisions/` with lifecycle (active/deferred/implemented/superseded), not in `claude-os/decisions/log.md`. This skill samples each project's wiki for activity in the last 14 days and feeds that into the per-project synthesis — so "Thermal Kitchen status" reflects both what's in claude-os memory AND what just got locked in the Thermal Kitchen wiki. The skill stays **shallow** at the wiki (sampling, not full reads) to keep wall-clock under 90s and avoid context bloat. `/load-project` is the deep complement.

## When to run

- **Manual run, each Monday morning.** Bike Method Phase 1 — no scheduled trigger yet. Justin runs it intentionally so he can calibrate whether the synthesis matches reality.
- **Re-run mid-week** when a launch slips, a deadline shifts, or capacity reshuffles.
- **Advance to Phase 2** (scheduled hook on Monday 7am CT) only after 4 weeks of clean manual runs.

## Today's context

- **Date:** {today}
- **Active engagements as of 2026-05-18** (cross-check `memory/` for current state):
  - **Inside Out** — Melinda content wrap-up; AR email pending
  - **Wild Rose Casino** — banquet walkthrough rescheduled; launch wk 5/25, before 6/1
  - **Thermal Kitchen** — design comps 5/19, review 5/20, launch **Tue 6/16**
  - **ToneQuest** — launch 6/1; Pelcro entitlements; PDF fallback if importer not stable by 5/15
  - **Lucky's** — queued post Wild Rose banquet
  - **BrandOS dealer growth** — 30-day target 10 dealers / $3,100 MRR by 2026-06-11
  - **BrandOS migrations** — New Heights, Great River (Base 44 → platform); Truss (domain transfer); Superior Drone (5/30 kill clock)
  - **Pyro** — monthly Fri 2pm CT cadence (next 6/5); Dakota Fest mid-August hard deadline
  - **Crash Champions** — Nel's AI lead, pitch path Nel → Val → Justin
  - **Nel + Alex partnership** — banking gate, Bison launch wk of 5/19
- **Q2 priorities (through July 2026) per `context/priorities.md`:**
  1. Productize BGD 18-month offering
  2. Ship BrandOS central brand-content hub
  3. Write 12-month business plan
- **Hard constraint:** No new custom one-off projects during productization push.

## Execution

### Step 1 — Enumerate active projects

Scan `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/project_*.md` and group by frontmatter `client:` + `project:` keys. Build a working list of distinct active projects.

Also pull from `clients.yaml` (root) if present — it's the canonical client/project registry.

Exclude projects flagged `status: closed` / `status: killed` / `status: archived` in frontmatter. Include "at risk" projects (e.g., Superior Drone on its 5/30 kill clock — still active until the date hits).

### Step 2 — Per-project data pulls

For each project, gather in parallel:

**A. Memory snapshot:**
- All `memory/project_*.md` files matching that client/project
- For each, capture: latest update date, current state (1-3 sentences), open follow-ups

**B. Recent decisions (last 14 days):**
- Use Grep on `decisions/log.md` for the client name + project name
- Pull headlines + "How to apply" bullets

**C. Gmail activity (last 7 days):**
- Use `mcp__claude_ai_Gmail__search_threads` with: `from:{project_contact_domain} OR to:{project_contact_domain} newer_than:7d`
- Capture: thread count, last inbound, last outbound, any flagged-unanswered (intersect with daily-inbox-triage logic)

**D. Upcoming calendar (next 14 days):**
- Use Google Calendar to find events whose attendees include project contacts
- Capture: event title, date, attendees

Keep each pull lean — don't fetch full bodies, work from snippets and headers.

### Step 2.5 — Sample LLM-wiki activity (shallow)

For each project, check `clients.yaml` `docs_paths:` for entries pointing at a project repo with an LLM-wiki. Detection (same as `/load-project` Step 4a):

- `WIKI-CLAUDE.md` at directory root, OR
- `wiki/WIKI-CLAUDE.md` one level down (when `docs_paths` is the parent `docs/`), OR
- `decisions/` + `log/` siblings present together

If no wiki detected: skip with one-line "no wiki registered" note and continue.

If wiki detected, do **shallow sampling** — not full reads:

1. **Read `decisions/index.md`** (one file, small, lists every decision's filename + status + one-line description). This is the wiki's TOC and the right summary surface for cross-project synthesis.
2. **List filenames in `decisions/active/`, `decisions/deferred/`, and `log/`** without reading bodies. Filenames are `YYYY-MM-DD-<slug>.md`.
3. **For files dated within the last 14 days**, read full content. These are the "recent activity" entries that should influence status. Cap at 5 files per section to bound wall-clock.
4. **Open-trigger scan:** for every `decisions/deferred/*.md` (regardless of age), check if any of its `Revisit triggers` reference dates that have now passed or events that have happened (mentioned in memory or Gmail). Flag these as "decisions needing revisit." Use shallow heuristics — exact-date matches and named-event matches; don't try to reason about every trigger. False positives are fine; this is a prompt to look, not a final answer.

Capture per project:
- Total active / deferred / superseded / implemented decision counts
- Most recent active decision (date + title)
- Most recent log entry (date + title)
- Decisions changed in the last 14 days (full content of those few files)
- Open follow-ups extracted from recent active decisions (from `Do not relitigate without` and explicit `Open follow-ups:` sections)
- Deferred decisions whose revisit triggers may have fired (flagged)

### Step 3 — Per-project synthesis (one AI summarization step)

For each project, derive:

- **Status:** On track / At risk / Blocked / Decision needed
- **Why this status** (one sentence, evidence-based)
- **Next action this week** (one concrete, time-bounded action)
- **Owner** (almost always Justin, but flag if a client owns the next move — e.g., "Deann owes design feedback by 5/20")
- **Deadline pressure** (any date inside the next 21 days)
- **Recent wiki activity** (one line: "{N} active, {M} deferred; last decision {date}; {K} log entries in last 14d" — or "no wiki")

This is the one AI call per project. Feed it the structured data from Step 2 + Step 2.5 and ask for the 6 fields above.

**Status heuristics:**
- **Blocked:** Project has a stated dependency that hasn't moved in 7+ days (e.g., Truss blocked on domain transfer).
- **Decision needed:** A wiki `decisions/deferred/*.md` revisit trigger appears to have fired (Step 2.5 flagged it), OR an active decision's `Do not relitigate without` trigger is now hot. Status pushes for a relitigation pass, not an execution sprint.
- **At risk:** Hard deadline within 14 days + open follow-ups not progressing, OR client owes a response >5 business days, OR known-deferred state (e.g., Russell trip outreach on hold).
- **On track:** Everything else with recent forward motion.

### Step 4 — Surface cross-project signal

After per-project synthesis, derive 3–5 cross-cutting observations:

- **Capacity flags:** Which weeks are over-loaded (multiple launches stacked)?
- **Q2 priority alignment:** Which active work moves priority #1/#2/#3, which is wrap-up?
- **Pipeline movement:** New leads, dead leads, hard-clock decisions hitting this week.
- **Repeat-pattern signal:** Multiple clients asking the same thing (e.g., trade-show materials → BrandOS Theme 7b demand).
- **Wiki decision velocity:** Which projects logged new ADRs / deferred decisions / log entries this week? Sustained wiki activity is a leading indicator of project momentum; wiki silence + active calendar is a signal to ask "what got decided that didn't get written down?"

### Step 5 — Output the brief

Print a Markdown brief in chat:

```
# Weekly Project Status — Week of {Monday date}

**Active projects: {N}. At risk: {X}. Blocked: {Y}. Decision needed: {Z}.**

## Decision needed / At risk / Blocked (handle first)
### {Project Name} — {Status}
- **Why:** {1-sentence evidence}
- **Next action:** {time-bounded}
- **Owner:** {who}
- **Deadline pressure:** {date or none}
- **Wiki:** {N active, M deferred; last decision {date}; {K} log entries in last 14d — or "no wiki"}
- **Flagged deferred decisions** (revisit triggers may have fired): {list filenames, or omit}

## On track
### {Project Name}
- **Next action:** {time-bounded}
- **Deadline pressure:** {date or none}
- **Wiki:** {one-line activity summary}

## Cross-project signal
- {observation 1}
- {observation 2}
- {observation 3}

## Wiki activity this week
- **{Project}:** {N new active, M new deferred, K log entries} — {1-line gist of what got locked}
- **{Project}:** ...

## Q2 priority check
- **Priority 1 (productize):** {projects moving this}, {projects neutral}, {projects against}
- **Priority 2 (BrandOS hub):** {...}
- **Priority 3 (business plan):** {...}

## This week's calendar load
- {date}: {event} — {project}
- {date}: {event} — {project}
```

### Step 6 — Archive the brief

After printing, write the same Markdown to `briefs/status-{YYYY-MM-DD}.md` (create `briefs/` folder if it doesn't exist). This enables week-over-week comparison and supports trend visibility.

Don't auto-prune old briefs. Use `archives/briefs/` if Justin wants to retire old ones.

## Output contract

Every run produces:

1. **One Markdown brief in chat** — at-risk first, on-track grouped, cross-project signal, Q2 alignment, calendar load.
2. **One archived brief file** — `briefs/status-{date}.md` for week-over-week comparison.

No other file writes. No outbound messages.

## Critical implementation rules

1. **Read-only on memory + decisions + wiki + Gmail + Calendar.** Only writes are to `briefs/status-{date}.md`. Never edit wiki files.
2. **Don't restate raw memory or wiki content verbatim.** Synthesize. The brief is a derived view.
3. **Don't include 2RM W-2 work.** 2RM calendar is visible for conflict-checking only per `connections.md`.
4. **Don't fabricate next actions.** If memory + decisions + wiki + email show no clear next move, say "next action unclear" and prompt Justin to decide.
5. **Don't auto-promote to-do items into memory or wiki.** Brief is ephemeral; durable state lives in memory, claude-os decisions log, and per-project wiki.
6. **Honor `status:` frontmatter.** Closed/killed/archived projects don't appear in the active list.
7. **Stay under ~90s wall-clock.** Cap per-project Gmail pulls at 10 threads. Cap calendar lookup at 14 days forward. **Wiki sampling is shallow** — read `decisions/index.md` + filenames + at most 5 recent files per section per project. Full wiki content is `/load-project`'s job, not this skill's.
8. **Wiki false-positive triggers are fine.** Step 2.5's deferred-decision trigger scan uses shallow heuristics. Flagging too eagerly is better than missing a relitigation moment. Justin filters on read.

## KPI tracking (Method spec)

- **Bucket:** Less cost (less juggling overhead) + More customers (visibility into named-prospect pipeline).
- **Metric:** Zero slipped open-follow-ups inside active windows. Specifically watch:
  - BrandOS 30-day window deadline: **2026-06-11** (10 dealers / $3,100 MRR)
  - Q2 priority window: **end of July 2026**
  - Superior Drone kill date: **2026-05-30**
  - Pyro Dakota Fest hard deadline: **mid-August 2026**
- **Baseline:** 2026-05-18 — open follow-ups currently untracked across the surface.
- **Re-evaluate:** end of first 4 Monday runs.

## Bike Method phasing

- **Phase 1 (current):** Manual run each Monday morning. Justin reads brief + acts.
- **Phase 2 (after 4 clean weeks):** Add a `.claude/settings.json` hook scheduling the run on Monday 7am CT. Brief lands ready when Justin opens his terminal.
- **Phase 3:** Brief auto-emails to `justin@beardedgingerdesigns.com` as a draft each Monday — readable from phone even without opening Claude Code.
- **Phase 4:** L3 supervised — skill auto-creates new memory file scaffolds for new projects detected in Gmail or Calendar (still requires Justin's review before contents are written).

Advance phases by explicit edit to the frontmatter `bike-method-phase` value. Do not auto-advance.

## First-run notes

The first run will reveal which `memory/project_*.md` files are **missing the `client:` / `project:` frontmatter keys** — those projects will be invisible to the skill. The recent commit `8f0c9d3 feat: canonical client/project registry` + `06fd4fc chore: add client/project frontmatter to existing markdown` suggests this is already in flight. If gaps surface, this skill output is exactly the prompt to backfill.

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
