# Matt Pocock's Agentic Engineering Workflow — The Queue Counterpoint to Loops

**Date:** 2026-06-19
**Source:** David Ondrej interview w/ Matt Pocock — "Matt Pocock's Agentic Engineering Workflow (just copy him)" (YouTube, posted 2026-06-18) — https://www.youtube.com/watch?v=nQwJVHCtDDY
**Why it's filed here:** Direct counterpoint + refinement to [research-loop-engineering-2026-06-19.md](research-loop-engineering-2026-06-19.md). Read the two together.
**Bonus:** Matt Pocock is on Justin's advisory board (`docs/wiki/advisors/matt-pocock/`). This is primary-source material from a board member.

---

## TL;DR — Where this lands vs. the loop research

The loop research (Theo Browne, Boris Cherny, Addy Osmani) is the **maximalist** case: "stop prompting, start writing loops." This Pocock interview is the **disciplined corrective** to that same hype wave. His one-line reframe:

> "The way I mostly think about these things as queues, okay, **queues, not loops**. The queue is really the backlog of tasks that I need to complete... an idea that there's a single loop that just sort of goes and completes all the tasks doesn't really match with how developer teams generally work."

He doesn't reject AFK autonomy — he *pioneered* it for himself. He rejects the framing. "Loop" implies an infinite self-running process billing tokens forever. "Queue" is the accurate model: many sources add tasks, many agent-nodes pick them off, work resolves on merge, and **the human stays the king prioritizing the queue**.

He also explicitly calls part of the loop hype what it is:

> "Half of it I would say is like the research labs selling more tokens... 'Stop prompting your agents, figure out what loops it can run forever permanently.' Half of it could be useful."

---

## The Core Concept: Harness > Model

The thesis the whole interview hangs on:

> "Everyone's obsessed with the model... they should be more interested in the **harness** — what you can do to get the most out of the harness, giving it the right prompts, the right skills to work with, and improving the environment in which the model runs. The model is useful, but the harness has an equal amount of work, and **you have much more control of the harness than you do the model**."

The Formula 1 analogy: everyone obsesses over the engine (model), but the engine is only part of the system — there's the chassis, the aerodynamics. He weights it **50/50 model-to-harness**, against the common assumption that it's 90% model / 10% harness.

**The token-economics punchline** (matters for Justin — Max vs API billing):

> "How do you optimize for token spend? **Have a codebase that's easier to make changes in.** If your codebase architecture is better, then you can get a cheaper model to do the same work — your guardrails are better, it's easier to explore, it needs to spend fewer tokens banging its head against the wall. If you're hamstringing your model from day one, then you need a smart model to get the most out of it."

**The bitter-lesson tension** (his own honest doubt): the ML "bitter lesson" says raw compute beats hand-optimization every time. He admits he *might* be falling into it by optimizing the harness instead of waiting for better models. His bet: fundamentals that have worked 30-40 years are **agent-agnostic** and will keep working, so optimize those, not the model-of-the-week. Ondrej pushes back ("why not both?"), Pocock concedes you shouldn't *wait* — "that was a very stupid idea, people waiting around for AGI" — but stays harness-first.

---

## Strategic vs Tactical Programming (the human moat)

Borrowed from John Ousterhout's *A Philosophy of Software Design*:

- **Tactical** = on-the-ground daily work: writing code, syntax, fixing bugs as they come, making commits.
- **Strategic** = winning the war not the battle: how the codebase needs to look, what raises velocity, the roadmap. "The general at the top."

> "AI has basically **eaten tactical programming**. It's gone. AI is just better at it than you because it can do it cheaper. So you need to be great at **strategic programming** to get the most out of this infinite fleet of tactical programmers you now have access to."

What strategic delegation still requires (unchanged by AI — same as delegating to juniors): design the hard parts up front, scope tasks really well, think about interfaces between modules, write good tests, and keep "just enough documentation to point AI to the right places."

---

## Your Skills Are the Ceiling

> "Your skills are the ceiling on what AI can do. If your skills are low, AI is not going to be able to go past that... AI makes senior developers just **10 times better**. It doesn't make sense to hire that many juniors anymore — juniors get a little boost, seniors get a ridiculous huge boost."

Corollary: getting good *with* AI = getting good at *your domain*. A better teacher uses AI to teach better; a better engineer uses AI to engineer better.

### Knowledge / Skills / Wisdom
Three things you need to be good at anything:
1. **Knowledge** — understanding the thing in your head.
2. **Skills** — having done it enough that it's muscle memory.
3. **Wisdom** — knowing *when* to do it and how it fits the real world.

