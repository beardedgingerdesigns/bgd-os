# Phase 04: Bidirectional Hub — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Source:** Synthesized from [04-00-DESIGN.md](./04-00-DESIGN.md) (imported via `/gsd-import` from `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md`) + LOCKED ADRs 0003/0004/0005 + the 2026-05-21 grill-with-docs session output.

<domain>
## Phase Boundary

**What this phase delivers (operator-visible):**

- A "Communications" section on every Project page rendering daily-inbox-triage rows filtered to that Project's `contacts`, with per-row Replied / Snooze 2d / Not me override actions.
- A globally-visible Receipt feed (bottom-right dock, collapsible) showing the last 20 durable writes the UI initiated, plus a per-Project slice on each Project page.
- A Project page Wiki Display section rendering active decisions + recent log entries + deferred decisions as expandable surfaces (replacing today's bare counts), each clickable to open via `vscode://file/{path}`.
- A Project chat surface that hydrates instantly from a pre-built indexed brief on every session bootstrap (no more "no active session — call /load first" errors), with live Gmail + calendar fetched on-bootstrap.
- A "Pending Ingestion ({N})" section on every Project page listing `raw/aios/*.md` files awaiting promotion, plus a one-click "Run wiki ingest" button.

**What this phase does NOT do:**
- Render Gmail thread bodies inline. Reading still happens in Gmail.
- Allow drafting / sending email from AIOS. Sending still happens in Gmail.
- Auto-detect "decision in chat." Promotion to `raw/aios/chat-decision-*` is explicit operator action via per-AI-message "Drop to raw" button.
- Write to ANY curated wiki path (`decisions/`, `sources/`, `log.md`, `index.md`). AIOS writes ONLY to `{wiki}/raw/aios/`.
- Add gates to capture / write paths. Trust comes from receipts (visibility), not from approval modals.
- Add UI for cross-project triage views. The Communications surface is per-Project only.

**Repos affected:**
- `claude-os` (this repo) — UI code in `aios-ui/`, skill change at `/Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md`.
- External project wikis (e.g. `/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/`, `/Users/justinlobaito/repos/thermal-kitchen/docs/wiki/raw/aios/`, `/Users/justinlobaito/repos/iowa-everywhere/docs/wiki/raw/aios/`) — write target only, no curated edits.

</domain>

<decisions>
## Implementation Decisions

### Continuity model — bidirectional store (ADR 0003, LOCKED)
UI is the seam. Inputs (Gmail, calendar, CLI sessions, wiki edits) surface here. Outputs (captures, chat drops, chat sessions, triage overrides) propagate to durable storage. Two-way pipe.

### Comms surface — per-project triage with override (feature-level)
AIOS is a triage layer over Gmail, NOT an email client. Per-row override actions write to `aios-ui/.aios-cache/triage-overrides.json`. The daily-inbox-triage Skill reads this file BEFORE its Step 2 "Justin owes a reply" filter. Per HUB-09.

### Write path — staged ingestion via `raw/aios/` (ADR 0004, LOCKED)
AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`. Three kinds: `capture`, `chat-decision`, `chat-session`. Files are immutable once written. The wiki's own `llm-wiki` ingest pass owns promotion from staging into curated structure. AIOS NEVER touches `wiki/decisions/`, `wiki/sources/`, `wiki/log.md`, `wiki/index.md`.

### Write trust — auto-write + receipt feed (no approval gates) (feature-level)
Every persistent write hits disk immediately. Trust comes from the Receipt feed: timestamp, kind chip, project slug, absolute file path (click-to-open via `vscode://file/{path}`), excerpt. Persisted at `aios-ui/.aios-cache/receipts.jsonl` (append-only NDJSON).

### Chat hydration — pre-built indexed briefs (ADR 0005, LOCKED, supersedes ADR 0001 §6 mechanism)
A background indexer (`aios-ui/lib/indexer/build-brief.ts`) invokes `/load-project` as a subprocess and writes `aios-ui/.aios-cache/briefs/<slug>.md`. A `chokidar` watcher (`aios-ui/lib/indexer/watcher.ts`) rebuilds affected briefs on changes to `clients.yaml`, `references/`, `memory/`, each project's resolved `docs_paths`, and each project's `wiki/raw/aios/`, with 500ms debounce. Bootstrapped via `aios-ui/instrumentation.ts`.

### Chat session continuity (HUB-03, follows ADR 0001 §3 subprocess pattern)
Chat backend spawns a long-running `claude` subprocess per Project, manages session IDs via `claude --resume <session-id>`, persists session IDs in `aios-ui/.aios-cache/sessions.json`, streams stdout to browser via SSE. This is HUB-03; the DESIGN.md under-specified it — make sure the planner explicitly addresses session persistence and resume semantics.

### Dynamic data — fetched live at chat bootstrap (HUB-04)
Gmail (last 7d for project contacts) and calendar (next 7d) are NOT in the static brief. They're fetched live on the first message of each chat session and prepended as additional context to the spawned subprocess. "Refresh context" button re-invokes the indexer and refetches Gmail/cal.

### Capture flow — wiki-aware routing
`aios-ui/lib/skills/capture.ts` resolves project's wiki path via existing detection in [aios-ui/lib/data/wiki.ts](../../../aios-ui/lib/data/wiki.ts). If wiki present, route capture to `{wiki}/raw/aios/capture-YYYY-MM-DD-<slug>.md`. If no wiki, fall back to current claude-os memory destination. Either way, parse stdout for written file path and log a receipt.

### Chat write-back — explicit operator action only
- Per-AI-message "Drop to raw" button writes `{wiki}/raw/aios/chat-decision-YYYY-MM-DD-<slug>.md` containing the prior user turn + that AI turn + a header. Emits `chat_drop` receipt.
- On chat surface close / new session start: full transcript drops to `{wiki}/raw/aios/chat-session-YYYY-MM-DD-<id>.md`. Emits `chat_session_close` receipt.
- Heuristic auto-detection of "decision in chat" is **OUT OF SCOPE** for this phase.

### Pending Ingestion surface (HUB-07)
Counts `raw/aios/*.md` files whose `mtime > last_ingest_log_entry_time` (most recent `## [YYYY-MM-DD] ingest |` entry in `wiki/log.md`). One-click "Run wiki ingest" button spawns the `llm-wiki` ingest workflow. If `llm-wiki` doesn't expose a clean batch entry point for "ingest everything new in `raw/aios/`", add a wrapper skill at the AIOS project-local location: `/Users/justinlobaito/repos/claude-os/.claude/skills/ingest-aios-drops/SKILL.md` (matches where the other AIOS-specific skills live: daily-inbox-triage, load-project, audit, level-up, weekly-project-status, onboard*).

### Claude's Discretion (planner picks)
- Subfolder layout under `raw/aios/` (flat with prefixed filenames vs. per-kind subfolders). DESIGN.md suggests flat-with-prefix.
- Snooze duration default for the triage override (DESIGN.md suggests 2 days).
- Receipt feed dock collapsed/expanded default state and badge-count behavior.
- Indexer first-run policy: lazy on first chat open per project, vs. eager at server boot. DESIGN.md suggests lazy.
- Exact size of `.aios-cache/briefs/<slug>.md` (DESIGN.md suggests cap around ~16k tokens).
- Cleanup policy on `receipts.jsonl` (rotate after N entries, truncate, or unbounded). Recommend lazy rotation on read at ~5k entries.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked decisions
- [docs/adr/0001-aios-ui-architecture.md](../../../docs/adr/0001-aios-ui-architecture.md) — Foundational architecture: local-only Next.js, additive viewer, CLI subprocess for chat, in-memory index + chokidar, drill-down nav. §6 mechanism (auto-load on first expand) is SUPERSEDED by ADR 0005.
- [docs/adr/0002-mrr-data-model.md](../../../docs/adr/0002-mrr-data-model.md) — MRR rollup math (paying+active filter, structured mrr_monthly field, dealers-as-Projects).
- [docs/adr/0003-bidirectional-store-model.md](../../../docs/adr/0003-bidirectional-store-model.md) — UI as the seam between inputs and durable storage. Phase 4 IS this ADR's implementation.
- [docs/adr/0004-staged-ingestion-via-raw-aios.md](../../../docs/adr/0004-staged-ingestion-via-raw-aios.md) — Writes-only-to-`raw/aios/` decision. AIOS NEVER touches curated wiki structure.
- [docs/adr/0005-chat-hydration-via-indexed-briefs.md](../../../docs/adr/0005-chat-hydration-via-indexed-briefs.md) — Background indexer + chokidar watcher + cached brief reads. Supersedes ADR 0001 §6 mechanism.

### Glossary
- [/Users/justinlobaito/repos/claude-os/CONTEXT.md](../../../CONTEXT.md) — canonical terms: Client, Project, Bucket, MRR, Skill, LLM-wiki, AIOS UI, Capture, Admin, Operator chat, Recent activity, **Receipt feed**, **Triage override**, **Project brief**, **Raw drop**, **Pending ingestion**, **Communications**.

### Design doc
- [04-00-DESIGN.md](./04-00-DESIGN.md) — Full design narrative imported from the grilling-session plan file. Five sections (A–E) with file-by-file decomposition and suggested wave breakdown.

### Skills the UI shells out to
- [/Users/justinlobaito/repos/claude-os/.claude/skills/load-project/SKILL.md](file:///Users/justinlobaito/repos/claude-os/.claude/skills/load-project/SKILL.md) — invoked by the brief indexer.
- [/Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md](file:///Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md) — Step 2 filter must be modified to read `triage-overrides.json` + Gmail thread-participant check (HUB-09).
- [/Users/justinlobaito/.claude/skills/llm-wiki/SKILL.md](file:///Users/justinlobaito/.claude/skills/llm-wiki/SKILL.md) — invoked by the "Run wiki ingest" button. Verify batch-ingest entry point exists; if not, add `/ingest-aios-drops` wrapper.
- The `/capture` skill: production code at [aios-ui/lib/skills/capture.ts](../../../aios-ui/lib/skills/capture.ts) invokes `claude --print /capture <text>` as a subprocess. Locate the actual skill file at execution time (likely `/Users/justinlobaito/.claude/skills/gsd-capture/SKILL.md` aliased via Claude Code's slash-command resolution, OR a project-local `capture/` skill if one exists). If extending the skill is harder than expected, the alternative is for `aios-ui/lib/skills/capture.ts` to write the file directly into `{wikiPath}/raw/aios/` when a wiki path is present and skip the skill subprocess entirely — both routes satisfy HUB-05 and HUB-06.

### Existing UI patterns to reuse
- [aios-ui/components/todo-list.tsx](../../../aios-ui/components/todo-list.tsx) — optimistic mutation + SSE refresh pattern. Triage row actions mirror this.
- [aios-ui/app/api/todos/[id]/route.ts](../../../aios-ui/app/api/todos/[id]/route.ts) — atomic write + invalidation-bus broadcast pattern. Receipt emission + triage override write follow this.
- [aios-ui/lib/skills/ritual-chat.ts](../../../aios-ui/lib/skills/ritual-chat.ts) — `spawn('claude', [...stream-json args])` subprocess pattern. Indexer + chat-bootstrap reuse this.
- [aios-ui/lib/data/wiki.ts](../../../aios-ui/lib/data/wiki.ts) — wiki detection helpers. Extended with `readWikiDecisions`, `readPendingIngest`.

</canonical_refs>

<specifics>
## Specific Ideas

### File targets (from DESIGN.md "Critical files" section)

**Modify:**
- `/Users/justinlobaito/repos/claude-os/.claude/skills/daily-inbox-triage/SKILL.md` — Step 2 reads override file + Gmail thread-participant check
- `aios-ui/components/triage-output.tsx` — add `projectSlug` prop filter, integrate row actions
- `aios-ui/app/clients/[client]/projects/[project]/page.tsx` — wiki content sections, Comms section, Pending Ingestion section, per-project Receipt slice
- `aios-ui/app/api/chat/[client]/[project]/message/route.ts` — brief hydration + live Gmail/calendar at bootstrap
- `aios-ui/lib/data/wiki.ts` — `readWikiDecisions`, `readPendingIngest`
- `aios-ui/lib/skills/capture.ts` — wiki-aware routing + receipt emission
- `aios-ui/app/api/todos/[id]/route.ts` — receipt emission
- `aios-ui/app/layout.tsx` — global receipt-feed dock slot
- `aios-ui/instrumentation.ts` — boot the indexer watcher
- `aios-ui/.gitignore` — ensure `.aios-cache/` is ignored

**Create:**
- `aios-ui/app/api/triage/override/[threadId]/route.ts`
- `aios-ui/app/api/receipts/route.ts`
- `aios-ui/app/api/wiki/ingest/[project]/route.ts`
- `aios-ui/components/triage-row-actions.tsx`
- `aios-ui/components/receipt-feed.tsx`
- `aios-ui/components/pending-ingestion-section.tsx`
- `aios-ui/components/chat-message-drop-button.tsx`
- `aios-ui/lib/indexer/build-brief.ts`
- `aios-ui/lib/indexer/watcher.ts`
- `aios-ui/lib/raw-drops.ts`
- (Runtime, gitignored:) `aios-ui/.aios-cache/triage-overrides.json`, `receipts.jsonl`, `briefs/<slug>.md`, `sessions.json`

### State file shapes

`aios-ui/.aios-cache/triage-overrides.json`:
```json
{
  "<gmail_thread_id>": {
    "status": "replied" | "snoozed" | "not_me" | "dismissed",
    "marked_at": "ISO-8601",
    "snooze_until": "ISO-8601 (optional)"
  }
}
```

`aios-ui/.aios-cache/receipts.jsonl` (one JSON per line):
```json
{"id":"rcpt_xxx","ts":"ISO-8601","kind":"capture|todo|triage_override|chat_drop|chat_session_close|wiki_ingest","project_slug":"<slug>","file_written":"/abs/path/to/file.md","excerpt":"first 240 chars","actor":"capture-box|todo-list|..."}
```

`aios-ui/.aios-cache/sessions.json` (HUB-03):
```json
{
  "<client_slug>::<project_slug>": {
    "session_id": "<claude session UUID>",
    "started_at": "ISO-8601",
    "last_message_at": "ISO-8601"
  }
}
```

### Suggested wave decomposition (carry from DESIGN.md)

- **Wave 1 (independent)**: `lib/raw-drops.ts` helper + receipt-feed scaffold; `lib/data/wiki.ts` extensions
- **Wave 2 (depends on Wave 1)**: Wiki display layer; Triage override (state file + skill change + per-row actions + Comms section); Capture wiki-aware routing; Indexer + watcher
- **Wave 3 (depends on Wave 2)**: Chat hydration bootstrap (reads brief + Gmail + calendar); Chat write-back (Drop to raw + session-close transcript drop)
- **Wave 4 (depends on Waves 1-3)**: Pending Ingestion surface + ingest skill verification/wrapper

### Verification (must all pass before phase completes)
See [04-00-DESIGN.md §"Verification"](./04-00-DESIGN.md) for 10-step verification sequence. Highlights:
1. Triage override survives a daily-ingest re-run (HUB-09)
2. Capture → raw drop with absolute path receipt (HUB-05, HUB-06)
3. Wiki display section renders titles not just counts (HUB-08)
4. Chat hydrates instantly from cached brief + live Gmail/cal (HUB-01..04)
5. Per-AI "Drop to raw" + session-close transcript drops (HUB-05, HUB-06)
6. Pending Ingestion "Run wiki ingest" promotes drops into curated wiki (HUB-07)
7. Watcher rebuilds brief within 2s of source change (HUB-02)
8. No regressions in new-client / new-project / delete / daily-ingest / ritual / Admin chat / todo flows

</specifics>

<deferred>
## Deferred Ideas

### Explicitly OUT OF SCOPE for Phase 4
- Heuristic auto-detection of "decision in chat" — fuzzy, low-trust. Operator drives promotion via explicit "Drop to raw" button.
- Inline rendering of Gmail thread bodies on Project page.
- Inline draft reply composer (writing to Gmail Drafts).
- Cross-project triage view (one big list across all projects). v1+v2 already have a global triage modal on Home; this phase adds per-Project filtering, not a new cross-project view.
- Pre-built indexer batch run at server boot (DESIGN.md suggests lazy first-run per project). Re-evaluate if first-chat-per-project latency becomes painful.
- Gated "promote" modal as an alternative trust mechanism. Receipt feed is the canonical trust mechanism for v2.

### Possible follow-ups (Phase 5 candidates)
- Receipt feed retention policy + UI to browse historical receipts beyond the last 20.
- Pending Ingestion auto-run on schedule (cron).
- Operator-configurable indexer triggers (e.g., disable wiki/raw/aios/ watch for noisy projects).
- Chat "promote this turn" button enhancement to auto-name the slug from the AI turn's first sentence.

</deferred>

---

*Phase: 04-bidirectional-hub*
*Context gathered: 2026-05-21 from /grill-with-docs session + /gsd-import (DESIGN.md) + ADRs 0001-0005 via /gsd-plan-phase synthesis path.*
