# Phase 8: Scheduled Triage Automation - Research

**Researched:** 2026-06-08
**Domain:** Claude Code scheduling (Desktop scheduled tasks), Claude Code skill authoring, Gmail MCP, filesystem write patterns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use Claude Code `/schedule` to create the cron-style routine. Runs as a remote agent on Anthropic's infra — fires even when laptop is closed.
- **D-02:** Waking hours defined as 7am-9pm CT, weekdays only (Mon-Fri). Weekends remain manual-trigger only.
- **D-03:** First morning run (7am) uses a wider lookback window to cover overnight + any weekend gap. Mid-day runs scan only since the last run.
- **D-04:** Output lands in a cache file AND a push notification summary is sent via PushNotification tool (e.g. "3 threads need replies — highest priority: Pyro check-in"). File is the persistent record; notification is the nudge.
- **D-05:** Draft replies are full, ready-to-send emails matching `references/voice.md` register. Review-and-send, not write-from-scratch.
- **D-06:** Drafts are created as actual Gmail drafts via the Gmail MCP `create_draft` tool on the thread. Open Gmail and it's sitting there ready to send.
- **D-07:** Before appending a new to-do, scan `todos/pending.md` for similar items (same client + similar description). Skip duplicates to prevent pile-up from recurring threads.
- **D-08:** Each dispatched thread gets its own file in the matched project wiki's `raw/aios/` (e.g. `capture-2026-06-08-pyro-trade-show-materials.md`). One file per thread, not batched.
- **D-09:** Multi-project threads dispatch to ALL matched projects. Each wiki gets the full thread context. Some duplication accepted to avoid missed intelligence.
- **D-10:** Dispatched files use YAML frontmatter with structured metadata (thread ID, sender, date, subject, matched contacts, urgency). Body is a summary of the project-relevant content, not raw email text.

### Claude's Discretion

- **Draft coverage threshold:** Lean toward explicit commitments and clear reply-needed signals, skipping newsletters/notifications/no-reply senders. Urgency and age are good tiebreakers.
- **Action item extraction threshold:** Lean toward explicit commitments and concrete requests over soft suggestions.
- **Action item priority assignment:** Auto-assign priority using urgency cues (deadline mentions = high, routine requests = medium, soft suggestions = low).
- **Dispatch metadata balance:** Frontmatter should enable programmatic filtering; body should give the wiki ingest pipeline enough context to classify.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRIAGE-01 | Triage runs as a scheduled routine (~2hr intervals during waking hours), not a manually triggered skill | Desktop scheduled tasks with custom cron expression; 5 separate schedule entries cover 7am-9pm CT weekday window |
| TRIAGE-02 | Triage output includes ranked email threads with inline draft replies ready for revision | New SKILL.md derives from existing daily-inbox-triage; Step 6 becomes unconditional (all reply-needed threads get a draft); `mcp__claude_ai_Gmail__create_draft` is the write tool |
| TRIAGE-03 | Triage extracts persistent action items (to-do list) from email content | Append to `todos/pending.md` using existing checkbox/metadata format; dedupe gate reads the file first |
| TRIAGE-04 | Triage auto-generates dispatch handoffs to project wikis when emails contain project-relevant intelligence | `writeRawDrop` with new `triage-dispatch` kind; uses `resolveProjectWikiPath` + `clients.yaml` contact matching |
| TRIAGE-05 | Dispatch filter uses heuristic categories first, LLM tiebreaker for ambiguous cases | Phase 7 `classifyContent()` in `content-classifier.ts` already exists; triage dispatch is its `'triage-dispatch'` source case |

</phase_requirements>

## Summary

Phase 8 promotes the manual `/daily-inbox-triage` skill into a fully automated, scheduled routine. The automation layer has three components: (1) a Claude Code Desktop scheduled task that fires at ~2hr intervals during waking hours using multiple cron entries, (2) an enhanced skill definition (`scheduled-triage.md`) that expands the existing triage logic with unconditional draft creation, persistent to-do extraction, and wiki dispatch, and (3) light TypeScript additions to the aios-ui cache layer to record last-run timestamps so mid-day runs can compute a "since last run" lookback window.

The scheduling decision (D-01) specifies Claude Code `/schedule`. Research confirmed this creates either a cloud Routine (runs on Anthropic infra, laptop can be closed) or a Desktop scheduled task (runs on local machine, app must be open). The critical constraint: **cloud Routines have a minimum interval of 1 hour and cannot access local files** — they work from a fresh git clone. Desktop scheduled tasks support 1-minute minimum intervals and have full local filesystem access. For this phase, local filesystem access to `todos/pending.md`, project wiki paths, and `triage-overrides.json` is required. **This means Desktop scheduled tasks are the correct mechanism, not cloud Routines**, even though D-01 mentions "fires even when laptop is closed." The CONTEXT.md discussion likely predates this constraint becoming clear. The planner should surface this tradeoff.

