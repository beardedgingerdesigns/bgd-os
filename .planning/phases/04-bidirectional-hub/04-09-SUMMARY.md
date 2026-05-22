---
phase: 04-bidirectional-hub
plan: "09"
subsystem: aios-ui/pending-ingestion
tags: [hub, wiki, ingest, receipts, pending-ingestion, sse, hub-07, hub-06]
dependency_graph:
  requires: [04-01, 04-02, 04-05, 04-08]
  provides: [pending-ingestion-surface, wiki-ingest-endpoint, wiki-ingest-receipt, per-project-receipts-slice]
  affects:
    - aios-ui/components/pending-ingestion-section.tsx
    - aios-ui/components/wiki-ingest-modal.tsx
    - aios-ui/components/run-ingest-button.tsx
    - aios-ui/components/project-receipts-slice.tsx
    - aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts
    - aios-ui/lib/skills/wiki-ingest.ts
    - aios-ui/app/clients/[client]/projects/[project]/page.tsx
tech_stack:
  added: []
  patterns:
    - SSE stream from subprocess (mirrors runRitual + /api/admin/[ritual] pattern)
    - INGEST_SUMMARY_START/INGEST_SUMMARY_END structured envelope (mirrors TODOS_JSON_START/END)
    - Server component calls async reader at render time (mirrors WikiDisplay, 04-03)
    - Client component owns modal state and delegates SSE consumer to modal (mirrors RitualModal)
    - Project-scoped invalidationBus.publish after successful write
key_files:
  created:
    - .claude/skills/ingest-aios-drops/SKILL.md
    - aios-ui/lib/skills/wiki-ingest.ts
    - aios-ui/tests/fixtures/fake-claude-wiki-ingest.sh
    - aios-ui/tests/lib/skills/wiki-ingest.test.ts
    - aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts
    - aios-ui/components/pending-ingestion-section.tsx
    - aios-ui/components/wiki-ingest-modal.tsx
    - aios-ui/components/run-ingest-button.tsx
    - aios-ui/components/project-receipts-slice.tsx
  modified:
    - aios-ui/app/clients/[client]/projects/[project]/page.tsx
decisions:
  - "/ingest-aios-drops skill created at project-local path .claude/skills/ingest-aios-drops/SKILL.md — NOT at user-global ~/.claude/skills/ (confirmed by acceptance criteria check)"
  - "INGEST_SUMMARY_RE regex: /<!--\\s*INGEST_SUMMARY_START\\s*-->\\s*```json\\s*([\\s\\S]*?)\\s*```\\s*<!--\\s*INGEST_SUMMARY_END\\s*-->/i — case-insensitive, lazy multi-line, matches CRLF-or-LF newlines"
  - "WikiIngestModal uses the existing Dialog component from @/components/ui/dialog (same Dialog used by RitualModal and DeleteEntityDialog) — no inline overlay div needed"
  - "Timeout headroom: default timeoutMs=300_000 (5 min) mirrors ritual.ts and daily-ingest.ts; should be adequate for typical wiki ingest passes, configurable via options if needed"
  - "WikiIngestModal auto-starts the ingest POST on open=true (via useEffect + hasStartedRef guard); does not expose a manual 'Run now' button since the button is one-click-to-go"
  - "ProjectReceiptsSlice reads readRecentReceipts(100) and filters client-side to project_slug — avoids a new indexed read and 100-receipt cap is sufficient for typical project history"
metrics:
  duration: "~35 min"
  completed: "2026-05-22"
  tasks: 3
  commits: 3
  files_created: 9
  files_modified: 1
  tests_added: 4
---

# Phase 4 Plan 09: Pending Ingestion + Wiki Ingest + Per-Project Receipts — Summary

Surfaces the operator-visible payoff of staged ingestion (ADR 0004): every Project page now shows a count of raw/aios/ drops awaiting wiki promotion, a one-click "Run wiki ingest" button that streams live output, and a per-project receipt slice that confirms writes are happening. This is the final plan in Phase 4.

## What Was Built

### Task 1: /ingest-aios-drops skill + wiki-ingest.ts + tests

- **`.claude/skills/ingest-aios-drops/SKILL.md`** (project-local, NOT user-global): Wrapper skill that batch-promotes `raw/aios/*.md` drops into the curated wiki. Defines the INGEST_SUMMARY_START / INGEST_SUMMARY_END structured envelope format (JSON fenced block with `promoted`, `deferred`, `contested` arrays). Enforces ADR 0004: raw drops are immutable, never written by the skill. Invokes `llm-wiki` per-source for each pending file, bootstraps `decisions/`, `log.md`, `sources/` if missing.

- **`aios-ui/lib/skills/wiki-ingest.ts`**: `runWikiIngest()` subprocess runner. Mirrors `runRitual`/`runDailyIngest` patterns exactly. Spawns `claude --print --permission-mode bypassPermissions --output-format stream-json --include-partial-messages --verbose "/ingest-aios-drops {wikiPath}"`. Parses the INGEST_SUMMARY envelope via `INGEST_SUMMARY_RE` regex. Returns `WikiIngestResult` with optional `summary` field.

- **4 tests**: success-with-summary (promoted.length===2, deferred.length===1), success-without-summary (summary===undefined), non-zero exit (status==='failed'). All 4 pass via a bash fixture (`fake-claude-wiki-ingest.sh`) that supports `--no-summary` and `--fail` modes.

