[]()# The Channel Platform: Hub and Spoke Architecture

The architecture behind a working multi-tier channel platform. Vertical-agnostic. Operates today at the distributor and dealer tiers; the manufacturer tier is the next architectural step. Revolution Drones is the founding manufacturer customer.

This doc explains how the platform works. For strategic / customer / founding-terms framing, see `channel-platform-product.md`. For the Revolution-specific phased project plan, see `revolution-project-plan.md`.

---

## What's already operating

A working multi-tier channel platform. The bottom two tiers are running in production today.

**What's running:**

- **One distributor hub** (Terraplex) operating as the canonical-content source for its dealer network
- **Six live dealer sites** in production: Pyro Ag, Black Knight, New Heights, Great River, Truss Services, Superior Drone
- **Schema-driven dealer onboarding** at `terraplex-onboarding.netlify.app` — new dealers go from contract to live site in roughly one week
- **Six visual archetype themes** ensuring no two dealer sites look the same
- **Manager app in production** managing multiple sites, with active deployment, edit, and review pipelines

**What's in active build:**

- Phase 3 hub-to-spoke content propagation (currently human-mediated; automation in development)
- Phase 5 multi-tenant client access (architecture in active design)

The platform shipped Phases 1-4 (POC, multi-site management, deploy/review flow). The build pipeline is operational; the architecture is being shaped manufacturer-first as we go, which is the founding-customer advantage.

What's missing: the manufacturer tier above. Revolution Drones is the natural founding manufacturer because the architecture is already shaped around the GTEEX Revolution to Terraplex to dealer-network distribution chain.

---

## The architecture

Three tiers. Hub-and-spoke at every level above the bottom.

```
                    [MANUFACTURER HUB]
                            |
                            |  hub-canonical content
                            |  (specs, brand, compliance,
                            |   data, news)
                            |
        +---------+---------+---------+---------+
        |         |         |         |         |
   [Distributor] [Distributor] ... [Distributor]
        |         |                   |
        v         v                   v
   [Dealers]  [Dealers]          [Dealers]
     spokes     spokes             spokes
```

### What the manufacturer hub holds

- Product portfolio (specs, manuals, certifications, sell sheets)
- Brand assets (logos, imagery, video, photography)
- Compliance and regulatory copy (single source of truth, propagates everywhere)
- Pressroom, news, company story, mission positioning
- Operational data integration (cloud data surfaces here first, propagates to spokes)

### What the distributor hub holds

- Distributor-branded site (their identity, their CTA)
- Filtered product subset (each distributor's segment of the manufacturer's portfolio)
- Regional certifications and contact details
- Dealer-onboarding flow (the schema-driven form that scaffolds new dealer sites in 1-2 weeks)
- Marketing-asset library (manufacturer-canonical, distributor-curated)

### What the dealer spoke holds

- Dealer-branded site (their identity, their CTA, their archetype design theme)
- Local product variants (regional pricing, regional availability)
- Local case studies, testimonials, photography
- Lead capture forms that route back to the dealer with attribution flowing up to distributor and manufacturer

### The compounding value

- Update a spec sheet once on the manufacturer hub. Every distributor and dealer site reflects it instantly. No chasing.
- Onboard a new distributor or dealer in 1 week using the schema-driven flow.
- Operational data surfaces on the manufacturer hub AND every distributor and dealer spoke automatically.
- Compliance copy (export controls, FAA Part 107 reminders, EPA notices) propagates without per-site manual edits. Critical for regulated work.

---

## The full platform stack

Each manufacturer engagement has three layers. Two are mandatory above the entry tier. One (data integration) is optional based on engagement scope.

```
                    [MANUFACTURER HUB]
                            |
        +-------------------+-------------------+
        |                   |                   |
    [PLATFORM]      [MARKETING SERVICES]   [DATA INTEGRATION]
    (the product)   (specialist partner)   (advanced tier)
        |                   |                   |
        v                   v                   v
    Hub + spoke         Cross-tier         Live cloud metrics
    Schema-driven       campaigns          Customer dashboards
    Content             Shared assets      Partner portals
    propagation         Per-spoke          Service / parts UI
    Hosting / security  marketing
                        Trade-show support
```

**Platform layer.** Technical infrastructure. Hub site, distributor onboarding flow, dealer onboarding flow, content propagation, schema-driven config, hosting, security. The operational backbone.

**Marketing services layer (specialist partner).** Creative and marketing execution at every tier. Brokered through curated specialists rather than bundled into an agency. The platform layer makes this layer economical because the underlying operations are already standardized.

