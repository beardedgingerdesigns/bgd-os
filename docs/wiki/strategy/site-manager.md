# Site Manager — The Productized-Tier Engine

The engine behind BGD's productized tier: a chat-driven, multi-tenant site builder that orchestrates Claude Code headless against client site repos. The Terraplex platform is **one configuration** of this engine, not a Terraplex-specific tool.

AIOS-level summary. Detailed architecture lives in the repo's own `CLAUDE.md` (~600 lines) — read that first when working the manager directly.

## Identity

| Context | Name |
|---|---|
| Repo directory | `site-builder-phase2` |
| Repo CLAUDE.md title | "BGD - Terraplex Site Builder" |
| Internal/conversational | "manager app" |
| Production app name | `bgd-site-manager` |
| Production URL | `manager.beardedgingerdesigns.com` |

Local path: `/Users/justinlobaito/repos/site-builder-phase2`

## Core mechanic

```
Browser chat UI (Vue 3) → SSE → Express backend → spawns `claude --print` headless
                                                  pointed at sites/<slug>/
                                                  allowed tools: Edit, Write, Bash, Read
                              ↓
       Claude edits files in the site repo, output streams back to browser
                              ↓
              Backend runs git diff → returns to UI
                              ↓
       User approves → git commit + push → Netlify auto-deploys
```

## Strategic fit (AIOS priorities)

