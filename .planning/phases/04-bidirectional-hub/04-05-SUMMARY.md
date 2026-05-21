---
phase: 04-bidirectional-hub
plan: 05
subsystem: ui
tags: [capture, wiki, receipts, raw-drops, hub-05, hub-06, tdd, next.js]

# Dependency graph
requires:
  - phase: 04-bidirectional-hub
    provides: lib/raw-drops.ts (writeRawDrop, slugify) + lib/cache/receipts.ts (appendReceipt) from 04-01; wiki detection + readPendingIngest from 04-02/04-03
provides:
  - resolveProjectWikiPath(clientSlug, projectSlug) helper for wiki-aware capture routing
  - Wiki-aware Capture branch — UI writes directly to {wiki}/raw/aios/capture-YYYY-MM-DD-<slug>.md when the Project has a wiki
  - HUB-06 multi-regex path extractor for the /capture subprocess fallback + receipt suppression when no path is parseable
  - CaptureRunResult.fileWritten optional field for downstream UI surfaces
affects:
  - 04-06 brief indexer (will index the new raw/aios capture files on next rebuild)
  - 04-07 receipt feed dock (renders the new capture-kind receipts emitted by both branches)
  - 04-08/04-09 future write surfaces — same wiki-aware + receipt pattern is the template

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wiki-aware write routing: UI checks resolveProjectWikiPath before any skill subprocess; when a wiki is present, write directly via writeRawDrop and skip the skill entirely (per ADR 0004 staged ingestion)"
    - "HUB-06 absolute-path-required invariant for receipts: never emit a receipt with empty file_written. Subprocess branches that cannot parse a path SUPPRESS the receipt and console.warn rather than emit a half-populated one"
    - "Graceful-degradation cascade: wiki write fails → subprocess; subprocess emits unparseable output → suppress receipt; capture itself never silently fails"
    - "Awaiting async receipt write before resolve() so callers and tests observe the receipt on disk by the time runCapture returns"

key-files:
  created:
    - aios-ui/tests/fixtures/fake-claude-capture-with-path.sh
    - .planning/phases/04-bidirectional-hub/04-05-SUMMARY.md
  modified:
    - aios-ui/lib/data/wiki.ts
    - aios-ui/lib/skills/capture.ts
    - aios-ui/lib/types.ts
    - aios-ui/app/api/capture/[client]/[project]/route.ts
    - aios-ui/tests/lib/data/wiki.test.ts
    - aios-ui/tests/lib/skills/capture.test.ts

key-decisions:
  - "Kept resolveProjectWikiPath inside lib/data/wiki.ts rather than splitting it into a separate lib/data/project-wiki.ts — adding the getProject + resolveDocsPaths imports did not introduce a circular dependency (verified with tsc --noEmit, all 230 tests green, clean next build)"
  - "Wiki-aware branch builds a small YAML frontmatter (project, captured_at, source) ahead of the body so the brief indexer + future wiki-ingest passes can route the file unambiguously; matches the frontmatter style used by existing project_*.md memory files"
  - "Subprocess receipt-write is awaited (not fire-and-forget) before resolve() so unit tests and downstream UI can observe the receipt synchronously after runCapture returns"
  - "Existing claude-os/memory destination remains the fallback for projects without a wiki — no behavior change for non-wiki clients"

patterns-established:
  - "Multi-regex path-extraction pipeline: ordered array of patterns, first match wins, no-match logs a warning and suppresses the receipt rather than corrupting the receipt feed"
  - "Per-test fixture mutation pattern for clients.yaml: snapshot original → patch /WILL_BE_REPLACED_AT_TEST_TIME → invalidateClients() → restore in afterEach. Lets tests inject tmpdir paths into the shared YAML fixture without polluting other suites"

requirements-completed: [HUB-05, HUB-06]

# Metrics
duration: 8m
completed: 2026-05-21
---

# Phase 04 Plan 05: Wiki-Aware Capture + Receipts Summary

**Capture writes directly into `{wiki}/raw/aios/` when a wiki is present and emits a `capture`-kind receipt to `.aios-cache/receipts.jsonl`; subprocess fallback only emits a receipt when its stdout exposes a parseable absolute `.md` path.**

## Performance

- **Duration:** 8m 4s
- **Started:** 2026-05-21T22:24:17Z
- **Completed:** 2026-05-21T22:32:21Z
- **Tasks:** 2
- **Files modified:** 6 (1 created)
- **Test count:** 230 passed across 29 files (4 new capture-test cases + 4 new wiki-test cases)

## Accomplishments

