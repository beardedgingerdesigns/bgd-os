---
phase: "04-bidirectional-hub"
plan: "04-01"
type: "feature"
wave: 1
depends_on: []
files_modified:
  - aios-ui/components/triage-output.tsx
  - aios-ui/app/clients/[client]/projects/[project]/page.tsx
  - aios-ui/app/api/chat/[client]/[project]/message/route.ts
  - aios-ui/lib/data/wiki.ts
  - aios-ui/lib/skills/capture.ts
  - aios-ui/app/api/todos/[id]/route.ts
  - aios-ui/app/layout.tsx
  - aios-ui/instrumentation.ts
  - aios-ui/.gitignore
  - aios-ui/app/api/triage/override/[threadId]/route.ts
  - aios-ui/app/api/receipts/route.ts
  - aios-ui/app/api/wiki/ingest/[project]/route.ts
  - aios-ui/components/triage-row-actions.tsx
  - aios-ui/components/receipt-feed.tsx
  - aios-ui/components/pending-ingestion-section.tsx
  - aios-ui/components/chat-message-drop-button.tsx
  - aios-ui/lib/indexer/build-brief.ts
  - aios-ui/lib/indexer/watcher.ts
  - aios-ui/lib/raw-drops.ts
autonomous: true
must_haves:
  truths:
    - "Daily-inbox-triage skill reads .aios-cache/triage-overrides.json before its Step 2 filter and skips replied/not_me/dismissed/snoozed-not-elapsed threads"
    - "Daily-inbox-triage skill also checks Gmail thread participants (not just last sender) for Justin's address before claiming he owes a reply"
    - "Every Project page renders a Communications section with triage rows filtered to that project's contacts and per-row Replied/Snooze/Not-me actions"
    - "Every persistent write (capture, todo mutation, triage override, chat_drop, chat_session_close, wiki_ingest) emits one .aios-cache/receipts.jsonl entry with absolute file path + project slug + excerpt"
    - "Receipt feed renders in a collapsible global dock at the bottom-right of every page and as a per-project section on each Project page"
    - "wiki.ts.readWikiDecisions() returns title + firstParagraph + filePath for active+deferred decisions (capped at 20 each) and the Project page renders them as expandable sections (not just counts)"
    - "Project page renders Active Decisions, Recent log entries, Deferred decisions as expandable sections with vscode://file/{path} links to open in editor"
    - "Background indexer at lib/indexer/build-brief.ts invokes /load-project as a subprocess and writes .aios-cache/briefs/<slug>.md"
    - "chokidar watcher boots from instrumentation.ts; watches clients.yaml, references/, memory/, each project's docs_paths, and each project's wiki/raw/aios/; rebuilds affected briefs with 500ms debounce"
    - "Project chat /message endpoint hydrates from the cached brief + live Gmail (last 7d) + calendar (next 7d) on first message of a session; 'Refresh context' button re-runs the indexer and restarts the session"
    - "Per-AI-message 'Drop to raw' button writes {wiki}/raw/aios/chat-decision-YYYY-MM-DD-<slug>.md and emits chat_drop receipt"
    - "Chat session close auto-writes {wiki}/raw/aios/chat-session-YYYY-MM-DD-<id>.md and emits chat_session_close receipt"
    - "Capture from a project page with a wiki writes to {wiki}/raw/aios/capture-YYYY-MM-DD-<slug>.md; project without a wiki falls back to existing claude-os memory destination"
    - "Pending Ingestion section on each Project page counts raw/aios/*.md files newer than the most recent 'ingest' entry in wiki/log.md and exposes a one-click 'Run wiki ingest' that invokes the llm-wiki ingest pass"
    - "All existing flows (new-client/project/delete dialogs, daily ingest modal, ritual modal, Admin chat, todo accept/done/dismiss/reopen) continue to work without regression"
  artifacts:
    - .aios-cache/triage-overrides.json (gitignored, written by override route)
    - .aios-cache/receipts.jsonl (gitignored, appended by every write surface)
    - .aios-cache/briefs/<slug>.md (gitignored, written by indexer per project)
    - Updated /Users/justinlobaito/.claude/skills/daily-inbox-triage/SKILL.md with override-aware Step 2 + Gmail thread-participant check
    - docs/adr/ unchanged (ADRs 0003-0005 already shipped before this phase started)
