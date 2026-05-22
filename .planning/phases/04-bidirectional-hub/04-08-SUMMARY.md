---
phase: 04-bidirectional-hub
plan: "08"
subsystem: aios-ui/chat-writeback
tags: [chat, raw-drops, receipts, writeback, hub-05, hub-06]
dependency_graph:
  requires: [04-01, 04-05]
  provides: [chat-decision raw drop, chat-session transcript drop, per-message drop button]
  affects: [aios-ui/components/chat-drawer.tsx, aios-ui/components/chat-message.tsx, receipt feed]
tech_stack:
  added: []
  patterns: [writeRawDrop helper, per-message client component, collapse-triggered auto-drop, role-walk for priorUserTurn]
key_files:
  created:
    - aios-ui/lib/skills/chat-writeback.ts
    - aios-ui/app/api/chat/[client]/[project]/drop-decision/route.ts
    - aios-ui/app/api/chat/[client]/[project]/drop-session/route.ts
    - aios-ui/components/chat-message-drop-button.tsx
    - aios-ui/tests/lib/skills/chat-writeback.test.ts
    - aios-ui/tests/app/api/chat-drop.test.ts
  modified:
    - aios-ui/components/chat-message.tsx
    - aios-ui/components/chat-drawer.tsx
    - aios-ui/vitest.config.ts
decisions:
  - "priorUserTurn computed via role-walk backwards (loop from assistantIdx-1 to 0, first user message wins) — handles non-alternating message sequences"
  - "drop-session fires on EVERY collapse transition (expanded true → false) when messages.length > 0; also on explicit New session click; not deduped (operator can collapse twice)"
  - "Dropped button feedback: 2s success label, then permanently disabled for the component lifetime — no persistence needed since each render is stateless"
  - "New session button visible only when session && messages.length > 0 — prevents empty-drop calls"
  - "vitest fileParallelism=false added to fix pre-existing fixture race (shared clients.yaml patched by 3+ test files concurrently)"
metrics:
  duration: "~35 min"
  completed: "2026-05-22"
  tasks: 3
  commits: 5
  files_created: 7
  files_modified: 3
  tests_added: 13
---

# Phase 4 Plan 08: Chat Write-back (Drop to raw + Session Transcript) Summary

Chat write-back wired end-to-end per ADR 0004: operator can promote any AI message to a durable raw drop, and every closed session writes a full transcript. Both emit receipts visible in the receipt feed dock.

## What Was Built

### Task 1 + 2 (TDD, pre-committed before this execution)
- `lib/skills/chat-writeback.ts`: Two pure helpers — `buildChatDecisionMarkdown` (frontmatter + `## User`/`## Assistant` blocks) and `buildChatSessionMarkdown` (frontmatter + `## Transcript` with `### User`/`### Assistant` sub-headings). Commit: `0f02f3a` + `6f9269b`.
- `app/api/chat/[client]/[project]/drop-decision/route.ts`: POST endpoint. Validates `userTurn`/`assistantTurn`, resolves wiki path, writes via `writeRawDrop(kind='chat-decision')`, emits `chat_drop` receipt. Uses `projectObj` naming pattern — `project` route param is never re-declared (no TDZ shadow). Commit: `0f02f3a`.
- `app/api/chat/[client]/[project]/drop-session/route.ts`: POST endpoint. Filters messages to valid `user`/`assistant` pairs with non-empty content. Empty array → `{ ok: true, skipped: true }` with no side effects. Non-empty → writes `chat-session-YYYY-MM-DD-<sessionId>.md` via `writeRawDrop`, emits `chat_session_close` receipt. Falls back to `no-session-id-<timestamp>` slug if sessions.json has no active session. Commit: `a6d73b1`.
- Tests: 13 new tests in `tests/lib/skills/chat-writeback.test.ts` and `tests/app/api/chat-drop.test.ts`.

### Task 3 (this execution)
- `components/chat-message-drop-button.tsx`: `'use client'` component. Renders "Drop to raw" inline below assistant message content. On click: POST to `/api/chat/{c}/{p}/drop-decision`. Success → "Dropped" for 2s, then permanently disabled for this render. Error → inline error text. Commit: `7e6ff1b`.
- `components/chat-message.tsx`: Extended with optional `clientSlug`, `projectSlug`, `priorUserTurn` props. When role === 'assistant', status === 'done', and all three props present: renders `<ChatMessageDropButton>` right-aligned below the bubble. Commit: `7e6ff1b`.
- `components/chat-drawer.tsx`: Three additions (Commit: `7e6ff1b`):
  1. `findPriorUserTurn(msgs, assistantIdx)` — role-walk backward from the assistant message index; returns first user message content found (handles non-alternating sequences correctly).
  2. `postDropSession()` called via `useEffect` watching `expanded`: fires when `expanded` transitions from `true` to `false` AND `messages.length > 0`.
  3. "New session" button at bottom of drawer body — visible when `session && messages.length > 0`; calls `postDropSession` then resets all state.

### Deviation Auto-fix (Rule 1): Fixture race condition
Pre-existing bug discovered during final verification: three test files all patch `tests/fixtures/claude-os/clients.yaml` concurrently in vitest's default parallel mode. Race condition left stale tmpdir paths in the fixture, causing wiki-path resolution tests to fail. Fix: `fileParallelism: false` in `vitest.config.ts`. This setting serializes test file execution while keeping tests within each file parallel. Commit: `a69a73a`.

## Implementation Notes

### priorUserTurn computation
`findPriorUserTurn` walks backward from the assistant message index rather than using a simple `i - 1` offset. The role-walk approach handles edge cases like: the first assistant message before any user turn returns `undefined` (no Drop button), and multi-assistant sequences where the prior user turn might be two or more indices back.

### drop-session trigger semantics
Auto-drop fires on EVERY `expanded: true → false` transition when messages exist. If the operator collapses and re-expands without sending new messages, collapsing again fires another drop — the endpoint handles this gracefully (creates a duplicate file with a collision suffix). The New session button also fires drop-session before resetting state, so the transcript is always preserved before a context switch.

### "Dropped" UX
The button uses a 2-second success flash then permanently disables. Permanent disable is tracked in local React state (`permanentlyDropped`), not persisted — if the component unmounts and remounts (e.g., scroll virtualization), the button resets. Acceptable for the operator workflow: the receipt feed confirms the drop happened.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vitest fixture race condition causing 257/261 tests to pass**
- **Found during:** Final verification run
- **Issue:** Multiple test files (chat-drop.test.ts, wiki.test.ts, capture.test.ts) concurrently patch the same `tests/fixtures/claude-os/clients.yaml` with different tmpdir paths. In vitest's default parallel mode the afterEach restores race with the next file's beforeEach, leaving stale paths.
- **Fix:** Added `fileParallelism: false` to `vitest.config.ts` to serialize test file execution while preserving intra-file parallelism.
- **Files modified:** `aios-ui/vitest.config.ts`
- **Commit:** `a69a73a`

## Known Stubs

None — all behavior is fully wired. The Drop button makes real network calls to real endpoints that write real files.

## Self-Check: PASSED

All created files confirmed on disk. All 5 plan commits (6f9269b, 0f02f3a, a6d73b1, 7e6ff1b, a69a73a) confirmed in git log. 261/261 tests pass. Build clean (0 compile errors).
