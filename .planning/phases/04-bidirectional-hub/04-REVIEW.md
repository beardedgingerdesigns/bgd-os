---
phase: 04-bidirectional-hub
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - .claude/skills/daily-inbox-triage/SKILL.md
  - .claude/skills/ingest-aios-drops/SKILL.md
  - aios-ui/app/api/capture/[client]/[project]/route.ts
  - aios-ui/app/api/chat/[client]/[project]/drop-decision/route.ts
  - aios-ui/app/api/chat/[client]/[project]/drop-session/route.ts
  - aios-ui/app/api/chat/[client]/[project]/load/route.ts
  - aios-ui/app/api/chat/[client]/[project]/refresh/route.ts
  - aios-ui/app/api/receipts/route.ts
  - aios-ui/app/api/receipts/stream/route.ts
  - aios-ui/app/api/triage/override/[threadId]/route.ts
  - aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts
  - aios-ui/app/clients/[client]/projects/[project]/page.tsx
  - aios-ui/app/layout.tsx
  - aios-ui/instrumentation.ts
  - aios-ui/components/chat-drawer.tsx
  - aios-ui/components/chat-message-drop-button.tsx
  - aios-ui/components/chat-message.tsx
  - aios-ui/components/communications-section.tsx
  - aios-ui/components/pending-ingestion-section.tsx
  - aios-ui/components/project-receipts-slice.tsx
  - aios-ui/components/receipt-feed.tsx
  - aios-ui/components/run-ingest-button.tsx
  - aios-ui/components/triage-output.tsx
  - aios-ui/components/triage-row-actions.tsx
  - aios-ui/components/wiki-display.tsx
  - aios-ui/components/wiki-ingest-modal.tsx
  - aios-ui/lib/cache/receipts.ts
  - aios-ui/lib/cache/triage-overrides.ts
  - aios-ui/lib/data/wiki.ts
  - aios-ui/lib/indexer/build-brief.ts
  - aios-ui/lib/raw-drops.ts
  - aios-ui/lib/skills/calendar-context.ts
  - aios-ui/lib/skills/capture.ts
  - aios-ui/lib/skills/chat-bootstrap.ts
  - aios-ui/lib/skills/chat-writeback.ts
  - aios-ui/lib/skills/daily-ingest.ts
  - aios-ui/lib/skills/gmail-context.ts
  - aios-ui/lib/skills/todos-envelope.ts
  - aios-ui/lib/skills/wiki-ingest.ts
  - aios-ui/lib/types.ts
findings:
  critical: 2
  warning: 9
  info: 6
  total: 17
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-05-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

Phase 4's bidirectional hub work is largely tight — atomic writes are honored
in `triage-overrides.ts`, the wiki-aware capture branch correctly suppresses
receipts that lack an absolute path, and the server/client boundary
discipline holds (no `child_process` leaks survived the `todos-envelope.ts`
split).

Two blocker classes surfaced:

1. **Subprocess hangs from un-drained stderr** in `gmail-context.ts` and
   `calendar-context.ts`. These ship as `stdio: ['ignore', 'pipe', 'pipe']`
   but never attach a `'data'` handler to `child.stderr`. Any subprocess
   writing more than ~65 KB to stderr will deadlock the child, then time
   out 30 s later, blocking every chat open until the timer fires.
2. **Unvalidated project slugs reach filesystem writes** via
   `/api/chat/[client]/[project]/refresh` and the chat-load happy path. The
   refresh route calls `buildBriefFor(client, project)` *without first
   calling `getProject(...)`*, and `buildBriefFor` uses the raw slugs to
   build `.aios-cache/briefs/<client>__<project>.md`. Whether this is
   exploitable as path traversal depends on Next.js segment decoding, but
   the defense-in-depth gap also lets the system write fallback briefs for
   arbitrary slug strings that don't exist in `clients.yaml`.

Several Warning items cluster around concurrency in `sessions.ts`
(already-acknowledged "cuts a corner") and JSX/HTML correctness in the
WikiIngestModal output pane. Info-level items mostly cover duplication
that's now justified to lift into a shared helper.

## Critical Issues

### CR-01: gmail-context / calendar-context subprocess can deadlock on un-drained stderr

**File:** `aios-ui/lib/skills/gmail-context.ts:80-91`, `aios-ui/lib/skills/calendar-context.ts:77-88`

