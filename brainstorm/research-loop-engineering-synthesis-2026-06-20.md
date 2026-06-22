# Loop Engineering — Foundational Synthesis (Master)

**Date:** 2026-06-20
**What this is:** The capstone over a 7-document loop-engineering corpus. Five parallel research agents each took a different lens on loops, did independent web research (real sources, past JS-rendering), and wrote a findings file. This document is the through-line: the unified theory, the cross-lens use-case matrix, and the systematic changes for how Justin should think about **development and planning across every repo**.

**The corpus (read order):**
1. [research-loop-engineering-2026-06-19.md](research-loop-engineering-2026-06-19.md) — the maximalist case (Theo Browne, Boris Cherny, Addy Osmani, Anthropic)
2. [research-matt-pocock-agentic-workflow-2026-06-19.md](research-matt-pocock-agentic-workflow-2026-06-19.md) — the "queues not loops" corrective (Pocock)
3. [loop-research-2026-06-20/01-engineering-architecture.md](loop-research-2026-06-20/01-engineering-architecture.md) — the mechanics
4. [loop-research-2026-06-20/02-business-growth-loops.md](loop-research-2026-06-20/02-business-growth-loops.md) — loops as compounding business engines
5. [loop-research-2026-06-20/03-design-product-loops.md](loop-research-2026-06-20/03-design-product-loops.md) — design/product as loops
6. [loop-research-2026-06-20/04-human-in-loop-governance.md](loop-research-2026-06-20/04-human-in-loop-governance.md) — control theory + where you stay vs step out
7. [loop-research-2026-06-20/05-compounding-self-improving.md](loop-research-2026-06-20/05-compounding-self-improving.md) — loops whose output is a better loop
8. [research-goal-verifier-gate-2026-06-20.md](research-goal-verifier-gate-2026-06-20.md) — the operational layer: how to run loops *without writing the prompts* (goal + verifier + gate) across business and design
9. [research-marketing-engine-loop-2026-06-20.md](research-marketing-engine-loop-2026-06-20.md) — **worked example:** the BrandOS co-branded ad generator reframed as a real evaluator-optimizer loop (the first goal-verifier-gate application; staged to the BrandOS wiki for implementation)

**External source captures (added 2026-06-21):** practitioner takes that ground the theory above.
10. [loop-library-forward-future-2026-06-21.md](loop-library-forward-future-2026-06-21.md) — Forward Future's Loop Library: 50 copy-paste loops + installable skill; the reusable loop *anatomy* (trigger/action/check/stop/report)
11. [video-nate-herk-agent-loops-explained-2026-06-19.md](video-nate-herk-agent-loops-explained-2026-06-19.md) — Nate Herk (board advisor): the knowledge-worker take — verification is the point, solo loop by default, "what does done mean + how will it check"
12. [video-matthew-berman-7-loops-2026-06-19.md](video-matthew-berman-7-loops-2026-06-19.md) — Matthew Berman (Loop Library creator): the trigger taxonomy (manual/scheduled/action) × goal taxonomy (verifiable/LLM-as-judge); feature-building is the no-go zone

This master doc is the index. The five lens files hold the depth and the sources.

---

## 1. The Unified Theory

Strip every domain — code, business, design, knowledge — and a loop is the same object Norbert Wiener described in 1948: a **setpoint** (what "done" looks like), a **feedback signal** (verified output, not assumed), and **damping** (a delay or sample before acting on feedback). Run that on the cycle *discover → act → check → decide → repeat*. Miss the setpoint and it runs forever. Miss verified feedback and it compounds errors. Miss damping and it oscillates. This is true of a CI pipeline, a growth flywheel, a design-critique ritual, and a weekly retro. Loops are not an AI trick; AI just made them cheap to run.

**The shift everyone is reacting to:** your unit of work moved from the keystroke → the prompt → the loop. You stop writing the code, stop even writing the prompts, and start designing the thing that prompts. **Pocock's correction, which the whole corpus endorses:** don't picture one infinite loop — picture a **queue of work** that many agent-nodes service, with **you as the king prioritizing the queue** (and, in control-theory terms, the non-delegable *Orient* node). "Loop" is the mechanism; "queue with a human at Orient" is the correct mental model.

