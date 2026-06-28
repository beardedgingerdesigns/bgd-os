# Loop Engineering: Stop Prompting Agents, Start Designing Loops

**Date:** 2026-06-19
**Starting point:** Theo Browne — "I guess we're writing loops now?" (YouTube, 2026-06-18)
**Key voices:** Boris Cherny (head of Claude Code), Pete Steinberger, Addy Osmani, Oscar Gallego Ruiz, Anthropic Institute
**Purpose:** Understand the concept deeply, then map it onto BrandOS development
**Companion / counterpoint:** [research-matt-pocock-agentic-workflow-2026-06-19.md](research-matt-pocock-agentic-workflow-2026-06-19.md) — Matt Pocock's "queues, not loops" reframe and the human-in-control / harness-over-model corrective to this maximalist loop case. Read both together.
**Deep synthesis (start here for the full picture):** [research-loop-engineering-synthesis-2026-06-20.md](research-loop-engineering-synthesis-2026-06-20.md) — the capstone over a 5-lens deep-research corpus (engineering, business/growth, design, governance, compounding) with the cross-lens use-case matrix and systematic changes for development + planning across all repos. Lens files in [loop-research-2026-06-20/](loop-research-2026-06-20/).

---

## The Core Concept

> "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents." — Pete Steinberger

> "I don't prompt Claude anymore. I have loops that are running. They're the ones prompting Claude and figuring out what to do. My job is to write loops." — Boris Cherny, head of Claude Code at Anthropic

The abstraction ladder of software development keeps climbing:

1. **Punch cards** -> Assembly -> C -> High-level languages -> Very-high-level languages
2. **Chatbots** — copy-paste from AI into your code
3. **Agent coding** — AI edits code directly in your IDE/terminal
4. **Sub-agents/workflows** — one agent orchestrates workers
5. **Loops** — systems that prompt agents, evaluate output, act on results, and repeat. You design the loop. The loop does the prompting.

**The shift:** Your unit of work moved from the keystroke, to the prompt, to the loop. You're not the one in the keystroke path anymore. You build the thing that does the prompting.

---

## What a "Loop" Actually Is

Strip the mystique. A loop is a harness that:

1. **Discovers** what work exists (new issues, PR comments, CI failures, feedback)
2. **Hands** a chunk to an agent
3. **Checks** what came back
4. **Decides** the next thing
5. **Repeats**

You're not writing the code. You're not even writing the prompts. You're writing the thing that writes the prompts.

### The Five Primitives (Addy Osmani's Framework)

Every loop needs these five pieces plus one memory layer:

| Primitive | Job in the Loop | Claude Code Equivalent |
|---|---|---|
| **Automations** | Discovery + triage on a schedule | `/loop`, `/goal`, scheduled tasks, cron, hooks, GitHub Actions |
| **Worktrees** | Isolate parallel work so agents don't collide | `git worktree`, `--worktree` flag, `isolation: worktree` on subagents |
| **Skills** | Codify project knowledge so agents stop guessing | `SKILL.md` files in `.claude/skills/` |
| **Plugins/Connectors** | Connect agents to your real tools (GitHub, Slack, Linear, etc.) | MCP servers and plugins |
| **Sub-agents** | Split maker from checker — one writes, another reviews | Agent teams, `.claude/agents/`, Workflow scripts |
| **Memory/State** | Track what's done, what failed, what's next | Markdown files, state files, Linear via MCP |

### Boris Cherny's Five Rules

1. **Auto mode for permissions** — the difference between an agent that runs overnight and one that's been waiting on a click since 2am
2. **Dynamic workflows** — stop writing prompts, describe the job, let Claude write the orchestration
3. **`/goal` or `/loop`** — forces Claude to actually finish. Without this, agents complete 60% and declare victory
4. **Claude Code in the cloud** — close your laptop, the work continues (Routines)
5. **End-to-end self-verification** — if Claude can't verify its output against a real environment, every overnight run is a gamble

---

## Key Patterns from the Sources

