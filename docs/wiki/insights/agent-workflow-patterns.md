# Agent Workflow Patterns

**Curated:** 2026-06-25 | **Source research:** 2026-06-10 → 2026-06-21
**Consolidates:** loop-engineering + synthesis, goal-verifier-gate, Matthew Berman (7 loops), Nate Herk (agent loops, 6 skills, second-brain levels), Matt Pocock (agentic workflow), Zack Proser (attention stack), compound engineering, Loop Library, BridgeMind/Fable 5

The engineering doctrine behind the [AIOS operating model](../research/aios-evolution.md): how Justin actually builds and runs the systems that let one operator do the work of a team. Synthesized from a dozen practitioner sources into principles and patterns — not a list of videos watched.

---

## The one reframe

**Your unit of work moved from the keystroke → the prompt → the loop.** You stop writing the code, stop even writing the prompts, and start designing the thing that prompts.

> "I don't prompt Claude anymore. I have loops running. They prompt Claude. My job is to write loops." — Boris Cherny (head of Claude Code)

**Pocock's correction, which the whole corpus endorses:** don't picture one infinite loop billing tokens forever — picture a **queue of work that many agent-nodes service, with you as the king prioritizing the queue.** "Loop" is the mechanism; **"queue with a human at the decision node" is the correct mental model.** You don't deploy a minister to a far region and never hear back (a blind loop that goes wrong); problems come *to* you in a queue and you prioritize.

---

## What a loop actually is (the unified theory)

Strip every domain — code, business, design, knowledge — and a loop is the object Wiener described in 1948: a **setpoint** (what "done" looks like), a **verified feedback signal** (checked output, not assumed), and **damping** (sample before acting). Run it on *discover → act → check → decide → repeat*.

- Miss the **setpoint** → it runs forever.
- Miss **verified feedback** → it compounds errors.
- Miss **damping** → it oscillates.

Loops aren't an AI trick; AI just made them cheap to run. The difference between a script and an agent is whether the *check* step requires judgment.

### The shared anatomy (the reusable template — more valuable than any single loop)

1. **Trigger** — when it runs.
2. **Action** — one bounded change per cycle, not a big-bang.
3. **Check** — a *verified* signal, ideally from an **independent** reviewer (separate session / git worktree) that tries to *break* the fix, not confirm it.
4. **Stopping condition** — clean pass, OR progress stalls, OR a bounded retry limit, OR "if it returns for two rounds, stop and find what's regenerating it."
5. **Finish report** — what changed, evidence, what's left, attribution.
6. **Safety rail** — "ask before production, sensitive data, or destructive actions."

This is the same object as **goal → verifier → gate** and **setpoint → verified feedback → damping**, written three ways.

### Two taxonomies (Berman)

A loop needs exactly two things:
- **Trigger** — *manual* (you say go), *scheduled* (cron), or *action* (fires on an event like a PR open). Full autonomy = move off manual toward scheduled/action.
- **Goal** — *verifiable* (deterministic, testable: "100% coverage," "every page <50ms" — **best case**) or *LLM-as-judge* (the model decides — works but **brittle**; tighten with explicit criteria).

In Claude Code / Codex, `/goal` runs until the condition is met. Watch token spend (10 min to 10+ hours).

---

## The Four Laws (the constitution)

Five independent research lenses kept converging on the same four principles:

**Law 1 — Close the loop or it's just faster output.** Every loop must deposit an asset that feeds the next cycle: a lint rule, a routing pattern, a design token, a proof point, a calibration note. An *open* loop compounds at 0%. A loop that improves the system 2%/cycle, run weekly, is ~2.8× more effective in a year. The math only works if the loop closes.

**Law 2 — Maker ≠ checker.** Never let the producer be the only approver; it collapses into self-approval (cost, no quality gain). Separate calls, separate contexts, and the checker needs a *deterministic rubric* (tests pass, lint clean, scored prompt) — not "review this."

