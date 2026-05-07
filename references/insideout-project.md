---
client: inside-out
project: inside-out-website
type: brief
---
# Inside Out Iowa redesign

Originally compiled 2026-05-02. **Re-synced from inbox 2026-05-05** — review timeline expanded, two new stakeholders, design-decision delta from Apr 20 review, golf-sponsorship status, possible $300 Dec-2025 invoice question.

## Project overview

Inside Out Wellness & Advocacy (insideoutiowa.org) is an Iowa-based mental health nonprofit. Justin is redesigning their website. They serve two audiences: people in crisis / family members, and partner providers (doctors, schools, ERs needing referral forms). Melinda Dennis is the primary contact. Stevi Bundy is the second design reviewer.

**Contract:** $400/month. Auto-invoiced via Bonsai. May invoice ($400, due May 31) sent May 1.

## Stakeholders

| Person | Contact | Role |
|---|---|---|
| Melinda Dennis | mdennis@insideoutiowa.org | Primary client contact |
| Stevi Bundy | sbundy@insideoutiowa.org | Co-reviewer with Melinda |
| Kristen McKillip | kmckillip@insideoutiowa.org | HR Manager (Indeed/job listings) |
| **Scott Allen** | sallen@insideoutiowa.org | **Finance — viewed/reviews BGD invoices in Bonsai. Justin sent address-change note here.** (Added 2026-05-05.) |
| **D. Nielsen** | dnielsen@insideoutiowa.org | **Golf-event coordinator. CC'd on PUTTING Stigma to Rest registration receipt May 1.** Role unconfirmed. (Added 2026-05-05.) |
| Minda Davison | minda.davison@gmail.com | 2RM photographer. Intro for headshots (Mar 11). No confirmation thread visible since. |

## Timeline

| Date | Event |
|---|---|
| Jan 16, 2026 | Insideout Touchbase. Aligned on dual audiences, Partner Providers hub, referral forms per service, HIPAA email approach, nav structure. |
| Mar 11, 2026 | Justin connected Melinda with Minda Davison (2RM) for professional headshots. |
| Mar 12, 2026 | Golf outing sponsorship ask. Justin committed to "Par" + "First Responder Sponsor." |
| Mar 23, 2026 | Design review scheduled. |
| Mar 26, 2026 | Melinda rescheduled — Florida trip + Stevi out. Pushed to following Wed/Thu. |
| Mar 31, 2026 | Justin confirmed reschedule. Asked for Stevi's email for the invite. |
| Apr 2, 2026 | Design review meeting (Gemini notes: "Design Reivew - InsideOut"). |
| Apr 6, 2026 | Justin sent outstanding-items recap to Melinda + Stevi: colors, hero, team, location pages, service pages all in progress. |
| Apr 9, 2026 | Melinda sent: Mobile Crisis Map, Service Flyers, looped in Kristen for Indeed integration. |
| Apr 11, 2026 | Craft CMS license auto-renewals processed (Craft Pro, SEOmatic, Navigation for insideoutiowa.com). |
| Apr 17-20, 2026 | **NEW round of Melinda + Stevi review.** Captured below in the "Apr 20 review" section. |
| Apr 18, 2026 | Melinda check-in: "rough week at the center." Justin confirmed nothing extra needed. |
| Apr 20, 2026 | Justin replied with action list (5 design changes, content-draft target Apr 24, Vimeo + Indeed loose ends). |
| Apr 23, 2026 | Bonsai logged Scott Allen viewing **three** BGD invoices: $400 (May 1), $400 (Mar 30), **$300 (Dec 15, 2025)**. The Dec 2025 invoice may be a stale unpaid item — confirm in Bonsai. |
| Apr 24, 2026 | Melinda confirmed most old videos unusable; only Tony's clip from FB Sept 19, 2023 may be salvageable. Asked "what else do you need from me?" — currently unanswered. |
| Apr 27, 2026 | Justin emailed Scott + Melinda about address change (move was Apr 20-21). Mentions outstanding invoices already sent the prior week with wrong address. |
| Apr 28, 2026 | Melinda followed up on golf sponsorship payment ("wrapping up donations this week"). |
| May 1, 2026 | Bonsai auto-sent May invoice ($400, due May 31). Justin received golf-event registration receipt for PUTTING Stigma to Rest (Jun 5). |

