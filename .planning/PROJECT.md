# claude-os

## What This Is

Justin Lobaito's personal AI Operating System (AIOS) — a local-only single-operator workspace that combines a Next.js UI (`aios-ui/`), a filesystem-source-of-truth data model (`clients.yaml`, `references/`, `memory/`, `decisions/`, per-client wikis), Claude Code skills (`/onboard`, `/audit`, `/level-up`, `/daily-inbox-triage`, `/weekly-project-status`, `/load-project`, `/capture`), and an append-only decisions log. The repo is Justin's thought partner for productizing Bearded Ginger Designs (BGD) while shipping enterprise Craft work at 2RM.

## Core Value

The UI must render Justin's current operating reality — who he's working with, what's billing, what just changed, what needs attention — and let him push captures and run rituals from the same page he's looking at, without ever leaving his desk or losing continuity across sessions.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Read-only nav (Home + Client + Project pages) with MRR widget — shipped in AIOS UI v0
- ✓ Filesystem watcher + SSE invalidation + daily-ingest modal — shipped in AIOS UI v1
- ✓ Capture boxes on project pages + Admin ritual launcher (`level-up`, `weekly-status`, `audit`) — shipped in AIOS UI v3
- ✓ MRR data model (`mrr_monthly` field; `paying` + `active` filter; dealers-as-Projects) — shipped per ADR 0002

### Active

<!-- Current scope. Building toward these. -->

- [ ] **AIOS UI v2 — Bidirectional Hub**: chat panel with CLI subprocess + SSE streaming, pre-built indexed brief hydration, staged ingestion via `raw/aios/`, Receipt feed, Pending Ingestion surface (per ADRs 0003, 0004, 0005 — plan to be imported from `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md`)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Multi-user / auth / cloud deploy — locked to local-only single-operator per ADR 0001 §1
- Database / SQLite / persistent in-memory cache — filesystem is source of truth per ADR 0001 §4
- AIOS writing directly to curated wiki paths (`wiki/decisions/`, `wiki/sources/`, `wiki/log.md`, `wiki/index.md`) — promotion is `llm-wiki`'s job per ADR 0004
- UI reimplementing skill logic — UI shells out to `claude` CLI as subprocess per ADR 0001 §2
- Embedded terminal emulator inside the UI — defeats the visual rendering goal per ADR 0001 §3
- Global / client-level capture surface, Cmd+K palette, capture preview-then-confirm, recent-captures history — deferred to v3.1+ per v3 SPEC non-goals
- Multi-tab ritual locking, abort/cancel mid-stream, rich markdown for ritual output, real-time tile badge updates — deferred to v3.1+ per v3 SPEC non-goals
- Refactor of `DailyIngestModal` + `RitualModal` into shared base — deferred to v3.1+
- Inline composer in daily-ingest modal — deep-link to Gmail only per ADR 0001 §7
- Nested `subscriptions:` arrays on Projects, parallel `revenue.yaml` ledger — rejected in ADR 0002 §3 (would kill drill-down nav + cause data drift)

## Context

**Operator profile.** Single user (Justin), local-only, no auth, no multi-tenant. Runs from `npm run dev` at `localhost:3000`. Only accessible when Justin is at his desk. The full operator brief lives in `/Users/justinlobaito/repos/claude-os/CLAUDE.md` (BGD productization push, 2RM W-2 cushion, BrandOS hub-and-spoke play, ~$4,600/mo BGD MRR baseline).

**Repo layout.**
- `aios-ui/` — Next.js 16 + React 19 + Tailwind 4 + shadcn/ui v4 + TypeScript app
- `clients.yaml` — canonical client + project registry (drives MRR rollups, sidebar nav, chat brief hydration)
- `references/` — frameworks, voice samples, per-project references
- `memory/project_*.md`, `memory/user_*.md`, `memory/feedback_*.md` — auto-memory entries
- `decisions/log.md` — append-only decisions
- `docs/adr/` — five LOCKED architecture decision records (0001–0005)
- `docs/superpowers/specs/` and `docs/superpowers/plans/` — design specs + implementation plans
- `.aios-cache/` — sidecar for session IDs, triage cache, ritual cache, per-project briefs
- Per-client wikis at `wiki_path:` (e.g., `~/llm-wikis/{client-slug}/`) with `raw/aios/` staging inbox

**Tech stack (per ADR 0001 + v3 plan).** Next.js 16 (App Router, RSC + client components), React 19, Tailwind 4, shadcn/ui v4 (Card / Button / Dialog), Lucide icons, Vitest for testing, `child_process.spawn` for skill invocation, `fs/promises` for filesystem reads, `chokidar` for file watching (250ms debounce for index; 500ms for brief rebuilds).

