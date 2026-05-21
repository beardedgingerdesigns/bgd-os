# Decisions — synthesized intel

Source-of-truth: ADR files under `docs/adr/`. All 5 ADRs are LOCKED (`Status: Accepted`, `precedence: 0`, `locked: true`). Higher precedence than SPEC/DOC.

---

## DEC-aios-ui-local-only

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §1
- status: locked (ADR 0001 — Accepted 2026-05-19)
- scope: AIOS UI deployment
- decision: The AIOS UI is a Next.js app run via `npm run dev`, bound to `localhost:3000`, reading and writing Justin's filesystem directly. No auth, no deployment, no cloud sync. Only accessible while Justin is at his desk.

## DEC-aios-ui-additive-not-replacement

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §2
- status: locked (ADR 0001)
- scope: AIOS UI relationship to existing CLI
- decision: The UI does NOT replace the terminal Claude Code surface. Both coexist. UI's role: render markdown beautifully, launch Skills as buttons that shell out to the `claude` CLI as subprocesses, host Claude Code chat sessions embedded in the UI. UI does not reimplement Skill logic, does not invent its own database, does not write to project files directly except through Skills (with one acknowledged exception: the Capture box may write through `/gsd-capture`).

## DEC-chat-via-cli-subprocess

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §3
- status: locked (ADR 0001)
- scope: AI plumbing for project chat
- decision: Chat window spawns a long-running `claude` process per Project, manages sessions via `claude --resume <session-id>` for continuity, streams stdout to the browser via Server-Sent Events. Session IDs persist in a `.aios-cache/` sidecar. Rejected: Claude Agent SDK (stability + plugin gaps), one-shot `claude --print` per message (loses multi-step skill state), embedded terminal emulator (defeats visual goals).

## DEC-in-memory-index-with-chokidar

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §4
- status: locked (ADR 0001)
- scope: AIOS UI data model
- decision: On server start, parse `clients.yaml`, `references/*.md`, `decisions/log.md`, `memory/project_*.md`, and any external LLM-wiki directories registered in `docs_paths:`. Hold in-memory index (JavaScript objects). `chokidar` watcher with 250ms debounce monitors all paths; on change: re-parse affected file(s), update index, push SSE message identifying invalidated entity, browser refetches. No SQLite, no persistent cache, no database. Filesystem is source of truth.

## DEC-drill-down-nav

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §5
- status: locked (ADR 0001)
- scope: AIOS UI navigation
- decision: No always-visible global sidebar tree. Three levels: Home (`/`, no sidebar, Client cards + Admin card + MRR widget + daily-ingest button + Recent activity + Onboard-new-client button), Client page (`/clients/{slug}`, sidebar of Projects under this Client only, primary contacts, client-level MRR rollup, Project cards, scoped Recent activity, breadcrumb `Home > {Client}`), Project page (`/clients/{slug}/projects/{project-slug}`, same sidebar, header + compact contacts + Recent activity + Capture box + collapsed chat drawer, breadcrumb `Home > {Client} > {Project}`). Plus Admin (`/admin`) accessed via Home card. Persistent breadcrumb; "Home" link always clickable.

## DEC-project-chat-auto-load-on-first-expand

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §6
- status: locked (ADR 0001) — mechanism superseded by ADR 0005 (also locked)
- scope: Project chat invocation
- decision (ADR 0001 intent): Project page renders statically from in-memory index (zero AI calls). Chat panel is a collapsed drawer at bottom. First expand fires `claude --print "/load {slug}"`, injects Markdown brief as opening context; subsequent expansions reuse the session. Project page costs zero AI tokens; chat costs incurred only when user opts in.
- supersession: ADR 0005 keeps the same content (`/load-project` brief) but moves the brief build off the request path into a background indexer + cache. The "/load on first expand" mechanism is replaced by "read pre-built brief on every bootstrap." See ADR 0005 → DEC-chat-hydration-indexed-briefs.

## DEC-daily-ingest-modal-cached-readonly

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0001-aios-ui-architecture.md` §7
- status: locked (ADR 0001)
- scope: Daily-ingest UX
- decision: "Run daily ingest" button on Home with "Last triage: X ago" timestamp. Click opens modal: first click of day (or cache invalidate) shells out `claude --print "/daily-inbox-triage"`, streams output, renders ranked Markdown queue inline. Subsequent clicks show cached output with "Run again" button. Per-item actions are read-only deep-links to Gmail (`https://mail.google.com/mail/u/0/#inbox/<thread-id>`). No inline composer in v1.

