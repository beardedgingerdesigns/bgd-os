# ADR 0008: Todo Card Actions

**Status:** Draft
**Date:** 2026-06-25
**Context:** AIOS UI todo cards currently support only "done" and "dismiss." Most cards require intermediate actions before completion.

## Problem

Client-facing action items like "send recap email" sit in the todo list as read-only reminders. Justin reads them, knows what to do, but has to leave the dashboard to act. Cards that are blocked or not-yet-actionable clutter the active list alongside things he can do right now.

## Decision

Add three actions to todo cards:

### 1. Snooze (date-based deferral)

- Card disappears from active view until the snooze date.
- Snooze picker: "tomorrow", "next week", "pick date."
- Snoozed cards get a `snoozedUntil` timestamp. Active list filters them out until that time passes.
- A "snoozed" filter/badge shows count of sleeping cards.

### 2. Do It (inline execution)

- Opens an action context for the card based on its type:
  - **Email-type items** (send recap, reply to X): drafts a Gmail reply/compose via the Gmail MCP connector. Pre-fills subject, recipient, and body from card context + project state.
  - **Calendar-type items** (schedule meeting with X): opens a calendar event creator with attendees and suggested times.
  - **Generic items**: opens a mini-composer where the AIOS can help execute the task inline (e.g., "scrub stale mentions from skill X" could open the relevant file context).
- After execution, card auto-transitions to "done."
- Detection heuristic for card type: keyword scan on the card summary ("send" / "email" / "reply" = email; "schedule" / "meeting" / "call" = calendar; else = generic).
- **Insufficient context fallback:** If the AIOS can't infer a concrete action from the card summary + project state (no recipient, no clear deliverable, ambiguous scope), it falls back to a `/grill-with-docs` session in the active chat surface — AIOS UI chat panel or terminal. The grill session uses the card's project context and linked state files as seed material, asks targeted questions until the action is clear, then executes. This means "Do It" never dead-ends on a vague card; it either acts or interviews you until it can.

### 3. Blocked / Waiting On (dependency-based deferral)

- Card stays visible but visually muted with a "waiting on [free text]" label.
- Example: "Waiting on Cherity to send videos."
- Blocked cards sort below actionable cards.
- No auto-unblock — Justin clears the block manually or triage detects the dependency resolved (future: triage scans for unblock signals in email).

## What we are NOT building

- **Split/subtasks** — if a todo needs splitting, it was scoped wrong at triage. Fix triage, not the card.
- **Delegate** — Justin's a solo operator. If someone else owns it, it's an email to send (use "Do It"), not a delegation system.
- **Priority shuffle** — triage already ranks. Don't re-rank from the card.
- **Escalate to project phase** — manual decision; just note it and dismiss the card.

## Data model changes

```typescript
// extends existing todo item
interface TodoAction {
  snoozedUntil?: string;       // ISO timestamp, null = not snoozed
  blockedOn?: string;          // free text, null = not blocked
  actionType?: 'email' | 'calendar' | 'generic';  // detected from summary
}
```

## UI behavior

- Card actions appear on hover or swipe (mobile).
- Snooze and Block are reversible from the card itself (un-snooze, clear block).
- "Do It" opens a panel/modal with pre-filled context; confirm sends/creates, cancel returns to list.
- Active list default: hide snoozed, show blocked (muted). Toggle to show all.

## Implementation order

1. **Do It (email)** — Gmail draft connector already exists. Wire it to card context. This is the headline feature: act from the dashboard.
2. **Do It (calendar)** — Calendar connector exists. Same pattern.
3. **Snooze** — cleans the list. Lower priority because "Do It" reduces the need to defer.
4. **Blocked** — adds a `blockedOn` field + visual treatment. Minimal UI.
5. **Do It (generic)** — open-ended; defer until patterns emerge from 1 and 2.

## Success criteria

- Active todo list shows only actionable items (snoozed hidden, blocked deprioritized).
- "Send email" type cards can be executed without leaving the dashboard.
- No card sits unacted-on for >7 days without being snoozed, blocked, or dismissed.
