# Requirements: claude-os

**Defined:** 2026-05-21
**Core Value:** The UI must render Justin's current operating reality and let him push captures + run rituals from the same page he's looking at, without losing continuity across sessions.

> **Note on provenance.** No PRDs were ingested for this project. The requirements below are **DERIVED** from operator-intent context (ADR Context/Consequences sections + the v3 SPEC operator-pain narrative + the LOCKED ADR decisions themselves). They are not LOCKED in the same sense as the ADR decisions — they represent the operator-facing capabilities that the locked decisions exist to support. Treat them as soft acceptance criteria. If a derived requirement conflicts with a LOCKED ADR, the ADR wins.

---

## v1 Requirements

Requirements for the AIOS UI v0+v1+v3 + bidirectional v2 surface area. Each maps to one roadmap phase.

### Read-only Navigation & MRR (NAV) — DERIVED, SHIPPED

- [x] **NAV-01** (DERIVED): Justin can open `localhost:3000` and see a Home page with Client cards, Admin card, MRR widget, daily-ingest button with "Last triage: X ago" timestamp, Recent activity, and "Onboard new client" button — no sidebar
- [x] **NAV-02** (DERIVED): Justin can click a Client card and land on `/clients/{slug}` with a sidebar of Projects under that Client only, primary contacts, client-level MRR rollup, Project cards, and scoped Recent activity
- [x] **NAV-03** (DERIVED): Justin can click a Project card and land on `/clients/{slug}/projects/{project-slug}` with the same sidebar, header + compact contacts + Recent activity, and a persistent breadcrumb `Home > {Client} > {Project}`
- [x] **NAV-04** (DERIVED): The Home MRR widget displays a single number summing `mrr_monthly` across all Projects matching `clients[*].bucket == "paying"` AND `projects[*].status == "active"`
- [x] **NAV-05** (DERIVED): Each Client page displays a client-level MRR rollup using the same filter rule applied to that Client's Projects

### Live Filesystem Sync & Daily Triage (SYNC) — DERIVED, SHIPPED

- [x] **SYNC-01** (DERIVED): When Justin edits `clients.yaml`, `references/*.md`, `decisions/log.md`, or `memory/project_*.md` in his editor, the relevant page in the UI reflects the change without a manual reload (chokidar watcher + SSE invalidation, 250ms debounce)
- [x] **SYNC-02** (DERIVED): Justin can click "Run daily ingest" on Home; first click of the day opens a modal, shells out to `/daily-inbox-triage`, streams the ranked output, and renders it inline
- [x] **SYNC-03** (DERIVED): Subsequent same-day clicks of the daily-ingest button show the cached ranked queue with a "Run again" button; no re-spawn unless requested
- [x] **SYNC-04** (DERIVED): Each per-item action in the triage queue is a read-only Gmail deep-link (`https://mail.google.com/mail/u/0/#inbox/<thread-id>`); no inline composer

### Operator Capture & Ritual Launchers (OPS) — DERIVED, SHIPPED

- [x] **OPS-01** (DERIVED): Every Project page renders a Capture box (textarea) with ⌘↵ to submit, Escape to clear, and an `aria-live` status line that reports success/failure of the `/capture` skill invocation
- [x] **OPS-02** (DERIVED): The Capture box POSTs to `/api/capture/[client]/[project]`, which spawns `claude --print --output-format stream-json --verbose "/capture <text>"` with a 90s timeout and streams output via SSE
- [x] **OPS-03** (DERIVED): The Admin page renders a grid of Ritual tiles (`level-up`, `weekly-status`, `audit`) each showing "Last ran Xd ago" from cache and a clickable "run →" affordance; a fourth `business-plans` tile is a non-clickable v3.1 placeholder
- [x] **OPS-04** (DERIVED): Clicking a ritual tile opens a `RitualModal`, POSTs to `/api/admin/[ritual]`, spawns the matching skill with a 5-min timeout, streams output live, and on success writes a `RitualCacheEntry` to `.aios-cache/rituals/<slug>.json`
- [x] **OPS-05** (DERIVED): On ritual subprocess failure or timeout, the modal shows the streamed output up to failure, displays an error footer, does NOT write cache, and offers a Re-run

### MRR Data Model (DATA) — DERIVED, SHIPPED

- [x] **DATA-01** (DERIVED): Every Project with recurring revenue carries a structured `mrr_monthly:` field in `clients.yaml` (integer or decimal USD/month); Projects without it contribute zero
- [x] **DATA-02** (DERIVED): The legacy free-form `contract:` field is preserved on each Project for human-readable context (billing platform, payment terms, notes) but is never parsed for revenue math
- [x] **DATA-03** (DERIVED): Each BrandOS dealer subscription appears as its own Project entry in `clients.yaml` (not nested under `terraplex-hub`), so it surfaces independently in the sidebar with its own contacts and `docs_paths`
- [x] **DATA-04** (DERIVED): When a prospect signs, flipping `clients[*].bucket` from `prospects` to `paying` is the single action required for that Client's Projects to roll into MRR

### Bidirectional Hub & Chat (HUB) — DERIVED, ACTIVE (v2)