## DEC-mrr-structured-field

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0002-mrr-data-model.md` §1
- status: locked (ADR 0002 — Accepted 2026-05-19)
- scope: MRR data model
- decision: Each Project with recurring revenue carries a structured `mrr_monthly` field (integer or decimal, USD/month). Projects without `mrr_monthly` contribute zero. Free-form `contract:` field preserved for human-readable context (billing platform, payment terms, notes); UI never parses it for revenue math.

## DEC-mrr-scope-paying-active-only

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0002-mrr-data-model.md` §2
- status: locked (ADR 0002)
- scope: MRR rollup filter
- decision: MRR rollup sums `mrr_monthly` across Projects matching BOTH `clients[*].bucket == "paying"` AND `projects[*].status == "active"`. Excluded: all Projects under `bucket: prospects` or `bucket: internal` (e.g., `bgd-hq`); Projects with `status: paused | done | archived` regardless of Client bucket. When a prospect signs, `bucket:` flips paying — single-switch.

## DEC-dealers-as-projects

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0002-mrr-data-model.md` §3
- status: locked (ADR 0002)
- scope: BrandOS dealer subscriptions
- decision: Each dealer subscription is its own Project entry in `clients.yaml`, not nested as sub-line under `terraplex-hub`. Uniform data model: every line of recurring revenue is a Project. Lets the UI sidebar / Client page surface each dealer as navigable entity (own contacts, docs_paths, eventual wiki). Rejected: nested `subscriptions:` array (kills drill-down); parallel `revenue.yaml` ledger (data structures drift). Open question (intentionally deferred): under which Client does each dealer live (terraplex vs. brandos-dealers vs. own Client) — resolved per-dealer at `/onboard-client` time.

## DEC-bidirectional-store-model

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0003-bidirectional-store-model.md`
- status: locked (ADR 0003 — Accepted 2026-05-21)
- scope: AIOS UI role across v2 hub phase
- decision: AIOS UI is the seam between operator inputs (Gmail, calendar, CLI sessions, wiki edits) and durable storage (project wikis, decisions log, memory). Two-way pipe. Inputs surfaced: Gmail thread triage rows per Project (filtered by contacts), project chat hydrates from pre-indexed brief plus live Gmail/calendar at bootstrap, wiki content renders as expandable UI sections. Outputs propagated: captures, chat-decision promotions, and chat session closes write to `raw/aios/` staging inbox; triage overrides persist as a state file the daily-ingest skill reads; every write emits a Receipt feed entry (timestamp, kind, project, absolute file path, excerpt). Rejected: consolidated view (read-only), unified workspace (too much build), session-to-session memory (a special case of bidirectional).

## DEC-staged-ingestion-via-raw-aios

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0004-staged-ingestion-via-raw-aios.md`
- status: locked (ADR 0004 — Accepted 2026-05-21)
- scope: AIOS UI write path into project wikis
- decision: AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`. Never into `wiki/decisions/`, `wiki/sources/`, `wiki/log.md`, or `wiki/index.md`. Three drop kinds: `capture-…md`, `chat-decision-…md`, `chat-session-…md`. Files in `raw/aios/` are immutable once written. Promotion to curated form is the `llm-wiki` ingest pass, invoked from UI's Pending Ingestion section. Rejected: direct-to-curated (would force AIOS to reimplement decision numbering / slug generation / templating / index+log maintenance — `llm-wiki`'s job; creates drift), gated promotion modal (friction, conflicts with auto-write+receipt trust model), manual-only (defeats bidirectional store).

## DEC-chat-hydration-indexed-briefs

- source: `/Users/justinlobaito/repos/claude-os/docs/adr/0005-chat-hydration-via-indexed-briefs.md`
- status: locked (ADR 0005 — Accepted 2026-05-21) — supersedes ADR 0001 §6 mechanism
- scope: Project chat hydration
- decision: Background indexer (`aios-ui/lib/indexer/build-brief.ts`) builds per-project Markdown brief at `aios-ui/.aios-cache/briefs/<slug>.md` by invoking `/load-project` subprocess and capturing stdout. `chokidar` watcher (`aios-ui/lib/indexer/watcher.ts`) observes `clients.yaml`, `references/`, `memory/`, each project's resolved `docs_paths`, and each project's `wiki/raw/aios/`; on change, affected brief rebuilds with 500ms debounce. Project chat reads cached brief on every session bootstrap. Dynamic data (Gmail, calendar) is NOT in static brief — fetched live at chat bootstrap. Chat surface shows "Brief loaded (built Nm ago)" + "Refresh context" button. Rejected: auto-load-on-first-open (5-15s tax), lazy-load tools (chat forgets), pinned context cards (UI/chat coupling). Cold start accepted: lazy first build per project + proactive watcher-driven rebuilds thereafter.