> "Wisdom is almost impossible to obtain without actually having done the thing in the exact context where you need to do it." (You can absorb Anthropic's knowledge and skills, but to get the *wisdom* you'd have to go work at Anthropic.)

---

## Skills: Procedures vs Abilities (a real philosophical split)

Pocock's taxonomy of agent skills:

| Type | Who invokes it | Context cost | Example |
|---|---|---|---|
| **Procedure** | The human, deliberately | You control when its description loads | `grill-me`, "write a PRD", "turn PRD into issues" |
| **Ability** | The model, autonomously | **Leaks its description into context window every session** | "my React coding standards" the agent pulls when writing React |

> "I tend to prefer my skills as procedures. I like to be the one in control... **I don't want to delegate my thinking to the model.**"

He contrasts himself explicitly with **superpowers (Obra)** — "probably the most popular skills repo out there... it takes the opposite approach, it prefers things to be more like the model is in control." Pocock keeps the knowledge **in the human**, the human in the driver's seat.

> **The context-bloat warning:** "Every single ability leaks a description into the context window. If you have 100 skills, you're leaking 100 descriptions." (He sets `disable-model-invocation: true` on user-only skills so their descriptions never load.)

His **`grill-me`** skill (one of his most popular) is the canonical procedure: ~4-5 sentences that turn the agent into an adversarial interviewer until you reach shared understanding. He uses it as a replacement for plan mode before implementing. *(Note: Justin already has a `grill-me` skill installed — this is its design rationale from the source.)*

The **teach skill** (just shipped, `github.com/mattpocock/skills`, `npx skills latest add mattpocock-skills`): a *stateful* skill (writes `mission.md`, a learning record, HTML lessons to a workspace, uses quizzes for "storage strength" and the zone of proximal development). It builds a linear path through the knowledge graph and personalizes to your actual machine setup. He's learning Rubik's cube and "how to become a senior developer" with it.

---

## AFK > Loops (the actual unlock)

> "What we're essentially talking about is the difference between **human-in-the-loop work and AFK work**. The moment I discovered AFK was the moment I really got into AI coding... **the moment I can remove myself from the equation, I've parallelized myself. Suddenly there are two of me, three, four, five** — able to produce so much more code that I then go and review."

Historical lineage he draws: the "loop" idea goes back to **Geoffrey Huntley's "Ralph"** (article 2026-07-14 — a `while` loop that just passes a prompt to Claude Code again and again). Pocock's realization:

> "I don't really need to run this as a loop. The only thing I need is the AFK agent to take on a specific task and do that task."

### His actual setup
- **Claude Code, Opus 4.8, medium effort** — for planning + some local implementation. ("I mostly don't worry about models that much.") Deliberately waiting ~a month on Fable 5 before adopting — "you're not losing that much by waiting to see how things shake out," same as he did with Opus 4.5.
- **Sand Castle** (his tool) — runs agents inside sandboxes (Docker/Podman/Vercel sandboxes) so they can't nuke your home dir or exfiltrate env vars. Lets you parallelize agents locally or remotely and pull commits back.
- **GitHub Actions** — agents triggered by PR/label events (e.g. an `agent-review` action that checks out the branch, runs a review-agent prompt, type-checks, comments back). "Unreasonably effective — you parallelize as much as you want without constraining your local machine."
- **Whisper Flow** for dictation. "Anyone not doing dictation is just so much slower... it's about how fast you can output tokens from your brain and back in."

### The queue model in practice
Sand Castle's GitHub issues *are* his queue. Triage labels move items: an AFK agent explores an issue → returns structured data ("trivial? possible? human needed?") → he adds an `agent-implement` label → it implements in the Actions setup → comes off the queue when the PR merges. Multiple nodes, multiple triggers, anyone can add work. "That's all development is, really — a queue of tasks. We've always done it this way."

