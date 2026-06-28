# Triage State-Writeback Detector — Hardening

**Date:** 2026-06-19
**Status:** Approved design, pre-plan
**Related:** ADR 0007 (UI applies AIOS-drafted state diffs), `docs/superpowers/specs/2026-06-19-aios-state-writeback-design.md`

## Problem

A Wild Rose email (Meghan Wymore, 2026-06-19) moved go-live from July 1 → July 13. The triage ran, **narrated** the contradiction in its brief ("Not yet reflected in `state/wild-rose-redesign.md`"), but the **Sync queue stayed empty** — no proposal was drafted. The operator had nothing to apply.

## Root cause (proven)

The detector (daily-inbox-triage Step 9) did not produce a proposal for three stacked reasons:

1. **Schema gap (primary).** Step 9 only maps to `status`, `current_status`, `next_step`, `blocker`. There is **no date/launch field**, and the rule fires **only on a contradiction of an existing value**. `state/wild-rose-redesign.md` does not track a go-live date at all, so a *new* fact about an untracked field produces nothing. Even a perfectly faithful run drafts nothing here.
2. **Stale state file.** `state/wild-rose-redesign.md` `Current Status` is about a graphify knowledge-graph session, not the redesign. So there was no launch-related value to contradict even loosely.
3. **Soft side-effect (secondary, unproven for valid proposals).** Persistence is a buried instruction to read + dedupe + hand-edit `pending-state-updates.json`. A headless run can narrate without performing it. Moot in this case because #1/#2 meant there was nothing to write — but a real reliability risk.

## Goals

