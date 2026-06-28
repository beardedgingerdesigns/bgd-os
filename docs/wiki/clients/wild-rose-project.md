---
client: wild-rose
project: wild-rose-redesign
type: brief
---
# Wild Rose Casinos redesign

Compiled 2026-05-02 from Gmail (WIld Rose Resorts label), Gemini transcripts in Drive, and Bonsai invoices.

**Project wiki (LLM-Wiki):** `/Users/justinlobaito/repos/wild-rose/wiki/` — structured pages (entities, topics, concepts, sources) including `entities/lucky-s-restaurant.md`, `entities/aaron-harn.md`, `entities/krystal-light.md`, plus kickoff (2026-02-02) and banquets (2026-03-11) source notes. Authoritative on names and project entities.

## Project overview

Justin is redesigning wildroseresorts.com for Wild Rose Corporate, a three-property Iowa casino chain (Jefferson, Clinton, Emittsburg). The relationship also produced a second project: **Thermal Kitchen** (separate section below). Both run through the same client contact, Aaron Harn.

Site fetch (wildroseresorts.com) returned 403 during the overnight sweep. Live state not confirmed via automated access.

## Stakeholders

| Person | Org | Role |
|---|---|---|
| Aaron Harn (aaron.harn@wildrosecorporate.com) | Wild Rose Corporate | Primary contact. All approvals route through him. |
| Krystal Light (krystal.light@wildrosecorporate.com) | Wild Rose Corporate | Brand / marketing |
| John Carlson (john.carlson@wildrosecorporate.com) | Wild Rose Corporate | IT-adjacent. Raised form submission questions. |
| David Miles, Phil Smith | Wild Rose Corporate | CC'd on IT/privacy questions |
| Scott Ivers (scott.ivers@wildrosecorporate.com) | Wild Rose Corporate | CC'd on Thermal Kitchen calls |
| Brian Diver (BDiver@kirkellc.com) | Kirke LLC | Financial/investor side |
| Aaron Hub (aaron.hub@kirkellc.com) | Kirke LLC | Same. Kirke LLC appears to have ownership stake in Thermal Kitchen. |
| Jon Liebl (jon@lieblmg.com) | Liebl MG | BGD partner on this account |
| Meghan Wymore (meghan.wymore@wildrosecorporate.com) | Wild Rose Corporate | Day-to-day website updater, content entry |
| Katrina Williams (katrina.williams@wildroseresorts.com) | Wild Rose Resorts | HR representative — printable applications, Indeed integration |

## What's decided

From kickoff (Feb 2) and design review (Mar 2) Gemini transcripts:

