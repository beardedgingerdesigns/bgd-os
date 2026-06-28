# Design + Product as Loops — The Product & Design Thinker's Lens

**Date:** 2026-06-20
**Role:** Lens 3 of 5 — Product & Design Thinker
**Builds on:** research-loop-engineering-2026-06-19.md, research-matt-pocock-agentic-workflow-2026-06-19.md

---

## (a) This Lens

Design and product decisions are not one-time acts — they are loops with signal, judgment, and revision baked in. This file maps the core frameworks (build-measure-learn, double-diamond, critique loops, design systems, taste training) onto Justin's specific context: BrandOS operator console, BrandOS website builder, client sites (Wild Rose, Iowa State Fair, Partners for Sight, Mr Gym), and the AIOS UI. The central argument: Justin's translation-layer edge — designer eye + full-stack depth + business sense — is exactly the "human taste checkpoint" that keeps AI design loops from producing generic slop. That edge compounds when it is built into a system, not applied ad hoc. The risk: when AI generates UI autonomously without a structured taste gate, it regresses to the statistical mean of the web. The opportunity: wire Justin's judgment into loops so it scales without requiring his presence on every decision.

---

## (b) Core Frameworks

### 1. Build-Measure-Learn (Lean Startup)

**Source:** https://theleanstartup.com/principles | https://felixlenhard.com/blog/the-build-measure-learn-loop-in-practice/

**Definition:** Hypothesis → MVP/experiment → measure real user behavior → decision (keep / kill / iterate) → next hypothesis. The unit of progress is *validated learning*, not shipped features. Speed of the loop matters as much as quality of any single pass.

**Crisp structure:** Build one testable change (2-3 days). Measure with pre-defined success criteria (5-7 days minimum — daily variance swamps signal below that). Learn: one paragraph, one decision.

**When it applies:** Feature prioritization on BrandOS (is this dealer-requested, or assumed-useful?), client site redesigns (does the new Iowa State Fair camping flow actually convert better?), AIOS UI (do users actually use that Quick Actions panel?). The discipline is setting the hypothesis *before* the build, not retrofitting a story after you see the data.

**Justin's failure mode to avoid:** Building 26+ features per year without 26 documented learnings. The loop only compounds if the Learn phase produces a written decision.

---

### 2. Double Diamond (Discover / Define / Develop / Deliver)

**Source:** https://www.designcouncil.org.uk/resources/the-double-diamond/ | https://maze.co/blog/double-diamond-design-process/

**Definition:** Two nested loops, not a line. First diamond: diverge (Discover — talk to users, collect signal) then converge (Define — single problem statement). Second diamond: diverge again (Develop — generate and prototype multiple solutions) then converge (Deliver — test, iterate, ship the one that works). The model's key insight, often missed: after delivery, many organizations learn something about the underlying problem that sends them *back to the beginning of the first diamond*. The two diamonds are one turn of a larger loop.

**When it applies:** Any new BrandOS feature or client site project deserves at least a compressed double-diamond pass. For client work, the Define phase (what is the actual business problem?) is where Justin's translation-layer edge pays off most — clients describe symptoms, he identifies the problem.

**Smashing Magazine's corrective (Andy Budd):** In practice, most companies start with the *second diamond* (build a feature, ship it). The leverage move is to then actively monitor how the delivered feature performs and *open the first diamond retrospectively* — turn live performance data into the discovery input for the next improvement cycle. This "reverse double diamond" is more realistic for solo operators and still closes the loop.

**Source:** https://www.smashingmagazine.com/2023/08/improving-double-diamond-design-process/

---

### 3. Design Critique Loops

**Source:** https://www.figma.com/blog/inside-figma-the-product-design-teams-process/ | https://medium.com/google-design/a-collaborative-approach-to-shaping-successful-ux-critique-practices-b7f060c21582

**Definition:** A scheduled, repeating feedback ritual where work-in-progress receives structured feedback from peers before it is final. Figma's model: twice weekly, 30 minutes per topic, explicitly *not* a decision-making meeting — designed to unblock, elevate quality, and share context. Google Health's principle: "Never established" — the critique format itself is subject to critique and iteration.

