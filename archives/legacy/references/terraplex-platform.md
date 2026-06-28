---
client: terraplex
project: terraplex-hub
type: brief
---
# Terraplex platform architecture

The "channel marketing platform" referenced in priority #2 (and increasingly priority #1) is a real, working multi-tenant system. This doc captures what's already built so future conversations don't treat it as a goal-state when it's an existing-state.

## The hub-and-spoke model

- **Hub** = Terraplex (the manufacturer / brand HQ).
- **Spokes** = each dealer site (Pyro Ag, Black Knight, New Heights, Great River, Truss Services, Superior Drone, etc.).
- Every spoke is generated from a `spoke.config.json` derived from the dealer onboarding submission.
- Hub data (`hubs/terraplex/`) lives in the manager repo and is the source of truth for archetypes, service taxonomy, and dealer roster.

## Repos

| Repo | Visibility | Role |
|---|---|---|
| [terraplex-onboarding-form](https://github.com/beardedgingerdesigns/terraplex-onboarding-form) | Public (Netlify) | Public-facing dealer questionnaire. Vue 3 + Vite. Submissions captured via Netlify Forms. |
| **Manager app** (`site-builder-phase2`, local at `/Users/justinlobaito/repos/site-builder-phase2`) | Private, local + production at `manager.beardedgingerdesigns.com` | The engine. Chat-driven UI that orchestrates Claude Code headless to build/edit dealer sites. Holds `hubs/terraplex/`, `sites/*`, scaffolding logic, design-foundation skill. Full architecture in `references/site-manager.md`. |

The manager is generic; Terraplex is one hub configuration. See `references/site-manager.md` for the full system.

## Onboarding pipeline (full architecture)

```
Justin (manager app) → generate shareable URL (?slug=acme-ag) → email to dealer
                                                                    ↓
                                                      Dealer fills form → Netlify Forms captures
                                                                    ↓
                                       Justin → Netlify dashboard → copy `_payload` JSON
                                                                    ↓
                                Manager app "Dealer onboardings" modal → Import → Approve
                                                                    ↓
                                  Spoke site scaffolded locally from spoke.config.json
```

The form repo bundles **build-time snapshots** of `questionnaire.json` and `archetypes.json` from the manager. Sync script in the manager: `scripts/sync-onboarding-form.js`, run when hub data changes.

## Form schema (questionnaire.json v1)

10 sections, each with field IDs that `maps` to a path in the canonical `spoke.config.json`. Summary:

| Section | Purpose | Required fields |
|---|---|---|
| `existing-site` | Optional — if dealer has an existing site, manager ingests it on approval to pre-fill voice samples, services, contact info | none |
| `business` | Identity + contact | businessName, ownerName, email, phone, city, state, serviceArea |
| `products` | What they carry | drones (R-32, I-19) — at least one required; additionalEquipment + competitorDrones optional |
| `services` | What they offer | services — pick from canonical taxonomy (10 options) |
| `brand` | Visual direction | archetype, accentMode, accentPrimary; accentSecondary required if mode=gradient/dual |
| `voice` | Hero copy | headline; tagline optional |
| `logo` | Logo handling | logoType (image/wordmark); logoSrc OR logoText conditional |
| `form-fields` | Contact form on dealer site | formFieldsBase (default true); extras: interest, acres, crop, platform |
| `story` | Authenticity hooks | founded, notableFacts, ownerBio — all optional |
| `social` | Optional links | facebook, instagram, youtube, tiktok |
| `quirks` | Special requests | clientQuirks, specialRequests, referenceSites — splitLines textareas |

**Service taxonomy (canonical):** Drone Sales · Custom Spraying/Application · Cover Crop Seeding · Pest Management · Service & Repair · Parts · Training & Certification · Regulatory Support · Mapping & Data · Consulting.

The questionnaire also defines **service normalizations** — variant wording mapped to canonical (e.g., "Aerial Spraying" → "Custom Spraying/Application"). Ingest pipeline uses these when pre-filling from an existing site.

## Archetype system

6 design archetypes. Each spoke gets a unique `archetype + accent` combination. Hub maintains `takenBy` arrays.

**Current dealer roster (per archetypes.json snapshot 2026-05-02):**

| Archetype | Vibe | Dealer | Accent |
|---|---|---|---|
| forge | Bold/Edgy, Modern/Tech-forward | pyro-ag | `#ea580c` |
| tactical | Bold/Edgy, Modern/Tech-forward | black-knight | `#EFBF04` |
| terrain | Clean/Professional, Modern/Tech-forward | new-heights | `#F36B21` |
| clean | Clean/Professional, Luxury/Premium | great-river | `#00392b` |
| field | Farm-focused/Down-to-earth | **AVAILABLE** | — |
| patriot | Patriotic | trussservicesllc-com-com | `#C8102E` |

**Implication for Superior Drone (Robert):** only `field` is currently untaken. Either Robert lands there, or the platform allows duplicate archetype + new accent. Per the form: "Your choice is still accepted if taken; we'll discuss at review." Worth resolving as a policy before the next dealer.

**Slug oddity:** `trussservicesllc-com-com` looks like a slug-generation bug (TLD doubled). Worth a glance in the manager.

## What's already productized

This platform is the productized BGD tier in everything but published packaging:

- ✅ Schema-driven dealer config
- ✅ Self-serve dealer questionnaire on a public URL
- ✅ Netlify Forms capture
- ✅ Local manager app scaffolds new dealer sites from canonical config
- ✅ Hub data sync (questionnaire + archetypes)
- ✅ 18-month recurring contracts via Bonsai
- ✅ Monthly check-in cadence (Justin↔dealer)
- ⚠️ Published pricing tiers on beardedgingerdesigns.com — TBD (priority #1 deliverable)
- ⚠️ Channel-platform participation fee (Terraplex pays?) vs. dealer site build fee (dealer pays) — separation TBD per decision log entry 2026-05-02
- ⚠️ Trade-show support package (committed to Josh on 2026-05-01) — TBD
- ⚠️ AI-generated marketing materials inside dealer portal — discussed with Jack & Josh, not yet built

## Open documentation gaps

Closed since first pass:

- ✅ Manager repo location — `/Users/justinlobaito/repos/site-builder-phase2`. Documented in `references/site-manager.md`.
- ✅ Scaffolding mechanism — managed via the manager app's `server/services/`, with each site as a full git repo under `sites/`. Test path includes `test-craft-build.js` so Craft CMS is in play; static HTML is the default per the manager's CLAUDE.md.
- ✅ Sync script behavior — `scripts/sync-onboarding-form.js` pushes hub `questionnaire.json` + `archetypes.json` snapshots into the public form repo at build time.

Closed in second pass (after reading `docs/dealer-onboarding.md`):

- ✅ Spoke schema lives at `hubs/terraplex/spoke/spoke.schema.json`. Validated via AJV. See per-dealer file inventory in `references/site-manager.md`.
- ✅ Approval flow is `POST /api/onboarding/submission/:id/approve`. Triggers full automated scaffolding including design-foundation skill invocation.
- ✅ Hub structure mapped in `references/site-manager.md`.
- ✅ Slug bug confirmed as a real bug, not just cosmetic. The recipe explicitly forbids domain-derived slugs ("`truss` not `truss-services-llc`"). The existing `trussservicesllc-com-com` violates the rule AND has a doubled `com`. Fix touches 5 locations per the slug-is-forever rule.

Still open:

1. **Existing-site ingestion logic.** Form says "we'll ingest content from this site on approval." `scripts/test-ingest-truss.js` exists. Implementation likely in `server/services/`. Not read yet.
2. **Iron Ridge Aerial drift.** Site exists in `sites/` but not in archetypes. Could be 7th dealer not registered, test fixture, or non-Terraplex client living in the manager.
3. **Phase 3 / hub content propagation.** `hubs/terraplex/design/propagation-v1.md` referenced in recipe. The mechanism for rolling hub updates across all dealer sites without per-dealer manual work — strategically important, not yet read.
4. **Refero integration.** `docs/refero-integration.md` not read. Refero MCPs are exposed in this AIOS session; integration likely feeds the design-foundation flow.

These gaps are productive `/level-up` candidates: each one is "research + document" work that compounds.