**Site structure:**
- Singular site, not micro-sites per casino. Standardized info across properties with filters.
- Restaurants (e.g., Ly's) can have standalone branded sites that feed from the same Craft CMS backend. Main Wild Rose site links to them and pulls key info.
- Entertainment gets its own main navigation tab to drive cross-property traffic.
- Location pages need more substance: host info, links to restaurant pages, property-specific details.
- Gaming pages stay. Table game hours must be on location pages for IRGC compliance.

**Promotions logic:**
- All-properties view shows only shared promotions by default.
- When user selects a location, unique property promotions also appear.
- Single promotions management area, no separate calendars per property.
- Activities like trivia night categorized as Entertainment, not Promotions, to clean up the promo page.

**Location selection:**
- Cookie-based location selector on site entry. 1-2 day cookie duration.
- Users can bypass selection for a non-location-specific default view.
- Once a location is selected, nav changes to show that property's name/address.

**Cookie compliance:**
- Secure Privacy selected (Justin's recommendation, Aaron approved). Jon Liebl handling the billing ($14-50/mo tier likely sufficient).
- Justin sets up the account, Wild Rose side enters billing info.

**Branding:**
- LMG Analytics advises moving away from pink-heavy imagery. Blues, oranges, greens preferred in design.
- Pink remains the primary brand color but shouldn't dominate.
- Justin needs updated branding assets from Krystal Light (action item from Feb kickoff).

**Content strategy:**
- Gamification angle: monthly articles on how to maximize players card points, cross-promoted on social.
- Club Wild section to surface invite-only mailer promotions.
- Top 3 promotions featured on each location page.

## Open items / open questions

- **Branding assets from Krystal Light.** Assigned in Feb 2 kickoff. No confirmation it was received. Check with Jon.
- **Secure Privacy account setup.** Was this completed? Jon was supposed to handle billing. No follow-up thread found.
- **IT / Freeform form question.** John Carlson raised it Mar 17. Justin acknowledged it. No resolution found in email sweep. May be hanging.
- **Redesign progress since Mar 2.** Last design-specific email thread was the Mar 2 design review. Two months of silence on the Wild Rose redesign itself. Either work is happening quietly or it's stalled. Worth checking in with Aaron this week.
- **Banquet reservation system.** Mentioned in kickoff as a scope item. No follow-up threads found.

## Billing

- $1,000/month website subscription invoiced via Jon Liebl (BGD bills Jon, Jon bills Wild Rose).
- Wild Rose staging hosting on Servd: $79/month, renews monthly (paid Mar 18, Apr 18).
- Jon Liebl invoiced for "Wild Rose Casino" and separately "Website Hosting" (two separate Bonsai line items).
- $5,000 project invoice was sent to Jon Mar 4 (per "Invoices" email to Jon).

## Walkthrough — 2026-05-21

30-min dev walkthrough with Aaron Harn and Krystal Light. Aaron Hub and Jon Liebl declined (Jon: declined; Aaron Hub: invitation was past-tense). Gemini notes: https://docs.google.com/document/d/1M0lthQBRYXszefS6kJH0JEr7g40R16ufMHlxULm5WXo/edit

**Decisions locked:**
- **Launch rescheduled June 1 → mid-to-end of June.** Aaron's call. Driver: Wild Rose travel schedule + Memorial Day holiday + Thermal Kitchen workload concurrent. Justin offered, Aaron took it.
- **Email signup removed from site.** Aaron confirmed Maro Post requires Player ID; requiring Player ID at email capture would segment too many users. Killed the feature entirely rather than ship a Player-ID-gated form.
- **Promotions calendar logic → single text field.** No more date-based scheduling for promos. One text field for occurrence ("Every Sunday at XYZ"). Promos list as entries, not calendar events. Entertainment stays calendar-based because dates matter.
- **Ticketing roadblock popup confirmed.** New field on calendar entries for purchase URL. Click triggers interstitial: "You're purchasing tickets for a Clinton show. Proceed or go back." Three separate ticketing platforms on the back end is the real problem this papers over.
- **Entertainment entries stay separate per property.** Krystal: people already show up at the wrong property; consolidating entries would amplify confusion. Aaron agreed despite hating the clunky look.
- **Careers page: no mandatory property selection.** All listings visible, filter optional. Removed unused "team" field (HR only ever used "staff").
- **Cookie persistence: 1 month.** Locked at 1 month for location default — this is longer than the 1-2 day duration noted in the Feb/Mar brief.
- **Phased rollout confirmed.** Redesign first → booking process for event spaces (a few weeks later) → **Lucky's** microsite. (Gemini transcript rendered it "liies"/"lilies"; correct spelling is Lucky's per the wiki entity page `wiki/pages/entities/lucky-s-restaurant.md`.)

**Open / Justin's homework:**
- **Auto-redirect vs. filter-only when default location is set.** Justin to test both, gut-check, return with a recommendation. Aaron's worry: internal teams (not guests) get confused about which property's content is showing.
- **Shared-act-across-properties handling for entertainment.** Two options on the table: (a) keep entries separate and rely on the roadblock popup, (b) shared landing page with separate "purchase tickets for X" buttons. Justin to noodle and bring options to the follow-up content meeting.
- **Categories for promotions: TBD.** Justin has the structure ready; Krystal hasn't decided whether they're needed.

**Next steps (Justin):**
1. Deploy current progress to dev site for team review.
2. Finish outstanding content updates.
3. Schedule deeper content + entertainment meeting — Krystal sent the contact: **Meghan Wymore** (meghan.wymore@wildrosecorporate.com) handles all current website updates. Target early next week.
4. Prep entertainment-strategy recommendations for that meeting.

**Side note from Krystal's separate email (same day):** Meghan Wymore is the day-to-day website updater. Add her to the content-meeting invite.

## Thermal Kitchen (Wild Rose-adjacent project)

Thermal Kitchen is a co-manufacturer in Daytona Beach, FL. Shelf-stable liquid nutrition in spouted pouches via retort processing. Kirke LLC (Brian Diver, Aaron Hub) owns it. Aaron Harn brokered the introduction from Wild Rose side.

**Scope:** Repositioning their existing website, not a cold start. Removing: canned beverages, R&D Kitchen, onsite chef. Keeping: spouted pouch + retort processing for shelf-stable liquid nutrition (human + pet nutrition brands).

**Pages:** Home, Capabilities, Industries We Serve, About, Our People, Contact (with qualification form).

**Target:** June 1, 2026. Runs concurrent with Wild Rose redesign. Capacity coordination with Jon needed.

**Budget:** Aaron confirmed $250-400/month ongoing is acceptable after the initial build.

**Deann Gibson** (deann@thermalkitchen.com), Director of Sales. Not yet looped in on design. Route through Aaron first.

**Standing call:** Wednesdays 9am CT, bi-weekly, starting May 6. Teams link in calendar invite.
