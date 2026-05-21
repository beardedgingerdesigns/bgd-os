---
phase: 04-bidirectional-hub
plan: 06
subsystem: infra

tags: [chokidar, child_process, indexer, watcher, instrumentation, nextjs-16, stream-json, gray-matter]

# Dependency graph
requires:
  - phase: 04-bidirectional-hub
    provides: project-page wiki / staging surface that the watcher hooks into (04-02)
  - phase: 02
    provides: existing /load-project skill + cache resolution conventions (lib/cache/sessions.ts)
provides:
  - buildBriefFor() — single-brief builder (claude --print /load-project subprocess + JS fallback)
  - briefPathFor() — canonical .aios-cache/briefs/<client>__<project>.md resolver
  - startBriefWatcher() / stopBriefWatcher() — chokidar watcher with 500ms per-(client,project) debounce
  - reverse path → project mapping (docs_paths + wiki raw/aios/ + memory frontmatter)
  - instrumentation.ts boot integration for both watchers (file + brief), failure-isolated
affects: [04-07-chat-hydration, future indexer telemetry, future eager-build option]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Indexer subprocess pattern — spawn claude --print /load-project, parse stream-json deltas inline (clone from lib/skills/daily-ingest.ts)"
    - "Graceful degradation pattern — primary path failure does NOT propagate; fall back to JS implementation and still write the artifact, tag status='fallback' for observability"
    - "Watcher reverse-mapping — pre-build Map<resolvedPath, ProjectKey> at start so each change event is O(1) (with longest-prefix-first walk to disambiguate nested paths like project-root vs wiki/raw/aios subdir)"
    - "DI test seam — accept builder function via opts (StartBriefWatcherOptions.buildBriefFor) so tests inject a vi.fn() without vi.mock() module magic"
    - "Async test seam — __test_dispatchChange returns a Promise (handleChange does async fs reads for memory frontmatter); tests must await BEFORE advancing fake timers because vi.advanceTimersByTimeAsync does not wait on libuv I/O"

key-files:
  created:
    - aios-ui/lib/indexer/build-brief.ts
    - aios-ui/lib/indexer/watcher.ts
    - aios-ui/tests/lib/indexer/build-brief.test.ts
    - aios-ui/tests/lib/indexer/watcher.test.ts
    - aios-ui/tests/fixtures/fake-claude-load-project.sh
  modified:
    - aios-ui/instrumentation.ts

key-decisions:
  - "Use gray-matter (not regex) to parse memory frontmatter — matches lib/data/memory.ts contract and handles both top-level (client/project) and nested (metadata.client/metadata.project) shapes"
  - "Pass builder via opts (DI) rather than vi.mock — keeps tests in plain function-call land and avoids module-cache reset coupling"
  - "__test_dispatchChange returns Promise because affectedProjects() awaits fs.readFile() for memory frontmatter; without this, fake timers fire BEFORE the async resolution lands"
  - "References/ directory changes that don't resolve to a registered docs_path rebuild ALL projects (conservative). Plan implied per-project granularity but no reverse mapping exists for files outside docs_paths, and references are routinely cross-cutting."
  - "Longest-prefix-first walk over docsPathOwner + rawAiosOwner Maps — a file inside an external-wiki raw/aios/ must match the wiki owner BEFORE a shorter docs_path prefix that happens to be an ancestor"

patterns-established:
  - "Indexer = subprocess + fallback: primary path is the canonical Claude Code skill; fallback is a TS reimplementation. Both write the same artifact."
  - "Per-(client, project) debounce keys: rapid changes collapse only within a project, not across projects"
  - "Boot-time chokidar subscription list built from loadClients() reverse mappings + global anchors (clients.yaml, references/, memory/)"

requirements-completed: [HUB-02]

# Metrics
duration: ~24min
completed: 2026-05-21
---

# Phase 04 Plan 06: Background indexer + watcher Summary

