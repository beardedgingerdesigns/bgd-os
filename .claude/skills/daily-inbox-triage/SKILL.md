---
name: daily-inbox-triage
description: Use each morning, or when Justin asks "what do I owe replies on", "who am I behind on", "what's in my inbox", "what needs reply today", or any variant of triaging unanswered client email. Pulls unanswered Gmail threads, ranks by urgency, and attaches project memory context. Drafts the queue — never sends.
bike-method-phase: 2
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

Surfaces a ranked daily queue of **inbound client/contact threads Justin owes a reply on**, with project context attached so he can decide what to reply to first.

Closes the stated top pain in `context/about-me.md` ("Replying to email — chronically behind") and the Capabilities + Cadence gaps from the AIOS audit baseline.

**This skill drafts the queue. It never sends.** Gmail MCP is draft-only by design (see `connections.md` Day-1 notes). Outbound voice stays human per CLAUDE.md.

## When to run

- **Manual run, each morning.** This is Bike Method Phase 1 — no scheduled trigger yet. Justin runs it intentionally so he learns whether the ranking matches reality.
- **Re-run mid-day** if a heavy client cluster lands.
- **Advance to Phase 2** (scheduled hook) only after 14 days of clean manual runs.

## Today's context

- **Date:** {today}
- **Inbox:** `justin@beardedgingerdesigns.com`
- **Active engagements** (see `memory/project_*.md` + `context/priorities.md`):
  Inside Out, Wild Rose Casino, Thermal Kitchen, ToneQuest, Lucky's (queued), BrandOS dealer network (Pyro, Black Knight, New Heights, Great River, Truss, Superior Drone on 5/30 kill clock), Crash Champions lead, Nel + Alex partnership work.
- **Hard constraint per CLAUDE.md:** no faking Justin's voice on outbound external content without showing a draft first.

## Execution

### Step 1 — Pull candidate threads

Use Gmail tool `mcp__claude_ai_Gmail__search_threads` with this query:

```
in:inbox -in:draft newer_than:14d -from:noreply -from:no-reply -from:notifications -from:hellobonsai.com -from:drive-shares-dm-noreply
```

Set `pageSize: 50`. Pull the most recent thread per conversation; don't fetch full bodies yet.

### Step 2 — Filter to "Justin owes a reply"

