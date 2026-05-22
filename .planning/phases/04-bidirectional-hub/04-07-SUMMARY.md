---
phase: 04-bidirectional-hub
plan: 07
subsystem: chat-bootstrap

tags: [chat, hydration, gmail, calendar, session-continuity, sse, nextjs-16, stream-json, subprocess, tdd]

# Dependency graph
requires:
  - phase: 04-bidirectional-hub
    plan: 06
    provides: buildBriefFor + briefPathFor + .aios-cache/briefs/ watcher infrastructure
  - phase: 04-bidirectional-hub
    plan: 02
    provides: sessions.ts (readChatSession / writeChatSession / deleteChatSession)
provides:
  - fetchGmailContext() — claude subprocess fetcher with graceful degradation
  - fetchCalendarContext() — claude subprocess fetcher with graceful degradation
  - readBriefOrBuild() — cache-hit fast path + lazy-build fallback
  - buildLiveContext() — parallel gmail+calendar fetch
  - assembleSeedPrompt() — unified seed-prompt composer
  - POST /api/chat/[client]/[project]/refresh — rebuild brief + clear session
  - brief-meta SSE event from /load route — carries source + builtAt for drawer UI
affects: [04-08-chat-writeback, future-chat-telemetry, drawer-UX]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "envOverride test seam — GmailContextOpts + CalendarContextOpts accept envOverride: Record<string,string> passed to spawn() env, so tests can set GMAIL_FAKE_MODE=fail without touching argv"
    - "claudeBin injection for contract tests — runChatLoad + runChatMessage already accept claudeBin option; tests inject an argv-logging wrapper (bash spy script) rather than vi.spyOn(spawn) to avoid ESM import-capture timing issues"
    - "Argv-logging bash wrapper — thin bash script that printf's all $@ to a log file then exec's the real fake binary; zero module coupling, compatible with any spawn-based function"
    - "brief-meta SSE event — emitted before subprocess start so the UI sees brief freshness immediately without waiting for Claude's response"

key-files:
  created:
    - aios-ui/lib/skills/gmail-context.ts
    - aios-ui/lib/skills/calendar-context.ts
    - aios-ui/lib/skills/chat-bootstrap.ts
    - aios-ui/app/api/chat/[client]/[project]/refresh/route.ts
    - aios-ui/tests/lib/skills/gmail-context.test.ts
    - aios-ui/tests/lib/skills/calendar-context.test.ts
    - aios-ui/tests/lib/skills/chat-bootstrap.test.ts
    - aios-ui/tests/lib/skills/chat-session-continuity.test.ts
  modified:
    - aios-ui/app/api/chat/[client]/[project]/load/route.ts
    - aios-ui/components/chat-drawer.tsx

key-decisions:
  - "brief-meta SSE event name is 'brief-meta'; carries { source: 'cache'|'lazy-build'|'fallback', builtAt: ISO }"
  - "formatRelative implemented inline as minutesAgo() in chat-drawer.tsx — formatRelativeDate from lib/format.ts only accepts YYYY-MM-DD strings, not full ISO datetimes; a 1-line helper avoids a lib/format.ts API change"
  - "message route (/message/route.ts) needed NO changes — it calls runChatMessage(opts: { sessionId }) which is unchanged; HUB-03 contract was always owned by chat.ts, not the load route"
  - "HUB-03 contract test uses claudeBin injection (argv-logging bash wrapper) not vi.spyOn(child_process.spawn) — vitest ESM import caching captures the spawn reference at module-load time before the spy installs; claudeBin option is the clean test seam already provided by chat.ts"
  - "envOverride test seam on gmail-context + calendar-context avoids argv injection complexity — the fake fixtures (fake-claude-gmail.sh, fake-claude-calendar.sh) check GMAIL_FAKE_MODE / CALENDAR_FAKE_MODE env vars, which the tests set via opts.envOverride passed to spawn()"

# Metrics
duration: ~30min
completed: 2026-05-22
---

# Phase 04 Plan 07: Chat Bootstrap — Hydration + Gmail/Calendar + Session Continuity Summary

**Chat bootstrap wired to read .aios-cache/briefs/ (or lazy-build on first run) + fetch live Gmail/calendar in parallel; /load emits brief-meta SSE event for drawer UI; /refresh route clears session + rebuilds brief; HUB-03 --resume contract explicitly verified by an automated contract test.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-05-22T09:40:00Z (approx)
- **Completed:** 2026-05-22T09:55:00Z (approx)
- **Tasks:** 4
- **Files created:** 8
- **Files modified:** 2

## Accomplishments

