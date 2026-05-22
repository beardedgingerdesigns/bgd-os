---
status: complete
phase: 04-bidirectional-hub
source:
  - 04-01-SUMMARY.md
  - 04-02-SUMMARY.md
  - 04-03-SUMMARY.md
  - 04-04-SUMMARY.md
  - 04-05-SUMMARY.md
  - 04-06-SUMMARY.md
  - 04-07-SUMMARY.md
  - 04-08-SUMMARY.md
  - 04-09-SUMMARY.md
started: 2026-05-22T16:00:00Z
updated: 2026-05-22T16:00:00Z
---

## Current Test

UAT COMPLETE. See Summary + Gaps sections.

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running aios-ui dev server. Clear `.next/` cache. Run `npm run dev` from the phase worktree's `aios-ui` directory. Server boots without errors. Console shows both watchers start (file watcher + brief watcher). `localhost:3000` renders Home with no browser-console errors.
result: pass (2026-05-22) — Next.js 16.2.6 Turbopack ready in 869ms on port 3001 (3000 held by orphan PID 27848 — operator should kill later). Both watcher start lines present: `[aios-ui] file watcher started`, `[aios-ui] brief watcher started`. No errors.

### 2. Receipt feed dock visible on every page (HUB-06)
expected: Open any page (Home, a Client page, a Project page). Look at the bottom-right corner — a collapsible Receipt feed dock is present with an unseen-count badge (zero or a number). Clicking it expands to show the last 20 receipts (likely empty on a cold start).
result: pass (2026-05-22) — dock visible, badge showing 0.

### 3. Wiki Display renders on a Project page with a wiki (HUB-08)
expected: Navigate to Wild Rose project page (`/clients/kirk-financial/projects/wild-rose-redesign`). The wiki section now shows **expandable sections with titles + first paragraphs** — NOT just counts like "X active · X deferred · X log entries". Sections: Active Decisions, Recent log entries, Deferred Decisions. Clicking a decision title opens the `.md` file in your editor (via `vscode://file/{absolute_path}`).
result: pass-conditional (2026-05-22) — 0 active, 5 log entries, 0 deferred. Counts are accurate: Wild Rose wiki has no `decisions/` directory (uses `pages/sources|entities|topics/` per Karpathy LLM Wiki pattern, not ADR-style). Decisions rendering can't be exercised here since no decision files exist. Log section render verified. Click-to-open against a log entry: pending spot-check.

### 4. Communications section + triage override actions (HUB-04, HUB-09)
expected: On a Project page (preferably one with active contacts like Wild Rose or Thermal Kitchen), a Communications section renders below the wiki display. If you've run `/daily-inbox-triage` recently, threads scoped to that Project's `contacts` appear with per-row buttons: Replied / Snooze / Not me. Clicking one of those buttons writes an entry to `aios-ui/.aios-cache/triage-overrides.json`. Re-running daily ingest does NOT re-surface that thread.
result: issue (2026-05-22) — section renders but dumps raw skill stdout instead of parsed per-thread rows. Root cause: `triage-output.tsx` THREAD_ID_REGEX expects `Thread: \`xxxx\`` markdown markers in prose; actual skill output only emits thread_id inside the TODOS_JSON envelope. Parser finds zero threads → no filter applied → no row actions rendered → entire markdown shown raw.

### 5. Capture writes to wiki raw/aios/ + emits receipt (HUB-05, HUB-06)
expected: On Wild Rose project page (has a real wiki at `/Users/justinlobaito/repos/wild-rose/wiki/`), type "uat verification capture" into the Capture box and submit. Within seconds: a new file lands at `/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/capture-2026-05-22-uat-verification-capture.md`, and the Receipt feed dock shows a new row with a `capture` chip, `wild-rose-redesign` slug, the excerpt, and the absolute file path clickable.
result: pass (2026-05-22) — receipt appeared in dock, file landed in wild-rose wiki raw/aios/, AND Pending Ingestion section auto-incremented (cross-validates Test 9 partial behavior).

### 6. Brief indexer + watcher rebuilds on filesystem change (HUB-02)
expected: Pick a project (e.g. wild-rose-redesign). Confirm a brief exists at `aios-ui/.aios-cache/briefs/<slug>.md`. Note its mtime. Edit `clients.yaml` (add a trailing comment, save). Within ~2 seconds, the brief file's mtime updates (chokidar 500ms debounce + `/load-project` subprocess rebuild). Re-running watcher status should NOT throw.
result: critical issue (2026-05-22) — watcher fan-outs ALL projects on a single `clients.yaml` change. `/load-project` subprocess returns exit 1 universally. Falls back to `buildProjectBrief` but still consumes Claude quota. SQLite compaction race surfaces ("Another write batch or compaction is already active"). Justin's session quota hit limit instantly. WATCHER IS ACTIVELY HARMFUL — must not ship.

