---
phase: 04
plan: 02
subsystem: aios-ui/wiki-data
tags: [hub, wiki, decisions, ingest, data-layer, fs-readers, tdd]
requires:
  - phase: 04
    plan: 01
    reason: Phase-04 baseline (CONTEXT.md, receipts, raw-drops); no direct API dep.
provides:
  - shape: DecisionsBuckets
    api: "readWikiDecisions(wikiPath): Promise<DecisionsBuckets>"
    purpose: "Hub Wiki section needs titles + first-paragraph previews for active + deferred decisions; capped at 20 each, mtime DESC."
  - shape: PendingIngestResult
    api: "readPendingIngest(wikiPath): Promise<PendingIngestResult>"
    purpose: "HUB-07 count and HUB-08 detail rely on knowing which raw/aios/*.md files are newer than the most recent wiki ingest pass."
affects: ["aios-ui/lib/data/wiki.ts", "aios-ui/lib/types.ts"]
tech-stack:
  added: []     # pure fs/promises + path — no new deps
  patterns:
    - "fs.readdir/readFile/stat + Promise.all for parallel file IO"
    - "Defensive ENOENT swallow: missing dir => empty result, not throw"
    - "Bucket-cap + sort pattern (DESC by mtime, slice(0, N))"
    - "End-of-day ingest timestamp (23:59:59Z) prevents same-day false-pending"
key-files:
  created:
    - .planning/phases/04-bidirectional-hub/deferred-items.md
  modified:
    - aios-ui/lib/data/wiki.ts
    - aios-ui/lib/types.ts
    - aios-ui/tests/lib/data/wiki.test.ts
decisions:
  - "lastIngestAt uses 23:59:59Z end-of-day so captures dropped same-day as an ingest header are NOT falsely flagged pending."
  - "Bucket cap of 20 enforced inside readDecisionDir (not the caller) so all consumers share the same UX-safe ceiling."
  - "Files under decisions/implemented/ and decisions/superseded/ deliberately ignored — the hub surfaces in-flight thinking only."
  - "INGEST_LOG_HEADER tolerates hyphen, en-dash, em-dash, and pipe separators between date and the word 'ingest' (mirrors LOG_H2_HEADER liberality)."
metrics:
  duration_minutes: ~25
  tasks_completed: 2
  files_touched: 4
  tests_added: 20    # 11 readWikiDecisions + 9 readPendingIngest
  tests_total_in_suite: 183
  commits: 4         # 2 RED + 2 GREEN
completed_date: 2026-05-21
---

# Phase 04 Plan 02: Wiki Decisions + Pending Ingest Readers — Summary

Added two pure-filesystem readers to `aios-ui/lib/data/wiki.ts` so downstream
hub plans (04-03 wiki display, 04-06 indexer-watcher trigger, 04-09 Pending
Ingestion UI) can render decisions with previews and surface the count of
captures awaiting wiki ingest.

## What was built

### Types (`aios-ui/lib/types.ts`)

Appended four new interfaces under a clearly-labeled 04 section. Append-only —
existing exports unchanged:

- `DecisionSummary` — `{ slug, title, firstParagraph, filePath, modified }`
- `DecisionsBuckets` — `{ active: DecisionSummary[], deferred: DecisionSummary[] }`
- `PendingFile` — `{ filename, filePath, mtime, kind }` where `kind` is one of
  `'capture' | 'chat-decision' | 'chat-session' | 'other'`
- `PendingIngestResult` — `{ count, files, lastIngestAt }`

### `readWikiDecisions(wikiPath): Promise<DecisionsBuckets>`

Reads `<wikiPath>/decisions/active/*.md` and `<wikiPath>/decisions/deferred/*.md`.

Per-file parsing:
- YAML frontmatter (`---\n…\n---\n`) is stripped before scanning.
- Title = first line matching `^# (.+)$`; falls back to humanized slug (e.g.
  `no-header-decision` → `"No Header Decision"`).
- `firstParagraph` = first contiguous non-empty block after the H1 whose lines
  don't start with `#`; joined with single spaces; capped at 300 chars; `""`
  when only headers exist.
