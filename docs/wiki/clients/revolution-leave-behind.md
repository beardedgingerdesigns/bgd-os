---
client: revolution
project: brandos-phase1
type: brief
---
# The Channel Platform

*Revolution as the founding manufacturer tier*

**For Russell Hedrick · Revolution Drones**

---

Multi-tier distribution networks all face the same compound problem: brand and operations degrade at every tier. By the time a customer reaches a dealer two tiers below the manufacturer, what they see is a fraction of the actual brand. Marketing assets are stale. Compliance copy is inconsistent. Operational data the manufacturer has invested in generating sits invisible to the people closest to the buyer.

We've built a platform that reverses this. The bottom two tiers — distributor and dealer — are running in production today, with Terraplex and six dealer sites live. Revolution is the missing top tier.

## The architecture

```
                    [ MANUFACTURER HUB ]
                       Revolution Drones
                              │
                              │  hub-canonical content
                              │  propagates down
                              ▼
        ┌─────────────────────┼─────────────────────┐
   [future distributor]  [DISTRIBUTOR HUB]  [future distributor]
   military / mapping       Terraplex          additional
      international         live today           channels
                              │
                              ▼
   ┌──────────┬──────────┬──────────┬──────────┬──────────┐
   │ Pyro Ag  │  Black   │   New    │  Great   │  Truss   │  Superior
   │          │  Knight  │  Heights │  River   │ Services │   Drone
   └──────────┴──────────┴──────────┴──────────┴──────────┘
                       six live dealer spokes
```

Hub-canonical content (product specs, brand assets, compliance language, operational data) flows from manufacturer through distributor to dealer. Each tier owns its own identity, voice, and CTA. Update once at the top — every site below reflects it. Each new distributor or dealer is a new spoke, not a new project.

---

# Not a pitch. A working platform.

The platform isn't theoretical. It has paying customers, a working onboarding flow, and a build pipeline with active deployment. Two tiers are live; what we're proposing is wiring Revolution in as the third.

## What's running today

- **Six live dealer sites** in production, each with a distinct visual identity
- **One distributor hub** (Terraplex) operating as the canonical-content source for those dealers
- **Schema-driven dealer onboarding** at `terraplex-onboarding.netlify.app` — new dealers go from contract to live site in roughly one week
- **Six visual archetype themes** ensuring no two dealer sites look the same
- **A working manager app** running in production, used to onboard, edit, and deploy sites

## Live dealer sites you can look at right now

- **Pyro Ag** — Forge archetype, dark theme, orange accent
- **Black Knight Drones** — Tactical archetype, geometric, gold accent
- **New Heights Ag** — Terrain archetype, alternating sections, topographic textures
- **Great River** — Clean archetype, light, B2B integrator feel
- **Truss Services + Superior Drone** — most recent additions, onboarded through the schema-driven flow

## Honest about what's still being built

Hub-to-spoke content propagation is in active build today. Multi-tenant client access is the next layer after that. Both are designed manufacturer-first — meaning Revolution as founding manufacturer shapes the architecture as it goes in, rather than retrofitting later. That's the founding-customer advantage.

---

# Compounding advantages, not features

Each of these solves a problem mid-market manufacturers either accept or pay an agency to manage. Each one compounds — you get all of them at once when you're the manufacturer tier.

## Brand consistency stops eroding

Revolution updates the R-32 spec sheet once. Terraplex's distributor site reflects it. Every dealer site reflects it. No chasing, no version drift, no "did they actually update it?" Six dealers today, twenty-five next year — same effort. This is the single biggest cost a manufacturer in your position pays today, and most don't measure it because it's diffused across a dozen agency invoices and a hundred internal Slack threads.

## AWS operational data becomes marketing leverage

Live acre counters. Aggregate USA-made percentages. Fleet stats. Sustainability metrics. Today this data sits in AWS, available to Revolution but invisible at the dealer touchpoint. The platform surfaces it on every site — manufacturer hub, distributor site, every dealer page — automatically. Data that's currently a cost center becomes a competitive advantage at the customer's actual point of decision.

## Compliance enforcement is structural

FAA Part 107 reminders, EPA notices, export controls, military specifications. Edit once at the manufacturer hub; every site in the network is compliant within minutes. One edit eliminates one entire class of legal exposure across the network. This matters more for a drone company than almost any other vertical.

## Multi-channel distribution becomes leverage instead of fragmentation

Revolution already has more than one channel: Terraplex serves agriculture, but military procurement, mapping integrators, and international are clearly on the roadmap. In the current world, each new channel is a new project, a new agency, a new infrastructure decision. In the platform model, each new channel is a new distributor spoke under Revolution's hub. The architecture is built for it.

## Mission-aligned positioning is structurally protected

Veteran employment. American-made. Russell's voice. The reason a Revolution drone exists. Today these positions are load-bearing for Revolution's brand but they survive at the dealer level only by goodwill. The platform makes them part of the propagation contract — every site carries them, current and accurate, by default. This is brand commitment as infrastructure, not as marketing copy.

---

# Three phases. The first one stands alone.

None of this requires a multi-year commitment up front. Phase 1 is a real deliverable — a manufacturer hub site Revolution would want regardless. Phase 2 and Phase 3 compound the value but neither is required to make Phase 1 worthwhile. Each phase is its own decision.

## Phase 1 — Manufacturer hub website

The visible surface. Revolution-branded site, full product portfolio, brand and compliance content centralized. Includes a working demonstration: a spec change at the Revolution hub propagates to a Terraplex dealer site. That demo is what proves the platform tier exists, not just the website. Standalone deliverable — if Revolution stops here, you have a great manufacturer site.

## Phase 2 — Manufacturer tier integration

Wires Revolution into the existing distributor and dealer infrastructure. Brand asset library, compliance management, content propagation across the full network. Distributor-tier capability so military, mapping, or international distributors can onboard cleanly when Revolution is ready. This is where the platform earns its keep.

## Phase 3 — Operational data integration

AWS data flows across the network. Live metrics, customer dashboards, partner portals. Begins with a paid discovery sprint — what data exists, what's clean enough to publish, what's worth surfacing — before any build commits. Timing depends on Phase 2 wrap and Revolution's data-team availability.

## On founding-manufacturer terms

As founding manufacturer, Revolution shapes the platform's roadmap at the manufacturer tier and locks pricing for 36 months. The trade is: Revolution gets first-mover access, quarterly roadmap influence, and co-marketing rights; the platform gets a reference manufacturer customer that proves the model. This is product, not investment — no equity, no custom forks, no lifetime free pricing.

## On pricing

Founding-manufacturer pricing is a fixed Phase 1 build fee plus a monthly platform fee that locks for 36 months. The monthly is meaningfully below enterprise channel-marketing tools like Zift or ZINFI — this is mid-market by design. Specific numbers come back with Phase 1 scope, but the magnitude isn't a surprise: this is below $50K-a-year SaaS territory by a wide margin.

---

**Justin Lobaito · Bearded Ginger Designs**
justin@beardedgingerdesigns.com · 515.360.2172