#### 2.0 — Read the override file BEFORE evaluating any thread.

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-overrides.json`. If the file does not exist, treat as `{}`.

Shape: keyed by Gmail thread ID; each value has `status` (one of `replied | snoozed | not_me | dismissed`) and optionally `snooze_until` (ISO-8601 timestamp).

For each candidate thread ID from Step 1, apply these rules **before** the inbound/age heuristic:

- If `overrides[threadId].status === 'replied'` → **SKIP**. Do not surface (operator marked it handled via the UI row action).
- If `overrides[threadId].status === 'not_me'` → **SKIP**. Do not surface.
- If `overrides[threadId].status === 'dismissed'` → **SKIP**. Do not surface.
- If `overrides[threadId].status === 'snoozed'` AND `Date.parse(snooze_until) > Date.now()` → **SKIP**. (Expired snoozes fall through and are evaluated normally by the heuristic below.)

The override file is the operator's final word — it always wins over the heuristic.

#### 2.1 — Gmail thread-participant check for borderline cases.

The "last sender ≠ justin@beardedgingerdesigns.com AND >18h since last activity" heuristic misclassifies threads where Justin has already replied mid-thread (e.g., he answered yesterday, the contact replied this morning, but Justin is still effectively in the loop). For each thread that **passes** the heuristic in 2.2, additionally call `mcp__claude_ai_Gmail__get_thread(thread_id)` and inspect `messages[*].headers.From`.

If `justin@beardedgingerdesigns.com` appears as the sender on **any** message in the thread (not just the last one), downgrade or drop — Justin is already engaged. Only surface as "owes a reply" if the contact has sent something since Justin's most recent reply AND >18h has elapsed.

#### 2.2 — Heuristic (run AFTER 2.0 and feeding 2.1)

A thread qualifies if **all** are true:
- Last message in the thread is **inbound** (sender ≠ `justin@beardedgingerdesigns.com`).
- Last message is **>18 hours old** (so same-morning threads don't get nagged).
- Sender domain is not in the bot/no-reply exclude list (Bonsai notifications, Drive share notifications, Google Calendar invites, etc.).
- Thread is not labeled `Archived` or `Done` (if such labels exist).
- The override file (Step 2.0) does not skip this thread.
- The Gmail thread-participant check (Step 2.1) does not downgrade this thread.

Drop everything else.

### Step 3 — Score each qualifying thread

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
- **Reply this week:** score 4–7
- **FYI / context only:** score 1–3
- **Archive candidate:** score 0

### Step 4 — Attach project memory context (via `project-researcher` agent)

For each "Reply today" and "Reply this week" thread, identify the related project by matching the sender's email address against `clients.yaml` `contacts:` lists (full address first, then `@domain.com` patterns). The match produces a `project_slug`.

**Identity rule — match on email address, never on first name alone.** Two senders sharing a first name on different domains are presumed **different people** unless `clients.yaml` explicitly links the addresses. Do not write context lines like "same person, different project" based on name similarity — that requires evidence (an explicit cross-reference in `clients.yaml` or memory, or a thread where Justin treats them as one person). When the sender's address does not resolve to a project, set `client_slug` and `project_slug` to `null` and write the project context as `Unknown — domain not in clients.yaml; verify before treating as known contact.` Don't guess to fill the slot.

#### 4.1 — Dedupe slugs, then fan out to the agent

Collect the unique set of `project_slug`s across all qualifying threads. Dispatch one `project-researcher` agent per unique slug (not per thread) — **all dispatches in a single message with multiple Agent tool calls** so they run concurrently.

Prompt template per slug:

```
slug: {project-slug}
mode: context
lookback: 1d
```

The agent returns 1-2 sentences of project state pulled from the freshest memory file. The skill caches the response per slug and attaches it to every thread that resolved to that slug.

**Agent failure modes:**
- `NOT_FOUND: no project with slug=...` — shouldn't happen if the slug came from `clients.yaml`; if it does, write context as `Unknown — slug not in clients.yaml; registry needs sync.`
- Agent returns `No project memory; verify before treating as known engagement.` — pass through verbatim; that's the agent's intentional output when the project is registered but has no memory file yet.

Example: a thread from `deann@thermalkitchen.com` resolves (via `@thermalkitchen.com` pattern under `kirk-financial`/`thermal-kitchen`) → dispatch agent with `slug: thermal-kitchen mode: context` → agent returns `"Launch shifted to Tue 6/16; design comps due to Deann 5/19 ahead of 5/20 review call."` → attach to every thread row that matched that slug.

Don't dump full memory bodies into output. The agent already constrained itself to 1-2 sentences.

### Step 5 — Output the queue

Print a Markdown brief in chat:

```
# Inbox Triage — {today}
**{N} threads need reply. {X} today, {Y} this week.**

## Reply today
1. **{Sender Name}** ({sender domain}) — *{score}*
   Subject: {thread subject}
   Last inbound: {days waiting} days ago
   Project context: {memory snippet}
   Suggested next step: {1-line action}
   Thread: {message ID for direct reply}

## Reply this week
...

## FYI / context only
- {Sender} — {subject} ({days waiting}d)

