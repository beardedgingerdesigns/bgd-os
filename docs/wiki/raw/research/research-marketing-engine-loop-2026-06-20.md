# Marketing Materials Engine — The Generation Loop (Worked Example)

**Date:** 2026-06-20
**What this is:** The first concrete application of the [goal-verifier-gate framework](research-goal-verifier-gate-2026-06-20.md) to a real feature. Justin's BrandOS co-branded ad generator, reframed from "prompt until it looks good" into a real evaluator-optimizer loop. Concept blueprint only; the BrandOS implementation is owned in the BrandOS repo (this same blueprint is staged to its wiki at `raw/aios/`).
**Parent:** [research-loop-engineering-synthesis-2026-06-20.md](research-loop-engineering-synthesis-2026-06-20.md).
**Decisions locked:** single-track topology (refine one candidate to a winner); end-state graduates to dealer self-serve.

---

## The problem this solves

Generating a co-branded digital ad by prompting was not converging. Target ad = an approved asset from the BrandOS library + the requesting dealer's logo/site + a Terraplex co-brand lockup + a headline that looks good on the image + a CTA, all on-brand for the dealer.

**Root cause:** "well-designed ad" is a *taste* verifier. A loop with no measurable verifier can't know when it's done, so it declares victory on slop or spins forever. Two likely contributors: the generator composes *blind* (never renders and looks at the pixels), and it *infers* dealer branding instead of being handed it as data.

This is the textbook case from the goal-verifier-gate research: you don't get to step out of a loop you can't verify. The fix is to decompose the fuzzy goal into a trustworthy score, add a render-and-see step, and keep a human gate that graduates as the score earns trust.

---

## The spec (goal / verifier / gate)

```
GOAL:     A 300x250 co-branded ad that clears the design score.
VERIFIER: 3 tiers — pre-flight pass/fail → vision rubric score → render-and-see
          every pass. Calibrated to Justin's taste.
GATE:     Loop self-gates on score and surfaces the winner. Build phase: Justin
          accept/reject (rejection trains the rubric). Graduates to dealer
          self-serve + Justin spot-check.
STOP:     Hard iteration cap + plateau detection.
```

## The loop (single-track)

1. **Assemble — deterministic, NOT in the loop.** Fetch the approved asset, the dealer brand profile (logo, palette, fonts, site, CTA), and the Terraplex lockup. A reliable function, not a thing to iterate on. Garbage in here = garbage out, and this is likely half the current pain.
2. **Compose.** Build the 300x250 as parameterized HTML/CSS (text/image positions, type, scrim/overlay, colors as variables).
3. **Render.** Headless screenshot to PNG.
4. **Pre-flight check — cheap, pass/fail, runs first.** Approved asset used? Logo present, in safe margins, right resolution? Terraplex lockup present with correct clear space? Headline + CTA present? Dimensions exactly 300x250? Colors drawn from the dealer palette? **Headline contrast over the pixels behind it ≥ threshold?** Any fail → revise, don't even spend a vision call.
5. **Score — vision, only if pre-flight passes.** A vision model looks at the PNG and scores the rubric: visual hierarchy, headline legibility, composition balance, lockup intentionality, on-brand feel, anti-slop (no default font, no centered-everything, no generic gradient). Returns a score + *specific* critique.
6. **Decide.** Score ≥ threshold → surface the winner. Else feed the critique back into Compose (step 2) and loop on the same candidate.
7. **Guards.** Hard cap (~5–8 passes). Plateau detection (score stops improving → stop, surface the best attempt + a "stuck here" note). Never loop silently or forever.

## The verifier, decomposed (why the score can be trusted)

- **Tier 1 — pre-flight:** objective pass/fail, the must-be-trues. Cheap, gates the expensive step.
- **Tier 2 — rubric:** vision-scored, semi-objective, tied to the *rendered pixels* not vibes.
- **Tier 3 — taste:** Justin (build phase) → the calibrated score (run phase).
- **Hard rule:** the maker must NOT be the scorer. Separate context/agent. A maker grading its own homework inflates the score and brings you confident slop.

## Calibration — how the score earns the right to self-gate (the graduation)

The load-bearing part. The engine is only as good as whether "score ≥ threshold" predicts "Justin accepts."

- **Cold start — eval the evaluator.** Don't trust the threshold day one. Build a small reference set: ~5 ads Justin rates "great," ~5 "bad." The scorer must rank good above bad. If it can't, the rubric is wrong; fix it before trusting any threshold.
- **Build phase (Justin = gate; governance altitude REVIEWS).** Loop surfaces only score-passing winners; Justin accepts/rejects. Every rejection of a "passing" ad is the signal: its reason becomes a new rubric criterion. The score tightens toward Justin's eye.
- **Graduation → self-serve (altitude AUDITS SAMPLE).** Promote when: the reference-set eval passes, the rejection rate on "passing" ads stays under a small % over N ads, and Justin can roughly predict the score before seeing it. Then dealers self-serve and Justin spot-checks a weekly sample. A bad "passing" ad after graduation is a *surprise* → demote until the rubric is fixed.

## First slice (scope)

One format: the **300x250 digital ad**. One dealer, one approved asset, the Terraplex lockup. Prove end-to-end convergence before adding any other size, print pieces, or the broader "materials engine."

## Seams that map to BrandOS

- Approved-asset fetch (asset library + approved flag).
- **Dealer brand profile:** logo file, color palette, fonts, website, CTA/tagline. If this isn't already structured data, it's the upstream root cause — the loop needs branding *as data*, not inferred.
- Terraplex co-brand lockup asset + placement/clear-space rules.
- Reuse existing primitives: a quick scan shows BrandOS already has a Playwright renderer and a vision-model call (`PORTAL_API`), so this is mostly orchestration + rubric + calibration, not new infra. (Determinism boundary: the render module forbids AI imports, so the loop + scoring live in a sibling service.)

## How to validate the concept works

1. **Eval the evaluator first.** Feed the reference set; confirm the scorer ranks great > bad. If not, the rubric is wrong — stop and fix it.
2. **Run the loop** on one real dealer + asset; watch it converge on a 300x250 that clears the score within the cap; eyeball the winner.
3. **Confirm calibration closes the loop:** reject a deliberately-mediocre "passing" ad, confirm the reason tightens the rubric, and confirm the next run reflects it.
- **Success =** the loop reliably surfaces ads Justin would accept, and his rejections measurably move the score.

---

## Why this is the worked example for the corpus

It exercises every part of the framework at once: a fuzzy human goal decomposed into a tiered verifier; render-and-see as the feedback signal; maker/checker separation; calibration as the mechanism that earns autonomy; and a governance graduation path (REVIEWS → AUDITS SAMPLE) rather than a binary "human in / human out." If the loop-engineering corpus is the theory, this is the first proof it survives contact with a real BrandOS feature.