**The institutional loop:** Figma maintains a Notion queue of critique topics populated during Monday warm-ups. The queue is the loop's input; the critique sessions are the processing; the output is unblocked designers with elevated work. They "critique their critiques" after every 10 sessions.

**When it applies:** For a solo operator, the critique loop has to be simulated differently. Justin has no design peers on BrandOS. Options: (1) advisory board + `/ask-the-board` as a structured critique substitute; (2) the `grill-me` skill as a solo critique ritual before shipping design decisions; (3) using `ce-design-iterator` or `ce-design-implementation-reviewer` agents as asynchronous critique partners.

---

### 4. Design Systems as Self-Reinforcing Loops (Flywheel)

**Source:** https://blog.ranveerkumar.com/articles/designing-frontend-platforms-design-systems-governance-tokens-engineering-velocity | https://garden.ajose.dev/20220509015158-design-systems-flywheel/ | https://www.klaweht.com/2026-04-25-component-first-vs-token-first/

**Definition:** A design system is a loop: tokens encode decisions → components consume tokens → adoption spreads consistent UI → feedback reveals gaps → tokens are updated → components improve. The flywheel: community (shared ownership) → contribution → scalability → adoption → more community. Each turn makes the next turn easier.

**Token-first vs. component-first:** Token-first is the right call when you have multiple brands or multi-platform delivery. BrandOS serves multiple dealers each with some brand variation — token-first wins. A token layer is also what makes future migration possible (off a framework, to dark mode, to a second brand tier).

**The compounding leverage:** "Repeated decisions are already solved." Engineering velocity from a design system is not fewer rules — it is faster shipping because the rule was already made. For a solo operator running BrandOS plus 4+ client sites, each token decision Justin makes once is applied everywhere automatically.

---

### 5. Taste as a Trained Loop

**Source:** https://emilkowal.ski/ui/developing-taste | https://emilkowal.ski/ui/train-your-judgement | Emil Kowalski SKILL.md (https://github.com/emilkowalski/skill)

**Definition:** "Good taste is not personal preference. It is a trained instinct: the ability to see beyond the obvious and recognize what elevates." — Emil Kowalski. The loop: expose yourself to great work → analyze *why* it is great (not just that it is good) → practice making things → seek critique → your judgment calibrates → repeat. The Ira Glass principle applies: your taste exceeds your skill early in the loop, which is uncomfortable but is the signal that the loop is working.

**The AI-era corollary (Kowalski):** "AI can write animation code. What it can't do is know what feels right." Training your judgment is now the moat. A developer who can articulate why an animation easing is wrong — and who has a reference library of great examples to compare against — produces better AI-assisted output than a developer who cannot. You are the taste filter.

**When it applies:** Every BrandOS UI decision. Every client site design review. The AIOS console. Justin's designer eye is already trained. The loop maintenance task is keeping the reference library current and building critique rituals into the workflow.

---

## (c) The 7 Use Cases Through the Design/Product Lens

### Use Case 1: Code Review & Fix Loop (design-implementation review)

**How the loop runs:** PR is filed → automated `ce-design-implementation-reviewer` agent compares implementation against a Figma spec or design token expectations → flags visual regressions (spacing off-token, wrong border radius, contrast failures) → developer fixes → re-review.

**What "good" looks like:** Every PR touching UI components gets a visual delta check before merge. Pixel-level regressions caught in CI, not in production. Design token violations never reach main.

**Failure mode:** Loop only checks code syntax and logic, misses visual intent. A button that is technically correct but visually wrong (wrong weight, wrong spacing, right hex but wrong semantic token) passes review.

**Recommendation for Justin:** Wire `ce-design-implementation-reviewer` into BrandOS PR flow for any component touching the dealer portal or website builder. For client sites, run it before deploying to staging. Pair with a `design-system.md` file in each repo so the reviewer has concrete values to check against, not just aesthetic instincts.

---

### Use Case 2: Inbox / Triage Loop (user feedback → design backlog)