- **Productize BGD (priority #1):** Phase 5 (client access — multi-user roles, approval queue, audit trail) IS the productization unlock. It turns the manager from an internal Justin-only tool into a multi-tenant product. Published tiers on beardedgingerdesigns.com are the marketing surface; Phase 5 is the product surface.
- **Terraplex hub (priority #2):** operationalized through `hubs/terraplex/` config + `sites/*` managed sites + the `manager.beardedgingerdesigns.com` deploy.
- **Business plan (priority #3):** this repo is the core asset to value in the 12-month revenue model. Channel-platform pricing should reflect Phase 5 readiness.

### Phase plan

| Phase | Status |
|---|---|
| 1. POC (single hardcoded site, basic chat) | shipped |
| 2. Real chat UI (Vue 3 + SSE + auth) | shipped |
| 3. Multi-site support (registry, selector, file tree) | shipped |
| 4. Deploy & review flow (git diff UI, deploy button, rollback, Netlify status) | shipped |
| 5. Client access (multi-user roles, approval queue, audit trail) | future — the productized SaaS unlock |

Until Phase 5, the manager is Justin-only; clients interact through the dealer onboarding form + email + monthly check-ins.

## Dealer site stack (intentionally simple)

Dealer spoke sites are static-by-design — fast to deploy, cheap to maintain, easy for Claude Code to edit. **Not Craft CMS** (Craft is for BGD custom client work and 2RM enterprise sites).

- Static HTML + Tailwind CDN (no compile step)
- Netlify Functions for contact-form submission (`/.netlify/functions/submit`)
- Resend for email notifications (API key in `data/secrets.json`, keyed by slug)
- Honeypot anti-spam (hidden `_gotcha` / `_redirect` fields)
- No build command; publish dir = repo root

## Onboarding endpoints

Automate the full form-to-live-site path:

| Endpoint | Purpose |
|---|---|
| `POST /api/onboarding/submission/:id/approve` | Approve a dealer onboarding. Triggers scaffolding: creates `sites/<slug>/`, writes `spoke.config.json`, copies platform-managed files, snapshots archetype to `_archetype.md`, runs `ui-ux-pro-max` to write `design.md`, symlinks the skill. |
| `POST /api/sites/<slug>/regenerate-design` | Idempotent. Re-runs the design-foundation skill against an existing `spoke.config.json` + `_archetype.md` (~1-3 min). Used when the initial `design.md` failed or needs a fresh pass. |

The "paste-JSON modal" workflow in the form repo README is the entry point — the same automated path, not a separate manual one.

## The slug is forever

The canonical dealer slug touches **5 locations** — renaming is expensive, so get it right at creation:

1. `sites/<slug>/` directory name
2. `dealer.id` in `spoke.config.json`
3. `takenBy[].dealer` in `hubs/terraplex/archetypes/_index.json`
4. `data/sites.json` entry key
5. `data/secrets.json` entry key

Rules: kebab-case, lowercase, short and memorable, **not domain-derived** (`pyro-ag` not `pyroagllc-com`; `truss` not `truss-services-llc`), no special chars/underscores/spaces, unique across the network. Phase 2.75 was a slug-rename exercise; the existing `trussservicesllc-com-com` entry is a real bug (domain-derived AND doubled `com`).

## Hub structure & versioning

The Terraplex hub is its own git repo at `hubs/terraplex/`, versioned via git tags (current: `v0.3.0`). Each dealer's `spoke.config.json` pins a `hub.version`. Hub content propagation across all dealers is **Phase 3 work**, separate from per-dealer onboarding. Pre-flight before any onboarding: hub must be on a clean tag matching origin — "don't onboard against a mid-work hub."

```
hubs/terraplex/
├── spoke/        spoke.schema.json (AJV-validated), questionnaire.json (field + taxonomy source of truth)
├── products/     r-32 + i-19 (.json specs + .md body copy, hub-versioned)
├── archetypes/   _index.json (catalog + takenBy[] uniqueness), forge/tactical/terrain/clean/field/patriot
├── assets.json
└── design/       propagation-v1.md (Phase 3 rollout plan)
```

Validate a dealer config: `ajv validate -s hubs/terraplex/spoke/spoke.schema.json -d sites/<slug>/spoke.config.json`. If it fails, fix the config — schema changes are a separate phase.

**TODO policy in spoke configs:** required fields with no data → literal `"TODO"` (flags real gaps); optional fields with no data → omit entirely.

## The skills-as-deliverable pattern

`.claude/skills/ui-ux-pro-max/` is committed to the manager repo and **symlinked into each new dealer repo at scaffold time**. At onboarding approval the skill runs once per dealer to write `sites/<slug>/design.md` — the dealer's unique design foundation. Driver: `server/services/design-foundation.js`. This is non-trivial: skills become part of the productized deliverable, not just author-time tooling.

## Tech stack

- **Backend:** Node.js + Express, ES modules
- **Frontend:** Vue 3 + Vite SPA (no Nuxt); custom CSS variables, dark theme (no Tailwind in the manager itself)
- **Realtime:** Server-Sent Events streaming Claude output
- **Auth:** session-based with bcrypt (single-user now, multi-user planned for Phase 5)
- **Process mgmt (prod):** PM2
- **Data:** JSON files on disk (`data/sites.json` registry, no DB yet)

### Environments

- **Local dev (DDEV):** PHP 8.2 + Node 20 + Apache. Frontend `https://bgd-site-manager.ddev.site:5174`, backend `:3001`. Claude Code runs on the **host**, not inside DDEV; bind-mounted `sites/` makes edits visible to both.
- **Production (Ubuntu LAMP, DigitalOcean):** `/opt/bgd-site-manager/` (app) + `/opt/bgd-sites/` (managed repos). Apache reverse proxy → PM2 → Express `:3000`. SSE needs `proxy-nokeepalive` + no buffering in Apache config.

## Security model

Auth-gated (no public exposure). Allowed Claude Code tools whitelisted to `Edit, Write, Bash, Read`. Site-path validation prevents traversal (`SITES_DIR` boundary). Rate limiting on `/api/chat`. Production behind Apache reverse proxy with HTTPS.

## Integrations

- **Claude Code (headless)** — spawned per chat message, scoped to one site directory.
- **Netlify** — auto-deploys from git push; deploy status polled via API.
- **Refero** — design reference-image lookup (`docs/refero-integration.md`); part of the design-foundation flow.
- **GitHub (deploy keys)** — for cloning private site repos.

## Currently managed sites (snapshot 2026-05-02)

`black-knight` · `great-river` · `iron-ridge-aerial` · `new-heights` · `pyro-ag` · `trussservicesllc-com-com`

**Drift note:** `iron-ridge-aerial` appears in `sites/` but not in `archetypes/_index.json#takenBy` — either a 7th unregistered dealer, a test fixture, or another platform's site. Worth a glance. "Platform-managed" files (`netlify.toml`, `submit.js`, `.claude/settings.json`, the skill symlink) should not drift per-dealer; if they do, the scaffolding service has a gap.

Related: [[Channel-platform product]] · [[Terraplex platform]] · [[BrandOS roadmap]]