**Build phasing history (per ADR 0001 + ADRs 0003-0005).**
- v0: read-only nav + MRR widget — SHIPPED
- v1: file watcher + SSE + daily-ingest modal — SHIPPED
- v3: capture boxes + Admin ritual launcher — SHIPPED (out-of-order from original ADR 0001 phasing because v2 chat surfaced foundational gaps that motivated ADRs 0003/0004/0005)
- v2 (NEXT): bidirectional hub — chat panel with pre-built brief hydration, staged ingestion to `raw/aios/`, Receipt feed, Pending Ingestion section

**Why v2 was deferred behind v3.** v1 felt "very read-only" once shipped — filling info in but no visibility into what was happening; opening a Project page tomorrow didn't surface what got captured today. The v1 chat endpoint errored with `"no active session — call /load first"` because the auto-load-on-first-expand wiring from ADR 0001 §6 never landed. Justin pivoted to write the bidirectional-store ADRs (0003/0004/0005) before resuming the chat build, and shipped v3 (capture + rituals) in the interim because those were lower-risk and unblocked daily operator pain.

**Test surface.** v3 SPEC targets ~69 Vitest tests after v3 (57 v2 baseline + 12 new). Fake `claude` fixtures live in `aios-ui/tests/fixtures/`.

## Constraints

