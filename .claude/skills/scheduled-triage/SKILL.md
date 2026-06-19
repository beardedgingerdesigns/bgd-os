---
name: scheduled-triage
description: Automated triage routine. Fires on a Desktop scheduled task during waking hours. Pulls unanswered Gmail threads, creates draft replies, extracts action items to the to-do list, and dispatches project-relevant intelligence to wiki staging directories. This is the automated evolution of /daily-inbox-triage.
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

Runs as an automated triage routine that fires on a Desktop scheduled task every 2 hours during waking hours (7am-7pm CT, weekdays). Each run pulls unanswered Gmail threads, computes a dynamic lookback window from the previous run's cache (D-03), filters and scores threads using the proven daily-inbox-triage pipeline, creates Gmail drafts for all reply-needed threads without asking for confirmation (D-05, D-06), extracts action items to the persistent to-do list (D-07), dispatches project-relevant email intelligence to matched project wiki staging directories (D-08, D-09, D-10), writes the triage cache for the next run's lookback (D-04), and sends a push notification summary (D-04).

This is the scheduled evolution of `/daily-inbox-triage`. It closes Justin's top pain -- email reply lag -- by making triage ambient infrastructure instead of a morning ritual. Drafts appear in Gmail automatically. Action items land in `todos/pending.md`. Project wikis accumulate email intelligence without manual dispatch.

## Execution model

This skill runs as a **Claude Code Desktop scheduled task**, NOT a manual trigger. Desktop tasks are triggered by the Claude Code Desktop app's built-in scheduler and have full local filesystem access. The Desktop app must be open and the machine must be awake for scheduled tasks to fire.

**Cron expression:** `7 7-21/2 * * 1-5`
This fires every 2 hours from 7am to 9pm CT (at :07 past the hour), Monday through Friday. Reference D-01, D-02.

**Tradeoff note:** D-01 in CONTEXT.md mentions "fires even when laptop is closed" as a future goal. Desktop tasks are the correct mechanism for this workload because the skill's filesystem dependencies -- `todos/pending.md`, wiki `raw/aios/` directories, and `triage-overrides.json` -- require local filesystem access. Cloud Routines (which could fire while the laptop is closed) would require these files to be committed to git and synced, which is a future phase consideration. For now: Desktop tasks are the right call.

## Today's context

- **Date:** {today}
- **Inbox:** `justin@beardedgingerdesigns.com`
- **Active engagements** (see `memory/project_*.md` + `context/priorities.md`):
  Inside Out, Wild Rose Casino, Thermal Kitchen, ToneQuest, Lucky's (queued), BrandOS dealer network (Pyro, Black Knight, New Heights, Great River, Truss, Superior Drone), Crash Champions lead, Nel + Alex partnership work, Co-Line Manufacturing (AI pivot candidate), Jon Liebl / LMG (sales channel + AI services proof-of-concept).
- **Hard constraint per CLAUDE.md:** no faking Justin's voice on outbound external content without showing a draft first. Gmail drafts created by this skill are staged for human review -- never sent.

## Execution

### Step 0 -- Acquire lock + Compute lookback window (per D-03)

#### 0.1 -- Acquire run lock

Acquire an exclusive run lock via atomic directory creation:

```
mkdir /tmp/scheduled-triage.lock
```

If `mkdir` succeeds: write PID and ISO timestamp to `/tmp/scheduled-triage.lock/info`:
```
{"pid": <current PID>, "startedAt": "<ISO timestamp>"}
```

If `mkdir` fails (directory already exists): read `/tmp/scheduled-triage.lock/info`.