### Pattern 1: PR Comment Monitor Loop (Theo's breakthrough)

Theo's first real loop. The one that "gave him a taste":

1. Agent files a PR for a refactor
2. Code review tools (CodeRabbit, Reptile, Macroscope) leave comments
3. Instead of copy-pasting comments into the agent, tell the agent to **monitor the PR for comments**
4. Agent watches, addresses feedback, pushes fixes, triggers re-review
5. Runs for 6+ hours autonomously

**Key insight:** Break work into separate worktrees per PR so the monitoring agent doesn't block other work.

### Pattern 2: Multi-PR Stacked Workflow (Theo's "psychosis" moment)

The single message that changed everything for Theo:

> "Would it be possible to make a workflow that: (1) spins up a thread to make the PR, (2) spins up another thread to review that PR, (3) puts the first thread in a loop reviewing comments until it gets all approvals, (4) merges the PR and triggers another one for the next piece?"

Result: Set it running at 2:29 AM, woke up at 6:50 AM to four stacked PRs — all reviewed, all merged.

**The mind-bending part:** The loop created sub-loops dynamically. Not a hardcoded "every change gets one reviewer." A dynamic workflow tailored to the specific problem.

### Pattern 3: The Evaluator-Optimizer Loop (Anthropic's pattern)

From Anthropic's "Building Effective Agents":

- One LLM generates a response
- Another LLM evaluates and gives feedback
- Loop until quality gate passes

Best when: you have clear evaluation criteria and iterative refinement provides measurable value.

### Pattern 4: The Orchestrator-Workers Pattern (Anthropic)

- Central LLM dynamically breaks down tasks
- Delegates to worker LLMs
- Synthesizes results
- Key difference from parallelization: subtasks aren't pre-defined, they're determined by the orchestrator based on the specific input

### Pattern 5: The Morning Triage Loop (Addy Osmani)

An automation runs every morning:
1. Reads yesterday's CI failures, open issues, recent commits
2. Writes findings into a markdown file
3. For each finding worth doing, opens an isolated worktree
4. Sends a sub-agent to draft the fix
5. A second sub-agent reviews against project skills and tests
6. Connectors open the PR and update the ticket
7. Anything the loop can't handle lands in a triage inbox for the human

### Pattern 6: The Goal Loop (`/goal`)

Keep going until a verifiable condition is true. A separate small model checks whether you're done (maker/checker split on the stop condition itself).

Example: "All tests in test/auth pass and lint is clean" — then walk away.

---

## What Loops Do NOT Do

### The Honest Asterisks

1. **80% of loop output is bad.** Boris Cherny himself: "Most ideas are bad, but maybe 20% are good." Your edge is the speed and quality of your "no."

2. **Verification is still on you.** A loop running unattended is also a loop making mistakes unattended. The maker/checker split helps, but "done" is a claim, not a proof.

3. **Comprehension debt compounds.** The faster the loop ships code you didn't write, the bigger the gap between what exists and what you actually understand. You have to read what the loop made.

4. **Cognitive surrender is the trap.** When the loop runs itself, it's tempting to stop having an opinion and just take whatever it gives back. "Designing the loop is the cure when you do it with judgment, and the accelerant when you do it to avoid thinking. Same action, opposite result." — Addy Osmani

5. **Token costs can be brutal.** Theo's example: one agent spent under 10 minutes leaving feedback, and the Opus workflow ran for 8 hours and did 3M+ tokens to address three small comments. Loops amplify waste on wrong paths.

6. **Pre-defined personas are overrated.** Theo argues that hardcoding "this is the adversarial reviewer, this is the security reviewer" misses the point. The agent should dynamically build the context it needs. The structure should emerge from the problem, not be imposed on it.

---

## The Meta-Insight: The Shape of Work Becomes Dynamic

> "The shape of the loop, the shape of the structure, the shape of how work happens can be dynamically generated based on the shape of the work that you're doing." — Theo

