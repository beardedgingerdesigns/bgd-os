---
client: kuberski-brothers
project: website
type: brief
---
# Kuberski Brothers — Website

Compiled 2026-05-20 from a cold-orient pass on the live site + 1-year Gmail sweep (2025-05-20 → 2026-05-20).

## What the business is

**Kuberski Brothers Lawn Care (KBLC)** — landscaping company serving Des Moines, Iowa.

Site copy (Dec 2025 launch wave):
> "Transform your outdoor space with professional landscaping services in Des Moines. From design to maintenance, create beautiful, sustainable gardens and yards."

Services confirmed from inbox copy edits:
- Residential mowing (weekly — Alex's Dec 2025 edit removed "or bi-weekly")
- Commercial mowing
- Trimming, blowing off hard surfaces
- Landscape design + project work
- Employment / hiring pipeline (form launched Jan 2026)

## How the project came in

**Origin:** Jon Liebl (jon@lieblmg.com — Liebl Marketing Group) introduced Justin to Alex + Jered on **2025-07-14** for a kickoff meeting covering **two website rebuilds** under Alex's umbrella: **KBLC** and **Red Beam**.

This is a Liebl-routed deal, like Wild Rose / Thermal Kitchen / IowaEverywhere.

## Stakeholders

| Person | Contact | Role |
|---|---|---|
| **Alex Kuberski** | alex@kuberskibrothers.com / 515-509-8071 | Primary client contact, decision-maker on copy + features. Also runs Red Beam. |
| **Jered Kuberski** | jered@kuberskibrothers.com | Co-owner. Drives infrastructure/compliance requests (SMS, DNS). Reviews launch copy. |
| **Rochelle Nickolay** | rochelle@kuberskibrothers.com / 515-601-0190 | Office admin / scheduling. Coordinates meetings on Alex's behalf. |
| **Jon Liebl** | jon@lieblmg.com | Liebl Marketing Group. Referrer, copy contributor, escalation path. (Same Jon as Wild Rose / IowaEverywhere / Terraplex / BrandOS.) |
| **Sammi Manning** | sammi.manning@gmail.com / 563-568-8738 | Print designer (ad-hoc). Banners and printed collateral. |
| **Saša Španović** | support@myhosting.ovh | Previous web host. Released domain Aug 2025. |

## Timeline

| Date | Event |
|---|---|
| 2025-07-14 | Jon Liebl kickoff intro — Justin to lead KBLC + Red Beam website rebuilds. |
| 2025-07-24 to 2025-08-08 | Red Beam discovery thread. First Red Beam meetings. |
| 2025-08-06 | Website Review + Red Beam conversation meeting. |
| 2025-08-08 | Dev site live at `kuberski.beardedgingerdesigns.com`. Logo file requested from Alex (old site logo unusable). Domain transfer started with myhosting.ovh — 60-day rule means earliest transfer date is **2025-08-19**. |
| 2025-08-14 | Justin out sick. Copy still pending. New photos/videos scheduled for **2025-08-29**. |
| 2025-09-03 | **First-month invoice sent** (Bonsai). Site not yet live; waiting on copy/imagery. |
| 2025-10-06 | Pre-launch coordination begins. Rochelle proposes Thu 3pm meeting. |
| 2025-10-08 | Jon delivers Lawn & Landscape video assets via Wipster (password: lawn). |
| 2025-10-09 | Pre-launch meeting (Justin / Alex / Jon / Rochelle / Jered). Alex sends ChatGPT-drafted "Meet Our Team" + case-study copy. |
| 2025-10-10 | GoDaddy transfer-in link sent to Alex. |
| 2025-11-03 | Justin chasing launch — still waiting on Jon's copy. |
| 2025-11-21 | Jon finally delivers "Cleaned up Copy" (case studies intentionally minimized for launch). |
| 2025-11-25 | Jered flags spelling/layout issues. List incoming. |
| **2025-12-11** | **LAUNCH DAY.** Final cleanup: typo, hours, "crew" → "crews," photo swaps. |
| 2025-12-15 | Alex post-launch edit: residential mowing copy ("weekly mowing services," drop "or bi-weekly"). |
| 2025-12-16 | Google Workspace DKIM TXT record (`google._domainkey`) added. |
| 2026-01-28/29 | Jon (from `jon@iowaeverywhere.com` — same person) commissions Employment Form for KBLC. Built + shipped same week at `/employment`. |
| 2026-02-02 | Alex: add address line to contact form (quote turnaround). |
| 2026-02-13/16 | Jered: Captivated SMS-compliance language — consent checkbox for text marketing. Confirmed leads don't route to Captivated; checkbox just grants SMS permission. Added 2026-02-16. |
| 2026-02-27 | Sammi Manning + Alex: 96"×48" banner with QR code → `#contact` anchor. Banner-print target Mon 3/2. |
| 2026-03-05 | Alex: add "Iowa Everywhere" and "Radio" to form options (how-did-you-hear-about-us). Test confirmed by Alex. Submission bug worked on same day. |
| 2026-03-31 | Jered phone call → smtp2go CNAME records (`em158106`, `return.smtp2go`) added to GoDaddy for transactional email. |
| 2026-04-27 | Justin proposes "Office Admin Call." |
| 2026-04-29 | Alex: "Been a crazy week. Can we schedule something for next week?" — **most recent activity, thread appears unresolved.** |

## Commercials

- **Contract:** $400/mo Bonsai
- **MRR:** $400/mo
- **First invoice:** 2025-09-03 (pre-launch)
- **Launch:** 2025-12-11 — **~5 months from kickoff to launch**

## What the $400/mo covers (inferred)

No formal SOW visible. Based on actual activity, it bundles:
- Hosting + domain management (GoDaddy / smtp2go / Google Workspace DNS)
- Ad-hoc copy + form updates (typically <24h turnaround)
- Small feature builds (employment form, contact-form fields, SMS-compliance UI)
- Print/marketing-asset coordination (QR codes, banner support)
- Launch + post-launch maintenance

Pattern looks like classic BGD "build + steady-state support" — see Inside Out for the Craft analogue. Frequency of small asks is **high** (8+ change requests Dec 2025 → Apr 2026).

## Infrastructure

- **Stack:** Base 44 (React SPA, Vite, Supabase storage) — deliberate speed pilot, see [[project_kuberski_base44_stack]]. Long-term replacement target = BrandOS website builder; Kuberski-specific migration **not decided**.
- **Domain:** kuberskibrothers.com (GoDaddy as of Oct 2025, transferred from myhosting.ovh)
- **Email:** Google Workspace (DKIM configured 2025-12-16)
- **Transactional email:** smtp2go (CNAMEs added 2026-03-31)
- **SMS marketing:** Captivated (compliance language added 2026-02-16)
- **Dev site (historical):** `kuberski.beardedgingerdesigns.com`

## Tags

`active` `paying` `base44-stack` `liebl-routed` `live-since-2025-12-11`
