# ADR 0001 — AIOS UI architecture

**Status:** Accepted
**Date:** 2026-05-19
**Decision-makers:** Justin Lobaito
**Process:** Resolved during a `/grill-with-docs` session walking down the design tree question-by-question.

## Context

Justin has been building claude-os — an AIOS that uses Claude Code skills, a `clients.yaml` registry, a filesystem of markdown (references, decisions log, memory), and per-project LLM-wikis in external repos. The stated top pain is "no real tracker" for juggling concurrent projects, plus chronic email-reply lag.

He wants a **web-based UI** that:

- Lists Clients as the primary surface, with Projects nested underneath
- Surfaces total MRR rolled up from `mrr_monthly` fields on active paying-bucket Projects
- Launches the existing Skills (`/onboard-client`, `/daily-inbox-triage`, `/level-up`, `/audit`, `/load-project`) from the UI
- Hosts a per-Project chat window with `/load-project` pre-loaded as context
- Has an Admin section for operator-level rituals and strategic work

The question was *how to build this in a way that doesn't require reimplementing the AIOS that already works*. Several major architectural forks were resolved together in one grilling session. This ADR captures them as a cluster.

## Decision

### 1. Deployment: local-only on Mac

The UI is a Next.js app run via `npm run dev`, bound to `localhost:3000`, reading and writing Justin's filesystem directly. No authentication, no deployment, no cloud sync. Only accessible while Justin is at his desk.

### 2. Relationship to existing CLI: additive viewer + skill launcher

The UI does NOT replace the terminal Claude Code surface. Both coexist. The UI's role is narrow:

- Render markdown beautifully (Client / Project pages, recent-activity feeds, MRR rollup)
- Launch Skills as buttons that shell out to the `claude` CLI as subprocesses
- Host Claude Code chat sessions embedded in the UI

The UI does not reimplement Skill logic, does not invent its own database, does not write to project files directly except through Skills (with one exception: the Capture box may write through `/gsd-capture`; the file watch loop closes the gap either way).

### 3. AI plumbing: long-running CLI subprocess for chat

The chat window spawns a long-running `claude` process per Project, manages sessions via `claude --resume <session-id>` for continuity, and streams `stdout` to the browser via Server-Sent Events. Session IDs persist in a `.aios-cache/` sidecar so chats survive UI restarts.

Alternatives rejected:

- **Claude Agent SDK** — would have been cleaner (typed message streams, native Next.js integration) but introduces a dependency on SDK stability and may have gaps relative to the CLI (plugins, MCP servers). Subprocess preserves maximum compatibility with Justin's installed Claude Code setup.
- **One-shot `claude --print` per message** — loses multi-step skill state. Breaks interactive skills like `/onboard-client`.
- **Embedded terminal emulator (xterm.js)** — defeats the visual goals (dashboards, MRR widget, drill-down nav).

### 4. Data model: in-memory index + chokidar file watcher + SSE invalidation

On server start, the Next.js process parses `clients.yaml`, `references/*.md`, `decisions/log.md`, `memory/project_*.md`, and any external LLM-wiki directories registered in `docs_paths:`. Results are held in an in-memory index (JavaScript objects).

A `chokidar` file watcher monitors all those paths with a 250ms debounce. On file change:
1. Re-parse the affected file(s)
2. Update the in-memory index
3. Push an SSE message to all connected browsers identifying the invalidated entity
4. Browser refetches the affected view

No SQLite, no persistent cache, no database. The filesystem is the source of truth; the index is derived and rebuilt on server restart.

### 5. Navigation: drill-down via cards

No always-visible global sidebar tree (Linear/Notion-style nav was considered; rejected for being too dense once Justin has 15+ Projects). Instead, three levels:

- **Home screen (`/`)** — no sidebar. Renders Client cards + an Admin card + MRR widget + daily-ingest button + cross-project Recent activity feed + Onboard-new-client button.
- **Client page (`/clients/{slug}`)** — sidebar shows Projects under this Client only. Page shows primary contacts, client-level MRR rollup, Project cards (with status, MRR, contract, last-activity, optional wiki indicator), Recent activity feed scoped to this Client. Breadcrumb: `Home > {Client}`.
- **Project page (`/clients/{slug}/projects/{project-slug}`)** — sidebar still shows this Client's Projects. Page shows the Minimal-plus composition: header (name, status, contract, MRR), compact contact list, Recent activity feed, Capture box, collapsed chat drawer. Breadcrumb: `Home > {Client} > {Project}`.

Plus a fourth top-level surface — Admin (`/admin`) — accessed via its own card on Home (see CONTEXT.md → Admin).

Persistent: breadcrumb in the page header. "Home" link always clickable.

### 6. Project chat invocation: tiered, auto-load on first drawer expand

The Project page renders its static composition immediately from the in-memory index (zero AI calls). The chat panel is a collapsed drawer at the bottom of the page.

