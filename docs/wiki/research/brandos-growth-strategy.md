# BrandOS Growth Strategy

**Curated:** 2026-06-25 | **Source research:** 2026-05-11
**Consolidates:** brandos-30-day-growth-plan, brandos-pitch-material-v1, brandos-dealer-portal-marketing, audit-terraplex-dealers-page

How BrandOS gets from a working product with five Terraplex dealers to a productized, marketable platform. Covers the dealer-acquisition motion, the pitch assets, the landing-page audit, and the marketing-material module that turns a dealer expense into a platform feature.

> **What BrandOS is:** not a website builder — the channel-platform product, "operating system for multi-tier distribution networks." Same engine underneath every dealer site, a custom face on each. Distributors get brand control + dealer visibility; dealers get turnkey marketing + web presence; each new dealer makes the platform more valuable for the distributor. Flagship deployment is the Terraplex ag-drone dealer network. See [channel platform product](../strategy/channel-platform-product.md) and [hub-and-spoke thesis](../strategy/hub-and-spoke-thesis.md).

---

## The 30-day growth target (as of 2026-05)

Goal: **10 active dealers + Terraplex distributor = $3,100/mo BrandOS MRR** by mid-June 2026. Starting state: 6 dealers + 1 distributor = $1,950/mo. Gap: ~4 new dealers at $250/mo each. Pipeline notes: New Heights + Great River needed Base-44 migration; Truss blocked on domain transfer; Superior Drone non-responsive (kill date 5/30).

---

## The frame: a sales motion, not a marketing campaign

30-day dealer growth is a **sales motion** powered by warm relationships and Justin's HubSpot access to Terraplex's dealer universe — not a cold marketing push. The constraint is Justin's capacity (2RM day job + active client builds + evenings/weekends), so the plan leans on the highest-leverage channels and keeps pitch assets lightweight.

### Channels, ranked by 30-day plausibility

**Tier 1 — high-leverage, active (the real levers):**
| Channel | Mechanism | Status |
|---|---|---|
| **Terraplex HubSpot campaign** | Justin has admin access. Segment all active Terraplex dealers not yet on BGD; send a targeted campaign; capture replies into the existing onboarding pipeline. | Live, untapped — biggest single lever. |
| **Cherity-sourced warm intros** | 3 of 5 current dealers came through Cherity. Keep warm; coordinate the campaign with her so it complements, not competes. | Proven, primary historical channel. |
| **Justin's direct outreach** | His network produced 2 of 5 dealers. Continues alongside. | Proven, lower volume. |

**Tier 2 — referral** (medium yield). **Tier 3 — passive/inbound** (BGD published-tier page, case-study content): foundational for the *next* cycle but won't drive this one — neither asset exists yet.

The HubSpot unlock turns "name 5 candidate dealers" into "segment the universe and target a campaign" — likely a 15-40 dealer addressable list, making 5 new dealers in 30 days meaningfully achievable.

### The positioning dial: co-marketing vs. BGD-direct

Sending BGD marketing through Terraplex's HubSpot to Terraplex's dealers forces a framing choice:
- **Co-marketing** — BrandOS as a Terraplex-endorsed dealer offering. Implicit Cherity/Terraplex blessing, higher trust, but ties BGD's positioning to Terraplex.
- **BGD-direct** — BGD as a service provider, Terraplex dealers as the audience. Cleaner separation, lower endorsement.

**Resolution:** confirm with Cherity first (a 30-second coordination ask protects the channel producing most dealers). Lean co-marketing if she's on board. Pick the dial after that call.

---

## The pitch assets

