---
client: bgd-hq
project: brandos
type: brief
---
# BrandOS Product Roadmap

Living document. Captures the product's current state, ideas already on the table, and net-new core functionality being planned. No specific timing yet — focus is on the feature inventory and what BrandOS needs to be.

Roadmap structured in three parts:

1. **Current state** — what exists in production or active build today
2. **Ideas already expressed** — features that have come up in conversations, kickoffs, or dealer asks but aren't yet built or planned
3. **Core future functionality** — net-new planning for what BrandOS needs to ship

---

## Part 1 — Current State

What's actually running, what's in active build, and the architectural pieces in place.

### The manager app (`site-builder-phase2`)

The orchestration engine. Chat-driven UI that runs Claude Code headless against managed site repos.

**Stack:**

- **Backend:** Node.js + Express, ES modules
- **Frontend:** Vue 3 + Vite (SPA, no Nuxt)
- **Realtime:** Server-Sent Events for streaming Claude output
- **Auth:** Session-based with bcrypt (single-user today)
- **Process management:** PM2 in production
- **Storage:** JSON files on disk (`data/sites.json`, `data/secrets.json`); no database yet
- **Local dev:** DDEV at `bgd-site-manager.ddev.site`
- **Production:** `manager.beardedgingerdesigns.com` on Ubuntu LAMP / DigitalOcean droplet behind Apache reverse proxy

**Status:** Phases 1-4 shipped (POC, chat UI, multi-site management, deploy/review flow). Phase 5 (multi-tenant client access) is in active design.

### The hub data layer (`hubs/terraplex/`)

Per-platform-instance config. Today there's one hub: Terraplex.

| Component | Purpose | Status |
|---|---|---|
| `spoke/spoke.schema.json` | Canonical config schema (AJV-validated) | Live |
| `spoke/questionnaire.json` | Drives the dealer onboarding form fields | Live |
| `products/<id>.json` + `<id>.md` | Product specs and body copy (R-32, I-19) | Live |
| `archetypes/_index.json` | 6 archetype recipes + uniqueness tracker | Live |
| `archetypes/<id>.md` | Per-archetype design recipe (forge, tactical, terrain, clean, field, patriot) | Live |
| `assets.json` | Hub-canonical asset references | Live |
| `design/propagation-v1.md` | Phase 3 plan for hub-to-spoke content propagation | Documented, in active build |

### The onboarding pipeline

End-to-end flow from prospect to scaffolded dealer site.

| Step | Mechanism | Status |
|---|---|---|
| Public dealer form | Vue 3 SPA at `terraplex-onboarding.netlify.app`, Netlify Forms capture | Live |
| Schema-driven form fields | Built from `questionnaire.json` at deploy time | Live |
| Submission storage | Netlify Forms dashboard | Live |
| JSON paste-into-manager | Manual (Justin pastes from Netlify into manager UI) | Live |
| `POST /api/onboarding/submission/:id/approve` | Full automated scaffolding endpoint | Live |
| Site repo creation | Creates `sites/<slug>/` directory + git repo | Live |
| `spoke.config.json` generation | Built from approved submission | Live |
| `_archetype.md` snapshot | Pinned to `hub.version`, copied from hub | Live |
| `design.md` generation | Via `ui-ux-pro-max` skill (per-dealer unique design system) | Live |
| Skill symlink into dealer repo | `.claude/skills/ui-ux-pro-max` linked at scaffold time | Live |
| Platform-managed file copy | `netlify.toml`, `netlify/functions/submit.js`, `.claude/settings.json` | Live |
| Per-dealer working files | `NOTES.md`, `_reference/`, `CHANGELOG.md` bootstrapped | Live |
| Re-run on demand | `POST /api/sites/<slug>/regenerate-design` (idempotent) | Live |

Average new-dealer onboarding time: contract signing to live site in **~1 week**.

### The dealer site stack (per spoke)

Each dealer spoke is a standalone, branded, indexed site.