The existing `daily-inbox-triage/SKILL.md` provides a reusable foundation for Steps 1-5 (thread pulling, filtering, scoring, memory context). Phase 8 creates a new skill file (`scheduled-triage/SKILL.md`) that inherits this logic and adds: dynamic lookback window computation (reading `triage-latest.json` to calculate "since last run"), unconditional draft creation for all reply-needed threads, action item extraction with dedup check, and wiki dispatch.

Zero new npm packages are needed. The dispatch write path reuses `writeRawDrop` from `lib/raw-drops.ts` with a new `RawDropKind` value (`'triage-dispatch'`). The Phase 7 `classifyContent()` classifier already has the `'triage-dispatch'` source type in its interface but this is the first phase that populates it.

**Primary recommendation:** Create the scheduled routine as a Desktop scheduled task (not a cloud Routine) using custom cron expressions for each waking-hours firing time. The routine runs the new `scheduled-triage` skill, which handles all output expansion internally. The cache layer records `ranAt` on each run; the skill reads this to compute the dynamic lookback window.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schedule trigger | Desktop scheduled task | -- | Needs local file access (todos/pending.md, wiki paths, triage-overrides.json) |
| Lookback window computation | Claude Code skill | -- | Reads `triage-latest.json` to determine how far back to search |
| Gmail thread fetch + filter | Claude Code skill (via MCP) | -- | Gmail MCP tools are MCP-tier; skill orchestrates them |
| Thread scoring + ranking | Claude Code skill | -- | Pure logic in skill prompt; no UI involvement |
| Draft reply creation | Claude Code skill (via MCP) | -- | `mcp__claude_ai_Gmail__create_draft` writes to Gmail |
| Action item extraction + dedup | Claude Code skill | -- | Reads `todos/pending.md`, appends new items; filesystem write |
| Wiki dispatch file write | Claude Code skill | API/Backend | Skill writes directly to wiki `raw/aios/`; no API route needed for scheduled context |
| Triage cache update | API/Backend (Next.js route) OR skill direct write | -- | Current pattern: POST /api/triage/run → `writeTriageCache`. Scheduled routine bypasses the API route; writes cache directly |
| Push notification | Claude Code skill (PushNotification tool) | -- | Built-in Claude Code tool; available in Desktop task sessions |
| Classification gate (dispatch routing) | Skill (calling classifyContent indirectly) | -- | Phase 7 classifier already handles triage-dispatch source type |

## Standard Stack

### Core (already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Desktop scheduled tasks | v2.1.72+ | Waking-hours routine scheduler | Only scheduling mechanism with local file access AND minimum 1-min interval [VERIFIED: code.claude.com/docs/en/desktop-scheduled-tasks] |
| `mcp__claude_ai_Gmail__search_threads` | -- | Pull candidate inbox threads | Existing MCP integration, confirmed connected via `claude mcp list` [VERIFIED: codebase] |
| `mcp__claude_ai_Gmail__get_thread` | -- | Fetch thread bodies for scoring + context | Already used by daily-inbox-triage [VERIFIED: codebase SKILL.md] |
| `mcp__claude_ai_Gmail__create_draft` | -- | Create actual Gmail draft for each reply | Already referenced in daily-inbox-triage output contract [VERIFIED: codebase SKILL.md] |
| `writeRawDrop` | -- | Write dispatched intelligence to wiki `raw/aios/` | Existing helper in `aios-ui/lib/raw-drops.ts`; handles dir creation, collision suffix, path escape guard [VERIFIED: codebase] |
| `resolveProjectWikiPath` | -- | Resolve client/project slug to wiki root path | Existing function in `aios-ui/lib/data/wiki.ts`; reads clients.yaml docs_paths [VERIFIED: codebase] |
| `classifyContent` | -- | Heuristic classifier for triage dispatch routing | Existing in `aios-ui/lib/content-classifier.ts` (Phase 7); `'triage-dispatch'` source type already in interface [VERIFIED: codebase] |
| `PushNotification` tool | v2.1.110+ | Desktop + phone notification on run completion | Built-in Claude Code tool; available in Desktop scheduled task sessions [VERIFIED: code.claude.com/docs/en/tools-reference] |

### Supporting (no new packages needed)

This phase introduces **zero new npm dependencies**. All logic lives in the new SKILL.md and thin TypeScript additions to existing modules.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Desktop scheduled tasks | Cloud Routines (`/schedule` CLI) | Cloud Routines cannot access local files — `todos/pending.md`, wiki paths, `triage-overrides.json` all live on local filesystem. Cloud Routines work from a fresh git clone only. Desktop tasks are correct for this workload. |
| Desktop scheduled tasks | `/loop` in-session cron | `/loop` is session-scoped and dies when the session closes. Desktop tasks survive app restarts and run independently of open sessions. |
| 5 separate cron entries (waking hours) | Single cron + runtime gate | A single `*/2` every-2h entry would fire overnight and on weekends too. The runtime gate approach (check current time, exit early if outside waking hours) works but wastes a run slot. Separate cron entries are cleaner and the Desktop task UI supports custom expressions. |

