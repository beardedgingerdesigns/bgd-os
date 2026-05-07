---
client: wild-rose
project: wild-rose-redesign
type: brief
---
# Wild Rose Casinos redesign

Compiled 2026-05-02 from Gmail (WIld Rose Resorts label), Gemini transcripts in Drive, and Bonsai invoices.

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

## Thermal Kitchen (Wild Rose-adjacent project)

Thermal Kitchen is a co-manufacturer in Daytona Beach, FL. Shelf-stable liquid nutrition in spouted pouches via retort processing. Kirke LLC (Brian Diver, Aaron Hub) owns it. Aaron Harn brokered the introduction from Wild Rose side.

**Scope:** Repositioning their existing website, not a cold start. Removing: canned beverages, R&D Kitchen, onsite chef. Keeping: spouted pouch + retort processing for shelf-stable liquid nutrition (human + pet nutrition brands).

**Pages:** Home, Capabilities, Industries We Serve, About, Our People, Contact (with qualification form).

**Target:** June 1, 2026. Runs concurrent with Wild Rose redesign. Capacity coordination with Jon needed.

**Budget:** Aaron confirmed $250-400/month ongoing is acceptable after the initial build.

**Deann Gibson** (deann@thermalkitchen.com), Director of Sales. Not yet looped in on design. Route through Aaron first.

**Standing call:** Wednesdays 9am CT, bi-weekly, starting May 6. Teams link in calendar invite.