- **Stack:** Static HTML + Tailwind CDN (no build step)
- **Forms:** Netlify Functions (`/.netlify/functions/submit`) with hidden `_gotcha` honeypot
- **Email notifications:** Resend (API key per-dealer in `data/secrets.json`)
- **Deploy:** Netlify with custom domain
- **Each dealer's:** distinct archetype + accent color (no two spokes look the same)

### Live network (as of 2026-05-03)

| Tier | Entity | Status |
|---|---|---|
| Manufacturer | (none yet — Revolution Drones is the founding-manufacturer target) | TBD |
| Distributor hub | Terraplex | Live |
| Dealer spokes | Pyro Ag (Forge / orange) | Live |
| | Black Knight Drones (Tactical / gold) | Live |
| | New Heights Ag (Terrain / orange) | Live |
| | Great River (Clean / green) | Live |
| | Truss Services LLC (Patriot / red) | Live |
| | Superior Drone LLC (TBD / archetype TBD) | Onboarding (May 1) |
| | Iron Ridge Aerial | Drift — site exists, not in archetype tracker |

### Operating cadence (current)

- **Monthly dealer check-ins** (Justin runs them, captured via Gemini transcripts in Drive)
- **Monthly distributor check-in** (Justin / Cherity / Jack at Terraplex)
- **Hub-data sync** via `scripts/sync-onboarding-form.js`
- **Manual content propagation** today (e.g., Coverage disclaimer rollout was human-mediated across 3 dealers)
- **Curator routine** auto-runs on `terraplex-spoke-hub` repo (component-library audit + Refero research, daily)
- **Industry digest routine** auto-runs daily, dropping research outputs into the spoke hub

### Scheduled research routines (LLM-maintained vertical knowledge base)

A production capability running today: scheduled Claude Code routines that build and maintain a per-vertical knowledge wiki on `beardedgingerdesigns/terraplex-spoke-hub`. The wiki is governed by `HUB-CLAUDE.md` conventions and an auto-PR workflow that opens PRs from the agents' chore branches.

**Active routines (sourced from `docs/routines/`):**

| Routine | Cadence | What it does | Repo |
|---|---|---|---|
| Curator pass — component library | Every 4 hours | Audits component library, dedupes, expands cross-archetype applicability, explores new design references via Refero MCP. Per-section quota allocation prevents dog-piling. ≤20 new notes per run. | terraplex-spoke-hub |
| Industry digest — daily | 6am CT daily | Scans curated allowlist (sUAS News, AgFunder, AgWeb, FAA, manufacturers, Reddit) for prior 24hr ag-drone industry news. Drops digest into `research/digests/`. | terraplex-spoke-hub |
| Industry intelligence — monthly | 1st of month, 6am CT | Refreshes 1-2 stale manufacturer profiles + writes regulatory roundup. One PR per month. | terraplex-spoke-hub |
| Industry deep-dive — quarterly | 1st of Jan/Apr/Jul/Oct | 800-1500 word analysis on top queued topic with cited sources. | terraplex-spoke-hub |
| Hub lint — weekly | Sundays 9am CT | Wiki health audit + safe auto-fixes; unsafe issues surface for human review. | terraplex-spoke-hub |

All run on Opus 4.7. Connectors: Refero, Gmail, Google Drive, Google Calendar.

**Why this matters for BrandOS:**

- The Terraplex spoke-hub is functioning as a vertical-specific knowledge base. Component library, manufacturer profiles, regulatory tracking, industry news digestion — all maintained by LLM agents on a continuous schedule.
- This is a productized capability that scales per-vertical. A new manufacturer customer onboarding to BrandOS in a different vertical (construction equipment, specialty bikes, audio gear, etc.) could get its own knowledge wiki spun up at scaffold time, with its own scheduled research routines.
- The auto-PR workflow + HUB-CLAUDE.md governance pattern is reusable infrastructure.
- This is a real moat. Manual knowledge curation at this depth + cadence is expensive. The platform makes it economical.

Source-of-truth routine docs (importable into other claude.ai accounts) live at [docs/routines/](../docs/routines/).

### What's in active build

