---
source: github-readme + youtube-transcript + every.to-article (screenshot OCR)
title: Compound Engineering — How Every Codes With Agents
urls:
  - https://github.com/EveryInc/compound-engineering-plugin (canonical repo, 21.5K stars)
  - https://github.com/mvanhorn/compound-engineering-plugin (Matt Van Horn's fork)
  - https://www.youtube.com/watch?v=BxEf3RqIHkw (Peter Yang interview with Matt Van Horn, 50 min)
  - https://creatoreconomy.so/p/the-ai-agent-system-behind-this-non-technical-founder-matt-van-horn (Substack companion, paywalled)
  - https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents (authoritative article by Dan Shipper + Kieran Klaassen)
published: 2025-12-11 (article), 2026-06-14 (video)
captured: 2026-06-16
status: digested, integration planning in progress
scope: personal knowledge + operational integration
related:
  - brainstorm/research-nate-herk-6-ai-skills-2026-06-15.md
  - brainstorm/research-zack-proser-attention-stack-2026-06-12.md
  - references/3ms-framework.md
  - docs/wiki/concepts/aios-second-brain-principles.md
---

# Digest — Compound Engineering: How Every Codes With Agents

Three sources synthesized: the GitHub plugin README (EveryInc, canonical), Matt Van Horn's 50-min interview with Peter Yang, and the authoritative Every.to article by Dan Shipper (CEO) and Kieran Klaassen (GM of Cora).

## Core thesis

**Each unit of engineering work should make subsequent units easier, not harder.** Traditional dev accumulates tech debt — every feature adds complexity, every bug fix leaves behind local knowledge someone has to rediscover. Compound engineering inverts this: 80% planning + review, 20% execution. Learnings get codified so the next agent doesn't start from scratch.

Every runs five software products in-house, each primarily built and run by a single person. Used by thousands daily. "If your AI is used right, a single developer can do the work of five developers."

## The four-step loop

### 1. Plan
A good plan starts with **research**. The agent looks through the codebase + commit history to understand structure, existing best practices, how it was built. Also scours the internet for best practices. Then writes a plan (file or GitHub issue) covering: objective, proposed architecture, code ideas, research sources, success criteria. "Planning helps build a shared mental model between you and the agent for exactly what you're building, before you build it. Good planning is not pure delegation — it requires the developer to think hard and be creative."

### 2. Work
Tell the agent to start. It takes the plan, turns it into a to-do list, builds step-by-step. Key trick: use a **model context protocol like Playwright or XcodeBuildMCP** so the agent can interact with the app as if it were a user — write code, walk through the app, notice issues, modify and repeat until it looks like the design.

### 3. Assess
Review the work seriously. Traditional tools (linters, unit tests, manual testing) plus **automatic code review agents**. The CE plugin runs code review in parallel with **12 subagents** each checking a different perspective: security, performance, overbuilding, common issues. Results synthesized for the developer to decide what to fix.

### 4. Compound
**The money step.** Take what was learned in any previous step — bugs, potential performance issues, new ways of solving problems — and record them so the agent can use them next time. Before building anything new, the agent asks: Where does this belong? Should it be added to something existing? Have we solved a similar problem we can reuse? These questions come with **specific technical examples from past mistakes** that prime the agent to find the right solution.

The rules become prompts in the codebase or plugin. **Every developer on the team inherits them automatically.** "A new hire who's never been in the codebase before is as well-armed to avoid common mistakes as someone who's been on the team for a long time."

## The plugin (37 skills, 51 agents)

| Skill | Purpose |
|---|---|
| `/ce-strategy` | Upstream anchor: target problem, persona, metrics → `STRATEGY.md`. Ideate/brainstorm/plan read it as grounding. |
| `/ce-ideate` | Optional big-picture ideation: generate + critique ideas, route winner into brainstorming. |
| `/ce-brainstorm` | Interactive Q&A → right-sized requirements doc before planning. |
| `/ce-plan` | Requirements → detailed implementation plan. Researches codebase, edge cases, patterns. |
| `/ce-work` | Execute plan using git worktrees + task tracking. |
| `/ce-debug` | Reproduce failures, trace root cause, implement fixes. |
| `/ce-code-review` | Multi-agent (12 subagent) code review before merging. |
| `/ce-compound` | Document learnings to make future work easier. |
| `/ce-product-pulse` | Time-windowed usage/performance/error report → `docs/pulse-reports/`. |
| `/lfg` | Full loop: plan → implement → review → PR. |