- New `resolveProjectWikiPath(clientSlug, projectSlug)` helper resolves a Project's `docs_paths` through `detectWiki` and returns the first matching wiki rootPath, or null. Lives alongside the other wiki helpers in `lib/data/wiki.ts` (no circular-dep split needed).
- Capture flow rewritten to be wiki-aware: when a wiki is present the UI bypasses the `/capture` skill subprocess entirely and writes directly via `writeRawDrop` from 04-01. The body carries a small frontmatter (`project`, `captured_at`, `source: aios-ui capture-box`) so the brief indexer + future wiki-ingest can route it unambiguously.
- HUB-06 absolute-path-required invariant enforced on the subprocess branch via a 4-pattern regex pipeline (`PATH_REGEXES`). Hit → receipt is emitted. Miss → receipt is **suppressed** with a `[capture] subprocess succeeded but no path parseable from stdout; receipt suppressed to honor HUB-06` warning. The capture still returns `status: 'success'` so the operator's input is never silently rejected.
- Graceful-degradation cascade in place: wiki write failure (EACCES/ENOTDIR/exhausted collision suffixes) falls back to subprocess, which then runs its own regex-or-skip receipt logic. Tested with an "unwritable wiki" fixture (`raw/aios` pre-created as a regular file).
- `CaptureRunResult.fileWritten?: string` added so downstream UI (receipt-feed dock, future brief-indexer triggers) can read the absolute path directly off the result.

## Task Commits

Each task was committed atomically:

1. **Task 1: resolveProjectWikiPath helper + tests** — `3d5a160` (feat)
2. **Task 2: runCapture wiki-aware branch + receipt emission**
   - RED: `979db09` (test) — 4 failing capture tests + new fixture binary
   - GREEN: `116910b` (feat) — wiki branch, multi-regex extractor, receipt-suppression, API route forwarding

**Plan metadata commit:** appended after SUMMARY write.

## Files Created/Modified

- `aios-ui/lib/data/wiki.ts` — Added `resolveProjectWikiPath` export + the two new imports (`getProject`, `resolveDocsPaths`). No circular dep.
- `aios-ui/lib/skills/capture.ts` — Wiki-aware branch (HUB-05) before subprocess; `PATH_REGEXES` ordered list (R1–R4); subprocess receipt-write awaited before resolve(); graceful fallback when wiki write throws.
- `aios-ui/lib/types.ts` — `CaptureRunResult.fileWritten?: string` added with inline docstring explaining wiki vs subprocess semantics.
- `aios-ui/app/api/capture/[client]/[project]/route.ts` — Forwards URL params `client` + `project` to `runCapture` as `clientSlug` + `projectSlug`.
- `aios-ui/tests/lib/data/wiki.test.ts` — Added `describe('resolveProjectWikiPath')` block: 4 cases (wiki-present, no-wiki, no-docs_paths, unknown-slug).
- `aios-ui/tests/lib/skills/capture.test.ts` — Existing 3 subprocess tests now pass `clientSlug` + `projectSlug`. New `describe('runCapture wiki-aware branch (HUB-05) + receipt emission (HUB-06)')` block: wiki-success, subprocess-with-path, subprocess-no-path-skip, unwritable-wiki-fallback.
- `aios-ui/tests/fixtures/fake-claude-capture-with-path.sh` — New `claude` stand-in that emits either `"Wrote capture to <path>"` (parseable) or `"ok, captured to memory (no path surfaced)"` (no parseable path) under flags `--emit-path=<abs>` / `--no-path`.

## Final PATH_REGEXES array (shipped)

