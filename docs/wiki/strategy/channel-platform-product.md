# BrandOS

**Operating system for multi-tier distribution networks.**

Working document for the new product / new company that emerges from the Terraplex hub-spoke work. This doc captures the vision abstracted from any specific customer. It's what the company actually builds and sells.

**Name and tagline (locked 2026-05-03):**

- **Name:** BrandOS
- **Tagline:** Operating system for multi-tier distribution networks
- **Domain status:** all common variants of `brandos.*` are squatted. Domain acquisition deferred until revenue justifies the spend. Likely first acquisition target: `brandos.ai` (Namecheap-held, more accessible) or `brandos.com` (Abion-held, premium price). Working name is in use immediately; a domain is not blocking.

## What it is

**An operating system for multi-tier distribution networks.**

Manufacturer → distributor → dealer is the dominant structure for B2B physical-goods businesses. The web infrastructure that supports it is fragmented, expensive, and slow to evolve. Most manufacturers run a single corporate site, distributors maintain their own ad-hoc presence, and dealers either fend for themselves or get neglected. Brand consistency degrades through every tier. Compliance copy goes stale. Marketing assets sit unused. New dealers take months to onboard.

The product is a single platform that makes the entire network operate as one coherent brand without requiring a manufacturer to staff up a marketing-IT department. It's tier-aware from day one. Every site in the network is real, branded, indexed, and owned by its tier — not a sub-page or iframe of the manufacturer.

## Customer targeting

Vertical-agnostic platform, mid-market manufacturer focus.

**Vertical-agnostic** means the platform doesn't bake in assumptions specific to ag drones, military equipment, or any single vertical. The same architecture serves any manufacturer with a multi-tier distribution structure. Going to market is still vertical-by-vertical commercially (you don't pitch to all manufacturers in all industries simultaneously) but the underlying platform doesn't fork per vertical.

**Mid-market focus** means we target the next tier down from enterprise manufacturers. Specifically:

- Privately held manufacturers
- 5-50 distributors and 50-500 dealers in their network
- No dedicated marketing-IT department
- Currently underserved by both enterprise SaaS (Zift, ZINFI, Channeltivity at $50K+/year) and generic site builders (WordPress, Squarespace, Wix at $20-100/mo per site)
- Decisions move fast (no committee approvals)

What this customer typically looks like across verticals:

- Specialty agricultural equipment (Revolution / GTEEX is the prototype)
- Regional industrial manufacturers (mixers, equipment, specialty machinery)
- Mid-market outdoor / sporting goods with dealer networks (specialty bikes, RVs, boats, marine)
- Building products (specialty windows, doors, roofing)
- Trade-specific tools (welding, HVAC, plumbing equipment)
- Specialty consumer goods (audio, kitchen equipment, fitness)

We do not target Caterpillar, John Deere, or Boeing. Those manufacturers have dedicated engineering and marketing teams; they buy or build different solutions. We serve the manufacturers who can't justify Zift but currently make do with a corporate website, a Brandfolder account, and a lot of email chasing.

## What it does

### Multi-tier site generation
A single CMS controls hub (manufacturer), spoke (distributor), and leaf (dealer) sites. Each tier has its own customization but pulls canonical content from above. All three are real, fully-branded sites with their own URLs, SEO, and analytics.

### Schema-driven onboarding
New dealers and distributors onboard via a public form. The form maps directly to canonical site configuration. Sites scaffold in days, not months. Onboarding the 7th dealer is the same effort as onboarding the 1st.

### Hub-down content propagation
Update a product spec, brand asset, or compliance disclaimer once at the hub. Every tier reflects the change automatically. No chasing. No manual updates. No drift.

### Bottom-up data flow
Form submissions, leads, and customer interactions at the dealer level route up through the hierarchy with proper attribution. The manufacturer sees aggregate signal. The distributor sees regional signal. The dealer sees their own.

### Brand asset library
Approved imagery, video, sell sheets, manuals, certifications, regulatory documents all live at the hub. Distributors and dealers pull from it on demand. Always current. Single source of truth.

### Compliance and regulatory copy management
Edit once at the hub. Propagates everywhere. Critical for regulated industries (FDA, FAA, EPA, export controls). Reduces legal exposure structurally rather than through manual policing.

