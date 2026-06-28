# AIOS UI v3 — design spec

**Date:** 2026-05-19
**Owner:** Justin Lobaito (BGD)
**Status:** Approved for implementation planning

## Summary

v3 ships two operator-grade features on top of the v0/v1/v2 base:

1. **Capture box** — an inline form on every project page. The operator types a memory / decision / commitment, the UI shells out to `claude --print "/capture <text>"`, the capture skill routes the content to the right filesystem destination (memory, wiki, decisions log), and status returns inline.
2. **Admin page** — the placeholder route from v2 (`/admin`) becomes a launcher for operator rituals. Three working tiles: `/level-up`, `/weekly-project-status`, `/audit`. A fourth tile, "Business plans & research", stays a labelled placeholder for v3.1. Each working tile opens a modal that streams the ritual's output.

Both features reuse the v1/v2 plumbing: stream-json SSE parser, the subprocess wrapper pattern, the cache pattern, the chokidar file watcher (so files written by `/capture` invalidate downstream pages automatically).

## Goals

- Lower the cost of capture inside the operator's daily flow. Today, capturing a memory means switching to a terminal and running the skill manually. v3 makes it a textarea + ⌘↵ on the page you're already looking at.
- Surface the operator's weekly / monthly rituals (`level-up`, `weekly-project-status`, `audit`) inside the UI, with cached "last run" state so the operator can see at a glance which rituals are overdue.
- Reuse v1's `DailyIngestModal` pattern visually and architecturally — same modal shape, same streaming output, same re-run-button affordance. The user is already familiar with it.

## Non-goals (v3)

- **No global capture surface.** Capture lives on project pages only. Client-level or global capture is v3.1.
- **No Cmd+K palette.** That stayed in the master plan but is deferred to a later phase.
- **No business-plans / research content.** Tile is a "coming" placeholder.
- **No capture preview before write.** Capture is one-shot — the skill decides where it lands and the UI reports the result. No confirm-then-write step.
- **No capture history / "recent captures" surface.** Captures show up in the existing `RecentActivityFeed` via filesystem detection once they're written; no separate UI surface in v3.
- **No refactor of `DailyIngestModal`.** The new `RitualModal` is a sibling component, not a base. Keep the two distinct for now; revisit consolidation later.
- **No multi-tab locking.** Same caveat as v2 chat — two tabs running the same ritual concurrently may step on each other.
- **No abort / cancel mid-stream.** Same as v2 chat — fire and let it finish.

## Key decisions

