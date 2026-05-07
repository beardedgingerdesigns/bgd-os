# Decisions Log

Append-only record of meaningful decisions and why they were made. `/level-up` Phase 2 (Method interview) writes scoped automation specs here. You can also append manually whenever you decide something worth remembering.

**Format per entry:**

```
## YYYY-MM-DD — Short title

**Decision:** what was decided.

**Why:** the reasoning, constraints, and what would change your mind.

**Alternatives considered:** what else was on the table.

**Owner:** who's accountable.
```

Keep it terse. Future-you will thank present-you for capturing the *why*, not just the *what*.

---

## 2026-05-05 — Not going on the Russell trip; Russell outreach reframed to Phase 1 only

**Decision:** Justin is not making the May 5-6 Atlanta trip with Jon to meet Russell. Email sent to Jon at 5:00am 2026-05-05 (thread: *"BrandOS - Conversation with you leading to conversation with Russell"*). The Russell-facing path is reframed: Justin will reach out to Russell **by end of this week (~May 8)** to prep him on a **Phase 1 only** version of the BrandOS doc — manufacturer hub website, full ag product portfolio, working hub-to-dealer propagation demo. This sets the stage for future BrandOS conversations without committing Russell to the full platform thesis up front.

**Why:** Two converging signals.

1. **Justin's own readiness.** "I want to explore this more with you but I don't think I'm ready to bring it to Russell. It needs to be fleshed out a bit more." (Email to Jon, 2026-05-05.) The platform thesis is real but the pitch is not yet tight enough to hold up under Russell's scrutiny.
2. **Jon's feedback on the deck (2026-05-04).** Jon called the BrandOS materials "way too high level of a deck / pitch for Russell, Ryan, and Cherity." His ask was for a simpler frame: *what it does / why it beats current approach / what sets Terraplex apart / commitment-wise / human-power needed.* That feedback hasn't been incorporated yet.
3. **Logistics ran out.** "I waffled on this decision for too long and ultimately ran out of time to get other things in place in order to make the trip happen." Decision-by-default rather than decision-by-conviction, but the right call given (1) and (2).

**Alternatives considered:**

- *Make the trip with the existing leave-behind.* Rejected. Jon's feedback signaled the deck would not land with Russell + Ryan + Cherity. Walking in with materials that read as "too high level" risks damaging the relationship rather than advancing it.
- *Skip the Russell touchpoint entirely until materials are tightened.* Rejected. End-of-week async note keeps the relationship warm and gets Phase 1 framing on his radar so the next in-person doesn't start cold.
- *Send the full leave-behind .docx async instead of going.* Rejected by implication of the Phase-1-only reframe. Full doc is too heavy for a cold async send; Phase 1 framing is the right surface area.

**Owner:** Justin (BGD).

**How to apply:**

- The leave-behind (`references/revolution-leave-behind.md`, [docs/revolution-terraplex-dealer-network-platform.docx](docs/revolution-terraplex-dealer-network-platform.docx)) does NOT get sent or hand-delivered as-is. The Russell-facing artifact this week is a **Phase 1-only summary** to be drafted before the end-of-week outreach.
- The May 3 open follow-ups (`Phase 1 propagation demo viability`, `"25 dealers next year" one-liner`) are still open and now load-bearing for the new outreach: the propagation demo is the proof point in the Phase 1 frame Justin sent Jon.
- `references/jon-russell-brief.md` is historical (assumes Tuesday in-person). Don't cite as active.
- The fuller BrandOS pitch needs Jon's-suggested framing pass: *what it does / why better / Terraplex differentiator / commitment ask / human-power coordinator role.* This is internal-rev work for the next conversation with Jon, not the Russell outreach.
- Trip cost (~$1,500) avoided.

**Open follow-ups:**

- **Draft the Phase 1 outreach to Russell.** Target: by end of week (~May 8). Source: Phase 1 paragraph from the May 5 email to Jon.
- **Rev BrandOS materials per Jon's framing feedback** before the next Jon-Justin internal conversation. Five-question structure Jon proposed.
- **LMG / BrandOS commercial structure conversation with Jon** is now more pressing — Jon flagged a real conflict (he runs marketing/media through Springboard Advertising) AND uncertainty about his Terraplex tenure ("does this last another 6 weeks or 6 years?"). The May 2 decision on the marketing-services slot needs Jon's resolution before LMG can be named anywhere.

