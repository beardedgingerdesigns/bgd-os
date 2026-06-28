# The Goal-Verifier-Gate Pattern — Running Loops Without Writing the Prompts

**Date:** 2026-06-20
**What this is:** The operational layer of the loop-engineering corpus. How to apply the "goal with verification" loop (Boris Cherny's `/goal`, the evaluator-optimizer pattern) outside of code — in business development and design — so the prompting happens inside the loop and Justin only supplies "here's what I want to have happen."
**Origin:** Justin's takeaway from the Pocock/loops video ("the majority of prompts I run shouldn't be prompts I write") + this session's working-through of how that generalizes.
**Parent:** [research-loop-engineering-synthesis-2026-06-20.md](research-loop-engineering-synthesis-2026-06-20.md). Governance altitudes referenced throughout live in [loop-research-2026-06-20/04-human-in-loop-governance.md](loop-research-2026-06-20/04-human-in-loop-governance.md).

---

## The reframe

"Stop writing prompts" is half right, and the missing half is where all the risk lives.

You don't stop writing prompts. You **trade writing many execution prompts for writing one goal + one verifier.** The prompting moves inside the loop. The verifier-writing becomes the new job. You write fewer prompts, but higher-leverage ones.

This works cleanly in code because code has cheap, objective verifiers: `tests pass`, `lint clean`, `build succeeds`. "Done" is machine-checkable, so the loop self-checks and you walk away. **The entire pattern lives or dies on the verifier.** A goal-loop with no real verifier is not autonomy. It is unsupervised slop generated faster.

---

## The decomposition

Every goal-loop has three things Justin authors and one thing the loop authors:

- **GOAL** (you write) — what "done" looks like, in one sentence.
- **VERIFIER** (you write) — how "done" gets checked: a test, a metric threshold, or a scored rubric.
- **GATE** (you set) — where you must personally sign. Almost always external-facing or strategic.
- **PROMPTS** (the loop writes) — the step-by-step it gives *itself* to close the gap between the current state and the goal.

"Here's what I want to have happen" = **Goal + Verifier + Gate.** That is the orchestration spec. Hand it that, and the prompts happen inside the loop.

---

## The verifier spectrum

How far a loop runs before it needs Justin is set entirely by how objective the verifier is. This maps directly onto the four governance altitudes (DECIDES / REVIEWS / AUDITS SAMPLE / SETS POLICY ONLY).

| Verifier strength | Example | How far the loop runs |
|---|---|---|
| **Objective** (machine-checkable) | tests, type-check, "dealer not logged in 14d," MRR delta | Near-autonomous → audit a sample |
| **Rubric** (scored, semi-objective) | voice.md compliance, anti-slop 5-criteria, "has a quantified before/after" | Self-checks most cycles → gate the final |
| **Human-only** (taste/strategy) | "is this the right bet?", "does this feel like my work?" | Loop can't verify → stay in |

The actual skill being learned: **write the verifier as far up that table as the domain honestly allows, and be honest when it can't go up at all.** Code lives at the top. Business and design live in the middle. Strategy lives at the bottom and never moves.

---

## Business development, worked

### Proof-point content loop (the Wave-1 growth move)
- **Goal:** "Turn this client win into a publish-ready LinkedIn post."
- **Verifier (rubric):** quantified before/after present? passes `references/voice.md`? exactly one soft CTA? under 200 words? zero fabricated numbers?
- **Gate:** Justin clicks send. External-facing = DECIDES, permanently.
- The loop drafts, scores itself against the rubric, rewrites until it passes, then queues it. Justin never wrote the draft prompt. He wrote the rubric once.

### Business-health loop (objective verifier → near-autonomous)
- **Goal:** "Surface anything that threatens MRR this week."
- **Verifier (objective):** dealer not logged in 14d, retainer silent 21d, MRR down vs last week, dealer activation stalled. Pure data checks.
- **Gate:** only a RED flag interrupts; everything else lands in the Monday brief.

### Lead-qualification loop
- **Goal:** "For each inbound, decide fits-ICP / doesn't, and draft a response."
- **Verifier (rubric):** matches the ICP checklist? draft consistent with the engagement model? draft-only, never auto-sent.
- **Gate:** Justin sends.

---

## Design, worked

- **Goal:** "Make this component match the design system and not look generic."
- **Verifier (rubric + objective):** the screenshot → score → anti-slop loop — 5 criteria ≥ 4/5 for two consecutive passes, plus a token-match check (no off-system colors). Detail in [03-design-product-loops.md](loop-research-2026-06-20/03-design-product-loops.md).
- **Gate:** Justin's 60-second taste pass ("BGD's work, or a 2024 ChatGPT screenshot?").
- The loop writes its own correction prompts ("badge spacing is off-token, fix it"), caps at 3 iterations, then hands off. Justin supplied intent + a reference image + the rubric.

---

## The honest limit

**Where Justin can't write a real verifier, he does not get to step out.**

Strategy and roadmap have no verifier that exists. "Is this the right thing to build?" is the Orient node. Faking a rubric for it is exactly the cognitive surrender the governance research warns against (Bainbridge's *Ironies of Automation*; Osmani on comprehension debt). The skill is not "loop everything." It is knowing which decisions have a verifier and which are irreducibly Justin's. Planning stays at DECIDES, permanently.

---

## The Pocock reconciliation

This is not "an infinite loop you abandon." It is: **drop a goal + verifier into a queue; an AFK agent picks it up, self-prompts to the verified done-state, then ships (if the gate allows auto) or queues for sign-off.** Justin presides over the queue as the king. He does not babysit the loop. This is how the video's "write goals not prompts" and Pocock's "queues, not loops" become the same thing.

---

## How it lands in the AIOS: a goal-loop is a skill

Each goal-loop becomes a **skill** (a procedure invoked with just the input). The goal + verifier + gate get authored **once** inside the SKILL.md. Forever after, Justin types `/proof-point <the client win>` and the prompting happens inside. That encoding is what makes "me giving here's what I want, orchestrated" real and repeatable, and it compounds (each skill is a write-once, reuse-forever asset).

### Reusable authoring template

When building any goal-loop skill, fill these four blanks:

```
GOAL:      One sentence. What does "done" look like?
VERIFIER:  How is "done" checked? (test | metric threshold | scored rubric)
           Push it as far up the verifier spectrum as honest.
GATE:      Where must the human sign? (default to: anything external-facing
           or strategic stays human)
STOP:      Max iterations before it hands to the human regardless
           (design caps at 3; content at 3-4; data loops exit on the check).
```

If you can't fill VERIFIER with something checkable, the work is not a goal-loop. It is a human decision wearing a loop costume. Keep it at DECIDES.

---

## First candidate to build

The **proof-point loop** as a real `/proof-point` skill. It is the highest-leverage and most concrete: it is the Wave-1 growth move, and building it demonstrates the goal + verifier + gate pattern end to end on something that grows the business rather than just speeds up the build.

---

*Companion to the loop-engineering corpus. See [research-loop-engineering-synthesis-2026-06-20.md](research-loop-engineering-synthesis-2026-06-20.md) for the full map.*
