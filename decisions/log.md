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

## 2026-05-28 — BGD strategic pivot: from "I build websites" to "I solve business problems with AI"

**Decision:** BGD is shifting identity. The business is no longer defined by Craft CMS builds. The new positioning: **Justin solves business problems for mid-market companies and ships the solutions as products.** AI is the accelerant that lets one talented operator build what used to take a team. If the solution is a website, fine. If it's an automation, a platform, or a tool, fine. The offering is the problem-solving, not the medium.

Craft builds become legacy/maintenance revenue, not the growth engine. BrandOS is reframed as the first proof point of this model (a product that solves a specific business problem: channel marketing for multi-tier distribution networks), not a separate company play. The AI automation work with Jon is example #2.

**Jon Liebl's role is formalized as the sales channel.** Justin doesn't sell. Jon does. Jon needs a concept to sell. Friday 5/30 is the conversation where the pitch shifts from "Justin builds websites" to "Justin solves business problems with AI — and every solution I build becomes something you can sell to your other clients."

**Why:**

1. **Justin's passion and strength is solving business problems, not building websites.** His own words: "Once I have the client, I'm phenomenal because I solve business problems. I don't just try to sell people." The Craft CMS identity undersells what he actually does.
2. **AI changes the build economics.** Things that took weeks now take days. Products that required a team can be built by one person who's talented behind the wheel. This is a structural shift, not a trend. Justin is positioned to capitalize because he's both technical and business-minded.
3. **The ceiling on custom Craft builds is real.** Nel and Alex already proved it: 6-7 active clients and Justin is out of hours. Productized solutions at higher MRR per client is the only path to scale.
4. **Jon is the missing piece.** Justin's chronic weakness is sales. Jon has been the biggest source of new clients and projects for years. Giving Jon a bigger, more valuable thing to sell (AI-powered business solutions vs. websites) unlocks a bigger market without requiring Justin to become a salesperson.
5. **The Des Moines mid-market is underserved.** Companies like Kirk Financial (Wild Rose, Thermal Kitchen), Terraplex, NPS Media Group, Hatch DSM — real businesses with real operational problems, no internal AI capability, and budgets that don't reach enterprise SaaS pricing. Justin already has relationships with these companies.

**Alternatives considered:**

- *Keep BGD as a Craft CMS shop and add AI automations as a side service.* Rejected — that's adding a fourth priority to an already overloaded Q2. The shift needs to be identity-level, not additive.
- *Build BrandOS as a separate company and keep BGD for Craft.* Rejected — BrandOS is an instance of the new model, not a divergent path. Separating them splits focus.
- *Wait until BrandOS is further along before pivoting.* Rejected — the AI automation opportunity is real now. Jon is receptive now. The market window is open now. 2026 is the gauge year; this is what you're gauging.
- *Hire salespeople instead of relying on Jon.* Premature — validate the model with Jon first. If it works, the Jon partnership model can replicate with other relationship-holders.

**Owner:** Justin (BGD).

**How to apply:**

- **Friday 5/30 call with Jon:** Frame as partnership pitch, not demo. "I solve problems, you sell relationships. Every solution I build for you becomes something you can sell."
- **Existing clients are the test market.** Stress test the concept against Kirk Financial, Terraplex, NPS Media Group, Hatch DSM, IowaEverywhere. What problems do they have that AI can solve? What would they pay?
- **Craft builds don't stop overnight.** Current contracts run out. New client conversations shift toward problem-solving positioning. No abrupt client disruption.
- **Q2 priorities reframe:** Priority #1 (productize) now means productizing the problem-solving model, not just the 18-month Craft tier. Priority #3 (business plan) absorbs this pivot as the strategic thesis.
- **BrandOS stays on track** — it's the flagship proof point of this model, not a distraction from it.

**Open follow-ups:**

- Overnight research: market landscape, client problem audit, pricing models, competitive positioning in Des Moines. Review morning of 5/29.
- Friday 5/30: Jon partnership conversation.
- Post-Friday: decide on formal branding, pricing tiers, and go-to-market for the new positioning.
- Revisit Q2 priority language in CLAUDE.md to reflect the pivot.

---

## 2026-05-28 — Exploring AI automation as a new BGD service line; Jon Liebl is proof-of-concept

**Decision:** Justin is actively prototyping a new AI automation service line for BGD. Not chatbots. Real business operations automations that eliminate repetitive weekly management tasks for clients. Jon Liebl (LMG) is the proof-of-concept. Email sent 2026-05-26 (subject: "New capabilities"). Jon confirmed Friday 5/30 afternoon for a call. Justin also plans to demo BrandOS progress on that call.

Jon replied same day with his pain points:

1. **Workflow segregation** across TPLX, IE, and LMG. Balancing urgent vs. can-wait across three businesses.
2. **Billing / collections** — repetitive.
3. **Updating copy, creative, and traffic for IE** — repetitive.
4. **Presentation decks** — already leaning on Claude for this.
5. **Client touch points** — repetitive.
6. **Getting invoices from vendors in a timely manner** — chasing vendors.

Jon also noted: "I know there are a ton of efficiencies I can be employing." High receptivity.

**Why:** BGD's current offering is custom Craft CMS builds + hosting + ongoing support. AI automations expand the service line into operational efficiency for existing clients. This creates new recurring revenue and positions Jon (and eventually other partners) to sell AI automation services alongside BrandOS. Jon is the ideal proof-of-concept because he runs three overlapping businesses with real operational overhead and he's already bought into the partnership thesis.

**Alternatives considered:**

- *Cold-pitch the service line to prospects without validation.* Rejected — proving the concept with a trusted partner first is cheaper and builds a real case study.
- *Build generic automation demos without a real client's problems.* Rejected — real-world use cases are the whole point. Jon's specific pain points give us concrete prototypes to build toward.
- *Wait until BrandOS is further along before layering on new offerings.* Rejected — AI automations are complementary, not competing. And Jon's problems are solvable now.

**Owner:** Justin (BGD).

**How to apply:**

- Before Friday 5/30 call: research and prototype automation approaches for Jon's top pain points (workflow triage, billing/collections, vendor invoice chasing are the strongest candidates).
- Presentation decks are deprioritized since Jon's already using Claude there.
- The IE copy/creative/traffic item may overlap with BrandOS content propagation work — explore synergy.
- Friday call agenda: review automation findings + demo BrandOS progress.
- After Friday: assess which automations are generalizable enough to become a repeatable service offering.

**Update 2026-05-28 (phone call):** Jon's #1 ask is **email prioritization** — a way to sort emails into "needs my reply / requires attention" vs. "can be deferred." This is structurally the same problem Justin's `/daily-inbox-triage` skill already solves. Strongest candidate for the first Friday demo: proven pattern, minimal build time, directly maps to Jon's stated need.

**Open follow-ups:**