**Installation:** No new installs. Use existing `claude` CLI: create tasks via Desktop app Routines page or by asking Claude in a Desktop session.

## Package Legitimacy Audit

No external packages are installed in this phase. All dependencies are already present in the codebase.

## Architecture Patterns

### System Architecture Diagram

```
Desktop Scheduled Task (fires at cron times)
  e.g.: 0 7 * * 1-5  (7am CT weekdays)
        0 9 * * 1-5  (9am CT weekdays)
        0 11 * * 1-5 (11am CT weekdays)
        0 13 * * 1-5 (1pm CT weekdays)
        0 15 * * 1-5 (3pm CT weekdays)
        0 17 * * 1-5 (5pm CT weekdays)
        0 19 * * 1-5 (7pm CT weekdays)
                |
                v
      /scheduled-triage skill runs
                |
    +-----------+-----------+
    |                       |
    v                       v
Read triage-latest.json    Read triage-overrides.json
(compute lookback window)  (skip overridden threads)
    |
    v
Gmail search_threads (newer_than: <lookback>)
    |
    v
Filter + Score threads (Steps 2-3 from daily-inbox-triage)
    |
    v
For each qualifying thread:
    |
    +--> create_draft via Gmail MCP         (TRIAGE-02)
    |    (voice.md register, project context)
    |
    +--> Extract action items               (TRIAGE-03)
    |    Read todos/pending.md
    |    Dedup check (same client + similar desc)
    |    Append new items (pending checkbox format)
    |
    +--> Classify for wiki dispatch         (TRIAGE-04/05)
         source='triage-dispatch'
         match contacts against clients.yaml
         writeRawDrop to each matched wiki's raw/aios/
         kind='triage-dispatch', YAML frontmatter + summary body
                |
                v
      Write updated triage-latest.json
      (ranAt timestamp + output markdown)
                |
                v
      PushNotification: "N threads need replies — highest: {subject}"
```

### Recommended Project Structure

```
.claude/skills/
  scheduled-triage/
    SKILL.md              # NEW: scheduled triage skill definition
aios-ui/
  lib/
    types.ts              # EDIT: add 'triage-dispatch' to RawDropKind
    cache/
      triage.ts           # EDIT: re-export triageCachePath() for skill access
    data/
      clients.ts          # EXISTING: getProject, getAllProjects — used for contact matching
```

### Pattern 1: Desktop Scheduled Task Definition

**What:** A task stored at `~/.claude/scheduled-tasks/<name>/SKILL.md` that Claude Code Desktop runs on a cron schedule with full local file access.

**When to use:** Any recurring automation that needs to read or write local files. Cannot use cloud Routines for this.

**How to create:**
- Open Claude Code Desktop, click Routines in sidebar, New routine, choose Local.
- Or ask Claude in a Desktop session: "Schedule a task to run /scheduled-triage at 7am, 9am, 11am, 1pm, 3pm, 5pm, and 7pm on weekdays."
- Or use the `/schedule` CLI command in a Desktop session (creates local tasks, not cloud Routines, when the Desktop app is running).

**Key behavior differences from cloud Routines [VERIFIED: code.claude.com/docs/en/scheduled-tasks]:**

| Property | Desktop Task | Cloud Routine |
|----------|-------------|---------------|
| Local file access | Yes | No (fresh clone only) |
| Minimum interval | 1 minute | 1 hour |
| Runs when laptop closed | No | Yes |
| MCP servers | Config files + connectors | Connectors only |
| PushNotification tool | Yes | Yes |

**Waking hours cron expressions (CT = UTC-5 in winter, UTC-6 in summer):**

CT is currently CDT (UTC-5). Desktop tasks run in local timezone [VERIFIED: docs], so cron expressions use local time directly:

```
0 7 * * 1-5    # 7am CT weekdays (morning briefing)
0 9 * * 1-5    # 9am CT weekdays
0 11 * * 1-5   # 11am CT weekdays
0 13 * * 1-5   # 1pm CT weekdays
0 15 * * 1-5   # 3pm CT weekdays
0 17 * * 1-5   # 5pm CT weekdays
0 19 * * 1-5   # 7pm CT weekdays (last run)
```

This gives 7 runs per weekday covering 7am-9pm CT at ~2hr intervals. The single Desktop task can have multiple schedule triggers, or this can be structured as one task that uses a single `0 */2 7-19 * 1-5` expression (every 2 hours between 7am-7pm on weekdays). The `*/2` approach is cleaner but the exact cron UI for Desktop tasks may require asking Claude to set it.