- `modified` = `fs.stat().mtime`.

Edge cases:
- Missing `decisions/` directory ⇒ `{ active: [], deferred: [] }`.
- `decisions/implemented/` and `decisions/superseded/` are **deliberately ignored**.
- Non-`.md` files in `active/` or `deferred/` are filtered out.
- Each bucket is **sorted DESC by `modified`** and **capped at 20 entries**.
- Returned `filePath` is absolute (whatever `wikiPath` supplied is preserved).

### `readPendingIngest(wikiPath): Promise<PendingIngestResult>`

Lists `<wikiPath>/raw/aios/*.md` files whose mtime is newer than the most
recent `## [YYYY-MM-DD] ingest |` header in `<wikiPath>/log.md`.

Header regex (`INGEST_LOG_HEADER`):
```
/^##\s+\[?(\d{4}-\d{2}-\d{2})\]?\s*[-—–|]?\s*ingest\b/i
```
- Accepts bracketed (`[2026-05-15]`) and bare (`2026-05-15`) dates.
- Accepts hyphen, em-dash, en-dash, or pipe as the separator before "ingest".
- "ingest" matched case-insensitively with word-boundary anchor.

`lastIngestAt` computation:
- Scans every log.md line, collects all matching dates, picks the
  chronologically latest.
- Stored as **end-of-day UTC** (`YYYY-MM-DDT23:59:59Z`). This avoids a subtle
  false-positive: if you ingest on day X and then capture a new file on day X
  ten minutes later, the new file's mtime is greater than `T23:59:59Z`-on-day-X
  only if midnight passed — which is what we want for the "next ingest pass"
  signal. Without end-of-day shifting, every same-day capture would appear
  pending even after the ingest pass that swept it.

Edge cases:
- Missing `raw/aios/` directory ⇒ `{ count: 0, files: [], lastIngestAt: null }`.
- Missing `log.md` OR present but no ingest header ⇒ ALL `.md` files in
  `raw/aios/` are returned as pending and `lastIngestAt: null`.
- Out-of-order log entries: the MAX date wins (sort DESC, take first).
- Non-`.md` files (`.txt`, `.DS_Store`, etc.) in `raw/aios/` are ignored.
- Files are sorted DESC by mtime in the response.

Kind detection (`PendingFile.kind`):
| Filename prefix       | kind            |
|-----------------------|-----------------|
| `capture-`            | `capture`       |
| `chat-decision-`      | `chat-decision` |
| `chat-session-`       | `chat-session`  |
| anything else         | `other`         |

Filenames matching none of the canonical prefixes fall through to `'other'`
rather than throwing — the watcher and Pending Ingestion UI can still surface
them with a generic chip.

## Files touched

| File | Change |
|------|--------|
| `aios-ui/lib/types.ts` | +27 lines: 4 new interfaces, append-only under a labeled section |
| `aios-ui/lib/data/wiki.ts` | +148 lines: 2 exports + 5 private helpers, no changes to existing detectWiki / readWikiLogEntries |
| `aios-ui/tests/lib/data/wiki.test.ts` | +432 lines: 2 new `describe` blocks (11 + 9 cases), shared `mkTmpWiki` / `writeMd` helpers |
| `.planning/phases/04-bidirectional-hub/deferred-items.md` | New: logged pre-existing Next.js `LayoutProps`/`PageProps` tsc errors as out-of-scope for 04-02 |

## Test counts

- Plan-added tests: **20** (11 for `readWikiDecisions`, 9 for `readPendingIngest`).
- `wiki.test.ts` total after this plan: **25** (5 pre-existing + 20 new).
- Full repo test suite: **183 passed across 24 files**, `npm test`.

## Commits (atomic per TDD gate)

| Hash | Message |
|------|---------|
| `6bd7fc3` | `test(04-02): add failing tests for readWikiDecisions + new types` (RED) |
| `5ffd368` | `feat(04-02): readWikiDecisions reads active+deferred buckets` (GREEN) |
| `de08169` | `test(04-02): add failing tests for readPendingIngest` (RED) |
| `e719f7c` | `feat(04-02): readPendingIngest detects un-ingested raw/aios files` (GREEN) |