### 7. Chat hydration: brief load + live Gmail/calendar at bootstrap (HUB-01, HUB-03, HUB-04)
expected: On a Project page, expand the chat drawer. The drawer shows "Brief loaded (built Nm ago)" status and a "Refresh context" button. Type a question that requires project knowledge (e.g. for Wild Rose: "What's the current launch date?"). Chat answers from the brief content. Send a follow-up that references the prior turn (e.g. "Who's the day-to-day contact for that?"). Chat continues coherently — session continuity is alive (claude --resume working). Refresh the page — chat history persists (sessions.json).
result: pass (2026-05-22) — Wild Rose chat hydrated correctly. Asked "current launch date" → answered "mid/late June" pulling from memory file + Aaron's 5/13 slip context + Thermal Kitchen load. Also offered to fetch Gmail/Gemini for fresher info, confirming live tools are wired (HUB-04). HUB-01 (brief read at bootstrap), HUB-04 (live tools available) confirmed. HUB-03 multi-turn continuity NOT exercised in this test but covered by unit test in 04-07 Task 4. Worktree had pre-existing briefs (built before watcher was disabled), so read path tested cleanly.

### 8. Chat write-back: Drop to raw + session-close transcript drop (HUB-05, HUB-06)
expected: With the chat session open and at least one AI turn present, click "Drop to raw" on an AI message. A new file lands at `{wiki}/raw/aios/chat-decision-2026-05-22-<slug>.md` containing the prior user turn + that AI turn. Receipt fires with `chat_drop` kind. Then close the chat drawer or start a new session — a `{wiki}/raw/aios/chat-session-2026-05-22-<session-id>.md` transcript drops + `chat_session_close` receipt fires.
result: pass (2026-05-22) — all three write-back surfaces verified: Drop-to-raw button on AI message creates chat-decision file + receipt; session-close creates chat-session transcript + receipt; Pending Ingestion increments on each drop.

### 9. Pending Ingestion section + Run wiki ingest (HUB-07)
expected: After Tests 5 and 8 produced raw drops, the Pending Ingestion section on the Project page shows a count > 0 listing those drops. Click "Run wiki ingest". A modal opens and streams the ingest skill's output. On success: the drops are promoted into the curated wiki (new files in `wiki/sources/` or `wiki/decisions/active/`, new ingest entry in `wiki/log.md`), the Pending Ingestion count returns to 0, and a `wiki_ingest` receipt appears in the feed summarizing the promotions.
result: pass (2026-05-22) — `wiki_ingest` receipt fired showing "promoted 2, deferred 1, contested 0". /ingest-aios-drops skill subprocess succeeded — narrows GAP-04-02 to /load-project specifically, not all subprocess invocations. 1 of 3 raw drops (likely the chat-session transcript) was correctly deferred by the curator per LLM-wiki schema.

## Summary

total: 9
passed: 7
issues: 2
pending: 0
skipped: 0

## Gaps

### GAP-04-02: Brief watcher fan-out + universal /load-project failure burns quota (HUB-02) — CRITICAL

**Surfaces in:** Test 6 (Brief indexer + watcher).

**Symptom:** Editing `clients.yaml` once triggers the brief watcher to spawn `/load-project` subprocesses for ALL ~22 projects in `clients.yaml` simultaneously. Every single subprocess returns `exit 1` and falls back to `buildProjectBrief`. SQLite compaction errors surface ("Another write batch or compaction is already active") — claude-mem or context-mode db lock contention from concurrent writes. Justin's Claude session quota hit limit instantly.

**Root causes (stacked):**

