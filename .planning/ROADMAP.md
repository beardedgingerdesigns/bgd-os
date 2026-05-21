# Roadmap: claude-os

## Overview

The AIOS UI is being built in slices that correspond to the operator-experience layers: first the static read-only render (v0), then live filesystem sync + the first ritual surface (v1), then operator capture + the full ritual launcher grid (v3, shipped out-of-order from the original ADR 0001 phasing), and finally the bidirectional hub — chat with pre-built brief hydration, staged ingestion to `raw/aios/`, the Receipt feed, and the Pending Ingestion surface (v2, next). Each slice was ~1–2 Claude Code sessions per ADR 0001's build-phasing estimate. The repo-level scope also includes the surrounding skills, `clients.yaml`, memory, decisions log, and references that the UI renders against — those are maintained continuously, not phased.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (none yet)

- [x] **Phase 1: AIOS UI v0 — Read-only Nav & MRR** — Home / Client / Project pages render from filesystem; MRR widget computes against the locked data model
- [x] **Phase 2: AIOS UI v1 — Live Sync & Daily Triage** — chokidar watcher + SSE invalidation + daily-ingest modal with cached read-only Gmail deep-links
- [x] **Phase 3: AIOS UI v3 — Capture & Rituals** — CaptureBox on every Project page + Admin ritual launcher (`level-up`, `weekly-status`, `audit`) with cached "last ran" state
- [ ] **Phase 4: AIOS UI v2 — Bidirectional Hub** — chat panel with pre-built brief hydration, staged ingestion to `raw/aios/`, Receipt feed, Pending Ingestion surface (plan to be imported)

## Phase Details

### Phase 1: AIOS UI v0 — Read-only Nav & MRR
**Goal**: Justin can open `localhost:3000` and see his current operating reality (clients, projects, MRR) rendered live from the filesystem with drill-down navigation.
**Depends on**: Nothing (first phase)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Justin can open `localhost:3000`, see the Home page with Client cards + Admin card + MRR widget + daily-ingest button + Recent activity + "Onboard new client" button, with no sidebar
  2. Justin can click any Client card and land on `/clients/{slug}` with the Project sidebar scoped to that Client, client-level MRR rollup, contacts, and Project cards
  3. Justin can click any Project card and land on `/clients/{slug}/projects/{project-slug}` with the same sidebar, project header, contacts, and a persistent breadcrumb `Home > {Client} > {Project}`
  4. The Home MRR widget displays a single USD/month total summing `mrr_monthly` only across Projects matching `bucket == "paying"` AND `status == "active"`
  5. Each BrandOS dealer subscription appears as its own navigable Project in the sidebar (not nested under terraplex-hub)
**Plans**: COMPLETE (shipped pre-`.planning/` setup; historical reference)
**UI hint**: yes

### Phase 2: AIOS UI v1 — Live Sync & Daily Triage
**Goal**: The UI stays in lockstep with Justin's filesystem edits and gives him a one-click daily inbox triage with cached output and Gmail deep-links.
**Depends on**: Phase 1
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria** (what must be TRUE):
  1. When Justin edits `clients.yaml`, `references/*.md`, `decisions/log.md`, or a `memory/project_*.md` file, the affected page in the UI reflects the change without a manual reload (chokidar 250ms debounce + SSE invalidation)
  2. Justin can click "Run daily ingest" on Home and a modal streams the ranked output of `/daily-inbox-triage` live
  3. Subsequent same-day clicks of the daily-ingest button show the cached ranked queue with a "Run again" button (no re-spawn unless requested)
  4. Each per-item action in the ranked queue is a clickable read-only Gmail deep-link of the form `https://mail.google.com/mail/u/0/#inbox/<thread-id>`
**Plans**: COMPLETE (shipped pre-`.planning/` setup; historical reference)
**UI hint**: yes

