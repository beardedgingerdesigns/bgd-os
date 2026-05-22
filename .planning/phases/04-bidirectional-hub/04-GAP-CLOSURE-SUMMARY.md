---
status: complete
phase: 04-bidirectional-hub
source:
  - 04-UAT.md
closed:
  - GAP-04-01
  - GAP-04-02
started: 2026-05-22T19:30:00Z
updated: 2026-05-22T19:45:00Z
---

# Phase 4 Gap Closure Summary — 2026-05-22

Both UAT gaps closed. Worktree is safe to merge.

## Test counts

| Stage                              | Files | Tests |
|------------------------------------|-------|-------|
| Baseline (before gap closure)      | 36    | 265   |
| After GAP-04-02 (watcher removal)  | 35    | 255   |
| After GAP-04-01 (envelope parser)  | 36    | 263   |

GAP-04-02 net -10 tests (entire `tests/lib/indexer/watcher.test.ts` removed with the module). GAP-04-01 net +8 tests (new `tests/components/triage-output.test.tsx`). No collateral failures.

---

## GAP-04-02 — Brief watcher fan-out + universal /load-project failure (HUB-02) — CRITICAL

**Decision applied: Route B — drop the watcher entirely. Lazy + Refresh button.**

### Root cause (revised after isolated reproduction)

UAT diagnosis attributed the universal `exit 1` to the `build-brief.ts` subprocess invocation. Isolated reproduction (one `/load-project wild-rose-redesign` from the worktree, captured under `/tmp/lp-out.log` then cleaned up) DISPROVED that:

- Subprocess invoked from `aios-ui/` CWD: claude bin started normally, took the slash command, ran tool calls (Bash to list memory, Read to load `project_wild_rose_walkthrough_2026-05-21.md`, etc.), produced 95KB of valid stream-json, was still working when SIGKILLed at 30s. No stderr, no exit 1.
- Stream-json content matched the same shape that `wiki-ingest.ts` (proven-working in UAT Test 9) consumes. The invocation patterns are structurally identical save for `cwd` defaults (build-brief uses `CLAUDE_OS_ROOT` constant; wiki-ingest uses `process.cwd()`).

The TRUE root cause of UAT Test 6's universal exit 1 was the **fan-out itself**: a single `clients.yaml` save triggered chokidar to schedule rebuilds for all ~22 projects. 22 concurrent `claude` subprocesses each hit the same claude-mem + context-mode `PreToolUse` hooks, which write to shared SQLite databases. The "Another write batch or compaction is already active" error surfaced as the lock contention played out. Every subprocess fell back / failed before producing any text — and the indexer's fallback path (`buildProjectBrief`) still costs filesystem reads + (per `chat-brief.ts`) a brief skill call.

In other words: **the invocation works fine when run one at a time. The watcher's fan-out converted it from a working pattern into a quota-burning storm.**

### Fix

Watcher is the bug. Removed it:

- `aios-ui/instrumentation.ts` — removed the brief-watcher boot block and the `AIOS_DISABLE_BRIEF_WATCHER` env gate. The file watcher (`lib/watcher.ts`, drives Next.js cache invalidation) stays — that's unrelated and working.
- `aios-ui/lib/indexer/watcher.ts` — deleted (no remaining importers outside its own test).
- `aios-ui/tests/lib/indexer/watcher.test.ts` — deleted (corresponding test suite).
- `aios-ui/lib/indexer/build-brief.ts` — **unchanged**. The subprocess is structurally correct; the failure was driven by concurrency, not the invocation.

### Replacement contract

Brief freshness is achieved via two paths, both already wired before this gap closure:

1. **Lazy build on first chat open per project.** `lib/skills/chat-bootstrap.ts → readBriefOrBuild → buildBriefFor` on cache miss. One subprocess at a time, scoped to the project the operator is actually opening. No fan-out.
2. **Explicit Refresh button.** The chat drawer's "Refresh context" button POSTs to `/api/chat/[client]/[project]/refresh`, which calls `buildBriefFor` for that one project. Justin controls when a rebuild runs.

HUB-02 success criterion ("brief reflects latest data when chat opens") is satisfied without pre-warming.

### Files modified

- `aios-ui/instrumentation.ts` — boot block removed
- `aios-ui/lib/indexer/watcher.ts` — **deleted**
- `aios-ui/tests/lib/indexer/watcher.test.ts` — **deleted**

### Commit

- `cf0ca79` fix(04-gap-02): rip brief watcher + lazy-only briefs (HUB-02)

### Follow-ups (deferred)

None blocking. Future plans MAY revisit a smarter watcher (lazy/queue-gated rebuild on filesystem change) once the claude-mem / context-mode lock contention is understood. The Bike Method Phase 1 stance — manual rebuild on demand — is the right default for now.

---

## GAP-04-01 — TriageOutput parser keyed to fragile prose substring filter (HUB-04, HUB-09)

### Root cause (refined during fix)

The UAT diagnosis said `THREAD_ID_REGEX` failed to match because real skill output emits thread IDs only inside the TODOS_JSON envelope. Repro against the real `triage-latest.json` capture DISPROVED that — the regex matches all three thread IDs in the prose just fine.

