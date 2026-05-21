---
phase: 04-bidirectional-hub
plan: "01"
subsystem: receipt-feed-foundation
tags: [raw-drops, receipts, sse, dock, hub, wave-1]
requires:
  - lib/cache/sessions.ts (cacheDir pattern mirrored)
  - lib/invalidation-bus.ts (global pub/sub the SSE stream subscribes to)
  - app/api/sse/route.ts (SSE pattern mirrored for /api/receipts/stream)
provides:
  - lib/raw-drops.ts (slugify, buildRawDropPath, writeRawDrop) — consumed by every write surface in Waves 2-4
  - lib/cache/receipts.ts (appendReceipt, readRecentReceipts, receiptsPath) — append-only NDJSON
  - /api/receipts GET (last 20, newest-first)
  - /api/receipts/stream SSE (global-scope nudges; payload-less)
  - ReceiptFeed dock component slotted globally in app/layout.tsx
affects:
  - app/layout.tsx (new <ReceiptFeed /> slot after {children})
  - lib/types.ts (new RawDropKind, ReceiptKind, Receipt exports)
tech-stack:
  added: []  # no new deps — everything built on fs/promises + EventSource + invalidationBus
  patterns:
    - "Append-only NDJSON for audit-friendly persistence (receipts.jsonl)"
    - "Payload-less SSE nudge → client refetches via GET (cheap stream, simple invalidation)"
    - "AIOS_CACHE_DIR env override for hermetic tests (mirrors sessions/triage cache pattern)"
    - "Collision suffix -N (2..99) for raw-drop filenames (ADR 0004 path shape)"
key-files:
  created:
    - aios-ui/lib/raw-drops.ts
    - aios-ui/lib/cache/receipts.ts
    - aios-ui/app/api/receipts/route.ts
    - aios-ui/app/api/receipts/stream/route.ts
    - aios-ui/components/receipt-feed.tsx
    - aios-ui/tests/lib/raw-drops.test.ts
    - aios-ui/tests/lib/cache/receipts.test.ts
  modified:
    - aios-ui/lib/types.ts (appended RawDropKind, ReceiptKind, Receipt)
    - aios-ui/app/layout.tsx (imported + rendered ReceiptFeed)
decisions:
  - "vscode://file/<absolute_path> deep link for receipts (matches plan acceptance criterion); opens in VS Code when registered, no-ops otherwise"
  - "lastSeenAt persisted to localStorage (key: aios.receipts.lastSeenAt); unseen count zeros on first expand each session"
  - "SSE payload-less: stream emits 'receipt' nudge only; dock refetches GET /api/receipts. Keeps stream stateless and lets GET own pagination/ordering."
  - "RawDropKind covers 'capture' | 'chat-decision' | 'chat-session' per <interfaces> contract — no extra kinds added prospectively"
  - "writeRawDrop collision uses -2..-99 suffix per plan spec; throws if exhausted (defensive — should never hit in practice)"
metrics:
  duration_seconds: 337
  tasks_completed: 3
  files_changed: 9
  tests_added: 24            # 14 raw-drops + 10 receipts
  tests_total: 183
  completed: "2026-05-21T21:43:31Z"
---

# Phase 04 Plan 01: Receipt Feed Foundation Summary

The `lib/raw-drops.ts` helper for staged-ingestion writes (ADR 0004 path
shape) plus the receipt persistence + dock UI that every later plan in this
phase emits into. Wave 1 of the bidirectional hub now has a trust mechanism
in place; without this scaffold, no other plan could prove its writes are
happening.

## What was built

### `aios-ui/lib/raw-drops.ts`

Helpers used by every write surface in Waves 2-4 to drop files at
`{wiki}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` (ADR 0004 §"Staged ingestion").

Exact exports (downstream plans should rely on these signatures):

