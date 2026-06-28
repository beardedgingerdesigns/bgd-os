# BGD Engagement Tiers for Manufacturers

> **Audience and scope note (2026-05-03).** This doc is BGD's existing-offering thinking, written before the channel-platform product was reframed as a separate company. It treats Terraplex as a "manufacturer hub" customer, but in the new framing Terraplex is the **distributor** in a manufacturer-distributor-dealer chain. Terminology and pricing here do NOT match the channel-platform product.
>
> For the channel-platform product (the new thing Russell is being introduced to), see:
>
> - `references/channel-platform-product.md` — strategic / customer / founding terms
> - `references/hub-and-spoke-thesis.md` — architecture explainer (manufacturer-prospect leave-behind)
> - `references/revolution-leave-behind.md` — Russell-specific deliverable
> - `decisions/log.md` 2026-05-03 entries — pricing posture and framing decisions
>
> This doc stays useful as internal pricing reference for **direct BGD client work outside the platform** (Wild Rose, Inside Out, ToneQuest, Iowa Everywhere pattern). Don't grab it for manufacturer-prospect conversations about the platform; you'll mix audiences and pricing models.

---

How we work with manufacturers, in three tiers. Each escalates from vendor relationship to technical partnership. The fit question is where your operations sit today, not where they will be in two years. Tiers compound. Start at Tier 1, grow into Tier 2 or 3 as the relationship matures.

---

## Tier 1 — Marketing Site

**For:** Manufacturers whose primary web presence is a credible, modern marketing surface.

**Included:**
- Single Craft CMS site, fully managed
- Brand-aligned design and copy direction
- Hosting, monitoring, SSL, security maintenance
- Form handling and lead routing
- Quarterly content refreshes (~2-3 hours)
- Monthly check-in call

**Not included:**
- Dealer or distributor sites
- Backend integrations beyond standard form-to-email
- Operational data surfacing

**Investment:**
- One-time build: $8K-15K depending on scope and content readiness
- Recurring: $300-500/mo
- Contract: 18-month minimum

**Fit signal from a manufacturer:** *"We need a great site that reflects who we are."*

---

## Tier 2 — Channel Platform (Hub + Spoke)

**For:** Manufacturers with a dealer or distributor network where brand consistency, content propagation, and dealer-level differentiation all matter at the same time.

**This is the Terraplex model. It is in production today.**

**Included:**
- Manufacturer hub site (everything in Tier 1)
- Schema-driven dealer onboarding flow (built; works today)
- Per-dealer spoke sites generated from hub-canonical content
- Hub-to-spoke content propagation (update a product spec once, every dealer site updates)
- Per-dealer visual differentiation (six archetype design themes; no two spokes look identical)
- Dealer portal: marketing assets, sales sheets, training material, gated content
- New dealer onboarded in 1-2 weeks via the schema-driven flow
- Quarterly platform reviews

**Not included:**
- Operational data integration (Tier 3)
- White-label SaaS for dealer self-service (Tier 3)

**Investment:**
- One-time build: $25K-50K (hub + onboarding system + first spoke)
- Recurring: $1,500-3,000/mo (manufacturer hub + platform management)
- Per dealer: $250-500/mo subscription (productized; charged to dealer or bundled by manufacturer)
- Contract: 18-month minimum

**Fit signal from a manufacturer:** *"We need our distributors and dealers to look consistent, propagate our messaging without us chasing it, and onboard quickly."*

**Reference network today:** Six dealer spokes (Pyro Ag, Black Knight, New Heights, Great River, Truss Services, Superior Drone). $1,350/mo dealer subs + $600/mo manufacturer hub. Onboarding average: 1 week from contract to live site.

---

## Tier 3 — Operational Platform (Software Engagement)

**For:** Manufacturers with operational data (telemetry, ERP, CRM, BOM, fleet) they want to surface to dealers, customers, partners, or the public as a competitive advantage.