The campaign vehicle is a **one-pager** (works as landing page or PDF attachment). Pricing stays off any customer-facing surface (CLAUDE.md priority — the 18-month tier model isn't published; it can live behind a follow-up page or attachment).

**One-pager spine — "A managed website for ag-drone dealers":**
> "You sell drones. You spray fields. You do not have time to be a website manager. That's what we do."

- **Proof:** five live Terraplex dealers, no two alike — Pyro Ag (forge/orange), Black Knight Drones (tactical/gold), New Heights Ag (terrain/orange), Truss Services (patriot/red), Terraplex Great River (clean/green). "Same engine underneath, custom face on every site."
- **What it doesn't cost:** your time managing a website, surprise annual hosting renewals, or sanity on Wix/Squarespace templates that look like every other dealer site.
- **Case-study assets** (Pyro, Black Knight, New Heights, Truss): currently informal proof points; embed in the one-pager rather than packaging separately.
- **Demo / talk track:** Justin runs this organically today; keep it organic for the 30-day window, templatize later.

---

## Landing page audit — fix before the campaign

The `beardedgingerdesigns.com/terraplex-dealers` page is the campaign destination. Audit findings, gated by priority:

**Must-fix before send:**
- **Finding 0 — "one-page website" copy vs. reality.** The "What's Included" list says "one-page dealer website," but current dealers are multi-page. *Resolved:* one-page-at-launch IS the standard journey — additional pages (product, location) are added over time inside the $250/mo with no upcharge; current dealers are just further along the arc. **Copy needs to say that** so buyer expectation matches what they get.
- **Finding 6 — surface the 18-month contract length** somewhere; buyers ask anyway.

**Should-fix before send:**
- **Finding 1 — add social proof:** dealer logos row, 1-2 site screenshots, a named pull quote (Kelcey/Pyro: "so far it seems to be doing well," with permission). High credibility, easy lift.
- **Finding 5 — qualify Terraplex membership** on the form ("Are you currently part of the Terraplex dealer network?") to cut noise.

**Nice-to-fix, don't gate the campaign:** platform/BrandOS positioning section (Finding 3), "Apply" vs "Get Started" framing (Finding 7), footer positioning copy (Finding 8 — currently "Subscription web design for Midwest businesses," which anchors BGD to Midwest + subscription and should be re-examined against the multi-vertical/multi-geography BrandOS thesis), and the BGD-general Plans ladder shown on a Terraplex-specific page (Finding 2).

**Parallel infrastructure (not blocking):**
- **Finding 4 — SSR / SEO.** A live fetch returned only the title + truncated meta; body content appears JS-rendered with no SSR. Organic discovery for "Terraplex dealer website" is effectively blocked. Doesn't block the HubSpot campaign (link is sent directly) but is a hidden marketing tax to fix during the productization push.

---

## The dealer-portal marketing module — expense → feature

The highest-leverage *product* insight: two dealers independently asked for the same thing, unprompted.
- **Pyro Ag** (Kelcey, 2026-05-07): marketing material outlines + trade-show guidelines.
- **New Heights Ag** (Josh, 2026-05-01): templated/pre-approved marketing assets + trade-show booth packages (10x10, 10x20).

Justin's takeaway: *"support in marketing… that's consistent across all dealers."* This confirms BrandOS Theme 7b (down-channel comms) demand from the market, and turns dealer marketing — normally a cost — into a **platform feature** that makes the whole product stickier. The portal evolves from login + basic asset access into: co-marketing templates (dealer-customizable), a campaign library with endorsement tiers, an AI-assisted dealer-personalized content generator, and a dealer-engagement dashboard. (See the matching [client opportunity audit](client-opportunity-audit.md) Terraplex items, which monetize the same build, and the [BrandOS roadmap](../strategy/brandos-roadmap.md).)

**Open design questions to resolve in the brainstorm:**
1. What's the minimum dealer-portal v1 that serves both asks (marketing assets + trade-show kit) without ballooning into the full Theme 7b spec?
2. Is "trade-show guidelines" a one-time per-dealer deliverable or a product feature (configurable template library per show)?
3. How does per-dealer template customization work without breaking manufacturer brand consistency? (Hub-controlled brand parameters; dealer-controlled regional customization, per the roadmap.)
4. Does AI-generated marketing material need its own skill, or does it fall out of `ui-ux-pro-max` extended?
5. **Pricing:** does the capability sit inside the existing dealer subscription, or is it an add-on tier? (Connects to the productized 18-month tier model.)
6. Trade-show kit scope: booth signage, brochures, spec sheets, business cards, PDF leave-behinds — which are core v1 vs. extension?

---

## How this connects to the broader system

- **HubSpot integration** (Justin has admin access) enables outbound campaigns, dealer-engagement tracking, and lead attribution back to the platform. Coordinate with Cherity before any sends.
- **Dealers migrating off Base 44** onto the BrandOS website builder is a parallel platform-growth vector, separate from net-new acquisition.
- The **Terraplex relationship** is the proof-of-concept; more distributors are expected. The future **[manufacturer tier](../strategy/manufacturer-tiers.md)** (Revolution/Russell, NC-based) is parked, not dead.
- The **[Nel partnership](../strategy/nel-brandos-partnership.md)** explores a marketing-engine layer on top of BrandOS.

## Related pages

- [Channel platform product](../strategy/channel-platform-product.md) · [Hub-and-spoke thesis](../strategy/hub-and-spoke-thesis.md) · [Manufacturer tiers](../strategy/manufacturer-tiers.md) · [BrandOS roadmap](../strategy/brandos-roadmap.md)
- [Client opportunity audit](client-opportunity-audit.md) — Terraplex dealer-marketing items, same build
- [Market landscape](market-landscape.md) — pricing benchmarks and the productized-tier model
- [Nel BrandOS partnership](../strategy/nel-brandos-partnership.md) — marketing-engine layer
