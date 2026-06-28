# AIOS Atlas — cross-project rollup

*Sample / POC, generated 2026-06-01 by reading each project wiki. The "breadth layer" for AIOS-level situational awareness: read this for "where does everything stand," then `/load <slug>` for depth. Regenerate when any wiki changes (commit trigger). Curated prose, not a keyword index, so it answers general questions the ctx cache can't.*

## ⚠ Cross-project flags (synthesized across projects)

- **June capacity collision.** Thermal Kitchen build (5/21–6/6) + launch 6/16, ToneQuest launch 6/1, Mr Gym build, and BrandOS Russell window (through 6/9) all stack. Mr Gym and Thermal both explicitly flag Justin's Q2 load as a risk.
- **ToneQuest security risk, pre-launch.** Paywalled article HTML is currently shipped to the browser and hidden client-side — any visitor can read gated content. Launch is 6/1. Highest-urgency item across the portfolio.
- **Two ventures effectively paused / at risk.** Deploy Answers' own products (Clappy, Bison) are paused to feed Brand OS; the venture risks becoming an empty shell. Watch.

## Active client builds

### Inside Out Iowa (inside-out)
- **Status:** 9 service pages + 17 HTML pages live on Netlify preview; "clear blockers, confirm facts, ship" phase, June 5 2026 launch target. CD review done 2026-05-29.
- **Last activity:** 2026-05-29 — Outpatient Therapy page built; all 9 services live; full creative-director review completed.
- **Open decisions / questions:** Provider Hub referral URLs + per-service response times (client gated); confirm Mobile Crisis claims (<60 min, 24/7); Transitional Living staffing; Who We Are leadership naming.
- **Blockers / risks:** Mobile Crisis coverage/response-time claims unverified; Outpatient Therapy awaiting 8 client answers.
- **Next step:** Client review with Melinda to confirm URLs, Mobile Crisis claims, copy, staffing before launch.

### Thermal Kitchen (thermal-kitchen)
- **Status:** Phase 1 build; design comps locked 5/20; production launch 6/16.
- **Last activity:** 2026-05-20 — comps sent, standing call confirmed direction, Phase 2 gated downloads decided.
- **Open decisions / questions:** Phase 2 HubSpot pricing (retainer vs fixed); gated-download entitlement model; staging/prod URLs + Figma location undocumented.
- **Blockers / risks:** Final photos due ~6/8 (tight before 6/12 QA); Phase 2 capacity collision with BrandOS in June; launch-day comms undecided.
- **Next step:** Build 5/21–6/6 on placeholders; confirm DDEV + staging URL; await Deann's gated-download model.

### ToneQuest (tonequest)
- **Status:** Next.js 15 app live; paywall being moved server-side as of 2026-05-31.
- **Last activity:** 2026-05-31 — wiki + CLAUDE.md updated; repo restructured.
- **Open decisions / questions:** Move paywall server-side (top priority); lock down public GET endpoints; retire v1 ingest pipeline.
- **Blockers / risks:** ⚠ Paywalled HTML shipped to browser, hidden client-side — any visitor can read gated content. Launch 6/1.
- **Next step:** Implement server-side paywall enforcement before June 1 launch.

### Wild Rose Casino (wild-rose)
- **Status:** Hand-coded UI phase on `redesigns-v3`; prototype lab retired 2026-05-19.
- **Last activity:** 2026-05-22 — AIOS chat drops ingested (launch-date sources consolidated).
- **Open decisions / questions:** Launch-date walkthrough gap (5/21); default-location cookie pattern (5/21).
- **Blockers / risks:** None recorded.
- **Next step:** Justin hand-codes UI; Claude handles state/Twig/Craft modeling.

### Mr Gym (mr-gym)
- **Status:** Kickoff complete 2026-05-24; awaiting Bradley's 8 answers + SOW signature.
- **Last activity:** 2026-06-01 — visual direction locked (decision 0015: zine-brutalist v2 POC).
- **Open decisions / questions:** Bradley owes pop-up date, product sourcing, returns policy, brand origin; logo vectorization pending.
- **Blockers / risks:** Launch gates on Bradley's pop-up date; Justin's Q2 load; photography quality unproven.
- **Next step:** Bradley confirms pop-up date → SOW signed → ~1-2 wk part-time build → soft launch at pop-up.

## Platform

### BrandOS / Terraplex platform (brandos)
- **Status:** Russell-window iteration, critical-path through 2026-06-09.
- **Last activity:** 2026-05-31 — brand system: demote "Mainframe" to provenance codename.
- **Open decisions / questions:** 7 active decisions locked; 3 deferred (vertical expansion, domain acquisition, Netlify indexability).
- **Blockers / risks:** None recorded in wiki.
- **Next step:** Execute Russell-window iteration through the 6/9 deadline.

## Maintenance

### Iowa Everywhere (iowaeverywhere)
- **Status:** Strategic repositioning pre-session — reframed from audience-development engine to brand/SEO hub.
- **Last activity:** 2026-05-19 — email drafted confirming Thursday working lunch with Chris; plans updated (merch, user accounts, BPCSN, newsletter).
- **Open decisions / questions:** Newsletter ROI story; COPE/content workflow framing; membership-tier platform (Patreon vs YouTube Memberships).
- **Blockers / risks:** Newsletter must justify ROI in Thursday session to survive; year-two spine seen as overreach by Chris.
- **Next step:** Thursday 2026-05-21 working lunch — plans harden or defer.

## Venture

### Deploy Answers (deploy-answers)
- **Status:** Pre-operational as of 2026-06-01. Partnership GO, but no LLC / banking / payments; both products paused to pivot the team to Brand OS.
- **Last activity:** 2026-06-01 — regroup pivoted near-term focus to Brand OS; brand identity direction locked + CD brief handed off.
- **Open decisions / questions:** Formal operating structure (equity/roles/IP/comp) undefined; BrandOS fold-in (owners vs paid help) now urgent; definition of "working" undefined.
- **Blockers / risks:** Formation stall (banking never cleared); pivot risk (effort going into BGD-owned Brand OS → DA could become an empty shell); both products paused.
- **Next step:** Team meeting after 2026-06-03; Nel reviews Clappy output logs to set pricing.

---

*How this would stay current: a commit hook regenerates the changed project's block (fan out one reader for that project) and rewrites this file. The ctx cache handles "find every mention of X across projects"; this atlas handles "where does everything stand." Use both.*