David Ondrej's framing that Pocock endorsed — **the medieval king**: you don't deploy a minister to a far region and never hear from him (that's a blind loop that can go wrong). You stay the king; problems come *to* you in a queue (invasion, famine, 50 bug reports of which 3 are critical), and you prioritize. You're still in charge.

---

## Human-in-the-Loop Checkpoints: push right, never to zero

The goal is to push review checkpoints **further and further toward production** — but not eliminate them. Ondrej presses: as models get better, won't trivial changes auto-merge? Pocock's answer is the sharpest governance insight in the talk:

> "What do you gain from review? You gain the ability to **gate dangerous things** from production. But you also gain **insight into your own system, into the plumbing** — you watch the thing work and assess whether it did a good job. You don't want to lose that, because you want to improve your harness over time."

> "You could have an AI say 'you don't need to review that one.' But then **who reviews the AI that's doing that?** You probably do need to check some of the PRs the agent says are fine — to check if they actually are. **We're not just reviewing the code. We're also reviewing the system that produces the code.**"

On making review *seamless* (instead of removing it): AI-generated walkthrough videos on PRs (the agent records itself walking the diff + text-to-speech narration), custom HTML dashboards of "common bug patterns this week" instead of scrolling GitHub commits. "GitHub was created a long time ago — it's not optimized for the agentic era. Use AI to help you *review*, not just to write."

---

## Self-Improving Systems ("buy a lock")

When Fable spotted a security bug other models missed, Pocock's reframe of the lesson:

> "What have you actually learned? You've learned Fable is good, sure. But you've also learned **there are security issues in your code** — and you should probably have something that runs and checks for more in the future. If someone keeps stealing your bike, maybe buy a lock."

The cheap-and-durable move beats waiting for a smarter model:

> "You could run a **cron job that runs every single day and does a security review** — every day it checks a new part of the repo, with a relatively simple model, and you'd get decent results. We're lagging behind in our *practices* and expecting the model to pick up the slack... We write test suites, we do human reviews, we refactor — we should be **designing systems that are self-improving over time.**"

---

## AX vs DX

> "There's a difference between DX (developer experience) and **AX (agent experience)** — the experience the agent has working in the codebase. Better skills, a better model, a better harness, and **improving the codebase itself** all improve AX. People forget about improving the codebase for AX. There's huge overlap between good DX and good AX."

This is the bridge: a senior who builds good DX is most of the way to good AX. Hire the enthusiastic AI-believer junior, pair them with "a little bit of software fundamentals," and they thrive — "enthusiasm beats experience in pure output."

---

## Building a Business (nothing changed)

> "I don't think AI gives you any particular advantage there. What you need is the fundamental stuff: **go talk to customers, figure out what they need, build prototypes that solve their actual problem.** AI can't help with having the right idea... you should be choosing the features. You should be asking AI **what to *remove*** from your app — how to make it simpler — not 'what's the next big thing to add.'"

The thing AI is notoriously bad at: original out-of-the-box ideas and product vision. That stays human. (This rhymes exactly with the "research taste" gap in the Anthropic article cited in the loop research.)

---

## The One Action Step (his closing advice)

> "**Delete every single skill, every single plugin, every single MCP server. Delete your CLAUDE.md, delete your AGENTS.md. Go back to absolutely nothing, and then observe the agent** — see what it does. Everyone bloats their context window with too much stuff, too many instructions. Once you see what the agent does in basic mode, layer things back on top — and make sure they're **procedures, not abilities**, things you yourself decide."

---

## How this categorizes against the loop research

### Where they agree (the consensus across both digests)
- **Human stays at the strategic/direction layer; AI does the tactical.** (Theo: "prompt yourself out of the loop." Pocock: "keep the strategic mindset, delegate only the tactical.")
- **Parallel AFK autonomy is the multiplier.** (Theo's 4 stacked PRs overnight ↔ Pocock's "five of me" in sandboxes.)
- **Verification is the bottleneck and stays human.** (Anthropic: "human review has become the bottleneck" ↔ Pocock: "review the system that produces the code.")
- **Self-improving systems are the endgame.** (Addy's morning-triage loop / Anthropic recursive self-improvement ↔ Pocock's "buy a lock" cron.)
- **Skills/encoding are prerequisite to automation.** (Oscar: "you cannot safely automate a process you haven't encoded" ↔ Pocock's procedures.)
- **Token waste is real.** (Theo's 3M tokens / 8 hrs for 3 comments ↔ Pocock: "half of it is labs selling tokens.")

### Where Pocock pushes back (the tension worth keeping)
| Dimension | Loop research (Theo/Boris/Addy) | Pocock |
|---|---|---|
| **Mental model** | "I write loops now. The loop prompts the agent." | **"Queues, not loops."** A single loop completing all tasks doesn't match how teams work. |
| **Who controls structure** | Dynamic/emergent — "let Claude write the orchestration," structure emerges from the problem | **Human-driven procedures** — "I don't want to delegate my thinking to the model." |
| **Model vs harness** | Harness-heavy but model-forward (auto-mode, cloud, /goal) | **Strict 50/50; harness-first** because you control it and it's agent-agnostic |
| **Skills philosophy** | superpowers-style, model-in-control abilities | **Procedures over abilities**; hide descriptions from the model, keep knowledge in the human |
| **Framing of the hype** | Loops as the new unit of work / abstraction-ladder rung | Loops are "useful but not the whole picture"; half the hype is token-selling |

**The synthesis for a solo operator:** the truth is closer to Pocock's **queue + human-as-king** model with *selective* loops bolted on (the self-improving cron checks, the AFK task-runners), not Theo's "everything is an infinite loop." Use the loop research for the *patterns* (PR-monitor, evaluator-optimizer, orchestrator-workers); use Pocock for the *governing discipline* (queue mental model, push-checkpoints-right-not-to-zero, procedures over abilities, harness/AX over model).

---

## Extrapolated key concepts (the distilled list)

1. **Queues, not loops.** Model your AFK work as a task backlog many nodes pick from, not one infinite self-running loop. You stay the prioritizer.
2. **Harness > model, and the harness is the part you control.** Optimize prompts, skills, environment, and *codebase* — not the model-of-the-week.
3. **A better codebase = a cheaper model.** Architecture and guardrails are the real token-spend lever.
4. **Your skills are the ceiling.** AI is a multiplier on existing competence; upskill yourself, don't delegate your thinking.
5. **Procedures over abilities.** Stay in the driver's seat; every model-invoked ability taxes your context window.
6. **AFK is the unlock, not loops.** Parallelize *yourself* via sandboxed agents + CI triggers.
7. **Push human checkpoints toward prod, never to zero.** Review gates danger *and* gives you observability into your own system. Review the system, not just the code.
8. **Build self-improving systems with cheap recurring checks.** "Buy a lock" — a daily cron security/quality review beats waiting for a smarter model.
9. **AX (agent experience) is a first-class design target.** Big overlap with good DX; most people ignore it.
10. **Product vision and feature *subtraction* stay human.** AI can't pick what to build or what to cut.
11. **Blank-slate your setup periodically.** Strip skills/MCP/CLAUDE.md to zero, observe, then layer back only deliberate procedures.

---

## Application to Justin (AIOS / BrandOS / BGD)

- **The AIOS is already a queue, not a loop — and Pocock validates that design.** `archives/raw/` is the inbox, `/dispatch` triages, `todos/pending.md` is the backlog, skills pick work off it. The "[AIOS as dispatcher](../decisions/log.md)" vision (king-with-a-queue) is exactly Pocock's model. Lean into queue mechanics over "always-on loops" when designing the operator console.
- **AX for BrandOS is a direct cost play.** Improving the BrandOS codebase so a cheaper model can work in it lowers token spend — relevant given the deliberate `PORTAL_API` rename to keep Claude Code spawns on Max, not the API.
- **"Buy a lock" → Loop 2 from the loop research is the right first build.** A daily/cheap cron that security- and health-checks one slice of BrandOS per run, findings to `state/`. Self-improving, low token cost, demonstrates operational maturity to distributors.
- **Procedures over abilities maps onto the AIOS skill sprawl.** The AIOS loads many skill descriptions into context. Pocock's "delete everything, blank slate, layer back deliberate procedures" is worth a pass — audit which skills genuinely need to auto-load vs. be user-invoked only.
- **`grill-me` design rationale is now sourced.** Justin already runs a `grill-me` skill; this is the creator's reasoning for keeping it a short, human-invoked procedure.
- **Board follow-up (optional):** this is fresh primary-source Pocock material. Candidate for ingesting into `docs/wiki/advisors/matt-pocock/knowledge/` so the board's Pocock advisor reasons from his actual queue/harness/procedure positions, not just older content.

---

## Sources

1. **David Ondrej × Matt Pocock** — "Matt Pocock's Agentic Engineering Workflow (just copy him)" (YouTube, 2026-06-18) — https://www.youtube.com/watch?v=nQwJVHCtDDY
2. **Companion digest** — [research-loop-engineering-2026-06-19.md](research-loop-engineering-2026-06-19.md) (Theo Browne / Boris Cherny / Addy Osmani / Anthropic Institute)
3. **Geoffrey Huntley** — "Ralph" loop concept (2026-07-14, referenced in interview)
4. **John Ousterhout** — *A Philosophy of Software Design* (tactical vs strategic programming)
5. **Matt Pocock skills repo** — `github.com/mattpocock/skills` (`npx skills latest add mattpocock-skills`)
6. **Sand Castle** — Pocock's agent-sandboxing tool (referenced in interview)