---

# 04-01 PLAN — AIOS UI v2 Bidirectional Hub

> **Source.** Imported from `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md` via `/gsd-import` on 2026-05-21. Original plan produced during a `/grill-with-docs` session walking the design tree with operator Justin Lobaito. Five anchor decisions captured: bidirectional store model, per-project triage with override, auto-write + receipt feed, pre-built indexed briefs, staged ingestion via `raw/aios/`. ADRs 0003-0005 codify the load-bearing ones.

## Context

The AIOS UI today is a passive reader on top of `clients.yaml`, wikis, memory, and a few subprocess-launched skills. Operator pain (2026-05-21):

- **"It doesn't create continuity"** — open a project, can't tell what's been said or decided. Chat errors with `"no active session — call /load first"` because the UI never hydrates wiki/memory context.
- **"Very read-only. I'm filling info in and I'm not sure what's happening with it"** — Capture spawns `/capture` and the result vanishes. Ritual chat doesn't persist. No receipt for any write.
- **"To-dos are clunky"** + **"daily ingest assumes I haven't replied even when I have"** — triage uses a naive "is the last sender Justin?" check; no Sent-folder check, no in-thread participant check, no override.
- **"I want it connected to my project repo wikis"** — wikis show as counts only. No content surfacing, no chat hydration, no write-back.

This phase turns the AIOS UI from passive viewer into bidirectional hub: writes are visible and durable, chat carries project context, wikis are first-class, daily ingest defers to operator judgment.

## Anchor decisions (carried from grill-with-docs)

1. **Bidirectional store.** UI is the seam between inputs (Gmail, calendar, CLI, wiki edits) and durable storage (project wikis, decisions log, memory). Two-way pipe. → ADR 0003.
2. **Comms = per-project triage with per-row override.** AIOS does NOT become an email client. Gmail still owns reading + sending. Override actions: replied / snooze / not me / dismissed. (Net-new behavior beyond HUB-04; recommend formalizing as HUB-09.)
3. **Write-back is STAGED.** AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` — NEVER to curated wiki structure. → ADR 0004.
4. **Trust = auto-write + receipt feed (no approval gates).** Speed over friction; visibility instead of modals.
5. **Chat hydration = pre-built indexed briefs.** Background indexer keeps `aios-ui/.aios-cache/briefs/<slug>.md` fresh; chat reads cache on every open. → ADR 0005.

**Cross-repo boundary** — receipts MUST display absolute paths so the operator sees when writes leave claude-os into external repo paths.

## Scope — five sections (treat as one plan; can be decomposed into waves)

### A. Per-project triage with override (HUB-04 + new HUB-09 capability)

**State file** — `aios-ui/.aios-cache/triage-overrides.json` (gitignored, atomic temp+rename):
```json
{
  "<gmail_thread_id>": {
    "status": "replied" | "snoozed" | "not_me" | "dismissed",
    "marked_at": "2026-05-21T12:34:00Z",
    "snooze_until": "2026-05-23T09:00:00Z"
  }
}
```

**Skill change** — `/Users/justinlobaito/.claude/skills/daily-inbox-triage/SKILL.md`:
- Step 2 ("Justin owes a reply") reads `triage-overrides.json` BEFORE filtering. Skip threads whose status is `replied | not_me | dismissed`. Skip `snoozed` while `snooze_until > now`.
- On borderline threads, call `mcp__claude_ai_Gmail__get_thread` and check whether `justin@beardedgingerdesigns.com` appears as sender on ANY message (not just last). If yes → downgrade or drop.

**New UI**:
- `aios-ui/components/triage-row-actions.tsx` — three buttons per row (Replied / Snooze 2d / Not me). Mirror `aios-ui/components/todo-list.tsx` optimistic mutation + SSE refresh pattern.
- `aios-ui/app/api/triage/override/[threadId]/route.ts` — POST `{status, snooze_until?}` → atomic write → emit receipt → SSE invalidate.
- Per-project filter: extend `aios-ui/components/triage-output.tsx` to accept a `projectSlug` prop that filters rows to that project's `contacts` from `clients.yaml`.
- "Communications" section on Project page rendering the filtered rows.

**Reuse**: mutation pattern from `aios-ui/app/api/todos/[id]/route.ts`. Existing SSE invalidation bus.

### B. Receipt feed (HUB-06)

**State file** — `aios-ui/.aios-cache/receipts.jsonl` (append-only NDJSON, gitignored):
```json
{"id":"rcpt_xxx","ts":"2026-05-21T12:34:00Z","kind":"capture|todo|triage_override|chat_drop|chat_session_close|wiki_ingest","project_slug":"wild-rose","file_written":"/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/capture-2026-05-21-launch-slip.md","excerpt":"first 240 chars","actor":"capture-box"}
```

**Emission points** — every persistent write logs one entry on success:
- `aios-ui/lib/skills/capture.ts` — after `/capture` subprocess returns.
- `aios-ui/app/api/todos/[id]/route.ts` — after status mutation.
- Triage override route.
- Chat "Drop to raw" per-message action + chat session-close handler.
- Future wiki ingest run completion → emits a `wiki_ingest` receipt summarizing promotions.

**UI**:
- `aios-ui/components/receipt-feed.tsx` — last 20 receipts. Each row: relative timestamp, kind chip (color per kind), project slug, excerpt, file path in mono (click-to-copy + `vscode://file/{path}`).
- Global dock at bottom-right of every page, slotted into `aios-ui/app/layout.tsx`. Default collapsed; badge count = unseen since last open.
- Per-project slice rendered on Project page.
- `aios-ui/app/api/receipts/route.ts` — GET (cursor pagination) + SSE subscription via existing invalidation bus.