- If `info` is missing or unparseable: treat as stale. Log stale takeover to `aios-ui/.aios-cache/triage-skipped.log`, remove info + rmdir, retry `mkdir`. If retry fails, log skip and exit.
- If `info` timestamp is **< 60 minutes old**: another run is in progress. Log skip message to `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-skipped.log` (append: `{ISO} SKIP concurrent run still active (pid {pid}, started {startedAt})`). Exit cleanly -- do not proceed.
- If `info` timestamp is **>= 60 minutes old** (stale lock): log stale takeover, remove `/tmp/scheduled-triage.lock/info`, remove `/tmp/scheduled-triage.lock` directory, retry `mkdir`. Proceed if retry succeeds.

Record `STEP0_START_EPOCH` for durationMs calculation in Step 9.

#### 0.2 -- Compute lookback window

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json`.

Read `processedThreads` array of `{threadId, lastMessageId}` pairs from the cache (use empty array if file is missing or `processedThreads` field is absent).

**Branch logic:**

| Condition | lookback | mode |
|-----------|----------|------|
| File missing OR read error | `14d` | `first_run` |
| `elapsed_hours > 48` | `3d` | `morning_briefing` |
| `elapsed_hours > 12` | `14h` | `morning_briefing` |
| else | `ceil(elapsed_hours + 1) + "h"` | `midday_check` |

Where `elapsed_hours = (Date.now() - Date.parse(cache.ranAt)) / 3600000`.

Example: if last run was 2.3 hours ago, elapsed_hours = 2.3, lookback = `4h` (ceil(2.3+1) = 4).

Store `lookback`, `mode`, and `processedThreads` for use in Steps 1 and 9.

---

### Step 1 -- Pull candidate threads

Use Gmail tool `mcp__claude_ai_Gmail__search_threads` with this query:

```
in:inbox -in:draft newer_than:{lookback} -from:noreply -from:no-reply -from:notifications -from:hellobonsai.com -from:drive-shares-dm-noreply
```

Where `{lookback}` is the value computed in Step 0 (e.g., `newer_than:4h` or `newer_than:3d`).

Set `pageSize: 50`. Pull the most recent thread per conversation; don't fetch full bodies yet.

**Dedup filter:** After pulling threads, skip any thread whose `{threadId, lastMessageId}` pair **exactly matches** an entry in `processedThreads` from Step 0. Threads where a new message has arrived since last processing (same threadId but different lastMessageId) ARE re-evaluated -- they have new content to triage.

---

### Step 2 -- Filter to "Justin owes a reply"

#### 2.0 -- Read the override file BEFORE evaluating any thread.

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-overrides.json`. If the file does not exist, treat as `{}`.

Shape: keyed by Gmail thread ID; each value has `status` (one of `replied | snoozed | not_me | dismissed`) and optionally `snooze_until` (ISO-8601 timestamp).

For each candidate thread ID from Step 1, apply these rules **before** the inbound/age heuristic:

- If `overrides[threadId].status === 'replied'` → **SKIP**. Do not surface (operator marked it handled via the UI row action).
- If `overrides[threadId].status === 'not_me'` → **SKIP**. Do not surface.
- If `overrides[threadId].status === 'dismissed'` → **SKIP**. Do not surface.
- If `overrides[threadId].status === 'snoozed'` AND `Date.parse(snooze_until) > Date.now()` → **SKIP**. (Expired snoozes fall through and are evaluated normally by the heuristic below.)

The override file is the operator's final word -- it always wins over the heuristic.

#### 2.1 -- Gmail thread-participant check for borderline cases.

The "last sender ≠ justin@beardedgingerdesigns.com AND >18h since last activity" heuristic misclassifies threads where Justin has already replied mid-thread (e.g., he answered yesterday, the contact replied this morning, but Justin is still effectively in the loop). For each thread that **passes** the heuristic in 2.2, additionally call `mcp__claude_ai_Gmail__get_thread(thread_id)` and inspect `messages[*].headers.From`.

If `justin@beardedgingerdesigns.com` appears as the sender on **any** message in the thread (not just the last one), downgrade or drop -- Justin is already engaged. Only surface as "owes a reply" if the contact has sent something since Justin's most recent reply AND >18h has elapsed.

