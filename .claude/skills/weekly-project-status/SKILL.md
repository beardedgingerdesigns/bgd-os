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
3. **LLM-wiki activity per project** — `decisions/active/`, `decisions/deferred/`, recent `log/*.md` (or single `log.md`) in each project's wiki (when registered in `clients.yaml` `docs_paths:`). This is the **project-internal** decision record. Sampled by the `project-researcher` agent — see Step 2.
4. Gmail per project (last 7 days of inbound/outbound for the project's contacts)
5. Google Calendar (upcoming events tagged to project participants in the next 14 days)

Closes the second half of stated top pain in `context/about-me.md` ("keeping all concurrent projects in one place") and the Tier-1 project/task tracking domain gap from the AIOS audit — without adopting a 4th external system.

**Project wiki integration.** Justin is rolling the project wiki pattern out across every project. Going forward, project-internal decisions live in `{project-repo}/docs/wiki/decisions/` with lifecycle (active/deferred/implemented/superseded), not in `claude-os/decisions/log.md`. This skill samples each project's wiki for activity in the last 14 days and feeds that into the per-project synthesis — so "Thermal Kitchen status" reflects both what's in claude-os memory AND what just got locked in the Thermal Kitchen wiki. The skill stays **shallow** at the wiki (sampling, not full reads) to keep wall-clock under 90s and avoid context bloat. `/load-project` is the deep complement.

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

### Step 2 — Fan out to `project-researcher` agent (one per project, all in parallel)

For each active project from Step 1, dispatch one `project-researcher` agent. **All dispatches MUST go in a single message with multiple Agent tool calls** so they run concurrently — that's the whole point of the agent layer.

Prompt template per project:

```
slug: {project-slug}
mode: status
lookback: 7d
```

The agent (see `.claude/agents/project-researcher.md`) handles the per-project work:

- Resolves the project from `clients.yaml`
- Pulls matching `memory/project_*.md`
- Greps `decisions/log.md` for the project in the last 7 days
- Searches Gmail for thread activity over the project's contact domains
- Pulls calendar events touching project contacts in the next 14 days
- Samples the project's LLM-wiki (when registered in `docs_paths`) — `index.md`, decisions counts, recent decision/log entries, fired revisit triggers

Each agent returns a single structured block:

```
**{Project Name}** — {On track | At risk | Blocked | Decision needed}
Why: {1 sentence}
Next: {time-bounded action} ({owner})
Deadline: {date or "none"}
Email: {summary}
Calendar: {summary}
Wiki: {summary}
Flagged deferred: {list if any}
```

**Agent failure modes** the parent skill must handle:
- `NOT_FOUND: no project with slug={slug} in clients.yaml` — slug enumeration drift from Step 1; drop the row and add a one-line note in Step 4 ("Step 1 surfaced slug `{slug}` but it's not in clients.yaml — registry needs sync").
- `ERROR: ...` — pass through into the brief as a row labeled `Error` so it's visible.

If a project has multiple memory files spanning multiple distinct slugs in `clients.yaml`, dispatch one agent per slug, not one per memory file. The agent is project-scoped, not memory-file-scoped.

**Status heuristics** are encoded in the agent — Blocked / Decision needed / At risk / On track. Trust the agent's verdict.

### Step 3.5 — Prospect Pipeline Scan

Scan all files in `prospects/` directory (excluding `converted/` subdirectory). For each prospect doc:
1. Read YAML frontmatter
2. If `status` is `active` or `warm`: include in pipeline table
3. Extract: slug (from filename), display name (from H1 heading), status, last_activity, contact count (from frontmatter contacts map), next steps (first 2 bullets from Next Steps section)
4. Check `status_changed_at`: if within past 7 days and `previous_status` was a higher-activity status, flag as recently cooled

If zero active/warm prospects: skip the Prospect Pipeline section entirely in the output (D-17). No empty tables.

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
- **Wiki:** {agent's Wiki line, passed through — shape varies by wiki layout}
- **Flagged deferred decisions** (revisit triggers may have fired): {list filenames, or omit}

## On track
### {Project Name}
- **Next action:** {time-bounded}
- **Deadline pressure:** {date or none}
- **Wiki:** {agent's Wiki line}

## Prospect Pipeline
{Only include this section when active/warm prospects exist in prospects/ directory. Omit entirely if none (D-17).}

| Prospect | Status | Last Activity | Contacts | Next Steps |
|----------|--------|---------------|----------|------------|
| {display_name} | {status} | {last_activity} | {count} | {first next step from Next Steps section} |

Cold/Dead: {count} (not shown above)
{If any prospect status changed in the past 7 days:}
⚠ Recently cooled: {slug} went {status} on {status_changed_at} (was {previous_status})

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

1. **Read-only.** Per-project reading happens inside `project-researcher` agents (Read, Grep, Glob, Gmail, Calendar). The only writes this skill performs are to `briefs/status-{date}.md`. Never edit wiki files.
2. **Don't restate the agent's raw output verbatim in the brief.** The agent emits structured blocks; the skill assembles them, groups by status, and adds cross-project signal.
3. **Don't include 2RM W-2 work.** 2RM calendar is visible for conflict-checking only per `connections.md`. The agent strips 2RM events; double-check before they land in the calendar-load section.
4. **Don't fabricate next actions.** The agent returns `next action unclear; needs Justin's decision` when the data doesn't support a confident call. Pass that through verbatim — don't backfill.
5. **Don't auto-promote to-do items into memory or wiki.** Brief is ephemeral; durable state lives in memory, claude-os decisions log, and per-project wiki.
6. **Honor `status:` frontmatter.** Filter `paused` / `closed` / `killed` / `archived` projects out of the active list before dispatching the agent. The agent will still run if dispatched (and prefix `[STATUS=...]`) — this rule keeps the parent from spawning agents for closed work.
7. **Dispatch agents in parallel — one message, many Agent calls.** Sequential dispatch defeats the purpose of the agent layer. Wall-clock should be ~one agent's runtime (≈30s), not N × 30s.
8. **Wiki false-positive triggers are fine.** The agent's deferred-decision revisit scan uses shallow heuristics. Flagging too eagerly is better than missing a relitigation moment. Justin filters on read.

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
