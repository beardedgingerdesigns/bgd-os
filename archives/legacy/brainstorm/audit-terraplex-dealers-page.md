---
client: bgd-hq
project: brandos
type: audit
target: https://beardedgingerdesigns.com/terraplex-dealers
status: open
captured: 2026-05-11
---
# Audit: beardedgingerdesigns.com/terraplex-dealers

Reviewed via screenshot 2026-05-11 (live page fetch returned only title + meta, suggesting JS-rendering with no SSR — see Finding #4).

## What the page does well

- Clean hero with prominent "$250/mo" pricing matching current dealer rate.
- 6 well-grouped feature cards: Launch Fast, Lead-Gen Ready, Terraplex-Aligned Branding, Dealer-Friendly Updates, Showcase Services + Products, SEO + Performance Basics.
- 8-item "What's Included" checklist sets clear scope.
- FAQ section addresses likely objections (content not visible in screenshot — collapsed).
- In-page application form with qualifying fields: business name, contact, email, phone, city/state, existing website, services offered (Drone Sales / Spraying / Training / Service & Repair / Parts / Other), notes/goals.
- "1 business day follow-up" SLA on form submission.
- Footer mentions a 3-tier ladder: Starter $250 / Full $400 / Legendary $650.
- **Works as a HubSpot email CTA destination as-is.** Funnel is clean: email → page → application form → BGD follows up.

## Critical finding — please verify

### Finding 0: "One-page dealer website" claim — accurate or stale?

The "What's Included" list says: **"One-page dealer website (header, services, about, contact)."**

This contradicts the multi-page reality of current dealers:

- Pyro Ag — I-19 and R-32 dedicated product pages just shipped 2026-05-08
- Black Knight Drones — launched drone pages (per 2026-05-02 activity snapshot)
- Truss Services — full multi-page site
- New Heights Ag — drone pages approved for deployment

**Pricing context (clarified 2026-05-11):** Terraplex dealers get a flat $250/mo, no other tiers. The Starter / Full / Legendary ladder in the footer is BGD-general pricing for non-Terraplex business, not relevant here.

So the question is narrower:

- **(a) "One-page" is accurate at launch.** New dealers go live with one page. Additional pages (product, location, etc.) get added over time as part of "Ongoing updates and technical support" — included in the $250/mo, no upcharge. Current dealers are just further along the relationship arc.
- **(b) "One-page" copy is stale.** New dealers actually get more at launch (multi-page from day one). Page copy hasn't caught up.

**Resolved 2026-05-11:** Option (a) is the reality. New dealers launch with a one-page site that grows over time (product pages, dealer content, location pages added through ongoing-support hours, no upcharge). Multi-page from start is possible — Truss did this — but one-page launch is the standard journey.

**Copy edit needed:** the current "One-page dealer website (header, services, about, contact)" line is accurate but understates value. The growth dimension is the actual story and a real differentiator (DIY platforms don't grow with you; agency builds re-bill for new pages; BGD just adds them).

**Proposed copy edit for the "What's Included" line:**

> Launch-ready one-page site that grows with your business. Add product pages, dealer content, and more as you scale — included in your subscription.

**Alternative: add a new feature card to the "Built for Dealer Success" section.** Replace one of the existing six or add a seventh:

> **Built to Grow With You** — Launch fast with a one-page site, then add product pages, dealer content, and service pages over time. No new contracts. No upcharge. Your subscription includes ongoing additions as your business grows.

This frames the growth path explicitly and turns a possible buyer concern (*"is one page enough?"*) into a strength (*"the site grows as my business grows"*).

## Other findings, ranked

### Finding 1: No social proof from current dealers

The HubSpot email draft leans heavily on naming 5 current dealers as proof points. The landing page reinforces nothing.

**Recommendation:** add a dealer logos row, 1-2 site screenshots, named pull quote from Pyro or Kelcey. The 2026-05-07 Pyro check-in has Kelcey saying *"so far it seems to be doing well"* — usable quote with permission. Easy lift, high credibility return.

### Finding 2: Footer Plans tier ladder is BGD-general, not Terraplex-specific (RESOLVED 2026-05-11)

Initially flagged as a tier-ladder confusion. Clarified by Justin: Terraplex dealers are flat $250/mo with no other tier options. The Starter / Full / Legendary listing in the footer applies to BGD's general pricing for non-Terraplex business, not to this page's audience.

**Implication:** the footer ladder is unrelated to this campaign and doesn't need to be explained or removed for the Terraplex dealer use case. However, displaying it on a Terraplex-only page could still cause buyer confusion. Worth a thought:

- Keep as-is (slight risk of "wait, which tier am I in?" confusion)
- Hide the Plans section on this specific page only
- Add a clarifying note ("Terraplex dealers: flat $250/mo, single tier")

Low priority. Doesn't gate the campaign.

### Finding 3: No platform / BrandOS positioning

The page sells "a website." The demand signal from Pyro and New Heights is for the **platform** (marketing materials, trade-show kits, dealer portal access). Dealers who'd respond strongest to platform thinking are receiving a website pitch.

**Recommendation:** add a "What's coming" or "Built on a platform" section. Signal the bigger picture without overpromising delivery dates. Example positioning: *"Your dealer site is the front end of a growing platform. New capabilities (marketing materials library, trade-show kits, dealer portal) are landing across 2026 — yours when they ship."*

### Finding 4: SEO discoverability — verify SSR status

Live page fetch (2026-05-11) returned only the page title and a truncated meta description. Body content (hero, features, pricing, FAQ, form) did not appear.

This strongly suggests the page is JavaScript-rendered with no server-side rendering or pre-rendering. If Googlebot renders the same way, organic discovery for "Terraplex dealer website" or similar queries is effectively blocked.

**To verify:**

1. View source in the browser (Cmd+Option+U on Mac). Is the dealer content in the initial HTML, or only injected by JS?
2. Check Google Search Console for the URL's indexed status.
3. Test with `curl https://beardedgingerdesigns.com/terraplex-dealers` and see what content arrives.

**Impact:** the HubSpot campaign works fine regardless (you're sending the link directly). But organic discovery is a hidden marketing tax until SSR or pre-rendering is added. Probably a real fix needed during the productization push.

### Finding 5: Application form doesn't qualify Terraplex network membership

Anyone can submit. Probably fine in practice given the page is targeted, but worth a thought.

**Recommendation:**

- Add a "Are you currently part of the Terraplex dealer network?" yes/no checkbox, OR
- Add a note in the intro copy: *"This program is currently for Terraplex network dealers."*

Reduces noise in submissions and primes the buyer's expectation.

### Finding 6: Contract length (18 months) needs to surface (RESOLVED 2026-05-11)

The 18-month commitment is real and material. Verified with Justin.

**Two-part fix recommended:**

**Part 1 — surface lightly near pricing.** On the hero and/or the "$250/month" callout block, append:

> $250/month · 18-month subscription

Transparent up-front. Reduces "surprise on signature" risk.

**Part 2 — add or expand the FAQ entry.** If the FAQ doesn't already include contract length, add:

> **Is there a contract length?**
> Yes. Dealer subscriptions are 18-month commitments. After 18 months you can continue month-to-month, renew for another term, or move on with everything you've built.

The "move on with everything you've built" line is a soft trust signal — implies your site isn't locked into BGD's platform in a way that would hold the buyer hostage. Frame check with Justin: is this actually true? If a dealer leaves at month 18, what do they get to take?

### Finding 7: "Apply" framing implies selectivity

"Apply Now" reads as gated. Could be intentional positioning (vetting fit). Could slow volume.

**Options:**

- **Keep "Apply"** — leans into a "qualified program" positioning, raises perceived value
- **Switch to "Get Started" or "Request a Conversation"** — lower friction, higher volume
- **A/B test** if traffic volume allows

For a 30-day push targeting a finite known list via HubSpot, "Get Started" might convert better. For longer-term positioning as a selective dealer-program, "Apply" reinforces brand.

### Finding 8: Footer positioning anchor

Footer copy: *"Subscription web design for Midwest businesses. Beautiful websites with no big invoices."*

This is a real positioning anchor. Locks BGD's market identity to Midwest + subscription model. Choice worth a deliberate review against:

- BrandOS vertical-SaaS thesis (eventually multi-vertical, multi-geography)
- Future manufacturer-tier expansion (Russell is NC-based — not Midwest)
- Whether you want this page to feel BGD-services-y or BrandOS-platform-y

Probably fine for the dealer-acquisition use case. Worth re-examining as BrandOS matures.

## Recommended fix priority for the 30-day plan

Before sending the HubSpot campaign, **must-fix:**

- ✋ **Finding 0** — resolve "one-page" copy vs reality. Buyer expectation must match what they actually get at launch.
- ✋ **Finding 6** — surface contract length somewhere. Buyers will ask anyway.

**Should-fix before send:**

- 🔧 **Finding 1** — add minimal social proof (logos row or pull quote from Pyro)
- 🔧 **Finding 5** — add Terraplex membership qualifying line on the form or intro

**Nice-to-fix, don't gate the campaign:**

- 🎨 Finding 3 — platform positioning section
- 🎨 Finding 7 — Apply vs Get Started framing
- 🎨 Finding 8 — footer positioning copy review
- 🎨 Finding 2 — clarify or hide BGD-general Plans section on this specific page

**Parallel infrastructure work (not blocking campaign):**

- 🛠 **Finding 4** — verify SSR status and fix if needed. Doesn't block this campaign (HubSpot sends the link directly) but blocks organic discovery for future cycles.

## Open questions

- What's actually in the FAQ collapse? Need that content to complete the audit.
- What are the actual scope differences between Starter / Full / Legendary tiers?
- Is there an analytics setup on this page (form submissions, conversion tracking)? Tracking what works during the 30-day campaign matters.
