---
title: "feat: Triage hardening — show-what-they-said, recency anchor, pattern mute-list"
date: 2026-06-19
type: feat
origin: brainstorm/2026-06-19-triage-hardening-requirements.md
status: ready
---

# feat: Triage hardening

## Summary

Four behavioral fixes to the live inbox triage so it surfaces what people actually said, stops mis-framing replies as stale, drops noise, and lets Justin permanently mute recurring junk from a plain-text file he controls. All changes land in `.claude/skills/daily-inbox-triage/SKILL.md` (the live triage, run on schedule via Cowork) plus a new seed file `state/triage-mutes.md`. Legacy `scheduled-triage` is not touched (see origin + `decisions/log.md` 2026-06-19).

The mute-list and all classification are applied **in-model** — the skill already reads `aios-ui/.aios-cache/triage-overrides.json` and filters in prose; the mutes file is the same pattern at a new granularity. No new TypeScript, no UI change, no test suite — verification is a dry-run of the skill against the live inbox.

---

## Problem Frame

The 2026-06-19 afternoon run exposed three gaps (full detail in origin):

1. **No content + backwards framing.** Triage carries only a 1-2 sentence project-memory snippet, never what the person said. "Days waiting" is computed from Justin's *last outbound*, so Inside Out (Melinda Dennis) was filed under "consider nudge — 21 days since your last message" when she'd actually replied that morning. The blanket 18-hour freshness rule then hid her same-day reply from "Reply today."
2. **Junk.** Filtering is Gmail-query-only + a 2RM exclusion. Personal senders (Boy Scout Camp Mitigwa landed in "Reply today"), calendar acceptances, and auto-notifications (Gemini meeting notes) slip through and even get drafts.
3. **No mute Justin will use.** Thread-level suppression exists (`triage-overrides.json`) but is UI-only and thread-scoped — it can't mute a recurring category.

---

## Requirements Traceability

| Origin | Addressed by |
|---|---|
| R1 — show what they said | U4 |
| R2 — anchor recency on latest message | U3 |
| R3 — split FYI pile | U5 |
| R4 — pattern-level mute-list | U1, U2 |
| Boundary — legacy skill untouched, envelopes preserved | U5, all units |

---

## Key Technical Decisions

- **In-model matching, not code.** The skill is LLM-executed prose. It already reads `triage-overrides.json` (thread-level) and applies it before the heuristic; the mute-list is read and applied the same way. This avoids a new code path, new tests, and a UI round-trip. Trade-off: matching correctness depends on the model following instructions — acceptable because the mute-list is small, human-readable, and the cost of a miss is one visible noise item, not data loss.
- **Mute-list precedence.** Apply mutes at the same point as overrides — **before** the reply heuristic — so a muted item is never classified, never drafted, never counted. Overrides (thread-level) and mutes (pattern-level) are independent layers; either suppressing is sufficient.
- **Recency anchor = latest message in thread.** Replace "days since Justin's last outbound" with classification on the *latest* message: latest inbound + unanswered → owed reply; latest outbound + stale → nudge candidate. This is the single fix that re-files Melinda correctly.
- **~2h grace replaces the 18h hide.** A genuine human reply surfaces in "Reply today" once it's ~2h old, so something that landed minutes before the run isn't surfaced half-read, but a real reply is never buried.
- **Envelopes are load-bearing.** `TODOS_JSON` and `STATE_UPDATES_JSON` blocks in `state/inbox-triage.md` are consumed by the UI / reconcile-on-read. The bucket restructure changes human-readable sections only — envelope shape and emission stay byte-compatible.

---

## Implementation Units

### U1. Add mute-list read + apply to the triage skill

**Goal:** The skill reads `state/triage-mutes.md` every run and suppresses matching threads before the reply heuristic.

**Requirements:** R4.

**Dependencies:** none (U2 supplies the seed file but the read step degrades gracefully if absent).

**Files:** `.claude/skills/daily-inbox-triage/SKILL.md` (modify — extend the existing Step 2.0 override-read block).