---

## 2026-05-03 — Platform name locked: BrandOS

**Decision:** The new product / new company is canonically named **BrandOS**, with the tagline "Operating system for multi-tier distribution networks." This is the name in all internal docs, working materials, repo names, and dev URLs going forward.

**Why:** Two finalist names — Brand Presence and BrandOS — were evaluated. Both face fully squatted domain situations. BrandOS won on three dimensions:

1. **Cleaner SaaS namespace.** No existing software product named BrandOS in the marketing-tech space (search returned only restaurant brands using "Brando's"). Brand Presence is a phrase marketers already use descriptively, increasing confusion risk.
2. **Aligns with the tagline.** "Operating system for multi-tier distribution networks" — BrandOS reinforces the OS metaphor; Brand Presence does not. Name and positioning pull in the same direction.
3. **Tech positioning over services positioning.** The product is software infrastructure, not marketing services. BrandOS reads as software (compound name, "OS" suffix). Brand Presence reads as services. Match the category we're competing in.

Trademark feasibility favors BrandOS too — more distinctive in software class, easier to defend than a generic phrase like Brand Presence.

**Alternatives considered:**

- *Brand Presence.* Rejected for the reasons above.
- *PresenceOS, ChannelPresence, Brandcraft, Brandstack, Tierline, Hubcraft, Spokely, Networkly.* Not validated; surfaced earlier as fallback options. No reason to keep exploring once BrandOS landed clean.

**Domain situation:**

- All `brandos.*` variants are squatted (.com, .io, .co, .ai, .app, .dev, .net, .tech, .studio, .biz, .us)
- `brandos.com` is held by Abion (Swedish premium-domain broker). Likely $10K-$50K+.
- `brandos.ai` is held by a Namecheap user. Potentially $500-$5K range, more accessible.
- `brandos.io` is held by a parking service. $2K-$10K range.

Acquisition is **deferred until revenue justifies the spend**. Use BrandOS as the working name immediately. First acquisition target is likely `brandos.ai` if priced reasonably; `brandos.com` is the long-term target.

**Owner:** Justin (BGD).

**How to apply:**

- All internal docs, repo names, dev URLs use "BrandOS" going forward.
- Russell trip leave-behind (`revolution-leave-behind.md`) intentionally stays name-agnostic per the May 5-6 trip strategy ("just being me" with Russell, not pitching a new company by name). The platform thesis is what matters; the name will become canonical when the platform reaches product-launch readiness.
- Trademark search and formal IP work happen when the platform takes its first customer or when revenue makes it worth the legal spend.

---

## 2026-05-03 — 2026 is a gauge year. No personal movements.

**Decision:** 2026 is a measurement year for BGD. No exit from 2RM, no major personal financial moves, no aggressive bets that depend on financial necessity. Run BGD through year-end and use the actual results to calibrate what's achievable for 2027 planning.

**Why:** The financial picture surfaced today (combined household ~$17,900/mo net, ESOP appreciating ~$130K/yr in planning case, 401k tracking past $1M long-term) means there is no financial pressure to force BGD growth or 2RM exit. Better to:

- Run the year and let actual MRR growth, productization adoption, and platform engagement signal what's real.
- Use 2026 as the baseline year for honest 2027 planning. "What did we actually do?" is a better foundation than "what do we hope to do?"
- Keep the $10K MRR target as a structural milestone (proves BGD is real) rather than a survival number.

**Alternatives considered:**

- *Pursue exit math actively in 2026.* Rejected. Premature given household income foundation; exit timing depends on ESOP appreciation window which is multi-year, not multi-month.
- *Set aggressive growth targets that require quitting 2RM to chase.* Rejected. Same logic. The financial picture supports patience over pressure.

**Owner:** Justin (BGD).

**How to apply:**

