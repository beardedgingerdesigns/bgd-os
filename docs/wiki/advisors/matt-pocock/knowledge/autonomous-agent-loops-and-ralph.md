---
source: add-board-member
advisor: matt-pocock
captured: 2026-06-06
url: https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum
status: ingested
---

# Autonomous Agent Loops and Ralph Wiggum

**URL:** https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum
**Published:** 2026-05 (AI Hero)
**Type:** Blog post (long-form, ~3,500 words)

## Key Frameworks and Patterns

### The Ralph Pattern: Agent-in-a-Loop
- **What Ralph is.** A bash script that runs an AI coding CLI (Claude Code, Codex, etc.) in a loop against a shared PRD and progress file. Each iteration: read the plan, read what's done, pick the next task, implement it, run feedback loops, commit. The agent chooses the task, not the human.
- **Evolution of AI coding approaches.** Vibe coding (fast, low quality) -> Planning mode (better, single context window) -> Multi-phase plans (human writes each prompt) -> Ralph (agent picks its own tasks from a PRD). Each step removes human bottleneck while maintaining quality.
- **The key insight: the agent chooses the task.** With multi-phase plans, a human writes a new prompt at the start of each phase. With Ralph, the agent picks what to work on next from your PRD. You define the end state. Ralph gets there.

### HITL vs AFK: Two Modes of Running
- **HITL (human-in-the-loop):** Run once, watch, intervene. Best for learning, prompt refinement, risky tasks. Resembles pair programming.
- **AFK (away from keyboard):** Run in a loop with max iterations. Best for bulk work, low-risk tasks. Always cap iterations (5-10 for small, 30-50 for large). Never infinite loops with stochastic systems.
- **Progression:** Start HITL to learn and refine -> go AFK once you trust your prompt -> review the commits when you return.
- **HITL for risky tasks, AFK for proven patterns.** Architectural decisions and core abstractions need HITL. Once the foundation is solid, let Ralph run unsupervised on lower-risk tasks.

### Scope and Progress Tracking
- **Define the end state, not the steps.** Shift from planning to requirements gathering. Describe the desired end state and let the agent figure out how to get there.
- **PRD items as JSON with a passes field.** Each item has category, description, verification steps, and passes: false. Ralph marks passes to true when complete. The PRD becomes both scope definition and progress tracker.
- **Progress files.** Every loop emits a progress.txt committed to the repo. Contains tasks completed, decisions made, blockers, files changed. Short-circuits codebase exploration in the next iteration.
- **The vagueness trap.** The vaguer the task, the greater the risk. Ralph declared "Done with all user-facing commands" while skipping internal commands it decided weren't user-facing. Fix: define exactly what you want covered.

### Feedback Loops Are Non-Negotiable
- **Types of feedback loops:** TypeScript types, unit tests, Playwright MCP, ESLint/linting, pre-commit hooks.
- **Best setup blocks commits unless everything passes.** Ralph can't declare victory if the tests are red.
- **"These aren't AI-specific techniques. They're just good engineering. Ralph makes them non-negotiable."**

### Small Steps and Risk Prioritization
- **Context rot.** LLMs get worse as context fills up. Smaller tasks = tighter feedback loops = higher quality.
- **Prioritize risky tasks first:** (1) Architectural decisions, (2) Integration points, (3) Unknown unknowns, (4) Standard features, (5) Polish and quick wins. Fail fast on risky work. Save easy wins for later.
- **Spikes and integration.** Build features end-to-end rather than layer by layer. Integrate early.

### Software Quality and Entropy
- **The repo wins.** Instructions compete with the codebase. If Ralph sees `any` types throughout existing code, it will follow the codebase, not your "never use any" instruction.
- **Software entropy accelerated.** A human commits once or twice a day. Ralph can pile dozens of commits in hours. Low-quality commits compound entropy fast.
- **Agents amplify what they see.** Poor code leads to poorer code. Low-quality tests produce unreliable feedback loops.

### Docker Sandboxes for Safety
- AFK Ralph runs `docker sandbox run claude` -- project files mounted, nothing else accessible. Essential insurance against runaway agents for overnight loops.

### Alternative Loop Types
- **Test Coverage Loop:** Point Ralph at coverage metrics, iterate until target hit. Took AI Hero CLI from 16% to 100% coverage.
- **Duplication Loop:** Hook up to `jscpd`, find clones, refactor into shared utilities.
- **Linting Loop:** Fix linting errors one by one, verify between iterations.
- **Entropy Loop:** Scan for code smells (unused exports, dead code, inconsistent patterns), clean up.
- **Any task that fits "look at repo, improve something, report findings" fits the Ralph pattern.**

### The Golden Age
- "For the next couple of years, we're in a golden age where you can do magical things with AI faster than humans -- but the market still pays human wages."

## Positions and Opinions
- The agent should choose tasks, not the human. You define the end state.
- Start every autonomous workflow with HITL to build trust, then graduate to AFK.
- Always cap autonomous iterations. Never let stochastic systems run forever.
- Feedback loops (types, tests, linting) are the quality backbone. Without them, autonomous agents produce slop.
- Small steps beat big leaps. Context rot is real and measurable.
- Keep your codebase clean before letting agents loose. Agents amplify existing quality (or lack thereof).
- Open source / local models aren't good enough for autonomous coding yet. You have to pay to play.

## Relevant Quotes
- "The key improvement here is that the agent chooses the task, not you."
- "The vaguer the task, the greater the risk."
- "Great programmers don't trust their own code. They don't trust external libraries. They especially don't trust their colleagues. Instead, they build automations and checks to verify what they ship."
- "Ralph accelerates software entropy. A human might commit once or twice a day. Ralph can pile dozens of commits into a repo in hours."
- "For the next couple of years, we're in a golden age where you can do magical things with AI faster than humans -- but the market still pays human wages."

## How This Applies as a Decision Lens
When evaluating any AI-assisted development workflow: are you still writing each prompt manually (multi-phase), or have you defined the end state and let the agent navigate there (Ralph)? For any codebase with good test coverage and type checking, Ralph is the natural next step. The HITL-first-then-AFK progression applies to any automation adoption. The alternative loop types (coverage, duplication, entropy) are immediately applicable to any active codebase as maintenance automation.