**Law 3 — Automate Observe and Act; keep the human at Orient.** Boyd's OODA: AI accelerates monitoring (Observe) and execution (Act). The synthesis that turns observation into a decision — *what matters, what's a real opportunity vs. a well-worded distraction* — is non-delegable. Be the Orient node; don't be in the keystroke path and don't rubber-stamp. This is the rail on everything else. (Proactive loop/goal directive: solo loop by default; always ask "what's the done-check?")

**Law 4 — Leverage is bounded by the harness, not the model.** A better codebase, better skills, better environment — not the model-of-the-week — is the real lever. "A better codebase = a cheaper model." Architecture and guardrails are the token-spend lever.

---

## The queue discipline (Pocock's corrective)

The loop maximalists (Theo, Boris, Addy) are the hype; Pocock is the disciplined corrective. The truth for a solo operator is **queue + human-as-king with *selective* loops bolted on** (self-improving cron checks, AFK task-runners) — not "everything is an infinite loop."

- **Queues, not loops.** Model AFK work as a backlog many nodes pick from. GitHub issues *are* the queue: an AFK agent triages → labels move items (`trivial`/`needs-human`/`agent-implement`) → it implements → comes off the queue on merge.
- **AFK is the unlock, not loops.** Parallelize *yourself* via sandboxed agents + CI triggers.
- **Push human checkpoints toward prod, never to zero.** Review gates danger *and* gives observability into your own system. "Who reviews the AI that says you don't need to review? We're not just reviewing the code — we're reviewing the system that produces the code." Make review *seamless* (PR walkthrough videos, bug-pattern dashboards), don't remove it.
- **Procedures over abilities.** Every model-invoked ability taxes your context window. Stay in the driver's seat.
- **Product vision and feature *subtraction* stay human.** AI can't pick what to build or what to cut.

---

## Workflows beat agents (Nate Herk / 3Ms)

Default to **deterministic workflows**; only reach for AI when the step genuinely requires judgment. A **vending machine** (same input → same output) should be a script. A **slot machine** (variable input → requires reasoning) should be an agent. Most "agent" work is actually workflow work with one AI step in the middle. Knowing which is which is itself one of Nate's six skills ("build your own Jarvis" includes *knowing when a task needs an agent vs. a deterministic workflow"). See [the 3Ms framework](../frameworks/3ms-framework.md).

---

## The compounding layer (where leverage actually accrues)

**Compound engineering (Every):** each unit of work should make the next *easier*, not harder. Invert tech-debt accumulation by codifying learnings. The four-step loop:
1. **Plan** — research the codebase + commit history + web best practices; write objective/architecture/success-criteria. "Good planning is not pure delegation."
2. **Work** — execute against the plan.
3. **Assess** — linters + tests + parallel code-review subagents (each a different lens: security, performance, overbuilding).
4. **Compound** *(the money step)* — record what was learned so the next agent reuses it. "A new hire is as well-armed to avoid common mistakes as a veteran." Rules become prompts in the codebase; everyone inherits them automatically.

**The self-improving skills-audit loop (Proser):** Claude Code saves every session as JSONL. Run a scheduled weekly pass over your own history hunting for heavy thinking-token spend, back-and-forth churn, and repeated friction. Then ask: **"What skill/MCP/tool would have made this one-shot?"** and generate the missing skill. *JSONL hygiene:* a session-end hook distills "key bits + where we struggled" into a flat markdown store; run the weekly analysis over that, not raw JSONL. → This is exactly what `/retro` + `/level-up` do in the AIOS.

**The meta-loop:** the Loop Library ships an installable skill that can *find, audit, adapt, and design* loops — a loop for making loops, which is the compounding layer made concrete.

---

## The constraint has moved: attention, not agents