**Simpler single cron option:**
```
0 */2 7-19 * 1-5   # Every 2 hours from 7am to 7pm, weekdays only
```
This fires at 7, 9, 11, 13, 15, 17, 19 — exactly the right 7 runs. Verify this cron expression is accepted by Desktop task's custom schedule. The 5-field `CronCreate` spec (for in-session `/loop`) and the Desktop task scheduler both accept standard 5-field cron; the hour range `7-19` combined with `*/2` is valid standard cron.

### Pattern 2: Dynamic Lookback Window (D-03 Implementation)

**What:** The skill reads `triage-latest.json` before calling Gmail to determine how far back to search.

**When to use:** Every scheduled triage run to avoid re-processing already-triaged threads.

**Example skill logic:**

```markdown
### Step 0 — Compute lookback window

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json`.
- If the file does not exist or `exitCode !== 0`: use a 14-day lookback (first run or last run failed).
- If `ranAt` is today before 8am local time (first run of day): use since yesterday 7pm CT.
  - This covers the overnight gap (last evening run to this morning).
- If `ranAt` is within the past 3 hours: use `newer_than:4h` (buffer to avoid gap at edges).
- Otherwise: compute elapsed hours since `ranAt`, add 1 hour buffer, use `newer_than:<N>h`.

Special case — Monday 7am: `ranAt` will be from Friday evening. Use `newer_than:64h` (Friday 7pm to Monday 7am = 60 hours; add 4h buffer).
```

**Gmail newer_than syntax [ASSUMED]:** Gmail search accepts `newer_than:Nh` (N hours) and `newer_than:Nd` (N days). The existing skill uses `newer_than:14d`. The scheduled skill can use dynamic values like `newer_than:3h` or `newer_than:14d` for the first run.

### Pattern 3: Triage Dispatch File Format (D-08, D-10)

**What:** Each dispatched email thread becomes one file in the matched wiki's `raw/aios/`, following ADR 0004 conventions.

**New `RawDropKind` value:** Add `'triage-dispatch'` to the union in `aios-ui/lib/types.ts`:

```typescript
// Current: 'capture' | 'chat-decision' | 'chat-session'
export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session' | 'triage-dispatch'
```

**File naming:** `triage-dispatch-YYYY-MM-DD-<slug>.md` — consistent with ADR 0004 `<kind>-YYYY-MM-DD-<slug>.md` convention. Slug derived from email subject (slugified). [VERIFIED: codebase raw-drops.ts]

**YAML frontmatter structure (D-10):**

```yaml
---
kind: triage-dispatch
thread_id: <Gmail thread ID>
sender: <sender email>
sender_name: <sender display name from header>
date: YYYY-MM-DD
subject: <email subject>
matched_contacts:
  - <email addresses that triggered the match>
matched_projects:
  - <project slugs>
urgency: high | medium | low
score: <numeric triage score>
---
```

**Body:** A 3-5 sentence summary of the project-relevant content. Not the raw email text. Focus on: what was asked/told, what's the action if any, relevant dates mentioned.

### Pattern 4: To-Do Extraction with Dedup (D-07)

**What:** The skill reads `todos/pending.md`, checks for similar items, and appends new ones.

**Dedup heuristic:** Before appending, scan the `## Pending` section for items where:
- `Client:` slug matches the current thread's resolved client slug, AND
- Summary text overlaps significantly (same subject line root, same type of request)

If a match is found within the last 7 days (by `Added:` date), skip the new item. Age limit prevents legitimate recurring requests (e.g., monthly check-in tasks) from being silently deduped forever.

**Append format [VERIFIED: codebase todos/pending.md]:**

```markdown
- [ ] **<Bold action summary>** `#<category>`
  - Added: YYYY-MM-DD
  - Source: triage
  - Client: <client-slug> / <project-slug>
  - Priority: high | medium | low
  - Notes: Re: <email subject> from <sender name>