- **Tech stack**: Next.js 16 / React 19 / Tailwind 4 / shadcn/ui v4 / TypeScript / Vitest — locked per ADR 0001 + v3 implementation plan
- **Deployment**: Local-only, `npm run dev`, bound to `localhost:3000`, no cloud sync, no auth — per ADR 0001 §1
- **Data store**: Filesystem source of truth, in-memory index rebuilt at server start, no SQLite/no database/no persistent cache for index data — per ADR 0001 §4
- **AI plumbing**: All AI calls shell out to `claude` CLI subprocess (`child_process.spawn`); SSE streams stdout to browser; session IDs persist in `.aios-cache/` sidecar — per ADR 0001 §3
- **Write path**: AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` (kinds: `capture`, `chat-decision`, `chat-session`); never into curated wiki paths — per ADR 0004
- **Brief hydration**: Chat reads pre-built brief from `aios-ui/.aios-cache/briefs/<slug>.md`; background indexer + chokidar watcher rebuild on `clients.yaml`/`references/`/`memory/`/per-project `docs_paths`/`wiki/raw/aios/` changes with 500ms debounce — per ADR 0005
- **MRR scope**: Rollups sum `mrr_monthly` only where `clients[*].bucket == "paying"` AND `projects[*].status == "active"`; everything else excluded — per ADR 0002 §2
- **Subprocess timeouts**: Capture 90s; rituals 5 min; on timeout, cache NOT written, textarea/modal state retained — per v3 SPEC error handling
- **Skill ownership**: UI does not reimplement skill logic; the one acknowledged write-through-skill is `/capture` invoked from the Capture box — per ADR 0001 §2
- **Concurrency**: Two-tabs-same-ritual race accepted — second-to-finish wins cache write; no locking in v3 — per v3 SPEC

## Key Decisions

<!-- All 13 decisions below are LOCKED via ADRs 0001-0005 (Status: Accepted, precedence: 0). -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **DEC-aios-ui-local-only** (ADR 0001 §1): Next.js app run via `npm run dev`, bound to `localhost:3000`, reads/writes Justin's filesystem directly. No auth, no deployment, no cloud sync. | Single-operator workspace; no audience but Justin; cloud surface would add auth/deploy/sync cost for zero value. | ✓ Good (locked) |
| **DEC-aios-ui-additive-not-replacement** (ADR 0001 §2): UI does NOT replace terminal Claude Code. Both coexist. UI renders markdown, launches Skills as buttons that shell out to `claude` CLI, hosts embedded chat. UI doesn't reimplement Skill logic or invent its own DB. | Skills are the source of truth for behavior; duplicating logic in the UI would cause drift. One acknowledged exception: Capture box writes through `/gsd-capture`. | ✓ Good (locked) |
| **DEC-chat-via-cli-subprocess** (ADR 0001 §3): Chat window spawns long-running `claude` process per Project, manages sessions via `claude --resume <session-id>`, streams stdout via SSE. Session IDs persist in `.aios-cache/` sidecar. | Rejected Claude Agent SDK (stability + plugin gaps), one-shot `claude --print` per message (loses skill state), embedded terminal (defeats visual goals). | ✓ Good (locked) |
| **DEC-in-memory-index-with-chokidar** (ADR 0001 §4): Parse `clients.yaml`, `references/*.md`, `decisions/log.md`, `memory/project_*.md`, registered `docs_paths:` directories at server start. Hold in-memory JS objects. `chokidar` watcher (250ms debounce) re-parses on change + pushes SSE invalidation. No SQLite, no persistent cache. | Filesystem is already source of truth; a DB would create a second copy that can drift. Index rebuild cost is trivial at single-operator scale. | ✓ Good (locked) |
| **DEC-drill-down-nav** (ADR 0001 §5): Three levels — Home (no sidebar; Client cards + Admin + MRR + daily-ingest + Recent activity + Onboard-new-client) / Client page (`/clients/{slug}`, sidebar of Projects under this Client only) / Project page (`/clients/{slug}/projects/{project-slug}`, same sidebar, header + contacts + Recent activity + Capture box + chat drawer). Plus Admin (`/admin`). Persistent breadcrumb. | A global tree sidebar bloats the chrome for a dataset of ~20 clients; drill-down matches how Justin actually moves between contexts. | ✓ Good (locked) |
| **DEC-project-chat-auto-load-on-first-expand** (ADR 0001 §6 — mechanism SUPERSEDED by ADR 0005, intent preserved): Project page renders statically (zero AI calls); chat costs incurred only when user expands the drawer. | Zero-token page loads; tokens only when operator opts in. Mechanism for how the brief gets built moved to background indexer per ADR 0005. | ✓ Good (locked, mechanism superseded) |
| **DEC-daily-ingest-modal-cached-readonly** (ADR 0001 §7): "Run daily ingest" button on Home; modal shells out `claude --print "/daily-inbox-triage"`, streams ranked Markdown queue; subsequent clicks show cached output with "Run again". Per-item actions are read-only Gmail deep-links. No inline composer in v1. | Inline composer would force the UI to handle Gmail auth + draft sync — out of scope for v1. Deep-link keeps the UI clean and Justin's existing Gmail workflow intact. | ✓ Good (locked) |
| **DEC-mrr-structured-field** (ADR 0002 §1): Each Project with recurring revenue carries a structured `mrr_monthly` field (integer/decimal, USD/month). Free-form `contract:` field preserved for human notes; UI never parses it for revenue math. | Free-form contract strings ("$X/mo for Y months") drift in format and aren't parseable; a structured field is the only path to reliable rollups. | ✓ Good (locked) |
| **DEC-mrr-scope-paying-active-only** (ADR 0002 §2): MRR rollup sums `mrr_monthly` where `clients[*].bucket == "paying"` AND `projects[*].status == "active"`. Prospects, internal (e.g., `bgd-hq`), and paused/done/archived all excluded. Prospect → paying is a single `bucket:` flip. | Rollups must reflect "what's actually billing right now," not pipeline or historical. Single-switch design avoids field duplication when a prospect signs. | ✓ Good (locked) |
| **DEC-dealers-as-projects** (ADR 0002 §3): Each BrandOS dealer subscription is its own Project in `clients.yaml`, not a nested sub-line under `terraplex-hub`. Uniform data model: every line of recurring revenue is a Project. | Lets the UI sidebar surface each dealer as a navigable entity with its own contacts + docs_paths + wiki. Rejected nested `subscriptions:` array (kills drill-down) and parallel `revenue.yaml` (drift). Per-dealer Client placement resolved at `/onboard-client` time. | ✓ Good (locked) |
| **DEC-bidirectional-store-model** (ADR 0003): AIOS UI is the seam between operator inputs (Gmail, calendar, CLI sessions, wiki edits) and durable storage (project wikis, decisions log, memory). Two-way pipe: inputs surfaced as triage/brief/wiki sections; outputs propagated via `raw/aios/` writes + Receipt feed entries (timestamp, kind, project, absolute file path, excerpt). | v1 felt read-only; continuity broke across sessions. Rejected consolidated read-only view, full unified workspace, and session-to-session memory in isolation. Bidirectional store is the unifying frame. | ✓ Good (locked) |
| **DEC-staged-ingestion-via-raw-aios** (ADR 0004): AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`. Three kinds: `capture-…md`, `chat-decision-…md`, `chat-session-…md`. Files immutable once written. Promotion to curated wiki is `llm-wiki`'s ingest pass, invoked from UI's Pending Ingestion section. | Direct-to-curated would force AIOS to reimplement decision numbering, slug generation, ADR templating, and index/log maintenance per wiki — duplicating `llm-wiki` and creating drift. Same pattern as how PDFs + meeting notes already land in `raw/`. | ✓ Good (locked) |
| **DEC-chat-hydration-indexed-briefs** (ADR 0005, supersedes ADR 0001 §6 mechanism): Background indexer (`aios-ui/lib/indexer/build-brief.ts`) builds per-project Markdown brief at `aios-ui/.aios-cache/briefs/<slug>.md` by invoking `/load-project` and capturing stdout. `chokidar` watcher rebuilds on changes (500ms debounce) to `clients.yaml`, `references/`, `memory/`, per-project `docs_paths`, and per-project `wiki/raw/aios/`. Chat reads cached brief on every bootstrap. Dynamic data (Gmail, calendar) fetched live at bootstrap, not in static brief. | Auto-load-on-first-open had 5-15s tax. Lazy-load tools forgot context. Pinned context cards coupled UI to chat lifecycle. Pre-built brief is fast, durable, and decoupled. Cold start (first build per project) accepted as one-time tax. | ✓ Good (locked) |

---
*Last updated: 2026-05-21 after gsd-new-project ingest of 5 LOCKED ADRs + v3 SPEC + v3 implementation plan.*
