# AIS-OS Intake

This is the source-of-truth file for your AIOS. Fill it in by typing, voice-pasting (Wispr Flow / OS dictation), or running `/onboard` for a guided conversation. Whichever mode, this file is what `/onboard` reads to scaffold your Day-1 setup.

**Hard cap: 7 questions.** Each answerable in under 60 seconds. Don't overthink — you can edit and re-run `/onboard` any time.

---

## Q1 — Who are you, what do you sell, who do you sell it to?

Identity, offer, ICP. One paragraph each is fine.

```
Identity. Justin Lobaito, based in Iowa. Two roles: Senior Interactive Front-End Developer at Two Rivers Marketing (2RM), and founder/operator of Bearded Ginger Designs (BGD). Functionally a full-stack developer, DevOps engineer, and product builder — not just front-end despite the title. Deep stack: Craft CMS (4 & 5), PHP, Twig, Vue, React, Vite, SCSS, MySQL, DigitalOcean, DDEV, Apache.

Offer. Through BGD: custom Craft CMS builds with hosting and ongoing support on ~18-month contracts with monthly recurring fees, plus a 36-month redesign cycle as a retention mechanism. Real software inside Craft — custom modules, migrations, data importers, geocoding, Freeform integrations, multi-tenant systems. Currently building a hub-and-spoke channel marketing platform (Terraplex + dealer network) as the first move into productized recurring-revenue platform ownership and vertical SaaS. Through 2RM: enterprise-scale Craft work and infrastructure (Iowa State Fair).

ICP. BGD today serves a mix: B2B manufacturers with dealer networks (Terraplex and dealers — Pyro Ag, Black Knight, New Heights, Great River, Truss Services onboarding), established publications (ToneQuest), and local/regional businesses (Kuberski Brothers, Matting by Design, InsideOut Iowa). Strategic direction is narrowing toward B2B manufacturers with dealer networks — that's where the platform play lives. 2RM clients are enterprise (Iowa State Fair), but those aren't "yours" in the equity sense.
```

---

## Q2 — Paste 1-2 things you've written recently. Don't edit them.

An email, a LinkedIn post, a DM, a doc — anything that sounds like you when you're not trying. **Paste verbatim.** Do not type these mid-conversation with Claude — chat-shaped samples are worse than no samples (voice contamination).

```
Hey James,

I believe I have captured most if not all. Only thing I am waiting on is a reversed out logo for revolution drones.

https://trussllc.netlify.app/

take a look at things. When we get closer to launch the form will go to the 3 emails you listed.

Ill be wrapping up my remaining SEO items and final browser and device testing.
```

```
Hey James,

I actually just got off my monthly call with Cherity where I wanted to QA a few things with her. I got the greenlight so I'll wrap everything up this morning and have you review it this afternoon.
```

---

## Q3 — What are your 2-3 biggest priorities for the next 90 days?

Quarterly priorities. Not yearly aspirations. Things that, if not done by July, would make you say "I wasted Q2."

```
Three priorities for the next 90 days (by end of July 2026):

1. Productize the BGD 18-month offering into fixed tiers with locked scope, published pricing, and template contracts — live on beardedgingerdesigns.com and ready to sell without per-client negotiation. The incoming pipeline project is the first test case: it gets sold against the productized tiers, not as a custom one-off.

2. Ship the central brand-content hub for the Terraplex platform and migrate all current dealer sites (Pyro Ag, Black Knight, New Heights, Great River) onto it, with Truss Services onboarded through the new flow as proof the system works end-to-end.

3. Produce a written business plan covering: 12-month revenue model (BGD recurring vs. project vs. 2RM W-2), target MRR by end of year, pricing/offering doc for the channel marketing platform as productized SaaS, and a formal go/no-go decision on the Nel + Alex partnership.

Constraint: No new custom one-off projects during the productization push. The one project already in the pipeline gets fit to the productized tiers — if it doesn't fit, that's signal the tiers are wrong, not signal to make an exception.

Near-term wrap-up (next 3 weeks): Inside Out, Wild Rose Casino, and ToneQuest — custom websites and digital applications already in flight.
```

---

## Q4 — Where does revenue actually land, and where is it tracked?

Multiple answers OK. Stripe? Skool? GoHighLevel? QuickBooks? A spreadsheet?

```
Bonsai (https://www.hellobonsai.com/) — invoicing, payments, and revenue tracking all flow through it.
```

---

## Q5 — Where do you talk to customers, your team, and the outside world day-to-day?

Email (which one — Gmail / Outlook)? Slack? Teams? DMs (Skool / Discord / iMessage)? Phone?

```
Gmail (primary). Google Chat / Hangouts. Discord (being incorporated soon). Google Gemini records all meetings; transcripts get fed into claude.ai. Significant in-person and phone communication as well.
```

---

## Q6 — Where do meeting recordings, notes, and important docs live?

Granola? Otter? Fireflies? Google Drive? Notion? Dropbox? A folder on your desktop you keep meaning to organize?

```
Google Drive is the canonical store. Important artifacts get imported into claude.ai for working sessions.
```

---

## Q7 — What's the one task that eats your week, and where do you currently track work?

The single biggest time-suck or recurring drudgery. Plus where tasks/projects live (ClickUp / Asana / Linear / Notion / a notebook).

```
Top pain: replying to emails (chronically behind), and staying on top of multiple concurrent projects.

Task/project tracker: none currently. Relies on Google integration with claude.ai as a stand-in.
```

---

When this file is filled, run `/onboard` (or re-run it) and the wizard will scaffold your Day-1 file set: `context/`, `references/voice.md`, populated `connections.md`, and a filled `CLAUDE.md`.