### Task 2: POST /api/wiki/ingest/[client]/[project]

- SSE streaming endpoint following the same pattern as `/api/admin/[ritual]/route.ts`.
- Returns 400 if `resolveProjectWikiPath` yields null.
- Streams `start` / `chunk` / `done` SSE events.
- On `result.status === 'success'`: appends a `wiki_ingest` receipt with `excerpt = "promoted N, deferred M, contested K"` (or `"ingest complete (no structured summary)"` if no envelope), then publishes a project-scoped `invalidationBus` message so the page can refetch.

### Task 3: UI Components + Project Page Wiring

- **`PendingIngestionSection`** (server component): reads `readPendingIngest(wikiPath)` at render time. When `count === 0`: shows "All AIOS drops have been ingested" + optional "Last ingest: Xm ago". When `count > 0`: bulleted list with kind chips (color tokens from receipt-feed.tsx), monospace basename, relative mtime, vscode deep-link, and `RunIngestButton`. When `wikiPath` is null: muted "No wiki configured" line.

- **`RunIngestButton`** (client component): owns `modalOpen` state; disabled when `count === 0`; renders `WikiIngestModal` inline.

- **`WikiIngestModal`** (client component): SSE consumer mirroring `RitualModal`. Auto-starts the POST on `open=true` via `useEffect + hasStartedRef` guard. Streams live output into a scrollable `<pre>`. On success: shows summary line "Promoted N, deferred M, contested K". Uses the existing `Dialog` primitive from `@/components/ui/dialog`.

- **`ProjectReceiptsSlice`** (server component): reads `readRecentReceipts(100)`, filters to `r.project_slug === projectSlug`, shows up to 10. Kind chips, relative timestamp, excerpt (80-char truncate), vscode deep-link per row.

- **Project page wiring**: `PendingIngestionSection` inserted after `CommunicationsSection`, before `CaptureBox`; `ProjectReceiptsSlice` inserted after `RecentActivityFeed`, before `ChatDrawer`. All prior wirings (04-03 WikiDisplay, 04-04 CommunicationsSection) preserved (confirmed by grep counts >= 2).

## INGEST_SUMMARY Regex

Used in `wiki-ingest.ts` and expected in `SKILL.md`:

```
/<!--\s*INGEST_SUMMARY_START\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*INGEST_SUMMARY_END\s*-->/i
```

- Case-insensitive flag handles both `INGEST_SUMMARY_START` and any variant casing.
- `[\s\S]*?` lazy multi-line match captures only the JSON payload between the fenced block delimiters.
- Extra `\s*` padding on either side of `INGEST_SUMMARY_START/END` tolerates trailing spaces.
- If the LLM emits extra blank lines inside the fence, the lazy match still captures cleanly.

To adjust for spacing variants: the `\s*` already handles most cases. If the skill emits extra text between ```` ``` ```` and `<!-- INGEST_SUMMARY_END -->`, the lazy match will stop at the first ` ``` ` and may mis-capture. In that case, tighten the skill to emit nothing between the fence close and the end marker.

## Modal Dialog Primitive

`WikiIngestModal` uses the existing `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` components from `@/components/ui/dialog` — the same Dialog used by `RitualModal` and `DeleteEntityDialog`. No inline overlay div was needed.

## Known Stubs

None. `PendingIngestionSection` reads real filesystem data via `readPendingIngest`. `ProjectReceiptsSlice` reads real receipt data via `readRecentReceipts`. The ingest endpoint spawns the real `/ingest-aios-drops` subprocess via `runWikiIngest`. All paths are fully wired.

## Deviations from Plan

None. Plan executed exactly as written.

- Skill created at project-local path (.claude/skills/ingest-aios-drops/SKILL.md) — confirmed NOT at user-global ~/.claude/skills/ (verified in Task 1 acceptance criteria).
- All 265 tests pass (261 pre-existing + 4 new wiki-ingest tests).
- Build clean (0 TypeScript errors, 0 compile failures).

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: subprocess_injection | aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts | wikiPath is resolved from clients.yaml via resolveProjectWikiPath (trusted store); clientSlug/projectSlug come from URL params but only determine which entry to look up, not the path itself. No shell=true, so no injection surface. Acceptable. |

## Self-Check: PASSED

All created files confirmed on disk. All 3 task commits confirmed in git log.

- `.claude/skills/ingest-aios-drops/SKILL.md` — FOUND (project-local)
- `aios-ui/lib/skills/wiki-ingest.ts` — FOUND, exports `runWikiIngest`
- `aios-ui/tests/lib/skills/wiki-ingest.test.ts` — FOUND, 4 tests pass
- `aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts` — FOUND
- `aios-ui/components/pending-ingestion-section.tsx` — FOUND (no `use client`)
- `aios-ui/components/wiki-ingest-modal.tsx` — FOUND (`use client`)
- `aios-ui/components/run-ingest-button.tsx` — FOUND (`use client`)
- `aios-ui/components/project-receipts-slice.tsx` — FOUND (no `use client`)
- Task commits: `11c55ef`, `05cc6f2`, `9b1d16e` — all present in git log
- Full test suite: 265/265 PASS
- Build: clean (0 errors)