- **Hub-to-spoke content propagation automation** (Phase 3 of the platform). Replaces today's human-mediated rollout pattern.
- **Multi-tenant client access** (Phase 5). Today the manager is Justin-only; Phase 5 lets clients touch their own sites with appropriate permissions.
- **AI-driven dealer marketing material generation** (in design). Templates that respect brand guidelines, dealer-controlled regional customization.

### What's bundled but not yet exposed as customer features

- **`ui-ux-pro-max` skill.** Generates per-dealer design.md at scaffold time. Could be extended to power AI marketing material generation, design refresh on demand, etc.
- **`impeccable` skill.** UI/UX review and improvement skill, exists in repo (`test-impeccable-blackknight.js` is a test fixture).
- **The manager's chat interface itself.** Today it's Justin's tool. Phase 5 exposes it (with permissions) as a client-facing capability.

---

## Part 2 — Ideas already expressed

Features that have come up across conversations, kickoffs, and dealer asks. Some are explicit asks; others are aspirations or design-stage thinking. None are net-new for Part 3 — these are already on the table somewhere, just not yet built or shipped.

Grouped by category. Each entry notes where the idea originated.

### Manufacturer-tier infrastructure

| Feature | Source | Notes |
|---|---|---|
| Manufacturer hub site | Russell project plan, Revolution Drones kickoff (Mar 9) | Phase 1 of Russell engagement; mid-June 2026 launch target |
| Manufacturer-to-distributor content propagation | Russell project plan Phase 2 | Wires Revolution as hub above Terraplex; the load-bearing claim of the leave-behind |
| Cross-network analytics (manufacturer-level visibility) | Russell project plan Phase 2 | First time manufacturer sees what's happening at dealer tier |
| Full product portfolio surfacing (military / mapping series) | Russell project plan Phase 2 | Liberty, Patriot, Valkyrie series beyond agriculture |
| Pressroom / news section | Russell project plan Phase 2, channel-platform-product.md | At manufacturer tier |

### Content + asset management

| Feature | Source | Notes |
|---|---|---|
| Brand asset library (centralized hub) | channel-platform-product.md, Russell Phase 2 | Logos, imagery, video, sell sheets, manuals, certifications. Single source of truth. |
| Compliance & regulatory copy management | channel-platform-product.md, hub-and-spoke-thesis.md | FDA, FAA, EPA, export controls. Edit once, propagates everywhere. |
| Brand-asset propagation pipeline | Revolution Drones kickoff | Russell to provide assets via Drive; pipeline ingests them automatically |
| AI-assisted marketing material generation | channel-platform-product.md, New Heights dealer meeting | Banners, sell sheets, ad creative. Hub-controlled brand parameters; dealer-controlled regional customization. In design. |

### Operational data integration (Tier 3)

| Feature | Source | Notes |
|---|---|---|
| AWS data integration into customer-facing surfaces | Russell kickoff, Phase 3 of project plan | Live cloud data flowing to hub + distributor + dealer sites |
| Live aggregate metrics: acre counter, USA-made % | Revolution Drones kickoff | Surfaced everywhere automatically |
| Live fleet stats / sustainability metrics | hub-and-spoke-thesis.md | Manufacturer data becomes leverage at every tier |
| Customer-facing dashboards (per-fleet-owner) | Russell project plan Phase 3 | Operators log in, see their own drones' operational metrics |
| Partner portals (dealer/distributor operational visibility) | Russell project plan Phase 3, channel-platform-product.md | Shared metrics across the network |
| Service / parts UI | Russell project plan Phase 3 | TBD direction based on operational data shape |

### Per-tier portals

| Feature | Source | Notes |
|---|---|---|
| Manufacturer portal | channel-platform-product.md | Different permissions, same architecture |
| Distributor portal | channel-platform-product.md | Today exists in rudimentary form for Terraplex (dealer login + asset access) |
| Dealer portal (full version) | channel-platform-product.md, dealer meetings | Beyond rudimentary — marketing material generation, asset library, communication |
| HubSpot integration for portal communications | Terraplex monthly check-in (May 1) | Mentioned by Jack Schroeder at Terraplex |
| Marketing material support inside dealer portal | Terraplex monthly check-in (May 1) | Banner ad templates, sell sheets, etc. |
| Message board / alerts / notifications | Terraplex monthly check-in (May 1) | Communication infrastructure for dealers |