- When evaluating BGD decisions in 2026, the test is "does this strengthen the platform's structural position?" not "does this maximize this year's revenue?"
- When weighing trip costs, project decisions, productization pace: financial pressure is low. Decide on strategic merit.
- 2027 planning conversation should anchor against actual 2026 results, not 2026 projections.
- Revisit this framing at year-end 2026 once the gauge data is in.

---

## 2026-05-03 — Russell leave-behind framing aligned (web-session lessons)

**Decision:** The Russell-facing leave-behind document (`references/revolution-leave-behind.md`) is the canonical trip artifact for the May 5-6 in-person meeting. The earlier `references/revolution-project-plan.md` v2 and `references/russell-meeting-plan.md` are superseded and retired.

**Why:** A separate Claude session pressure-tested the v2 project plan and surfaced four structural issues that would have damaged the conversation if Russell had read v2 as-is:

1. **Phase 1 / founding-manufacturer mismatch.** Phase 1 was a 5-week, 3-product-page website. Industry-equivalent project value: $10-25K. Attaching 36-month locked pricing, quarterly input sessions, and co-marketing rights to that scope reads as overcommitting on a small deliverable. *Fix in the leave-behind:* Phase 1 demonstrates platform value via a working manufacturer-to-Pyro-Ag propagation demo. The demo is the load-bearing claim that justifies founding-manufacturer terms attaching to Phase 1.

2. **Overstated architectural claims.** v2 said "the content infrastructure already exists at the distributor-to-dealer layer; Phase 2 wires it up one tier higher." Wrong. Hub-to-spoke propagation is in active build, not running production. Same with "multi-tenant manager app running in production"; multi-tenant access is Phase 5 work. If Russell asked a sharp technical question, those claims would damage trust. *Fix:* leave-behind's "honest about what's still being built" framing acknowledges propagation is in active build and frames Revolution-as-founding-manufacturer as the architecture-shaping advantage.

3. **MRR as credibility was wrong (and the number was mislabeled).** Drafts cited "$4,600/mo platform MRR." That figure is actually BGD's total revenue across all clients, not the platform's. Platform-only MRR is ~$1,950/mo (Terraplex distributor hub $600 + six dealer subs $1,350). Either way, surfacing the number to a manufacturer prospect reads "side hustle" and contradicts the founding-manufacturer pricing posture (the platform is roughly the size of one Zift seat). It also shares Terraplex's confidential per-tier pricing without their consent. *Fix:* drop MRR entirely from client-facing docs. Six live dealer sites and a working onboarding URL prove the platform exists. Numbers add a wrong frame, not proof.

4. **Revolution/Terraplex governance unaddressed.** Revolution sitting above Terraplex is a real authority shift. If Revolution and Terraplex are separate operational entities, the proposal needs Terraplex's buy-in too. *Fix:* don't raise unprompted with Russell. Have answer ready if he raises it: "Revolution shapes the manufacturer-tier roadmap. Terraplex stays the operational distributor with full authority over its dealer relationships." If they're meaningfully separate, ask whether Terraplex should be at the next conversation.

**Alternatives considered:**

- *Keep v2 as-is, fix in conversation.* Rejected. The doc has to stand alone. Russell may not engage in conversation if the doc itself reads wrong.
- *Strip founding-manufacturer terms from Phase 1, sell Phase 1 as just a website.* Rejected. Loses the platform thesis Russell needs to see. Puts Justin back in vendor-quote territory.

**Owner:** Justin (BGD).

**Open follow-ups:**

- **Phase 1 propagation demo viability** needs engineering confirmation by Monday (May 4). If demo isn't buildable by the mid-June Phase 1 launch, the leave-behind's load-bearing claim weakens. May require Phase 1 timeline shift OR shipping Phase 1 without the demo (and accepting that Phase 2 becomes the platform-proof moment).
- "Twenty-five dealers next year" line in the leave-behind is rhetorical. If Russell asks about growth source, ready answer needed (Terraplex pipeline + additional Revolution distributors).
- After meeting, polish `revolution-leave-behind.md` to .docx for cleaner presentation copy on follow-up materials.

---

## 2026-05-03 — Founding-manufacturer pricing posture