```typescript
export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session'

export function slugify(input: string): string
// Lowercase, hyphenate non-alphanumeric runs, trim outer hyphens,
// cap at 60 chars. Returns 'untitled' when empty.

export function buildRawDropPath(args: {
  wikiPath: string
  kind: RawDropKind
  date?: Date           // defaults to new Date()
  slug: string          // already-slugified
}): string
// Returns: `${wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`

export async function writeRawDrop(args: {
  wikiPath: string
  kind: RawDropKind
  slug: string
  body: string
  date?: Date
}): Promise<{ filePath: string; excerpt: string }>
// mkdir -p first. On collision appends -2..-99. excerpt = body.slice(0, 240).
```

### `aios-ui/lib/cache/receipts.ts`

Append-only NDJSON persistence at `.aios-cache/receipts.jsonl`. Every
`appendReceipt` publishes a `{ scope: { kind: 'global' } }` invalidation so
any open receipt-feed dock refreshes.

Exact exports:

```typescript
export function receiptsPath(): string
// path.join(AIOS_CACHE_DIR ?? cwd()/.aios-cache, 'receipts.jsonl')

export async function appendReceipt(receipt: Receipt): Promise<void>
// mkdir -p + appendFile JSON\n + invalidationBus.publish({ scope: { kind: 'global' }, ... })

export async function readRecentReceipts(limit = 20): Promise<Receipt[]>
// ENOENT → []. Split by \n, JSON.parse each (skip malformed), reverse, slice(0, limit).
// Returns newest-first.
```

`Receipt` shape (from `lib/types.ts`):

```typescript
export interface Receipt {
  id: string              // e.g. "rcpt_<nanoid>"
  ts: string              // ISO-8601
  kind: ReceiptKind       // capture | todo | triage_override | chat_drop | chat_session_close | wiki_ingest
  project_slug: string    // empty string allowed for cross-project
  file_written: string    // absolute path
  excerpt: string         // first 240 chars
  actor: string           // e.g. "capture-box"
}
```

### `aios-ui/app/api/receipts/route.ts`

`GET /api/receipts` → `Response.json({ receipts: Receipt[] })`. Always
last 20, newest first. `dynamic = 'force-dynamic'`, `runtime = 'nodejs'`.

### `aios-ui/app/api/receipts/stream/route.ts`

Dedicated SSE endpoint for the dock. Subscribes to `invalidationBus`,
emits `event: receipt` (with `{ at, reason }` payload) on every
global-scope invalidation. Heartbeats `ping` every 30s. Closes on
`req.signal.abort`.

**SSE refresh contract used by the dock:**

1. Dock mounts → `fetch('/api/receipts', { cache: 'no-store' })`
2. Dock opens `EventSource('/api/receipts/stream')`
3. Server emits `event: receipt` whenever `appendReceipt(...)` runs
4. Dock listens for `receipt` events → refetches GET
5. Browser auto-reconnects on disconnect

The stream intentionally carries no payload beyond the nudge — payload
assembly stays on the GET route to keep the stream stateless and pageable.

### `aios-ui/components/receipt-feed.tsx`

Client component (`'use client'` directive). Two states:

- **Collapsed:** fixed `bottom-4 right-4 z-50` pill — `Receipts (N)` with
  unseen-count badge (computed from `receipts.filter(r => r.ts > lastSeenAt)`).
- **Expanded:** 420px-wide panel, `max-h-[60vh]` scrollable, lists up to
  20 receipts as rows with `<relative time> · <kind chip> · <project_slug>
  · <excerpt truncated to 80 chars>` and a `vscode://file/<absolute path>`
  link below.

Kind chip color tokens (per plan):

| Kind                 | Tailwind classes                       |
| -------------------- | -------------------------------------- |
| `capture`            | `bg-blue-500/15 text-blue-300`         |
| `todo`               | `bg-zinc-500/15 text-zinc-300`         |
| `triage_override`    | `bg-amber-500/15 text-amber-300`       |
| `chat_drop`          | `bg-violet-500/15 text-violet-300`     |
| `chat_session_close` | `bg-cyan-500/15 text-cyan-300`         |
| `wiki_ingest`        | `bg-emerald-500/15 text-emerald-300`   |

`localStorage` key `aios.receipts.lastSeenAt` persists the last-opened
timestamp so the unseen badge zeros out on expand.

### `aios-ui/app/layout.tsx`

Imported `ReceiptFeed` from `@/components/receipt-feed`. Rendered as
`<ReceiptFeed />` inside `<body>`, after `<SSEListener />` and after
`{children}` — overlays everything via `z-50`.

### `aios-ui/.gitignore`

`.aios-cache/` was already gitignored from v1 work (line 44). Verified
in place; no change needed. Acceptance criterion `grep -c "^\.aios-cache/"`
returns 1 as required.

## Requirements satisfied

- **HUB-05** — staged ingestion plumbing: `writeRawDrop` writes to
  `{wiki}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` per ADR 0004; every
  Wave 2+ write surface (capture-box, triage overrides, chat drops,
  chat-session close) will go through this helper.
- **HUB-06** — receipt feed for trust: the bottom-right dock shows the
  last 20 receipts on every page; clicking a receipt opens the absolute
  path in VS Code via `vscode://file/...`; the dock auto-refreshes via
  SSE nudges whenever `appendReceipt` runs.

## Deviations from Plan

None — the contracts in the `<interfaces>` block are honored exactly:

- `slugify`, `buildRawDropPath`, `writeRawDrop` signatures match
- `receiptsPath`, `appendReceipt`, `readRecentReceipts` signatures match
- `Receipt` interface shape matches verbatim
- `RawDropKind` and `ReceiptKind` enums match verbatim

`.gitignore` already had `.aios-cache/` — instruction was to add it if
absent. No duplicate added.

## TDD Gate Compliance

Plan tasks 1 and 2 were `tdd="true"`. Both followed RED → GREEN:

| Task | RED commit | GREEN commit |
| ---- | ---------- | ------------ |
| 1 (raw-drops) | `5eecf77` test(04-01): failing tests | `24dad93` feat(04-01): raw-drops implementation |
| 2 (receipts cache + routes) | `86c5976` test(04-01): failing tests | `685f7d9` feat(04-01): receipts persistence + GET + SSE |

Task 3 (UI) was `tdd="false"` per plan and used `npm run build` as the
verification gate (build clean — see metrics below).

## Verification

```
$ npm test -- raw-drops.test receipts.test
Test Files  2 passed (2)
     Tests  24 passed (24)

$ npm test
Test Files  24 passed (24)
     Tests  183 passed (183)

$ npm run build
✓ Compiled successfully in 3.9s
  Finished TypeScript in 4.4s ...
✓ Generating static pages using 11 workers (5/5)
Route (app)
├ ƒ /api/receipts
├ ƒ /api/receipts/stream
...
```

Both new routes appear in the build output and TypeScript is clean.

## Commits

| Hash      | Type     | Description |
| --------- | -------- | ----------- |
| `5eecf77` | test     | Failing tests for raw-drops helper |
| `24dad93` | feat     | raw-drops helper + RawDropKind/ReceiptKind/Receipt types |
| `86c5976` | test     | Failing tests for receipts cache + GET endpoint |
| `685f7d9` | feat     | Receipts persistence + GET /api/receipts + SSE stream |
| `6886a62` | feat     | ReceiptFeed dock wired into root layout |

Note: commits `6bd7fc3`, `5ffd368`, `de08169`, `e719f7c` interleaved in
the log are from the sibling 04-02 plan running in parallel on the same
Wave 1 worktree branch — they do not touch any 04-01 files.

## Self-Check: PASSED

- File `aios-ui/lib/raw-drops.ts` — FOUND
- File `aios-ui/lib/cache/receipts.ts` — FOUND
- File `aios-ui/app/api/receipts/route.ts` — FOUND
- File `aios-ui/app/api/receipts/stream/route.ts` — FOUND
- File `aios-ui/components/receipt-feed.tsx` — FOUND
- File `aios-ui/tests/lib/raw-drops.test.ts` — FOUND
- File `aios-ui/tests/lib/cache/receipts.test.ts` — FOUND
- Commit `5eecf77` — FOUND
- Commit `24dad93` — FOUND
- Commit `86c5976` — FOUND
- Commit `685f7d9` — FOUND
- Commit `6886a62` — FOUND
- `npm test` — 24 files / 183 tests PASS, 0 failed
- `npm run build` — clean compile, both /api/receipts routes registered
