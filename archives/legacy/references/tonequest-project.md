---
client: tonequest
project: tonequest-replatform
type: brief
---
# ToneQuest replatforming

Originally compiled 2026-05-02. **Re-synced from inbox 2026-05-05** — Wordfence severity upgraded (suspected compromise indicator), Liz's Apr 28 product spec captured in full, Friday May 8 2pm EST check-in scheduled, project framing has shifted to "Claude AI + Pelcro AI" build per Liz's understanding.

## Project overview

ToneQuest Report (tonequest.com) is a subscription music magazine covering guitar gear, jazz, blues, and blues-rock. Publisher Liz Wilson is moving from WordPress to Craft CMS. The project includes a full redesign, content/archive migration (300+ back-issue SKUs), and integration with Pelcro for subscription and entitlement management.

**Project framing as of Apr 28:** Liz's email explicitly characterizes the build as **Claude AI (website) + Pelcro AI (fulfillment)** — meaning AI-augmented copy, renewal flow, and subscriber messaging are now in scope, not just a Craft port. Justin should confirm or correct this framing with her, since it materially affects scope and pricing.

**Contract:** $450/month subscription (auto-billed monthly, paid May 1). No separate project fee. Build effort absorbed into the standard BGD 18-month subscription contract. Renewal benefit at 36 months: free redesign. (Note: the overnight research run incorrectly reported a $7,500 project fee. Corrected 2026-05-02.)

## Stakeholders

| Person | Contact | Role |
|---|---|---|
| Liz Wilson | lwilson3grace@gmail.com / thetonequestreport@gmail.com | Publisher, primary client |
| Tom Mulhern | tmulherngilroy@yahoo.com | At kickoff. Senior editorial figure. |
| Galal Abdo | galal@pelcro.com | Pelcro customer success |
| Ahmed Soliman | ahmed.soliman@pelcro.com | Pelcro support |
| Tyler Delsack | tyler@delsack.me | Co-dev or prior dev. CC'd on Wordfence + plugin-update alerts. **Has not responded to Apr 30 Wordfence high-severity forward as of 2026-05-05.** |

## Timeline