**Agents are no longer the bottleneck — human attention is.** Agents scale infinitely and loop until criteria are met; human attention degrades under load. "The tools are nuclear, our nervous systems are ancient." Scaling output linearly with the new tools is the default path to "burnout turbo." Humans keep judgment, taste, and knowing-something-is-actually-solved; everything else should be structured to protect attention. (Proser's four-layer stack: signal layer → voice-first flows → remote control → system self-improvement, with verification gates because "speed requires safety.")

This is why the queue model matters: it protects the scarce resource (your attention) by making you the prioritizer, not the operator.

---

## Token economics shape architecture

Agent **resumption re-reads the whole transcript** — a fat hidden cost. The discipline that follows: batch fat rounds, spawn fresh agents per pipeline stage, and **never resume when you can restart**. This directly shaped AIOS skill design (`/ship` uses fresh subagents per stage, not one long-lived agent; `/catchup` over the built-in `/resume`). Field data (BridgeMind on Fable 5) corroborates: sub-agent multiplication and effort-level are real cost levers — a single operator can spend most of a $200 Max plan in under 30 minutes of heavy parallel runs. **Backend one-shots are getting fast** (faster automation builds for the AI-services line), but **design still needs Justin's eye** — which is the BGD differentiation anyway. See [token economics](../frameworks/claude-code-token-economics.md).

---

## The knowledge-system substrate (second brain)

The loops run on top of a knowledge system. **Nate Herk's five levels of a second brain** (Level 1 routing → Level 2 structured wikis → Level 3 semantic search → Level 4 knowledge graph → Level 5 autonomous) map onto the AIOS, which runs **mixed-level**: AIOS core (Level 1 routing) + project wikis (Level 2) + automation (Level 5 partial), each project repo at its own maturity. The AIOS is validated as architecturally sound at Level 2 with smart Level 5 automation; the biggest unlock is a **client relationship graph (Level 4)** — the data exists and graphify is installed.

**The discipline:** *don't move up levels without pain.* Ask "what question am I failing to answer?" before adding architecture.

**Nate's six AI skills** frame the operator side: be the (relative) AI person · build taste/judgment (your name is on the output) · context engineering ("prompting fades, context endures" — feed AI your private context, the "AI OS") · iteration speed (every loop is data; define "done" against one metric) · build your own Jarvis (always-on, self-triggering) · multiple income streams off one passion.

---

## How these patterns show up in the AIOS

| Pattern | AIOS implementation |
|---|---|
| Queue over loop | `/dispatch` stages to `raw/`; `/wiki ingest` curates. Decoupled. |
| Goal-verifier-gate | `/level-up` done-state; `/ship --auto` pipeline; the BrandOS marketing-materials builder was the first worked application. |
| Compound (close the loop) | `/retro` → `/level-up` → ship one automation per week. |
| Maker ≠ checker | Codex-review and `/ce-code-review` run a separate critic against the builder. |
| Token economics | Fresh subagents per stage; `/catchup` over `/resume`. |
| Workflows over agents | Scheduled triage is mostly deterministic with one AI scoring step. |
| Human at Orient | Never auto-merge a plan; confirm before sends/destructive actions. |

**Highest-leverage builds, sequenced:** adopt the two *principles* immediately (keep the human at Orient; never auto-merge a plan — zero build). Then the cheap foundation builds (idempotency sentinels on stateful loops like `/dispatch`; a `design-system.md` per repo; the session-end distillation hook so `/retro` reads summaries not raw JSONL). Then start the **one content loop** this week — it's nearly free and the only candidate that grows revenue (publish proof points, de-risk the Jon dependency).

## Related pages

- [AIOS evolution](../research/aios-evolution.md) — the operating model these patterns power
- [BrandOS growth strategy](../research/brandos-growth-strategy.md) — the marketing-engine loop, first worked goal-verifier-gate application
- [Nel BrandOS partnership](../strategy/nel-brandos-partnership.md) — marketing-engine loop as a partnership
- [The Three Ms of AI](../frameworks/3ms-framework.md) · [Token economics](../frameworks/claude-code-token-economics.md) · [AIOS second-brain principles](../concepts/aios-second-brain-principles.md)
- Advisors: [Matt Pocock](../advisors/matt-pocock/persona.md) (queues, skill design) · [Nate Herk](../advisors/nate-herk/persona.md) (3Ms, workflows over agents)
