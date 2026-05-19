# PRODUCT.md

## Product

**AIOS** — a local-only personal command center for running Bearded Ginger Designs (BGD) and Two Rivers Marketing (2RM) work. Reads the operator's filesystem (clients YAML, decisions log, per-project memory, wiki repos) and presents a coherent view of every client and project. Each project has a Claude chat with full project context loaded.

**Register**: product — it's a tool the operator lives in daily, not a marketing surface. Familiarity is a feature; the tool should disappear into the task.

## Users

One user, today: Justin Lobaito — senior front-end developer, BGD founder, runs ~12 client engagements concurrently across active builds, paid maintenance, prospects, and internal experiments. Uses this app on a 27" desktop monitor during work blocks and on laptop during evening / travel windows. Mental model is "what's earning, what's at risk, what's shipping this week."

The app is not multi-tenant and not for clients. No login, no roles, no marketing copy.

## Product Purpose

Three things the operator wants from this surface:

1. **Glance** — open the home page, know the MRR, the paying vs prospect mix, and the things that moved since yesterday. Under 5 seconds.
2. **Drill** — click a client → see all their projects, contacts, money, recent activity. Click a project → same plus context-loaded chat.
3. **Act** — talk to Claude with the project context loaded, run the daily ingest, navigate to wiki / docs. Chat is the primary action, not a sidebar afterthought.

Not goals: editing client data in-UI, multi-user collaboration, public dashboards, embedded analytics for clients.

## Tone

Direct, lived-in, operator-grade. The way Linear, Raycast, or Notion's command bar feel — confident, fast, no welcome screens, no first-run tour, no "Hi 👋". Information density is a feature when the operator is the only user. Decoration costs cognitive load.

Voice in copy: short, lowercase-leaning where appropriate, no em dashes, no exclamation points, no marketing verbs ("supercharge", "empower"). MRR numbers are the loudest thing on the page; everything else gets out of their way.

## Strategic Principles

- **One person uses this.** No empty-state hand-holding. No tooltips explaining what MRR means. No tour modals.
- **Filesystem is the source of truth.** The UI reads `clients.yaml`, `decisions/log.md`, `memory/`, wiki repos. Editing happens outside in the operator's editor. The UI doesn't pretend otherwise.
- **Money has color.** Paying clients, prospects, and internal experiments should be visually distinct at a glance — not just a small text badge. Status (active / paused / done / archived) too.
- **Chat is a first-class surface, not a drawer.** Per-project Claude chat is the primary action on a project page. It deserves real estate, not an inline collapsible.
- **Dark by default.** Operator works late, in dim rooms, often next to an editor in dark mode. Light theme is not a near-term goal.
- **Density over decoration.** A 27" monitor should show useful info, not a stretched landing page. Cards are an affordance for grouping, not a default container.

## Anti-References

What this is NOT, by intent:

- **Not a SaaS dashboard for showing off.** No hero metric template (big number, smaller label, supporting copy block, gradient accent). The MRR figure can be big — but it earns it through being the actual answer to "how am I doing", not through decoration.
- **Not a CRM.** No leads pipeline, no email templates, no automation builder. Justin's CRM-lite lives in `clients.yaml` and his head.
- **Not a project management tool.** No tasks, no kanban, no Gantt. Activity is filesystem-derived, read-only.
- **Not a marketing site.** No animated heroes, no testimonials, no pricing tiers in the UI. Those live elsewhere (BGD site).
- **Not Notion or Obsidian.** It reads markdown but doesn't try to be a wiki. The wiki is a wiki, and the UI links into it.

## Inspiration (vibe, not template)

The screenshots Justin shared show: dense sectioned sidebars with grouped categories, mixed widget heights, status color (green / red trend deltas), AI assistant panels with quick-action chips, sparkline / mini-chart embellishments on stat tiles. The vibe to chase: a confident operator's tool with real information density, not a bland card grid.

Avoid the obvious slop reflexes: glassmorphism, gradient text, identical card grids, hero-metric templates, side-stripe accents, modal-first interactions.

## Hard Constraints

- **Stack is locked.** Next.js 16, React 19, Tailwind 4, shadcn/ui v4 (base-nova style, neutral baseColor), Lucide icons. No new UI libraries unless there's a single very good reason.
- **No telemetry.** Local-only — there's no analytics, no error reporting, no Sentry. Don't add any.
- **Server components first.** Pages are RSC, only opt into client components where interactivity demands it (ChatDrawer is one).
- **shadcn primitives stay shadcn-shaped.** Customize via tokens, not by forking primitives, unless there's a clear win.