**Approach:**
- In the same step that reads `triage-overrides.json`, also read `state/triage-mutes.md`. If absent or empty, no-op (don't error).
- Parse three sections: `senders` (glob/substring on From address), `subjects` (substring/regex on subject), `categories` (known enum: `calendar-accept`, `auto-notification`).
- For each candidate thread, suppress (skip entirely — no surface, no draft, no count) if: From matches any `senders` line, OR subject matches any `subjects` line, OR the thread is detected as a listed category.
- Category detectors (in-prose heuristics): `calendar-accept` = subject begins `Accepted:` / `Declined:` / `Tentative:` or carries calendar-response headers; `auto-notification` = sender is no-reply-class or a known notification domain and body is machine-generated.
- State precedence explicitly: mutes and overrides both win over the heuristic; document that the mute-list is the operator's standing filter and overrides remain the per-thread final word.

**Patterns to follow:** the existing Step 2.0 override-read-and-skip logic in the same SKILL.md (mirror its "operator's final word — always wins over the heuristic" framing).

**Test scenarios:** Test expectation: none (prompt-skill, no test framework). Dry-run verification:
- A thread From `*@scouting.org` with a mute line present → absent from all output sections, no draft created.
- A subject `Accepted: TK-Weekly` with `calendar-accept` category muted → suppressed.
- A Gemini `Notes:` email with the subject line muted → suppressed, no draft.
- Empty/missing `state/triage-mutes.md` → run completes normally, nothing suppressed by mutes.

**Verification:** Run the skill; confirm the named noise no longer appears and no drafts were created for it.

### U2. Seed `state/triage-mutes.md`

**Goal:** Ship the file pre-populated with the categories Justin named, so the fix works on first run and the format is self-documenting.

**Requirements:** R4.

**Dependencies:** U1 (consumer) — but file can be written independently.

**Files:** `state/triage-mutes.md` (create).

**Approach:** Three commented sections (`senders`, `subjects`, `categories`) with a short header explaining match semantics and that the file is read every run. Seed with: Camp Mitigwa sender, Cara's personal addresses (already in memory as never-surface), `calendar-accept` + `auto-notification` categories, and a `subjects` line for Gemini `Notes:`. Keep it human-editable — one entry per line, `#` inline comments.

**Patterns to follow:** the format shown in the origin doc's preview block; match the terse, commented style of other `state/` files.

**Test scenarios:** Test expectation: none — static config. Sanity: U1 dry-run scenarios exercise this file's contents.

**Verification:** File parses under U1's read step; seeded entries suppress as expected.

### U3. Anchor recency on the latest message; surface same-day replies

**Goal:** Classify threads by their latest message, not Justin's last outbound, and surface genuine same-day human replies in "Reply today."

**Requirements:** R2.

**Dependencies:** none.

**Files:** `.claude/skills/daily-inbox-triage/SKILL.md` (modify — the Step 2.2 heuristic and the bucket-assignment prose).

**Approach:**
- Rewrite the "owes a reply" heuristic to key on the **latest** message: latest inbound + Justin hasn't replied since → owed reply (Reply today / this week by age); latest outbound (Justin's) + stale + no response → nudge candidate. Fixes the Melinda misfile.
- Replace the blanket 18-hour suppression with a ~2h grace: an owed reply surfaces in "Reply today" once the latest inbound is ≳2h old, regardless of whether it arrived today.
- Keep the nudge bucket ("Reply this week / consider nudge") for threads where the ball is genuinely in the *other* party's court.

**Patterns to follow:** existing Step 2.1 `get_thread` mid-thread check (reuse it to determine latest message direction).

**Test scenarios:** Test expectation: none (prompt-skill). Dry-run verification:
- The Melinda case: outbound 21d ago, inbound reply this morning → appears in "Reply today" (not "consider nudge"), with her message summary (U4).
- A thread where Justin's last message is 10 days old and no reply came → still in "consider nudge."
- An inbound reply 30 minutes before the run → held by the ~2h grace, not surfaced half-read.
- An inbound reply 5 hours before the run → in "Reply today."

**Verification:** Re-run against the inbox; confirm Melinda-type threads land in "Reply today" and nudge candidates are only Justin-last-message threads.

### U4. Add "what they said" to each reply candidate

**Goal:** Every reply candidate shows a 1-line summary of the latest inbound message.

**Requirements:** R1.

**Dependencies:** U3 (shares the per-candidate `get_thread` call).

**Files:** `.claude/skills/daily-inbox-triage/SKILL.md` (modify — the per-item output template + the step that fetches thread detail).