### C. Wiki display layer (HUB-08)

**Data layer** — extend `aios-ui/lib/data/wiki.ts`:
- `readWikiDecisions(wikiPath)` → `{ active: DecisionSummary[], deferred: DecisionSummary[] }` where `DecisionSummary = { slug, title, firstParagraph, filePath, modified }`. Cap at 20 per bucket.
- `readWikiLogEntries(wikiPath, limit=10)` — already exists per exploration. Keep.
- `readPendingIngest(wikiPath)` → `{ count, files: PendingFile[] }`. Lists `raw/aios/*.md` whose `mtime > last_ingest_log_entry_time`. Last-ingest time = most recent `## [YYYY-MM-DD] ingest |` entry in `wiki/log.md`.

**UI** in `aios-ui/app/clients/[client]/projects/[project]/page.tsx`:
- Replace counts row with three expandable sections:
  - **Active decisions** — title + first paragraph, click-to-open via `vscode://file/{path}`
  - **Recent log entries** — last 5 with date + first line
  - **Deferred decisions** — collapsed by default
- "Open wiki in editor" button at the top of the section.

**Reuse**: shadcn `Card`, lucide icons. Add `Collapsible` if not wired.

### D. Chat hydration via indexed briefs (HUB-01, HUB-02, HUB-03, HUB-04)

**Indexer** — `aios-ui/lib/indexer/build-brief.ts`:
- Input: project slug.
- Strategy: invoke `/load-project` as a subprocess (`claude --print --output-format stream-json /load-project <slug>`), capture stdout, write to `aios-ui/.aios-cache/briefs/<slug>.md`. Do NOT reimplement load-project logic.
- Exclude dynamic data: Gmail and calendar fetched live at chat bootstrap.

**Watcher** — `aios-ui/lib/indexer/watcher.ts`:
- `chokidar` watching `clients.yaml`, `references/`, `memory/`, each project's resolved `docs_paths`, each project's `wiki/raw/aios/`.
- On change → debounce 500ms → rebuild affected briefs.
- Boot once via `aios-ui/instrumentation.ts`.

