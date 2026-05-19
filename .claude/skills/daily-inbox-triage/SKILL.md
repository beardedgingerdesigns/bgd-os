---
name: daily-inbox-triage
description: Use each morning, or when Justin asks "what do I owe replies on", "who am I behind on", "what's in my inbox", "what needs reply today", or any variant of triaging unanswered client email. Pulls unanswered Gmail threads, ranks by urgency, and attaches project memory context. Drafts the queue — never sends.
bike-method-phase: 1
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

A thread qualifies if **all** are true:
- Last message in the thread is **inbound** (sender ≠ `justin@beardedgingerdesigns.com`).
- Last message is **>18 hours old** (so same-morning threads don't get nagged).
- Sender domain is not in the bot/no-reply exclude list (Bonsai notifications, Drive share notifications, Google Calendar invites, etc.).
- Thread is not labeled `Archived` or `Done` (if such labels exist).

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

### Step 4 — Attach project memory context

For each "Reply today" and "Reply this week" thread, identify the related project by matching sender domain + thread subject against `memory/project_*.md` files (use frontmatter `client:` / `project:` keys when present).

Pull **1-2 sentence** project state from memory and attach. Don't dump full memory bodies into output.

Example: a thread from `deann@thermalkitchen.com` → look up `memory/project_thermal_kitchen_launch_2026-05.md` → attach "Launch shifted to Tue 6/16; design comps due to Deann 5/19 ahead of 5/20 review call."

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

## Output contract

Every run produces:

1. **One Markdown brief in chat** — ranked queue with project context attached.
2. **(Optional, on Justin's request)** drafted replies for threads he picks.

That's it. No file writes. No Gmail drafts created without confirmation. No sending — ever.

## Critical implementation rules

1. **Read-only by default.** Do not create Gmail drafts, do not modify memory, do not write files. Only side effect on confirmation is creating a Gmail draft via `mcp__claude_ai_Gmail__create_draft`.
2. **Never send.** No matter how clear the reply seems.
3. **Don't fabricate "days waiting."** Use the actual `date` field of the last inbound message.
4. **Don't surface 2RM (`*@2rm.com` / `*@tworivers.com`) threads as actionable.** 2RM is W-2 day-job, out of BGD scope per CLAUDE.md. Show them under FYI only if they have a deadline.
5. **Don't surface internal Justin-to-Justin or system-generated email.** Bot exclusions in Step 1.
6. **If zero threads qualify**, say so cheerfully — "Inbox is clean as of {time}." That's a real outcome, not a failure.
7. **Stay under ~60s wall-clock.** Cap thread fetches; don't call `get_thread` until a draft is requested.

## KPI tracking (Method spec)

- **Bucket:** Less cost (less time/anxiety on triage) + More value per customer (faster client response).
- **Metric:** % of inbound client threads replied within 24 business hours.
- **Baseline:** 2026-05-18 — unknown, but "chronically behind."
- **Target:** 80% by 2026-06-18.

After each run, optionally track replied-within-24hr counts manually for the first 7 days. If the ranking misses targets, revise scoring weights in Step 3.

## Bike Method phasing

- **Phase 1 (current):** Manual run each morning. Justin reads queue + decides + replies himself.
- **Phase 2 (after 14 clean days):** Add a `.claude/settings.json` hook that runs this skill on first interactive shell open each day. Still output-only.
- **Phase 3:** Auto-draft replies for top-N threads (still draft, not send). Skill creates Gmail drafts proactively.
- **Phase 4:** L3 supervised — skill bulk-archives obvious "archive candidates" without asking. Justin reviews weekly.

Advance phases by explicit edit to the frontmatter `bike-method-phase` value. Do not auto-advance.

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