- Lead Friday demo with the email triage prototype (adapt `/daily-inbox-triage` pattern for Jon's inbox).
- Prototype automation approaches for Jon's remaining pain points (billing/collections, vendor invoice chasing) before 5/30.
- Friday 5/30 call (time TBD, afternoon confirmed).
- Post-call: decide whether to formalize this as a named BGD service line or keep prototyping.

---

## 2026-05-23 — Inside Out wiki converted to AIOS canonical layout

**Decision:** Reshaped the existing LLM-Wiki at `/Users/justinlobaito/repos/inside-out/wiki/` (+ companion `raw/`) into AIOS canonical `docs/wiki/` layout via `/wiki convert`. Updated `clients.yaml` `docs_paths` for `inside-out-website` from `.../inside-out/wiki` → `.../inside-out/docs` so `detectWiki()` resolves via `docs/wiki/WIKI-CLAUDE.md`. Verbatim snapshots preserved under `docs/wiki/raw/external/{wiki,raw}-pre-aios-2026-05-23/`. Conversion record: `/Users/justinlobaito/repos/inside-out/docs/wiki/log/2026-05-23-wiki-converted-from-project-root.md`.

**Why:** The Inside Out wiki was already wiki-shaped (had SCHEMA.md, decisions/, sources/, overview.md, log.md) but lived at the project root (`wiki/`) rather than the AIOS-canonical `docs/wiki/` path. AIOS's `detectWiki()` walks one level under `docs_paths` to find `WIKI-CLAUDE.md`, so the old location was invisible to the OS. Reshape matches Iowa Everywhere / Wild Rose pattern: WIKI-CLAUDE.md as schema doc, decisions split into `active/deferred/implemented/superseded`, `log/` as folder with per-event files, plus `plans/`, `architecture/`, `strategy/`, `research/` sections. All curated content preserved; project-specific `brand/`, `services/`, `pages/` sections kept since they're load-bearing for this project.

**Alternatives considered:** (a) Delete the old `wiki/` outright (rejected — `/wiki convert` explicitly forbids it; that's the project owner's call). (b) Move (`mv`) content into `docs/wiki/` to preserve git history (rejected — files were untracked anyway, and the cp-only approach left an undisturbed `wiki/` for Justin to remove on his own timeline). (c) Keep the old sequential `NNNN-<slug>.md` decision numbering (rejected — date-based slugs sort chronologically and match other BGD wikis).

**Owner:** Justin (decides when to remove the now-redundant `/Users/justinlobaito/repos/inside-out/wiki/` and `/Users/justinlobaito/repos/inside-out/raw/` directories at project root).

## 2026-05-21 — Wild Rose launch slipped to mid/late June + scope decisions locked

**Decision:** Wild Rose Resorts redesign launch moves from Jun 1 to mid-to-end of June. Same walkthrough locked five scope decisions: email signup feature removed; promotions converted from calendar logic to single-text-field entries; ticketing roadblock popup confirmed for cross-property purchase clarity; entertainment entries stay separate per property; careers page removes mandatory property pre-selection.

**Why:** Aaron Harn initiated the slip — Wild Rose travel schedule + Memorial Day holiday + Justin's concurrent Thermal Kitchen load (6/16 launch). Aaron explicitly cited TK as a reason to let Wild Rose breathe. Email signup was killed because Maro Post requires Player ID; gating capture on Player ID would segment too many users. Promotions de-calendared because cadence text ("Every Sunday at XYZ") is simpler for both backend and frontend than chronological scheduling. Ticketing roadblock papers over the root cause (three separate ticketing platforms) without consolidating platforms now.

**Alternatives considered:** Hold the Jun 1 date (rejected — Aaron offered the slip, capacity is real). Ship email signup behind a Player-ID gate (rejected — Aaron: "if that creates problems, just 86 the whole idea"). Consolidate entertainment entries across properties (rejected — Krystal: wrong-property arrivals already happen, consolidation would amplify confusion). Auto-redirect to property page on default-location set (deferred — Justin to test both auto-redirect and filter-only and return with a recommendation).

**Owner:** Justin. Open homework: deploy to dev, finish content, schedule content meeting with Meghan Wymore (wildrosecorporate.com), prep entertainment-strategy options.

## 2026-05-12 — BrandOS pitch reframe + Crash Champions lead + partnership formalization sequencing

**Decision:** Three directionally aligned outputs from the Nel + Alex touchbase 2026-05-12 (`references/touchbase-2026-05-12.md`):

1. **BrandOS pitch reframes from "selling Justin" to "selling the platform."** Justin remains the service layer for mid-tier clients. Higher-tier clients (big companies with internal marketing teams) get a **DIY package** model: "buy me out for X, I'll develop the hub for you." Stretch goal locked: **10 dealers on platform in 2 months, 2-3 hubs in a year.**

2. **Pursue Crash Champions opportunity** (biggest US automotive repair, Nel's agency client, going AI, has an AI-expert vacancy that matches Justin's build exactly). Path: Nel → Val (close friend at agency) → intro to Justin → potential intro to Jonathan (agency owner). Compensated engagement, not free consulting.

3. **Partnership formalization sequenced behind banking.** Bank account paperwork doctor call Thu 5/14 (Nel + Alex). After banking is live: Lemon Squeezy payment integration, then LLC registration. Backup Bison product launches week of 5/19.

**Why:**

1. **Capacity ceiling is real.** Alex pressure-tested the model: at 6-7 active clients Justin is out of hours. The platform thesis only works if it can outgrow Justin's calendar. The DIY model is the relief valve for clients big enough to absorb internal-team operation.
2. **Crash Champions is unusually well-fit.** Their intake questions (Hayden) align exactly with what Justin's built. Nel is the warm hand-off. Agriculture-to-automotive pivot demonstrates the platform pitch in a different vertical — proves the "channel platform" thesis is not crop-specific.
3. **Banking before company.** Lemon Squeezy and LLC both require a bank account routing number. Pretending to sequence them in parallel would just create rework. Thu 5/14 is the unblock.

**Alternatives considered:**

- *Keep BrandOS as Justin-led-services only.* Rejected. Hits a ceiling. Also reduces optionality on the Nel + Alex partnership go/no-go (per CLAUDE.md priority #3).
- *Justin pitches Crash Champions directly without Nel's warm intro.* Rejected. Val is the trusted relationship. Cold-pitching an AI vacancy at someone else's agency would be tone-deaf.
- *Justin runs the AI-expert role inside the agency.* Rejected by Nel's framing — that's a hire, not a sale. The goal is BrandOS as the offering, with Justin in a service role around it. Bigger upside.
- *Pursue online courses or pitch-deck verticals.* Surfaced and rejected for now. Claude design already covers pitch decks. Courses are a maybe-later vertical.

**Owner:** Justin (BGD) for BrandOS pitch + Crash Champions follow-up. Nel + Alex for partnership formalization.

**How to apply:**

- **Don't bring Lemon Squeezy or LLC questions to Justin until banking is confirmed live** (Thu 5/14 outcome).
- **Justin unavailable Wed 5/14 + Thu 5/15** for substantive partner work. Text-only.
- **When Val meeting is scheduled:** lead with creative + analytics framing. Soft-pedal technical. Highlight anonymous visitor identification + market-shift executive summaries — the "added value" angle that resonates with Fortune-500-adjacent buyers.
- **Capacity flag for the next two weeks:** Backup Bison launch (wk of 5/19) + Wild Rose launch (wk of 5/25) + Thermal Kitchen launch (Tue 6/2) + ToneQuest launch (Jun 1) all stack in a 14-day window. If Crash Champions intro lands during that window, push it to early June.
- **Don't oversell BrandOS to Val.** Alex explicitly flagged the risk: "they'll just pick his brain and not compensate him." Set the conversation up as a paid engagement, not a free consult.
- **Reframe the BrandOS roadmap doc** to reflect the platform-first pitch + DIY tier. The current roadmap was written for Justin-as-builder; it now needs a "platform-as-product" overlay.

**Open follow-ups:**

- Nel pings Val to schedule Justin intro (timing tied to her calendar availability).
- Update `references/brandos-roadmap.md` with the platform-first + DIY tier framing.
- Cindy's notes package — Nel to review (suspects OS targeting issue on backup device).

---

## 2026-05-13 — Wild Rose timeline reset; 5/13 walkthrough canceled; banquet + Lucky's queued

**Decision:** Canceled the Wed 5/13 2pm Wild Rose walkthrough with Aaron Harn + Jon Liebl same-day. Email sent to Aaron and Jon proposing **Mon 5/18 anytime after 10am (10am-1pm CT window preferred)** with **Tue 5/19 after 10am** as fallback. New full Wild Rose Phase 1 sequence locked in that same email:

- **Mon/Tue 5/18-5/19** — Walkthrough + content/edits signoff
- **Week of 5/18** — Wild Rose staff updates current promotion content on dev site
- **Fri 5/22** — Final approval on all go-live content
- **Week of 5/25** — Launch redesigned site (live before 6/1)
- **~2 weeks post-launch** — Banquet reservations launch (~early-to-mid June)
- **Shortly after** — Lucky's restaurant site launches (queued, scope TBD)

**Why:**

1. **Lost the day to a Claude Code + Figma interpretation pivot.** Justin attempted to use Claude Code to interpret the Figma file as a 5/13 prep time-saver. The pivot ate the whole day and didn't produce a usable result.
2. **Compounded by a serious computer issue with lost work.** Dev site was not in a review-ready state by 2pm.
3. **First Wild Rose design touchpoint since Mar 2.** Two months of project silence. Walking in with a half-baked dev site to Aaron + Jon would damage rather than advance the relationship. Pushing the meeting protects the relationship; presenting unfinished work would not.
4. **June 1 launch target stays viable** with the reset sequence: 1 week prep (5/18 review → 5/22 approval) + 1 week launch run (week of 5/25). Tight but defensible given the dev site is mostly there.

**Alternatives considered:**

- *Push the walkthrough later in the day or to Thursday 5/14.* Rejected. Wouldn't give enough recovery time, and Inside Out content wrap is also due Fri 5/15 — Thursday is committed.
- *Proceed with the 2pm half-baked.* Rejected. See reason 3 above.
- *Cancel without rescheduling.* Rejected. Keeps the June 1 launch window viable.
- *Externalize the Claude-Code-pivot framing to the client.* Rejected. Justin's email to Aaron and Jon framed it as "serious computer issue and lost a good amount of work" — the tooling experiment is internal cost, not client-facing detail.

**Owner:** Justin (BGD).

**How to apply:**

- **5/19 capacity flag:** If Wild Rose walkthrough lands Tue 5/19, Justin is also sending Thermal Kitchen design comps that day for the 5/20 review. Tight but not directly conflicting if scheduled around each other. If it's an issue, push Wild Rose to Mon 5/18.
- **Don't blow up the Thermal Kitchen plan to absorb Wild Rose slip.** They run in parallel.
- **Banquet reservations** launches ~2 weeks after Wild Rose go-live. Treat as Wild Rose Phase 2, not a separate engagement.
- **Lucky's restaurant** is now on the queue (see `memory/project_lucky_restaurant.md`). Scope, client relationship, and brand assets are unknowns to gather when it activates.
- **Tooling lesson:** novel design-to-code automation on a client-deadline crunch day needs a defined bail point. Captured in `memory/feedback_figma_claude_code_caution.md`.

**Open follow-ups:**

- Confirm Mon 5/18 time slot or Tue 5/19 fallback once Aaron responds.
- Recover lost work from 5/13 computer issue — assess what survived and what needs rebuilding before 5/18.
- Wild Rose staff content updates (promotions) need a clear handoff doc by 5/18 walkthrough.

---

## 2026-05-13 — Thermal Kitchen project plan: 5/20 design review, 5/19 comp preview, Tue 6/2 launch

**Decision:** Locked the Thermal Kitchen Phase 1 timeline. Design comps go to Deann **Tue 2026-05-19** (1 day before the standing call) for review at the **Wed 2026-05-20** 9am CT group call. Development runs **5/21–5/28**. Site review + launch prep **Fri 2026-05-29**. Production launch **Tue 2026-06-02**. Plan captured in `references/thermal-kitchen-project-plan.md`.

**Why:**

1. **5/20 group call is the one design gate before build.** With Deann, Aaron, and Brian on the call, this is the moment to lock direction. Sending comps a day ahead converts the call from "react" to "confirm." Same-day delivery would burn the call on first-look reactions; longer lead time risks Deann processing alone and arriving with second-thought asks. One day is the right pressure.
2. **Tue 6/2 launch, not Mon 6/1.** Standard risk-reduction. Monday launches couple weekend prep with go-live in a way that's hard to recover from if anything slips. Tuesday gives a clean prep day and keeps the week-of-June-1 commitment intact.
3. **8-day dev window (5/21–5/28) is tight but defensible** given the agreed-tight Phase 1 scope: site design update, service reflection, leverage existing blog content. HubSpot is explicitly Phase 2 (June).

**Alternatives considered:**

- *Send comps 2-3 days ahead.* Rejected. Gives Deann too much solo processing time; risk of pre-call drift and unstructured async feedback that doesn't actually decide anything. One-day lead keeps the decision inside the meeting.
- *Mon 6/1 launch.* Rejected for the reasons above. If Deann pushes for the full "week of June 1" symbolism, Tue is still well inside that frame.
- *Add a mid-week buffer review between 5/28 build complete and 5/29 final.* Rejected for now to hold the launch date. If build pace looks rough by Sat 5/24, revisit.

**Owner:** Justin (BGD).

**How to apply:**

- Don't accept new design directions inside the 5/21–5/28 build window unless launch-blocking.
- HubSpot scoping conversations get deferred to June. Surface the account access path at 5/20 but don't pull it into May.
- If Deann surfaces a major direction change on 5/20, the launch date is the variable, not the scope: re-baseline before committing to held dates.

**Open follow-ups:**

- Pre-call: confirm with Deann whether existing video stays or is replaced.
- Pre-call: surface HubSpot account access path for June scoping.
- Send Dropbox link to Deann (carryover from 5/6 call).

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

## 2026-05-11 — Superior Drone LLC on a hard write-off clock (2026-05-30)

**Decision:** Superior Drone LLC has not signed the BGD contract, completed onboarding, or paid the first month's invoice since their 2026-05-01 kickoff. Justin sent a follow-up; no response. **If no movement by 2026-05-30, the project is killed** and Superior Drone is removed from the active dealer roster.

**Why:** Three weeks past kickoff with zero forward motion is a stalled lead, not active onboarding. Carrying it in the roster gives a false sense of pipeline health and absorbs attention that should go to dealers with real momentum (Pyro and Black Knight migrated; New Heights, Great River, Truss in flight). A hard date forces a clean classification — they either re-engage in the next ~2.5 weeks or the project closes.

**Alternatives considered:**
- *Indefinite hold without a deadline.* Rejected — that's how stalled leads silently rot the roster.
- *Kill now without a final window.* Rejected — keeps a small chance of recovery at minimal cost; follow-up cost between now and 5/30 is bounded.
- *Send one more nudge with the deadline disclosed to them.* Open — viable, but Justin's read is the project is dying regardless. Not aggressively pursuing.

**Owner:** Justin (BGD).

**How to apply:**
- 2026-05-30 is the kill date. No internal slip.
- If they respond before then with intent to sign, classify as recovery and re-onboard via the productized flow.
- After 5/30 with no response, remove from `references/brandos-roadmap.md` Live network table and `references/terraplex-platform.md` dealer roster. Update `memory/project_brandos_dealer_migration_status.md` to reflect closure.

---

## 2026-05-11 — 30-day BrandOS growth target: 10 dealers + $3,100/mo by 2026-06-11

**Decision:** Lock a measurable 30-day growth goal for BrandOS:

- **10 active dealers** on the platform at $250/mo standard rate (current: 5 dealers, with BK Drones at legacy $100/mo).
- **+ Terraplex Ag distributor at $600/mo** (current and constant for this window).
- **BrandOS combined MRR target: $3,100/mo** (current: $1,700/mo).
- **Deadline: ~2026-06-11.**

**Definitional update made the same day:** BrandOS now explicitly includes the distributor tier (Terraplex Ag $600/mo), not just dealers. Distributor pricing may change later but is fixed at $600 for this 30-day window.

**Why:**

- A measurable 30-day target forces sales-motion discipline. Productized tier work (priority #1 in CLAUDE.md) needs proof points; doubling dealer count under the existing pricing is the proof.
- The dealer pipeline already exists end-to-end (questionnaire → Bonsai contract → recurring invoice). Adding 5 more in 30 days is a sales/marketing problem, not a build problem.
- 5 new dealers at $250 = +$1,250/mo, which is meaningful BrandOS revenue lift without changing the offer or the platform itself.
- Forces a real decision on named prospects and channel activation (Terraplex referral, dealer-of-dealer, etc.).

**Alternatives considered:**

- *No deadline / "more dealers when they come."* Rejected — that's how priority #1 stays vague indefinitely.
- *Longer window (60-90 days).* Rejected — Justin wants to test what real urgency unlocks in the network. 30 days is a meaningful sprint without being theatrical.
- *Higher target (15+ dealers, $5K+/mo).* Rejected — would require pricing changes or scope reshaping inside the window. 10 dealers at current standard rate is achievable without new mechanics.
- *Lower target (7-8 dealers).* Rejected — doesn't force the marketing/sales-motion discipline that's the actual point.

**Owner:** Justin (BGD).

**How to apply:**

- Working plan file: `brainstorm/brandos-30-day-growth-plan.md`. Iterates as named prospects and channels lock in.
- Weekly check-in recommended at end of each week (4 checkpoints inside the window).
- Capacity reality: week 1 (this week) is already loaded with Wild Rose Tue, Wild Rose walkthrough Wed, Inside Out content Thu, Pelcro Fri. Realistic dealer-growth time this week is evenings only.
- Connects to: `memory/project_brandos_brainstorm_dealer_portal.md` (new dealers will ask for the same marketing/trade-show support Pyro and New Heights have asked for — capability investment may need to land in parallel).
- Re-evaluate goal at 2026-06-11 regardless of outcome. Win: lock learnings + raise next goal. Miss: diagnose what slowed it, adjust.

**Open follow-ups (gating real plan execution):**

- **Named prospect list (5 candidates minimum).** Existing Terraplex network referrals, dealers Jack/Cherity have mentioned, peer referrals from current 5 dealers, etc.
- **Channel activation question:** is Terraplex (Jack/Cherity/Jon) actively pushing dealers to BGD, or is BGD prime-moving outreach?
- **Pitch material:** does a current one-pager / short deck for the dealer-tier offer exist, or does that need drafting first?

---

## 2026-05-18 — Ship `daily-inbox-triage` skill (`/level-up` run)

**Decision:** Scaffold a `.claude/skills/daily-inbox-triage/` skill that surfaces unanswered BGD-inbox threads each morning, ranked by client tier + days waiting + project status. AI-assisted: deterministic Gmail filtering + scoring, one AI call per top-N thread to attach project memory context.

**Why:** Stated top pain is "replying to email — chronically behind." This conversation just demonstrated the manual workflow (digging through 2 weeks of Gmail to find Deann's thread). Closes the Capabilities + Cadence gaps from today's audit (first user-built skill + first daily ritual). Defaults to L2 Drafted — never sends, only surfaces and contextualizes.

**Method spec:**
- **Constraint solved:** Email-reply lag.
- **EAD:** Automate. Eliminate fails (core function). Delegate fails (voice non-negotiable on external comms).
- **Process:** Trigger = manual `/daily-inbox-triage` each morning. Sources = Gmail (BGD), memory/, connections.md. Transforms = filter inbound-last + >18hr old + non-automated, score by client tier + days waiting. Decisions = reply today / this week / FYI / archive. Destination = ranked Markdown list in chat.
- **Autonomy:** L2 Drafted. Bike Method Phase 1 — manual run only, no scheduled trigger yet.
- **KPI bucket:** Less cost + More value per customer. **Metric:** % of inbound client threads replied within 24 business hours. Target: 80% by 2026-06-18.

**Alternatives considered:**
- *Build the email-reply drafter first instead.* Rejected — drafter speeds up each reply but doesn't solve "which threads do I owe?" Triage surfaces the queue that drafter would feed off later.
- *Skip to scheduled/autonomous version (L4).* Rejected — Bike Method Phase 1, manual validation first. Trigger advances by explicit edit.
- *Sub-agent instead of skill.* Rejected — Boring-is-Beautiful. One AI call inside a deterministic pipeline is the right size.

**Owner:** Justin (BGD).

**How to apply:**
- Run `/daily-inbox-triage` each morning starting tomorrow (2026-05-19).
- Track replied-within-24hr % manually for the first week; if friction is high, revise scoring heuristic.
- After 14 days of manual runs, evaluate moving to Bike Method Phase 2 (scheduled trigger via hook).

---

## 2026-05-18 — Ship `weekly-project-status` skill (`/level-up` run)

**Decision:** Scaffold a `.claude/skills/weekly-project-status/` skill that produces a per-project status brief each Monday by synthesizing `memory/project_*.md`, recent `decisions/log.md` entries, recent Gmail activity, and upcoming calendar events. AI-assisted: deterministic data pulls, one AI call to derive next action per project.

**Why:** Other half of stated top pain — "juggling concurrent projects with no real tracker." 4+ active engagements (Inside Out, Wild Rose, Thermal Kitchen, ToneQuest) plus BrandOS dealer growth plus stalled-pipeline checks (Superior Drone 5/30 kill date, Crash Champions lead). Closes the Tier-1 project/task tracking domain gap from `/audit` without picking a third-party tracker.

**Method spec:**
- **Constraint solved:** No project tracker; concurrent projects lose follow-up state.
- **EAD:** Automate. Eliminate fails (need the view). Delegate fails (only Justin has the cross-project context).
- **Process:** Trigger = manual `/weekly-project-status` Monday morning. Sources = `memory/project_*.md` filtered by `client:` / `project:` frontmatter, `decisions/log.md` last 14 days, Gmail per project, Google Calendar. Transforms = group by project, list recent updates, recent Gmail, upcoming events, open follow-ups, AI-derive 1 next action per project. Decisions = on-track / at-risk / blocked per project. Destination = brief in chat + archived to `briefs/status-{date}.md`.
- **Autonomy:** L2 Drafted. Bike Method Phase 1 — manual run only.
- **KPI bucket:** Less cost + More customers. **Metric:** Zero slipped open-follow-ups inside the BrandOS 30-day window (2026-06-11 deadline) and the Q2 priority window (through July 2026). Baseline: open follow-ups currently untracked across the surface.

**Alternatives considered:**
- *Adopt an external tracker (ClickUp / Linear / Notion).* Rejected for now — adds a 4th system to maintain when memory + decisions + Gmail already hold the data. Reconsider at quarterly review if this skill underperforms.
- *Daily status board instead of weekly.* Rejected — daily inbox triage already handles daily; weekly is the right cadence for project-level synthesis.
- *Include 2RM W-2 work.* Rejected — out of BGD scope per CLAUDE.md; 2RM calendar visible only for conflict-checking.

**Owner:** Justin (BGD).

**How to apply:**
- Run `/weekly-project-status` each Monday morning starting 2026-05-25.
- First run: verify project frontmatter coverage in `memory/project_*.md` — any project missing `client:` / `project:` keys will be invisible.
- After 4 weekly runs, evaluate moving to Bike Method Phase 2 (scheduled Monday-morning hook) and Phase 3 (auto-archive to `briefs/`).

---

## 2026-05-18 — IowaEverywhere year-two brainstorm: re-propose for week of 5/19, send preemptive material

**Decision:** The 4/21-proposed 2-year-anniversary brainstorm for IowaEverywhere never had its time locked (Matt + Jon confirmed week-of-5/11, no specific date set, meeting did not happen). Re-propose for **week of 2026-05-19** with two concrete time options. Attach **preemptive material** to the outreach so attendees walk in primed.

**Why:**
- Justin proposed the session a month ago; if it doesn't get scheduled this week the anniversary-timing pretext goes stale.
- 5 strong brainstorm directions are already pre-drafted in `references/iowaeverywhere-project.md`. Sending them ahead converts a generic "let's chat" into a focused working session.
- Justin also has new platform ideas to fold in — those are TBD and need capture before sending.
- IE is a $250/mo recurring revenue relationship with growth potential (BPCSN partnership is a brand-new wedge that's currently just a landing page).

**Outreach plan:**
- **To:** Matt Van Winkle (primary). **CC:** Aiden Wyatt, Jon (iowaeverywhere.com), Jon Liebl. Hold Chris Williams for follow-up unless Justin says otherwise.
- **Time options:** propose 2 concrete slots in week 5/19–5/23. Include one in-person Des Moines option per Jon's earlier preference, with virtual fallback.
- **Preemptive material:** the 5 pre-drafted directions + Justin's net-new ideas (to be captured before send).

**Alternatives considered:**
- *Wait for IE to come back with timing.* Rejected — they've had 4+ weeks. Initiative stays with Justin.
- *Send a calendar invite cold.* Rejected — multi-stakeholder, multi-org calendar invites without confirmation create friction. Propose options first.
- *Skip the preemptive material and let them shape the agenda.* Rejected — Justin wants to anchor the network's year-two thinking, not react to it.

**Owner:** Justin (BGD).

**How to apply:**
- Justin captures new platform ideas into `memory/project_iowaeverywhere_year_two_brainstorm.md` before composing the email.
- After the meeting, log build-commitments vs research-phase outcomes back to this decisions log.
- BPCSN landing page is current-quarter scope already; brainstorm outputs are next-quarter scope unless explicitly small-and-fast.

---

## 2026-05-18 — Ship `/load-project` skill: project-context hydration via `clients.yaml` registry

**Decision:** Build a `.claude/skills/load-project/` skill that hydrates per-project context (memory, references, decisions, external repo docs, Gmail, Calendar) into the current Claude Code session via `/load {project-slug}`. Registry mechanism: extend `clients.yaml` with per-project `docs_paths:` and `contacts:` arrays. Tiered output: curated default + `--full` flag for deep dives. Pure read-only; no state writes.

**Why:** Stated goal — "make claude-os my day-to-day management software with good cross-project visibility plus per-project context." Cross-project view is solved by `/weekly-project-status`. Per-project deep-context-load is the missing piece. The existing memory + references + decisions surface already holds most of what's needed inside claude-os; this skill makes external project repos (e.g., terraplex-spoke-hub's LLM-maintained wiki, site-builder-phase2/docs) reachable via the same load command without duplicating content into claude-os.

**Design spec (locked via 10-question grill 2026-05-18):**

1. **Morning shape:** Hybrid — `/daily-inbox-triage` + `/weekly-project-status` for dashboard, `/load-project` for switch-into-project deep mode.
2. **Session model:** One rolling Claude Code session, load context on demand (additive). `/clear` resets. Not session-per-project; not subagent-isolated.
3. **Source discovery:** `clients.yaml` is canonical. Per-project `docs_paths: []` (registered explicit paths) and `contacts: []` (emails + domains) drive everything. No filesystem auto-discovery; no per-project MCPs.
4. **Registry granularity:** Per-project. Pointer duplication across projects is fine. Inheritance not used.
5. **Output shape:** Tiered. Default = curated brief (memory full + recent decisions + recent Gmail + upcoming calendar + open follow-ups + manifest of deep sources). `--full` = full contents of all sources with per-file caps.
6. **Multi-project:** Single project per call. Compose by running twice. Cross-project comparison stays in `/weekly-project-status`.
7. **State writes:** Pure read-only. No session log, no state file, no last-loaded tracking. Memory + decisions log are the only records of real activity.
8. **Directory walk strategy:** Recursive with standard exclusions (`.git`, `node_modules`, etc.). Top-level files: contents in default. Nested files: manifest only in default; full contents on `--full`. File-type whitelist: `.md`, `.mdx`, `.markdown`, `.txt`, `.rst`, `.adoc`. Files >250KB treated as binary (manifest only).
9. **Lookup:** Slug-only with collision prompt. Convention: project slugs globally unique within `clients.yaml`. Compound form (`client/project`) supported for disambiguation.
10. **Contacts:** Explicit `contacts: []` per project. Supports both specific email addresses and `@domain.com` patterns. Graceful skip if missing (no error).

**Implementation defaults (reversible, not part of locked spec):**
- Per-file line cap on `--full`: 500 lines.
- Glob support in `docs_paths`: single-star only (no `**` recursive globs).
- Bike Method Phase 1 advancement trigger: 14 days of clean manual use.
- KPI: time to assemble full project context dropped from N file-reads + memory walks to one command.

**Alternatives considered (and rejected):**
- *Pure conversational with unified knowledge graph.* Rejected — high cost, slow to debug, and current memory/references/decisions surface is functionally equivalent when loaded deliberately.
- *Session-per-project.* Rejected — premature for solo-dev scale. Sub-OS folders graduate to this when a project earns it (per `EXPANSIONS.md`). BrandOS will be first candidate in 6-12 months.
- *Subagent-isolated execution.* Rejected — subagents are for breadth (parallel research), bad for depth (focused project work).
- *Auto-discovery of docs paths by filesystem probing.* Rejected — silent failures when paths move, debugging nightmare.
- *MCP per project.* Rejected — way too heavy for one keyboard.
- *Per-client docs_paths with inheritance.* Rejected — inheritance logic is the source of "why is this loading" bugs.
- *Raw dump of all sources.* Rejected — torches context window on big projects (BrandOS).
- *AI-synthesized brief.* Rejected — loses fidelity (paraphrases decisions instead of preserving exact language), adds latency + cost per load.
- *Multi-project per call.* Rejected — composes for free via running the skill twice; cross-project comparison is what `/weekly-project-status` already does.
- *Lifecycle pair (`/load` + `/save`).* Rejected — forgetting `/save` once breaks the model. State writes deferred to a separate, future-need-driven skill.
- *Fuzzy matching on slug.* Rejected — silent wrong-project loads are the worst failure mode.
- *Auto-discover contacts from memory.* Rejected — soft heuristics fail in predictable ways. Explicit registry beats inference.

**Owner:** Justin (BGD).

**How to apply:**
- Backfill `clients.yaml` with `docs_paths:` and `contacts:` per project. Best-effort initial pass; refine on first `/load` of each project.
- Ship the skill scaffold with `bike-method-phase: 1`. Manual run only. No scheduled trigger.
- Test on Thermal Kitchen first (smallest surface, contacts known). Then BrandOS (hardest case: external paths + multi-dealer contacts).
- After 14 days of clean runs, evaluate Phase 2 (integration with `/weekly-project-status` shared primitive, optional state writes if a real need emerges).

---

## 2026-05-19 — Onboarded Partners For Sight (RDPFS) via NPS Media Group

**Decision:** Registered **NPS Media Group** as a new paying client in `clients.yaml` with a single project: **Partners For Sight** (slug `partners-for-sight`). $200/mo Bonsai contract billed to NPS. Maintenance mode. Surfaced during 2026-05-19 inbox triage when a Wordfence-unrelated thread ("RD PFS Web Page - Changes to make") landed without an associated client registration. Onboarded via inline `/onboard-client` intake — captured contacts, engagement structure, and a scaffold reference doc.

**Engagement structure (this is the load-bearing distinction):**

- **NPS Media Group** is the agency that bills BGD and routes work.
- **Partners For Sight (RDPFS)** is the foundation — the actual relationship. Justin's day-to-day contacts live there.
- The split matters because Gmail queries built from `@npsmediagroup.com` catch-all would pull in unrelated NPS people (Frank Lama, Jamie Fallon — confirmed noise). The `contacts:` array uses specific NPS people only + the `@partnersforsight.org` catch-all.

**Contacts:**

| Layer | Name | Email | Role |
|---|---|---|---|
| RDPFS | Elizabeth Atkinson | elizabeth@partnersforsight.org | Primary; sends most change requests |
| RDPFS | Soja Orlowski | soja@partnersforsight.org | Elizabeth's boss |
| RDPFS | Matthew Krieger | matt@partnersforsight.org | Board chair, initial kickoff contact |
| NPS | Natalie Sorge | nsorge@npsmediagroup.com | Primary work-routing contact |
| NPS | Lori Masaoay | lmasaoay@npsmediagroup.com | Occasional |

**Why:**

- Project has been running for some time but wasn't in the client registry. First `/daily-inbox-triage` run on 2026-05-19 surfaced an NPS thread Justin needed to reply to, but the skill flagged "no project context" because nothing was registered. Onboarding closes that gap going forward — future inbox triage and `/load partners-for-sight` will hydrate this project correctly.
- Partners For Sight is a foundation supporting publications for the visually impaired, with a significant grant submittal flow on the website. The grant flow is non-obvious work that future sessions need to know about before recommending changes.
- The agency-routes-to-foundation pattern is structurally similar to other BGD relationships (Jon Liebl routing IE work). Capturing the pattern explicitly here makes it transferable.

**Alternatives considered:**

- *Register Partners For Sight directly as the client (no NPS layer).* Rejected — the billing relationship runs through NPS and they appear in active correspondence on the project. Future sessions reading `clients.yaml` need to see both sides.
- *Use `@npsmediagroup.com` catch-all in contacts.* Rejected — Frank Lama and Jamie Fallon (NPS-wide fallbacks per auto-replies) would pollute Gmail queries with unrelated threads. Justin explicitly flagged them as noise during intake.
- *Defer the reference doc until more context surfaces.* Rejected — even a scaffold with the engagement structure + grant-flow note is more useful than nothing. Doc has explicit TODO sections for Justin to expand over time.
- *Bootstrap a project wiki at `/Users/justinlobaito/repos/partners-for-sight/docs/wiki/` immediately.* Deferred — currently maintenance mode, no year-two scope conversation in progress. Wiki bootstrap when (and if) a real scope-expansion moment arrives. Reference doc + memory + clients.yaml is right-sized for now.

**Owner:** Justin (BGD).

**How to apply:**

- Next `/load partners-for-sight` will hydrate the reference doc, memory, and any decisions filtered to this project.
- `/daily-inbox-triage` will now correctly attribute threads from Elizabeth/Soja/Matt and from Natalie/Lori to this project instead of flagging as "unknown — possibly BGD lead."
- When Justin pushes site updates live, the standard notification pattern (per the 2026-05-19 draft to Natalie + Lori) is the template — keep CC narrow.
- If Justin starts opening direct strategic conversations with RDPFS contacts (vs. routing through NPS), update this entry and the memory file to reflect the relationship shift.
- Wiki bootstrap is a flagged future move, not a current one.

**Open follow-ups:**

- Capture site stack + grant-flow architecture in `references/partners-for-sight-project.md` next time Justin opens the codebase or does an HTTP-level recon (similar pattern to the Iowa Everywhere site recon on 2026-05-18).
- Accessibility audit candidate — given the audience (visually impaired advocacy), WCAG AA conformance should be a baseline. Worth confirming current state.
- Watch for a year-two scope signal from Natalie or Elizabeth. Currently no opening; don't pitch unprompted.

---

## 2026-05-18 — Bootstrap Iowa Everywhere LLM-wiki (first non-BrandOS instance)

**Decision:** Seed a complete LLM-wiki at `/Users/justinlobaito/repos/iowa-everywhere/docs/wiki/` following the same conventions as the BrandOS wiki — `WIKI-CLAUDE.md` schema, `decisions/` with active/deferred/implemented/superseded lifecycle, `log/` append-only, plus sections for `plans/`, `architecture/`, `research/`, `strategy/`, `raw/`. Seeded with: full strategy section (network overview + team + brainstorm context), architecture pages (current stack + content model, marked unverified), five plan files for the pre-drafted brainstorm directions (BPCSN buildout, distribution+indexing, transcripts, host/guest profiles, sponsor infrastructure), and a copy of the seed overview doc in `raw/`.

`clients.yaml` updated: both Iowa Everywhere project entries (maintenance + year-two-brainstorm) now point `docs_paths:` at `/Users/justinlobaito/repos/iowa-everywhere/docs/` — the parent of `wiki/`, which is what `/load-project` Step 4a auto-detects via the `wiki/WIKI-CLAUDE.md` marker one level down.

**Why:**

- Iowa Everywhere is the **first non-BrandOS project** to get an LLM-wiki. Justin stated the goal is to roll the pattern across every project so per-project decisions and knowledge live in the project's own wiki, queryable through `/load-project`.
- Year-two planning brainstorm is being re-proposed for week of 2026-05-19. Going into the brainstorm with the 5 pre-drafted directions structured as plan pages means the brainstorm output flows cleanly into `decisions/active/` (committed) or `decisions/deferred/` (parked with revisit triggers).
- This is also the first **content/media-network project** to get a wiki. BrandOS's schema is software-platform-shaped (architecture/, plans/, propagation, tenants). Iowa Everywhere needed a domain-adapted schema: same lifecycle conventions, different ground rules (no per-tenant content, no propagation, etc.). The adapted `WIKI-CLAUDE.md` captures the shape change.

**Alternatives considered:**

- *Skip the wiki, keep IE knowledge in claude-os memory + references only.* Rejected. Memory + references are good for cross-project context and operator-brain (who is Justin, what's the relationship, etc.); they're bad for project-internal decision lifecycle, feature plan archives, and lint-able knowledge compounding. The wiki is the right home for project-internal stuff.
- *Wait until after the brainstorm to seed the wiki.* Rejected. Pre-loading the 5 directions as plan files BEFORE the brainstorm gives Justin a starting structure for facilitation — and the brainstorm output mechanically lands in the wiki via `plans/` → `decisions/` transitions.
- *Put the wiki at `iowa-everywhere/wiki/` (repo root).* Rejected for consistency with BrandOS, which uses `site-builder-phase2/docs/wiki/`. Same convention across all wikis means same `/load-project` detection path, same mental model.
- *Seed only the schema (WIKI-CLAUDE.md) and let content accrete naturally.* Rejected. Pre-seeding with the known-state content (network overview, team, content model, brainstorm context, 5 plans) means the wiki has real signal from day one. Empty wikis stay empty.

**Owner:** Justin (BGD).

**How to apply:**

- Next `/load iowaeverywhere-year-two-brainstorm` should auto-detect the wiki via Step 4a and pull full content of WIKI-CLAUDE.md, README, the 5 plans, strategy pages, architecture pages, and the bootstrap log entry.
- Pre-brainstorm: Justin captures his "additional platform ideas" as new `plans/2026-05-1X-<slug>.md` files (TBD per claude-os memory).
- Post-brainstorm: a single multi-section ingest moves committed plans into `decisions/active/`, parked plans into `decisions/deferred/`, and appends a `log/2026-05-XX-brainstorm-outcomes.md` summarizing the session.
- Architectural ground-truth pass against the live Craft codebase is its own follow-up — `architecture/*.md` currently flags many claims as **unconfirmed**. First session reading the actual code should validate or correct, then drop the unconfirmed markers.
- This is the template for every future project wiki bootstrap. Pattern: `repo/docs/wiki/` location, WIKI-CLAUDE.md adapted from a closest-domain sibling, full lifecycle subdirs in `decisions/`, pre-seed real content (not empty placeholders), register in `clients.yaml` `docs_paths: [path/to/docs/]`.

**Open follow-ups:**

- Justin captures his net-new platform ideas into `plans/*.md` before sending the brainstorm outreach email.
- After brainstorm: log decisions + lifecycle moves in the IE wiki (not in this claude-os log — that's the whole point of the project-internal wiki).
- Codebase ground-truth pass to validate `architecture/current-stack.md` + `architecture/content-model.md`.
- (Cross-cutting) If a third project wiki bootstrap reveals a friction point in this template, refine the convention and update both BrandOS and Iowa Everywhere wikis as needed.

---

## 2026-05-18 — `/load-project` skill: promote LLM-wiki to first-class source

**Decision:** Update `.claude/skills/load-project/SKILL.md` so it auto-detects LLM-wiki structures inside any external `docs_paths` directory and promotes the wiki's `decisions/active/*.md`, `decisions/deferred/*.md`, most-recent 10 `log/*.md`, schema files (`WIKI-CLAUDE.md`, `README.md`, `decisions/index.md`), and parent-repo `CONTEXT.md` to **full-content reads on default load**. Wiki decisions get merged into the brief's "Decisions for this project" section alongside `claude-os/decisions/log.md` entries — not buried in an external-docs manifest at the bottom.

Detection markers (positive on ANY):
1. `WIKI-CLAUDE.md` at directory root
2. `wiki/WIKI-CLAUDE.md` one level down (when `docs_paths` is the parent `docs/` directory)
3. Both `decisions/` and `log/` subdirectories present together

**Why:** First real `/load brandos` run today missed every BrandOS decision logged in `site-builder-phase2/docs/wiki/`. Two grilling sessions produced 3 ADRs + 4 strategy docs + a new `CONTEXT.md` glossary — none surfaced. Root cause: the skill walked external `docs_paths` with depth-tiering (top-level content, nested manifest), so `wiki/decisions/active/2026-05-18-dealer-portal-pricing-model.md` was at depth 2 and got the paths-only treatment. The canonical per-project decision store was invisible.

The split going forward:
- **`claude-os/decisions/log.md`** = cross-cutting AIOS / business / multi-project decisions.
- **`{project-repo}/docs/wiki/decisions/`** = project-internal decisions with lifecycle (active/deferred/implemented/superseded).

Justin is rolling the project wiki pattern out across every project. `/load {project}` needs to be the single command that answers "what decisions did I make on this project, and what's currently locked?" — which requires reading the wiki, not just claude-os's local decisions log.

**Alternatives considered:**

- *Manually backfill wiki decisions into `claude-os/decisions/log.md`.* Rejected — duplicates content, and the wiki's lifecycle (active/deferred/implemented/superseded) is more expressive than a flat append-only log. Two sources of truth always desynchronize.
- *Add `wiki_paths:` as a separate field in `clients.yaml`.* Rejected — auto-detect is more robust. The `WIKI-CLAUDE.md` marker and `decisions/`+`log/` structural marker both work without per-project config.
- *Read every file recursively in default mode.* Rejected — torches context window on big repos. Wiki-aware promotion is the right scalpel.
- *Defer until manual workarounds prove painful.* Rejected — already painful once today. Fixing now prevents the same miss on Thermal Kitchen, Inside Out, Wild Rose, and every other project as wikis come online.

**Owner:** Justin (BGD).

**How to apply:**

- Next `/load brandos` should now surface all 5 active + 3 deferred decisions in `site-builder-phase2/docs/wiki/decisions/` plus the most recent 10 log entries.
- When adding a new project repo with a wiki, register the directory containing (or one level above) `WIKI-CLAUDE.md` in the project's `docs_paths:`. No other config needed.
- If a future load run still misses wiki content, check (a) the wiki has one of the three detection markers and (b) the `docs_paths` entry points at or above the wiki root.
- Project-internal decisions should land in the project's wiki via `/grill-with-docs` or the `/wiki` skill, not in `claude-os/decisions/log.md`. If a decision is project-internal but ends up in the cross-project log, treat as a routing miss and move it.

**Open follow-ups:**

- Apply the same pattern to `/weekly-project-status` so its per-project briefs also surface wiki active/deferred decisions, not just the cross-project log.
- After Thermal Kitchen and Wild Rose each get a wiki, verify the auto-detect fires correctly on different repo layouts.

---

## 2026-05-18 — Ship `/onboard-client` skill: guided client/project intake

**Decision:** Scaffold a `.claude/skills/onboard-client/` skill that conducts an 8-question interactive intake for new clients (or new projects under existing clients), then writes the new entry to `clients.yaml`, scaffolds a memory file, optionally scaffolds a reference doc, updates `MEMORY.md`, and appends to `decisions/log.md` — all in one flow.

**Why:** The IowaEverywhere backfill earlier today exposed the rough edge — onboarding a missed client required 4 separate manual operations (edit clients.yaml, write memory file, update MEMORY.md, append decisions log). One skill collapses that into a single guided flow. Lowers the friction tax on adding new clients to the AIOS, which directly supports Q2 priority #1 (productize) and the BrandOS 30-day growth goal (10 dealers by 6/11).

**Method spec (compressed):**
- **Constraint solved:** Manual client onboarding friction.
- **EAD:** Automate. Eliminate fails (clients must be registered to be /load-able). Delegate fails (operator-only knowledge per intake).
- **Process:** Interactive intake → preview → confirm → atomic-ish writes. 8 questions max. Pre-flight slug uniqueness validation against `clients.yaml`.
- **Autonomy:** L2 Drafted. Skill drafts everything; Justin confirms preview before any write. No auto-population yet (Phase 1).
- **KPI:** Time-to-onboard from ~20-30 min (manual scattershot) to <5 min (single interview).

**Alternatives considered:**
- *Free-form chat-style intake instead of structured prompts.* Rejected — predictable structure makes the skill debuggable and forces uniform data quality across clients.
- *Auto-populate contacts from Gmail.* Rejected for Phase 1. Bike Method Phase 2 candidate when manual flow is proven.
- *Skip the reference doc scaffold.* Rejected — having an empty stub at the conventional path makes future docs work obvious. Optional per-run via Q7.
- *Write to CLAUDE.md active-engagements list.* Rejected — that's hand-curated operator brain content, not auto-updated registry data.

**Owner:** Justin (BGD).

**How to apply:**
- First run: pick a safe test case (Crash Champions opportunity or a new BrandOS dealer) so the flow is exercised before it touches a high-stakes onboarding.
- After 5 successful onboardings, evaluate moving to Bike Method Phase 2 (Gmail-based contact pre-population).
- This skill paired with `/load-project` makes the full client lifecycle: onboard → load → work → log decisions → repeat.

---

## 2026-05-21 — Iowa State Fair 2027 redesign is the strategic exception to the Q2 no-new-custom-projects rule

**Decision:** The Iowa State Fair 2027 website redesign (Craft 5 rebuild through Hatch DSM) is authorized as the **strategic exception** to the CLAUDE.md hard constraint "no new custom one-off projects during the productization push." When the engagement moves from scoping → contracted, it lands as a standalone BGD project — separate SOW, separate engagement, separate from the current $1,600/$600 maintenance retainer.

Also corrected CLAUDE.md (line 29): dropped "— Iowa State Fair, etc." from the 2RM parenthetical. ISF is a BGD/Hatch client, not 2RM work.

**Why:**

1. **Visibility justifies the deviation.** ISF is one of Justin's highest-visibility clients — the 11-day August fair is a public-facing brand surface that dwarfs most BGD projects. Hatch DSM is also a multi-client agency relationship; saying "no" to the ISF redesign risks the broader Hatch relationship.
2. **Cycle timing makes deferral impossible.** 2027 fair launches August 2027. Working backwards: discovery done ~Q4 2026, build Q1-Q2 2027, launch by ~July 2027. Already in active scoping (Writemap mtgs 5/18-19/26, Whitney wishlist circulated 4/9/26). Pushing it to post-productization (post-July 2026) gives only 12 months for a full Craft 4 → Craft 5 rebuild including paperless camping rework — that's tight even on a fresh start.
3. **It doesn't fit a productized tier anyway.** Custom Craft 5 rebuild + Craft Commerce + custom camping reservation flow + paperless ops + multi-system integrations don't compress into the 18-month $X/mo BGD tier model. Forcing it into a tier would either understate the scope or distort the tier definitions Justin is trying to lock down.
4. **Productization push isn't actually threatened.** The rule's intent was to stop ad-hoc small jobs from absorbing the productization runway. ISF is the opposite — a single, large, known engagement with a hard 2027 deadline. It's an exception that proves the rule, not a pattern-break.

**Alternatives considered:**

- *Refuse the redesign and let Hatch find another developer.* Rejected — destroys 5-6 years of client trust + ongoing $1,600/$600 retainer + Hatch relationship optionality.
- *Try to fit ISF into a productized BGD tier.* Rejected per reason #3.
- *Defer the engagement until post-productization (after July 2026).* Rejected per reason #2 — squeezes the build window to <12 months.
- *Quietly do the redesign while pretending the rule still holds.* Rejected — that's how strategic boundaries silently erode. Documenting the exception is what keeps the rule intact for genuine ad-hoc work.

**Owner:** Justin (BGD).

**How to apply:**

- When the redesign moves from scoping → contracted, it gets its own SOW with separate billing and separate scope. Don't bundle into the maintenance retainer.
- When proposing pricing, anchor against project scale (Craft 5 rebuild + Craft Commerce + custom camping + paperless ops + integrations), not against productized BGD tiers.
- The Q2 hard constraint in CLAUDE.md still applies to *other* new custom one-offs (e.g., one-off site builds outside the productized tier). ISF is the named exception; don't extrapolate it into a general loosening.
- Memory: `project_iowa_state_fair_2027_redesign.md` updated to reflect the resolved deviation.

**Open follow-ups:**

- Capture Whitney's wishlist contents (the document Maggie forwarded 4/9/26) into memory or a reference doc before the next Writemap conversation.
- After the 5/18 + 5/19 Writemap meetings, log scope direction back to this log + the 2027-redesign memory file.
- When Hatch is ready to contract, draft the SOW with explicit scope/timeline separation from the maintenance retainer.

---

## 2026-05-31 — Deploy Answers is the Nel + Alex + Justin company name

**Decision:** The partnership LLC between Nel Santiago, Alexandra Sdoucos, and Justin is named **Deploy Answers**. Originally "Deploy Assist" but renamed because domain was taken by URL squatters. Filing as Texas LLC via Bizee. Products under the umbrella: Backup Bison (Vimeo backup utility), Clappy (video production/editing tool).

**Why:** Nel corrected the name in the 4/30 Agenda Items email thread. Alex confirmed. Domain availability drove the rename.

**Alternatives considered:**

- *Deploy Assist* — original pick, blocked by squatters.

**Owner:** Nel (filing), Alex (commercial/ops), Justin (product/platform).

**Also locked:** Alex's last name is **Sdoucos** (Executive Producer, Doozy Films). "Chacon" was a Google Calendar display name artifact. Email: alexsdoucos@gmail.com.

---

## 2026-06-01 — Nel + Alex (Deploy Answers) partnership: go/no-go = GO

**Decision:** The Nel + Alex + Justin partnership is a **GO**. Justin is committing directionally. The **formal operating structure** — equity split, revenue share, roles/decision rights, IP ownership, time commitment — is **not yet defined**. That is the next body of work; the GO is being recorded now without prematurely committing to a structure.

**Emerging thesis:** Justin expects to need support on **BrandOS** as it scales, and that is the likely point where Alex and Nel "fold in" — Alex on commercial/sales, Nel on technical/delivery. This raises the central structural question to resolve next: does BrandOS stay **BGD-owned** with Alex/Nel partnered or contracted into it, or does BrandOS come **under the Deploy Answers umbrella**? Cap-table and IP implications diverge sharply between the two.

**Why:** CLAUDE.md priority #3 calls for a formal go/no-go on the Nel + Alex partnership inside the 12-month plan. Justin is resolving the go/no-go now (GO) and de-risking by sequencing the formal-operating decisions next, rather than locking a structure before the economics are understood.

**Open items before "formal operating" is fleshed out:**

- Keep two ventures clean: **Deploy Answers** (Backup Bison, Clappy — Nel/Alex products) vs **BrandOS** (BGD product). Same people, different economics.
- Define what "support in BrandOS" means concretely — sales, delivery, or both — and who owns each client relationship.
- Equity + revenue-share model per venture. IP ownership (BrandOS IP is currently Justin's/BGD's).
- Coordinate Alex's commercial role with **Jon Liebl's** sales channel to avoid overlap/conflict.
- Capacity: partnership operating load against Justin's already-maxed hours (the pivot exists to escape the hours ceiling — partnership must reduce load, not add it).

**Owner:** Justin (BGD). Partners: Nel (filing/technical), Alex (commercial/ops).

---

## 2026-06-03 — AIOS reframe: dispatcher + strategic partner, not project worker

**Decision:** AIOS (claude-os) is being reframed around two jobs only:

1. **Strategic business partner.** Cross-cutting intelligence that no single project wiki holds — BGD thesis, pivot strategy, revenue targets, pricing, client relationships, positioning. The thinking room for "should I take this deal?" and "what's my MRR gap?"

2. **Dispatcher/receptionist.** Thin awareness of every project and client. Triages incoming work, routes with the right context slice to a focused project session via `/load-project`. Doesn't do deep project work itself.

What AIOS keeps: daily inbox view (lighter/dashboard-style), email reply drafting with inline interaction, project snapshot board, MRR view, client onboarding (creates project wikis then lets them go), calendar awareness.

What AIOS stops doing: deep project-level work (that's the project wiki + project repo session), heavy process rituals requiring manual triggers.

**Two-layer knowledge filtering (new):** Not everything that crosses Justin's desk is project-relevant. AIOS applies a filter before staging to a wiki: "Does this change what the project knows about itself?" Client moved a launch date → wiki. New stakeholder → wiki. Scope/pricing shift → wiki. "Yeah Tuesday works" → stays at AIOS operational layer. "Can you resend the logo files?" → operational, dies at AIOS.

Defense on both sides: AIOS filters on the way out (deciding what's wiki-worthy). Wiki ingest filters on the way in (evaluating against what the project already knows — redundant? skip; contradicts something? flag; genuinely new? promote). The wiki becomes self-curating, not just a bucket.

**Routines over manual triggers:** Daily triage, project snapshot refresh, MRR reconciliation should run on schedules. AIOS does its morning prep before Justin sits down. He opens to a ready dashboard, not a process to run.

**Why:**

1. **AIOS feels cumbersome at the project layer** (feedback logged 2026-05-23). Justin works in project repos directly, not from claude-os. The friction is because AIOS tries to be both dispatcher and worker.
2. **Project wikis are working phenomenally.** The compounding knowledge pattern is proven across BrandOS, Iowa Everywhere, Wild Rose, Inside Out, Mr Gym. AIOS should dispatch to them, not compete with them.
3. **Inspired by Matt Pocock's "handoff" concept** (YouTube, May 2026). Core insight: small, focused context beats large, diluted context. LLMs have a "smart zone" (~0-120k tokens) and a "dumb zone" (everything past). AIOS as the thin routing layer that stays permanently in the smart zone by never going deep into implementation.
4. **The strategic partner role is where AIOS earns its keep.** Business model, client relationships, BGD direction, what to say yes/no to — this is cross-cutting intelligence that lives nowhere else. No project wiki holds this view.
5. **Daily triage has the right intelligence but wrong ergonomics.** AIOS understands projects well enough to write good replies. It understands Justin's voice. The understanding is there; the interaction layer isn't. Too many steps between seeing an email and acting on it.

**Alternatives considered:**

- *Keep AIOS as-is and iterate incrementally.* Rejected — the friction is architectural (trying to be two things), not incremental (needs polish). Polish won't fix the identity problem.
- *Move everything into project wikis and eliminate AIOS.* Rejected — cross-cutting strategic intelligence has no home in any single project wiki. The dispatcher/receptionist role is genuinely needed.
- *Build a separate UI/dashboard app.* Premature — validate the reframed model inside Claude Code first. If the CLI interaction model proves insufficient for the dashboard use case, that's a future decision.

**Owner:** Justin (BGD).

**How to apply:**

- This decision shapes the next milestone for claude-os itself. GSD roadmap to follow.
- Existing skills (`/daily-inbox-triage`, `/weekly-project-status`, `/load-project`, `/onboard-client`) are retained but evaluated against the two-job model.
- Wiki ingest skill (`/wiki ingest`) gets a relevance-check upgrade: evaluate incoming content against what the project already knows before promoting from `raw/`.
- Scheduled routines exploration begins — move daily triage and weekly status from manual triggers to automated schedules.
- AIOS-to-wiki staging becomes a natural byproduct of triage, not a deliberate process.

---

## 2026-06-09 — Terraplex rollout plan doubles as the BrandOS pricing proposal

**Decision:** No major BrandOS build work for Terraplex (site redesign, training section, portal rollout) until the Cherity + Jon pricing/rollout meeting happens. The rollout plan document carries the pricing structure (board-prepped 2026-06-06: $800/mo distributor + $15/mo per-dealer portal fee + $250/mo dealer sites), so that meeting approves a structure instead of opening a negotiation. Small already-owed Craft items (homepage I19 graphic, quote-request functionality) proceed on the existing retainer.

**Why:** The 2026-06-09 monthly status landed the BrandOS introduction — Cherity aligned on implementing, redesign prioritized, her permissions question was a buying signal. But pricing was deliberately deferred ("determined as we move through implementation," "proof of concept"), six of eight action items landed on Justin, and no follow-up dates were set. That's the shape of the old model: scope expanding on a $600/mo retainer. The rollout plan is the leverage point — Cherity already wants it, so pricing arrives inside a document she asked for. Two dependencies stand between now and money (Jon demo, then the three-way meeting); getting the Jon demo scheduled this week protects momentum against the Dakota Fest timeline.

**Alternatives considered:** Build first, price later (rejected — repeats the free-work pattern the pivot exists to kill). Separate pricing pitch (rejected — a standalone money conversation invites negotiation; anchoring inside the wanted rollout plan doesn't).

**Owner:** Justin (BGD).

---

## 2026-06-10 — Fable 5 pilot: multi-agent product definition + solo GSD planning validated; execution approved

**Decision:** The Fable 5 pilot on BrandOS (Marketing Materials Builder) passes its planning stages and proceeds to execution. The full chain ran in one day: 3-agent deliberation (7 rounds: positions, convergence, AI-handoff verdict, 24-source research, taxonomy grill) → adversarial grill-me with a fresh Fable defender (13 questions, one empirical Chromium render experiment) → operator corrections → solo single-agent GSD planning (7 plans, 5 waves, 24 tasks) → 5-round codex adversarial review (25 findings, all accepted and applied, funnel 15→10→5→4→1, operator accepted at cap). Output artifacts: brief ACTIVE at `repos/brandos/docs/wiki/plans/marketing-materials-builder-brief.md`, Phase 05 execution-ready in `repos/brandos/.planning/`.

**Why:** Stage-gate evidence, not vibes. Fable one-shot the planning pipeline solo and caught its own requirements gap (artifact_type schema); the grill defender ran a real experiment instead of agreeing (rendered a 33"x80" PDF and inspected the objects) and admitted an invented argument when pressed; codex still found 25 real issues, meaning the cross-model loop remains load-bearing even on Fable-authored plans. Total burn ≈ 5M subagent tokens across all stages, all inside Max plan limits during the free Fable window (ends 2026-06-22).

**Lessons that change how we work:**
- Agent RESUMPTION is the hidden cost: resumed agents re-read their growing transcript every round (planner: ~179k first run → ~504k by round 5; six runs summed ≈ 2.3M). Prefer fewer, fatter exchanges; for execution, use FRESH executor agents per plan, never one long-lived resumed agent.
- Sub-agent fan-out discipline held: single-agent planning matched multi-agent quality at a fraction of the cost — fan out for independent perspectives (deliberation, verification), not for pipeline stages.
- Codex review on Fable plans: still worth it. 5 blockers in round 1 were code-verified facts (hardcoded GCS prefix, hardcoded cart nav, null MSRP, nonexistent ticket service) that would have surfaced mid-execution as rework.

**Alternatives considered:** Skip codex review since Fable planned it (rejected — 25 findings say no). Run execution as one resumed agent for continuity (rejected — resumption economics).

**Owner:** Justin (BGD).

---

## 2026-06-12 — claude-os restructured: CLAUDE.md as router, single inbox, dispatch pipeline

**Decision:** The AIOS repo is restructured around the router principle (Nate Herk, "Ultimate Second Brain" video, ingested 2026-06-10) and the 2026-06-03 dispatcher reframe. Five moves, executed same day as the deciding audit:

1. **CLAUDE.md is a router, not a content store.** Evergreen identity stub + operating model + complete routing tree + rules + full skills table. Dated facts are banned from the file; they live in `context/` (priorities, about-business, about-me, financials), which is now the single source of truth. The router test (could Justin find it by hand; does the agent find it fast; do facts in the manual rot) becomes a standing maintenance rule and part of `/audit`.
2. **One inbox.** `archives/raw/` is THE drop point. The empty root `raw/` is gone. Strays in `docs/` root (Gemini PDFs, docx, screenshot, txt) swept into `archives/raw/`; one-off meeting notes moved from `references/` to `archives/references/` (clients.yaml path updated).
3. **`/dispatch` skill created** — the read-and-route pipeline: inventory inbox, classify with the two-layer filter ("does this change what the project knows about itself?"), route (wiki `raw/aios/` staging per ADR 0004, context/, references/, decisions, todos), update `state/<slug>.md`, log to `archives/raw/ROUTING-LOG.md`.
4. **`/brief` skill created** — the springboard: state/ + todos + decisions tail + priorities + calendar → "what needs a decision today." No email fetch, no researcher agents.
5. **`/load-project` retired** to `archives/skills/` (deprecated since 2026-06-04; project wikis are self-sufficient).

**Why:** The 2026-06-12 audit found CLAUDE.md half router, half dumping ground: three facts already rotten (5/30 pitch listed as upcoming, $1,700 MRR vs actual $1,950, ToneQuest listed as in-flight), the routing tree blind to `state/`, `todos/`, `docs/wiki/` (the advisory board), and the skills table listing 3 of 9 installed skills. Duplication between CLAUDE.md and `context/` guaranteed drift; the fix is structural (one canonical home per fact, router points to it), not editorial.

**Alternatives considered:** Patch the stale facts in place (rejected — same class of drift recurs; the audit's job is to kill the class). Adopt Nate's full monorepo "other worlds" pattern, moving project repos inside claude-os (rejected — BGD project repos are client deliverables that deploy and hand off independently; the hub-and-spoke two-tier model already delivers cross-project context via clients.yaml docs_paths).

**Owner:** Justin (BGD). ADR: `docs/adr/0006-claude-md-as-router.md`.

---

## 2026-06-12 — /level-up: session-wrap automation scoped and shipped as /wrap (bike phase 1)

**Decision:** This week's level-up artifact is `/wrap` — a user-level skill (`~/.claude/skills/wrap/SKILL.md`) that wraps any project session in one word: digest (accomplishments / decisions / struggles / next steps / open questions) staged to the project wiki's `raw/aios/`, STATE.md updated, breadcrumb appended to `~/.claude/session-wrap.log`. Bike Method phase 1: manual trigger only; the Stop/SessionEnd hook automation is phase 2, gated on a validated week of manual runs (known blocker: SessionEnd doesn't fire from the IDE extension, debugged 2026-06-04).

**Method spec (3Ms):**
- *Constraint:* knowledge capture depends on Justin remembering wrap-up commands at session end — ~23 manual asks/week across all repos (retros/retro-2026-06-12.md pattern #1); a lapse cost ToneQuest a month of inbox/wiki backfill.
- *EAD:* Eliminate rejected (ToneQuest was the elimination experiment; it failed expensively). Delegate rejected (no person fits). Automate: ~60% deterministic (detection, writes, logging), ~30% AI (the digest), ~10% manual (wiki-ingest promotion stays the reviewed step per ADR 0004).
- *Process:* trigger = /wrap now, hook later; sources = live session context; transform = session → structured digest with retro-minable Struggles section; decisions = substance gate, wiki-or-STATE-only, never curated pages; destination = wiki raw/aios/ + STATE.md + breadcrumb log.
- *Autonomy:* L2 now (AI drafts in-session, Justin sees it), L3 at hook stage (staging inbox is the review buffer). No L4; curated content untouchable.
- *KPI:* less-cost bucket. Primary metric: manual wrap-up asks/week counted by /retro — baseline 23 (2026-06-12), target <5 within two retros. Secondary: all active state files <7 days old (/brief flags).

**Why this candidate:** highest-leverage pattern in the first retro (count, cross-repo spread, demonstrated failure cost), half-built already (scripts/state-hook), and its digest store becomes /retro's phase-2 clean input — one build feeds two systems.

**Owner:** Justin (BGD). First retro checkpoint: 2026-06-19.

---

## 2026-06-13 — Onboard Global Ag Network: convert ad-hoc support into a paid rebuild engagement

**Decision:** Formalize Global Ag Network (GAN) as a BGD engagement. Justin has been GAN's de facto web/tech support since ~2023 with no retainer, and already holds the Craft/SEOmatic/Ad Wizard licenses + the DigitalOcean account. Delaney Howell (Ag News Daily president, GAN host) emailed 2026-06-12 with two support asks plus an explicit request to re-engage on transitioning the site. The play: convert the unpaid ad-hoc relationship into a paid website rebuild + hosting-stabilization engagement. Project kicked off in its own repo (`repos/global-ag-network/`, private GitHub repo `beardedgingerdesigns/global-ag-network`), wiki seeded, `clients.yaml` entry added (bucket: prospects). Meeting locked: **Fri 2026-06-19 10:00am CT** ("GAN - Touchbase", Google Meet, invite sent to Delaney 2026-06-13).

**Why:** It's a warm reinitiation, not a cold sale — Justin already does the work and holds the infrastructure, so the only thing missing is a contract. The DigitalOcean payment pause that broke podcast playback (fixed 2026-06-12 as the opening win) is exactly the kind of fragility a formal hosting engagement prevents, which makes the pitch self-evident. Bucket is `prospects` because there's no signed retainer yet (MRR $0); converting to a real number is the Friday goal. Fits the BGD pivot: solve the business problem (stop the site from biting her), productize the fix as recurring hosting + a rebuild, not a one-off.

**Alternatives considered:**
- *Keep doing it ad-hoc for free.* Rejected — Justin already carries the licenses + DO account cost with zero recurring revenue; the relationship is real but financially upside-down.
- *Quote a one-off rebuild only.* Rejected — leaves the hosting fragility (and the unpaid support drip) unsolved. The recurring hosting-stabilization piece is the point.
- *Push the engagement to a later quarter.* Rejected — Delaney initiated the re-engage now and there's a live, fixable pain (playback) to convert into momentum.

**Owner:** Justin (BGD).

**How to apply:**
- Friday 6/19: resolve Buzzsprout vs self-hosted feed, confirm co-host (Mike vs Tanner), confirm Successful Farming ad-deal status, and turn the engagement into a real retainer number (update `clients.yaml` `mrr_monthly` + bucket once signed).
- Email-license question (`delaney@globalagnetwork.com`): lean is "safe to drop," but confirm together Friday before she cancels — draft reply queued in Gmail.
- Deep project state lives in `repos/global-ag-network/docs/wiki/`; thin state in `state/global-ag-network.md`.

**Open follow-ups:**
- Convert prospect → active client with a signed retainer after Friday.
- Decide rebuild platform (Craft stays vs. migrate).

---

## 2026-06-13 — Refocus: BrandOS to launch is the priority; AI-services research is a map, not a backlog

**Decision:** Reorder current focus. **BrandOS-to-a-launch-state plus the in-flight client projects are the active priority.** The AI-services pivot (proof point #2) is reclassified from active work to **mapped exploration, parked.** The recent research wave (`brainstorm/research-*-2026-06-06.md` productization/competitive/cross-synthesis, plus the `overnight-*.md` set) is kept as a knowledge map to revisit when the pivot activates — it is explicitly NOT a list of immediate action items. The pricing forks it proposed ($2,500 retainer / $1,500 audit / kill the $750 tier, `/roi-track` build) are not ratified and not pending. priorities.md reordered to match; the stale "first paying AI-services client by end of June" target is removed.

**Why:** The pivot's proof-point #2 was gated entirely on Jon selling it, and **Jon keeps punting — the 5/30 partnership conversation never happened.** With no sales motion, chasing AI-services pricing/automation now is building ahead of demand. BrandOS (proof point #1) is real, closer to revenue, and the thing Justin can move without waiting on anyone. Mapping the AI-services opportunity was valuable (it's captured); acting on it now is not. One concrete thread Justin does want to pursue: re-engaging Co-Line Manufacturing (existing $75/mo client, stalled redesign) — tracked as a todo, led by the relationship rather than an AI pitch.

**Alternatives considered:**
- *Keep AI-services as priority #1 and ratify the pricing now.* Rejected — no buyer in motion (Jon stalled); ratifying pricing for a sales channel that isn't selling is premature.
- *Drop / archive the research.* Rejected — the mapping is genuinely useful; the call is to park it as reference, not discard it.
- *Wait on Jon indefinitely with an open "log the 5/30 outcome" to-do.* Rejected — there's no outcome to log; the open to-do was a false premise. Reframed to "parked, re-activate if Jon initiates."

**Owner:** Justin (BGD).

**How to apply:**
- Treat `brainstorm/research-*` and `overnight-*` as a map. Do not surface their recommendations as overdue action items in `/brief` or `/weekly-project-status`.
- Active focus = BrandOS launch + current projects (Thermal Kitchen 6/16, Wild Rose, Inside Out, ToneQuest, Global Ag Network).
- Co-Line re-engagement is the one AI-adjacent thread to advance, and it leads with the existing relationship.
- Re-activate the AI-services pivot when a buyer appears — and source that demand through non-Jon channels rather than waiting on Jon (don't gate the business on Jon; core memory `feedback_reduce_jon_dependence`).

---
