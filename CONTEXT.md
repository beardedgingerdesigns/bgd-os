# CONTEXT.md — claude-os glossary

Canonical definitions for the terms used across the claude-os AIOS — `clients.yaml`, the skills, the decisions log, and the AIOS UI (in design as of 2026-05-19). This is a **glossary**, not a spec — it defines language, not implementation.

When the same term appears in code, docs, memory, or chat, this page is the authority. When two pages disagree, fix the wrong one.

---

## AIOS

The intelligence layer that powers Justin's personal operating system. AIOS is not an interface — it is the understanding, routing, and strategic context that lives in the `claude-os` repo: memory, decisions, `clients.yaml`, skills, routines, and the cross-cutting business knowledge that no single project wiki holds.

AIOS has two jobs:

1. **Strategic business partner.** Cross-cutting intelligence for BGD direction, pricing, positioning, client relationships, and business decisions. Five modes:
   - **Reactive counsel** — operator brings a question ("should I take this deal?"), AIOS answers with full business context.
   - **Proactive surfacing** — AIOS notices cross-project patterns and raises them unprompted ("three clients asked about marketing materials this month").
   - **Planning partner** — longer sessions: grill-me, ask-the-board deliberations, pricing stress-tests, pitch prep.
   - **Research** — overnight briefings, market landscape analysis, competitive positioning. Results surface in the strategic chat.
   - **Decision memory** — the decisions log. Captures what was decided, why, and what would change the decision. Future sessions inherit the reasoning.

2. **Dispatcher.** Thin awareness of every project and client — enough to triage incoming work, route it with the right context slice to a focused session, and receive results back.

The CLI (terminal Claude Code) and the AIOS UI (web app) are both **surfaces** for the AIOS intelligence layer. Neither is AIOS itself.

## Dispatch handoff

A markdown artifact AIOS creates during triage when an email or action surfaces something a project needs to know. Written to the project wiki's staging inbox (`raw/aios/`) as part of the triage action — not as a separate step. The handoff contains only project-relevant intelligence (scope changes, new deadlines, new stakeholders, decisions), never operational noise ("got it, thanks").

Dispatch handoffs are the primary mechanism by which AIOS pushes knowledge *out to* projects. AIOS never loads full project context into itself to do project work — the operator leaves AIOS and opens a fresh session in the project repo when real work is needed. Project wikis are self-sufficient: Claude Code reads the wiki natively when working in a project repo. No explicit "load project" step is required.

## Last-known-state

A lightweight summary of where a Project stands, maintained in the project's LLM-wiki. Auto-updated at end of session (or by routines). Contains: current status, what was accomplished, what's next, any blockers or deadlines. The dispatcher reads these summaries to maintain thin awareness of every project without loading full project context.

Last-known-state is the dispatcher's primary input for triage and routing. It answers "what's going on with X?" without switching into the project. When the dispatcher needs to go deeper, it loads the full project brief — that's the signal that the operator is switching from dispatcher mode into project mode.

Lives in two places:

- **Authority**: the project's own LLM-wiki (`docs/wiki/STATE.md`). Updated at end of session by a hook or routine.
- **Cache**: mirrored into claude-os (`state/<project-slug>.md`) by the same end-of-session flow. The dispatcher reads from this local cache so it can scan all projects from one directory without filesystem-hopping across repos.

---

## Client

A top-level entity in `clients.yaml`. Has:

- A globally unique `slug` (e.g., `inside-out`, `nps-media-group`, `bgd-hq`)
- A human-readable `name`
- A `bucket` (see below)
- One or more `projects`

A Client is the **billing or ownership entity**, not necessarily the relationship Justin works with day-to-day. Example: in the NPS Media Group / Partners For Sight engagement, **NPS Media Group is the Client** (they get the invoice); Partners For Sight is the **Project** (the actual work surface, with its own day-to-day contacts).

## Bucket

A top-level classification on a Client. Three values:

- **`paying`** — Client generates monthly recurring revenue today. Counted in MRR.
- **`prospects`** — Client may generate revenue later. Currently zero MRR. Tracked because relationships are in motion. Has a prospect doc accumulating knowledge (see **Prospect pipeline**).
- **`internal`** — Strategic work entity. No external revenue. Examples: `bgd-hq` (productize / business-plan / BrandOS productization).