### Phase 3: AIOS UI v3 — Capture & Rituals
**Goal**: Justin can capture text from the Project page he's already looking at and can launch / inspect the weekly + monthly rituals from an Admin grid with cached "last ran" state.
**Depends on**: Phase 2
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05
**Success Criteria** (what must be TRUE):
  1. Every Project page renders a CaptureBox; Justin can type text, hit ⌘↵ to submit, and the `aria-live` status line reports success or failure of the `/capture` skill invocation within 90s
  2. The Admin page renders the ritual grid (`level-up`, `weekly-status`, `audit` + non-clickable `business-plans` placeholder); each tile shows "Last ran Xd ago" from cache and a clickable "run →"
  3. Clicking a ritual tile opens a modal, streams the spawned skill's output live, and on success writes a `RitualCacheEntry` to `.aios-cache/rituals/<slug>.json`
  4. On ritual subprocess failure or 5-min timeout, the modal shows streamed output to the point of failure, displays an error footer, does NOT write cache, and offers a Re-run
  5. Vitest suite passes the v3 target (~69 tests = 57 v2 baseline + 12 new = 3 capture + 4 cache + 5 ritual)
**Plans**: COMPLETE (shipped pre-`.planning/` setup; historical reference)
**UI hint**: yes

### Phase 4: AIOS UI v2 — Bidirectional Hub
**Goal**: Justin opens a Project page tomorrow and sees what he captured/decided today; the chat panel hydrates instantly from a pre-built brief; every AIOS write lands in `raw/aios/` staging with a Receipt feed entry; the Pending Ingestion section lets him promote drops to curated wiki form with one click.
**Depends on**: Phase 3
**Requirements**: HUB-01, HUB-02, HUB-03, HUB-04, HUB-05, HUB-06, HUB-07, HUB-08, HUB-09
**Success Criteria** (what must be TRUE):
  1. Justin opens any Project page, expands the chat drawer, and the chat surface hydrates from `aios-ui/.aios-cache/briefs/<slug>.md` in under 1 second, showing "Brief loaded (built Nm ago)" and a "Refresh context" button
  2. When Justin edits `clients.yaml`, a `references/*.md` file, a `memory/project_*.md`, a file under a project's resolved `docs_paths`, or a file under the project's `wiki/raw/aios/`, the affected brief rebuilds in the background within ~1s (500ms debounce + `/load-project` subprocess)
  3. Chat is responsive to multi-turn conversation — session continuity persists across page reloads via `claude --resume <session-id>` with session IDs stored in `.aios-cache/sessions.json`
  4. Gmail thread triage rows scoped to the Project's contacts and relevant calendar events appear inside the chat panel at bootstrap (fetched live, not in the static brief)
  5. Every capture, chat-decision promotion, and chat-session close writes a single immutable file at `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` and emits a Receipt feed entry visible on Home and on the relevant Project page
  6. The Pending Ingestion section lists `raw/aios/` drops awaiting promotion and exposes a one-click invocation of the `llm-wiki` ingest pass
  7. Project page wiki sections render content resolved from `wiki_path:` + `docs_paths:` as expandable UI sections
**Plans**: 9 plans
- [ ] 04-01-PLAN.md — Receipt feed scaffold + raw-drops helper (Wave 1)
- [ ] 04-02-PLAN.md — wiki.ts extensions: readWikiDecisions + readPendingIngest (Wave 1)
- [ ] 04-03-PLAN.md — Wiki display layer on Project page (Wave 2)
- [ ] 04-04-PLAN.md — Triage override skill + per-row actions + Communications section (Wave 2)
- [ ] 04-05-PLAN.md — Capture wiki-aware routing + receipt emission (Wave 2)
- [ ] 04-06-PLAN.md — Brief indexer + chokidar watcher + instrumentation bootstrap (Wave 2)
- [ ] 04-07-PLAN.md — Chat hydration bootstrap: cached brief + live Gmail/calendar + Refresh button (Wave 3)
- [ ] 04-08-PLAN.md — Chat write-back: Drop to raw + session-close transcript drop (Wave 3)
- [ ] 04-09-PLAN.md — Pending Ingestion surface + /ingest-aios-drops wrapper skill + per-project receipts slice (Wave 4)
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. AIOS UI v0 — Read-only Nav & MRR | n/a | Complete | Pre-2026-05-21 (historical) |
| 2. AIOS UI v1 — Live Sync & Daily Triage | n/a | Complete | Pre-2026-05-21 (historical) |
| 3. AIOS UI v3 — Capture & Rituals | n/a | Complete | 2026-05-19 (per v3 implementation plan + recent commits) |
| 4. AIOS UI v2 — Bidirectional Hub | 0/9 | Not started | - |