## Requirements satisfied

- **HUB-07** — A canonical `count` of un-ingested AIOS captures can now be
  derived from `readPendingIngest(wikiPath).count`. Downstream 04-09 uses this
  as the "Pending ingest: N" tile; 04-06 uses it to decide whether to nudge
  the user toward `/ingest-wiki-pass`.
- **HUB-08** — Active and deferred decision titles + first-paragraph previews
  are now available via `readWikiDecisions(wikiPath)`. Downstream 04-03 renders
  them as expandable rows in the hub Wiki section.

Plans 04-03 and 04-09 can both import these directly from `@/lib/data/wiki`
without further data-layer work.

## Deviations from plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking test bug] Bogus substring assertion in 300-char cap test**
- **Found during:** Task 1 GREEN run.
- **Issue:** The test "joins multi-line paragraphs with spaces and caps at 300
  chars" included `expect(firstParagraph).toContain('a a')`. The fixture body
  was `${'a'.repeat(200)}\n${'b'.repeat(200)}` — joining with a single space
  produces `aaa...aaa bbb...bbb`. There is no `a` adjacent to whitespace
  followed by another `a` anywhere in that string, so the assertion could not
  pass even with correct code.
- **Fix:** Replaced the bad assertion with two stronger ones: a `startsWith`
  check confirming exactly 200 `a`s then a space then a `b`, and a negative
  `not.toMatch(/  /)` check confirming no double-space artifact. Both prove
  the single-space join behavior the original assertion intended to verify.
- **Files modified:** `aios-ui/tests/lib/data/wiki.test.ts`
- **Commit:** folded into `5ffd368` (Task 1 GREEN) — the test bug only
  surfaced once `readWikiDecisions` was implemented.

### Deferred Issues

**1. Pre-existing `LayoutProps` / `PageProps` tsc errors**
- `aios-ui/app/clients/[client]/layout.tsx(5,51)` and
  `aios-ui/app/clients/[client]/page.tsx(26,49)` flag unresolved globals from
  `tsc --noEmit`. These are Next.js-16 typed-route globals normally provided
  by `.next/types/` after `next build`. They exist on the **baseline commit
  `24dad93`** before any 04-02 work and are NOT caused by this plan.
- Logged to `.planning/phases/04-bidirectional-hub/deferred-items.md`.
- Owner: a later route-types cleanup plan in phase 04 or beyond.

No architectural deviations. No auth gates. No new dependencies added.

## Threat Flags

None. Both readers are read-only filesystem helpers reading from paths already
recognized by the existing `detectWiki` flow; no new trust boundaries, no
network surface, no schema changes.

## Self-Check: PASSED

- `aios-ui/lib/data/wiki.ts` — FOUND, contains `readWikiDecisions` and `readPendingIngest`.
- `aios-ui/lib/types.ts` — FOUND, contains all 4 new interfaces.
- `aios-ui/tests/lib/data/wiki.test.ts` — FOUND, 25 cases pass.
- `.planning/phases/04-bidirectional-hub/deferred-items.md` — FOUND.
- Commits `6bd7fc3`, `5ffd368`, `de08169`, `e719f7c` — all present in
  `git log --grep="04-02"`.
- `npm test` repo-wide: 183/183 PASS, 0 failed.

## TDD Gate Compliance

Plan ran two TDD cycles (one per task). Both cycles produced a `test(...)` RED
commit immediately preceding a `feat(...)` GREEN commit:

- Task 1: `test(04-02)` @ `6bd7fc3` → `feat(04-02)` @ `5ffd368` ✓
- Task 2: `test(04-02)` @ `de08169` → `feat(04-02)` @ `e719f7c` ✓

No REFACTOR commits were necessary — both implementations stayed minimal and
the test fix in Task 1 was a test correctness issue, not a refactor.