**How the loop runs:** Dealer emails, client feedback, support requests land in `archives/raw/`. `/dispatch` routes them. Design-relevant items (UI confusion, feature requests, friction reports) surface in `todos/pending.md` with a design tag. Weekly review converts the strongest signals into hypotheses for the next BML cycle.

**What "good" looks like:** No feedback dies in email. Every dealer complaint about the BrandOS UI has a documented hypothesis in the backlog: "We believe [problem]. We'll test by [change]. Success = [metric]."

**Failure mode:** Feedback routes to a to-do list but never converts to a design decision. The inbox loop runs but the BML loop never starts. You have a well-organized graveyard.

**Recommendation for Justin:** Add a design-signal extraction step to `/dispatch`. When routing a drop, check if it contains UX friction language ("confusing," "couldn't find," "didn't work") and auto-tag it as `design-signal`. Weekly `/brief` surfaces the top 3 design signals with a prompt to convert each to a hypothesis or discard it explicitly.

---

### Use Case 3: Growth / Content Loop (design's role in content/brand)

**How the loop runs:** BrandOS marketing site (brandosportal.com) + dealer-facing materials form a brand consistency loop. Each marketing asset Justin creates encodes a visual standard. Dealers see those standards and expect parity in their own portals. If the marketing and the product diverge visually, trust erodes.

**What "good" looks like:** Marketing site tokens match product tokens. When a dealer asks "can my site look like the marketing site?" the answer is "yes, those are the same design system." BrandOS brand and BrandOS product are one visual loop.

**Failure mode:** Marketing site is a one-off design exercise. Product UI evolved independently. Dealers see a disconnect. The brand promise and the product reality split.

**Recommendation for Justin:** Establish a shared token file (`brandos-tokens.md` or a Figma variables file) that is the source of truth for both the marketing site and the product. Any update to the brand runs through the token file first. The marketing site is the "brand loop input" — let it set the visual bar that the product must then meet.

---

### Use Case 4: Design Iteration Loop (the central one)

**(Deep dive follows in section d — abbreviated here.)**

**How the loop runs:** Implement UI → screenshot → analyze against design intent / reference / token constraints → identify top 3 issues → fix → screenshot again → repeat until criteria pass.

**What "good" looks like:** Each iteration produces a measurable improvement on a scored criterion (composition, typography, color/contrast, visual identity, polish). The loop stops when scores plateau, not when the designer gets tired.

**Failure mode (AI slop):** The loop runs without a taste checkpoint. AI scores its own output against AI-generated criteria and declares victory. The result is technically improved but aesthetically generic — the statistical mean of the web. Purple gradients. Inter everywhere. Generic card layouts. The `design-loop` plugin's anti-slop flags (rejects uniform grids, flags Inter/Roboto defaults, flags purple gradients) exist specifically because autonomous AI design loops regress to this mean without explicit anti-slop rules.

**Recommendation for Justin:** See section (d) for the full wiring. Short version: always enter the loop with a design intent statement and a reference image. Exit only after a human taste pass.

---

### Use Case 5: Planning / Roadmap Loop (product discovery as a loop)

**How the loop runs:** Quarterly priorities set direction → build features → measure adoption and dealer feedback → retrospective surfacing what worked, what stalled → next quarter's priorities incorporate those learnings → loop. The double-diamond structure applies at the roadmap level: each quarter's planning is a "Discover + Define" pass; each quarter's execution is "Develop + Deliver."

**What "good" looks like:** Roadmap decisions are traceable to specific dealer signals or measured outcomes. "We're building the marketing material builder because 3 dealers asked for it and it aligns with BrandOS Theme 7b" is a loop-derived decision. "We're building it because it seems useful" is not.

**Failure mode:** Roadmap is driven by features that seem exciting rather than signals from the queue. The roadmap becomes a wish list, not a learning machine. Classic Pocock warning: "You should be asking AI what to *remove* from your app — how to make it simpler — not 'what's the next big thing to add.'"

**Recommendation for Justin:** Run the double-diamond compress pass at the start of every BrandOS phase: 30 minutes of discovery (what dealer signals exist for this problem?) → 15 minutes of definition (one sentence problem statement) → then build. The `grill-me` skill is the right tool for the Define phase — it stress-tests the problem statement before the solution gets locked in.