A Client flips its Bucket when its commercial state changes (e.g., a prospect signs → `prospects` becomes `paying`).

## Prospect pipeline

A knowledge accumulation flow for potential clients before they become active engagements. Lives in the strategic partner side of AIOS.

1. **Prospect enters.** A lead surfaces (Jon referral, email, conversation). AIOS creates a `clients.yaml` entry with `bucket: prospects` and a prospect doc at `prospects/<slug>.md`.
2. **Knowledge accumulates.** Triage tags relevant emails to the prospect. Research, call notes, pain points, and company context get captured in the prospect doc. AIOS learns about this company over days or weeks.
3. **Conversion.** The operator triggers `/onboard-client`. The intake interview reads the prospect doc and asks **targeted questions** based on what AIOS already knows — skipping the obvious, drilling into gaps. The prospect doc + interview answers together seed a rich project wiki via `/kickoff-project`.

The prospect doc (`prospects/<slug>.md`) is the single accumulation point. At conversion, bucket flips to `paying`, the wiki gets seeded with real substance, and the prospect doc is archived.

## Project

A work entity nested under a Client. Has:

- A globally unique `slug` within `clients.yaml`
- A human-readable `name`
- A `status` (today: `active`; other values like `paused`, `done`, `archived` will be defined as they get used)
- An optional `contract` (free-form human-readable label, e.g., `"$400/mo Bonsai"`)
- An optional `mrr_monthly` (structured numeric, in USD, the value summed into MRR rollups)
- `docs_paths` — list of file or directory paths feeding the Project's context
- `contacts` — list of emails (or `@domain.com` patterns) used by Gmail/Calendar queries

A Project may represent any of:

- **A billable client engagement** — Inside Out website redesign, Thermal Kitchen redesign, ToneQuest replatform.
- **A subscription line** — Pyro Ag dealer subscription, Black Knight Drones dealer subscription. Modeled as a Project so MRR rollup sums uniformly.
- **A strategic internal effort** — `productize` (Q2 priority #1), `business-plan` (Q2 priority #3), `brandos` (BrandOS productization cross-cutting platform play).

Projects under `internal` Clients have `mrr_monthly` of zero or unset and never contribute to MRR.

## Subscription line (special case of Project)

A Project whose primary purpose is to record a recurring revenue line, not a build-out engagement. Example: each BrandOS dealer (Pyro, Black Knight, New Heights, Great River, Truss) is a Subscription line modeled as a Project. Subscription lines may have lighter `docs_paths` and `contacts` than full engagement Projects, but they still belong in `clients.yaml` so MRR math is uniform.

## MRR (Monthly Recurring Revenue)

The sum of `mrr_monthly` across all Projects whose Client has `bucket: paying` and whose Project status is `active`.

Excluded from MRR:
- All Projects under `prospects` Clients
- All Projects under `internal` Clients
- Projects with status `paused`, `done`, or `archived` (regardless of Client bucket)
- One-time fees, setup fees, and any non-recurring revenue. (If needed, those will get a separate revenue category in the future.)

## Skill

A Claude Code skill — a markdown prompt file in `.claude/skills/<name>/SKILL.md` invoked via the `Skill` tool or via a `/<name>` slash command. Each Skill is a deterministic+AI pipeline for a specific task. Skills live at either user level (`~/.claude/skills/`) or project level (`<repo>/.claude/skills/`).

In the AIOS UI, **a Skill is invoked by shelling out to the `claude` CLI as a subprocess** (long-running, streaming via SSE for chat Skills; one-shot for non-interactive Skills like `/onboard-client`). The UI does not reimplement Skill logic; it launches the Skill and renders its output.

### Client onboarding lifecycle

`/onboard-client` is the single entry point for bringing a new client into AIOS. The full flow:

1. Interactive intake interview (8 questions).
2. Writes to `clients.yaml`.
3. Scaffolds memory file + reference doc.
4. Triggers `/kickoff-project` to create the project repo wiki, seeded with what AIOS already knows.
5. Creates initial `STATE.md` in the wiki and syncs to `state/<slug>.md` in claude-os.
6. Logs to `decisions/log.md`.

One action, complete setup. From that point the wiki is self-sufficient; AIOS holds only the last-known-state cache.

## LLM-wiki

A per-project structured knowledge wiki living inside a Project's external repo (typically at `{repo}/docs/wiki/`). Has a canonical structure: `WIKI-CLAUDE.md` (schema), `decisions/active/`, `decisions/deferred/`, `decisions/implemented/`, `decisions/superseded/`, `log/`, plus `plans/`, `architecture/`, `research/`, `strategy/`, `raw/` sections.

The LLM-wiki is the **durable home for project-internal decisions and knowledge**. The cross-project `claude-os/decisions/log.md` holds only cross-cutting AIOS / business / multi-project decisions.

AIOS writes ONLY to the wiki's `raw/aios/` subfolder (see **Dispatch handoff** and **Raw drop**). Promotion from `raw/aios/` into the wiki's curated structure is the responsibility of the LLM-wiki ingest pass, not AIOS. This separation is documented in `docs/adr/0002-staged-ingestion-via-raw-aios.md`.

### Wiki ingest filter (second gate)

The ingest pass evaluates each `raw/aios/` file against the wiki's current knowledge (last-known-state, active decisions, overview docs). Three outcomes:

- **Promote** — genuinely new information. Placed into the curated wiki structure.
- **Skip** — redundant. The wiki already knows this. File is cleaned up (deleted or archived), not left to pile up.
- **Flag** — contradicts something the wiki currently holds. Does not auto-promote. Surfaces to the operator for resolution (e.g., "AIOS says launch is June 15, but the wiki has June 1 — which is current?").

This is the second layer of the double gate. AIOS filters on the way out (heuristic categories + LLM tiebreaker for ambiguous cases). The wiki filters on the way in. A false positive from AIOS is caught here; a contradiction is surfaced rather than silently overwritten.

## AIOS UI

A local-only web app running on `localhost` that serves as the visual surface for the AIOS dispatcher and strategic partner. Three primary surfaces:

1. **Dashboard** — MRR rollup, project status cards (read-only, powered by last-known-state), recent activity, to-do list.
2. **Triage** — email threads needing replies with inline draft/revise/send. The primary action surface. Refreshes on a schedule.
3. **Strategic chat** — a single operator-level chat session (not per-project). The business partner surface for cross-cutting decisions, pricing, positioning, planning. Implemented as an embedded terminal in the UI.

Projects appear as status cards, not work surfaces. Clicking a project opens it externally (VS Code, a new Claude Code terminal session in the project repo, etc.) — the operator leaves the AIOS UI to do project work.

**Two sessions by design.** The dispatcher and the strategic partner are separate sessions with separate context. The dispatcher surface is largely pre-computed by routines — reading cached results, not burning live tokens. The strategic partner is a real conversation that benefits from a clean, deep context. Mixing them would dilute both.

**Cost model.** The dispatcher is cheap — routines pre-compute, the dashboard reads static output. The strategic partner is where real token spend happens, and that's where the value is. This separation becomes especially important as Claude pricing evolves (print mechanics, session costs). Design surfaces to minimize unnecessary live-session time.

The AIOS UI is **additive** to terminal Claude Code, not a replacement. Both surfaces coexist. The CLI remains the power-user surface; the UI is the daily-driver dashboard.

## To-do

A persistent, lightweight task list that lives in claude-os. Two types of items, split by lifecycle:

- **Email threads** — managed by Triage. Ephemeral. Disappear when resolved (replied, snoozed, dismissed). Not stored in the to-do list; they live in the triage output.
- **Action items** — persist until completed. Generated by triage ("schedule a call with Aaron"), by the operator manually, or by strategic thinking sessions. Stored as a first-class AIOS artifact. Checkable from the dashboard.

The to-do list is not a full project tracker. It tracks operator-level actions — things Justin needs to do that aren't email replies and aren't project-level build tasks (those live in the project repo).

## Capture

A short-form input that writes a new memory, decision, note, or action item into the right file via a Skill (currently `/gsd-capture`). The AIOS UI exposes Capture in two places:

- **Project-scoped Capture box** on every Project page. Context = the current Project. Routes to that Project's memory / decision / wiki destination.
- **Global Capture box** on the Home screen. The user picks a target Project from a dropdown (default: "Auto-detect," in which case the Skill infers the destination from the input text).

Both surfaces fire the same Skill subprocess; the difference is whether the Project context is fixed or inferred.

## Admin

A lightweight system-management surface in the AIOS UI. Distinct from the Strategic chat (which is for thinking). Admin is for managing the AIOS itself:

- **Skill launchers** — buttons for `/level-up`, `/audit`, `/onboard-client`, and other system-level skills, each with cached output cards.
- **Research archives** — overnight briefings, market landscape docs, competitive analysis. Browseable list.
- **Settings** — `clients.yaml` editor, routine configuration, AIOS UI preferences.

Admin is where you manage the system. The Strategic chat is where you think. They serve different intents and don't mix.

## Strategic chat

A persistent Claude Code session for cross-cutting strategic thinking — the business partner surface. Not scoped to any one Project. Claude-os memory, decisions log, and business context injected. Decisions made here land in `claude-os/decisions/log.md` or the relevant project wiki via dispatch handoff.

Formerly called "Operator chat." Renamed to reflect its role in the two-job model.

## Operator chat — `RETIRED`

*Replaced by **Strategic chat**.* Original definition: a persistent Claude Code session associated with the Admin surface (not any one Project). Justin's strategic thought-partner: long-running, with claude-os memory injected, no project lens.

## Project chat — `RETIRED`

*Retired in the dispatcher reframe (2026-06-03).* Original definition: a per-Project persistent session hydrated from the cached Project brief + live Gmail/calendar at session bootstrap. Each Project gets its own Project chat.

Retired because: the operator leaves AIOS to work on projects. Project work happens in a fresh Claude Code session in the project repo, where the wiki provides context natively. AIOS does not host project-level sessions.

## Recent activity

A filesystem-derived feed of file changes + decision-log entries + wiki-log entries within a window (default: last 30 days). Used in:

- Home screen: cross-project Recent activity feed.
- Client page: Recent activity feed scoped to all Projects under that Client.
- Project page: Recent activity feed scoped to one Project.

Always deterministic — no AI synthesis. Not to be confused with the AI-synthesized brief produced by the `/load-project` Skill, which IS AI-generated and lives in chat. Also distinct from the **Receipt feed** (below): Recent activity is a passive time-windowed survey of the filesystem; the Receipt feed is an append-only log of writes the AIOS UI itself initiated.

## Receipt feed

A visible append-only log of every durable write the AIOS UI initiates. Each entry records: timestamp, kind (`capture | todo | triage_override | chat_drop | chat_session_close | wiki_ingest`), project slug, absolute file path written, and an excerpt. Persisted at `aios-ui/.aios-cache/receipts.jsonl`.

The Receipt feed is the AIOS UI's **trust mechanism**: there are no approval gates on writes, so the operator gains confidence from receipts (visibility) rather than from modals (gates). Rendered in two places: a global dock at the bottom-right of every page (collapsible) and a per-project slice on each Project page.

## Triage

A background routine that runs on a schedule (target: every ~2 hours during waking hours), not a manually triggered skill. Produces a ready-to-act dashboard surface: ranked email threads needing replies, a running to-do list, and any dispatch handoffs for project wikis. The operator wakes up to a prepared triage — no manual trigger needed.

Key UX principle: **act from the triage, don't leave it.** Draft replies are inline and revisable. To-do items are checkable. Handoffs to project wikis happen as a byproduct of acting on a triage item, not as a separate step.

The current `/daily-inbox-triage` skill is the prototype for the intelligence behind triage. The reframe: it becomes a scheduled routine whose output persists and refreshes, not a one-shot skill invoked manually.

## Triage override

A user-applied mark on a Gmail thread that suppresses triage from re-surfacing it. Four states: `replied`, `snoozed` (with `snooze_until`), `not_me`, `dismissed`. Persisted at `aios-ui/.aios-cache/triage-overrides.json` and read by the triage Skill's "Justin owes a reply" filter step before evaluating any thread.

Triage overrides exist because the triage Skill's heuristic (last sender ≠ Justin && >18h old) misclassifies threads where Justin has replied mid-thread. The override gives the operator the final word.

## Project brief — `RETIRED`

*Replaced by **Last-known-state** at the dispatcher layer (2026-06-03).* Original definition: a pre-indexed Markdown file at `aios-ui/.aios-cache/briefs/<project-slug>.md` containing the consolidated static project context — `clients.yaml` metadata, project memory, wiki content, decisions log entries tagged to the project. Built by invoking the `/load-project` Skill as a subprocess.

Retired because: `/load-project` is retiring. The dispatcher reads lightweight last-known-state summaries, not full project briefs. When working on a project, the wiki provides context natively in the project repo.

## Raw drop

A markdown file the AIOS UI writes into the project wiki's staging inbox at `{wikiPath}/raw/aios/`. Three kinds:

- `capture-YYYY-MM-DD-<slug>.md` — operator capture from the Capture box.
- `chat-decision-YYYY-MM-DD-<slug>.md` — operator promoted a chat AI turn via "Drop to raw."
- `chat-session-YYYY-MM-DD-<id>.md` — full chat transcript dropped on session close.

Raw drops are **immutable once written**. The AIOS UI NEVER writes into the wiki's curated structure (`decisions/`, `sources/`, `log.md`, `index.md`). Promotion from `raw/aios/` into curated form is the responsibility of the **LLM-wiki ingest pass**, not AIOS. See `docs/adr/0002-staged-ingestion-via-raw-aios.md`.

## Pending ingestion

The count and list of `raw/aios/*.md` files in a project's wiki whose modification time is newer than the most recent `## [YYYY-MM-DD] ingest |` entry in the wiki's `log.md`. Surfaced on each Project page as a section with a "Run wiki ingest" button that invokes the `/wiki ingest` workflow on the pending files.

Pending ingestion is the **visibility layer** for the gap between "AIOS captured something" and "the wiki has incorporated it." A zero count means everything AIOS has dropped has been promoted; a non-zero count means there's curation work to do.

## Communications (UI section) — `RETIRED`

*Merged into the unified **Triage** surface (2026-06-03).* Original definition: a per-Project section on the Project page rendering the daily-inbox-triage Skill's output, filtered to that Project's `contacts` from `clients.yaml`.

Retired because: triage is now a unified dashboard surface, not per-project. All email threads appear in one ranked list, tagged by project. The operator doesn't navigate to a project page to see its emails.

---

## Relationships

```
Bucket  (paying | prospects | internal)
    ↑
Client  (one or more)
    ↑ has
    1..N Projects
            ↓ may carry
            mrr_monthly (only counted when Client.bucket == paying AND Project.status == active)
            docs_paths → LLM-wiki | reference docs | external repos
            contacts   → Gmail + Calendar query inputs
```

## Cardinality rules

- A Client has 1..N Projects (BGD HQ has 3; Inside Out has 1; NPS Media Group has 1 today).
- A Project belongs to exactly one Client.
- A Project has 0..1 `mrr_monthly` value. Unset = does not contribute to MRR.
- A Skill is invoked via the Claude CLI; the AIOS UI shells out, does not reimplement.

## Open questions (as of 2026-06-04)

- Exact `STATE.md` format and substance threshold for the end-of-session hook
- Embedded terminal implementation approach (cost/pricing considerations as Claude pricing evolves)
- How proactive pattern scanning actually works (the routine that notices cross-project signals)
- Migration path from current AIOS to the dispatcher model (what ships first)
- AIOS UI rebuild scope given the retired concepts
- Prospect doc format and what "targeted questions" look like in the context-aware onboarding interview

## Out of scope for this glossary

- Implementation: file paths, file format details, code conventions — those live in `clients.yaml` itself and in skill specs.
- Process: scheduling, capacity planning, billing operations — those live in skill specs, memory, and the decisions log.
- Personal context (Justin's role, household, partner) — lives in user-type memory files.

---

*Created 2026-05-19 during `/grill-with-docs` session on the AIOS UI design.*
*Updated 2026-06-04 during `/grill-with-docs` session on the AIOS dispatcher + strategic partner reframe.*
