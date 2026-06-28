---
title: "feat: Harden triage state-writeback detector"
date: 2026-06-19
type: feat
origin: docs/superpowers/specs/2026-06-19-triage-state-detector-hardening-design.md
status: ready
depth: standard
---

# feat: Harden triage state-writeback detector

## Summary

The triage state-writeback detector narrated a Wild Rose go-live date change but produced **no Sync proposal** — the operator had nothing to apply. Two proven causes: the detector's schema only fires on *contradictions* of four fields (no date/launch field, no handling of *new* facts), and persistence is a soft model side-effect (hand-editing a JSON file) that a headless run can skip. This plan widens detection and makes persistence deterministic by mirroring the existing `TODOS_JSON` envelope pattern: the skill emits a `STATE_UPDATES_JSON` envelope into `state/inbox-triage.md`, and a `reconcile` step on the Sync read path upserts proposals via a shared dedupe predicate. Both live triage paths (in-app button + Cowork) run the same skill and write the same file, so one consumer covers both. Because the new envelope rides in the same file the Triage view renders, the render/parse paths must also be taught to strip it (U5), and because the Sync view and badge both hit the read path on the same event, reconcile must serialize its store write (U3).

---

## Problem Frame

- **Symptom:** Sync queue empty after a triage that should have proposed a Wild Rose state update (go-live July 1 → July 13).
- **Cause 1 (schema):** `daily-inbox-triage` Step 9 maps only to `status` / `current_status` / `next_step` / `blocker` and fires only on a *contradiction* of an existing value. A launch date is neither a mapped field nor an existing value in `state/wild-rose-redesign.md`, so a faithful run drafts nothing.
- **Cause 2 (reliability):** persistence is a buried instruction to read + dedupe + hand-edit `aios-ui/.aios-cache/pending-state-updates.json` — a model side-effect that can be narrated-but-skipped.
- **Both live paths** (in-app `Run triage` → `/api/triage/run`, and scheduled via Cowork) run `/daily-inbox-triage` and write `state/inbox-triage.md`. `scheduled-triage` is legacy and not the live path.

Origin: `docs/superpowers/specs/2026-06-19-triage-state-detector-hardening-design.md`.

---

## Requirements

- **R1** A launch/date change, or another explicit and attributable state fact the file does not yet track, produces a Sync proposal — not just narration.
- **R2** Proposal persistence is deterministic (survives a model that narrates without performing a side-effect).
- **R3** Works for both live triage paths via a single consumer.
- **R4** No regressions to the apply path, dedupe, dismissed-handling, or clobber guard.
- **R5** Noise stays bounded — additions require high confidence; only state-relevant signals qualify.

---

## Key Technical Decisions