---

### Use Case 6: Monitoring / Self-Audit Loop (visual/a11y/UX regression checks)

**How the loop runs:** Scheduled cron checks each dealer's BrandOS site and each client site for: WCAG contrast failures, broken responsive layouts, font loading regressions, missing alt text, JS errors that prevent render. Findings → `state/brandos-dealer-health.md`. Weekly audit of the AIOS UI checks for visual drift from the design system.

**What "good" looks like:** Accessibility regressions are caught before a client complains. For Partners for Sight (accessibility-critical — visually impaired publications), this loop is not optional — it is a contractual quality standard. WCAG AA failures caught in CI, not in a client email.

**Failure mode:** Monitoring only covers functional correctness (links work, pages load) not visual and accessibility correctness. A page that loads but has 2:1 contrast ratio passes functional checks and fails the user.

**Recommendation for Justin:** The `ce-design-implementation-reviewer` and accessibility checking belong in the same scheduled loop. For Partners for Sight specifically, run a dedicated accessibility audit on every deploy. Wire it to the CI/CD for that project so it blocks on WCAG AA failures. For BrandOS dealer sites, the weekly health check should include a Lighthouse accessibility score baseline — alert on drops greater than 5 points.

---

### Use Case 7: Learning / Knowledge-Compounding Loop (design system + pattern library)

**How the loop runs:** Every design decision Justin makes on one project is a candidate for extraction into a cross-project pattern. A card component pattern developed for BrandOS applies to client sites. A typography scale decision made for Iowa State Fair informs the BrandOS website builder's defaults. A spacing decision from the AIOS console feeds back into BrandOS.

**What "good" looks like:** Justin has a `design-patterns.md` (or equivalent) that captures cross-project design decisions. Each new project starts by consulting it and contributing back to it. The pattern library compounds. After 2 years, it is the most valuable design asset in the BGD portfolio.

**Failure mode:** Each project is designed in isolation. Justin re-solves the same card layout problem 6 times across 6 clients. He re-picks the same spacing scale. The knowledge exists only in shipped code, not in an extractable, reusable form.

**Recommendation for Justin:** Create a `references/design-patterns.md` in claude-os. Every project's `/wrap` includes a "design patterns worth extracting" section. The AIOS UI work happening now on this branch is the first and best candidate for extraction — the operator console patterns will recur across every client-facing dashboard BGD builds.

---

## (d) Deep Dive: The Design Iteration Loop

This is the loop that most directly maps to Justin's day-to-day UI work on BrandOS and client sites. Here is the full architecture.

### The Full Cycle

```
1. INTENT       Define the design goal in one sentence + a reference image
2. IMPLEMENT    Build the UI (AI does the heavy lifting)
3. CAPTURE      Screenshot the rendered result (section-level, not full-page)
4. SCORE        Evaluate against 5 criteria: composition, typography, color/contrast, visual identity, polish
5. CRITIQUE     Identify top 3 issues with specific language ("the badge spacing is off-token" not "it looks wrong")
6. FIX          AI applies fixes within stated constraints
7. CHECKPOINT   Human taste pass: does this still look designed, not generated?
8. LOOP or STOP If all criteria >= 4/5 for two consecutive iterations, stop. Otherwise → step 3.
```

### The Anti-Slop Gate (Step 7)

This is the step that makes the loop produce Justin's work, not AI's work. The gate questions:

- Does this look like something Justin Lobaito designed, or does it look like a ChatGPT screenshot from 2024?
- Would this pass the "portfolio test" — could it go in a BGD portfolio without embarrassment?
- Are the font choices intentional? (Inter by default = not intentional. Inter chosen because it fits the brand system = intentional.)
- Does the hierarchy work? Does the eye know where to go first?
- Does the spacing feel deliberate or just "not too tight"?

The taste-checkpoint does not take long. It takes 60 seconds of honest looking. The discipline is doing it every loop, not just when something feels obviously wrong.

### The Reference Library Role

The `design-loop` plugin's "Creative Unleash" mode starts by asking for reference images and companion skill guidelines. This is correct — the loop needs a direction vector, not just a score. Without a reference, the AI optimizes for "not obviously bad" rather than "great." Justin's reference library should be:

- A curated folder of screenshots: `references/design-inspiration/` organized by category (operator dashboards, ecommerce, accessibility-focused, etc.)
- BrandOS brand snapshots: screenshots of existing BrandOS UI that represent the intended direction
- Client-specific references: one folder per client containing their brand guidelines and inspiration pulls

Feed the relevant reference to the loop at step 1. The loop then scores against "does this approach the reference?" rather than "does this avoid obvious mistakes?"

### Tooling Available Now

**design-loop plugin** (https://github.com/tonymfer/design-loop): Claude Code plugin, `/design-loop` or `/doop`, three modes (Precision Polish for production tweaks, Theme-Respect Elevate for token-aware work, Creative Unleash for redesigns). Section-level screenshot capture, 5-criteria scoring with anti-slop flags, stuck detection, plateau detection. Install: `claude plugin add https://github.com/tonymfer/design-loop`.

**ce-design-iterator**: Compound Engineering agent for iterative UI refinement, already available in this Claude Code setup. Spawnable as a subagent for N screenshot-analyze-improve cycles.

**ce-design-implementation-reviewer**: Compares live UI against Figma specs. Use after making changes to verify against the design source of truth.

**Screenshot verification loop (manual):** `Cmd+Shift+4` → paste image into Claude Code session → "tell me what looks wrong and fix it." Three rounds, ~8 minutes. This works right now with no additional tooling. (Source: https://youcanbuildthings.com/articles/fix-ugly-ui-claude-code/)

### Wiring This for BrandOS

**Operator Console (current branch feat/aios-ui-v2-operator-console):** Run `/doop http://localhost:[port] 0 theme-respect-elevate` after each major UI session. The Theme-Respect mode is right here — it reads existing tokens (Tailwind config, CSS vars) and elevates within them. No foreign design elements introduced. Stop condition: all 5 criteria hit 4/5+. Human taste checkpoint after the loop completes.

**BrandOS website builder (dealer-facing):** Dealers make their own sites — the website builder's output quality is a BGD brand risk. Every template ships with a `/doop` pass before going live. Run in Creative Unleash mode for new templates (maximum latitude), Precision Polish for incremental fixes to existing templates.

**Client sites (Wild Rose, Iowa State Fair, Mr Gym):** Run the manual 3-round screenshot loop before any major visual deploy. Partners for Sight: include WCAG contrast checking in every loop pass — accessibility is not aesthetic, it is contractual.

**AIOS console:** The operator console is Justin's own tool — this is the safest place to experiment with the full design-loop automation. Wire it as a standard step in the branch workflow: before merging any UI feature branch, run one `/doop` pass and document the result.

---

## (e) Top 5 Systematic Changes to How Justin Runs Design/Product Under Loop-Thinking

### 1. Add a design-system.md to every repo (do this week)

A markdown file with fonts, colors, spacing values, and component styles. Reference it in each repo's CLAUDE.md. Two effects: AI uses specific values instead of guessing (no random blues), and output is consistent across every page and project. The design-system.md is the token layer made portable across repos that do not share a codebase. Takes 30 minutes to create; pays dividends on every AI-assisted UI task forever.

**Source discipline:** BrandOS design-system.md is the master. Client repos get derived versions with client-specific overrides. The hierarchy is token-first.

### 2. Establish the design iteration loop as a standard branch step (not a one-off)

Before merging any branch that touches UI: `/doop` pass or the 3-round manual screenshot loop. This makes design quality a loop condition, not an afterthought. The loop runs as part of the definition of "done" — not as a separate "polish sprint" that gets cut when time is short.

Specifically for the current AIOS UI work: add `/doop` to the branch checklist before the next PR merge.

### 3. Build a cross-project design pattern library

Create `references/design-patterns.md` in claude-os. Structure: component name → decision → rationale → where used. Add a "design patterns worth extracting" section to the `/wrap` skill output. Within 3 months, this becomes the starting point for every new client project.

This is the design equivalent of Pocock's "harness improvement" principle: better codebase patterns lower the cost of the next AI-assisted build. Better design patterns lower the cost of the next AI-assisted UI.

### 4. Run user feedback as design hypotheses, not to-do items

When dealer or client feedback arrives, convert it to BML format before it enters the backlog: "We believe [problem]. We'll test by [change]. Success = [metric]." Discard any signal that cannot be converted to a hypothesis — if you can't measure it, you can't learn from it. Aim for 1-3 active design hypotheses per project at any given time.

This changes the `/brief` output from "here's what's in the inbox" to "here's what's in the inbox AND here are the design experiments currently running."

### 5. Wire the taste checkpoint into the loop, not after it

The human taste-pass must happen inside the loop (at step 7, before the loop can declare done) not after (as a retrospective "looks good" review). The failure mode is that the loop runs to completion, declares all criteria 4/5+, and Justin accepts the result without his own eyes on it. The anti-slop criteria in the design-loop plugin are good but they are trained on aggregate patterns — they will not catch "this feels like a generic SaaS dashboard, not like BGD's work."

Concretely: create a `design-taste-checklist.md` with 5-7 questions (portfolio test, hierarchy test, intentional font test, spacing deliberateness test, brand alignment test). Run it after every `/doop` pass. Takes 2 minutes. This is the checkpoint that keeps AI loops from diluting Justin's design voice.

---

## (f) Sources

1. **Lean Startup — Build-Measure-Learn:** https://theleanstartup.com/principles
2. **Felix Lenhard — BML in Practice:** https://felixlenhard.com/blog/the-build-measure-learn-loop-in-practice/
3. **Umbrex — BML + Double Diamond integration:** https://umbrex.com/resources/frameworks/organization-frameworks/lean-startup-build-measure-learn-loop/
4. **Design Council — Double Diamond:** https://www.designcouncil.org.uk/resources/the-double-diamond/
5. **Maze — Double Diamond process:** https://maze.co/blog/double-diamond-design-process/
6. **Smashing Magazine — Improving the Double Diamond (Andy Budd):** https://www.smashingmagazine.com/2023/08/improving-double-diamond-design-process/
7. **Figma Blog — Inside Figma: product design team process (Noah Levin):** https://www.figma.com/blog/inside-figma-the-product-design-teams-process/
8. **Figma Blog — Engineering critiques at Figma:** https://www.figma.com/blog/how-we-run-eng-crits-at-figma/
9. **Google Design — Collaborative UX critique practices:** https://medium.com/google-design/a-collaborative-approach-to-shaping-successful-ux-critique-practices-b7f060c21582
10. **Ranveer Kumar — Design systems as operating loops:** https://blog.ranveerkumar.com/articles/designing-frontend-platforms-design-systems-governance-tokens-engineering-velocity
11. **Design Systems Flywheel:** https://garden.ajose.dev/20220509015158-design-systems-flywheel/
12. **Component-first vs token-first design systems:** https://www.klaweht.com/2026-04-25-component-first-vs-token-first/
13. **Emil Kowalski — Developing Taste:** https://emilkowal.ski/ui/developing-taste
14. **Emil Kowalski — Train Your Judgement:** https://emilkowal.ski/ui/train-your-judgement
15. **Emil Kowalski SKILL.md:** https://github.com/emilkowalski/skill/blob/main/skills/emil-design-eng/SKILL.md
16. **mluev design-philosophy-skill (Rauno + Emil synthesis):** https://github.com/mluev/design-philosophy-skill
17. **design-loop Claude Code plugin (tonymfer):** https://github.com/tonymfer/design-loop
18. **Screenshot verification loop — youcanbuildthings:** https://youcanbuildthings.com/articles/fix-ugly-ui-claude-code/
19. **frontend-design-loop-mcp:** https://github.com/alexalexalex222/frontend-design-loop-mcp
20. **Background context — Loop Engineering digest:** /Users/justinlobaito/repos/claude-os/brainstorm/research-loop-engineering-2026-06-19.md
21. **Background context — Matt Pocock queue/harness digest:** /Users/justinlobaito/repos/claude-os/brainstorm/research-matt-pocock-agentic-workflow-2026-06-19.md