| # | Decision | Why |
|---|---|---|
| 1 | Capture box is inline on project pages, master-plan default. | The user chose this over Cmd+K. Lower friction, always visible, no muscle memory required. |
| 2 | One subprocess wrapper for all admin rituals, parameterized by slug. | Three rituals share the exact same shape (`claude --print "/<slug>"` with a working directory). One wrapper, one route handler with a `[ritual]` dynamic segment. |
| 3 | Per-ritual cache file (one JSON per ritual). | Mirrors the v1 `triage-latest.json` pattern. Tile shows "Last ran Xd ago" from the cache. |
| 4 | Capture has no cache. | One-shot writes. The `/capture` skill is the source of truth for what got written; the UI just reports success. |
| 5 | `RitualModal` is a sibling of `DailyIngestModal`, not a refactor. | Avoids the cost of refactoring a working v1 component. Both modals can share a stream-parser utility but stay otherwise independent. |
| 6 | Capture textarea posts via SSE-streaming route, not plain POST. | Consistency with chat + daily-ingest. Future-proofs for progress messages from the `/capture` skill (e.g., "routing to memory…", "writing file…"). |
| 7 | Admin page layout stays as 4 tiles in a simple grid (not a list, despite the v3 rework's row direction). | Tiles are launchers, not browseable content. Four distinct big targets read better as tiles than as rows. |
| 8 | Placeholder business-plans tile is visually distinct (dashed border, muted text, no click handler). | Honest about state. Mirrors the previous "Coming in v3" dashed `AdminCard` aesthetic. |

## Architecture

```
project page ─────────────────► <CaptureBox/>
                                    │ POST text
                                    ▼
                                /api/capture/[client]/[project]
                                    │ runCapture()
                                    ▼
                              lib/skills/capture.ts
                                    │ spawn claude --print "/capture <text>"
                                    │ stream-json output
                                    ▼
                              chokidar watcher picks up
                              new memory/decision/wiki file
                                    │
                                    ▼
                              SSE invalidation broadcasts to
                              project / client / home pages

admin page ─────────────────► <RitualTile slug="level-up"/>
                                    │ open <RitualModal slug="level-up"/>
                                    │ POST
                                    ▼
                                /api/admin/[ritual]
                                    │ runRitual()
                                    ▼
                              lib/skills/ritual.ts
                                    │ spawn claude --print "/<slug>"
                                    │ stream-json output
                                    ▼
                              lib/cache/rituals.ts
                              writes ritual-<slug>.json
                                    │
                                    ▼
                              tile re-renders "Last ran" badge
```

## Data model

New types in `lib/types.ts`:

```ts
// Capture
export interface CaptureRunResult {
  status: 'success' | 'failed' | 'timeout'
  output: string                          // aggregated assistant text from /capture
  exitCode: number
  durationMs: number
  error?: string
}

// Admin rituals
export type RitualSlug = 'level-up' | 'weekly-status' | 'audit'

export interface RitualRunResult {
  status: 'success' | 'failed' | 'timeout'
  exitCode: number
  output: string
  durationMs: number
  error?: string
}

export interface RitualCacheEntry {
  ritual: RitualSlug
  ranAt: string                           // ISO timestamp
  output: string                          // raw Markdown produced by the skill
  exitCode: number
  durationMs: number
}
```

### Cache layout

```
.aios-cache/
  triage-latest.json      (v1)
  sessions.json           (v2)
  rituals/                (v3 — new)
    level-up.json
    weekly-status.json
    audit.json
```

Per-ritual file matches the `TriageCacheEntry` shape. No master index file — read each ritual's cache when needed.

## Components

### CaptureBox (`components/capture-box.tsx`)

Client component. Accepts `clientSlug`, `projectSlug`, `projectName` props (same shape as `ChatDrawer`).

Layout:

```
┌────────────────────────────────────────────────┐
│ CAPTURE                              ⌘↵  send  │
│ ────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────┐ │
│ │ Type a memory, decision, commitment…       │ │
│ │                                            │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

States:
- **idle**: textarea + placeholder. Submit button disabled if empty.
- **submitting**: spinner + "Capturing…" status line under the form. Textarea disabled.
- **success**: status line shows the assistant's brief reply (e.g., "Captured to memory: feedback_voice"), textarea clears, returns to idle after a short pause. Form does NOT auto-collapse.
- **error**: status line shows the error message with a retry hint. Textarea content preserved.

Keyboard: ⌘↵ / Ctrl+↵ submits. Escape clears the textarea.

Accessibility: textarea has `aria-label="Capture text for ${projectName}"`. Status line is `aria-live="polite"`.

Visual: matches the new BGD-branded operator-minimal aesthetic. No card chrome. Section header is the same `text-xs uppercase tracking-wider text-muted-foreground font-medium` pattern as Source files and Recent activity. Border-y around the form body (no rounded card).

### RitualTile (`components/ritual-tile.tsx`)

Server component if the cache read can happen at request time (it can). Renders one tile in the Admin grid.

Layout:

```
┌────────────────────────────┐
│ LEVEL-UP                   │
│ Weekly automation hunt     │
│                            │
│                            │
│ Last ran 2d ago      run → │
└────────────────────────────┘
```

For the placeholder tile (business plans), the layout is the same but the bottom row is "Coming soon" instead of "Last ran… · run". Dashed border. Not clickable.

Each clickable tile is a `<button>` that opens the `RitualModal` (the open state lives in a small client wrapper on the admin page since tiles are otherwise server components).

### RitualModal (`components/ritual-modal.tsx`)

Client component. Mirrors `DailyIngestModal`:
- Dialog with a header showing ritual name + last-ran timestamp
- Streaming output panel using the v1/v2 stream-json parser
- "Run" button at the bottom (says "Re-run" once a cached run exists)
- Dismiss closes the modal but the cached output persists on the tile

Reuses the same `chat-message` styling for the streamed output? No — admin output is a single markdown blob, not a chat. Render it inside a `<pre>` or a markdown component. Decision: use the same plain-text streaming style as `DailyIngestModal` (mono pre-wrap). Defer rich markdown rendering to a later pass.

### Admin page (`app/admin/page.tsx`)

Replaces the v3-pre-rework stub with the real launcher:

```
┌──────────────────────────────────────────────────────────┐
│ Admin                                                    │
│ Operator rituals + strategic work                        │
│                                                          │
│ ┌──────────────┐ ┌──────────────┐                       │
│ │ LEVEL-UP     │ │ WEEKLY       │                       │
│ │ Find one to  │ │ STATUS       │                       │
│ │ automate…    │ │ Cross-proj…  │                       │
│ │ Last 2d  run │ │ Last 5d  run │                       │
│ └──────────────┘ └──────────────┘                       │
│ ┌──────────────┐ ┌──────────────┐                       │
│ │ AUDIT        │ │ BUSINESS     │                       │
│ │ Four Cs      │ │ PLANS        │                       │
│ │ scoreboard   │ │ & RESEARCH   │                       │
│ │ never  run   │ │ coming soon  │                       │
│ └──────────────┘ └──────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

Two-column grid on `lg:` breakpoint, single column below. Tile order: level-up → weekly-status → audit → business-plans (placeholder).

## AI plumbing

### Capture

`lib/skills/capture.ts` exports `runCapture(text, { clientSlug, projectSlug, projectName, claudeOsRoot }): AsyncGenerator<CaptureRunResult-event>`.

Internally:
- Spawns `claude --permission-mode bypassPermissions --print --output-format stream-json --verbose "/capture <text>"` with `cwd = claudeOsRoot`
- Reuses the v1/v2 stream-json parser
- Yields incremental `{ text }` events as the assistant streams its response
- Yields final `{ status, exitCode, durationMs, output }` once subprocess exits
- Timeout: 90s (capture should be fast; same as v1 default but with margin)

Edge case: if the `/capture` skill prompts for clarification, the streaming will surface that text and the capture won't complete. Operator can re-submit with more context. v3 does not handle multi-turn capture; that's a known acceptance.

### Rituals

`lib/skills/ritual.ts` exports `runRitual(slug: RitualSlug, { claudeOsRoot }): AsyncGenerator<RitualRunResult-event>`.

Internally:
- Slug → command map: `level-up` → `/level-up`, `weekly-status` → `/weekly-project-status`, `audit` → `/audit`
- Same spawn pattern as capture, but with a longer timeout (5 min — rituals can be slow, especially weekly-status which pulls Gmail + Calendar)
- On success, writes `RitualCacheEntry` to `.aios-cache/rituals/<slug>.json` via `lib/cache/rituals.ts`

### Cache

`lib/cache/rituals.ts`:
- `readRitualCache(slug: RitualSlug): Promise<RitualCacheEntry | null>`
- `writeRitualCache(entry: RitualCacheEntry): Promise<void>`
- Same env-var override pattern as v1's triage cache for tests (`AIOS_CACHE_DIR`)

## File watching

The v1 chokidar watcher already watches `memory/`, `decisions/`, and wiki paths. When `/capture` writes a new file, the watcher emits an `InvalidationMessage` with the correct scope. No new watcher wiring is required.

The cache files under `.aios-cache/rituals/` are NOT watched — they're cache state, not project state. The RitualTile reads them on each request (server component, no SSE needed).

## Error handling

| Failure | Behavior |
|---|---|
| Capture subprocess fails (non-zero exit) | Status line shows `output` (if any) + error message. Textarea retains content. |
| Capture times out | "Capture timed out after 90s — try again with shorter text." Textarea retains content. |
| Capture network error (route unreachable) | "Couldn't reach capture endpoint." Generic retry. |
| Ritual subprocess fails | Modal shows the streamed output up to failure + error footer. Cache is NOT written. Re-run button stays available. |
| Ritual times out | "Ritual timed out after 5 min." Modal stays open. Cache NOT written. |
| Ritual cache JSON malformed | Tile renders as if no cache exists ("Never run"). Log the parse error server-side. |
| Two tabs run the same ritual concurrently | Both run; the second to finish wins the cache write. Accepted tradeoff (no locking in v3, same as v2 chat). |

## Testing

Following the v1/v2 patterns:

- **Fake `claude` fixture** for capture (`tests/fixtures/fake-claude-capture.ts`) — emits a stream-json payload that mentions a routing destination
- **Fake `claude` fixture** for rituals (`tests/fixtures/fake-claude-ritual.ts`) — slug-aware, emits ritual-specific markdown
- Unit tests for `runCapture`, `runRitual`, `readRitualCache`, `writeRitualCache` (TDD: fail → implement → pass)
- API route smoke tests for `/api/capture/[client]/[project]` and `/api/admin/[ritual]`
- No component tests (consistent with v2's omission — `ChatDrawer` is also untested in unit form, verified by full-suite + live HTTP smoke checks)
- Full vitest run at the end + HTTP smoke checks against the live dev server

## v3 build milestones

Translated from the brainstormed task list. Each milestone follows v2's pattern: failing test → confirm fail → implement → confirm pass → commit.

1. **Types** — `CaptureRunResult`, `RitualSlug`, `RitualRunResult`, `RitualCacheEntry` in `lib/types.ts`. Typecheck + commit.
2. **Capture subprocess wrapper** (TDD) — `lib/skills/capture.ts` + fake fixture. Tests for success / fail / timeout.
3. **Capture API route** — `app/api/capture/[client]/[project]/route.ts` (POST, SSE).
4. **CaptureBox component + mount** — `components/capture-box.tsx`, mount on project page below Source files. Live smoke check.
5. **Rituals cache module** (TDD) — `lib/cache/rituals.ts`. Tests for read / write / missing.
6. **Rituals subprocess wrapper** (TDD) — `lib/skills/ritual.ts` + fake fixture. Tests for each slug + fail / timeout.
7. **Rituals API route** — `app/api/admin/[ritual]/route.ts` (POST, SSE), writes cache on success.
8. **RitualTile + RitualModal components** — tile reads cache, modal streams output, re-run button.
9. **Admin page assembly** — tile grid, 4 tiles (3 working + 1 placeholder), end-to-end verification: typecheck + full test suite + HTTP smoke checks on `/admin` and the three POST endpoints.

## Open items deferred to v3.1+

- Capture surface on home and client pages (global / client-scoped capture)
- Cmd+K capture palette
- Recent captures history surface
- Capture preview-then-confirm step (multi-turn capture)
- Business plans & research tile content
- Refactor `DailyIngestModal` + `RitualModal` into a shared base
- Rich markdown rendering for ritual output (currently plain mono pre-wrap)
- Multi-tab locking for rituals
- Abort / cancel for in-flight ritual runs
- The two impeccable-deferred P0s (global app shell, chat as docked rail) — separate UI track

## Risks

- **`/capture` skill behavior is not pinned.** The skill could decide to do something the UI doesn't anticipate (ask for clarification, refuse, write to an unexpected location). Mitigation: the UI surfaces whatever the skill outputs; the operator can read it and re-submit. If we find recurring friction, harden in v3.1.
- **Timeout values are guesses.** 90s for capture might be too tight if the skill consults the wiki. 5 min for rituals might be too tight for weekly-status if Gmail is slow. Mitigation: start with these values, surface duration in cache, tune from real runs.
- **Tile cache staleness.** "Last ran Xd ago" might mislead if the cache file is hand-edited or deleted. Mitigation: parse error → "Never run." Accepted.
- **Subprocess concurrency.** A capture and a ritual could run at the same time; both spawn `claude` subprocesses with the same working directory. Should be fine (independent processes) but unverified. Mitigation: smoke-test concurrent invocation during milestone 9.