**Issue:** Both subprocess wrappers spawn `claude` with
`stdio: ['ignore', 'pipe', 'pipe']` and register `data` listeners only on
`child.stdout`. There is no listener on `child.stderr` and no
`stdio: 'ignore'` redirection for it. When the spawned `claude` writes
enough stderr to fill the OS pipe buffer (typically 64 KB on macOS / Linux),
the child blocks on its next stderr write. Stdout deltas stop arriving,
the parent's stdout handler stops firing, and the 30 s timer eventually
SIGKILLs the child — but every chat open hangs for 30 s before failing
silently to `''`. The other subprocess wrappers in this phase
(`daily-ingest.ts:96-98`, `capture.ts:166-168`, `wiki-ingest.ts:121-123`,
`build-brief.ts:113-115`) all correctly drain stderr.

**Fix:**
```ts
// Add immediately after the stdout listener in both files:
child.stderr.on('data', () => {
  // Drain — we don't surface subprocess stderr from the context
  // helpers, but we must consume it so the pipe doesn't fill.
})
```
Alternatively, set `stdio: ['ignore', 'pipe', 'ignore']` if the stderr
content is genuinely uninteresting.

### CR-02: Refresh + chat-load endpoints pass unvalidated slugs into filesystem write paths

**File:** `aios-ui/app/api/chat/[client]/[project]/refresh/route.ts:21-23`, `aios-ui/app/api/chat/[client]/[project]/load/route.ts:14-54`, `aios-ui/lib/indexer/build-brief.ts:30-32`

**Issue:** `refresh` (and the cache-miss branch of `load`) call
`buildBriefFor(client, project)` without first verifying the project
exists via `getProject(client, project)`. `buildBriefFor` constructs the
target path with raw slugs:

```ts
return path.join(cacheDir(), 'briefs', `${clientSlug}__${projectSlug}.md`)
```

For unknown slugs this writes a fallback brief into the cache for a
non-existent project (operational pollution). More importantly, `client`
and `project` are URL path segments with zero allow-list validation —
neither `lib/data/clients.ts` nor any helper enforces a
`[a-z0-9-]+` shape before the strings flow into `path.join`. Combined with
the lack of an `is-inside-cacheDir` guard around the resolved
`briefPathFor` result, this is a defense-in-depth path-traversal vector if
any client of the route handler (now or future) ever bypasses Next.js's
default segment normalization (e.g., a malformed proxy, an internal
caller, or a Next.js upgrade that changes `%2F` handling).

The capture route (`/api/capture/[client]/[project]`) and the drop-session
+ drop-decision routes correctly gate on `getProject`/`resolveProjectWikiPath`
first. Refresh and load should do the same.

**Fix:**
```ts
// refresh/route.ts — add the gate before buildBriefFor
const { client, project } = await params
const projectObj = await getProject(client, project)
if (!projectObj) {
  return Response.json({ error: 'unknown project' }, { status: 404 })
}
const result = await buildBriefFor(client, project)
```
And in `build-brief.ts`, additionally assert the resolved path stays
inside `cacheDir()`:
```ts
const resolved = path.resolve(filePath)
const root = path.resolve(cacheDir())
if (!resolved.startsWith(root + path.sep)) {
  throw new Error(`brief path escaped cache root: ${resolved}`)
}
```

## Warnings

### WR-01: sessions.json read-modify-write is not atomic — concurrent writes silently lose data

**File:** `aios-ui/lib/cache/sessions.ts:27-53`

**Issue:** The comment in `triage-overrides.ts` explicitly flags that
"sessions.ts cuts a corner here," and the consequences are real: every
`writeChatSession` / `deleteChatSession` performs a read, mutates the
in-memory object, then calls `fs.writeFile` non-atomically. Two scenarios
are observable today:

1. **Lost-update race:** open project A's chat in tab 1 (writes session
   for A), open project B's chat in tab 2 simultaneously (reads sessions
   file before tab 1 finished writing, then overwrites with B alone).
   Tab 1's session is lost.
2. **Corruption on crash:** `fs.writeFile` is `open → truncate → write`.
   If the Node process is killed between truncate and write completion,
   `sessions.json` is empty or partial JSON. Next `readFile()` throws
   `SyntaxError`, which is NOT caught by `readChatSession`'s ENOENT-only
   branch — it bubbles up and breaks every chat surface until manually
   repaired.

**Fix:** Use the same temp+rename pattern that `triage-overrides.ts`
already implements (`atomicWrite`). It also wouldn't hurt to wrap the
JSON.parse in a try/catch that returns `{ sessions: {} }` on `SyntaxError`
to recover from a half-written file.