- **Mirror the `TODOS_JSON` envelope (don't invent a new transport).** The skill already reliably emits `TODOS_JSON` into `state/inbox-triage.md` because it is *output*, not a side-effect. Carrying proposals the same way converts the unreliable side-effect into reliable output. *(see origin)*
- **Reconcile on read in `GET /api/state-updates`.** Both paths write `state/inbox-triage.md`; the scheduled (Cowork) path has no post-run hook to attach a consumer to. The Sync view and the nav badge both fetch `/api/state-updates` (`app-shell.tsx:43`, re-fetching on the SSE `invalidate` event), so a single reconcile there covers view + badge for both paths. Write-on-read is accepted deliberately, but `dedupeKey` idempotency only holds for **sequential** calls — view + badge fire near-simultaneously on the same `invalidate`, so reconcile **serializes** its read-modify-write with an in-process lock and writes atomically (temp+rename, reusing the apply route's `atomicWrite` at `app/api/state-updates/[id]/apply/route.ts:19`). One Node process means an in-process lock suffices.
- **Model emits semantic fields only; code derives `id` / `createdAt` / `dedupeKey`.** Removes the fiddly hash/dedupe/file-IO steps from the prompt (the part most likely to be skipped) and keeps `dedupeKey` derivation consistent with the dismissed set. `dedupeKey = \`${slug}:${field}:${sha256(proposed).slice(0,8)}\``; `id = "su-" + crypto.randomBytes(4).toString("hex")` (random, not derived from the proposal — `apply`/`removeProposal` key on `id`).
- **Map launch/date changes to `current_status`.** `state-merge.ts` `prependCurrentStatus` adds a dated bullet non-lossily — no apply-path change, no new field/applier needed.
- **Pure parser in its own module**, mirroring `lib/skills/todos-envelope.ts` (client-safe, separately testable).

---

## Implementation Units

### U1. Widen detector + emit `STATE_UPDATES_JSON` in `daily-inbox-triage`

**Goal:** Make the skill (a) detect new/attributable state facts in addition to contradictions, and (b) emit proposals as an envelope instead of hand-writing the store.
**Requirements:** R1, R2, R5.
**Dependencies:** none (defines the envelope shape U2 parses).
**Files:** `.claude/skills/daily-inbox-triage/SKILL.md`
**Approach:**
- Rewrite **Step 9**: draft a proposal when an email **contradicts** an existing field **OR** introduces a **materially-new, explicit, attributable** state fact the file does not yet track. Additions are high-confidence only — never inferred (the `/dispatch` no-invention rule). Guard: thread resolved a `project_slug`, carries a state-relevant signal (launch/date change, status change, blocker raised/cleared), and the state file exists.
- Add field guidance: launch/date changes → `current_status`. Keep the four existing field mappings.
- Replace the "read store / compute dedupeKey / append `pending-state-updates.json`" instructions with: emit a `STATE_UPDATES_JSON` envelope (markers `<!-- STATE_UPDATES_JSON_START -->` … `<!-- STATE_UPDATES_JSON_END -->`) appended to the brief and written into `state/inbox-triage.md` in **Step 8**, beside `TODOS_JSON`. Model emits `slug, field, current, proposed, evidence{source,threadId,sender,date}, confidence, stateUpdatedAt` (read verbatim from the file's `**Updated:**` line). Zero proposals → `"proposals": []`. Do not announce the envelope in chat.
- Update the Output contract + Critical implementation rules: the skill no longer writes `pending-state-updates.json`; it emits the envelope and the UI's reconcile persists.
**Patterns to follow:** Step 7 + Step 8 (`TODOS_JSON`) in the same file — envelope wording, "do not announce", "still emit when empty".
**Test scenarios:** Test expectation: none -- skill prompt change; behavior is covered end-to-end by U4 and by a live triage run (see Verification).
**Verification:** A triage run emits a well-formed `STATE_UPDATES_JSON` block in `state/inbox-triage.md`; for the Wild Rose go-live case it contains a `current_status` proposal for `wild-rose-redesign`.

### U2. `extractStateUpdatesEnvelope` pure parser

**Goal:** Parse the `STATE_UPDATES_JSON` block from `state/inbox-triage.md` content; tolerant of absence/garbage.
**Requirements:** R2, R3.
**Dependencies:** U1 (envelope shape).
**Files:** `aios-ui/lib/skills/state-updates-envelope.ts`, `aios-ui/tests/lib/skills/state-updates-envelope.test.ts`
**Approach:** Mirror `lib/skills/todos-envelope.ts`: locate the start/end markers, `JSON.parse` the fenced block, validate it is an object with a `proposals` array, return `{ generated_at?, proposals: RawProposal[] } | null`. `RawProposal` = the semantic fields from U1 (no `id`/`createdAt`/`dedupeKey`). Any failure (missing markers, malformed JSON, wrong shape) → `null`.
**Patterns to follow:** `lib/skills/todos-envelope.ts` (marker scan + defensive parse), its test file for structure.
**Test scenarios:**
- Happy path: valid envelope with one proposal → returns object with `proposals.length === 1` and the semantic fields intact.
- Multiple proposals → all returned in order.
- `"proposals": []` → returns object with empty array (not `null`).
- Absent markers → `null`.
- Markers present, malformed JSON inside → `null`.
- Valid JSON but not an object / missing `proposals` array → `null`.
**Verification:** Test file passes; parser is a pure default/named export with no Node-only imports (client-safe like its sibling).

### U3. `reconcileStateUpdates` — upsert envelope proposals into the store

**Goal:** Turn parsed raw proposals into full `StateUpdateProposal`s and upsert them idempotently.
**Requirements:** R1, R2, R4.
**Dependencies:** U2.
**Files:** `aios-ui/lib/cache/state-updates.ts`, `aios-ui/tests/lib/cache/state-updates.test.ts`
**Approach:** Add `reconcileStateUpdates(markdown: string, now: string): Promise<number>` (clock injected for deterministic tests). Call `extractStateUpdatesEnvelope`; for each raw proposal derive `dedupeKey`, `id`, `createdAt` per the Key Technical Decisions. Then **batch the upsert** — read the store once, filter raw proposals against `proposals` + `dismissed` using the *same dedupe predicate* `addProposal` uses (extract it into a shared `isDuplicate(store, dedupeKey)` helper so there is no parallel dedupe path), push all new ones, write once. Make the store write **atomic** (temp+rename) and run the whole read-modify-write under a **module-level in-process lock** (a promise chain) so concurrent GETs from the view + badge serialize rather than clobbering. Return count added. No envelope / empty → return 0 without writing.
**Patterns to follow:** the apply route's `atomicWrite` (`app/api/state-updates/[id]/apply/route.ts:19-22`) for temp+rename; existing `readStateUpdates` / `writeStateUpdates`; `addProposal`'s dedupe condition (factored into the shared helper).
**Test scenarios:**
- Adds a new proposal from an envelope; store now contains it with derived `id`/`createdAt`/`dedupeKey`.
- Idempotent: reconciling the same markdown twice adds the proposal once (second call returns 0).
- Respects `dismissed`: a proposal whose `dedupeKey` is in `dismissed` is not re-added (returns 0).
- Respects existing proposals: a `dedupeKey` already pending is not duplicated.
- Multi-proposal envelope writes the store once (one final state contains all new proposals) — guards the batch path.
- Concurrent reconcile: two `reconcileStateUpdates` calls awaited together against the same store do not drop a proposal (lock serializes; final store has both distinct proposals).
- `dedupeKey` derivation is stable for identical `proposed` and differs when `proposed` differs.
- No envelope in markdown → returns 0, store unchanged (no write).
**Verification:** Test file passes; `addProposal` and `reconcileStateUpdates` share one dedupe predicate; the store write is atomic and serialized.

### U4. Reconcile-on-read in `GET /api/state-updates`

**Goal:** Run reconcile against the latest triage file before returning the store, covering both paths and the badge.
**Requirements:** R1, R2, R3.
**Dependencies:** U3.
**Files:** `aios-ui/app/api/state-updates/route.ts`, `aios-ui/tests/app/api/state-updates.test.ts`
**Approach:** Before `readStateUpdates()`, call `readTriageState()` (`lib/data/triage-state.ts`). It returns a `TriageCacheEntry` whose `.output` is the full `state/inbox-triage.md` markdown, or `null` on `ENOENT`. If `null` → skip reconcile and return `readStateUpdates()` as today. Otherwise pass `entry.output` (not the entry) to `reconcileStateUpdates(entry.output, nowISO)`, then return `readStateUpdates()`. Do **not** route through the legacy `readTriageCache` fallback — that cache predates the envelope. Keep `force-dynamic` / `nodejs`.
**Patterns to follow:** `app/api/triage/latest/route.ts` for reading `state/inbox-triage.md`; existing `tests/app/api/state-updates.test.ts` for route-test setup (temp `AIOS_CACHE_DIR`).
**Test scenarios:**
- Integration: a fixture `inbox-triage.md` containing an envelope → GET returns the reconciled proposal(s).
- Idempotent: two sequential GETs do not duplicate (second returns the same single proposal).
- No envelope → GET returns the existing store unchanged.
- Missing triage file → GET returns the existing store without error.
- A dismissed `dedupeKey` present in the envelope is not resurrected by GET.
**Verification:** Test file passes; opening Sync (or the badge re-fetch on `invalidate`) surfaces envelope proposals with no skill-side file write.

### U5. Strip `STATE_UPDATES_JSON` from triage render + parse paths

**Goal:** Keep the new envelope invisible to the operator and out of prose parsing — the Triage view renders `state/inbox-triage.md` verbatim and currently strips only `TODOS_JSON`.
**Requirements:** R1 (usable surface — proposals route to Sync, not dumped as raw text in Triage).
**Dependencies:** U1 (defines the markers).
**Files:** `aios-ui/components/triage-output.tsx`, `aios-ui/lib/skills/triage-brief.ts`, plus their tests (`aios-ui/tests/components/*triage*`, `aios-ui/tests/lib/skills/triage-brief.test.ts` if present)
**Approach:** Add a `STATE_UPDATES_JSON` strip regex mirroring the existing `TODOS_JSON` ones, in both places: `TODOS_ENVELOPE_STRIP_RE` (`triage-output.tsx:37`, used at line 189 before render) and `ENVELOPE_RE` (`triage-brief.ts:117`, used before prose/thread parsing). Either add a second `.replace()` for the new markers or generalize the regex to match both envelope names. Without this, the operator sees `<!-- STATE_UPDATES_JSON_START -->` + raw JSON in the brief, and the JSON lines feed `parseTriageBrief` as garbage threads.
**Patterns to follow:** the existing `TODOS_JSON` strip in both files — same marker-pair regex shape, same call site.
**Test scenarios:**
- A brief containing a `STATE_UPDATES_JSON` envelope renders with the markers + JSON removed (no raw `STATE_UPDATES_JSON_START` text in output).
- `parseTriageBrief` on the same input produces no spurious thread/section entries from the envelope's JSON lines.
- A brief with both `TODOS_JSON` and `STATE_UPDATES_JSON` envelopes strips both.
- A brief with neither envelope is unchanged.
**Verification:** Triage view shows no raw envelope text after a run; prose parsing is unaffected by the new block.

---

## Scope Boundaries

In scope: the four units above.

Out of scope:
- `scheduled-triage` skill — confirmed legacy, not the live scheduled path.
- `lib/data/state-merge.ts` apply path — unchanged.
- Creating missing `state/<slug>.md` files (that is `/dispatch` / `/kickoff-project` work).
- Rewriting the stale Wild Rose state body (operator data hygiene).

### Deferred to Follow-Up Work
- Gemini meeting-note ingestion (transcripts → `archives/raw/` → `/dispatch` with AI project inference). Separate capability surfaced alongside this bug.
- Optionally backfill `scheduled-triage` with the same envelope if it ever becomes the live path again.

---

## Risks & Dependencies

- **Write-on-read concurrency.** View + badge fire near-simultaneously on the same `invalidate`; `dedupeKey` idempotency is sequential-only. Mitigated in U3 (in-process lock + batched, atomic write). If reconcile ever proves costly, move it into a single-fire POST the badge triggers — not needed now.
- **`dedupeKey` hash consistency.** The dismissed set stores `dedupeKey`s; reconcile must compute them identically. One shared helper (U3). **Operational note:** the hand-written Wild Rose proposal from the debugging session used a sha1 suffix (`298b4f21`); reconcile derives sha256 (`6962c5f7`). If that row is neither applied nor dismissed before reconcile first ships, the next triage emitting the same fact will add a *second* (sha256-keyed) proposal. **Apply or dismiss the existing Wild Rose proposal before merging U3/U4.**
- **Envelope drift.** U1's emitted shape and U2's parser must agree on field names; the plan fixes the field list in U1 and U2 mirrors it. Consider a shared TS type for the raw proposal to make drift a compile error.
- **`stateUpdatedAt` still model-emitted.** The clobber guard depends on the model copying the file's `**Updated:**` line verbatim into the envelope. If it reformats/omits it, `applyProposal` returns `stale` and the operator silently can't apply. Accepted: it's a read, lower-risk than the write side-effect this plan removes; U1 instructs verbatim copy.

---

## Open Questions

- **Chat output stripping.** The in-app run echoes the skill's aggregated text to chat (`app/api/triage/run/route.ts`). U1 says "do not announce the envelope," but the model still emits the block into the streamed output. Confirm during U5 whether the chat render path also needs the `STATE_UPDATES_JSON` strip, or whether chat output is already envelope-tolerant (the `TODOS_JSON` block ships there today without complaint).

---

## Sources & Research

- Origin design: `docs/superpowers/specs/2026-06-19-triage-state-detector-hardening-design.md`.
- Local patterns (verified this session): `lib/skills/todos-envelope.ts` (pure parser + re-export), `lib/cache/state-updates.ts` (`addProposal` dedupe/dismissed), `app/api/state-updates/route.ts` (GET), `app/api/triage/latest/route.ts` + `lib/data/triage-state.ts` (reads `state/inbox-triage.md`), `components/app-shell.tsx:35-52` (badge fetches `/api/state-updates`, re-fetches on `invalidate`), `lib/data/state-merge.ts` (`prependCurrentStatus` non-lossy apply). No external research — strong local patterns, settled approach.
