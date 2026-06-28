# Triage Hardening — Requirements

**Date:** 2026-06-19
**Scope:** Standard. Correctness + noise-reduction pass on the inbox triage, plus a pattern-level mute mechanism.
**Affects:** `.claude/skills/daily-inbox-triage/SKILL.md` — the live triage, invoked on schedule via Cowork. `scheduled-triage` is legacy (per `decisions/log.md` 2026-06-19) and is **not** modified. Plus a new `state/triage-mutes.md`.

## Problem

The 2026-06-19 afternoon run exposed three gaps:

1. **No content + backwards framing.** Triage carries only a 1-2 sentence project-memory snippet, never a summary of what the person said. The "days waiting" line is computed from Justin's *last outbound*, so Inside Out (Melinda Dennis) was filed under "consider nudge — 21 days since your last message" when she had actually replied that morning. The run anchored on the wrong message and showed no content, so the reply was invisible.
2. **Junk.** Filtering is just a Gmail query (`-from:noreply` etc.) + a 2RM exclusion. No personal-sender filter (Boy Scout Camp Mitigwa landed in "Reply today"), no calendar-acceptance detection (Liz accepting an invite), no rule against drafting replies to auto-notifications (Gemini meeting notes).
3. **No durable "doesn't need addressing" control Justin will use.** A thread-level `aios-ui/.aios-cache/triage-overrides.json` exists but is driven only by the AIOS UI, which Justin doesn't use, and it's thread-level — it can't mute a whole recurring category.

## Outcome

Triage shows only what Justin owes a human reply on (with what they said) plus a short ops-action tier; recurring noise is permanently suppressible from a plain-text file he controls.

## Requirements

### R1 — Show what they said
- Every reply candidate includes a 1-line summary of the latest **inbound** message, pulled via `mcp__claude_ai_Gmail__get_thread`.
- Keep the existing 1-2 sentence project-memory snippet alongside it.

### R2 — Anchor recency on the latest message
- Classify by the latest message in the thread, not Justin's last outbound:
  - Latest is **inbound** and unanswered → Justin owes a reply (Reply today / this week).
  - Latest is **outbound** (Justin's), old, no response → nudge candidate (they owe Justin). Bucket stays; only misfiling is fixed.
- A genuine same-day human reply surfaces in **Reply today** with its summary. Replace the blanket 18-hour hide with a ~2h grace so something that landed minutes before the run isn't surfaced half-read.

### R3 — Split the FYI pile
- Keep a short **"Needs action (not a reply)"** tier for real operational signals: failed billing, renewals, access grants Justin must act on.
- Drop pure FYI entirely (calendar accepts, auto-replies, payments-received, maintenance notices, Gemini notes). No FYI / archive-candidate pile.
- Drafting stays automatic for genuine reply candidates; noise no longer reaches the draft step because it is no longer classified as a reply candidate.

### R4 — Pattern-level mute-list
- New `state/triage-mutes.md`, read every run, applied **before** the reply heuristic (same precedence as `triage-overrides.json`).
- Sections:
  - `senders` — glob/substring match on From address (e.g. `*@scouting.org`, `cara@healingrockia.com`).
  - `subjects` — substring/regex match (e.g. `accepted: `, `Notes: `).
  - `categories` — small known enum with built-in detectors: `calendar-accept`, `auto-notification`. Suppressed when listed.
- Justin edits it by hand or tells Claude to append a line; the file is the source of truth.
- The existing thread-level `triage-overrides.json` (UI-driven) is left untouched. The mute-list is an additive second layer.

## Boundaries

- **Deferred (future feature):** automated handling of Gemini meeting-notes / recaps. For now they are suppressed via the mute-list (`subjects: Notes: ` or `categories: auto-notification`), nothing more.
- Not rebuilding or replacing `triage-overrides.json` or the AIOS UI row actions.
- Only the live `daily-inbox-triage` changes. `scheduled-triage` is legacy and left as-is.
- Preserve the `TODOS_JSON` and `STATE_UPDATES_JSON` output envelopes the UI consumes — output restructuring must not break them.

## Assumptions

- Pulling `get_thread` on every surviving reply candidate is an acceptable cost increase — a handful of extra calls per run, only on post-filter threads.
- `calendar-accept` / `auto-notification` are reliably detectable from headers/subject/sender (e.g. `Accepted:`/`Declined:` subjects, no-reply-class senders). If a detector proves unreliable, fall back to sender/subject lines in the mute-list.

## Success criteria

- A same-day reply on a long-dormant thread (the Melinda case) appears in "Reply today" with a 1-line of what was said, not under "consider nudge."
- A muted sender/subject/category (Camp Mitigwa, calendar accepts, Gemini notes) does not appear and no draft is created for it, on this run and all future runs, with no UI interaction.
- No "FYI / context only" or "Archive candidates" pile in the output; ops-action items still surface.