## Matt Van Horn's angle (the video)

Non-technical founder (no CS degree, doesn't read code). Shipped last30days (#1 trending GitHub, 44K stars) and Printing Press (printingpress.dev — generates CLIs for any website by sniffing hidden APIs). His key points:

- **CE plan + CE work is the killer feature.** "If I ever have an idea, I give it to /ce-plan. Then /ce-work executes it. I somehow ship things of value."
- **Printing Press:** "What if anyone could print their own CLI about anything?" Finds hidden APIs via network sniffing, generates a CLI so agents can interact with any site.
- **CLI + skill beats MCP** for agent workflows: simpler, more portable, less fragile.
- **He contributes to repos in languages he doesn't know** (Python, Go) — the agent reads the code, writes the contribution, he reviews the intent.
- **Fear of shipping persists even after viral success.** Two finished projects he's afraid to launch. "What if they're not a hit?"

## How it maps to my existing system

| Compound Engineering | My equivalent | Gap? |
|---|---|---|
| `/ce-strategy` → `STRATEGY.md` | `context/priorities.md` + `/brief` | No — different scope but same function |
| `/ce-brainstorm` → requirements doc | `/gsd-discuss-phase` → SPEC | No — similar |
| `/ce-plan` → implementation plan | `/gsd-plan-phase` → PLAN.md | No — similar |
| `/ce-work` → worktree execution | `/gsd-execute-phase` (waves) | No — similar |
| `/ce-code-review` → 12-subagent review | `/gsd-code-review` + `/codex-review` | Different approach (12 parallel perspectives vs 2-model adversarial) |
| `/ce-compound` → document learnings | `/wiki log` + `/retro` + `/level-up` | **YES — timing gap.** Mine compounds weekly/session; theirs compounds per-feature. |
| `/ce-product-pulse` → usage reports | Nothing | **YES — no equivalent yet.** |
| `/lfg` → full loop shortcut | `/gsd-autonomous` | No — similar |

## Key insights for my operating model

1. **The compound step should happen per-feature, not just per-session/week.** Every's model: after every shipped feature, the agent asks "what did we learn?" and writes it as a reusable rule into the codebase. My `/retro` catches this weekly and `/wrap` catches it per-session, but neither asks the pointed question: "what should CLAUDE.md or the wiki know now that it didn't before this feature?"

2. **Compound notes are automatically distributed.** Because they live in the codebase (CLAUDE.md, plugin rules), every team member's agent inherits them. For a solo operator like me, this means project CLAUDE.md files should be the primary compound target — every future session starts smarter.

3. **12-subagent parallel review vs my 2-model adversarial loop.** Different strategy, same goal. Worth considering whether perspective-diverse single-model review catches things my Claude+Codex loop misses.

4. **Playwright/XcodeBuildMCP for visual iteration.** Their work step has agents *using* the app, not just writing code. I don't do this systematically — Playwright is available but not wired into the GSD execute flow.

5. **One person per product is the proof.** Five products, each run by one person. This validates the BGD model (one operator + AI shipping what used to take a team).

6. **A commenter nailed it: "This is essentially the Deming Cycle (PDCA)."** Plan-Do-Check-Act, with the compound step as the mechanism that makes each cycle better than the last.

## Open questions for integration

- Should I install the CE plugin alongside GSD, or does it conflict/duplicate?
- Is the compound step something to add to GSD's post-execution flow, or is CE's version better left as a standalone practice?
- `/ce-product-pulse` fills a real gap — but only matters once BrandOS has real users. Park it?
- Matt's `/lfg` (plan → implement → review → PR in one shot) — is that useful for quick tasks, or does it skip too many of my stage gates?