**Per-project brief builder via `claude --print '/load-project <slug>'` subprocess with JS fallback, plus chokidar watcher (500ms debounce, reverse path→project mapping over docs_paths + wiki raw/aios/ + memory frontmatter), both booted from `instrumentation.ts`.**

## Performance

- **Duration:** ~24 min
- **Started:** 2026-05-21T17:00:00Z (approx)
- **Completed:** 2026-05-21T17:08:00Z (approx)
- **Tasks:** 3
- **Files created:** 5
- **Files modified:** 1

## Accomplishments

- `buildBriefFor()` spawns `/load-project` as a subprocess, aggregates stream-json text deltas, and writes the result to `.aios-cache/briefs/<client>__<project>.md`. On any failure (non-zero exit, spawn error, 60s timeout) it gracefully falls back to `buildProjectBrief()` from `lib/skills/chat-brief.ts` and STILL writes the artifact — chat hydration in 04-07 will always have something to read.
- `startBriefWatcher()` is a chokidar-based singleton with reverse mappings (docs_path → project, wiki raw/aios/ → project) precomputed at boot. Each change event resolves to N affected projects, then each affected project gets its own 500ms debounce timer keyed by `${clientSlug}__${projectSlug}`.
- `instrumentation.ts` now boots both the existing file watcher AND the new brief watcher, with independent try/catch wrappers so a failure in one cannot block the other. Smoke-tested via `npm run dev` — both log lines appeared.
- 10 new unit tests for the watcher (debounce, singleton, lifecycle, reverse mapping, frontmatter parsing) + 6 new tests for the brief builder (success, non-zero fallback, timeout fallback, mkdir, path helpers).
- Total test count climbed from 196 → 206; all 27 test files pass.

## Task Commits

Each task was committed atomically (TDD: test → feat):

1. **Task 1 (RED): failing tests for build-brief.ts** — `e3a8cfe` (test)
2. **Task 1 (GREEN): buildBriefFor implementation** — `501c718` (feat)
3. **Task 2 (RED): failing tests for brief watcher** — `05c5884` (test)
4. **Task 2 (GREEN): watcher implementation + test refinement** — `c52105b` (feat)
5. **Task 3: instrumentation.ts boots brief watcher** — `095f71b` (feat)