## Archive candidates
- {Sender} — {subject}
```

### Step 6 — Offer to draft a reply

After printing the queue, ask Justin: *"Want me to draft a reply to any of these? Pick a number from 'Reply today'."*

If yes, draft using the project memory context + `references/voice.md` and show him the draft. Never auto-create a Gmail draft without his nod.

### Step 7 — Emit structured todos envelope

**After** the Markdown brief is complete, append a single JSON envelope so the AIOS UI can render today's queue as actionable todo cards on the admin dashboard. This is additive — the markdown above is unchanged.

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
      "thread_id": "{Gmail thread/message id from Step 5}",
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
- Include **only** "Reply today" and "Reply this week" threads. Skip FYI + archive candidates — those aren't actionable todos.
- `type` should match the work the todo represents:
  - `email_reply` for any inbox thread that needs a reply (the default for this skill).
  - `follow_up` for a thread where Justin already replied but is waiting on response (use sparingly).
  - `generic` only as a last resort when the action isn't email-shaped.
- `client_slug` / `project_slug` should match the slugs in `clients.yaml` exactly when known; use `null` (not an empty string) otherwise.
- `id` must be unique per todo and stable for the duration of one run — `todo-<8 hex chars>` is fine.
- Emit valid JSON: no trailing commas, no comments inside the JSON block.
- If zero threads qualify, still emit the envelope with `"todos": []`.

**Do not** announce the envelope to Justin in the chat — he reads the markdown brief, the UI reads the envelope.

### Step 8 — Persist the brief to `state/inbox-triage.md`

**After** emitting the Markdown brief and JSON envelope to chat, write the same content to `state/inbox-triage.md`. This is a **single file, overwritten every run** — no dated variants, no accumulation. Git history is the archive if you ever need to look back.

The file should contain:

1. A frontmatter block with the run timestamp and source (morning/afternoon/manual)
2. The full Markdown brief (same as chat output from Step 5)
3. The `TODOS_JSON` envelope (same as Step 7)
4. The `STATE_UPDATES_JSON` envelope (same as Step 9)

```markdown
---
last_run: {ISO-8601 timestamp}
source: {morning | afternoon | manual}
threads_needing_reply: {N}
---

{Full Markdown brief from Step 5}

{TODOS_JSON envelope from Step 7}

{STATE_UPDATES_JSON envelope from Step 9}
```

This file is the **handoff surface** — any future session (Claude Code, Cowork, Desktop) can read `state/inbox-triage.md` to know what the last triage found without needing to re-run the full Gmail scan.

### Step 9 — Reconcile project state (emit state-update proposals)

The write-back loop that keeps the dashboard's source of truth current. You
DRAFT proposals here; Justin reviews and applies them from the UI's **Sync**
queue. You never edit `state/<slug>.md` directly, and you never hand-write the
proposal store — you **emit** proposals as a `STATE_UPDATES_JSON` envelope
(below) and the UI's reconcile step persists and dedupes them.

For each thread that resolved a `project_slug` (Step 4) AND carries a
state-relevant signal — a launch/date change, a status change, or a blocker
raised or cleared — reconcile it against the project's state file:

1. Read `/Users/justinlobaito/repos/claude-os/state/<slug>.md`. If it does not
   exist, skip and note it in the run summary (creating state files is
   `/dispatch` / `/kickoff-project` work, not triage's).
2. Draft a proposal when the email either **contradicts** the matching field OR
   introduces a **materially-new, explicit, attributable** state fact the file
   does not yet track (e.g., a go-live date when none is recorded). A thread that
   merely confirms the current state produces nothing.

   | field | maps to |
   |---|---|
   | `status` | the `**Status:**` value |
   | `current_status` | the `## Current Status` body — **also the target for launch/date changes** (applied as a dated bullet) |
   | `next_step` | a `## Next Steps` bullet |
   | `blocker` | a `## Blockers` bullet (raise = add; clear = empty `proposed`) |

3. Set `confidence`: `high` only when the email states an explicit, attributable
   fact ("we're pushing launch to mid-July"); `low` for inference. A **new fact**
   (not a contradiction of an existing value) must be `high` — an
   implied-but-unstated change is never emitted. Never invent an outcome (the
   `/dispatch` rule).
4. Set `current` to the value being contradicted (shown in the diff); for a new
   fact the file doesn't track, use a short note like `(not yet tracked)`. Set
   `stateUpdatedAt` to the file's `**Updated:**` date **verbatim** — it is the
   clobber guard; reformat or omit it and the operator can't apply.

Emit the proposals as a single envelope, appended after the `TODOS_JSON` envelope
and written into `state/inbox-triage.md` (Step 8). Emit **semantic fields only**
— the UI derives `id`, `createdAt`, and `dedupeKey`, reads the store, dedupes
against pending + dismissed, and persists. You do **not** read or write
`pending-state-updates.json`.