- `fetchGmailContext()` + `fetchCalendarContext()` in `lib/skills/gmail-context.ts` / `calendar-context.ts`: each spawns `claude --print --output-format stream-json` with an MCP-appropriate prompt. Graceful degradation: timeout, non-zero exit, or spawn error all resolve to `''` without throwing. `envOverride` test seam avoids argv-injection complexity.
- `readBriefOrBuild()` in `lib/skills/chat-bootstrap.ts`: reads `.aios-cache/briefs/<client>__<project>.md` on cache hit (returning mtime as `builtAt`); on miss calls `buildBriefFor` lazily and returns `source='lazy-build'` or `source='fallback'` depending on subprocess outcome.
- `buildLiveContext()`: calls both fetchers in parallel via `Promise.all`; each individually wrapped in `.catch(() => '')` so one failure doesn't affect the other.
- `assembleSeedPrompt()`: composes a multi-section markdown context bundle (brief + gmail + calendar + orient-yourself CTA) that `runChatLoad` receives as `brief`.
- `/load` route updated to use `readBriefOrBuild + buildLiveContext + assembleSeedPrompt`. Emits `brief-meta` SSE event `{ source, builtAt }` BEFORE starting the claude subprocess so the drawer renders freshness info immediately. `chat.ts` (HUB-03 owner) untouched.
- `POST /api/chat/[client]/[project]/refresh`: calls `buildBriefFor` + `deleteChatSession`. Returns `{ ok: true, builtAt, status }`. The next `/load` picks up the fresh brief and starts a new session.
- `ChatDrawer` updated: handles `brief-meta` SSE events (routes via `event: ` line in raw SSE stream); renders "Brief loaded (source) — built Nm ago" banner; "Refresh context" button POSTs to `/refresh` then resets drawer state to force re-load on next expand. `minutesAgo()` helper inline (avoids lib/format.ts API change).
- HUB-03 contract test: `chat-session-continuity.test.ts` uses a argv-logging bash wrapper (`claude-spy.sh`) that logs all `$@` to `argv_log.txt` then execs the real `fake-claude-chat.sh`. Three tests: fresh load has no `--resume`; message has `--resume <sessionId>`; invariance test repeats both after the seed is built via `assembleSeedPrompt` (proving the Task 3 rewrite didn't touch the argument path).
- Total tests: 261 (up from 258 baseline). 35 test files, all passing. Build clean.

## Task Commits

1. **Tasks 1-2 already committed in prior run:**
   - `123e95e` test(04-07): add failing tests for gmail-context + calendar-context
   - `ddda4d0` feat(04-07): gmail-context + calendar-context subprocess fetchers
   - `f5882ad` test(04-07): add failing tests for chat-bootstrap.ts
   - `f23c7f7` feat(04-07): chat-bootstrap — readBriefOrBuild + buildLiveContext + assembleSeedPrompt

2. **Task 3:** `ffb6a85` feat(04-07): wire /load to chat-bootstrap; add /refresh route; surface brief age in ChatDrawer

3. **Task 4:** `8e77372` feat(04-07): HUB-03 session-continuity contract test — assert --resume semantics survive bootstrap rewrite

## Output Spec: Key Implementation Details

**SSE event name for brief metadata:** `brief-meta`
- Payload: `{ source: 'cache' | 'lazy-build' | 'fallback', builtAt: ISO string }`
- Emitted by `/load` route before the subprocess starts, after `readBriefOrBuild` completes
- ChatDrawer detects it via the `event: brief-meta` line in the SSE frame (raw SSE parsing added to `streamInto`)

**formatRelative implementation in the drawer:** Inline `minutesAgo(date: Date): string` function
- Returns `'just now'` for <= 0 minutes, otherwise `'${mins}m ago'`
- `lib/format.ts#formatRelativeDate` was not used: it accepts `YYYY-MM-DD` strings only, not full ISO datetimes with time components

**Message route updates:** None. `/api/chat/[client]/[project]/message/route.ts` was not modified. It calls `runChatMessage({ sessionId })` unchanged; `chat.ts` owns the `--resume` contract end-to-end.

**HUB-03 contract test approach:** argv-logging bash wrapper (`claudeSpy`) + `claudeBin` injection
- `vi.spyOn(child_process.spawn)` was the plan's alternative but has an ESM timing issue: vitest imports `spawn` via destructuring in `chat.ts` at module-load time before the spy installs, so the spy never intercepts calls
- The `claudeBin` option (already present on `runChatLoad` + `runChatMessage`) is the correct test seam
- A thin bash wrapper (`printf '%s\n' "$@" >> argv_log.txt && exec "${realBin}" "$@"`) logs every argument then delegates to `fake-claude-chat.sh` for the real stream-json output
- This approach has zero module coupling and works reliably with any spawn-based code path

**Latency profile (manual smoke testing not run — dev environment):**
- Cache hit: < 1s (file read + 2x subprocess spawn + seed assembly)
- Lazy build: 3-15s (depends on /load-project skill performance per 04-06 observations)
- Fallback: 1-3s (buildProjectBrief is all JS/filesystem reads)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vi.spyOn(child_process.spawn) does not work with ESM module imports**

- **Found during:** Task 4 (initial test run — Tests 2 and 3 failed with 0 captured calls + timeout)
- **Issue:** The plan suggested `vi.spyOn(child_process, 'spawn')` as an alternative if claudeBin injection was impractical. Initial implementation tried the spy approach. Vitest's ESM handling means `chat.ts` captures the `spawn` reference at import time; by the time the spy installs in `beforeEach`, the module already has a direct reference to the original function — so the spy never fires.
- **Fix:** Switched to the `claudeBin` injection approach (the plan's primary recommendation). Both `runChatLoad` and `runChatMessage` already accept `claudeBin` as an option. An argv-logging bash wrapper replaces the spy: `printf '%s\n' "$@" >> argv_log.txt && exec "${realBin}" "$@"`. This is 100% reliable, zero module coupling.
- **Files modified:** `aios-ui/tests/lib/skills/chat-session-continuity.test.ts`
- **Committed in:** 8e77372

**Total deviations:** 1 auto-fixed (test mechanic — no runtime behavior change).

## Files Created/Modified

- `aios-ui/lib/skills/gmail-context.ts` (NEW) — `fetchGmailContext()` with subprocess + graceful degradation + `envOverride` test seam
- `aios-ui/lib/skills/calendar-context.ts` (NEW) — `fetchCalendarContext()` with same pattern
- `aios-ui/lib/skills/chat-bootstrap.ts` (NEW) — `readBriefOrBuild()`, `buildLiveContext()`, `assembleSeedPrompt()`
- `aios-ui/app/api/chat/[client]/[project]/refresh/route.ts` (NEW) — POST endpoint
- `aios-ui/app/api/chat/[client]/[project]/load/route.ts` (MODIFIED) — uses chat-bootstrap; emits brief-meta SSE
- `aios-ui/components/chat-drawer.tsx` (MODIFIED) — brief-meta handler; brief age banner; Refresh context button
- `aios-ui/tests/lib/skills/gmail-context.test.ts` (NEW) — 4 tests
- `aios-ui/tests/lib/skills/calendar-context.test.ts` (NEW) — 3 tests
- `aios-ui/tests/lib/skills/chat-bootstrap.test.ts` (NEW) — 8 tests (3 readBriefOrBuild + 2 buildLiveContext + 3 assembleSeedPrompt)
- `aios-ui/tests/lib/skills/chat-session-continuity.test.ts` (NEW) — 3 tests (HUB-03 contract)

## Threat Flags

None — this plan adds no new network endpoints beyond `/refresh` (which is scoped to the same client/project authenticated surface as `/load` and `/message`). No new trust-boundary file access patterns introduced.

## Self-Check: PASSED

Files exist:
- `aios-ui/lib/skills/gmail-context.ts` — FOUND
- `aios-ui/lib/skills/calendar-context.ts` — FOUND
- `aios-ui/lib/skills/chat-bootstrap.ts` — FOUND
- `aios-ui/app/api/chat/[client]/[project]/refresh/route.ts` — FOUND
- `aios-ui/app/api/chat/[client]/[project]/load/route.ts` — FOUND (modified)
- `aios-ui/components/chat-drawer.tsx` — FOUND (modified)
- `aios-ui/tests/lib/skills/gmail-context.test.ts` — FOUND
- `aios-ui/tests/lib/skills/calendar-context.test.ts` — FOUND
- `aios-ui/tests/lib/skills/chat-bootstrap.test.ts` — FOUND
- `aios-ui/tests/lib/skills/chat-session-continuity.test.ts` — FOUND

Commits exist (git log):
- `123e95e` test(04-07): add failing tests for gmail-context + calendar-context — FOUND
- `ddda4d0` feat(04-07): gmail-context + calendar-context subprocess fetchers — FOUND
- `f5882ad` test(04-07): add failing tests for chat-bootstrap.ts — FOUND
- `f23c7f7` feat(04-07): chat-bootstrap — readBriefOrBuild + buildLiveContext + assembleSeedPrompt — FOUND
- `ffb6a85` feat(04-07): wire /load to chat-bootstrap; add /refresh route; surface brief age in ChatDrawer — FOUND
- `8e77372` feat(04-07): HUB-03 session-continuity contract test — FOUND

Tests: 261/261 passing. Build clean.

---
*Phase: 04-bidirectional-hub*
*Completed: 2026-05-22*
