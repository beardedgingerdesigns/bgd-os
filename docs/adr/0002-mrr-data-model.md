# ADR 0002 — MRR data model

**Status:** Accepted
**Date:** 2026-05-19
**Decision-makers:** Justin Lobaito

## Context

The AIOS UI (see [ADR 0001](0001-aios-ui-architecture.md)) needs to render a Monthly Recurring Revenue rollup on the Home screen and per-Client MRR on Client pages.

The pre-existing `clients.yaml` modeled the contract loosely:

- A free-form `contract:` string per Project: `"$400/mo Bonsai"`, `"$250/mo Bonsai"`, `"$200/mo Bonsai (billed to NPS)"`
- Many Projects had no `contract:` field at all
- BrandOS dealer subscriptions (Pyro Ag, Black Knight Drones, New Heights, Great River, Truss) generated real recurring revenue but were not modeled as Projects in `clients.yaml` — they lived in Justin's auto-memory as a paragraph: *"BrandOS now = distributor ($600) + dealers ($250 std / BK $100). Current BrandOS $1,700/mo; BGD total ~$4,600/mo."*

For an MRR widget to be both correct and maintainable, three questions had to be resolved:

1. How is the dollar amount stored?
2. Which Projects count toward the rollup?
3. What are dealer subscriptions in the domain model?

## Decision

### 1. Structured numeric field next to free-form prose

Each Project that has recurring revenue carries a `mrr_monthly` field — a structured integer (or decimal) in USD per month.

```yaml
projects:
  - slug: inside-out-website
    name: Website redesign
    status: active
    contract: "$400/mo Bonsai"        # free-form, human-readable, kept for context
    mrr_monthly: 400                  # structured, summed by MRR rollup
```

Projects without `mrr_monthly` contribute zero to MRR rollups. The free-form `contract:` field is preserved for human-readable context (billing platform, payment terms, special notes); the UI never parses it for revenue math.

### 2. MRR scope: paying-bucket only, active-status only

The MRR rollup sums `mrr_monthly` across all Projects matching BOTH:

- `clients[*].bucket == "paying"`
- `projects[*].status == "active"`

Excluded:

- All Projects under `bucket: prospects` Clients (no revenue today by definition)
- All Projects under `bucket: internal` Clients (`bgd-hq` — strategic work, no revenue)
- Projects with `status: paused | done | archived` regardless of Client bucket

When a prospect Client signs, the `bucket:` value flips from `prospects` to `paying` and the Client's revenue starts counting toward MRR. (Cardinality: this is a deliberate "single switch" — `bucket` is the only field that needs changing.)

### 3. BrandOS dealer subscriptions modeled as Projects

Each dealer subscription is its own Project entry in `clients.yaml`, not nested as a sub-line under `terraplex-hub`. This keeps the data model uniform — every line of recurring revenue is a Project — and lets the UI sidebar / Client page surface each dealer as a navigable entity with its own contacts, docs_paths, and (eventually) wiki.

Current dealer roster to onboard:

| Project slug | Dealer | mrr_monthly |
|---|---|---|
| `terraplex-distributor` (rename from `terraplex-hub`) | Terraplex Ag | 600 |
| `pyro-ag` | Pyro Ag | 250 |
| `black-knight-drones` | Black Knight Drones | 100 |
| `truss-services` | Truss Ag Services | 250 |
| `great-river` | Terraplex Great River | 250 |
| `new-heights-ag` | New Heights Ag | 250 |

Open question: do these dealers live under the **`terraplex`** Client (because that's the platform they sit on) or under a separate **`brandos-dealers`** Client (because BGD invoices each separately)? Resolution deferred to the `/onboard-client` runs that actually add them. The clean answer is probably: they live under whatever Client gets the invoice on their Bonsai contract. If each dealer is invoiced directly by BGD, each could be its own Client with one Project — but that creates more sidebar nesting than makes sense for tiny single-line entities. Justin's call when onboarding.

Alternatives rejected:

- **`subscriptions:` array nested inside `terraplex-hub`** — kills sidebar drill-down for dealers; harder to add per-dealer docs_paths later.
- **Top-level `revenue.yaml` ledger parallel to `clients.yaml`** — parallel data structures drift. The whole point of `clients.yaml` is to be the canonical registry.

## Consequences

### Positive

- **MRR math is correct.** Today's free-form `contract:` field implied ~$1,250/mo (the projects that had it set). After this migration, MRR reflects actual reality (~$2,950/mo from named contracts, closer to $4,600/mo if all unregistered clients are onboarded).
- **The data model is uniform.** Every dollar of recurring revenue is a Project. Adding a new client or a new subscription line is the same operation (add a Project to a Client).
- **The UI is dumb.** It sums `mrr_monthly` where bucket + status match. No regex parsing, no AI extraction, no inference. Trivially testable.
- **`contract:` stays as documentation.** Free-form notes about billing platform, payment terms, special conditions ("billed quarterly," "% of revenue," "discount through 2026-12") live in `contract:` where humans can read them. The dollar number lives elsewhere.

### Negative / accepted trade-offs

- **One-time data migration required.** Every existing Project with revenue needs an `mrr_monthly:` value added. ~30 minutes of structured YAML editing. Pre-v0 task.
- **Five new Projects to onboard** for BrandOS dealers. Best done via `/onboard-client` to get full registration (contacts, docs_paths, memory file). ~5-10 minutes per dealer.
- **`contract:` field is now decoupled from the dollar number.** If they ever drift (e.g., contract says `$400/mo` but `mrr_monthly: 450`), there's no automatic check. Mitigation: occasional manual audit, possibly a lint pass that flags mismatches.
- **Non-recurring revenue is not modeled.** One-time fees, setup fees, project-based work paid as a lump sum — none of these have a home in this data model. Out of scope for v1. If needed later, add a separate `one_time_revenue` field or a separate revenue category.

### Reversibility

| Decision | Cost to reverse |
|---|---|
| Structured field → regex parse | Low. Drop the field, write a regex. |
| Paying-only scope → include prospects | Low. Change the filter condition. |
| Dealers as Projects → nested subscriptions | Medium. Move dealer entries; lose any docs_paths / contacts already added. |

All low-to-medium cost — this ADR documents the choice but is not particularly load-bearing in terms of long-term lock-in.

## Open follow-ups

- **Data migration:** add `mrr_monthly:` to existing Projects with revenue (Inside Out, ToneQuest, IowaEverywhere, Partners For Sight, future Wild Rose / Thermal Kitchen if they're on retainer). Pre-v0 task.
- **Dealer onboarding:** run `/onboard-client` for each of the 5 BrandOS dealers Justin listed. Resolve the "under terraplex Client vs. own Client" question per dealer.
- **Rename consideration:** `terraplex-hub` Project may want to be renamed to `terraplex-distributor` or similar once the dealer migration work is no longer happening inside it. Cosmetic; not load-bearing for the data model.
- **Other unregistered Clients/Projects:** Justin mentioned "there are other clients and projects I need to onboard." Those get standard `/onboard-client` treatment with `mrr_monthly` set from the start.

## Cross-references

- [CONTEXT.md](../../CONTEXT.md) → MRR, Client, Bucket, Project, Subscription line
- [ADR 0001 — AIOS UI architecture](0001-aios-ui-architecture.md)
- `clients.yaml` — the canonical registry where these fields land
