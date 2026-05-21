---
phase: 04
plan: 03
subsystem: aios-ui/wiki-display
tags: [hub, wiki, decisions, ui, server-component, project-page]
requires:
  - phase: 04
    plan: 02
    reason: "Consumes readWikiDecisions + readWikiLogEntries from 04-02. No new wiki-data work — pure presentation on top of 04-02's data layer."
provides:
  - shape: WikiDisplay
    api: "<WikiDisplay wikiPath={string} />"
    purpose: "Async server component rendering three expandable sections — Active decisions / Recent log entries / Deferred decisions — for a wiki rooted at wikiPath. Replaces the bare counts row that previously sat inside the Project page's 'Source files' section."
affects:
  - "aios-ui/components/wiki-display.tsx"
  - "aios-ui/app/clients/[client]/projects/[project]/page.tsx"
  - "aios-ui/tests/components/wiki-display.test.tsx"
  - ".planning/phases/04-bidirectional-hub/deferred-items.md"
tech-stack:
  added: []                        # native <details>/<summary>, no new deps
  patterns:
    - "Native <details>/<summary> in place of a JS Collapsible — zero JS, default-open via React's `open` prop"
    - "Inline -webkit-line-clamp style for paragraph clamp (Tailwind 4 here doesn't ship a stable line-clamp utility)"
    - "Async server component rendered to a static HTML string in tests via react-dom/server.renderToStaticMarkup so the suite runs under vitest's environment: 'node' (no jsdom)"
    - "Promise.all batching for the two reader calls in the component body"
key-files:
  created:
    - aios-ui/components/wiki-display.tsx
    - aios-ui/tests/components/wiki-display.test.tsx
  modified:
    - aios-ui/app/clients/[client]/projects/[project]/page.tsx
    - .planning/phases/04-bidirectional-hub/deferred-items.md
decisions:
  - "Native <details>/<summary> chosen over @radix-ui/react-collapsible. The dep isn't installed and details handles open-by-default, accessibility, and no-JS toggle for free. Re-evaluate only if the design later needs animated panels."
  - "Paragraph clamp implemented with an inline -webkit-line-clamp style instead of a Tailwind class. globals.css just imports tailwindcss + tw-animate-css + shadcn/tailwind.css with no @plugin '@tailwindcss/line-clamp', so the utility class would silently no-op. Inline style is the safe path."
  - "Tests use react-dom/server.renderToStaticMarkup against the async server component called as a function. vitest.config sets environment: 'node' (not jsdom), so @testing-library/react would need extra wiring; the static-markup approach matches what the RSC payload flattens to on first paint and needs zero extra config."
  - "Removed BookOpen lucide import from the Project page now that its only call site (the inline wiki <li>) is gone."
  - "Renamed hasSourceFiles -> hasNonWikiSourceFiles so the section disappears entirely when only a wiki exists (avoiding a heading with zero rows)."
metrics:
  duration_minutes: ~12
  tasks_completed: 3
  files_touched: 4
  tests_added: 7
  tests_total_in_suite: 206
  commits: 4               # 3 task commits + 1 docs (deferred-items)
completed_date: 2026-05-21
---

# Phase 04 Plan 03: Wiki Display on the Project Page — Summary

Replaced the inline "wiki — N active · N deferred · N log entries" row on the
Project page with a dedicated `<WikiDisplay>` server component that surfaces
three expandable sections driven by the 04-02 readers. HUB-08's operator
payoff: real titles, real first paragraphs, real log dates, each row a
one-click jump to its file in VS Code.

## What was built

### `aios-ui/components/wiki-display.tsx` — async server component

- Props: `{ wikiPath: string }` (absolute wiki root).
- Fans out `readWikiDecisions(wikiPath)` and
  `readWikiLogEntries(wikiPath, { limit: 5 })` via `Promise.all`.
- Header row: `<BookOpen> Wiki — {basename(wikiPath)}` + "Open wiki
  folder →" link to `vscode://file/{wikiPath}`.
- Three `<details>` sections in fixed order:
  1. **Active decisions** — open by default, count badge, each row =
     title (font-semibold) + clamped first paragraph + "Open in editor →"
     link to `vscode://file/{filePath}`. Empty state: "No active
     decisions in this wiki."
  2. **Recent log entries** — open by default, count badge, each row =
     monospace date + title + "Open →" link to `vscode://file/{path}`.
     Empty state: "No log entries."
  3. **Deferred decisions** — **closed** by default, same row structure
     as Active. Empty state: "No deferred decisions."
- All headings, padding, and dividers match the existing Project-page
  visual language (mirrors `RecentActivityFeed`'s `border-y` +
  `divide-y` pattern).

### `aios-ui/app/clients/[client]/projects/[project]/page.tsx` — wiring

- Imports `WikiDisplay` and renders
  `{wikiInfo && <WikiDisplay wikiPath={wikiInfo.rootPath} />}`
  immediately above the (now-trimmed) Source-files section.
- Renamed `hasSourceFiles` -> `hasNonWikiSourceFiles` and dropped
  `wikiInfo` from its condition. The Source-files section now only
  renders when a project has ref files or memory entries — no
  empty-heading edge case when the only docs_path was a wiki.
- Removed the inline wiki `<li>` (the one that rendered
  `wikiInfo.decisionsActive + wikiInfo.decisionsDeferred + log count`).
  That surface is now WikiDisplay.
- Dropped the now-unused `BookOpen` import from `lucide-react`.