**Data integration layer.** Cloud data surfaced to customer-facing systems. Live metrics, customer dashboards, partner portals. Optional and engagement-specific.

The layers are independent. A manufacturer can engage the platform layer without marketing services, or vice versa. The most common engagement uses both.

This layered model is intentional. Each layer has its own owner, its own deliverables, and its own pricing. No bundled agency overhead. No junior-staff churn. No responsibility ambiguity. Specialists curated by trusted relationships.

---

## Why hub-and-spoke wins for multi-tier distribution

### Brand consistency stops eroding

Every multi-tier network suffers brand drift through the chain. Manufacturer ships brand guidelines, distributors interpret loosely, dealers improvise. By the time a customer sees a dealer site, the brand is a fraction of the original. Hub-and-spoke architecturally enforces consistency without lawyers.

### Onboarding velocity scales

New distributors and dealers join via schema-driven flow. Sites scaffold in days, not months. Cost-per-onboarding drops from agency hours to software economics.

### Compliance enforcement is structural

Regulatory updates (FAA, EPA, export controls, FDA) propagate from the hub to every site instantly. One edit eliminates one entire class of legal exposure across the network.

### Operational data becomes leverage

Manufacturer-level cloud data (telemetry, fleet stats, sustainability metrics) becomes marketing leverage at every tier. Data that today sits unused becomes competitive advantage at the customer touchpoint.

### Distribution fragmentation becomes leverage

Multi-channel distribution (direct, OEM, military, international, etc.) is a control problem when each channel runs its own infrastructure. Hub-and-spoke turns fragmentation into a leverage point. Each new channel is a new spoke, not a new project.

### Marketing services become economical

Specialist partners (video, brand work, trade-show, ad placement) plug in as a layer. The platform creates the operational consistency that makes per-tier marketing services productizable for the first time.

---

## What this isn't

- **Not a website builder.** The website is the visible surface; the platform underneath is the operational layer.
- **Not enterprise SaaS.** Pricing and architecture are mid-market by design. Enterprise tools (Zift, ZINFI, Channeltivity) cost $50K+/year and serve a different customer profile.
- **Not all-or-nothing.** Each tier and each layer can be engaged independently. The architecture supports growth.
- **Not vertical-locked.** The platform is vertical-agnostic. Going to market is vertical-by-vertical commercially, but the underlying infrastructure does not fork per vertical.

---

## Decision questions for a manufacturer prospect

These questions surface whether the platform fits a given manufacturer.

1. Do you have multiple distribution channels today (direct, distributors, OEM, military, international)? If only one, the platform may be overkill.
2. Where does your operational data live, and what's the appetite for surfacing it customer-facing?
3. Who internally owns brand consistency across the network today, and how is it enforced? If "no one," that's the gap we fill.
4. How long does it take to onboard a new distributor or dealer to your brand standards today?
5. What's your current setup costing in agency hours, internal coordination, and legal review of inconsistent compliance?

If three or more of these point to active pain, the platform is a fit. If they don't, it isn't, and we should be honest about that rather than push-fit.

---

## Suggested path forward (founding manufacturer)

Three phases plus expansion. The full sequencing for the Revolution case is in `revolution-project-plan.md`. Generic outline:

1. **Manufacturer hub website.** Visible surface. ~6-8 weeks. Standalone deliverable.
2. **Manufacturer tier integration.** Wires the manufacturer hub into the existing distributor + dealer infrastructure. Content propagation, brand library, compliance management. ~10-12 weeks.
3. **Operational data integration.** Cloud data flows across the network. Discovery first, then phased build.
4. **Network expansion.** Additional distributors come online as the network scales.

Founding manufacturer commitments: locked-in pricing for 36 months, quarterly roadmap input, co-marketing rights, first-mover feature access. See `channel-platform-product.md` for the full founding-customer framework.

---

## Internal notes (not for leave-behind)

- The thesis depends on the prospect actually having multiple channels. If a manufacturer has only one distribution path and no plan to expand, Tier 2+ is overkill. Tier 1 is the right answer.
- Manufacturers may resist the "platform" framing if they see themselves as the makers of their physical product, not as a software company. The pitch is "you don't have to become a software company. We are the software company. You stay focused on building [product]."
- Mission-aligned brand positioning (veteran-employing, American-made, family-owned, faith-based, etc.) should be treated as load-bearing brand commitment, not marketing copy. Every reference in any deliverable should reflect that.
- The decision questions above are also a self-check for us. If we can't answer "yes, three or more apply" for a given prospect, we shouldn't push-fit. Better to know early.