**Decision:** For the Russell trip and any subsequent founding-manufacturer conversation, the pricing posture is "meaningfully below enterprise channel-marketing tools (Zift, ZINFI, Channeltivity at $50K+/year)" without committing specific numbers in the leave-behind itself. If asked directly for a range, the defensible band is **$1,500-3,000/mo platform fee plus a fixed Phase 1 build fee.** Specific numbers get scoped after Russell signals direction.

**Why:** The platform's existing tier pricing anchors the math.

- Dealer spoke: $250/mo
- Distributor hub: $600/mo (Terraplex anchor)
- Manufacturer hub: naturally above both, below enterprise SaaS

$1,500-3,000/mo manufacturer-tier fee respects the spread between distributor ($600) and enterprise SaaS ($4,000+/mo). The fixed Phase 1 build fee covers the heavier initial work (manufacturer hub site + propagation demo) without breaking the subscription-model thesis. The 36-month lock provides Russell with predictability and the platform with revenue stability.

**Alternatives considered:**

- *Quote a specific number in the leave-behind.* Rejected. Anchoring before scoping is risky. Either the number is too high (Russell balks) or too low (Justin's anchored to a number that doesn't reflect actual scope). Posture without commitment is the right move for a leave-behind.
- *Punt entirely on pricing in conversation.* Rejected. Russell will ask. Punting reads as not having thought about it. Range with framing ("we're not in $50K-a-year SaaS territory") is honest and useful.

**Owner:** Justin (BGD).

**Open follow-ups:**

- After Phase 1 scope is locked with Russell, fix specific Phase 1 build fee and monthly platform fee.
- Reconcile with `references/manufacturer-tiers.md` which currently has BGD-direct pricing thinking that overlaps but doesn't match this posture. Likely needs an internal note clarifying which doc applies to which audience.

---

## 2026-05-02 — Hub-spoke offering includes a marketing-services layer slot, packaging deferred

**Decision:** The productized hub-and-spoke offering for manufacturers (`references/manufacturer-tiers.md` and `references/revolution-hub-thesis.md`) is designed with a clearly visible "marketing services overlay" at Tier 2 and Tier 3. The slot is delivered through curated specialist partners. The first likely partner is Liebl Marketing Group (Jon Liebl), but commercial structure is undecided.

**Why:** Justin's 10-year working relationship with Jon runs on a broker model: Justin gives Jon a number, Jon upcharges and bundles with LMG marketing services. In the Terraplex/Revolution context Jon does not currently expect to broker the work, but he has signaled interest in his marketing capabilities being inserted as the platform scales (per-dealer marketing support, trade-show packaging, video production already came up with New Heights). Designing the offering with a visible marketing-layer slot honors the relationship architecturally without committing Jon to specifics. Gives Russell a complete picture on Tuesday. Keeps Justin commercially flexible.

**Alternatives considered:**

- *Bundle marketing services into BGD's tier pricing.* Rejected. Not BGD's competence, would bloat the offering, and would put Justin in competition with Jon rather than partnership.
- *Leave marketing services entirely off the offering, add later.* Rejected. The dealer-need-list already includes trade-show, video, and brand work (New Heights, Black Knight surfaced these). Excluding them makes the offering feel incomplete to a manufacturer thinking about real-world dealer support.
- *Name LMG specifically in the offering.* Rejected for now. No commitment with Jon yet. Generic "specialist partner" language preserves flexibility and avoids overpromising. Revisit after Sunday Jon-feedback session.

**Owner:** Justin (BGD). Jon to be consulted Sunday for feedback on the offering as a whole, including how he sees the marketing-services slot evolving.

**Open follow-ups:**

- Resolve marketing-layer packaging structure with Jon: a la carte add-on (option 1), bundled into a higher platform tier (option 2), or co-delivered joint product (option 3).
- If LMG becomes a named partner, formalize commercial terms (referral fee, white-label, joint quote, etc.) and update tiers accordingly.
- Revisit dealer subscription model: today, dealer spokes pay BGD direct for the platform layer. If marketing services get added, decide whether dealers pay the marketing partner separately or through a single platform invoice.

---