The FIRST time the user expands the chat drawer in a session, the UI fires `claude --print "/load {slug}"` and injects the resulting Markdown brief as the opening context of the chat session. Subsequent expansions of the same drawer in the same session reuse the loaded session. After the load completes, the chat is a normal Claude Code session — the user types, Claude responds with full project context.

This means: a Project page costs zero AI tokens to render; chat costs are incurred only when the user opts in by expanding the drawer.

### 7. Daily-ingest UX: modal, cached, read-only

A "Run daily ingest" button on the Home screen, with a "Last triage: X ago" timestamp next to it. Clicking opens a modal that:

- On first click of the day (or any time after the cache invalidates): shells out `claude --print "/daily-inbox-triage"`, streams the output as it generates, then renders the final ranked Markdown queue inline.
- On subsequent clicks: shows the cached output with a "Run again" button.

Per-item actions in the queue are **read-only links to Gmail**. Each thread ID renders as a deep-link to `https://mail.google.com/mail/u/0/#inbox/<thread-id>`. All drafting happens in Gmail proper or in a separate chat session — no inline composer in v1.

## Consequences

### Positive

- **The UI is small.** Most logic is in Claude Code Skills that already exist. The UI's job is rendering + button-firing + chat hosting.
- **Zero cloud cost, zero auth complexity, zero deploy friction.** Ships immediately on `npm run dev`.
- **Skills evolve independently.** When Justin improves `/load-project` or `/daily-inbox-triage`, the UI inherits the improvement for free.
- **The CLI surface stays.** Terminal Claude Code remains the power-user tool. The UI is the daily-driver tracker. Both coexist.
- **The in-memory index makes everything fast.** Page renders are O(memory lookup), not O(filesystem read).
- **File watcher keeps the UI alive.** When a chat in one tab writes `clients.yaml`, every other open tab sees the change within ~100ms.

### Negative / accepted trade-offs

- **No mobile access.** Justin's iPhone can't reach the UI from outside his desk. Accepted — Gmail/Calendar apps cover the urgent mobile flows.
- **Every Skill invocation has 2-5s of subprocess latency.** Acceptable for interactive Skills (`/onboard-client`, daily-ingest); somewhat slow for what would otherwise be instant operations (a checkbox toggle, a quick capture). Mitigations: optimistic UI; some operations stay terminal-only.
- **Subprocess management is the highest-risk component.** Process lifecycle, stream pipes, session-ID cache, error handling — all real work. Phased in v2 of the build so a chat bug doesn't block the read-only tracker (v0-v1) from being useful.
- **In-memory index is lost on server restart.** Rebuilt in ~1-2 seconds for the current corpus. Acceptable.
- **No cross-project SQL queries.** If/when needed, graduate to SQLite-backed index. YAGNI today.
- **Drill-down nav requires more clicks than a global sidebar tree.** Accepted for scalability (the sidebar tree gets unusable at 15+ projects, which Justin will hit soon).

### Reversibility

| Decision | Cost to reverse |
|---|---|
| Local-only → cloud | High. Need auth, sync layer, cloud Claude bridge (since CLI subprocess won't work in serverless). |
| Additive viewer → full replacement | High. Would require reimplementing every Skill as a web flow. |
| CLI subprocess → Agent SDK | Medium. Subprocess management code is ~300 lines; SDK migration is mostly mechanical. |
| In-memory index → SQLite | Low. Index is derived from filesystem; rebuilding into SQLite is straightforward. |
| Drill-down nav → sidebar tree | Low. UI restructure; data model unchanged. |

The high-cost decisions (local-only, additive) are the ones with the clearest sustained payoff. The lower-cost decisions are explicit "premature otherwise" choices.

## Build phasing (informational, not part of the architecture lock)

Per Justin's confirmation in the grilling session, the build proceeds in 4 slices:

- **v0** — Read-only nav (Home + Client + Project pages), MRR widget. ~1 Claude Code session.
- **v1** — File watcher + SSE invalidation + daily-ingest modal. ~1 session.
- **v2** — Chat panel + CLI subprocess + SSE streaming + auto-load on drawer expand. ~1-2 sessions.
- **v3** — Capture boxes (Project + Home) + Admin surface (operator chat, skill buttons, internal projects, `references/research/`). ~1 session.

The phasing exists for de-risking, not human capacity. Total: ~5-10 hours of Claude Code time across the 4 slices.

## Cross-references

- [CONTEXT.md](../../CONTEXT.md) — canonical glossary (Client, Project, Bucket, MRR, Skill, LLM-wiki, AIOS UI, Capture, Admin, Operator chat, Recent activity)
- [ADR 0002 — MRR data model](0002-mrr-data-model.md)
- The grilling session that produced this ADR is captured in conversation context (2026-05-19, `/grill-with-docs` skill).