## Design decisions

**From Apr 2 review:**
- Reject illustrative imagery. Melinda has negative association (former regional org). No hands, no hearts. Hybrid of competitor-style stock + real photos eventually.
- No 988 number on front page. Keep 844-428-3878 crisis line visible.
- Color update: darker teal (not lighter), purple replaces mustard/amber, cream background stays.
- CTA update: secondary header link "I'm a Provider" → "Make a Referral." Primary nav keeps "Partner Providers."
- Partner Providers page: hub with services, intake forms, expected response times.
- Team page: executive + management team featured. Program managers linked from their service pages.
- Insurance info: private insurance restricted to outpatient therapy + substance-use pages, not on homepage.

**From Apr 20 review (new — Melinda + Stevi feedback):**
- **Color variety per service** — accent colors per service to break up the teal monoculture.
- **Box/card treatment** — more dynamic. Stronger background or outline. Bumped service-name typography for attention-grab.
- **"Coping strategies" → "resources" language reframe** — site copy should orient toward finding/connecting clients to resources, not coping-strategy framing.
- **Woodward page** — Perry photo currently showing there. Fix.
- **Stevi's contact info** — remove from partner pages (was leaking direct contact).

## Repo state (as of 2026-05-02 sweep)

Repo: `beardedgingerdesigns/inside-out`. Single commit: "Initial commit: Inside Out Wellness site prototype."

**Pages built:** index.html, who-we-are.html, open-positions.html, partner-providers.html, crisis-stabilization-adults.html, crisis-stabilization-children.html, perry.html.

**Missing pages:** mobile crisis response, peer support, community support, transitional living, outpatient substance use; Woodward + Knoxville locations ("Coming Spring 2026"); blog.

Assets in `brand_assets/`. Shared CSS/JS scaffolds present.

## What's blocking progress

**On Justin (commitments made, status unclear):**
- **Full content draft for Melinda + Stevi review.** Justin promised by Friday Apr 24 in his Apr 20 email. **Past due 11 days.** Whether shipped is not visible in inbox.
- **Indeed integration follow-up with Kristen.** Justin promised "this week" in Apr 20 email. No subsequent thread with Kristen visible.
- **Golf sponsorship payment.** Sponsorship registered May 1; payment status unclear. Melinda's Apr 28 ask is unanswered.
- **Reply to Melinda's Apr 24 "what else do you need from me?"** — open thread.
- **Possible $300 Dec-2025 unpaid invoice.** Bonsai Apr 23 view-event suggests it may still be open. Verify in Bonsai before assuming.

**On client (waiting on inputs):**
- **Vimeo links** — peer support, crisis stabilization, CIT. Justin asked Apr 20.
- **Photography** — building/common-area + headshots. Minda intro Mar 11; no confirmation thread.
- **Mission/values copy** — Melinda mentioned delegating; org had a rough week Apr 18.
- **Referral form routing logic** — Stevi knows; Stevi never directly looped into the project.
- **Useful video assets** — Apr 24 Melinda confirmed old videos mostly unusable; Tony's FB clip from 2023 is the candidate.

## Open questions

- When does Melinda want the next review? No date set since Apr 2 + the Apr 17-20 async round.
- Is Minda Davison's photography session on the calendar?
- Has Stevi provided referral routing logic yet?
- Is there a target launch date for the site?
- Is the $300 Dec-2025 invoice actually outstanding, or was it the duplicate-view of an already-paid item?

## Tags

`active` `wrap-up-window` `Q2-priority`