## 2026-05-02 — Phase 3 hub propagation is a first-class business deliverable

**Decision:** Phase 3 hub content propagation (the mechanism for rolling Terraplex hub updates across all dealer sites without per-dealer manual work) is recognized as a strategic, customer-facing capability, not just internal engineering. It belongs in priority #3 (business plan) as a value driver for both Terraplex (the hub) and the dealers (the spokes), and it informs the productized SaaS pricing model.

**Why:** Each dealer's `spoke.config.json` pins to a specific `hub.version` (currently v0.3.0). When Terraplex updates a product spec, brand language, or rolls out required content (e.g., a legal disclaimer change), the hub bumps version. Without propagation tooling, every change requires Justin to manually update N dealer sites. That does not scale and erodes the recurring-revenue thesis.

With propagation tooling, the value proposition flips. Terraplex pays the platform fee partly because hub-level changes auto-cascade. Dealers pay the recurring fee partly because their site stays current without their effort. Automation IS the deliverable, which is the only sustainable MRR justification at the price point this platform should command.

**Alternatives considered:**

- *Treat propagation as internal engineering toil; price recurring fees against hosting + monthly check-ins only.* Rejected. Caps recurring revenue at a level that competes with a $50/month Squarespace and erases the platform's structural advantage.
- *Defer Phase 3 thinking until more dealers are onboarded.* Rejected. The longer the gap between hub updates and propagation, the more drift accumulates and the more painful Phase 3 becomes. Better to design propagation into the spoke architecture at current size (6-7 dealers) than retrofit at 20.
- *Bundle propagation as a feature of the manager app's Phase 5 client access tier only.* Considered. Phase 5 surfaces propagation to clients (e.g., an "update my site" button gated on Justin's review), but the propagation engine itself is independent and should be built before Phase 5. Phase 5 is the UI; Phase 3 is the engine.

**Owner:** Justin (BGD). Engineering and business plan implications are the same person.

**Open follow-ups:**

- Read `hubs/terraplex/design/propagation-v1.md` when propagation becomes the active concern.
- Reflect propagation in the productized tiers on beardedgingerdesigns.com (priority #1) as a deliverable line, not an implementation detail.
- Pricing model in priority #3 should separate: (a) one-time site build, (b) recurring hosting + monitoring, (c) recurring hub-platform participation (where propagation lives). Today it's bundled into the 18-month contract; consider decoupling at platform maturity.

---

## 2026-05-02 — Dealer onboarding flow IS the productized BGD tier

**Decision:** The current Terraplex dealer onboarding flow — discovery call → follow-up email with questionnaire URL → Bonsai-issued contract + first invoice → Bonsai recurring monthly for 18 months — is officially recognized as the de facto productized BGD tier. Priority #1 (productize the BGD 18-month offering) is reframed as "publish and lock the flow already running," not "design a new offering from scratch."

**Why:** Surfaced from the 2026-05-01 Terraplex day — Superior Drone LLC went through the full pipeline (call → questionnaire → contract → invoice) in one afternoon with zero per-client negotiation. The mechanic exists, has been used, and produces 18-month recurring revenue. The remaining productization work is making it visible (pricing tiers, scope per tier, contract template, beardedgingerdesigns.com page), not inventing process. This collapses the perceived distance between priority #1 and priority #2 — they're the same engine viewed from two angles.

**Alternatives considered:**
- *Design productized tiers fresh, separate from Terraplex work.* Rejected — would duplicate effort and risk the published tier diverging from what's actually sold.
- *Wait until Terraplex hub ships before publishing tiers.* Rejected — pipeline project lands soon and needs a productized story to point at, per the priorities.md hard constraint.

**Owner:** Justin (BGD).

**Open follow-ups:**
- Document where the questionnaire URL lives and what it asks (Google Form? Bonsai? BGD site?). Until captured in `connections.md`, the pipeline has a black box step.
- The Terraplex dealer pipeline currently bundles software platform fees with site build + recurring service. The publishable tier on beardedgingerdesigns.com may need to separate "channel platform participant" pricing from "dealer site build" pricing — TBD as part of priority #3 (business plan).

---
