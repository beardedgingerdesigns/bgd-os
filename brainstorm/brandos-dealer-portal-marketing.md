---
client: bgd-hq
project: brandos
type: brainstorm-seed
status: open
captured: 2026-05-11
---
# BrandOS dealer portal + marketing material leverage

**Captured:** 2026-05-11 from the Pyro 5/7 check-in catch-up. Tagged as a brainstorm topic for overall BrandOS capabilities — not for immediate execution.

## The trigger

Two confirmed dealer asks for the same two things, unprompted:

- **Pyro Ag** (Kelcey Piroutek, 2026-05-07): marketing material outlines + trade-show guidelines/recommendations.
- **New Heights Ag** (Josh, 2026-05-01): templated/pre-approved marketing assets + trade-show booth packages (10x10, 10x20).

Justin's own meeting takeaway: *"support in marketing... that's consistent kind of across all dealers."*

## The brainstorm prompt

How does BrandOS turn the current rudimentary Terraplex dealer portal (login + basic asset access) into a real product capability that leverages marketing materials as the core value? Specifically:

- **Fold in the existing dealer portal implementation.** What's actually built today vs. what would the "real" v1 in BrandOS need to look like?
- **Marketing material as the leverage point.** Templates, asset library, AI-generated marketing assets, trade-show kits, per-dealer customization, brand-approved guardrails. What's the minimum surface area that solves the dealer ask?
- **Connect to existing infrastructure.** The `ui-ux-pro-max` skill already runs per-dealer at scaffold time. The `impeccable` skill exists. The auto-PR / curator routines on `terraplex-spoke-hub` already produce design references. Are these the engine for AI-generated marketing materials, or is that a separate substrate?
- **Time-pressured input.** Pyro's first trade show (Dakota Fest) is mid-August. Their trade-show guidelines need to land mid-July at latest to be useful. That's a real deadline pulling the brainstorm forward.

## Source material to read into this brainstorm

- `references/brandos-roadmap.md` — Theme 7b (down-channel comms + dealer portal), Theme 5 (AI-native customer surface), and the "AI marketing tools (dealer-facing)" sub-section in Part 2.
- `memory/project_pyro_checkin_2026-05-07.md` — Pyro 5/7 details + cross-dealer pattern observation.
- Recent New Heights dealer meeting (5/1) and Terraplex monthly check-in (5/1) notes in Drive.

## Open questions for the brainstorm session

1. What's the **minimum dealer-portal v1** that addresses both asks (marketing assets + trade-show kit) without ballooning into the full Theme 7b spec?
2. Is "trade-show guidelines" a one-time deliverable per dealer, or a **product feature** (template library, configurable per show)?
3. How does **per-dealer brand customization** of templates work without breaking the manufacturer's brand consistency? (Hub-controlled brand parameters; dealer-controlled regional customization, per the roadmap.)
4. Does AI-generated marketing material need its own skill, or does it fall out of `ui-ux-pro-max` extended?
5. **Pricing question:** does the marketing-material capability sit inside the existing dealer subscription, or is it an add-on tier? (Connects to priority #1 — productized 18-month tiers.)
6. **Trade-show kit specifically:** booth signage, brochures, spec sheets, business cards, PDF leave-behinds. Which of these is core v1 vs. extension?

## When to come back to this

- Before the Pyro Friday 2026-06-05 monthly meeting (so Justin has a concrete answer for the marketing/trade-show ask).
- Before the next Terraplex monthly check-in (Justin committed to bringing dealer feedback back to Jack / Cherity — this is the substance to bring).
- During any session where Justin is shaping the productized 18-month tier scope.
- During the 12-month business plan write — this is real product spec, not just feature wishlist.
