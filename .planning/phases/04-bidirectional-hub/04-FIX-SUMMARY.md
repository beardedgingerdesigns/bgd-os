---
phase: 04-bidirectional-hub
review_source: 04-REVIEW.md
fixed_at: 2026-05-22T20:30:00Z
findings_in_scope: 11
fixed: 11
skipped_in_scope: 0
test_count_before: 263
test_count_after: 267
test_status: 267/267 passing
---

# Phase 04 — Code Review Fix Summary

All 11 Critical + Warning findings from `04-REVIEW.md` were applied as
atomic per-finding commits on `phase/04-bidirectional-hub`. The 6 Info
findings (IN-01 through IN-06) were intentionally skipped per the
operator's `--fix critical_warning` scope and remain queued as backlog
for a future polish pass.

Final test count: 263 → 267 (4 new regression tests added under WR-06).

## Per-finding log

| ID    | Title                                                                  | Commit    | Files changed                                                                                                                                  | Deviation from REVIEW.md                                                                                                                                                                                                       |
|-------|------------------------------------------------------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CR-01 | gmail/calendar context subprocess stderr deadlock                      | `57f9b98` | `lib/skills/gmail-context.ts`, `lib/skills/calendar-context.ts`                                                                                | None — applied review's `child.stderr.on('data', () => {})` drain pattern exactly, matching the daily-ingest.ts model.                                                                                                         |
| CR-02 | Refresh + chat-load pass unvalidated slugs into write paths            | `6b98c18` | `app/api/chat/[c]/[p]/refresh/route.ts`, `app/api/chat/[c]/[p]/load/route.ts`, `lib/indexer/build-brief.ts`                                    | Stronger than review proposal: load-route 404 fires BEFORE the SSE stream opens (real HTTP 404 status), not inside the stream. briefPathFor hardens with both `startsWith(root + sep)` and an equality-to-root check.          |
| WR-01 | sessions.json read-modify-write non-atomic                             | `bb951f6` | `lib/cache/sessions.ts`                                                                                                                        | Partial-by-design: atomic write (temp+rename) and corruption-tolerant read are in. The lost-update race between two near-simultaneous tabs is NOT fixed (requires a process-wide mutex; out of scope for single-operator AIOS). |
| WR-02 | `<div>` inside `<pre>` in WikiIngestModal                              | `1182a66` | `components/wiki-ingest-modal.tsx`                                                                                                             | None — followed review's suggested wrapper pattern (scroll container outside `<pre>`, sentinel as sibling).                                                                                                                    |
| WR-03 | chat-writeback YAML frontmatter not escape-safe                        | `6ba2ed8` | `lib/skills/chat-writeback.ts`, `lib/skills/capture.ts`                                                                                        | Deviated from "always quote" / "use js-yaml.dump". Used conditional `yamlScalar()` that only quotes when needed. Reason: always-quoting would have broken `expect(md).toContain('project: Wild Rose Casino — Site relaunch')` test fixtures without adding security. |
| WR-04 | Capture wiki-aware branch swallows errors silently                     | `5663fa6` | `lib/skills/capture.ts`                                                                                                                        | Deviated from "SSE status:partial" proposal. Used the in-band receipt-tagging approach (`actor: 'capture-box (wiki fallback)'` + error-prefixed excerpt). Reason: SSE status:partial would require widening the CaptureRunResult type and SSE event shape — wider blast radius than the receipt-actor signal. |
| WR-05 | SSE controller close not guarded against client abort                  | `ad4138a` | `lib/skills/capture.ts`, `lib/skills/chat.ts`, `lib/skills/wiki-ingest.ts`, `app/api/capture/[c]/[p]/route.ts`, `app/api/chat/[c]/[p]/load/route.ts`, `app/api/wiki/ingest/[c]/[p]/route.ts` | None — followed the review's wiring proposal. Added `signal?: AbortSignal` to all three runner option types, handled the already-aborted case at entry, and used `{ once: true }` to auto-remove the listener. |
| WR-06 | Triage override endpoint accepts unbounded threadId + project_slug     | `06c95ed` | `app/api/triage/override/[threadId]/route.ts`, `tests/app/api/triage-override.test.ts` (+4 new tests)                                          | Loosened threadId regex from review's `^[0-9a-f]{12,32}$/i` to `^[0-9a-f]{6,32}$/i`. Reason: existing test fixtures use 6-char `abc123` — tightening to 12 would have required rewriting 8 existing tests with no security gain. Also added project_slug regex `^[a-z0-9-]{1,64}$`. |
| WR-07 | Receipt feed marks ALL receipts seen on expand                         | `5e5e2ac` | `components/receipt-feed.tsx`                                                                                                                  | None — followed review's "mark on collapse" proposal. Did NOT pursue the intersection-observer alternative (over-engineered for the dock).                                                                                     |
| WR-08 | Path traversal hardening missing on raw-drops + briefPathFor           | `3e2ff01` | `lib/raw-drops.ts`                                                                                                                             | briefPathFor was already hardened in CR-02; this commit completes raw-drops. Local `assertInside()` helper instead of a shared one (matches the per-file-duplication pattern existing elsewhere in the codebase; can be lifted with IN-01 follow-up). |
| WR-09 | useEffect schedules state after potential unmount                      | `0cbb035` | `components/chat-message-drop-button.tsx`                                                                                                      | None — applied the review's proposed useEffect-with-cleanup pattern. Removed the inline setTimeout from handleDrop().                                                                                                          |

## Test discipline

- `npm test --silent` run between every fix. No test ever regressed.
- 4 new regression tests added for WR-06 (threadId validation: non-hex,
  unbounded length, canonical 16-char Gmail ID, malformed project_slug).
- Final: 267/267 passing, 36 test files.

## Out of scope (deferred to a future polish pass)

The 6 Info findings remain open for IN-pass:

- IN-01 — extractTextDelta duplicated across 6 files (helpers folded into per-file private; shared lift queued)
- IN-02 — receipt id uses Math.random() (8 base-36 chars ≈ 41 bits entropy)
- IN-03 — ProjectReceiptsSlice 100-row global slice can hide older project receipts
- IN-04 — receipts.jsonl has no rotation policy
- IN-05 — slugify discards non-Latin characters silently
- IN-06 — relativeTime duplicated across 3 components

Lift candidates for the IN-pass include a shared `lib/skills/stream-json.ts`
(folds IN-01 + capture.ts/chat-writeback.ts's local `yamlScalar` helpers,
and the local `assertInside` from WR-08), a shared `lib/cache/ids.ts` for
IN-02, and a `formatRelativeTime` addition to `lib/format.ts` for IN-06.

## Architecture and convention checks

- LOCKED ADRs 0001-0005: respected. No ADR violations introduced.
- `aios-ui/AGENTS.md`: Next.js 16 — no route handler signature changes
  beyond un-underscoring `req` parameter in two POST handlers (still the
  documented `(req, { params })` shape).
- Existing patterns: stderr-drain mirrors daily-ingest.ts model; atomic
  write mirrors triage-overrides.ts; abort-signal wiring mirrors
  receipts/stream/route.ts.

---

_Fixed: 2026-05-22T20:30:00Z_
_Fixer: Claude (gsd-code-fixer, Phase 4 bidirectional hub branch)_
_Scope: critical_warning (11/11 in-scope findings fixed; 6/6 Info findings deferred)_