```

### Anti-Patterns to Avoid

- **Creating a cloud Routine for this phase:** Cloud Routines cannot access `todos/pending.md`, wiki `raw/aios/` directories, or `triage-overrides.json`. These are local filesystem paths. The decision in CONTEXT.md (D-01: "fires even when laptop is closed") is aspirationally correct but technically incompatible with the filesystem dependencies in this phase. Surface this tradeoff to Justin — the pragmatic answer is Desktop task now, and a future phase could extract the filesystem outputs to git-committed files that a cloud Routine could write to via git push.

- **Modifying the existing `/daily-inbox-triage` SKILL.md directly:** The manual skill and the scheduled skill have different output contracts. Manual skill: never auto-drafts without confirmation. Scheduled skill: always auto-drafts. Overwriting the existing SKILL.md breaks the manual use case. Create a new skill `scheduled-triage/SKILL.md` that inherits the triage logic.

- **Writing action items without reading the current pending.md first:** The dedup check (D-07) requires reading the file before appending. A skill that appends without checking will create stacks of duplicate items from recurring threads. The file read must happen in the same skill invocation as the write.

- **Batching multiple dispatched threads into one raw/aios/ file:** D-08 explicitly requires one file per thread. Batching would violate the ADR 0004 immutability model (can't revise a batch when only one thread needs re-processing) and confuse the wiki ingest evaluator.

- **Using `newer_than:2h` as a fixed lookback:** The interval between runs is approximately 2 hours but not exact. The Desktop task scheduler adds a small stagger delay, and runs can be skipped if the app is closed. Reading `ranAt` from `triage-latest.json` and computing elapsed time is safer than a fixed window.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schedule waking-hours-only runs | Complex runtime time-check gate | Multiple cron entries OR `0 */2 7-19 * 1-5` single expression | Cron handles the time window natively; runtime gate adds failure modes |
| Gmail draft creation | Custom email formatting | `mcp__claude_ai_Gmail__create_draft` | Already wired, already authenticated, already the pattern in daily-inbox-triage |
| Wiki dispatch write | Custom file write with path math | `writeRawDrop` from `lib/raw-drops.ts` | Has path escape guard, collision suffix, dir creation — all tested |
| Contact-to-project matching | New lookup table | `clients.yaml` `contacts:` arrays + existing lookup logic in `aios-ui/lib/data/clients.ts` | Already the canonical source; weekly-project-status and daily-inbox-triage both use it |
| Duplicate detection | Edit distance / fuzzy match | Simple field-equality check (same client slug + overlapping subject root within 7 days) | Good enough; avoids over-engineering a problem that needs one heuristic |

**Key insight:** Every write surface, lookup function, and cache format this phase needs already exists. The work is orchestrating them in a new SKILL.md and adding a thin `RawDropKind` extension.

## Common Pitfalls

### Pitfall 1: Cloud Routine vs. Desktop Task Confusion

**What goes wrong:** The phase creates a cloud Routine (via `/schedule` CLI without the Desktop app open) instead of a Desktop scheduled task. The cloud Routine cannot read `todos/pending.md`, project wiki directories, or `triage-overrides.json` because these are local filesystem paths not in the git repository.

**Why it happens:** The CONTEXT.md decision (D-01) says "fires even when laptop is closed" — which sounds like cloud Routines. But the actual filesystem dependencies require local access.

**How to avoid:** Always create the task from the Desktop app Routines page (New routine → Local). Verify by checking `~/.claude/scheduled-tasks/` for the task file after creation.

**Warning signs:** The task runs without errors but `todos/pending.md` is never written to, and no wiki dispatch files appear. This means the task ran in a cloud context without local file access.

### Pitfall 2: Stale Lookback Window on Weekend Gap

**What goes wrong:** Monday morning 7am run checks `triage-latest.json`, sees `ranAt` from Friday 7pm, computes ~62 hours, but Gmail's `newer_than:` only accepts whole number values. Using `newer_than:62h` may not be supported — Gmail may only support days or small hour values.

**Why it happens:** Gmail's `newer_than:` syntax is documented for `Nd` (days) and `Nh` (hours) but specific large hour values may not behave as expected.

**How to avoid:** For the Monday 7am run, detect that `ranAt` is more than 24 hours ago and use `newer_than:3d` (3 days) to safely cover the weekend gap plus Friday evening. The 14-day default for the very first run is already correct as a fallback.

**Warning signs:** Monday morning run shows "Inbox is clean" despite weekend emails.

### Pitfall 3: Action Item Dedup Kills Legitimate Recurring Tasks

**What goes wrong:** The dedup gate (D-07) skips adding a new to-do for a thread that's a legitimate recurring monthly check-in — e.g., the Pyro 2pm Friday call generates a new action item every month but the dedup check sees a matching item from last month and skips it.

**Why it happens:** The dedup logic doesn't account for the age of the existing item. An item completed 3 weeks ago might have been moved to `completed.md`, but if it hasn't been, the new check finds it and skips.

**How to avoid:** The dedup check should only apply to items added in the last 7 days. Items older than 7 days are not considered duplicates regardless of similarity. Also consider checking `todos/pending.md` only (not `completed.md`) — if the old item was completed and moved, it's gone from the dedup pool.

**Warning signs:** Legitimate monthly recurring tasks stop appearing in the to-do list.

### Pitfall 4: Desktop Task Session Has Different MCP Tool Names

**What goes wrong:** The SKILL.md references `mcp__claude_ai_Gmail__create_draft` by exact tool name, but the Desktop scheduled task session loads MCP tools differently than an interactive session.

**Why it happens:** Desktop tasks load connectors from config files + the claude.ai account connectors [VERIFIED: docs]. The Gmail connector is confirmed available (`claude mcp list` shows `claude.ai Gmail: Connected`). Tool names should be consistent since they come from the same MCP server.

**How to avoid:** Confirm tool names are consistent by verifying the MCP tool list in a Desktop task debug run. The tool name pattern `mcp__claude_ai_Gmail__<operation>` is used throughout the existing daily-inbox-triage skill, which runs via subprocess from the same session context.

**Warning signs:** Task fails with "tool not found" errors for Gmail tools. Fix: verify the Gmail connector is included in the Desktop task's connector list.

### Pitfall 5: triage-latest.json Written by API Route, Not Skill

**What goes wrong:** The current write path is: AIOS UI POST `/api/triage/run` → `runDailyIngest` subprocess → `writeTriageCache`. The scheduled task runs the skill directly, not through the API route. If the skill doesn't write `triage-latest.json`, the lookback window computation breaks.

**Why it happens:** The scheduled task is not an HTTP client hitting the Next.js API. It runs the skill as a standalone Claude Code session. The `writeTriageCache` call in `route.ts` won't fire.

**How to avoid:** The scheduled triage skill must write `triage-latest.json` directly using the Edit or Write tool (filesystem write). The cache file path is deterministic: `aios-ui/.aios-cache/triage-latest.json` relative to the project root. The format is `{ ranAt, output, exitCode, durationMs }` [VERIFIED: codebase `aios-ui/lib/types.ts`].

**Warning signs:** Lookback window always defaults to 14d (first-run mode) because `ranAt` never gets updated.

## Code Examples

### Example 1: RawDropKind Extension

```typescript
// aios-ui/lib/types.ts
// Add 'triage-dispatch' to the existing union:
export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session' | 'triage-dispatch'
```

### Example 2: Triage Dispatch File Body

```markdown
---
kind: triage-dispatch
thread_id: 18f3a2b1c4d5e6f7
sender: CherityS@terraplexag.com
sender_name: Cherity S.
date: 2026-06-08
subject: "Re: Marketing materials for Dakota Fest"
matched_contacts:
  - CherityS@terraplexag.com