### WR-02: WikiIngestModal renders `<div>` inside `<pre>`, breaking HTML semantics and possibly auto-scroll

**File:** `aios-ui/components/wiki-ingest-modal.tsx:151-154`

**Issue:**
```tsx
<pre className="... max-h-[40vh] overflow-y-auto">
  {output || (status === 'idle' ? 'Waiting to start…' : '')}
  <div ref={outputEndRef} />
</pre>
```
`<pre>` is a phrasing-content element; a `<div>` child is invalid HTML and
React DOM will emit a hydration warning in dev. Browsers tolerate it, but
some engines silently flatten the structure, which can defeat
`scrollIntoView` on the ref. The auto-scroll effect runs on every
`output` change during streaming — if the ref's bounding rect ever
collapses to zero, scrolling stops working.

**Fix:** Wrap the `<pre>` in a scroll container and put the sentinel
outside the `<pre>`:
```tsx
<div className="max-h-[40vh] overflow-y-auto">
  <pre className="...">{output || (status === 'idle' ? 'Waiting to start…' : '')}</pre>
  <div ref={outputEndRef} />
</div>
```

### WR-03: chat-writeback YAML frontmatter is not escape-safe

**File:** `aios-ui/lib/skills/chat-writeback.ts:21-34`, `aios-ui/lib/skills/chat-writeback.ts:50-62`

**Issue:** `projectLabel`, `sessionId`, `startedAt`, `closedAt` are
interpolated as raw YAML scalar values. `projectLabel` is composed from
`${clientObj.name} — ${projectObj.name}` — both come from `clients.yaml`,
where Justin (or a future curated-data tool) could include a colon or
newline. A label like `"Foo: bar"` produces invalid YAML
(`project: Foo: bar`), and the ingest pass's frontmatter parser will then
either skip the file or absorb the wrong values. Same risk for a
`sessionId` containing a newline.

Capture.ts has the same shape on its wiki-aware branch
(`capture.ts:71-79`).