```ts
const PATH_REGEXES: RegExp[] = [
  /(?:Wrote|Created|Saved)\s+(?:.*?\s+(?:to|:)\s+)?(\/[^\s'"`]+\.md)/i,  // R1
  /(?:file|path)[:=]\s*"?(\/[^\s'"`]+\.md)"?/i,                          // R2
  /Captured to\s+(\/[^\s'"`]+\.md)/i,                                    // R3
  /(\/Users\/[^\s'"`]+\.md)/,                                            // R4
]
```

R1 fires in tests today (the fake binary uses `"Wrote capture to <path>"`). The remaining patterns are guards for variant phrasings the real `/capture` skill might emit; manual-smoke hit-rate cannot be measured until the operator runs the dev server against a wiki-enabled project (see Manual Smoke section).

## Decisions Made

- **Keep `resolveProjectWikiPath` in `wiki.ts` (don't split into project-wiki.ts).** `getProject` lives in `lib/data/clients.ts` and `resolveDocsPaths` lives in `lib/data/references.ts` — neither imports from `wiki.ts`, so no circular reference. `tsc --noEmit` + 230/230 tests + `next build` all clean.
- **Required (not optional) clientSlug/projectSlug on `RunCaptureOptions`.** Per plan-checker guidance, defaulting them to `''` would let stale call sites silently produce un-routable receipts. Making them required surfaced the single existing call site (the API route) at compile time.
- **Suppress receipt when subprocess emits no parseable path** rather than emit one with an empty `file_written` field. This matches the plan-checker iteration-1 warning: "subprocess fallback must NOT emit a receipt with empty file_written." Confirmed via test 3 (`subprocess branch with NO parseable path SKIPS the receipt`).
- **Await receipt write before resolve().** A fire-and-forget `appendReceipt(...)` would have left tests checking `receipts.jsonl` immediately after `await runCapture(...)` racing the disk write. The `finalize()` wrapper handles the receipt write inside the `'close'` handler's resolve flow.

## Deviations from Plan

None - plan executed exactly as written.

The plan's iteration-1 plan-checker warning (HUB-06 suppression vs. empty-path receipts) was followed verbatim — the suppression branch is implemented and tested.

## Issues Encountered

- **TS-strictness lesson on test setup.** `CLAUDE_OS_ROOT` and `CLIENTS_YAML_PATH` are top-level consts evaluated at module-load, so the natural reflex of `process.env.CLAUDE_OS_ROOT = tmpdir` inside a test would have been a no-op. Resolved by mutating the existing fixture `clients.yaml` in-place (snapshot → patch → `invalidateClients()` → restore) — the same pattern can serve future tests that need to inject tmpdir paths.

## /capture skill changes

None. The skill is unchanged in this plan — the UI now bypasses it on the wiki branch, and the subprocess branch reads whatever the skill emits today via the multi-regex extractor.

## Manual Smoke (deferred — requires `npm run dev` against the project page)

The plan's `<verification>` section calls for a live capture against a wiki-enabled project (e.g. Wild Rose). That requires `npm run dev` + the operator's browser; it is OUT of scope for autonomous test-only verification but is documented here for the next handoff:

- Open the Wild Rose Project page; type `verification capture about Meghan handoff` + ⌘↵.
- Expect the receipt feed dock to show a row within ~2s with `kind=capture`, `project_slug=wild-rose`, `file_written=/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/capture-2026-05-21-verification-capture-about-meghan-handoff.md`.
- Click the path → opens in VS Code; file should contain the captured text + the YAML frontmatter (`project`, `captured_at`, `source: aios-ui capture-box`).
- Open a non-wiki Project (e.g. an internal one); capture there. If `/capture` emits a parseable path the receipt appears. If not, the capture succeeds silently and the warning is visible in the server logs — no receipt with an empty `file_written`.

## Next Phase Readiness

- 04-06 brief indexer can begin assuming `{wiki}/raw/aios/capture-*.md` files appear when the operator captures against a wiki-enabled project.
- 04-07 receipt feed dock has a guaranteed capture-kind receipt source for every wiki-routed write (and conditionally for subprocess writes that parse a path).
- `resolveProjectWikiPath` is now the canonical "does this Project have a wiki?" probe for future write surfaces (chat-decision, chat-session drops in 04-08/04-09).

## Self-Check: PASSED

- File `aios-ui/lib/data/wiki.ts` (modified) — present, exports `resolveProjectWikiPath`.
- File `aios-ui/lib/skills/capture.ts` (modified) — present, contains wiki-aware branch + PATH_REGEXES.
- File `aios-ui/lib/types.ts` (modified) — present, `CaptureRunResult.fileWritten?` added.
- File `aios-ui/app/api/capture/[client]/[project]/route.ts` (modified) — present, forwards clientSlug + projectSlug.
- File `aios-ui/tests/lib/data/wiki.test.ts` (modified) — present, includes new `describe('resolveProjectWikiPath')` block.
- File `aios-ui/tests/lib/skills/capture.test.ts` (modified) — present, includes new HUB-05/HUB-06 describe block.
- File `aios-ui/tests/fixtures/fake-claude-capture-with-path.sh` (created) — present, executable, emits parseable + no-path variants.
- Commit `3d5a160` (Task 1 feat) — FOUND in `git log`.
- Commit `979db09` (Task 2 RED) — FOUND in `git log`.
- Commit `116910b` (Task 2 GREEN) — FOUND in `git log`.
- `npm test` — 230/230 pass.
- `npm run build` — clean compile, 0 TS errors, 0 Failed-to-compile.

## TDD Gate Compliance

Task 2 was a TDD task (`tdd="true"`). Gate sequence verified:

1. RED gate commit: `979db09 test(04-05): failing tests for runCapture wiki-aware + receipt branch` — 4 failing tests + new fixture, tsc reports missing `clientSlug` and `fileWritten`.
2. GREEN gate commit: `116910b feat(04-05): wire wiki-aware capture + receipt emission` — implementation that makes all 4 tests pass + 230/230 suite green.
3. REFACTOR: not needed — implementation matches the plan's interface spec exactly and the green pass is clean.

---
*Phase: 04-bidirectional-hub*
*Plan: 05*
*Completed: 2026-05-21*