_(Task 3 had no TDD split — it's a 16-line integration touchpoint verified via the existing `npm run build` + dev-server smoke test rather than a unit test.)_

## Files Created/Modified

- `aios-ui/lib/indexer/build-brief.ts` (NEW, 200 lines) — `briefPathFor()` + `buildBriefFor()` with subprocess primary + JS fallback. Inline `extractTextDelta` clone from `lib/skills/daily-ingest.ts` (kept inline to avoid a fourth caller before factoring out).
- `aios-ui/lib/indexer/watcher.ts` (NEW, 233 lines) — `startBriefWatcher()` / `stopBriefWatcher()` + reverse mappings (`docsPathOwner`, `rawAiosOwner` Maps) + `__test_dispatchChange` / `__test_resetSingleton` test seams. Frontmatter parsed via `gray-matter`.
- `aios-ui/tests/lib/indexer/build-brief.test.ts` (NEW, 6 tests) — covers success, non-zero exit fallback, timeout fallback, mkdir behavior, path helpers.
- `aios-ui/tests/lib/indexer/watcher.test.ts` (NEW, 10 tests) — singleton, lifecycle, 500ms debounce, debounce key isolation, clients.yaml → all-projects fan-out, references/ untracked → all-projects, memory frontmatter → single project, subscription list shape.
- `aios-ui/tests/fixtures/fake-claude-load-project.sh` (NEW, executable) — stream-json fake binary that aggregates to a `## Project: Inside Out\n...` brief; supports `--fail` / `--slow` modes.
- `aios-ui/instrumentation.ts` (MODIFIED) — added second try/catch block that dynamic-imports `startBriefWatcher` and calls it after the existing file watcher boot.

## Decisions Made

- **Memory frontmatter parser:** Used `gray-matter` (the canonical loader from `lib/data/memory.ts`) instead of the regex sketched in the plan. Reason: existing fixture memory files store client/project under `metadata.*` not at the top level, and gray-matter handles both shapes. Plan's regex (`^client:\s*(\S+)$` / `^project:\s*(\S+)$`) would have missed every existing memory file in the fixture and likely in production too.
- **Test seam: builder injected via opts.** Rather than `vi.mock('@/lib/indexer/build-brief', ...)`, `startBriefWatcher({ buildBriefFor: vi.fn() })` lets tests pass a mock straight in. Cleaner than vi.mock module-cache contortions and zero risk of cross-test mock bleed.
- **`__test_dispatchChange` returns a Promise.** Tests must `await __test_dispatchChange(path)` BEFORE `vi.advanceTimersByTimeAsync(501)`. Discovered during GREEN — the memory tests failed because fake timers don't wait on libuv `fs.readFile()`. Documented in comments inside the watcher.
- **`references/` fallback = all projects, not no-op.** When a file inside `references/` is not registered to any project's `docs_paths`, the change rebuilds ALL projects rather than being silently ignored. References are routinely cross-cutting in this codebase (the AIOS uses them as shared context).
- **Longest-prefix-first walk** over both reverse-mapping Maps so a nested `wiki/raw/aios/` path matches its specific owner before a shorter project-root prefix that happens to be an ancestor.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Memory frontmatter regex spec wouldn't have matched any real memory file**

- **Found during:** Task 2 (watcher)
- **Issue:** Plan's spec said scan for `^client:\s*(\S+)$` and `^project:\s*(\S+)$`. But existing memory fixtures (and `lib/data/memory.ts`) use `metadata.client` / `metadata.project` under YAML frontmatter, not top-level keys. The regex would have parsed zero existing files correctly.
- **Fix:** Use `gray-matter` (already a dependency for `lib/data/memory.ts`) and check both `data.client ?? data.metadata?.client` and the same for project. Matches the existing canonical loader exactly.
- **Files modified:** `aios-ui/lib/indexer/watcher.ts` (the `readMemoryProjectFrontmatter` helper).
- **Verification:** Test "a change to memory/project_*.md with frontmatter maps to its single (client, project)" passes with the fixture file `tests/fixtures/memory/project_inside_out.md` (which uses metadata.* nesting).
- **Committed in:** c52105b

**2. [Rule 3 - Blocking] Async fs reads broke `vi.advanceTimersByTimeAsync`**

- **Found during:** Task 2 GREEN
- **Issue:** Initial implementation had `__test_dispatchChange(path)` return `void`, but `affectedProjects()` does `fs.readFile()` for memory frontmatter. `vi.advanceTimersByTimeAsync(501)` flushes microtasks but does NOT wait on libuv fs I/O — so the debounce timer fires before the async file read resolves, and the builder never gets scheduled. Two tests failed: memory-with-frontmatter and memory-no-frontmatter.
- **Fix:** Changed `__test_dispatchChange` to return `Promise<void>` (the handler's promise). Tests now `await __test_dispatchChange(path)` before advancing timers. Documented inline.
- **Files modified:** `aios-ui/lib/indexer/watcher.ts`, `aios-ui/tests/lib/indexer/watcher.test.ts`.
- **Verification:** All 10 watcher tests pass.
- **Committed in:** c52105b

---

**Total deviations:** 2 auto-fixed (1 spec bug, 1 async-test mechanic)
**Impact on plan:** Both auto-fixes essential. The frontmatter parser change is correctness; the async test seam is a test-mechanics fix that doesn't change runtime behavior. No scope creep.

## Issues Encountered

- **Sibling agent 04-03 was modifying `app/clients/[client]/projects/[project]/page.tsx` in parallel** — visible in `git status` as ` M` while I was working. I staged only my files (`git add aios-ui/lib/indexer/build-brief.ts` etc.) explicitly and never used `git add .`. Between my Task 1 and Task 2 commits, the sibling committed their changes (`c2f9016`), which cleanly resolved the situation.
- **Cross-plan deferred-items entry from 04-03** — the sibling logged that `tests/lib/indexer/watcher.test.ts` couldn't compile because `lib/indexer/watcher.ts` was missing in their worktree. That entry is now stale and will resolve on the next phase merge.

## Sub-process test fixture

Created `aios-ui/tests/fixtures/fake-claude-load-project.sh` rather than reusing an existing fixture. Reason: the existing `fake-claude.sh` emits an Inbox-Triage-shaped brief; the existing `fake-claude-chat.sh` emits session_ids that build-brief does not consume. A new fixture keeps the test-fixture intent explicit and matches the pattern set by 04-01 (`fake-claude-capture.sh`) and 04-02 (`fake-claude-ritual.sh`). Three modes (`default` / `--fail` / `--slow`) mirror the established convention.

## Boot-order considerations

`instrumentation.ts` boots in this order:
1. File watcher (`lib/watcher.ts`) — drives Next.js cache invalidation. Same as before.
2. Brief watcher (`lib/indexer/watcher.ts`) — new. Reads `clients.yaml` via `loadClients()` to build reverse mappings before subscribing.

Both are wrapped in independent `try/catch` blocks. If `loadClients()` rejects (e.g., malformed YAML), only the brief watcher fails to start; the file watcher (which has already started by this point) and the Next.js app continue. Smoke-verified by running `npm run dev` with both watchers — output:

```
[aios-ui] file watcher started
[aios-ui] brief watcher started
```

No failure mode observed during smoke testing. Both watchers boot in well under 1 second on the fixture clients.yaml (5 projects).

## Threat Flags

None — this plan adds no new network endpoints, auth paths, or trust-boundary file access. The new code spawns the local `claude` CLI (same process boundary as existing `daily-ingest`, `chat`, `ritual`, `capture`) and writes to a process-local cache directory.

## Self-Check: PASSED

Files exist:
- `aios-ui/lib/indexer/build-brief.ts` — FOUND
- `aios-ui/lib/indexer/watcher.ts` — FOUND
- `aios-ui/tests/lib/indexer/build-brief.test.ts` — FOUND
- `aios-ui/tests/lib/indexer/watcher.test.ts` — FOUND
- `aios-ui/tests/fixtures/fake-claude-load-project.sh` — FOUND
- `aios-ui/instrumentation.ts` — MODIFIED (verified via grep startBriefWatcher = 2)

Commits exist (`git log --oneline`):
- `e3a8cfe` test(04-06): add failing tests for build-brief.ts — FOUND
- `501c718` feat(04-06): buildBriefFor — /load-project subprocess + JS fallback — FOUND
- `05c5884` test(04-06): add failing tests for brief watcher — FOUND
- `c52105b` feat(04-06): brief watcher — chokidar + 500ms debounce + reverse mapping — FOUND
- `095f71b` feat(04-06): boot brief watcher from instrumentation.ts — FOUND

Tests: 206/206 passing in aios-ui (`npm test`).

## Next Phase Readiness

- Plan 04-07 (chat hydration) can now read `.aios-cache/briefs/<client>__<project>.md` on first chat open per project. The watcher keeps it fresh as `clients.yaml`, `references/`, `memory/`, `docs_paths`, and `wiki/raw/aios/` change.
- First-run policy is LAZY (per CONTEXT.md / ADR 0005): the watcher only REBUILDS existing briefs. The first build per project is triggered by chat bootstrap in 04-07.
- No blockers.

---
*Phase: 04-bidirectional-hub*
*Completed: 2026-05-21*