**The three loop families in your world, and how they nest:**

- **Meta-loops** (knowledge/compounding) improve →
- **Build loops** (dev, design, planning) which ship →
- **Business loops** (growth, retention, proof-point flywheels) which fund and direct the whole stack.

A solo operator with all three closed is, in Anthropic's own framing, a 100-person company — not metaphorically. The ceiling stops being "hours you can work" and becomes "loops you can meaningfully oversee."

**One sentence:** *Design queues of work that agents service, keep yourself at the judgment node, and make every cycle deposit an asset that makes the next cycle cheaper — or you've just built a faster way to produce things nobody asked for.*

---

## 2. The Four Laws (where all five lenses converged)

Independently, the five agents kept landing on the same four principles. Treat these as the constitution.

**Law 1 — Close the loop or it's just faster output.** Every loop must deposit an asset that feeds the next cycle: a lint rule, a routing pattern, a design token, a proof point, a calibration note. An *open* loop — value flows out, nothing flows back — compounds at 0%. A loop improving the system 2% per cycle, run weekly, is 2.8× more effective in a year (Rule of 72). The math only works if the loop closes. *(Compounding lens; echoed by all.)*

**Law 2 — Maker ≠ checker.** Never let the thing that produces also be the only thing that approves; it collapses into self-approval — cost with no quality gain. Separate calls, separate contexts, and the checker needs a *deterministic rubric* (tests pass, lint clean, token match, a scored prompt), not "review this." *(Engineering + governance.)*

**Law 3 — Automate Observe and Act; keep the human at Orient.** Boyd's OODA: AI massively accelerates monitoring (Observe) and execution (Act). The synthesis that turns observation into a decision — *what the data means, what matters, what's a real opportunity vs. a well-worded distraction* — is non-delegable. Your job is to be the Orient node, not to be in the keystroke path and not to rubber-stamp. *(Governance; this is the rail on everything else.)*

**Law 4 — Leverage is bounded by the harness, not the model.** A better codebase, a real design system, encoded skills, tight CLAUDE.md — these let a *cheaper* model converge in *fewer* iterations. Architecture and guardrails are the real token-spend lever, and the real quality lever. Don't wait for a smarter model; improve the environment the model runs in (AX — agent experience). *(Pocock thread, carried through engineering + design + compounding.)*

A fifth, business-specific, deserves naming: **Law 5 — A loop only compounds if it reaches the world.** Internal loops that never publish (better code nobody sees, knowledge that never leaves the wiki) stay leaky funnels. Distribution is the step solo operators skip and the one that turns work into growth.

---

## 3. The Cross-Lens Use-Case Matrix

Seven loop use cases, scored across the lenses. "Start altitude" is the governance starting point (see §4 of the governance file). "Asset" is what must accumulate each cycle for the loop to compound.

| # | Use case | Engineering wiring | Business value | Design note | Start altitude | Asset that compounds |
|---|---|---|---|---|---|---|
| 1 | **Code review & fix** | `on: pull_request` → review-agent (deterministic checks) → fix-agent in worktree → re-check; cap iterations | Low-med (velocity → faster dealer features) | Wire design-impl reviewer for UI PRs | **REVIEWS** (auth/billing/multi-tenant = permanent gate) | Lint rules / CLAUDE.md catches |
| 2 | **Inbox / triage** | Queue, not loop; `.dispatched` sentinel = idempotency | **High** — fastest path to your active acquisition/retention loop | Auto-tag UX-friction language → design backlog | **AUDITS SAMPLE** (drafts only; never auto-send) | Routing patterns → triage rules |
| 3 | **Growth / content** | State machine per piece (draft→review→publish→measure) | **Critical** — the highest-leverage loop you don't have | Marketing tokens = product tokens (one brand loop) | **DECIDES** (hard floor — external voice) | Templates + "patterns that work" in voice.md |
| 4 | **Design iteration** | screenshot→score→fix; hard-cap 3 iters then human | Low-med (quality → retention) | THE central design loop; anti-slop gate at step 7 | **REVIEWS** | Pattern library + ADRs |
| 5 | **Planning / roadmap** | Prompt-chain w/ SPEC.md as immutable ref; human checkpoints | **High** — the roadmap *is* the business bet | Compressed double-diamond at phase start | **DECIDES — permanent** | Plan templates + calibration notes |
| 6 | **Monitoring / self-audit** | Loop lives in the *scheduler* (cron), agent is bounded + cheap | **High** — early-warning on churn/MRR/dealer activation | a11y/visual regression checks (Partners for Sight = contractual) | **SETS POLICY ONLY** (red anomaly = interrupt) | A growing library of automated checks |
| 7 | **Learning / knowledge** | `/retro`→`/level-up`; close it with a pattern backlog | **Critical** — turns client work into reusable IP | Cross-project design patterns | **REVIEWS** (curation authority = you) | Skills, decisions, encoded procedures |

