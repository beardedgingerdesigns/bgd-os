# CONTEXT.md — claude-os glossary

Canonical definitions for the terms used across the claude-os AIOS — `clients.yaml`, the skills, the decisions log, and the AIOS UI (in design as of 2026-05-19). This is a **glossary**, not a spec — it defines language, not implementation.

When the same term appears in code, docs, memory, or chat, this page is the authority. When two pages disagree, fix the wrong one.

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
- **`prospects`** — Client may generate revenue later. Currently zero MRR. Tracked because relationships are in motion.
- **`internal`** — Strategic work entity. No external revenue. Examples: `bgd-hq` (productize / business-plan / BrandOS productization).

A Client flips its Bucket when its commercial state changes (e.g., a prospect signs → `prospects` becomes `paying`).

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

A Claude Code skill — a markdown prompt file in `claude-os/.claude/skills/<name>/SKILL.md` invoked via the `Skill` tool or via a `/<name>` slash command. Each Skill is a deterministic+AI pipeline for a specific task.

In the AIOS UI, **a Skill is invoked by shelling out to the `claude` CLI as a subprocess** (long-running, streaming via SSE for chat Skills; one-shot for non-interactive Skills like `/onboard-client`). The UI does not reimplement Skill logic; it launches the Skill and renders its output.

## LLM-wiki

A per-project structured knowledge wiki living inside a Project's external repo (typically at `{repo}/docs/wiki/`). Has a canonical structure: `WIKI-CLAUDE.md` (schema), `decisions/active/`, `decisions/deferred/`, `decisions/implemented/`, `decisions/superseded/`, `log/`, plus `plans/`, `architecture/`, `research/`, `strategy/`, `raw/` sections. Detected and hydrated as first-class content by the `/load-project` Skill via Step 4a.

The LLM-wiki is the **durable home for project-internal decisions and knowledge**. The cross-project `claude-os/decisions/log.md` holds only cross-cutting AIOS / business / multi-project decisions.

## AIOS UI

A local-only Next.js web app (in design as of 2026-05-19) running on `localhost`, reading the claude-os filesystem directly, and providing a clients → projects browsing surface with an embedded Claude Code chat window per Project. Launches Skills as buttons. Computes the MRR rollup. Hosts an Admin section for operator-level rituals (`/level-up`, `/audit`, business-direction work).

The AIOS UI is **additive** to terminal Claude Code, not a replacement. Both surfaces coexist. The CLI remains the power-user surface; the UI is the daily-driver tracker.

## Capture

A short-form input that writes a new memory, decision, note, or action item into the right file via a Skill (currently `/gsd-capture`). The AIOS UI exposes Capture in two places:

- **Project-scoped Capture box** on every Project page. Context = the current Project. Routes to that Project's memory / decision / wiki destination.
- **Global Capture box** on the Home screen. The user picks a target Project from a dropdown (default: "Auto-detect," in which case the Skill infers the destination from the input text).

Both surfaces fire the same Skill subprocess; the difference is whether the Project context is fixed or inferred.

## Admin

A top-level surface in the AIOS UI, accessed via its own card on the Home screen alongside Clients. Houses:

- **Operator chat** — a persistent Claude Code session with no project context, scoped to "Justin the operator of BGD," for cross-cutting strategic thinking.
- **Operator Skills** — launch buttons for `/level-up`, `/audit`, `/weekly-project-status`, `/onboard-client`, each with cached output cards.
- **Business Plans & Research** — the internal Projects (`productize`, `business-plan`, `brandos`) rendered as full Project pages, plus a flat `references/research/` folder rendered as a browseable list.
- **Operator settings** — light surface; link to `clients.yaml`, AIOS UI configuration.

Admin is where operator-level rituals and strategic work live, distinct from per-Client engagement work.

## Operator chat

A persistent Claude Code session associated with the Admin surface (not any one Project). Justin's strategic thought-partner: long-running, with claude-os memory injected, no project lens. Decisions made in the Operator chat land in the relevant Internal Project's wiki or in `claude-os/decisions/log.md` if cross-cutting.

Distinct from **Project chat** — a per-Project persistent session injected with `/load-project` output for that Project. Each Project gets its own Project chat; Admin has one Operator chat.

## Recent activity

A filesystem-derived feed of file changes + decision-log entries + wiki-log entries within a window (default: last 30 days). Used in:

- Home screen: cross-project Recent activity feed.
- Client page: Recent activity feed scoped to all Projects under that Client.
- Project page: Recent activity feed scoped to one Project.

Always deterministic — no AI synthesis. Not to be confused with the AI-synthesized brief produced by the `/load-project` Skill, which IS AI-generated and lives in chat.

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

## Out of scope for this glossary

- Implementation: file paths, file format details, code conventions — those live in `clients.yaml` itself and in the `/load-project` skill spec.
- Process: scheduling, capacity planning, billing operations — those live in skill specs, memory, and the decisions log.
- Personal context (Justin's role, household, partner) — lives in user-type memory files.

---

*Created 2026-05-19 during `/grill-with-docs` session on the AIOS UI design.*