**Chat bootstrap** — `aios-ui/app/api/chat/[client]/[project]/message/route.ts`:
- On first message of a session: read `.aios-cache/briefs/<slug>.md` + fetch live Gmail (last 7d for project contacts) + calendar (next 7d) → prepend combined context as the spawned subprocess's system message.
- "Refresh context" button → re-run indexer + Gmail/cal fetch + restart session.

**Chat write-back surfaces** (no auto-detection — explicit operator action):
- Per-AI-message "Drop to raw" button writes `{wiki}/raw/aios/chat-decision-YYYY-MM-DD-<slug>.md` containing the prior user turn + that AI turn + a header. Emits `chat_drop` receipt.
- On chat surface close / new session start: full transcript drops to `{wiki}/raw/aios/chat-session-YYYY-MM-DD-<id>.md`. Emits `chat_session_close` receipt.
- Heuristic auto-detection of "decision in chat" is OUT OF SCOPE.

**Reuse**:
- Subprocess pattern from `aios-ui/lib/skills/ritual-chat.ts`.
- Existing chat session machinery in `/api/admin/[ritual]/chat`.

### E. Pending ingestion surface (HUB-07)

**UI on project page** — section "Pending ingestion ({N})":
- Empty state when N=0: "All AIOS drops have been ingested into the wiki."
- N>0: list of file basenames + relative timestamps + kind chip. Click to preview.
- "Run wiki ingest" button → spawns the llm-wiki ingest flow → streams output into a modal → on success emits `wiki_ingest` receipt summarizing promotions.

**Data**: from `readPendingIngest(wikiPath)` above.

**Ingest skill** — verify `/Users/justinlobaito/.claude/skills/llm-wiki/SKILL.md` supports batch-ingest invocation. If it doesn't expose a clean "ingest everything new in `raw/aios/`" entry, add a wrapper `/ingest-aios-drops` skill that:
1. Lists `raw/aios/*.md` modified since last `log.md` ingest entry.
2. For each, invokes the llm-wiki ingest flow.
3. Returns a structured summary of what was promoted, what was contested.

### Capture flow (wiki-aware routing — supports HUB-05)

`aios-ui/lib/skills/capture.ts` becomes wiki-aware:
- Resolve project's wiki path via existing detection in `aios-ui/lib/data/wiki.ts`.
- If wiki present: pass `--destination-dir={wiki}/raw/aios/` (or equivalent) to the `/capture` skill, filename pattern `capture-YYYY-MM-DD-<slug>.md`.
- If no wiki: fall back to current claude-os memory destination.
- Either way: parse skill stdout for written file path, log a receipt.

The `/capture` skill may need a small extension to honor `--destination-dir`, or the UI writes the file directly (bypassing the skill for wiki-routed captures) and the skill stays as the claude-os-memory writer for non-wiki captures. Executor's call.

## Wave decomposition (suggested for `/gsd-execute-phase`)

If splitting into multiple plans, suggested waves:

- **Wave 1 (independent)**:
  - 04-01: `lib/raw-drops.ts` helper + receipt-feed scaffold (`.aios-cache/receipts.jsonl` + `app/api/receipts/route.ts` + `components/receipt-feed.tsx` + layout dock slot)
  - 04-02: `lib/data/wiki.ts` extensions (`readWikiDecisions`, `readPendingIngest`)
- **Wave 2 (depend on Wave 1)**:
  - 04-03: Wiki display layer in project page
  - 04-04: Triage override (state file + skill change + per-row actions + comms section)
  - 04-05: Capture wiki-aware routing
  - 04-06: Indexer + watcher (`lib/indexer/build-brief.ts` + `lib/indexer/watcher.ts` + `instrumentation.ts` bootstrap)
- **Wave 3 (depend on Wave 2)**:
  - 04-07: Chat hydration bootstrap (chat route reads brief + Gmail + calendar)
  - 04-08: Chat write-back (Drop to raw button + session-close transcript drop)