### Lead capture + attribution

| Feature | Source | Notes |
|---|---|---|
| Get-a-Quote CTA on drone pages | Terraplex monthly check-in (May 1) | Implemented for Terraplex; routes leads to Jack's email |
| Form submissions route up with attribution | channel-platform-product.md | Manufacturer sees aggregate, distributor sees regional, dealer sees their own |
| Phone-number-required on product request forms | Revolution Drones kickoff | Action item from kickoff |

### AI marketing tools (dealer-facing)

| Feature | Source | Notes |
|---|---|---|
| AI marketing material generator (in-portal) | New Heights dealer meeting (May 1) | Justin proposed: dealers generate own marketing materials with brand-respecting templates |
| Marketing budget / ad placement automation | New Heights dealer meeting (May 1) | Per-dealer monthly marketing budgets, auto-placed in regional ad networks |
| Digital billboard placement | New Heights dealer meeting | Specifically called out by Josh |
| Logo + spec sheet builder for dealers | Terraplex monthly check-in (May 1), Superior Drone onboarding | AI-generated brand assets per dealer |

### Trade show + event support

| Feature | Source | Notes |
|---|---|---|
| Trade show booth package templates (10x10, 10x20) | New Heights dealer meeting | Josh's specific ask; Four State Farm Show coming July 9-11 |
| Marketing-package planning (per show) | New Heights dealer meeting | Justin committed to "noodle on this for a week" |
| Trade-show signage and printable asset templates | New Heights dealer meeting | Spec sheets sized for booth print |
| Event-coordinated drop in marketing service tier | hub-and-spoke-thesis.md, manufacturer-tiers.md | Specialist partner brokers this work |

### Marketing services overlay (specialist partner layer)

| Feature | Source | Notes |
|---|---|---|
| Hub-level marketing services | manufacturer-tiers.md | Cross-dealer campaigns, shared asset libraries, press, annual planning |
| Spoke-level marketing services | manufacturer-tiers.md | Per-dealer marketing, video, trade-show, brand work |
| Specialist partner integration (LMG-style) | channel-platform-product.md, decisions/log.md 2026-05-02 marketing-services-slot entry | Curated specialists, not bundled. Anti-agency by design. Slot exists; commercial structure undecided. |

### Multi-tenancy + access control (Phase 5)

| Feature | Source | Notes |
|---|---|---|
| Multi-tenant client access | channel-platform-product.md, site-builder-phase2 CLAUDE.md | In active design |
| Per-tier roles + granular permissions | channel-platform-product.md | Different views for manufacturer / distributor / dealer staff |
| Approval queue (client requests → Justin review) | site-builder-phase2 Phase 5 plan | Clients submit changes; Justin approves before deploy |
| Activity log / audit trail | site-builder-phase2 Phase 5 plan | Who did what when |

### White-label / multi-vertical deployment

| Feature | Source | Notes |
|---|---|---|
| Second platform instance (different vertical) | channel-platform-product.md "what's NOT yet built" | Open question: shared infra vs separate deployments per vertical |
| Per-vertical knowledge wiki spin-up | NEW (this session) | Replicates the terraplex-spoke-hub pattern for new verticals |
| Per-vertical scheduled research routines | NEW (this session) | Curator + digest + intelligence + deep-dive routines spun up per vertical hub |
| Per-vertical archetype catalog | NEW (this session) | The 6 archetypes are agnostic; the hub knows them |

### Onboarding flow extensions

| Feature | Source | Notes |
|---|---|---|
| Existing-site ingestion | terraplex-onboarding-form questionnaire.json | "If you already have a website, paste it here. We'll read it automatically to pre-fill your contact info, services, hours, product prices, and social links." Logic exists in scripts/test-ingest-truss.js but full implementation unclear. |
| Distributor-tier onboarding flow | NEW (this session) | Schema-driven flow at the distributor tier (mirrors how dealers onboard today, one tier higher) |
| Multi-distributor support (Revolution example) | Russell project plan Phase 4 | Military procurement, mapping integrators, international as separate spokes under one manufacturer |