Traditional agile forces work into a static shape (sprints, standups, retrospectives). Loops let the shape of the process match the shape of the problem. Multi-stage problems get multi-stage loops. Simple fixes get simple loops. The agent decides.

---

## Application to BrandOS

### Where Justin Already Has Loop-Like Patterns

Justin's AIOS already has many of the primitives:
- **Skills** — GSD skills, wiki skills, dispatch, brainstorming
- **Sub-agents** — GSD executor uses sub-agents, workflows fan out
- **Memory/State** — `state/` files, `decisions/log.md`, wiki system
- **Triage** — `/daily-inbox-triage`, `/scheduled-triage`, `/dispatch`
- **Connectors** — Gmail MCP, Google Calendar MCP, Google Drive MCP

What's missing: **the actual closed loops** — the part where the agent's output feeds back into the next agent's input automatically, without Justin in the middle.

### BrandOS-Specific Loop Opportunities

#### Loop 1: PR Review & Fix Loop
**What:** When a BrandOS PR is filed, an agent monitors for code review comments, addresses them, pushes fixes, and re-requests review. No copy-pasting feedback.
**Why:** Justin is the sole developer on BrandOS. Every PR review cycle he does manually is time he can't spend on dealer onboarding or sales.
**How:** Claude Code `/loop` watching the PR via `gh` CLI. Worktree isolation so the loop doesn't block other BrandOS work.

#### Loop 2: Dealer Site Health Monitor
**What:** A scheduled loop that checks each dealer's BrandOS site for broken links, outdated content, performance regressions, SSL issues, and reports findings.
**Why:** With 6 dealers and growing, manual health checks don't scale. Dealers notice broken things before Justin does — bad look.
**How:** Cron-based Claude Code routine. Scrapes each dealer URL, runs Lighthouse, checks DNS, compares against baseline. Findings → `state/brandos-dealer-health.md` or a GitHub issue.

#### Loop 3: Feature Development Pipeline
**What:** For multi-phase BrandOS features (like the marketing material builder), a loop that: (1) plans the work, (2) breaks into PRs, (3) implements each PR in a worktree, (4) reviews, (5) merges, (6) starts the next one.
**Why:** This is Theo's "stacked PR" pattern. BrandOS phases often have 3-5 dependent PRs. Justin currently shepherds each one manually.
**How:** GSD plan → Workflow script that pipelines through implement → review → merge → next. The loop creates sub-loops per PR.

#### Loop 4: Test Suite Expansion Loop
**What:** A loop that reads the BrandOS codebase, finds untested code paths, writes tests, runs them, and iterates until coverage targets are met.
**Why:** BrandOS needs test coverage to support confident dealer migrations and the growing feature set. Writing tests manually is the first thing that gets cut when client work presses.
**How:** `/goal` with condition: "Coverage exceeds 80% on all portal API routes and all tests pass."

#### Loop 5: Documentation Sync Loop
**What:** A loop that watches for code changes in BrandOS, detects when documentation is out of date, and either updates it or flags it.
**Why:** BrandOS wiki + ADRs drift from reality as features ship. Stale docs cause confusion when Justin picks up work after a break.
**How:** Scheduled routine that diffs code changes against wiki content, flags stale sections, drafts updates to wiki `raw/aios/` for ingestion.

#### Loop 6: Dealer Onboarding Automation
**What:** When a new dealer is added to BrandOS, a loop that: sets up their subdomain, provisions their config, runs smoke tests, generates a welcome email draft, and verifies everything works.
**Why:** Each dealer onboarding currently involves 10+ manual steps. As BrandOS scales to more distributors bringing more dealers, this has to be automatic.
**How:** Triggered by a new entry in the dealer config. Loop runs through provisioning checklist, each step verified before proceeding.

### The Key Architectural Insight for BrandOS

BrandOS is a multi-tier platform. The loop engineering concept maps perfectly onto its architecture:

- **Distributor tier:** Loops that monitor distributor-level health, aggregate dealer metrics, generate reports
- **Dealer tier:** Loops that handle dealer-specific maintenance, content updates, migration verification
- **Platform tier:** Loops that handle cross-cutting concerns (security patches, dependency updates, feature rollouts)

Each tier can have its own loop cadence. Platform loops run daily. Dealer loops run on triggers. Distributor loops run weekly.

### What to Build First

Following Addy Osmani's advice — start with the smallest useful loop:

1. **First:** PR Comment Monitor (Loop 1) — immediate payoff, low risk, teaches the pattern
2. **Second:** Dealer Site Health Monitor (Loop 2) — demonstrates BrandOS operational maturity to distributors
3. **Third:** Feature Development Pipeline (Loop 3) — the big multiplier for shipping speed

---

## Key Quotes Worth Keeping

> "Try to find where you have to be involved and see what it takes to prompt yourself out of it." — Theo

> "We are looking at the code too early. If you are reading the code your agent put out before another agent read it and gave feedback on it, you're wasting your own time." — Theo

> "A loop doesn't make an agent smart. It makes it frequent. If the agents inside your loop don't follow a real pipeline, then a loop just generates garbage faster." — Oscar Gallego Ruiz

> "You cannot safely automate the invocation of a process you haven't encoded." — Oscar Gallego Ruiz (on why Skills are prerequisite to Loops)

> "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go." — Addy Osmani

> "Two people can build the exact same loop and get completely opposite results. One uses it to move faster on work they understand deeply. The other uses it to avoid understanding the work at all. The loop doesn't know the difference. You do." — Addy Osmani

---

---

## The Macro Case: Anthropic's "When AI Builds Itself"

Source: https://www.anthropic.com/institute/recursive-self-improvement

This is the article Theo referenced in his video. It's the macro-level case for WHY loop engineering matters — written by the Anthropic Institute with internal data no one else has.

### The Progression (Anthropic's Own Timeline)

| Era | How work happened |
|---|---|
| 2021-2023 | People writing code on laptops. Traditional software development. |
| 2023-2025 | Chatbots help — generate short snippets, copy output into editors |
| 2025-2026 | Coding agents write and edit code on their own, sometimes entire files |
| Today (mid-2026) | Agents run code themselves and delegate hours of work to other agents |
| Future (20XX?) | Agents build and train models themselves. Claude improved by Claude. |

This is the same ladder Boris Cherny and Theo described, but from inside the company building the models.

### Hard Numbers from Inside Anthropic

These are not projections. This is internal data:

- **80%+ of Anthropic's merged production code** is authored by Claude (as of May 2026). Before Claude Code launched in Feb 2025, it was in the low single digits.
- **Engineers ship 8x as much code per quarter** as they did from 2021-2025. The slope steepened twice — once when Claude started running code (not just suggesting it), and again when models started working autonomously over longer time horizons.
- **Claude's success rate on open-ended tasks:** 76% in May 2026, up 50 percentage points in six months. These are problems with no clear specification where the engineer isn't sure what the answer looks like.
- **Claude shipped 800+ fixes in April 2026** that reduced a class of API errors by 1000x. The engineer estimated a human would have taken four years.
- **Training code optimization:** Claude went from ~3x speedup over starting code (May 2025) to ~52x (April 2026). A skilled human needs 4-8 hours to reach 4x.
- **Automated code review** catches roughly a third of bugs that caused past incidents on claude.ai — bugs that some of the best engineers in the world missed.
- **4% of all public GitHub commits** are now Claude Code, projected to cross 20% by end of 2026.
- **GitHub went from ~1B commits in all of 2025 to 275M per week by mid-2026** (14B/year pace), straining infrastructure.

### The Bottleneck Shift — Why Loops Are the Answer

The most important insight for loop engineering:

> "The doing (writing the code, running the experiment, producing the result) now costs almost nothing in human time. Human review has become the bottleneck."

This is Amdahl's Law applied to AI-assisted development: speeding up one part of a process just shifts the bottleneck elsewhere. Anthropic has already hit this — they push so much code that human code review became the constraint.