- **Wave 4 (depends on Waves 1-3)**:
  - 04-09: Pending Ingestion surface + ingest skill verification / wrapper

Decomposition is OPTIONAL — this single 04-01 plan is also executable as one autonomous unit. Operator's call at `/gsd-execute-phase`.

## Documentation updates (during execution)

### CONTEXT.md sharpening
Already done during the grilling session (committed in ab37bff). The six new terms (Receipt feed, Triage override, Project brief, Raw drop, Pending ingestion, Communications) and three sharpened terms (Recent activity, Project chat, LLM-wiki) are already in `/Users/justinlobaito/repos/claude-os/CONTEXT.md`.

### ADRs
0003 (bidirectional-store-model), 0004 (staged-ingestion-via-raw-aios), 0005 (chat-hydration-via-indexed-briefs) — already shipped at `docs/adr/` (committed in ab37bff).

### Required during this phase
- New REQUIREMENTS.md entry `HUB-09` (DERIVED) for the triage override behavior: "Daily-inbox-triage Skill consults `.aios-cache/triage-overrides.json` before its Step 2 filter; per-row Replied/Snooze/Not-me actions on Communications section write to that file."
- Possibly new skill `/Users/justinlobaito/.claude/skills/ingest-aios-drops/SKILL.md` if `llm-wiki` doesn't expose a clean batch entry point.

## Verification

Run order — must all pass:

1. **Triage override** — From Wild Rose project page, click "I replied" on a wrongly-surfaced thread. Re-run daily ingest. Thread does NOT reappear. `.aios-cache/triage-overrides.json` contains the entry. `receipts.jsonl` has a `triage_override` row. Global receipt dock shows it.

2. **Capture → raw drop** — On Wild Rose project page, type "verification capture about Meghan handoff" in Capture and submit. Within 2 seconds: global receipt dock shows a row with timestamp, `capture` chip, `wild-rose`, excerpt, and absolute path `/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/capture-2026-05-21-meghan-handoff.md`. Click the path — opens in editor. Pending Ingestion count on the project page increments by 1.

3. **Wiki display** — Active Decisions section renders actual decision titles + first paragraphs. Click a title — opens the `.md` file in editor.

4. **Chat hydration** — Project page shows "Brief loaded (built Nm ago)". Without setup, ask "What's the launch date for Wild Rose?" — chat answers from the brief. Inspect `.aios-cache/briefs/wild-rose.md` — has wiki decisions + memory content.

5. **Chat → raw drop** — In project chat, get the assistant to state a decision. Click "Drop to raw" on that AI message. Receipt fires with `chat_drop` kind, path under `raw/aios/chat-decision-*`. Pending Ingestion count increments.

6. **Chat session close → transcript drop** — Refresh the project page or click "New session." `chat_session_close` receipt fires with path under `raw/aios/chat-session-*`. File contains the transcript.

7. **Pending ingestion → run** — Pending Ingestion section now shows N>0. Click "Run wiki ingest." Modal streams the ingest skill output. On success: `wiki_ingest` receipt summarizing promotions. Wiki's `log.md` has new `ingest` entries. Reload project page → count returns to 0. Active Decisions section now includes any newly-promoted decisions.

8. **Watcher** — Manually add a file to `/Users/justinlobaito/repos/wild-rose/wiki/raw/aios/capture-test.md`. Within ~2s the brief rebuilds (check `briefs/wild-rose.md` mtime). Pending Ingestion count updates.

9. **No regressions** — new-client / new-project / delete dialogs, daily ingest modal, ritual modal, Admin chat, todo accept/done/dismiss/reopen all still work.

10. **Tests** — existing `aios-ui/tests/lib/data/clients-mutations.test.ts` and `aios-ui/tests/app/api/clients.test.ts` keep passing. Add unit tests for `readWikiDecisions`, `readPendingIngest`, `build-brief.ts` (mock the `/load-project` subprocess), `raw-drops.ts` (slug + filename helpers), and override read/write helpers.