**Fix:** Quote scalar values and escape inner quotes:
```ts
function yamlQuote(s: string): string {
  return `"${s.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`
}
// ...
`project: ${yamlQuote(args.projectLabel)}`,
`session_id: ${yamlQuote(args.sessionId)}`,
```
Or adopt `js-yaml`'s `dump()` for the full frontmatter block — already a
dependency via `lib/data/clients.ts`.

### WR-04: Capture wiki-aware branch swallows errors and silently falls through to subprocess

**File:** `aios-ui/lib/skills/capture.ts:102-106`

**Issue:**
```ts
} catch (err) {
  // Wiki write failed (EACCES, ENOTDIR, exhausted collision suffixes…).
  // Fall through to the subprocess branch so the capture is not lost.
  console.warn('[capture] wiki-aware write failed, falling back to subprocess', err)
}
```
The comment claims fall-through preserves the capture, but the subprocess
branch invokes `/capture` with the raw operator prompt — it will write
into the GLOBAL inbox (`./inbox/...`), NOT into the project's
`{wiki}/raw/aios/`. The operator who initiated the action will see a
receipt (from the subprocess branch's regex extractor) pointing to the
global inbox file, with no indication that the wiki write failed. The
receipt looks identical to a fully-successful capture.

**Fix:** Surface the wiki failure in the receipt or response. At minimum,
include `excerpt`/`actor` that flags it (e.g.,
`actor: 'capture-box (wiki fallback)'`). Better: return an explicit
`status: 'partial'` to the SSE stream so the UI can show a non-blocking
toast.

### WR-05: Capture SSE controller close not guarded against client abort during subprocess

**File:** `aios-ui/app/api/capture/[client]/[project]/route.ts:34-95`, `aios-ui/app/api/chat/[client]/[project]/load/route.ts:16-97`, `aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts:28-88`

**Issue:** None of the SSE streaming endpoints register
`req.signal.addEventListener('abort', ...)` to abort the in-flight
subprocess when the client disconnects (browser closes the tab, drawer
collapses mid-stream, etc.). The receipts-stream endpoint does this
correctly (`receipts/stream/route.ts:43-51`), but the
write-surface endpoints leave the subprocess running to completion.
Side-effects (receipt append, override write) STILL fire after the
client is gone, which is mostly desirable (don't lose work), but a
subprocess hung on an MCP call will burn quota for up to its timeout
without the operator able to cancel it.

**Fix:** Wire `req.signal` through to `runCapture` / `runChatLoad` /
`runWikiIngest`, expose a `signal: AbortSignal` option, and inside the
`Promise` constructor:
```ts
opts.signal?.addEventListener('abort', () => {
  if (settled) return
  settled = true
  child.kill('SIGTERM')
  clearTimeout(timer)
  resolve({ status: 'failed', error: 'aborted', ... })
})
```

### WR-06: Triage override endpoint accepts unbounded threadId and project_slug strings

**File:** `aios-ui/app/api/triage/override/[threadId]/route.ts:40-94`

**Issue:** `threadId` is consumed from the URL with no length cap, no
character allow-list, and no validation against `clients.yaml`. The same
applies to `body.project_slug`. The endpoint writes the string into
`triage-overrides.json` as a JSON key and into a receipt excerpt.
A 50 KB threadId would inflate the overrides file on every call. The
daily-inbox-triage SKILL reads the file each morning (Step 2.0) — a few
KB of garbage there is tolerable, but unbounded growth is a denial-of-
service vector if the route is ever reachable from anything other than
localhost.

**Fix:** Validate at the route entry:
```ts
if (!/^[0-9a-f]{12,32}$/i.test(threadId)) {
  return Response.json({ error: 'invalid threadId' }, { status: 400 })
}
```
The Gmail-thread-ID regex in `triage-output.tsx:27` (`[0-9a-f]{12,20}`)
is the source of truth — use it.

### WR-07: Receipt feed pill on click marks ALL receipts as seen, including ones that arrive AFTER expand

**File:** `aios-ui/components/receipt-feed.tsx:97-111`

**Issue:** `toggle()` sets `lastSeenAt = new Date().toISOString()` the
moment the user expands the panel. New receipts arriving while the
panel is open will all be in the future of `lastSeenAt`, so the unseen
badge will correctly count them — but only because of the `r.ts >
lastSeenAt` strict comparison. If a receipt and the toggle happen in
the same millisecond, the receipt is incorrectly marked seen. The
larger issue is that even receipts *the user never scrolled to* are
marked seen because of mere expansion. UX nit, not data loss.

**Fix:** Mark seen on collapse (or after a settle delay), not on
expand. Or scope `lastSeenAt` to receipts the user has visually
encountered (intersection observer).

### WR-08: Path traversal hardening missing on raw-drops + briefPathFor

**File:** `aios-ui/lib/raw-drops.ts:37-51`, `aios-ui/lib/indexer/build-brief.ts:30-32`

**Issue:** `buildRawDropPath` and `briefPathFor` both compose
filesystem paths from caller-supplied strings without verifying the
resolved path stays inside the expected root. `slugify()` does sanitize
the slug to `[a-z0-9-]`, which makes raw-drops safe on its own, but
`wikiPath` itself is read from `clients.yaml` via `docs_paths` — if
that file is ever edited to point at `/etc/`, `writeRawDrop` will
happily create `/etc/raw/aios/capture-...md`. Same with
`briefPathFor`'s slugs.

**Fix:** Add an `assertInside(root, target)` helper that
`path.resolve`s both and verifies `target.startsWith(root + path.sep)`.
Call from both `writeRawDrop` and `buildBriefFor`.

### WR-09: `useEffect` in chat-message-drop-button schedules state update after potential unmount

**File:** `aios-ui/components/chat-message-drop-button.tsx:52-55`

**Issue:** `setTimeout(() => { setPermanentlyDropped(true); setState('idle') }, 2000)`
has no cleanup. If the parent drawer collapses inside the 2-second
window (which fires `postDropSession` and unmounts message rows), React
will warn "Can't perform a state update on an unmounted component" and
swallow the state change. Cosmetic warning, not a real bug, but easy to
fix and the rest of the codebase tracks `cancelled` flags.

**Fix:**
```ts
useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | null = null
  if (state === 'success') {
    timer = setTimeout(() => {
      setPermanentlyDropped(true)
      setState('idle')
    }, 2000)
  }
  return () => { if (timer) clearTimeout(timer) }
}, [state])
```
Or use an AbortController pattern.

## Info

### IN-01: `extractTextDelta` duplicated across five subprocess wrappers

**File:** `aios-ui/lib/skills/daily-ingest.ts:19-37`, `aios-ui/lib/skills/capture.ts:20-38`, `aios-ui/lib/skills/wiki-ingest.ts:8-26`, `aios-ui/lib/skills/gmail-context.ts:30-48`, `aios-ui/lib/skills/calendar-context.ts:27-45`, `aios-ui/lib/indexer/build-brief.ts:38-56`

**Issue:** Six identical (or near-identical) copies of the
`extractTextDelta` helper. The build-brief.ts comment even calls this
out ("If a third caller appears, lift to lib/skills/stream-json.ts") —
the third caller appeared four files ago. Two of the copies also
duplicate the `extractSessionId` shape (chat.ts isn't in this review
scope but follows the same pattern). Risk: a parser fix lands in one
copy and silently misses the others (the `result` envelope handling in
`chat.ts:38` is already different from the others).

**Fix:** Promote to `lib/skills/stream-json.ts` with
`extractTextDelta` and `extractSessionId`. Import from all consumers.

### IN-02: receipt id generator uses `Math.random()` and risks collisions

**File:** `aios-ui/lib/skills/capture.ts:40-42`, `aios-ui/app/api/chat/[client]/[project]/drop-decision/route.ts:28-30`, `aios-ui/app/api/chat/[client]/[project]/drop-session/route.ts:28-30`, `aios-ui/app/api/wiki/ingest/[client]/[project]/route.ts:70`, `aios-ui/app/api/triage/override/[threadId]/route.ts:35-38`

**Issue:** Five distinct `newReceiptId()` / inline implementations
using `Math.random().toString(36).slice(2, 10)` or `slice(2, 12)`.
8 base-36 chars ≈ 41 bits of entropy; birthday-paradox collision
chance is non-trivial after ~1 M receipts. Receipts.jsonl never
rotates today, so this WILL happen eventually.

**Fix:** Use `crypto.randomUUID()` (available in Node 18+) and lift
to `lib/cache/receipts.ts` so every call site uses the same helper.

### IN-03: ProjectReceiptsSlice can return zero rows when the project has older receipts

**File:** `aios-ui/components/project-receipts-slice.tsx:42-44`

**Issue:** `readRecentReceipts(100)` returns the most-recent 100
receipts across ALL projects, then `.filter(r => r.project_slug ===
projectSlug)`. If 100 newer receipts came from other projects, this
project's last activity is invisible. The fix is to filter at the
read layer (or fetch all receipts and filter, since 100 is already
arbitrary).

**Fix:** Add `readRecentReceipts(opts?: { projectSlug?: string,
limit?: number })` to `lib/cache/receipts.ts` and push the filter
into the JSONL scan loop. Cap at `limit` AFTER filtering.

### IN-04: receipts.jsonl has no rotation policy

**File:** `aios-ui/lib/cache/receipts.ts:25-34`

**Issue:** Every write surface appends to the same file with no
rotation, compaction, or size cap. Over a year of daily use this
file will grow to multiple MB and slow down `readRecentReceipts`'s
full-read-then-reverse-then-slice strategy.

**Fix:** When file size exceeds a threshold (say 1 MB), rotate to
`receipts.jsonl.1` and start fresh. Alternatively switch to reading
the last N lines with a reverse-streaming approach.

### IN-05: `slugify` may discard meaning when input is non-Latin

**File:** `aios-ui/lib/raw-drops.ts:22-31`

**Issue:** `.replace(/[^a-z0-9]+/g, '-')` strips every non-ASCII
character. A capture starting with "über meeting notes" becomes
"ber-meeting-notes" — losing the "ü" entirely (the leading char
disappears). Justin's project domains are English-language so this
won't bite today, but it's a silent data loss.

**Fix:** Normalize with `.normalize('NFKD').replace(/[̀-ͯ]/g, '')`
before the strip, so accented letters degrade to ASCII rather than
disappearing.

### IN-06: `relativeTime` duplicated in three components

**File:** `aios-ui/components/receipt-feed.tsx:27-41`, `aios-ui/components/pending-ingestion-section.tsx:22-34`, `aios-ui/components/project-receipts-slice.tsx:21-35`

**Issue:** Three byte-identical copies of the same time-since helper.
`receipt-feed` and `project-receipts-slice` are byte-for-byte; the
pending-ingestion variant takes a `Date` instead of `string`.

**Fix:** Lift to `lib/format.ts` (which already exports
`formatRelativeDate`). Add `formatRelativeTime(dateOrIso)` and import
from all three components.

---

_Reviewed: 2026-05-22T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