**How to read it:** the loops with the biggest *business* payoff (3, 6, 7) are the ones currently most open in your AIOS. The loops easiest to *build* (1, 4) have the lowest business leverage. That gap is the whole strategic point of §5–7.

---

## 4. The Productive Tension — what to build first

The five agents each named a different #1. That disagreement is the most useful output of the whole exercise, so here it is undisguised:

- **Engineering:** idempotency sentinels on stateful loops (start `/dispatch`) — *safety first.*
- **Business:** build **one content loop** before another engineering loop — *publish proof points; de-risk the Jon dependency.*
- **Design:** a `design-system.md` in every repo, referenced in CLAUDE.md — *specificity over guesswork.*
- **Governance:** **never auto-merge a plan** — *protect the Orient stage.*
- **Compounding:** ship the **session-end distillation hook** so `/retro` reads summaries, not raw JSONL — *close the meta-loop.*

These aren't really competing — they're on two axes. Governance and compounding are *principles* (adopt today, zero build). Engineering, design, and the audit loop are *safety/leverage builds*. The content loop is the *growth engine*. **My reconciliation:** adopt the two principles immediately, do the cheap foundation builds in one sitting, and start the content-loop habit this week because it's nearly free and it's the only one of the five that grows revenue. The sequenced rollout is §7.

---

## 5. Systematic Changes — Development (every repo)

How to think about *building* under loop engineering:

1. **Model recurring work as queues, not loops.** A loop is for ordered dependencies (plan → implement → verify). Everything else — inbox items, PRs, dealer health checks — is a queue with task state (`pending → in_progress → done | escalated`). Most of your "loops" are queues masquerading as loops. Track state in a file so a half-finished run is recoverable and queue depth is visible.

2. **Put the loop in the scheduler, not the agent.** Recurring work = cron / GitHub Actions (`on: schedule`, `on: pull_request`, `on: label`) firing a *bounded, cheap* agent each time — not one long-running agent looping on itself. This is free infra, naturally parallel, and naturally observable.

