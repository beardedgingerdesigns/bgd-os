---
phase: 08
status: issues_found
depth: quick
files_reviewed: 4
files_reviewed_list:
  - aios-ui/lib/types.ts
  - aios-ui/lib/data/wiki.ts
  - aios-ui/tests/lib/raw-drops.test.ts
  - .claude/skills/scheduled-triage/SKILL.md
findings_critical: 0
findings_warning: 2
findings_info: 2
---

# Phase 08: Code Review Report

**Reviewed:** 2026-06-08T00:00:00Z
**Depth:** quick
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Four files were reviewed covering the `triage-dispatch` type extension (types.ts, wiki.ts, raw-drops.test.ts) and the 440-line scheduled triage skill definition (SKILL.md). The type extension itself is mechanically correct — `triage-dispatch` is properly added to both `RawDropKind` and `PendingFile.kind`, the `detectKind` branch fires before the `other` fallback, and both new tests are structurally sound. No security issues found.

Two warnings require attention before this code runs in production: a cron expression mismatch between the skill and the activated session job that will cause silent under- or over-coverage of the triage window, and a stale JSDoc comment in wiki.ts that omits the new kind. Two informational items round out the report.

---

## Warnings

### WR-01: Cron expression conflict between SKILL.md and activated session job

**File:** `.claude/skills/scheduled-triage/SKILL.md:19` and `08-03-SUMMARY.md:25,36`

**Issue:** The canonical cron expression documented inside the skill is `0 */2 7-19 * 1-5` (fires at :00 of each even hour, 7am-7pm CT). The session job actually created by CronCreate (08-03) used `7 7-21/2 * * 1-5` (fires at :07 past the hour, every 2 hours starting at 7am, running through 9pm CT). These differ on two axes:

1. **Firing minute:** `0` (on the hour) vs. `7` (:07 past the hour). The :07 offset is actually a best practice per CronCreate docs (avoids API congestion) but the skill says `0`.
2. **End-of-window hour:** `7-19` (last fire at 7pm) vs. `7-21` (last fire at 9pm). A two-hour gap in evening coverage — the 7pm and 9pm slots either fire or don't, depending on which expression is in use.

The Desktop Routine that Justin must manually create (the durable path per 08-03) references `7 7-21/2 * * 1-5`. If the operator follows the skill document instead of the summary, the expression will be `0 */2 7-19 * 1-5`, producing a different schedule than the session job and a different last-fire window than intended.

**Fix:** Pick one canonical expression and make SKILL.md, 08-03-SUMMARY.md, and the Desktop Routine setup instructions all match. Recommended: adopt the :07-offset, 7am-9pm variant since it was intentionally chosen by CronCreate and matches the documented "7am-9pm CT" prose in 08-03. Update SKILL.md line 19 and the surrounding prose ("7am to 7pm" → "7am to 9pm"):

```
# SKILL.md line 19 — change to:
**Cron expression:** `7 7-21/2 * * 1-5`
# and update prose at line 20 to match:
This fires every 2 hours from 7am to 9pm CT, Monday through Friday.
```

---

### WR-02: Stale JSDoc comment omits `triage-dispatch` from kind list

**File:** `aios-ui/lib/data/wiki.ts:283`

**Issue:** The JSDoc block above `readPendingIngest` (line 283) lists the filename prefix kinds as `capture-, chat-decision-, chat-session-, other` — it was not updated when `triage-dispatch-` was added. Any developer reading the documentation to understand what gets returned from `readPendingIngest` will not know that `triage-dispatch` files are classified and surfaced, not treated as `other`. This is a documentation correctness failure, not just style — the comment defines the expected contract of the function's output.

**Fix:**

```typescript
// line 283 — update the kind list:
 *   chat-session-, triage-dispatch-, other).
```

---

## Info

### IN-01: `buildRawDropPath` test for triage-dispatch has redundant overlapping assertions

**File:** `aios-ui/tests/lib/raw-drops.test.ts:85-88`

**Issue:** The test at line 78 makes four assertions on the same string, where the first three (`toContain('triage-dispatch-')`, `toMatch(/triage-dispatch-\d{4}-\d{2}-\d{2}-/)`, `toMatch(/-pyro-trade-show-materials\.md$/)`) are fully subsumed by the fourth (`toBe('/tmp/w/raw/aios/triage-dispatch-2026-06-08-pyro-trade-show-materials.md')`). If `toBe` passes, the other three necessarily pass. The redundant assertions add noise and zero diagnostic value — a `toBe` failure already shows the full string diff.

Compare to the existing `chat-decision` and `chat-session` tests (lines 51-70) which use only a single `toBe`. The triage-dispatch test should follow the same pattern.

**Fix:** Remove lines 85-87; keep only line 88's `toBe` assertion. The regex assertions were likely left over from an intermediate draft when the author wasn't certain of the exact output.

---

### IN-02: Lookback window `morning_briefing` label applied to two distinct gap ranges

**File:** `.claude/skills/scheduled-triage/SKILL.md:68-69`

**Issue:** The lookback branch table (Step 0.2) assigns `mode: morning_briefing` to both `elapsed_hours > 48` (3d lookback) and `elapsed_hours > 12` (14h lookback). These represent meaningfully different situations — a weekend/holiday gap vs. a normal overnight gap — but the mode label passed downstream (Step 5 header, push notification body) is identical for both. If any downstream consumer ever branches on `mode`, it will be unable to distinguish a 3-day gap run from a 14-hour gap run.

This is not a current bug (nothing currently branches on the two cases differently) but the ambiguous mode value is a future maintenance hazard.

**Fix:** Differentiate the labels: use `weekend_gap` for `elapsed_hours > 48` and `morning_briefing` for `elapsed_hours > 12`. Update the table and the example in Step 5:

```
| elapsed_hours > 48 | 3d  | weekend_gap       |
| elapsed_hours > 12 | 14h | morning_briefing  |
```

---

_Reviewed: 2026-06-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