matched_projects:
  - terraplex-hub
urgency: medium
score: 9
---

Cherity asked for confirmation that the Pyro Ag co-branded marketing materials
will be ready before Dakota Fest in mid-August. She referenced the June 5 monthly
call where Justin said he'd follow up. No hard deadline given but mid-August
event is the implicit deadline. Action: confirm timeline for marketing material
delivery and loop in the dealer channel workflow.
```

### Example 3: Triage Cache Write in Skill

The skill must write this file directly since the scheduled task doesn't go through the API route:

```
File path: /Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json
Contents:
{
  "ranAt": "<ISO timestamp of this run>",
  "output": "<full markdown output from this run>",
  "exitCode": 0,
  "durationMs": <elapsed ms>
}
```

### Example 4: Skill Lookback Window Logic (Pseudocode)

```markdown
### Step 0 — Compute lookback window

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json`.

If file missing or exitCode !== 0:
  → lookback = "14d"
  → mode = "first_run"
Else:
  elapsed_hours = (now - ranAt) / 3600000
  If elapsed_hours > 48:
    → lookback = "3d"  (weekend/holiday gap)
    → mode = "morning_briefing"
  Else if elapsed_hours > 12:
    → lookback = "14h"  (overnight run — today's 7am covers yesterday 5pm)
    → mode = "morning_briefing"
  Else:
    → lookback = str(ceil(elapsed_hours) + 1) + "h"  (mid-day run with buffer)
    → mode = "midday_check"

Use lookback in Gmail search: `in:inbox -in:draft newer_than:{lookback} ...`
```

### Example 5: Push Notification Format

```
PushNotification call:
  title: "Inbox Triage — {N} threads need reply"
  body: "Highest priority: {top thread subject} ({client name}, {days waiting}d)"
```

Keep the notification short enough to read at a glance. If 0 threads qualify, still send: "Inbox clear as of {time}."

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `/daily-inbox-triage` run | Desktop scheduled task fires automatically | Phase 8 (this phase) | Triage becomes ambient infrastructure, not a ritual |
| Draft replies on-demand (ask first) | All reply-needed threads get auto-drafts | Phase 8 (this phase) | Justin opens Gmail and drafts are waiting |
| Action items ad hoc / not recorded | Persistent extraction to `todos/pending.md` | Phase 8 (this phase) | No more mental tracking of "I owe X a response about Y" |
| Email intelligence siloed in triage | Dispatched to project wikis via `raw/aios/` | Phase 8 (this phase) | Project context improves over time automatically |

**Deprecated/outdated:**
- The manual skill's Step 6 "ask before drafting" flow is replaced in the scheduled variant by always drafting. The manual skill remains unchanged for ad-hoc use.

## Scheduling Architecture: Cloud vs. Desktop

This is the most important planning decision for Phase 8. The research reveals a clear constraint that the CONTEXT.md discussion did not fully anticipate.

**Cloud Routines (what D-01 implies):**
- Created via `/schedule` CLI or claude.ai/code/routines
- Minimum interval: 1 hour [VERIFIED: code.claude.com/docs/en/routines]
- Local file access: No — runs from a fresh git clone [VERIFIED: code.claude.com/docs/en/scheduled-tasks comparison table]
- Runs when laptop is closed: Yes
- MCP connectors: Cloud-hosted connectors only (Gmail connector is available)