### Operational + admin

| Feature | Source | Notes |
|---|---|---|
| Subscription / contract lifecycle management | manufacturer-tiers.md, decisions/log.md | 18-month contracts with 36-month redesign benefit; productized tier mechanics |
| Dealer renewal / churn tracking | NEW (implicit from MRR conversation) | Subscription health monitoring across the network |
| Per-tier billing | manufacturer-tiers.md | Manufacturer pays platform fee, distributors pay theirs, dealers pay theirs |

---

---

## Part 3 — Core future functionality

Net-new feature planning. These are capabilities BrandOS needs that haven't been formally articulated in conversations or kickoffs yet. Each theme is its own area of product investment. No timing committed yet — focus is on what the platform needs to be at scale.

Reaction-first format: the themes are the high-level frame; features within each are specifics to refine.

### Theme 1 — Scaling infrastructure

What BrandOS needs to support 5+ manufacturers, 50+ dealers per network, hundreds of sites total — without falling over.

| Feature | Why |
|---|---|
| Database layer (postgres / similar) replacing JSON files at scale | `sites.json` works for 10 sites; breaks at 100. Multi-tenant access controls require structured data. |
| Per-vertical instance vs single-instance architecture decision | Open question from `channel-platform-product.md`. Affects deployment, pricing, isolation. |
| White-label theming of the manager UI | Today the manager is branded "BGD Site Manager." Manufacturers may want their own branded dashboard. |
| Backup + disaster recovery strategy | Where does dealer data live, how do we restore, what's the RTO/RPO. Not yet defined. |
| Distributed tracing, error monitoring, performance metrics | Today: anecdotal. Production-scale needs Datadog / Sentry / similar. |
| Service-level rate limiting, queueing, retry semantics | When 50 dealers all push content at once, the manager can't fall over. |

### Theme 2 — Knowledge wiki provisioning per vertical

The Terraplex spoke-hub knowledge wiki is hand-built today. When a new manufacturer onboards in a different vertical, BrandOS needs to spin up an equivalent wiki without weeks of manual setup.

| Feature | Why |
|---|---|
| Hub provisioning workflow (programmatic) | Spins up a new vertical-specific knowledge wiki repo with HUB-CLAUDE.md governance, auto-PR workflow, source allowlist scaffold. |
| Per-vertical scheduled research routine instantiation | Curator + digest + intelligence + deep-dive routines auto-created and scheduled when a new vertical hub is spun up. |
| Hub template library | A handful of vertical-prefab hubs (industrial equipment, specialty consumer goods, building products, etc.) that new manufacturers customize from. |
| Cross-vertical archetype mobility | The 6 archetypes work for any vertical today. Future: more archetypes, custom archetypes per vertical, per-network archetype catalogs. |
| Source allowlist as data | Per-vertical research routines need vertical-specific source allowlists (currently hardcoded for ag-drone). Move to data-driven config. |

### Theme 3 — Network analytics + insights

Per-tier portals (Part 2) are about access. This is about the data layer underneath.

| Feature | Why |
|---|---|
| Cross-network analytics rollup | Aggregates leads, visits, conversions across hub + distributors + dealers. Today: zero. |
| Manufacturer-level dashboards | Network performance, regional breakdowns, dealer comparison, conversion funnels. |
| Distributor-level dashboards | Their dealer subset's performance vs network average. |
| Dealer-level dashboards | Their site's analytics + anonymized peer benchmarks. |
| Lead-attribution data model | Where does a lead originate, how does it route up, how does conversion get tracked through the chain. |
| Industry benchmark visualizations | Compare manufacturer's network performance against the vertical knowledge wiki's industry data. |

### Theme 4 — Self-service for clients

Reducing Justin's bottleneck. Today most operations require Justin in the loop. At scale, that doesn't work.