### `aios-ui/tests/components/wiki-display.test.tsx` — coverage

7 cases, all using a tmpdir wiki built with `fs.mkdtemp`:

1. Renders exactly three `<details>` elements.
2. Empty wiki shows all three empty-state strings.
3. "Open wiki folder" link href is `vscode://file/{tmpWiki}`.
4. Active decisions render title + first paragraph + editor link.
5. Section count badges reflect actual counts (asserted by slicing the
   HTML on each section's heading and looking for `>N<` in the chunk).
6. Recent log capped at 5 — the 2 oldest of 7 entries are excluded.
7. Active and Recent are open by default (two `open=""` attributes
   across the three `<details>`), Deferred is closed.

All tests pass. `npm test` shows **27/27 files, 206/206 tests**. Build
clean.

## Plan questions, answered (per the plan's `<output>` block)

- **@radix-ui/react-collapsible used, or native `<details>` sufficed?** Native
  `<details>`/`<summary>`. The dep isn't installed; native primitives gave us
  open-by-default, accessible toggle, and no-JS rendering for free.
- **RTL available, or `renderToStaticMarkup` fallback used?** Both packages are
  installed (`@testing-library/react@^16.3.2`, `jsdom@^29.1.1`), but
  `vitest.config.ts` sets `environment: 'node'` for the whole suite. Rather
  than promote this file to jsdom (which would mean test-environment
  fragmentation across the codebase), I used the plan's documented fallback:
  call the async server component as a function, run the returned tree
  through `react-dom/server.renderToStaticMarkup`, and assert substrings on
  the HTML. The pattern matches what the RSC payload flattens to on first
  paint.
- **`line-clamp` Tailwind adjustments?** `globals.css` imports
  `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css` — no
  `@plugin "@tailwindcss/line-clamp"`. To avoid a silent no-op, paragraph
  clamping uses an inline `-webkit-line-clamp` style instead of the
  utility class.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] Removed `BookOpen` import from Project page**
- **Found during:** Task 2
- **Issue:** After removing the inline wiki `<li>`, `BookOpen` was an
  unused lucide-react import. Next.js dev builds tolerate unused
  imports, but the codebase's TS settings flag them and the import is
  load-time noise.
- **Fix:** Dropped `BookOpen` from the `from 'lucide-react'` import.
- **Files modified:** `aios-ui/app/clients/[client]/projects/[project]/page.tsx`
- **Commit:** `c2f9016`

**2. [Rule 3 — Blocking issue] Reworded `'use client'` reference inside
WikiDisplay comment block**
- **Found during:** Task 1 acceptance-criteria self-check
- **Issue:** The plan's acceptance criterion was
  `grep -c "'use client'" aios-ui/components/wiki-display.tsx returns 0`.
  An explanatory comment inside the file used the literal string
  `'use client'` to clarify it was NOT a client component — which the
  grep counts as a match.
- **Fix:** Reworded the comment to use "no client directive" instead.
- **Files modified:** `aios-ui/components/wiki-display.tsx`
- **Commit:** Squashed into `8cfc324` (Task 1 commit).

### Out-of-scope items logged (not fixed)

`aios-ui/tests/lib/indexer/watcher.test.ts` failed to load mid-execution
because its matching `lib/indexer/watcher.ts` impl was still in flight
on the sibling 04-06 worktree. Logged in `deferred-items.md`. By the
time the final test run finished, 04-06's `c52105b` commit landed and
the file loads — `npm test` now reports 206/206 passing.

## Verification

| Check                                | Result                                |
| ------------------------------------ | ------------------------------------- |
| `npx tsc --noEmit` (aios-ui)         | exit 0, zero new errors               |
| `npm run build` (aios-ui)            | clean — all routes typed              |
| `npm test` (aios-ui, full suite)     | 27/27 files, **206/206 tests passed** |
| Task 1 acceptance grep checks        | all pass                              |
| Task 2 acceptance grep checks        | all pass                              |
| Task 3 acceptance grep checks        | all pass                              |
| `decisionsActive` ref in page.tsx    | 0 (removed)                           |
| `<WikiDisplay` render in page.tsx    | 1                                     |

## Requirements satisfied

- **HUB-08** — Wiki content for a Project renders as expandable
  sections on the Project page. Active decisions surface with titles +
  first paragraphs; deferred decisions are one click away; recent log
  entries appear inline with dates. Each row links to its file via
  `vscode://file/`.

## Commits (in order)

| Hash      | Type | Message                                                                |
| --------- | ---- | ---------------------------------------------------------------------- |
| `8cfc324` | feat | add WikiDisplay server component for expandable wiki sections          |
| `c2f9016` | feat | wire WikiDisplay into Project page, drop bare wiki counts              |
| `8dda473` | test | cover WikiDisplay rendering via renderToStaticMarkup                   |
| `7ad6ee0` | docs | log cross-plan watcher.test.ts load failure to deferred items          |

## Self-Check: PASSED

- Files created exist:
  - `aios-ui/components/wiki-display.tsx` — FOUND
  - `aios-ui/tests/components/wiki-display.test.tsx` — FOUND
- Files modified exist:
  - `aios-ui/app/clients/[client]/projects/[project]/page.tsx` — FOUND
  - `.planning/phases/04-bidirectional-hub/deferred-items.md` — FOUND
- Commits exist:
  - `8cfc324` — FOUND
  - `c2f9016` — FOUND
  - `8dda473` — FOUND
  - `7ad6ee0` — FOUND