**Desktop Scheduled Tasks (required for this phase):**
- Created via Desktop app Routines page or asking Claude in a Desktop session
- Minimum interval: 1 minute [VERIFIED: code.claude.com/docs/en/desktop-scheduled-tasks]
- Local file access: Yes — full access to local filesystem [VERIFIED: same source]
- Runs when laptop is closed: No — requires Desktop app open and machine awake
- MCP connectors: Config files + cloud connectors [VERIFIED: same source]

**Why this phase requires Desktop tasks:** `todos/pending.md`, all project wiki `raw/aios/` directories, and `triage-overrides.json` are local filesystem paths not tracked in the `claude-os` git repository. A cloud Routine cannot reach them.

**The path to cloud Routines (future phase consideration):** If these files were committed to git (e.g., `todos/pending.md` is checked in, `triage-overrides.json` is committed), a cloud Routine could read them via the cloned repo and push changes back via git. This would require: (1) committing `todos/pending.md` and `triage-overrides.json` to the repo, (2) having the routine commit its changes and push to a branch, (3) the local machine pulling those changes. This is a meaningful architecture change that belongs in a future phase — not here.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Gmail `newer_than:Nh` supports large hour values (e.g., `newer_than:62h`) | Common Pitfalls / Pitfall 2 | If not supported, use `newer_than:3d` for weekend gap. Minimal risk — the fallback covers it |
| A2 | Desktop scheduled task sessions can write to arbitrary local filesystem paths including wiki repos at `/Users/justinlobaito/repos/` | Architecture Patterns | If Desktop tasks sandbox the filesystem, this phase cannot dispatch to project wikis. Would need to verify with a test run |
| A3 | `PushNotification` tool is available in Desktop scheduled task sessions (not just cloud sessions) | Architecture Patterns | Docs say "desktop notification" for PushNotification; phone push requires Remote Control. The desktop notification part should work. |
| A4 | The Gmail `create_draft` tool requires `thread_id` to attach the draft to the correct thread | Code Examples | If the API requires a `message_id` instead of `thread_id`, the draft may not appear in the right thread |
| A5 | The triage-overrides.json file at `aios-ui/.aios-cache/triage-overrides.json` is accessible from a Desktop task session's working directory | Architecture Patterns | The skill reads this via absolute path — should be fine if Assumption A2 holds |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions (RESOLVED)

1. **Cloud Routine vs. Desktop Task tradeoff** — RESOLVED: Desktop task. Filesystem dependencies (todos/pending.md, wiki raw/aios/, triage-overrides.json) require local access. Cloud Routines work from a fresh git clone and cannot reach these paths. Tradeoff (runs skip when laptop sleeps) is documented in Plan 03 and surfaced to operator.

2. **Single task with complex cron vs. multiple tasks** — RESOLVED: Single cron `0 7-19/2 * * 1-5` with 7-separate-tasks fallback if the scheduler rejects the expression. Plan 03 Task 1 implements this with the fallback explicitly documented.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Claude Code Desktop app | Desktop scheduled task creation | Must verify | -- | Use CLI `/schedule` in a Desktop session |
| Gmail MCP connector | Thread fetch, draft creation | Connected | -- | N/A — core dependency |
| Google Calendar MCP | Morning briefing (optional context) | Connected | -- | Skip calendar context if needed |
| `todos/pending.md` | Action item extraction | Exists | -- | N/A (Phase 6 created it) |
| Project wiki `raw/aios/` dirs | Dispatch writes | Exist (verified for wild-rose, inside-out, iowa-everywhere, brandos, mr-gym) | -- | `writeRawDrop` creates `raw/aios/` dir if missing [VERIFIED: codebase] |
| `triage-overrides.json` | Thread filtering | Exists (verified) | -- | Default to `{}` if missing (existing pattern) |
| `triage-latest.json` | Lookback window | Exists (last run 2026-06-02) | -- | Default to 14d lookback if missing |