| Feature | Why |
|---|---|
| Visual page editor for spoke owners | Dealer / distributor edits their own site without Claude Code or Justin's intervention. |
| Chat-driven editing interface (the manager's pattern, exposed to clients) | Phase 5 multi-tenant access via the same chat UI Justin uses today. Clients describe changes; agent applies them within their permissions. |
| Mobile app or PWA for dealer-side updates | Dealers are in fields, on roads, at trade shows. Need to update from anywhere. |
| Voice-driven updates for field use | Hands-free content updates from a tractor cab or trade-show floor. |
| Self-service archetype switching | Dealer wants to refresh their look — switches archetype without rebuild. |

### Theme 5 — AI-native customer surface

Today AI is internal infrastructure (Justin's tool, scheduled routines). Future: client-facing AI that helps customers operate their tier.

| Feature | Why |
|---|---|
| Per-customer agent provisioning | Each manufacturer/distributor/dealer gets an agent scoped to their network with knowledge of their content, voice, customers. |
| Brand-voice skill (per-spoke) | Generates copy in the dealer's voice automatically. Hub-controlled brand parameters; per-spoke voice fingerprint. |
| Compliance-checker skill | Validates content against regulatory requirements before publish. |
| SEO-optimizer skill | Per-page SEO recommendations integrated into the editing flow. |
| Lead-summarizer skill | "Summarize this week's leads for my territory" → digestible report. |
| Content-calendar agent | Suggests next month's content based on industry digest, seasonal patterns, dealer-specific needs. |
| Bundled skill marketplace | More skills available for invocation by customers. Marketing services partners can publish skills. |

### Theme 6 — Compliance + governance

For regulated industries (ag, pharma, financial, military, food/FDA), compliance isn't optional.

| Feature | Why |
|---|---|
| Regulatory change detection | FAA / EPA / FDA / export-control monitoring → hub auto-flags relevant changes for the manufacturer to review. |
| Audit log + activity stream | Phase 5 plan mentions; full version captures who-did-what-when across every tier with cryptographic integrity. |
| Approval workflow engine | Dealer requests change → distributor approves → manufacturer reviews critical-path changes → propagates. Granular per content type. |
| Compliance template library | Per-vertical regulatory copy templates that auto-update as regulations change. |
| Content versioning with rollback | Every spoke's site has full version history; rollback to any prior published state. |

### Theme 7 — Integrations layer

Beyond the current Resend + Netlify Forms + Drive setup. Real integrations connect BrandOS to the tools customers already use.

| Feature | Why |
|---|---|
| CRM integrations (HubSpot, Salesforce, Zoho, Pipedrive) | Lead routing flows into the customer's existing CRM. HubSpot specifically requested by Terraplex. |
| Email marketing integrations (Mailchimp, Klaviyo, Customer.io) | Beyond transactional Resend, full lifecycle email. |
| Social media scheduling (Buffer, Hootsuite, native APIs) | Dealer-level social marketing automation. |
| Calendar integration (Google Calendar, Outlook, iCal) | Event-driven content (trade shows, monthly check-ins, dealer events). |
| Analytics platforms (GA4, Plausible, Fathom) | Out-of-box analytics setup per spoke without per-dealer config. |
| Marketplace pattern | Beyond hand-built integrations, a partner-publishable integration directory. |

### Theme 7b — Down-channel communications + dealer portal

The dealer portal as a real product, not a rudimentary asset-access page. The framing isn't "what does a dealer log into" — it's "how do manufacturers and distributors communicate, train, alert, and direct dealers at scale." That's down-channel communications: information flowing from manufacturer → distributor → dealer with proper UX, acknowledgment tracking, and discoverability. Today this happens in email threads, Slack DMs, and personal phone calls. At 50+ dealers, that's untenable.

This theme had components scattered across Part 2 (HubSpot integration, message board, marketing material support inside dealer portal — all from Jack at Terraplex). Pulling them together and making the theme central.

#### Communication infrastructure

| Feature | Why |
|---|---|
| Real-time message board / announcement stream | Manufacturer or distributor posts an update; appears in every dealer's portal. Replaces email-blast pattern. |
| Alerts + push notifications | Dealer-portal alerts for time-sensitive things (recalls, regulatory changes, urgent campaigns). Email + in-portal + optionally SMS. |
| Direct messaging (manufacturer ↔ dealer, distributor ↔ dealer) | Threaded, persistent, searchable. Replaces ad-hoc email and DMs. |
| Read receipts + acknowledgment tracking | Manufacturer sees which dealers have viewed / acknowledged a critical update. Compliance-relevant for regulated industries. |
| HubSpot integration for portal communications | Specific Terraplex ask (Jack Schroeder, May 1). Sync portal communication into the manufacturer's CRM. |

#### Knowledge + training delivery

| Feature | Why |
|---|---|
| Training material library with versioning | Onboarding videos, sales training, product walkthroughs. Dealer staff can find and reference. |
| New-hire onboarding modules (per dealer) | Dealer hires a new staff member; they go through manufacturer-curated onboarding modules in the portal. |
| Webinar + event scheduling | Manufacturer schedules dealer-facing webinars; dealers see calendar, register, attend, get recordings. |
| Q&A / FAQ surfaced contextually | When a dealer is on a product page in the portal, related FAQ surfaces. Builds over time as questions get answered. |
| Searchable across all hub-distributed content | One search bar across documents, training, FAQ, asset library, message archive. |

#### Asset access (dealer-pull, with versioning)

| Feature | Why |
|---|---|
| Marketing asset library (always-current, hub-canonical) | Dealer downloads latest sell sheets, brochures, product images, video without asking. Versioned. |
| Spec sheets + manuals + certifications | Always-current, downloadable, watermarked per-dealer if needed. |
| Compliance document library with acknowledgment | Dealer must acknowledge they've reviewed compliance updates before continuing operations. Audit trail. |
| Per-dealer customization of templates | Dealer pulls a sell sheet, applies their logo and contact info, exports printable PDF. |

#### Action-required communications

| Feature | Why |
|---|---|
| Policy updates requiring acknowledgment | Manufacturer pushes a new dealer-program policy; dealer signs off in portal; manufacturer sees signature status across network. |
| Compliance change sign-off | Same pattern, regulatory-flavored. Tied to Theme 6 (compliance + governance). |
| Recall / safety bulletins with mandatory acknowledgment | Critical-path communication. Time-stamped, audit-tracked. |
| Pricing / promo announcements with date-bounded display | Show in portal during the promo window; auto-archive after. |

#### Portal UX

| Feature | Why |
|---|---|
| Mobile-friendly responsive portal | Dealers in fields, at trade shows, on the road. Mobile is primary, not secondary. |
| Single sign-on across portal + spoke site | Dealer logs in once; access portal + back-office of their site. |
| Notification preferences (email + portal + SMS) | Per-dealer choice. Some want email; some want SMS; some want everything in-portal. |
| Activity feed / "what's new since I last logged in" | Dealer logs in after a week; sees a personalized digest of what they missed. |
| Multi-language support (eventual) | When manufacturers go international, the portal goes with them. Not v1. |

### Theme 8 — Commerce + billing

BrandOS at scale needs to bill its own customers cleanly. Today this happens through Bonsai (BGD's external invoicing tool, not part of BrandOS).

| Feature | Why |
|---|---|
| Native subscription billing (Stripe-driven) | Platform invoices manufacturers/distributors/dealers directly. Not via Bonsai. |
| Plan change / upgrade flows | Dealer upgrades tier, manufacturer adds capabilities, distributor adds dealer slots. |
| Dunning / failed-payment handling | Built-in vs ad-hoc Bonsai chasing. |
| Per-tier billing visibility | Manufacturer sees what their distributors and dealers pay (where appropriate); distributors see their dealers' billing. |
| Founding-customer pricing rules engine | The 36-month locked pricing, free dealer onboarding for first 10, etc. (per founding customer framework) handled programmatically. |

### Theme 9 — Bulk + scale workflows

When a manufacturer brings 50 dealers, they don't onboard one at a time. Velocity needs to step up.

| Feature | Why |
|---|---|
| Bulk dealer import | Manufacturer uploads CSV / spreadsheet / API push → 50 dealers scaffolded in parallel. |
| Manufacturer onboarding flow (schema-driven) | Mirrors dealer onboarding flow at the tier above. Manufacturer fills questionnaire → manufacturer hub scaffolded automatically. |
| Granular permission system | Per-tier roles (admin / staff / viewer) with cross-tier visibility rules. Beyond simple per-tier. |
| Bulk content propagation with conflict resolution | When the hub updates 10 things at once, spokes resolve conflicts cleanly. |
| Migration tooling for existing-site clients | Today: Iron Ridge Aerial-style situations require manual migration. Future: pull existing-site content via the ingestion logic referenced in `terraplex-onboarding-form/questionnaire.json`, scaffold a new spoke from it. |

---

## How to read Part 3

Each theme represents a strategic area of product investment. The themes are independent but interact — many depend on Theme 1 (scaling infrastructure) as a precondition.

### Priority order (locked 2026-05-03)

Ranked by Justin. Marked as *customer-facing* (visible value the platform sells) or *internal* (substrate that enables other themes; not pitched as a deliverable).

| Rank | Theme | Audience |
|---|---|---|
| 1 | **Theme 7** — Integrations layer (CRM, email marketing, calendar, analytics) | customer-facing |
| 2 | **Theme 7b** — Down-channel communications + dealer portal | customer-facing |
| 3 | **Theme 2** — Knowledge wiki provisioning per vertical | customer-facing (per-vertical onboarding) + internal (the wiki itself is internal infrastructure) |
| 4 | **Theme 3** — Network analytics + insights | customer-facing (dashboards per tier) |
| 5 | **Theme 1** — Scaling infrastructure (DB, white-label, observability, backup) | **internal substrate**. Probably starts first in practice. Not pitched as a deliverable to customers; enables everything else. Keep in roadmap for internal planning, exclude from customer-facing roadmap views. |
| 6 | **Theme 6** — Compliance + governance | customer-facing (regulatory tooling) + internal (audit log) |

Deprioritized (not stripped, just not on the immediate roadmap):

- **Theme 4 — Self-service for clients.** Visual editor, mobile, voice updates. Important but later. Justin in the loop is acceptable until the customer count justifies the build effort.
- **Theme 5 — AI-native customer surface.** Per-customer agents, brand-voice skill, etc. Strategic differentiator but builds on top of foundation themes.
- **Theme 8 — Commerce + billing.** Bonsai is sufficient until BrandOS spins out as its own commercial entity.
- **Theme 9 — Bulk + scale workflows.** Bulk dealer import, granular permissions. Needed when a manufacturer brings 50 dealers; not before.

### Sequencing observations

Even within the priority order, sequencing matters:

- Theme 7b (down-channel + dealer portal) depends on Theme 1 (multi-tenant database) for proper portal access control. Some of the portal can be built today against the existing JSON-based system; the full version needs the DB layer.
- Theme 3 (analytics) is meaningfully easier once Theme 1 lands.
- Theme 2 (vertical replication) doesn't strictly require Theme 1, but the schema for hub provisioning is much cleaner with proper DB-backed config.
- Theme 6 (compliance) tooling layers naturally onto Theme 7b (acknowledgment workflows) once that exists.

In practice: Theme 1 is foundational and probably starts immediately even though it ranks 5th in priority. The other priorities run in parallel to the extent infrastructure supports them.

### What ships in parallel with founding-customer onboarding

Russell as founding manufacturer drives certain capabilities into immediate priority that wouldn't otherwise lead the roadmap:

- AWS data integration (Theme 3 + Tier 3 features) becomes immediate
- Manufacturer-tier propagation (Part 2 manufacturer-tier infrastructure) becomes immediate
- Manufacturer-level dashboards (Theme 3) become immediate

Other priorities can stay in their natural order because the founding customer doesn't depend on them.

---

---

*Document version: v0 — 2026-05-03. Part 1 drafted from AIOS docs; awaiting Justin's validation before Parts 2 and 3.*