| Date | Event |
|---|---|
| Jan 5, 2026 | Kickoff: Justin, Liz, Galal, Tom. Aligned on MVP: automate back-issue downloads (300+ SKUs) + subscription renewals. |
| Jan 30, 2026 | Touchbase. Confirmed scope: complete rebuild, new design, Pelcro entitlements per SKU. |
| Feb 16, 2026 | Project plan written (Drive: "ToneQuest Website Project Plan"). 6-week sequence: Setup / Design / Migration / QA / Launch. |
| Mar 20, 2026 | Design review meeting with Liz. Design site shared: https://effervescent-entremet-45126b.netlify.app/ |
| Mar 25, 2026 | Liz sent review notes. Likes direction. **Hard rule: copy must come from original PDFs word-for-word, not AI paraphrasing.** |
| Apr 8, 2026 | Last commit in repo (design work). |
| Apr 13, 2026 | Flycart subscription renewal notice. Liz forwarded to Justin and Tyler. Asked if it should be cancelled. **No follow-up visible.** |
| Apr 14, 2026 | Justin requested zip of last 2 years of issues for AI testing. Liz sent Dropbox link. |
| Apr 15, 2026 | Plugins auto-updated alert (forwarded by Liz to Tyler + Justin). FYI only. |
| Apr 16, 2026 | Pelcro credentials: Justin requested, Liz sent (`tonequest.com / Questforth_23!`), Justin confirmed access. |
| Apr 28, 2026 | **Liz sent full "Always On Invoice" + Flexible Renewal product spec** to Galal + Justin (full content captured below). Liz missed the scheduled call; Justin and Galal spoke 1-on-1 and agreed to use AI. |
| Apr 30, 2026 | **Wordfence HIGH SEVERITY alert forwarded by Liz.** *"An admin user with the username admin was created outside of WordPress."* Plus 14 existing issues recurring. **Both www + staging.** Liz explicitly asked: "An email just for upgrade or to be addressed immediately?" **No reply from Tyler or Justin in thread as of 2026-05-05 (6 days).** |
| May 1, 2026 | Liz: "Creating TQ Back Issue Folder. Will you need the Cover PDFs?" Justin: yes. Subscription auto-paid. |
| May 4, 2026 | Liz followed up — "had my response as a draft this whole time" (Justin's words). Justin proposed Friday check-in. **Liz confirmed Friday May 8, 2pm EST.** Liz also dropped a follow-up agenda for the call (entitlements + pricing, AI scope, renewal-process clarity, website messaging). |

## Liz's Apr 28 product spec — capture in full

Liz's email titled *"TONEQUEST: Coordination: 'Always On Invoice' + Flexible Renewal Terms (Pelcro AI + Claude AI)"* is effectively a product specification for the new subscription/renewal experience. Treat it as the authoritative scope doc until amended.

**Objective:** Automate a simple, flexible ordering and renewal process that drives successful subscription sales. Implement an "Always On Invoice" model — subscribers can renew at any time (before or after expiration), select term/upgrade/gift, and choose payment method.

**Subscriber experience requirements:**
- Persistent "Renew / Extend Subscription" option
- Renew at any time (pre- or post-expiration)
- Choose standard, multi-year, or promotional terms (e.g., 10 + 1)
- Upgrade subscription type (Digital → Print + Digital)
- Initiate or renew/extend gift subscriptions
- Select payment method (online or offline)

**Pelcro AI (fulfillment) requirements:**
- Auto Collect ON for consistent invoice generation
- Open, accessible invoices tied to each subscriber
- Manual invoice creation supported (including pre-expiration)
- Flexible payment application (card or check)
- Gift-subscription creation/renewal tied to recipient accounts
- Plan changes at renewal without duplicate subscriptions

**Claude AI (website) requirements:**
- Clear "Renew / Extend Subscription" interface
- Multiple renewal options (term, upgrade, gift)
- Clear paths for "Gift a Subscription" and "Renew a Gift Subscription"
- Route selections to correct Pelcro price plans / invoices
- Avoid reliance on default same-term renewal behavior
- Clearly distinguish Renew vs Subscribe

**Subscription status + renewal triggers:**
- Pelcro subscription status: Active = within current term · Past Due = end of term with open invoice · Canceled = inactive
- Use expiration date + Past Due + open invoice to trigger renewal options

**Liz's open implementation questions:**
- Should "Always On Invoice" be persistent or dynamically generated?
- Best way to present multiple renewal-term options?
- How to handle upgrades within the renewal flow?
- How should gift subscriptions (new + renewal) be structured?
- How should non-default term selections be processed?
- What safeguards prevent duplicate subscriptions?

**Liz's Goal:** keep renewal always accessible · enable flexible subscription phases · support upgrades + gifts cleanly · accurate fulfillment · reduce manual intervention and subscriber confusion.

## Wordfence — Apr 30 high-severity event

**This is not a routine notice. Treat as an active incident until investigated.**

- **Indicator:** *"An admin user with the username `admin` was created outside of WordPress."* This is a classic compromise indicator — an admin user appearing without going through the WP admin UI suggests either DB manipulation or a privileged-process injection.
- **Scope:** Both `www.tonequest.com` (production) and `staging.tonequest.com`.
- **Recurring issues:** 14 existing issues from prior scans were also surfaced again — backlog is non-trivial.
- **Status:** Alert generated Thursday Apr 30, 1:06am. Liz forwarded to Tyler + Justin. **No response in thread from either for 6 days.**
- **Liz's framing:** "An email just for upgrade or to be addressed immediately?" — she does not know whether to act.

**Implication:** until verified, assume `tonequest.com` may have an unauthorized admin account. Disposition options before Friday's call: (a) Tyler triages, (b) Justin triages, (c) escalate to incident-response. Cannot be left as a question to Liz on Friday — she's asking us, not the other way.

## Friday May 8, 2pm EST — call agenda (from Liz)

These are the items Liz wants discussed on Friday's check-in. Justin should walk in with a position on each:

1. **New entitlements + pricing** — clarify offering before recalculating subscriber rates.
2. **Timing for new entitlements to be ready** — Justin to set a target.
3. **Galal-side entitlement setup in Pelcro** — needs Galal's involvement, possibly schedule a 3-way.
4. **AI scope confirmation** — what AI does on the site, what AI does in Pelcro, what subscription-fulfillment tasks get automated. Liz's framing as "Claude AI + Pelcro AI" needs to be explicitly confirmed or corrected.
5. **Renewal-process clarity** — subscribers confused by phase start/end dates vs. first/start vs. last/expiring issues. Resolve the language.
6. **Website messaging strategy** — renewal confirmations, thank-yous, etc. Liz open to AI writing them.
7. **Wordfence incident disposition** — must be resolved before or during the call.
8. **Cover PDFs / back-issue folder** — Liz can deliver JPG + PDF for recent years. Confirm format + delivery channel.

## Repo state (as of 2026-05-02 sweep — last commit Apr 8)

Repo: `beardedgingerdesigns/tonequest`.

- 4 commits total. Initial + three design updates (last: Apr 8, 2026).
- No README. No package.json. Pure HTML/CSS/JS prototype hosted on Netlify.
- Pages: homepage, about/our-story, about/editorial-board, issues/december-2025, issues/march-2026 (with two articles: fender-hotshot-strat, the-wizardry-of-oz-noy), subscribers, renew, my-account, components.
- CSS split: base.css, components.css, pages.css.
- Design: Playfair Display (serif headings) + Inter (sans body). Dark editorial aesthetic. Teal accent + amber secondary. Layered radial gradients + SVG noise texture.
- **Not yet on Craft CMS.** Still prototype/design phase.

## Open items

**Immediate (before or during Friday's call):**
- **Wordfence incident triage.** Highest priority. Surface unauthorized `admin` account; rotate credentials; review the 14 recurring issues.
- **Friday May 8, 2pm EST check-in with Liz.** Confirmed.
- **AI-scope confirmation/correction.** Liz believes the build is now AI-augmented. Justin should walk in with a clear position.

**Active asks from Liz:**
- Cover PDFs format + folder delivery (Liz building the folder).
- Entitlements + pricing — clarify offering, then recalc rates.
- Implementation answers to her six "Always On Invoice" implementation questions.

**Carry-overs from prior sweep:**
- **Flycart subscription cancellation.** Liz asked Apr 13. Three weeks no resolution. Confirm whether cancelled or still auto-renewing.
- **Pelcro 300+ back-issue entitlements bulk load.** Galal offered migrations team support. Submit the bulk request.
- **Craft CMS build not started.** Phase 3 (architecture + environment setup) hasn't kicked off. Friday's call should set a date.

## Tags

`active` `wrap-up-window` `Q2-priority` `security-incident-pending`