#### 2.2 -- Heuristic (run AFTER 2.0 and feeding 2.1)

A thread qualifies if **all** are true:
- Last message in the thread is **inbound** (sender ≠ `justin@beardedgingerdesigns.com`).
- Last message is **>18 hours old** (so same-morning threads don't get nagged).
- Sender domain is not in the bot/no-reply exclude list (Bonsai notifications, Drive share notifications, Google Calendar invites, etc.).
- Thread is not labeled `Archived` or `Done` (if such labels exist).
- The override file (Step 2.0) does not skip this thread.
- The Gmail thread-participant check (Step 2.1) does not downgrade this thread.

Drop everything else.

---

### Step 3 -- Score each qualifying thread

Score = sum of:

| Signal | Points |
|---|---|
| Sender is a current active client (Wild Rose, Thermal Kitchen, ToneQuest, Inside Out, any BrandOS dealer, Jon Liebl, Nel, Alex) | +5 |
| Sender is a paying recurring client (vs. lead) | +3 |
| Days waiting ≥ 3 business days | +3 |
| Days waiting ≥ 5 business days | +2 (stacks with above) |
| Thread mentions a deadline/launch date within next 14 days | +4 |
| Sender is on a "hard clock" decision in `decisions/log.md` (e.g., Superior Drone 5/30 kill date) | +3 |
| Thread is from a new lead / first-time contact | +2 |
| Thread relates to active Q2 priority (productize / Terraplex / business plan) | +2 |

Tier the result:
- **Reply today:** score ≥ 8
- **Reply this week:** score 4-7
- **FYI / context only:** score 1-3
- **Archive candidate:** score 0

---

### Step 4 -- Attach project memory context (via `project-researcher` agent)

For each "Reply today" and "Reply this week" thread, identify the related project by matching the sender's email address against `clients.yaml` `contacts:` lists (full address first, then `@domain.com` patterns). The match produces a `project_slug`.

**Identity rule -- match on email address, never on first name alone.** Two senders sharing a first name on different domains are presumed **different people** unless `clients.yaml` explicitly links the addresses. Do not write context lines like "same person, different project" based on name similarity -- that requires evidence (an explicit cross-reference in `clients.yaml` or memory, or a thread where Justin treats them as one person). When the sender's address does not resolve to a project, set `client_slug` and `project_slug` to `null` and write the project context as `Unknown -- domain not in clients.yaml; verify before treating as known contact.` Don't guess to fill the slot.

#### 4.1 -- Dedupe slugs, then fan out to the agent

Collect the unique set of `project_slug`s across all qualifying threads. Dispatch one `project-researcher` agent per unique slug (not per thread) -- **all dispatches in a single message with multiple Agent tool calls** so they run concurrently.

Prompt template per slug:

```
slug: {project-slug}
mode: context
lookback: 1d
```

The agent returns 1-2 sentences of project state pulled from the freshest memory file. The skill caches the response per slug and attaches it to every thread that resolved to that slug.

**Agent failure modes:**
- `NOT_FOUND: no project with slug=...` -- shouldn't happen if the slug came from `clients.yaml`; if it does, write context as `Unknown -- slug not in clients.yaml; registry needs sync.`
- Agent returns `No project memory; verify before treating as known engagement.` -- pass through verbatim; that's the agent's intentional output when the project is registered but has no memory file yet.

Example: a thread from `deann@thermalkitchen.com` resolves (via `@thermalkitchen.com` pattern under `kirk-financial`/`thermal-kitchen`) → dispatch agent with `slug: thermal-kitchen mode: context` → agent returns `"Launch shifted to Tue 6/16; design comps due to Deann 5/19 ahead of 5/20 review call."` → attach to every thread row that matched that slug.

Don't dump full memory bodies into output. The agent already constrained itself to 1-2 sentences.

---

### Step 5 -- Output the queue

Print a Markdown brief in chat:

```
# Inbox Triage -- {today} ({mode})
**{N} threads need reply. {X} today, {Y} this week.**

## Reply today
1. **{Sender Name}** ({sender domain}) -- *{score}*
   Subject: {thread subject}
   Last inbound: {days waiting} days ago
   Project context: {memory snippet}
   Suggested next step: {1-line action}
   Thread: {thread ID}

## Reply this week
...

## FYI / context only
- {Sender} -- {subject} ({days waiting}d)

## Archive candidates
- {Sender} -- {subject}
```

After the brief, append the structured todos envelope so the AIOS UI can render today's queue as actionable todo cards on the admin dashboard. This is additive -- the markdown above is unchanged.

Emit exactly this shape, wrapped in the marker tags so the UI can extract it deterministically:

````
<!-- TODOS_JSON_START -->
```json
{
  "generated_at": "{ISO timestamp now}",
  "todos": [
    {
      "id": "todo-{8-char hex uuid}",
      "type": "email_reply",
      "summary": "Reply to {Sender Name} re: {short subject}",
      "context": "{1-2 sentence project memory snippet from Step 4}",
      "thread_id": "{Gmail thread id}",
      "client_slug": "{matched client slug or null}",
      "project_slug": "{matched project slug or null}",
      "suggested_action": "draft_reply",
      "action_params": { "thread_id": "{same id}" },
      "status": "open"
    }
  ]
}
```
<!-- TODOS_JSON_END -->
````

**Rules for the envelope:**
- Include **only** "Reply today" and "Reply this week" threads. Skip FYI + archive candidates -- those aren't actionable todos.
- `type` should match the work the todo represents:
  - `email_reply` for any inbox thread that needs a reply (the default for this skill).
  - `follow_up` for a thread where Justin already replied but is waiting on response (use sparingly).
  - `generic` only as a last resort when the action isn't email-shaped.
- `client_slug` / `project_slug` should match the slugs in `clients.yaml` exactly when known; use `null` (not an empty string) otherwise.
- `id` must be unique per todo and stable for the duration of one run -- `todo-<8 hex chars>` is fine.
- Emit valid JSON: no trailing commas, no comments inside the JSON block.
- If zero threads qualify, still emit the envelope with `"todos": []`.

**Do not** announce the envelope to Justin in the chat -- he reads the markdown brief, the UI reads the envelope.

---

### Step 6 -- Create Gmail drafts for all reply-needed threads (per D-05, D-06)

First, call `mcp__claude_ai_Gmail__list_drafts` to get existing drafts. Match by `thread_id` field on draft objects. Skip any thread that already has an unsent draft -- prevents duplication across back-to-back runs.

For each remaining thread in "Reply today" and "Reply this week" tiers: create an actual Gmail draft via `mcp__claude_ai_Gmail__create_draft`. **Do NOT ask for confirmation.** This is the key behavioral difference from `/daily-inbox-triage`. The manual skill says "ask first, never auto-create." This scheduled skill removes that gate entirely and always creates drafts.

**Draft content instructions:**
- Use `references/voice.md` register: short sentences, casual greeting ("Hey {Name},"), no em dashes, plain-language status, contractions welcome.
- Attach project context from Step 4 to inform the draft body.
- Keep the draft concise: acknowledge the thread, state next step or ask, close.
- The `thread_id` parameter links the draft to the correct Gmail conversation.
- **Never send** -- only stage the draft for Justin to review and edit in Gmail.

**Threat mitigation (T-08-02):** Drafts are never sent automatically. They are staged in Gmail for human review. Voice register is anchored to `references/voice.md`.

---

### Step 7 -- Extract action items to todos/pending.md (per D-07, TRIAGE-03)

For each "Reply today" and "Reply this week" thread that contains an **explicit commitment, concrete request, or clear deliverable deadline**:

1. Read `/Users/justinlobaito/repos/claude-os/todos/pending.md`.
2. Scan the `## Pending` section for items where:
   - The `Key:` line matches the deterministic key `triage:{thread_id}:{action_type}:{client_slug}`
   - AND the `Added:` date is within the last **7 days**
   If a match is found, **SKIP** -- do not create a duplicate.
   Items older than 7 days are NOT considered duplicates (legitimate recurring tasks must not be silently deduped -- per RESEARCH.md Pitfall 3).
3. If no recent duplicate exists, append a new item at the bottom of the `## Pending` section.

**Required format** (must match existing `todos/pending.md` pattern exactly):

```
- [ ] **{Bold action summary}** `#{category}`
  - Added: YYYY-MM-DD
  - Source: triage
  - Client: {client-slug} / {project-slug}
  - Priority: high | medium | low
  - Key: triage:{thread_id}:{action_type}:{client_slug}
  - Notes: Re: {email subject} from {sender name}
```

**Priority heuristics:**
- `high`: deadline mentions within 7 days
- `medium`: routine requests or non-urgent asks
- `low`: soft suggestions or low-confidence items

**Category heuristics (`#{category}` tag):**
- `#reply`: thread needs a reply
- `#deliverable`: concrete output requested
- `#meeting`: scheduling or meeting request
- `#review`: review or approval request
- `#follow-up`: waiting on response item

**Scope gate:** Only threads with explicit commitments, concrete deliverable requests, or hard deadlines generate action items. "Hey, just checking in" threads that pass triage scoring do NOT get todo items -- they get Gmail drafts (Step 6) only.

---

### Step 8 -- Dispatch project-relevant threads to wiki raw/aios/ (per D-08, D-09, D-10, TRIAGE-04, TRIAGE-05)

For each thread where `clients.yaml` contact matching (Step 4) resolved a `project_slug` AND the thread contains project-relevant intelligence beyond a routine status ping:

**Classification gate (TRIAGE-05):** Use heuristic rules first. A thread is project-relevant if it contains:
- Deliverable requests or concrete asks
- Deadline changes or launch date updates
- Scope changes or new requirements
- Budget or pricing discussions
- Technical decisions
- Partner or vendor communications about the project

Routine "got it" or "thanks" acknowledgments are NOT dispatched. If unsure whether a thread is project-relevant or purely operational, err on the side of dispatching -- let the wiki Layer 2 evaluator handle redundancy.

**Write one file per thread per matched project wiki (D-08, D-09).** Multi-project threads dispatch to ALL matched wikis -- each wiki gets the full thread context.

**File path:**
```
{resolved wiki path}/raw/aios/triage-dispatch-YYYY-MM-DD-{slugified-subject}.md
```

**Idempotency:** Before writing, check if the file already exists at this deterministic path -- skip if present. This makes the step safe to retry.

**Path construction:**
- Resolve wiki paths using `clients.yaml` `docs_paths` for each matched project.
- Derive the slug from the email subject: lowercase, replace non-alphanumeric runs with hyphens, strip leading/trailing hyphens, cap at 60 characters.
- Validate the resolved absolute path starts with the wiki's `docs_paths` prefix before writing (threat mitigation T-08-04 -- prevents path traversal from a crafted email subject).

**YAML frontmatter (D-10):**

```yaml
---
kind: triage-dispatch
thread_id: {Gmail thread ID}
sender: {sender email address}
sender_name: {sender display name from email header}
date: YYYY-MM-DD
subject: "{email subject}"
matched_contacts:
  - {email addresses that triggered the match}
matched_projects:
  - {project slug}
urgency: high | medium | low
score: {numeric triage score from Step 3}
---
```

**Body:** 3-5 sentence summary of the project-relevant content. NOT raw email text. Cover: what was asked or told, any action required, relevant dates or deadlines mentioned, context for why this matters to the project.

---

### Step 8.5 -- Reconcile project state (draft state-update proposals)

The write-back loop that keeps the dashboard's source of truth current. You
DRAFT proposals here; Justin reviews and applies them from the UI's **Sync**
queue. You never edit `state/<slug>.md` directly.

For each thread that resolved a `project_slug` (Step 4) AND carries a
state-relevant signal -- a launch/date change, a status change, or a blocker
raised or cleared -- reconcile it against the project's state file:

1. Read `/Users/justinlobaito/repos/claude-os/state/<slug>.md`. If it does not
   exist, skip and note it in the run summary (creating state files is
   `/dispatch` / `/kickoff-project` work, not triage's).
2. Compare the email's claim to the matching field. Only draft a proposal when
   the email **contradicts** what's there -- a thread that merely confirms the
   current state produces nothing.

   | field | maps to |
   |---|---|
   | `status` | the `**Status:**` value |
   | `current_status` | the `## Current Status` body |
   | `next_step` | a `## Next Steps` bullet |
   | `blocker` | a `## Blockers` bullet (raise = add; clear = empty `proposed`) |

3. Set `confidence`: `high` only when the email states an explicit, attributable
   fact ("we're pushing launch to mid-July"); `low` for inference ("sounds like
   they're behind"). An implied-but-unstated change is at most low-confidence --
   never invent an outcome (the `/dispatch` rule).
4. Compute `dedupeKey = "<slug>:<field>:<short hash of proposed>"`. Read the
   store at `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/pending-state-updates.json`
   (shape `{ "proposals": [...], "dismissed": [...] }`; missing file -> both
   empty). **Skip** if `dedupeKey` is already in `proposals` OR `dismissed` --
   never re-raise a pending or operator-dismissed change.
5. Append a proposal and write the store back (2-space JSON, preserving the
   existing `proposals` and `dismissed`):

```json
{
  "id": "su-<8 hex>",
  "slug": "<slug>",
  "field": "status | current_status | next_step | blocker",
  "current": "<value being contradicted -- shown in the diff>",
  "proposed": "<drafted replacement value>",
  "evidence": { "source": "triage", "threadId": "<id>", "sender": "<addr>", "date": "YYYY-MM-DD" },
  "confidence": "high | low",
  "stateUpdatedAt": "<the file's **Updated:** date, verbatim -- the clobber guard>",
  "dedupeKey": "<as computed>",
  "createdAt": "<ISO now>"
}
```

This step writes **only** the proposal store. It never edits `state/<slug>.md`
(Justin applies from Sync, behind a clobber guard) and never touches a project
wiki (Step 8 owns wiki staging; ADR 0004 / 0007). It is independent of the
`triage-latest.json` lookback cache -- the "write cache LAST" rule below still
governs that file only.

---

### Step 9 -- Write cache, send notification, release lock (per D-04)

**Write cache LAST.** If any earlier step fails, do not write `triage-latest.json` -- this ensures the next run re-processes the same window with the same lookback. This is a critical correctness guarantee.

Write `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json` directly using the Write tool. Shape (2-space indented JSON for UI compatibility):

```json
{
  "ranAt": "{ISO timestamp of this run}",
  "output": "{full markdown output from Step 5}",
  "exitCode": 0,
  "durationMs": {elapsed milliseconds from start of Step 0 to now},
  "processedThreads": [
    {"threadId": "{id}", "lastMessageId": "{id}"}
  ]
}
```

The `processedThreads` field is additive and backward-compatible -- the AIOS UI reads only `ranAt`, `output`, `exitCode`, and `durationMs`. Unknown fields are ignored.

**Send PushNotification** (best-effort -- if notification fails, the run is still complete):

- If threads qualify: `title: "Inbox Triage -- {N} threads need reply"`, `body: "Highest priority: {top thread subject} ({client name}, {days waiting}d)"`
- If zero threads qualify: `title: "Inbox Triage -- clear"`, `body: "No unanswered threads as of {time}."`

**Release lock:**
```
rm /tmp/scheduled-triage.lock/info
rmdir /tmp/scheduled-triage.lock
```

Always release the lock, even if a step earlier in the run failed. Use a `finally`-equivalent pattern -- release happens whether the run succeeded or errored.

---

## Output contract

Every run produces:

1. **One Markdown brief** (Step 5) -- ranked queue with project context
2. **One structured JSON envelope** (Step 5) -- feeds dashboard todo cards
3. **Gmail drafts for all reply-needed threads** (Step 6) -- `mcp__claude_ai_Gmail__create_draft` called automatically without confirmation for each qualifying thread
4. **Action items appended to todos/pending.md** (Step 7) -- with 7-day dedup check; absolute path `/Users/justinlobaito/repos/claude-os/todos/pending.md`
5. **Dispatch files in matched project wikis** (Step 8) -- one `triage-dispatch-YYYY-MM-DD-{slug}.md` file per thread per matched wiki, written to `{wiki}/raw/aios/` staging
6. **Updated triage-latest.json cache** (Step 9) -- for next run's lookback window computation
7. **Push notification summary** (Step 9) -- nudges Justin to check Gmail
8. **State-update proposals appended to `pending-state-updates.json`** (Step 8.5) -- drafted diffs for contradicted state fields, reviewed in the UI's Sync queue. Never edits `state/<slug>.md` directly.

---

## Critical implementation rules

1. **Read-only by default for unconfirmed sends.** Gmail drafts are created automatically (Step 6), but are never sent. The only write side effects are: Gmail drafts, `todos/pending.md` appends, `raw/aios/` dispatch files, `pending-state-updates.json` proposals (Step 8.5), and `triage-latest.json` cache. State files (`state/<slug>.md`) are NEVER written here -- only proposed.
2. **Never send.** No matter how clear the reply seems. Draft only. Always.
3. **Don't fabricate "days waiting."** Use the actual `date` field of the last inbound message.
4. **Don't surface 2RM (`*@2rm.com` / `*@tworivers.com`) threads as actionable.** 2RM is W-2 day-job, out of BGD scope per CLAUDE.md. Show them under FYI only if they have a deadline.
5. **Don't surface internal Justin-to-Justin or system-generated email.** Bot exclusions in Step 1.
6. **If zero threads qualify**, report "Inbox is clean as of {time}" in the brief and send the clear push notification. That's a real outcome, not a failure.
7. **Stay under ~90s wall-clock per run.** Cap thread fetches at pageSize: 50; lookback window prevents unbounded search (D-06 mitigation).
8. **Never conflate two contacts by first name alone.** Different email addresses → different people, unless memory/clients.yaml explicitly says otherwise. No "same person, different project" framing without an evidence trail.
9. **Render the actual sender name from the email header.** Don't substitute or "correct" a name based on what memory says the contact's name should be. If memory disagrees with the header, surface the discrepancy in the context line; don't silently overwrite.
10. **Write cache LAST.** If any step before Step 9 fails mid-run, do not write `triage-latest.json`. The next scheduled run will recompute the lookback from the previous successful cache and re-process the window. This is the correctness guarantee that prevents missed threads after a partial failure.

---

## KPI tracking (Method spec)

- **Bucket:** Less cost (less time/anxiety on triage) + More value per customer (faster client response).
- **Metric:** % of inbound client threads replied within 24 business hours.
- **Baseline:** 2026-05-18 -- unknown, but "chronically behind."
- **Target:** 80% by 2026-06-18.
- **Scheduled routine uplift:** The automated bi-hourly routine removes the manual trigger bottleneck. Draft replies appear in Gmail without Justin having to think "I should run triage." Expected improvement: reply lag drops from days to hours.

After each run, optionally track replied-within-24hr counts. If the scoring misses targets, revise scoring weights in Step 3.

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