### Operational data integration
Cloud data (telemetry, ERP, CRM) surfaces to customer-facing systems at any tier. A live "acres sprayed" counter on every dealer site, automatically. Manufacturer data becomes marketing leverage without manual work.

### Per-tier portal
Manufacturer portal, distributor portal, dealer portal. Different permissions, same architecture. Each tier manages what it owns and sees what's relevant to it.

### Multi-archetype design system
Each spoke gets a distinct archetype + accent combination. No two sites look identical even within the same network. Brand consistency at the manufacturer level, distinctiveness at the dealer level.

### Marketing services overlay
Specialist partners (creative, video, ad placement, trade-show production) plug in as a layer on top of the platform. Not bundled. Curated. Manufacturers and dealers opt in or out per engagement. Anti-agency by design.

### AI-assisted marketing material generation
Dealers can generate marketing materials (banners, sell sheets, ad creative) using templates that respect brand guidelines. Hub-controlled brand parameters, dealer-controlled regional customization.

## What makes it different

### Competitive landscape

| Tool | What it is | Why it isn't this |
|---|---|---|
| WordPress / Squarespace / Wix | Single-site builders | No hierarchy. No multi-tier awareness. |
| Shopify | Ecommerce platform | Sells products, not channel marketing. |
| Brandfolder / Frontify | Brand asset management | Assets only. No sites generated. |
| Where2GetIt / dealer locators | Map widgets | Just maps. Dealer has no real site. |
| Zift / ZINFI / Channeltivity | Enterprise channel marketing SaaS | CRM-adjacent. Heavy. Configurable but not generative. Expensive enterprise pricing. |
| White-label site builders | Generic multi-tenant CMS | Feature-bloated. Not channel-aware. Not tier-hierarchical. |

### What we do that none of them do

1. **Hierarchical from day one.** Manufacturer, distributor, dealer are first-class concepts in the data model and onboarding flow. Most tools serve one tier well. This serves three simultaneously.
2. **Real sites, not widgets.** Dealers get their own URL, branded, indexed by Google, owned by them. They appear in search. They have analytics. They convert.
3. **Schema-driven everything.** Onboarding form maps directly to canonical config. Hub data structures the entire network. Customization is bounded but real.
4. **Curated specialist services on top, not bundled.** Don't pay for video producers you don't need. Marketing services are a layer, not a feature.
5. **Built for B2B distribution networks specifically.** Not adapted from a generic CMS or repurposed agency tooling.
6. **Software economics.** Onboarding a dealer costs the platform owner roughly the same as a self-serve SaaS signup. Not the $5-15K of agency time it would normally cost.
7. **Mission-aligned brand positioning is load-bearing.** Veterans, American-made, family-owned, faith-based — these can be enforced consistently across the network from a single hub edit.

## The moat (what's actually defensible)

*Articulated 2026-06-19, out of the Nel "sprocket-maker vs sprocket" debate + the advisory board. Decode of the metaphor: the "cow" / "sprocket maker" is the repeatable engine that turns a business's domain knowledge into a working AI product; each app it produces (a dealer portal, a website builder) is a "sprocket" / "golden egg." Nel's instinct that the engine is the asset is right; his conclusion (guard the method as a secret, spin up many cheap apps) is wrong about where defensibility lives.*

**The moat is NOT the build method.** "Ingest domain knowledge → synthesize with an LLM → generate a tool" is becoming table stakes. It is not a defensible secret, it can't be hidden, and the whole industry is converging on it. Pricing or pitching as if the engine is the crown jewel is a losing game, and over-explaining how it works in a demo trains your replacements.

**The moat is method × domain access — three layers that are genuinely hard to copy:**

1. **Domain depth.** The multi-tier distribution workflow encoded in the data model and the schema-driven onboarding. Manufacturer / distributor / dealer as first-class concepts, the propagation rules, the tier-aware permissions. A competitor can buy the same AI engine; they can't shortcut the encoded understanding of how these networks actually operate.
2. **Switching costs.** Once a distributor runs their whole dealer network on BrandOS — sites, assets, compliance copy, lead flow — ripping it out is painful and disruptive. Stickiness compounds per dealer onboarded.
3. **Trust and access.** The relationships and the plain-language translation that get Justin in the room. This is the BGD edge that the engine alone never reproduces.