The TRUE root cause: **the contact-substring filter operates on PROSE that contains DISPLAY NAMES, not email addresses.** The Wild Rose thread block in the cache reads "Wild Rose group (Aaron + Krystal + Meghan + Jon)" — none of `@wildrosecorporate.com` or the individual contact emails from `clients.yaml` appear anywhere in that block. So `filterByContacts` drops the block. With every thread block dropped, the rendered output is just the section headers + the FYI / Archive sections — which TO THE OPERATOR looks like raw skill stdout.

The fix specified in GAP-04-01 (envelope parser as primary surface) is still the correct call, because:

1. Filtering by `project_slug` against `clients.yaml` is **deterministic** (vs substring-matching display-name prose).
2. The envelope schema is the skill's machine-surface contract; it's stable and the UI owns that consumption.
3. It lets us strip the envelope markers from rendered text (operators should never see `<!-- TODOS_JSON_START -->`).

### Fix

`aios-ui/components/triage-output.tsx`:

- New `renderTodosStructured(todos, projectSlug)` renders per-row cards: summary + context + Gmail link + `<TriageRowActions/>`. Empty state when zero todos match the project slug.
- Primary path: when `renderRowActions=true` AND `extractTodosEnvelope(markdown)` returns a payload, use the envelope and the structured renderer. Suppresses prose preamble + envelope text entirely.
- Fallback path: when no envelope is present (older cache, admin dashboard usage where `renderRowActions=false`), run the legacy prose-block filter. Envelope markers stripped via `TODOS_ENVELOPE_STRIP_RE` regardless of path (defense in depth).
- Reuses `extractTodosEnvelope` from `lib/skills/daily-ingest.ts` — one parser, one contract.

### Files modified

- `aios-ui/components/triage-output.tsx` — envelope-first rendering
- `aios-ui/tests/components/triage-output.test.tsx` — **new**, 8 tests covering both primary + fallback paths using a real-format fixture

### Commit

- `640cd63` fix(04-gap-01): TriageOutput parses TODOS_JSON envelope for row actions (HUB-04, HUB-09)

### Test coverage

| Test                                                                | Path           |
|---------------------------------------------------------------------|----------------|
| Parses envelope + renders only project-scoped rows                  | structured     |
| Suppresses envelope markers + raw JSON keys from rendered output    | structured     |
| Suppresses prose preamble when envelope is present                  | structured     |
| Empty-state when no todos match project slug                        | structured     |
| Renders TriageRowActions (Replied / Snooze / Not me) per row        | structured     |
| Falls back to prose-block filter when envelope is absent            | legacy         |
| Renders Gmail link for kept thread in legacy mode                   | legacy         |
| Admin mode (`renderRowActions=false`) shows prose, suppresses JSON  | admin-fallback |

---

## Re-test instructions for the operator

After pulling these commits into the worktree (`phase/04-bidirectional-hub`):

### 1. Re-run UAT Test 4 (Communications section)

Start the dev server fresh — **no `AIOS_DISABLE_BRIEF_WATCHER` env var needed** (the gate is gone):

```bash
cd aios-ui && npm run dev
```

Navigate to a Project page that has triage scope. Best target: `/clients/kirk-financial/projects/wild-rose-redesign` if the Wild Rose thread is still in the cache (it was as of UAT 2026-05-22). The Communications section should now show:

- A single card for each Wild Rose-scoped todo (envelope's `project_slug === "wild-rose-redesign"`)
- Each card: summary + context paragraph + Gmail thread link + Replied / Snooze 2d / Not me buttons
- No raw `<!-- TODOS_JSON_START -->` text. No big FYI / Archive section dump.
- If you navigate to a project with no triage scope: "No threads scoped to this project in the latest triage run."

If the existing `triage-latest.json` is stale or missing, run `/daily-inbox-triage` from the Home page first.

### 2. Re-run UAT Test 6 (Brief indexer)

The watcher is gone, so the original test goal ("edit clients.yaml → brief mtime updates within 2 seconds") is no longer the success criterion. The replacement contract is:

- Open the chat drawer for a project whose brief is missing or stale. Within ~15s, the brief should populate (lazy build via `chat-bootstrap.ts`).
- Click "Refresh context" on the chat drawer. A subprocess fires, brief rebuilds, drawer reopens in load mode (no `--resume`).
- Watch `~/.claude/projects/...` and SQLite-backed memory — **no concurrent contention errors** because only one subprocess runs at a time per operator action.

### 3. Spot-check Test 7-9 still pass

Tests 7, 8, 9 were already pass-pass-pass in the 2026-05-22 UAT. They don't depend on either gap — but a quick smoke walk-through after these commits is cheap insurance.

---

## Self-Check

- `aios-ui/instrumentation.ts` — modified, no longer imports `startBriefWatcher`. **FOUND.**
- `aios-ui/lib/indexer/watcher.ts` — **DELETED.** Confirmed missing.
- `aios-ui/tests/lib/indexer/watcher.test.ts` — **DELETED.** Confirmed missing.
- `aios-ui/components/triage-output.tsx` — modified with envelope-first render path. **FOUND.**
- `aios-ui/tests/components/triage-output.test.tsx` — **NEW.** Confirmed present.
- Commit `cf0ca79` (GAP-04-02) — **FOUND.**
- Commit `640cd63` (GAP-04-01) — **FOUND.**
- Tests after both commits: 36 files / 263 tests passing.

## Self-Check: PASSED