**Missing dependencies with no fallback:** None.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `aios-ui/vitest.config.ts` |
| Quick run command | `cd /Users/justinlobaito/repos/claude-os/aios-ui && npx vitest run --reporter=verbose` |
| Full suite command | `cd /Users/justinlobaito/repos/claude-os/aios-ui && npm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRIAGE-01 | Desktop task SKILL.md exists at `~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` | smoke (file existence) | `ls ~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` | Wave 0 |
| TRIAGE-02 | Draft creation step present in scheduled-triage SKILL.md (unconditional, not behind a gate) | smoke (content check) | `grep -c "create_draft" ~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` | Wave 0 |
| TRIAGE-03 | To-do extraction logic appends items with correct format to `todos/pending.md` | manual (skill run) | Run the skill against a test thread; verify append format | manual |
| TRIAGE-03 | `RawDropKind` includes `'triage-dispatch'` | unit | `cd aios-ui && npx vitest run tests/lib/raw-drops.test.ts -x` | Extend existing |
| TRIAGE-04 | Dispatch file written to correct `raw/aios/` dir | unit | `cd aios-ui && npx vitest run tests/lib/raw-drops.test.ts -x` | Extend existing |
| TRIAGE-04 | Dispatch file has required YAML frontmatter fields | unit | Same test file | Extend existing |
| TRIAGE-05 | `classifyContent` with `source: 'triage-dispatch'` follows heuristic rules | unit | `cd aios-ui && npx vitest run tests/lib/content-classifier.test.ts -x` | Existing (add cases) |

### Sampling Rate

- **Per task commit:** `cd aios-ui && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd aios-ui && npm test`
- **Phase gate:** Full suite green (285 tests passing baseline) before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` — the task definition (main deliverable)
- [ ] Extend `tests/lib/raw-drops.test.ts` — covers TRIAGE-03, TRIAGE-04 (new `triage-dispatch` kind)
- [ ] Extend `tests/lib/content-classifier.test.ts` — covers TRIAGE-05 (add triage-dispatch test cases)

*(No new test files needed — extensions to existing test files only.)*

## Security Domain

Security enforcement is not explicitly set in config.json (absent = enabled).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | MCP handles Gmail auth; no new auth surface |
| V3 Session Management | No | Desktop task sessions are single-user local |
| V4 Access Control | Yes | Path escape guard in `writeRawDrop` already prevents wiki directory traversal [VERIFIED: codebase raw-drops.ts `assertInside`] |
| V5 Input Validation | Yes | Thread IDs and subjects from Gmail MCP are untrusted strings used in filenames; `slugify()` in `raw-drops.ts` sanitizes to `[a-z0-9-]` [VERIFIED: codebase] |
| V6 Cryptography | No | No new crypto surface |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Email subject/sender used in filename | Tampering | `slugify()` in `raw-drops.ts` sanitizes to alphanumeric+hyphens; `assertInside` guards path traversal [VERIFIED: codebase] |
| `todos/pending.md` written by scheduled task | Tampering | Append-only pattern; file is human-editable; no access control needed for single-operator local system |
| PushNotification content from email subject | Spoofing | Notification is informational only; never parsed for commands |

## Sources

### Primary (HIGH confidence)

- `code.claude.com/docs/en/desktop-scheduled-tasks` — Desktop scheduled task creation, schedule options, cron expressions, filesystem access, minimum 1-minute interval [VERIFIED via WebSearch + Exa]
- `code.claude.com/docs/en/scheduled-tasks` — Cloud vs. Desktop vs. /loop comparison table, CronCreate tool, local timezone behavior [VERIFIED via Exa]
- `code.claude.com/docs/en/routines` — Cloud Routines constraints (no local file access, 1-hour minimum interval, fresh git clone) [VERIFIED via Exa]
- `code.claude.com/docs/en/tools-reference` — PushNotification tool availability, RemoteTrigger tool [VERIFIED via Exa]
- `.claude/skills/daily-inbox-triage/SKILL.md` — Full triage skill logic reused by Phase 8 [VERIFIED: codebase]
- `todos/pending.md` — Exact to-do item format including checkbox, bold summary, metadata lines [VERIFIED: codebase]
- `docs/adr/0004-staged-ingestion-via-raw-aios.md` — `raw/aios/` staging convention, file naming, immutability contract [VERIFIED: codebase]
- `aios-ui/lib/raw-drops.ts` — `writeRawDrop`, `slugify`, `assertInside` implementations [VERIFIED: codebase]
- `aios-ui/lib/data/wiki.ts` — `resolveProjectWikiPath` implementation [VERIFIED: codebase]
- `aios-ui/lib/content-classifier.ts` — `classifyContent` with `'triage-dispatch'` source type [VERIFIED: codebase]
- `aios-ui/lib/types.ts` — `RawDropKind`, `TriageCacheEntry`, `Todo` types [VERIFIED: codebase]
- `aios-ui/lib/cache/triage.ts` — `writeTriageCache` format and `triageCachePath()` [VERIFIED: codebase]
- `clients.yaml` — Full client/project registry with contacts arrays and docs_paths [VERIFIED: codebase]

### Secondary (MEDIUM confidence)

- WebSearch results on Claude Code Routines scheduling (April 2026 release, cron expression minimum 1-hour for cloud, timezone handling) [multiple sources cross-referenced with official docs]

## Metadata

**Confidence breakdown:**
- Scheduling mechanism: HIGH — official docs confirmed Desktop tasks vs. cloud Routines distinction
- Standard stack: HIGH — all existing codebase components verified by direct file inspection
- Architecture: HIGH — clear extension of Phase 7 patterns; no novel architecture
- Pitfalls: HIGH — derived from direct code reading (cache write path, RawDropKind extension, filesystem constraint)

**Research date:** 2026-06-08
**Valid until:** 2026-07-08 (stable — no external dependency drift expected; Claude Code Desktop API is stable)