- A launch/date change (and other explicit, attributable state facts the file doesn't yet track) produces a Sync proposal — not just narration.
- Proposal persistence is **deterministic**, not a model side-effect that can be skipped.
- Works for **both** triage paths.

## Non-goals / out of scope

- `scheduled-triage` skill — confirmed legacy; not the live scheduled path. Untouched.
- The apply path (`lib/data/state-merge.ts`) — unchanged.
- Creating missing state files (that is `/dispatch` / `/kickoff-project` work).
- Gemini meeting-note ingestion (separate gap, separate effort).
- Rewriting the stale Wild Rose state body (operator data hygiene, not this change).

## Key context

Both live paths run the **same skill** and write the **same file**:

- In-app "Run triage" button → `/api/triage/run` → `runDailyIngest()` → `claude --print … /daily-inbox-triage`.
- Scheduled (Cowork) → also `/daily-inbox-triage`.
- Both write `state/inbox-triage.md`, which already carries a `TODOS_JSON` envelope that the in-app run consumes deterministically (`extractTodosEnvelope`). The UI reads proposals from `GET /api/state-updates` (store at `aios-ui/.aios-cache/pending-state-updates.json`).

The reliability fix mirrors the **todos envelope** pattern: the model emits structured output (reliable), and deterministic code persists it.

## Design

### Data flow

```
triage run (button OR Cowork) → /daily-inbox-triage
  → writes state/inbox-triage.md  [TODOS_JSON envelope + NEW STATE_UPDATES_JSON envelope]
operator opens Sync (or badge polls) → GET /api/state-updates
  → reconcile: parse STATE_UPDATES_JSON, upsert via addProposal (dedupe + dismissed-aware)
  → return store → Sync renders → Apply → existing clobber-guarded write to state/<slug>.md
```

### Unit 1 — `daily-inbox-triage` skill edit (no code)

Rewrite **Step 9** and extend **Step 8**:

- **Widen detection.** Draft a proposal when an email either **contradicts** an existing field **OR** introduces a **materially-new, explicit, attributable** state fact the file does not yet track (the Wild Rose go-live case). Additions must be high-confidence — never inferred (the `/dispatch` no-invention rule). Guard against noise: only when the thread resolved a `project_slug` AND carries a state-relevant signal (launch/date change, status change, blocker raised/cleared) AND the state file exists.
- **Field guidance.** Launch/date changes map to `current_status` (the apply path prepends a dated bullet — non-lossy). Keep `status` / `current_status` / `next_step` / `blocker`.
- **Persistence change.** Stop hand-writing `pending-state-updates.json` (remove the read-store / compute-dedupeKey / append-file instructions). Instead **emit a `STATE_UPDATES_JSON` envelope** appended to the brief and written into `state/inbox-triage.md` (Step 8), alongside `TODOS_JSON`. The model emits **semantic fields only**:

  ```json
  {
    "generated_at": "<ISO>",
    "proposals": [
      {
        "slug": "wild-rose-redesign",
        "field": "current_status",
        "current": "(value being contradicted, or short note if a new fact)",
        "proposed": "Go-live moved July 1 → July 13 (Aaron avoiding the holiday week)",
        "evidence": { "source": "triage", "threadId": "<id|null>", "sender": "<addr|null>", "date": "YYYY-MM-DD" },
        "confidence": "high",
        "stateUpdatedAt": "<the file's **Updated:** date, verbatim — the clobber guard>"
      }
    ]
  }
  ```

  Code derives `id`, `createdAt`, `dedupeKey`. Zero proposals → `"proposals": []`. Like `TODOS_JSON`, the envelope is not announced in chat.

### Unit 2 — `extractStateUpdatesEnvelope(markdown)` (new)

In a **new module** `aios-ui/lib/skills/state-updates-envelope.ts`, mirroring `aios-ui/lib/skills/todos-envelope.ts` (a pure, client-safe parser in its own file, re-exported where needed — `extractTodosEnvelope` lives in `todos-envelope.ts`, not `daily-ingest.ts`). Parses the `STATE_UPDATES_JSON` block from `state/inbox-triage.md` content. Tolerant: missing markers or malformed JSON → `null`. Returns `{ generated_at, proposals: RawProposal[] }`.

### Unit 3 — `reconcileStateUpdates(markdown, today)` (new)

In `aios-ui/lib/cache/state-updates.ts` (it already owns the store + `addProposal`). For each raw proposal from the envelope:

- Derive `dedupeKey = \`${slug}:${field}:${sha256(proposed).slice(0,8)}\`` (`node:crypto`).
- Derive `id = "su-" + 8 hex`, `createdAt = today/now` (injected, clock-free for testability).
- Call existing `addProposal()` — which already skips when `dedupeKey` is in `proposals` or `dismissed`.

Returns count added. **Idempotent** via `dedupeKey`: re-running over the same `inbox-triage.md` adds nothing new.

### Unit 4 — wire reconcile into `GET /api/state-updates`

At the top of the GET handler: read `state/inbox-triage.md`, run `reconcileStateUpdates`, then return the store. **Single consumer** — covers both paths (both write `state/inbox-triage.md`) and the Sync badge (same endpoint). It is a write-on-read, accepted deliberately: idempotent, server-side, and the scheduled path has no post-run hook to attach a consumer to otherwise.

## Error handling

| Case | Behavior |
|---|---|
| Envelope absent / malformed | `extract` → `null`; reconcile no-ops. |
| State file missing for a slug | Model skips at draft time (never enters envelope). Apply-path `field-not-found` is the backstop. |
| Duplicate reconcile (re-read) | `dedupeKey` blocks re-add. |
| Proposal already dismissed | `addProposal` skips (dismissed-aware). |
| File changed between draft and apply | Existing clobber guard returns `stale` (`stateUpdatedAt` mismatch). |

## Testing

- **`extractStateUpdatesEnvelope`** — valid envelope; absent markers; malformed JSON → null; `"proposals": []`.
- **`reconcileStateUpdates`** — adds new; dedupes by `dedupeKey`; respects `dismissed`; derives `id`/`createdAt`/`dedupeKey`; idempotent on second call.
- **`GET /api/state-updates`** — fixture `inbox-triage.md` with an envelope → returns reconciled proposals; second call adds nothing (idempotent); no envelope → returns existing store unchanged.

## Open questions

Badge count source: **resolved** — `components/app-shell.tsx:43` fetches `GET /api/state-updates` and re-fetches on the SSE `invalidate` event, so reconcile-on-read covers view + badge.

The implementation plan (`docs/plans/2026-06-19-003-feat-triage-state-detector-hardening-plan.md`) supersedes this design and adds two items a ce-doc-review pass surfaced: a render/parse strip for the new envelope in the Triage view (the view renders `inbox-triage.md` verbatim and currently strips only `TODOS_JSON`), and serialization + atomic write for reconcile (view + badge hit the read path on the same event). See the plan for authoritative units.