- [ ] **HUB-01** (DERIVED): Each Project page has a collapsed chat drawer at the bottom; expanding it opens a chat surface that hydrates from the pre-built brief at `aios-ui/.aios-cache/briefs/<slug>.md` and shows "Brief loaded (built Nm ago)" plus a "Refresh context" button
- [ ] **HUB-02** (DERIVED): A background indexer (`aios-ui/lib/indexer/build-brief.ts`) builds the per-project brief by invoking `/load-project` and capturing stdout; a `chokidar` watcher rebuilds affected briefs on changes to `clients.yaml`, `references/`, `memory/`, the project's resolved `docs_paths`, or the project's `wiki/raw/aios/` (500ms debounce)
- [ ] **HUB-03** (DERIVED): The chat backend spawns a long-running `claude` subprocess per Project, manages session continuity via `claude --resume <session-id>`, persists session IDs in `.aios-cache/sessions.json`, and streams stdout to the browser via SSE
- [ ] **HUB-04** (DERIVED): Dynamic data (Gmail thread triage rows scoped to the Project's contacts, calendar events) is fetched live at chat bootstrap and surfaced inside the chat panel — not embedded in the static brief
- [ ] **HUB-05** (DERIVED): Captures, chat-decision promotions, and chat-session closes write to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` (kinds: `capture`, `chat-decision`, `chat-session`); files are immutable once written; AIOS never writes to curated wiki paths
- [ ] **HUB-06** (DERIVED): Every write emits a Receipt feed entry (timestamp, kind, project, absolute file path, excerpt) visible to the operator on Home and on the relevant Project page
- [ ] **HUB-07** (DERIVED): A Pending Ingestion section on the relevant page lists `raw/aios/` drops awaiting promotion and surfaces the `llm-wiki` ingest pass as a one-click invocation
- [ ] **HUB-08** (DERIVED): Wiki content for a Project (resolved via `wiki_path:` + `docs_paths:`) renders as expandable sections on the Project page

## v2 Requirements

Acknowledged but deferred to v3.1+ per v3 SPEC non-goals (despite the confusing version overlap — these are "post-current-roadmap" items).

### Capture Surface Expansion (CAPX)

- **CAPX-01**: Global capture surface accessible from Home
- **CAPX-02**: Client-level capture surface on Client pages
- **CAPX-03**: Cmd+K capture palette (keyboard-driven capture without leaving page)
- **CAPX-04**: Capture preview-then-confirm step (multi-turn capture with operator review before write)
- **CAPX-05**: Recent captures history surface (operator can see what they've captured this week)

### Ritual UX Polish (RITX)

- **RITX-01**: Refactor `DailyIngestModal` + `RitualModal` into shared base component
- **RITX-02**: Multi-tab locking for ritual concurrency (prevent two tabs from racing the same ritual)
- **RITX-03**: Abort / cancel mid-stream for long-running rituals
- **RITX-04**: Rich markdown rendering for ritual output (replace plain mono pre-wrap)
- **RITX-05**: Real-time tile badge update when a ritual finishes in another tab (currently requires page reload)

### Admin Tile Content (ADMC)

- **ADMC-01**: `business-plans` tile content + workflow (placeholder in v3)
- **ADMC-02**: `references/research/` browsing surface in Admin

### BrandOS Dealer Onboarding Migration (BRDO)

- **BRDO-01**: Backfill `mrr_monthly:` on existing Projects with revenue (Inside Out, ToneQuest, IowaEverywhere, Partners For Sight, future Wild Rose / Thermal Kitchen if on retainer)
- **BRDO-02**: Run `/onboard-client` for each of the 5 BrandOS dealers Justin listed; resolve "under terraplex Client vs. own Client" question per dealer
- **BRDO-03**: Rename `terraplex-hub` Project to `terraplex-distributor` once dealer migration work is no longer happening inside it

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-user / auth / cloud deploy | Locked to local-only single-operator per ADR 0001 §1 |
| SQLite / database / persistent in-memory cache for the index | Filesystem is source of truth per ADR 0001 §4 |
| Direct writes to curated wiki paths | Promotion is `llm-wiki`'s job per ADR 0004 |
| UI reimplementing skill logic | UI shells out to `claude` CLI subprocess per ADR 0001 §2 |
| Embedded terminal emulator in the UI | Defeats visual rendering goal per ADR 0001 §3 |
| Nested `subscriptions:` arrays on Projects | Kills drill-down nav per ADR 0002 §3 |
| Parallel `revenue.yaml` ledger | Causes data drift per ADR 0002 §3 |
| Inline composer in daily-ingest modal | Out of v1 scope per ADR 0001 §7 |
| Component tests in v3 (only unit + API smoke + e2e) | Matches v2 omission per v3 SPEC testing section |

## Traceability

Which phases cover which requirements. v0/v1/v3 phases are historical (COMPLETE); v2 is the next active phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 1 (v0) | Complete |
| NAV-02 | Phase 1 (v0) | Complete |
| NAV-03 | Phase 1 (v0) | Complete |
| NAV-04 | Phase 1 (v0) | Complete |
| NAV-05 | Phase 1 (v0) | Complete |
| DATA-01 | Phase 1 (v0) | Complete |
| DATA-02 | Phase 1 (v0) | Complete |
| DATA-03 | Phase 1 (v0) | Complete |
| DATA-04 | Phase 1 (v0) | Complete |
| SYNC-01 | Phase 2 (v1) | Complete |
| SYNC-02 | Phase 2 (v1) | Complete |
| SYNC-03 | Phase 2 (v1) | Complete |
| SYNC-04 | Phase 2 (v1) | Complete |
| OPS-01 | Phase 3 (v3) | Complete |
| OPS-02 | Phase 3 (v3) | Complete |
| OPS-03 | Phase 3 (v3) | Complete |
| OPS-04 | Phase 3 (v3) | Complete |
| OPS-05 | Phase 3 (v3) | Complete |
| HUB-01 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-02 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-03 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-04 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-05 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-06 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-07 | Phase 4 (v2 Bidirectional Hub) | Pending |
| HUB-08 | Phase 4 (v2 Bidirectional Hub) | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-21*
*Last updated: 2026-05-21 after initial gsd-new-project ingest. All requirements DERIVED from operator-intent context, not from PRDs.*