1. **Fan-out trigger.** Per `aios-ui/lib/indexer/watcher.ts`, a watched change to `clients.yaml` cascades to a rebuild call per project (clients.yaml is in every project's dependency set). 22+ subprocess spawns per save. No debounce gating across projects.
2. **`/load-project` subprocess universally fails with exit 1.** Not project-specific — every project. Indicates a problem with the subprocess invocation itself, not the skill content. Probable suspects:
   - Argument format mismatch (`claude /load-project <slug>` vs the skill's expected invocation form)
   - Subprocess CWD or env doesn't satisfy `/load-project`'s expectations
   - Slash-command resolution / permission gate inside the spawned `claude` process
   - The skill subprocess hits a hook (claude-mem / context-mode) that blocks early
3. **Fallback `buildProjectBrief` still costs Claude calls.** Justin reported quota hit even with the fallback path running. Either the fallback is silently calling out, or the failed subprocess attempts themselves are counting against quota even on exit 1.
4. **SQLite compaction race.** 22 concurrent subprocesses each likely hit a claude-mem / context-mode PreToolUse hook that writes to a shared db. Concurrent writes contend the lock; the error messages confirm.

**Severity:** CRITICAL / blocking — the watcher is actively harmful as wired. Editing `clients.yaml` (an everyday operator action) burns quota uncontrollably. Cannot ship.

**Mitigation applied for UAT continuation:** Added `AIOS_DISABLE_BRIEF_WATCHER=1` env gate in [aios-ui/instrumentation.ts](../../../aios-ui/instrumentation.ts). With that env var set, the brief watcher boot is skipped. Use this to continue UAT Tests 7, 8, 9. The fix proper happens in gap-closure.

**Proposed fix scope (gap-closure):**
1. Diagnose why `/load-project` subprocess returns exit 1. Reproduce in isolation (`claude --print /load-project wild-rose-redesign` from CLI). Inspect stderr. Look at whether the existing `lib/skills/ritual-chat.ts` subprocess pattern works for `/load-project` (it does in production for chat-bootstrap) vs. the indexer's invocation in `lib/indexer/build-brief.ts`.
2. Add fan-out gating to the watcher: when `clients.yaml` changes, debounce 2-5 seconds AND queue/rate-limit project rebuilds (e.g., max 2 concurrent subprocesses, sequential dispatch).
3. Consider switching the watcher to LAZY-only: don't rebuild on filesystem change at all; mark briefs stale, rebuild on next chat-open per project. The HUB-02 success criterion can be satisfied either way — the goal is "brief reflects latest data when chat opens," not "brief always pre-built."
4. Add a "brief watcher health" endpoint or log so we can observe rebuild storms in real-time without staring at console.

**Files to modify:**
- `aios-ui/lib/indexer/watcher.ts` — gating / debounce / lazy mode
- `aios-ui/lib/indexer/build-brief.ts` — diagnose + fix subprocess invocation
- `aios-ui/instrumentation.ts` — remove the temporary AIOS_DISABLE_BRIEF_WATCHER gate once fix lands

**Tests:**
- Integration test: simulate clients.yaml save, assert subprocess concurrency ≤ N, assert no spurious project rebuilds for unaffected projects
- Subprocess-success contract test that doesn't burn quota (uses fake claudeBin)

---

### GAP-04-01: TriageOutput parser keyed to obsolete `Thread:` marker format (HUB-04, HUB-09)

**Surfaces in:** Test 4 (Communications section).

**Symptom:** Communications section on Project page renders the entire raw daily-inbox-triage skill stdout (including the TODOS_JSON envelope as visible text) instead of parsed per-thread rows with Replied / Snooze / Not me action buttons.

**Root cause:** [aios-ui/components/triage-output.tsx](../../../aios-ui/components/triage-output.tsx) line 25:
```typescript
const THREAD_ID_REGEX = /Thread:\s*`?([0-9a-f]{12,20})`?/g
```
The parser searches for `Thread: \`xxxx\`` style markers in the prose. The current daily-inbox-triage skill output emits thread IDs ONLY inside the `<!-- TODOS_JSON_START --> ... <!-- TODOS_JSON_END -->` envelope as structured JSON (`"thread_id": "19e4bd7fb716f3a4"`). The skill prose contains no `Thread:` markers, so the regex finds zero matches.

Consequences:
- `splitIntoBlocks` puts everything in null-threadId blocks
- `filterByContacts` preserves ALL null-threadId blocks (lines 77-79 — designed for headers/intro text)
- No Gmail-link replacement happens
- No `TriageRowActions` render
- Raw markdown rendered as `<div>` per line

**Why tests passed:** Plan 04-04's unit test fixture for `triage-output` used a synthetic markdown with `Thread:` markers — not real skill output. Integration gap.

**Proposed fix:** Update `triage-output.tsx` to parse the `<!-- TODOS_JSON_START -->` envelope and use the structured `todos` array as the primary data source:
1. Find the JSON envelope between `<!-- TODOS_JSON_START -->` and `<!-- TODOS_JSON_END -->`
2. Parse the JSON (todos array with `id`, `thread_id`, `summary`, `context`, `client_slug`, `project_slug`, `suggested_action`, `status`)
3. Filter by `project_slug` (matches `projectSlug` prop)
4. Render each todo as: summary + context + Gmail link + `TriageRowActions` (Replied / Snooze / Not me)
5. Fall back to current markdown-parsing path if no envelope found (keeps the legacy contract alive)
6. Suppress the raw envelope text from display (it's a system marker, not user-facing)

**Files to modify:**
- `aios-ui/components/triage-output.tsx` — add envelope parser
- `aios-ui/tests/components/triage-output.test.tsx` (or wherever it lives) — add a fixture using REAL skill output format

**Touches:** HUB-04 (display) + HUB-09 (override actions, which depend on rows rendering)

**Severity:** blocking — Phase 4's headline operator-comms surface doesn't work as designed.