3. **Maker/checker split with deterministic stops, enforced in code.** Separate the producer from the evaluator. Stop conditions are `tsc` exits 0 / tests pass / token match — not "looks done." Put iteration caps and token budgets at the *orchestration layer*; a cap in a system prompt is advisory and a confused agent reasons past it. (Theo's 8-hour / 3M-token overrun was a missing code-layer stop.)

4. **Idempotency on every stateful loop.** Anything that writes (routes, commits, posts, drafts) gets a sentinel keyed to the item's natural ID (`archives/raw/<file>.dispatched.json`). Re-running must be harmless. This is the single highest-risk gap in the current AIOS.

5. **Invest in AX (agent experience) as the token lever.** A `design-system.md` per repo, a `docs/solutions/` knowledge store, tight CLAUDE.md, small typed modules — these let a cheaper model converge faster. Improving the harness is cheaper than buying a smarter model and it's the part you control.

6. **Close every dev loop with a micro-compound step.** After any non-trivial decision or caught bug class: one ADR line or one `docs/solutions/` entry. 2 minutes. It prevents re-teaching the same lesson 10 times over a project's life.

---

## 6. Systematic Changes — Planning (GSD, every repo)

How to think about *planning* under loop engineering:

1. **Planning stays at DECIDES — permanently.** This is the Orient stage; it encodes your theory of the business. Never auto-merge a plan. Make it structurally impossible for an execution skill to run without a human-approved plan file. AI generates options and tradeoffs; *you* decide. The `grill-me` / `codex-review` adversarial passes are valuable because they *stress-test* your plan, not because they replace it.

2. **Every plan is a business bet — make it feed the growth loop.** Add one field to every GSD phase: *"What dealer/client evidence does shipping this produce that could go in a manufacturer pitch or a case study?"* Design data capture into the feature from the start (the marketing-material builder should count materials/dealer/month on day one), not retrofitted after.

3. **Run a compressed double-diamond at phase start.** 30 min discover (what dealer signals exist for this problem?) → 15 min define (one-sentence problem statement, `grill-me` it) → then build. Most features should start from a signal in the queue, not from "this seems interesting." Pocock's test: ask AI what to *remove*, not what to add.

4. **Anchor every downstream agent to SPEC.md.** Pass the spec as an immutable reference to planner, executor, and verifier — the verifier checks output against the *spec*, not against the prior step. This kills the most common GSD drift ("solved the problem I understood at planning time").

5. **Run planning itself as a build-measure-learn loop.** Each phase wrap captures estimated-vs-actual + one root cause into a `## Planning Calibration` note. Over 10 phases that's a calibration dataset that makes the next estimate honest. 26 features/year should produce 26 written learnings.

6. **Give the knowledge loop a memory: a pattern backlog.** `/retro` deposits unfixed patterns (with evidence counts) into a persistent `state/pattern-backlog.md`; `/level-up` marks one addressed per week. Without it, the same friction resurfaces from zero every week and the compounding math breaks. A pattern open for 3 weeks means the loop is broken — that's your feedback signal.

---

## 7. The Rollout (leverage-ordered, do it in this sequence)

**Wave 0 — Principles (adopt today, zero build):**
- Never auto-merge a plan. Planning = DECIDES, permanently.
- Every loop must name the asset it accumulates; every non-trivial decision → one ADR/`solutions` line.
- Maker ≠ checker, deterministic stops, caps in code.

**Wave 1 — Cheap foundation + the growth habit (this week):**
- `design-system.md` in each active repo, referenced in its CLAUDE.md *(design — compounds AX on every UI task forever).*
- `.dispatched` idempotency sentinels on `/dispatch` + triage *(engineering — closes the biggest correctness gap).*
- `state/pattern-backlog.md` so `/retro`→`/level-up` actually converges *(compounding).*
- **Start the content loop: one proof-point post/week**, mined from work you already did (Wild Rose launch, Mr Gym, Global Ag Network fix). Track inbound inquiries. *(Business — the only Wave-1 item that grows revenue, and it directly executes "don't gate the business on Jon.")*

**Wave 2 — The scheduled loops (medium effort):**
- **Monitoring / "buy a lock" cron** — start with BrandOS API routes + dealer health → `state/`; SETS-POLICY-ONLY with a RED-anomaly interrupt. Cheap (Haiku), catches churn/security before a client does.
- **Session-end distillation hook** → 150-word summaries feed `/retro` instead of raw JSONL. This is the one missing closure that turns the AIOS into a real flywheel.
- **GitHub Actions code-review loop** for BrandOS (REVIEWS altitude; auth/billing/multi-tenant stay permanent human gates).

**Wave 3 — Compound the compounders:**
- `docs/solutions/` per repo + a `/ce-compound`-style step in GSD phase completion.
- Planning calibration notes in `decisions/log.md` on every wrap.
- Advisor-board outcome notes (each `/ask-the-board` decision → 2 sentences on what you chose and how it played out → advisors calibrate to *your* reality).

---

## 8. The Single Highest-Leverage Reframe

If you internalize one thing: **you are not writing loops, you are running a queue of work as the Orient node, and your job is to make every cycle leave an asset behind.** Speed is the cheap part now — Anthropic's own data shows the doing costs almost nothing and *review became the bottleneck*. Your durable edge is the three things AI still can't do: decide which problems are worth solving (Orient), keep a trained eye on the output (taste), and make the system smarter each cycle (compounding). Build the loops like someone who intends to stay the engineer — not the person who presses go.

---

*Generated from 5 parallel research agents, each with independent web research. Lens files and full source citations in [loop-research-2026-06-20/](loop-research-2026-06-20/).*