**Approach:**
- For each surviving reply candidate, call `get_thread` and synthesize a one-line summary of the latest inbound message ("what they actually said"), distinct from the existing project-memory snippet.
- Add a `What they said:` line to the per-item template, alongside the retained `Project context:` line.
- Note the cost: one `get_thread` per surviving candidate, only post-filter (assumption in origin — accepted).

**Patterns to follow:** existing per-item template in Step 5; existing `get_thread` usage in Step 2.1.

**Test scenarios:** Test expectation: none (prompt-skill). Dry-run verification:
- Melinda's item shows a faithful 1-line of her actual reply content, not a stale memory snippet.
- A thread with no inbound message body (edge) → line degrades to a short fallback, no crash.
- Both `What they said:` and `Project context:` appear and are distinct.

**Verification:** Output items carry an accurate one-line of the latest inbound message.

### U5. Restructure output buckets; preserve envelopes

**Goal:** Replace the FYI/Archive piles with a short "Needs action (not a reply)" ops tier; drop pure FYI; keep the JSON envelopes intact.

**Requirements:** R3, boundary (envelopes preserved).

**Dependencies:** U3 (bucket assignment), U1 (noise already removed upstream).

**Files:** `.claude/skills/daily-inbox-triage/SKILL.md` (modify — Step 5 output structure and Step 8 write).

**Approach:**
- Output sections become: `Reply today`, `Reply this week / consider nudge`, `Needs action (not a reply)` (failed billing, renewals, access grants Justin must act on), and nothing else. Remove `FYI / context only` and `Archive candidates`.
- Pure FYI (calendar accepts, auto-replies, payments-received, maintenance notices, Gemini notes) is dropped — most is already gone via U1 mutes; the rest simply isn't emitted.
- Leave the `TODOS_JSON` and `STATE_UPDATES_JSON` envelope blocks unchanged in shape and emission — only the human-readable Markdown above them changes. Update `threads_needing_reply` frontmatter to count only true reply candidates.

**Patterns to follow:** existing Step 5 template and Step 8 envelope emission; keep the envelope delimiters byte-identical.

**Test scenarios:** Test expectation: none (prompt-skill). Dry-run verification:
- A failed billing/renewal thread → appears under "Needs action (not a reply)."
- A payment-received notice → does not appear anywhere.
- Output contains no "FYI / context only" or "Archive candidates" heading.
- `TODOS_JSON` and `STATE_UPDATES_JSON` blocks are present, well-formed, and parse exactly as before (UI/reconcile still consume them).

**Verification:** Generated `state/inbox-triage.md` has the new bucket set, no FYI pile, and intact envelopes the UI can still read.

---

## Scope Boundaries

**In scope:** the four changes above, in `.claude/skills/daily-inbox-triage/SKILL.md` + `state/triage-mutes.md`.

**Deferred to follow-up work:**
- Automate Gemini meeting-notes / recaps handling (own feature; logged to `todos/pending.md`). For now the mute-list just suppresses them.

**Out of scope:**
- `scheduled-triage` (legacy — not modified).
- `triage-overrides.json` and the AIOS UI row actions (untouched; mute-list is additive).
- Any TypeScript / UI / test-suite change — there is none; this is prose + one seed file.

---

## Risks & Dependencies

- **In-model match drift.** The model could under- or over-match a mute line. Mitigation: small human-readable list, explicit match semantics in U1, dry-run check. Cost of a miss is one visible item, recoverable next run.
- **Envelope breakage.** Restructuring output risks disturbing the JSON envelopes the UI depends on. Mitigation: U5 treats envelopes as byte-stable; dry-run confirms they still parse.
- **`get_thread` cost.** One extra call per surviving candidate. Accepted in origin; only runs on post-filter threads, which are few.

---

## Verification Strategy

No automated tests exist for this prompt-skill. After implementation, dry-run `/daily-inbox-triage` against the live inbox and confirm:
1. The Melinda-type thread (same-day reply on a long-dormant thread) lands in "Reply today" with a faithful 1-line of what she said.
2. A muted sender / subject / category (Camp Mitigwa, calendar accept, Gemini notes) is absent and got no draft — this run and the next.
3. No "FYI / context only" or "Archive candidates" pile; failed-billing-type items still surface under "Needs action."
4. `state/inbox-triage.md` still carries valid `TODOS_JSON` and `STATE_UPDATES_JSON` envelopes.