**Included:**
- Everything in Tier 2
- Cloud data integration into customer-facing surfaces (AWS, Azure, GCP, on-prem APIs)
- Live metrics on hub and spoke sites (acre counter, USA-made percentage, fleet stats, regional impact)
- Customer dashboards (per-fleet-owner logins with operational visibility)
- Partner / dealer portals with shared operational data
- Eventual: parts and service self-service, fleet management UI, certification tracking
- Dedicated technical lead, beyond standard account management

**Not included:**
- We do not replace your ERP. We pipe data from it to where it adds public, partner, or customer value.
- We do not own your data infrastructure. We integrate with it.

**Investment:**
- One-time build: $50K+ (highly dependent on integration scope and data readiness)
- Recurring: $3,000-8,000+/mo
- Contract: 24-month minimum

**Fit signal from a manufacturer:** *"We have data sitting in cloud systems that should be doing more for us. Our customers, dealers, and prospects should be able to see it where it matters."*

---

## Marketing services overlay (Tier 2 and Tier 3)

The platform handles technical infrastructure. Most manufacturer-distributor-dealer engagements also need creative and marketing execution that the platform alone doesn't deliver. We layer those through curated specialist partners. The platform creates the consistent operational backbone that makes marketing services productizable for the first time.

### Spoke-level (per-dealer)

Available as bundled or a la carte at Tier 2 and above:

- Brand identity refinement (logo, color systems, typography)
- Marketing collateral design (sales sheets, brochures, business cards)
- Video production (product demos, trade show loops, testimonials)
- Trade show support (booth design, signage, marketing-package planning — already a stated need from New Heights)
- Digital advertising placements (regional, local)
- PR and community marketing
- Local social-content cadence

Typical engagement: $500-2,500/mo per dealer for ongoing marketing services on top of platform fees. Project-based engagements (single video shoot, trade show package) priced per scope.

### Hub-level (manufacturer-tier)

Available at Tier 2 and above:

- Cross-dealer campaign coordination
- Shared asset libraries (videos, photography, press kits)
- Manufacturer-level press and trade-show coordination
- Annual marketing planning across the dealer network
- Brand consistency enforcement across spokes (the marketing-execution equivalent of platform content propagation)

### Delivery model

Specialist partners are brokered, not bundled. Manufacturers and dealers can opt in or out of marketing services without affecting platform participation. This preserves the "curated specialists, not bundled agency" model and keeps each layer accountable to its own deliverables.

The marketing services layer is the natural complement to the platform: BGD owns the technical infrastructure that makes the network operate consistently, marketing partners own the creative execution that makes each spoke distinctive in its market.

---

## How to read this

Most manufacturers self-identify in 30 seconds.

| You say | You're in |
|---|---|
| "We just need a great site." | Tier 1 |
| "We need to manage our network and propagate brand consistently." | Tier 2 |
| "We have data we want to leverage as a competitive advantage." | Tier 3 |

Most clients evolve. Starting at Tier 1 and growing into Tier 2 or 3 is normal and supported. The underlying architecture is built for it.

---

## Notes for internal use (not for the leave-behind)

- Numbers are anchors, not quotes. Adjust per opportunity.
- Tier 2 numbers reference Terraplex actuals. Tier 1 anchors against the existing Inside Out / Iowa Everywhere / Co-Line bands. Tier 3 is more uncertain — the only honest answer until we scope the data integration is "depends."
- Tier 3 is where the productized tier dramatically expands MRR potential. It is also where engagement risk is highest. Don't quote it without scoping.
- Use the "fit signal" lines as conversation starters with a prospect. Let them self-identify before you propose.
- Marketing services overlay is intentionally generic ("specialist partners"). The likely first partner is Liebl Marketing Group (Jon Liebl), but commercial structure is undecided pending Jon's input. Don't name LMG in client-facing materials until that's resolved. See `decisions/log.md` 2026-05-02 entry on marketing-layer packaging.