**This is exactly what loops solve.** The maker/checker split in a loop (one agent writes, another reviews) is how you push past the human review bottleneck. You're not removing yourself from the process — you're moving yourself to the part that actually needs you: direction-setting and judgment.

The article describes three tiers of engineer capability:
1. **Execute a task someone else specified** — "The export button isn't working, please fix it." (Claude already excels here)
2. **Handed a goal, design the approach** — "Investigate why the network slows down under heavy load." (Claude is getting good at this)
3. **Decide which problems are worth working on** — "What should the team build next quarter?" (Still mostly human)

**Loop engineering lives at the boundary between tiers 2 and 3.** You set direction (tier 3). The loop handles tiers 1 and 2 — including deciding HOW to break down the work and which sub-tasks to create.

### The "Research Taste" Gap

The article's most honest section: Claude is getting better at proposing experiments and steering research sessions, but a meaningful gap persists in judgment — choosing which problems matter, which results to trust, and when an approach is a dead end.

Key data point: When shown real research sessions where the human took a wrong turn, Claude picked a better next step 64% of the time (up from 51% six months earlier). The gap is closing but not closed.

**For Justin's context:** This maps directly to the AIOS. Justin's judgment about which BrandOS features to build, which dealers to prioritize, which opportunities are real vs. noise — that's the "research taste" that stays human. The loops handle everything downstream of that decision.

### Three Possible Futures

1. **Trend stalls, current capabilities diffuse widely** — 100-person companies do the work of 1,000-person ones. Even frozen at today's level, this changes everything.
2. **Compounding efficiency gains continue** — 100-person companies do the work of 10,000-100,000. Human role narrows to direction + verification. (Anthropic thinks we're heading here.)
3. **Full recursive self-improvement** — AI systems design their own successors. The pace of progress becomes limited only by compute, not human involvement.

### What This Means for a Solo Operator Like Justin

The article's framing is about Anthropic (a 1,000+ person AI lab), but the implications for a solo operator are even more dramatic:

**A solo operator with well-designed loops is a 100-person company.** Not metaphorically. The math:
- If "the doing costs almost nothing in human time"
- And loops handle the first-pass review cycle
- And the human focuses on direction + judgment + verification
- Then the ceiling is how many loops you can meaningfully oversee, not how many hours you can code

**BrandOS is already a multi-tier platform built by one person.** Loop engineering is how it stays that way as it scales to more distributors and dealers — not by Justin working more hours, but by designing loops that handle the expanding surface area while Justin stays at tier 3 (deciding what to build).

The Anthropic employee quote that hits hardest for the solo operator context:

> "On days where everything works well, I can't help but think nothing I do matters, everything is automated and better and faster than I ever will be. But then there are days where everything breaks and I don't understand what I've been up to anymore."

That's comprehension debt. It's the risk. The antidote is the same as Addy Osmani said: build the loop, but stay the engineer. Read what the loop produces. Understand your own codebase. The loop is leverage, not replacement.

---

## Sources

1. **Theo Browne** — "I guess we're writing loops now?" (YouTube, 2026-06-18) — https://www.youtube.com/watch?v=iJVJwmCKW9o
2. **Addy Osmani** — "Loop Engineering" (Blog, 2026-06-07) — https://addyosmani.com/blog/loop-engineering/
3. **Boris Cherny** — Acquired Unplugged remarks + Fortune Brainstorm Tech (2026-06)
4. **Oscar Gallego Ruiz** — "Stop Prompting Your Agent. Start Writing Loops." (Medium, 2026-06-08)
5. **Anthropic** — "Building Effective Agents" (2024-12-19) — https://www.anthropic.com/research/building-effective-agents
6. **Product Market Fit newsletter** — "How Claude Code's Creator Runs 1000+ Agents" (2026-06-11)
7. **Anthropic Institute** — "When AI Builds Itself" (Recursive Self-Improvement) — https://www.anthropic.com/institute/recursive-self-improvement