**Pricing + pitch implication.** Price on the value of the encoded domain, the switching cost, and the recurring outcome — not on hours and not on "we use AI." Package the outcome, not the recipe. The engine is *how* you got there, not *what* you sell. Widen from this proven niche later; don't dilute it by spraying the engine across easily-cloned apps now.

## Who pays and why

Three customer types, three distinct value propositions.

### Manufacturer
**Pays for:** Brand consistency at zero ongoing effort. Faster distributor and dealer onboarding. Operational data surfaced as competitive advantage. Regulatory compliance enforced structurally.

**Why they sign:** They can't do this with their current team. Building it internally would cost a year of engineering and a permanent hire. Buying our platform is faster and cheaper.

### Distributor
**Pays for:** Marketing infrastructure without building it. Faster regional dealer onboarding. Leverage from manufacturer-tier brand assets without coordination overhead.

**Why they sign:** Distributors live in the squeeze between manufacturer demands and dealer reality. The platform turns that squeeze from a coordination problem into a leverage point.

### Dealer
**Pays for:** A real, branded, indexed site for less than a freelancer. Marketing materials pre-loaded. Brand assets always current. Lead capture infrastructure that works.

**Why they sign:** Most dealers either have no site, a terrible site, or pay way too much for a mediocre site. The platform gives them better than what they could afford a la carte.

## Why now

1. **AI lowers the cost of marketing-asset generation.** Per-dealer customization is economical for the first time.
2. **Composable site architectures (headless CMS, Vue, Vite) make multi-tenant generation possible at solo-dev scale.** The platform doesn't need a 50-person engineering team.
3. **Anti-agency sentiment in mid-market companies is real.** Manufacturers are tired of paying agency overhead for work specialists could do better.
4. **Vertical SaaS thesis is mature.** Customers and investors understand "we serve this specific industry deeply." Not a horizontal play; not a winner-take-all play.

## What's already built (leverage from Terraplex)

This is not a greenfield product. The Terraplex implementation is the working prototype:

- 6 dealer spokes live (Pyro Ag, Black Knight, New Heights, Great River, Truss Services, Superior Drone)
- Schema-driven onboarding form deployed at terraplex-onboarding.netlify.app
- Manager app (`site-builder-phase2`) running in production with multiple managed sites; multi-tenant client access is Phase 5 work in active design
- 6 archetype design themes with uniqueness tracking
- Hub-canonical content with manual propagation today; automated propagation is Phase 3 work in active build
- Working dealer onboarding pipeline (call → questionnaire → contract → site live in 1-2 weeks)
- Bundled `ui-ux-pro-max` skill that generates dealer-unique design foundations at scaffold time

*MRR figures and per-tier pricing are intentionally not surfaced here. They include Terraplex's confidential pricing and they reframe the platform as smaller than its strategic value justifies. Use the live dealer sites and the working onboarding URL as proof points instead.*

What's NOT yet built:
- Manufacturer tier (the third tier above distributor)
- Operational data integration (Phase 3 / Tier 3)
- Cross-network analytics
- Per-tier portal beyond rudimentary dealer-only version
- AI-driven dealer marketing material generation (in design)
- Multi-tenant access controls beyond single-operator
- White-label deployment for second platform instance (different vertical)

The gap between "what's built" and "what the product needs" is real but bounded. Roughly 6-12 months of focused work to ship v1 of the full product, depending on how much is built into a single platform vs. left as customer-specific features.

## Founding customer framework

Three customer types means three founding-customer slots. Each has different value to the platform and different terms.

### Founding Manufacturer (first 1-3)

What they get:
- **Locked-in pricing for 36 months** at "early" rate (30-50% below standard once standard pricing exists).
- **Roadmap influence.** Quarterly product input sessions. Their feedback shapes the next quarter's build.
- **White-glove implementation.** Direct Justin access for setup, integration, escalations.
- **Co-marketing rights.** Case study, logo on platform site, mutual referral pipeline, named in pitch decks.
- **First-mover feature access.** Data integration, AI tools, new tier features ship to founding manufacturers first.
- **Renewal protection.** Multi-year price guarantee at renewal.