````
<!-- STATE_UPDATES_JSON_START -->
```json
{
  "generated_at": "{ISO timestamp now}",
  "proposals": [
    {
      "slug": "<slug>",
      "field": "status | current_status | next_step | blocker",
      "current": "<value being contradicted, or a short (not yet tracked) note>",
      "proposed": "<drafted replacement / new value>",
      "evidence": { "source": "triage", "threadId": "<id or null>", "sender": "<addr or null>", "date": "YYYY-MM-DD" },
      "confidence": "high | low",
      "stateUpdatedAt": "<the file's **Updated:** date, verbatim>"
    }
  ]
}
```
<!-- STATE_UPDATES_JSON_END -->
````

If zero proposals, still emit the envelope with `"proposals": []`. Emit valid
JSON (no trailing commas, no comments). **Do not** announce the envelope in the
chat. This step never edits `state/<slug>.md` (Justin applies from Sync, behind a
clobber guard) and never touches a project wiki (ADR 0004 / 0007).

## Output contract

Every run produces:

1. **One Markdown brief in chat** — ranked queue with project context attached.
2. **One structured JSON envelope** (Step 7) — feeds the dashboard todo cards. Markdown stays the canonical human-readable surface; envelope is the machine surface.
3. **One file write to `state/inbox-triage.md`** (Step 8) — overwrites previous run. Single file, no accumulation. Any session can read the latest triage results.
4. **A `STATE_UPDATES_JSON` envelope** in `state/inbox-triage.md` (Step 9) — drafted state-update proposals the UI's reconcile step persists to the Sync queue. Never edits `state/<slug>.md` or the proposal store directly.
5. **(Optional, on Justin's request)** drafted replies for threads he picks.

No Gmail drafts created without confirmation. No sending — ever.

## Critical implementation rules

1. **Minimal writes.** The only file written is `state/inbox-triage.md` (overwritten each run; it now carries both the `TODOS_JSON` and `STATE_UPDATES_JSON` envelopes). Do not modify memory, the proposal store, or other files. `state/<slug>.md` is NEVER written here — only proposed via the envelope. Only additional side effect on confirmation is creating a Gmail draft via `mcp__claude_ai_Gmail__create_draft`.
2. **Never send.** No matter how clear the reply seems.
3. **Don't fabricate "days waiting."** Use the actual `date` field of the last inbound message.
4. **Don't surface 2RM (`*@2rm.com` / `*@tworivers.com`) threads as actionable.** 2RM is W-2 day-job, out of BGD scope per CLAUDE.md. Show them under FYI only if they have a deadline.
5. **Don't surface internal Justin-to-Justin or system-generated email.** Bot exclusions in Step 1.
6. **If zero threads qualify**, say so cheerfully — "Inbox is clean as of {time}." That's a real outcome, not a failure.
7. **Stay under ~60s wall-clock.** Cap thread fetches; don't call `get_thread` until a draft is requested.
8. **Never conflate two contacts by first name alone.** Different email addresses → different people, unless memory/clients.yaml explicitly says otherwise. No "same person, different project" framing without an evidence trail.
9. **Render the actual sender name from the email header.** Don't substitute or "correct" a name based on what memory says the contact's name should be. If memory disagrees with the header, surface the discrepancy in the context line; don't silently overwrite.

## KPI tracking (Method spec)

- **Bucket:** Less cost (less time/anxiety on triage) + More value per customer (faster client response).
- **Metric:** % of inbound client threads replied within 24 business hours.
- **Baseline:** 2026-05-18 — unknown, but "chronically behind."
- **Target:** 80% by 2026-06-18.

After each run, optionally track replied-within-24hr counts manually for the first 7 days. If the ranking misses targets, revise scoring weights in Step 3.

## Bike Method phasing

- **Phase 1:** Manual run each morning. Justin reads queue + decides + replies himself.
- **Phase 2 (current):** Scheduled via Cowork (morning 7am + afternoon 1pm CST). Results persist to `state/inbox-triage.md` so any session can read them.
- **Phase 3:** Auto-draft replies for top-N threads (still draft, not send). Skill creates Gmail drafts proactively.
- **Phase 4:** L3 supervised — skill bulk-archives obvious "archive candidates" without asking. Justin reviews weekly.

Advance phases by explicit edit to the frontmatter `bike-method-phase` value. Do not auto-advance.

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