What we get:
- Validation that the product works at the manufacturer tier.
- A real working network as a case study.
- Their distributor and dealer relationships become real spokes in the reference architecture.

### Founding Distributor (Terraplex is already this)

What they get:
- Retroactive recognition as Founding Distributor #1.
- 18-month locked pricing at current Terraplex rate ($600/mo).
- Free dealer onboarding for first 10 dealers.
- Marketing-services overlay introduction (when LMG / specialist partners layer in formally).
- Co-marketing rights at the manufacturer-tier story level.

This honors the existing relationship structurally rather than disrupting it.

### Founding Dealer (first dealers in any new network)

What they get:
- 12-month locked pricing at standard tier.
- Free initial site setup (no setup fee).
- Featured placement on the manufacturer hub.
- Marketing-services intro pricing.

### What founding customers do NOT get

- **Equity in the platform company.** Premature. Cap-table complexity for ambiguous benefit. A happy paying customer is a better outcome than a partial owner. If equity becomes part of a larger commercial conversation later (joint venture, strategic capital partner), that's a separate decision.
- **Lifetime free pricing.** No "free forever" tiers. 36-month locked pricing is generous; lifetime is unsustainable.
- **Custom feature builds without product-roadmap fit.** The platform serves all founding customers. Single-customer features are a no. Roadmap influence is real; bespoke isn't.

## Open questions

1. **Single platform or per-vertical instances?** When a second manufacturer in a different vertical signs, do they share infrastructure with Terraplex's network or get their own deployment? Affects architecture, pricing, and operational complexity.

2. **Sales motion.** Direct (Justin sells), agency-partnered (Jon-style brokers sell), or product-led (manufacturers find us, sign up via demo flow)? Probably all three over time but which leads?

3. **New company structure.** When does this spin out of BGD? Same legal entity, different brand? Separate LLC? Joint venture with Jon / LMG? Keeps BGD's marketing-site book separate from the platform play.

4. **Capital.** Bootstrapped vs. raise? The platform's economics are good (high gross margin, recurring, defensible) but a vertical-SaaS sales motion can absorb capital meaningfully if it works.

5. **Domain acquisition timing.** All variants of `brandos.*` are squatted. Acquisition deferred until platform revenue justifies the spend. First inquiry candidate: `brandos.ai` (likely $500-$5K range, Namecheap-held). `brandos.com` (Abion broker, $10K-$50K+) is the long-term target. No urgency.

6. **Who staffs the support / commercial / delivery layer as BrandOS scales?** Today it's all Justin. The Deploy Answers partners — **Alex Sdoucos**, **Nel Santiago** — are currently informal **thought partners** on BrandOS (helping flesh out the product, demo it, gather feedback). No economics or defined role. Open: what evidence moves a thought partner to a defined role (Alex on commercial/sales — coordinate with Jon, don't collide; Nel on delivery)? And if they take one, is BrandOS BGD-owned with them contracted/partnered in, or folded under Deploy Answers? Cap-table + IP diverge sharply. Overlaps Q2 (sales motion) and Q3 (company structure). See `references/deploy-answers.md` and `decisions/log.md` 2026-06-01.

### Resolved questions (kept for context)

- **Vertical-first or vertical-agnostic?** Resolved 2026-05-03: vertical-agnostic platform, mid-market manufacturer commercial focus.
- **Founding customer pricing.** Resolved 2026-05-03: framework above. No equity. Locked pricing + roadmap influence + co-marketing + first-mover feature access.
- **Naming.** Resolved 2026-05-03: **BrandOS** with tagline "Operating system for multi-tier distribution networks." See `decisions/log.md` for selection reasoning vs Brand Presence.

## What I think the pitch is, in one sentence

> *"BrandOS is an operating system for multi-tier distribution networks. Manufacturer, distributor, dealer. The whole network operates as one brand without requiring you to build the infrastructure yourself. Terraplex is the prototype. It's working. We want a manufacturer to be the first customer of the next version."*

That's the trip pitch when Russell asks "what are you working on these days?" It's not a sales pitch; it's a thesis statement.
