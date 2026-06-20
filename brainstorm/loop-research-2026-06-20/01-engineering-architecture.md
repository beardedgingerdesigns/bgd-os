# Loop Engineering — Engineering Architecture Lens

**Date:** 2026-06-20
**Researcher role:** Engineering Architect
**Context:** One of five parallel research agents. Covers the mechanical primitives of a well-formed loop as a software construct — not the business or product rationale, but the exact wiring, failure modes, and economics.
**Background docs consumed:**
- `brainstorm/research-loop-engineering-2026-06-19.md`
- `brainstorm/research-matt-pocock-agentic-workflow-2026-06-19.md`

---

## (a) The Engineering Architect Lens

A loop is not a vibe. It is a control structure with a well-defined state machine: discover → enqueue → execute → verify → decide → repeat or halt. Every well-formed loop has a maker (produces work), a checker (evaluates it), an explicit stop condition, an idempotent state store, and a cost budget. The failure modes of loops are deterministic: missing stop conditions produce runaway burns, missing idempotency keys produce duplicate side effects, missing verification gates produce garbage compounding faster than a human can catch it. This lens treats loops as a software primitive that must be designed with the same rigor as a database schema or an API contract — not a clever prompt trick.

---

## (b) Core Concepts and Patterns

### 1. Workflow vs. Agent (Anthropic's Foundational Distinction)
**Source:** https://www.anthropic.com/engineering/building-effective-agents

- **Workflow:** LLM calls orchestrated through predefined code paths. Predictable, auditable, lower cost per run.
- **Agent:** LLM dynamically directs its own process and tool usage at runtime. Flexible, but higher cost and error surface.

**When to use:** Default to workflows. Promote to agents only when the subtask structure cannot be predicted before execution (e.g., the number of files to edit depends on what the codebase actually contains). Justin's GSD phases map cleanly to workflows; BrandOS's dynamic dealer migration logic is the agent candidate.

---

### 2. The Five Canonical Workflow Patterns
**Source:** https://www.anthropic.com/engineering/building-effective-agents

| Pattern | What it is | When to use |
|---|---|---|
| **Prompt chaining** | Sequential LLM calls, each processing prior output | Fixed subtask sequence; trade latency for accuracy |
| **Routing** | Classify input, dispatch to specialized handler | Distinct input categories with different optimal prompts |
| **Parallelization / fan-out** | Independent subtasks run concurrently, outputs aggregated | Subtasks don't depend on each other; speed or diversity needed |
| **Orchestrator-workers** | Central LLM breaks task into subtasks dynamically, delegates to workers | Subtask count and shape unknowable pre-execution |
| **Evaluator-optimizer** | Generator produces, evaluator critiques, loop until pass | Clear quality rubric exists; iterative refinement measurably improves output |

The key engineering discipline: **start with the simplest pattern that works.** Orchestrator-workers looks appealing but carries the highest debugging surface. Prompt chaining for a three-step process is almost always the right choice first.

---

### 3. Maker/Checker Split
**Sources:** https://www.anthropic.com/engineering/building-effective-agents; https://www.agentpatternscatalog.org/patterns/evaluator-optimizer/

The maker/checker split is the single most reliable quality gate in loop engineering. The maker (generator) and checker (evaluator) must be **separate calls** — ideally separate model instances or at minimum separate prompts with different system contexts. When the same prompt both generates and evaluates, it collapses into self-approval: the model has no incentive to disagree with itself, adding cost with no quality gain.

**Implementation rule:** the checker must have explicit rubrics (test results, lint output, a scoring prompt) — not a vague instruction to "review." A checker with no defined pass condition produces noise, not signal.

---

### 4. Stop Conditions and Convergence
**Sources:** https://tianpan.co/blog/2026-05-07-tool-call-convergence-agents-stopping-criteria; https://www.agentpatternscatalog.org/patterns/step-budget/; https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentcost01-bp01.html

Three convergence mechanisms, in order of preference:

1. **Deterministic exit:** a test suite passes, a lint check is clean, a specific file exists. Best signal — zero ambiguity.
2. **Confidence threshold:** the evaluator emits a score; the loop exits when score ≥ N. Requires a calibrated evaluator.
3. **Step budget / iteration cap:** `max_steps=N` enforced at the orchestration layer, not in the system prompt. **Critical:** caps in the prompt can be overridden by the model under adversarial inputs or confused states. Caps in code cannot.

**No-progress detection:** if the agent calls the same tool with semantically identical arguments twice in a row, it's stuck. First occurrence: inject a self-correction prompt. Second occurrence: hard stop. This catches the failure mode responsible for the most expensive loop overruns.

**Layered termination (production pattern):** combine all three — deterministic exit OR confidence threshold OR step budget (whichever fires first). Use AND to require multiple conditions simultaneously when the stakes are high.

---

### 5. Idempotency and Deduplication
**Sources:** https://hld.handbook.academy/curriculum/distributed-systems-theory/idempotency-exactly-once/; https://backendbytes.com/articles/idempotency-patterns-distributed-systems/

**Exactly-once delivery is mathematically impossible at the transport layer.** The correct design is at-least-once delivery + idempotent processing = "effectively exactly-once." Every loop that writes state (commits, posts, emails, DB rows) must be idempotent.

Implementation patterns:
- **Idempotency key + DB transaction:** client sends a UUID per operation; server stores key + result in one transaction; retries return stored result without reprocessing.
- **Natural business key dedup:** use the domain identifier (PR number, thread ID, issue ID), not infrastructure offsets. Business keys survive process restarts; Kafka offsets don't.
- **Processed-message table:** consumer records each processed ID; `ON CONFLICT DO NOTHING` makes re-ingestion harmless.

For Justin's AIOS loops: every `/dispatch` run and every cron-triggered health check must be idempotent. The item identifier (e.g., Gmail thread ID, GitHub issue number) is the natural key. Re-running `/dispatch` on the same drop must produce the same routing decision, not a duplicate `todos/pending.md` entry.

---

### 6. Queue vs. Loop as a Design Choice
**Source:** Research-matt-pocock-agentic-workflow-2026-06-19.md; https://github.com/lSAAGl/loop-harness

**Loop framing:** one persistent process that cycles on a schedule, picking up work. Risk: token burn when there's nothing to do; harder to parallelize; single point of failure.

**Queue framing:** many sources add tasks to a backlog; many agent-nodes pick tasks off it; work resolves on completion. Naturally parallelizable, naturally idempotent (a task either gets picked up or it doesn't), naturally monitored (queue depth is an observable).

**Architectural rule:** use a queue when work items are independent (each inbox item, each PR, each dealer health check). Use a loop when work items have ordered dependencies (plan → implement → verify must happen in sequence). Most of Justin's AIOS use cases are queues masquerading as loops.

**The loop-harness pattern** (https://github.com/lSAAGl/loop-harness) solves the worktree isolation problem: each run gets a fresh `git worktree` on a `loop/<name>/<timestamp>` branch. The primary agent stages outputs (commits, PR body, outbox files). A verifier agent inspects and must emit `VERDICT: PASS`. Only then does the orchestrator push/post. This is the correct architecture for write-capable loops — the primary agent literally cannot publish without the verifier.

---

### 7. CI-Triggered Loops (GitHub Actions as Loop Infrastructure)
**Sources:** https://github.github.com/gh-aw/; https://github.com/open-gitagent/gitcron; IT-Journey multi-agent orchestration

GitHub Actions gives Justin a free, scalable loop harness with zero infrastructure overhead:

- **`on: schedule` (cron):** recurring loops (nightly health checks, weekly audits)
- **`on: pull_request`:** trigger on PR open/update (code review loop, type-check loop)
- **`on: issue_comment` / `on: label`:** event-driven task dispatch (a label `agent-implement` kicks off a worker)
- **`workflow_run`:** chain workflows — output of research-agent feeds planning-agent

**Fan-out via matrix strategy:** the orchestrator emits a JSON list of subtasks; Actions uses `strategy: matrix: subtask: ${{ fromJSON(outputs.subtasks) }}` to spawn one job per subtask in parallel. Each job is a worker. This is direct GitHub Actions implementation of the orchestrator-workers pattern with zero additional infrastructure.

**gitcron** (`github.com/open-gitagent/gitcron`) compiles a `cron.yaml` to GitHub Actions workflows — cron scheduling for agent tasks without writing raw workflow YAML. Relevant for Justin's recurring AIOS routines.

---

### 8. Sandboxed / AFK Agents
**Sources:** Research-matt-pocock-agentic-workflow-2026-06-19.md; https://github.github.com/gh-aw/

AFK (Away From Keyboard) execution is the real multiplier — not loops per se, but the ability to detach from the agent while it runs. The engineering requirement for safe AFK execution:

1. **Network isolation:** the agent can only reach explicitly allowlisted endpoints. GitHub Agentic Workflows runs agents behind a firewall; no arbitrary exfiltration.
2. **Scoped write permissions:** the agent cannot push to main directly. It writes to a branch; a gated step controls the merge.
3. **Staged outputs:** the agent writes to a staging area (worktree, outbox directory) before any publish action. A separate gate reviews and ships.
4. **Environment isolation:** no access to production secrets. AFK agents get minimal-permission tokens scoped to their task.

Matt Pocock's "Sand Castle" tool (Docker/Podman/Vercel sandboxes) implements all four. GitHub Agentic Workflows implements them at the Actions layer. For Justin running Claude Code locally, `isolation: worktree` on subagents is the minimum viable implementation of (1) and (2).

---

### 9. Token Economics of Loops
**Sources:** Research-loop-engineering-2026-06-19.md; https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentcost01-bp01.html; research-matt-pocock-agentic-workflow-2026-06-19.md

Token cost compounds in loops. The two failure modes:

**Failure mode A — wrong path amplification.** Theo's example: Opus loop ran 8 hours / 3M+ tokens to address 3 small PR comments. The evaluator didn't catch early that the approach was wrong; the loop ran to depth. Fix: cheap fast-fail evaluation first (run the tests, check lint) before invoking the expensive generator on a new iteration.

**Failure mode B — context bloat per cycle.** On long sessions, each loop iteration re-reads prior context. A naive loop that resumes the same Claude Code session accumulates cost superlinearly. Fix: spawn fresh agents per pipeline stage. Pass state as structured files (JSON, markdown), not as conversation history.

**Cost-quality tradeoffs by pattern:**

| Pattern | Relative token cost | When it pays |
|---|---|---|
| Prompt chaining | Low (N calls, no retry) | Fixed sequence, predictable output |
| Routing | Low (1 classifier + 1 handler) | High-volume, many categories |
| Parallelization | Medium (N simultaneous workers) | Independent subtasks, speed matters |
| Evaluator-optimizer | Medium-high (N generator + N evaluator) | Clear rubric, output demonstrably improves per cycle |
| Orchestrator-workers | High (orchestrator + dynamic workers) | Subtask count unknowable, flexibility required |
| Autonomous agent | Highest (open-ended iterations) | Only when other patterns genuinely insufficient |

**The Pocock lever:** a better codebase architecture lets a cheaper model do the same work. Architecture and guardrails (types, tests, lint, small files) are the real token-spend control — not just iteration caps. Investing in BrandOS's AX (agent experience) directly reduces per-loop cost.

**Budget guardrails in production:** two thresholds — soft limit triggers an alert, hard limit forces "final answer" mode. At the orchestration layer (code), not in the system prompt. AWS Well-Architected recommends explicit per-cycle token instrumentation so thresholds can be tuned from data, not guesswork.

---

## (c) The 7 Use Cases — Engineering Lens

---

### Use Case 1: Code Review and Fix Loop
**Wiring:** PR opened → GitHub Actions `on: pull_request` → review-agent reads diff → posts findings as structured JSON to outbox → fix-agent (in fresh worktree) addresses each finding → re-triggers review → loop until all findings resolved or step budget hit.

**Maker/checker boundary:** fix-agent (maker) writes code; review-agent (checker) evaluates diff against criteria (type errors, lint, test results). The review-agent must run tests deterministically — not just "does this look right" but "does `npm test` pass."

**Stop condition:** `tsc --noEmit` exits 0 AND `eslint` exits 0 AND test suite passes. These are deterministic exits, not confidence scores. Fallback: `max_iterations=5`.

**Failure mode:** the fix-agent and review-agent enter a disagreement loop — fixer makes change, reviewer still finds issues, fixer reverts and restores same issue. No-progress detection: if the diff between iteration N and N-1 is semantically identical, inject "try a different approach" once, then hard-stop.

**Token economics:** this is the highest-cost use case per loop because each iteration re-evaluates the full diff. Mitigation: run cheap checks first (type errors before tests before full review). Exit as soon as possible.

**Recommendation for Justin:** Implement via GitHub Actions `on: pull_request` in BrandOS. Use `gh pr diff` to feed the review-agent; write findings to a structured `REVIEW.md`; the fix-agent reads `REVIEW.md` and applies surgical edits. Do not re-run the full review-agent on every commit — only re-check the specific findings that were addressed. This cuts per-iteration cost by 60-70%.

---

### Use Case 2: Inbox / Triage Loop
**Wiring:** `archives/raw/` is the inbox (queue, not loop). Scheduled cron (or file-watcher) triggers `/dispatch` when new files appear → classifier routes each item → draft/act on routable items → items that need human judgment land in `todos/pending.md` → loop terminates per-item on routing completion.

**Maker/checker boundary:** weak in the current AIOS — the same agent classifies and routes. The minimum viable checker: a second call that confirms the routed destination makes sense given the item content. This doesn't need to be a separate model — it can be a programmatic check (does the referenced project slug exist in `clients.yaml`?).

**Stop condition:** every item in the inbox either has a routing record or is flagged for human decision. The loop terminates when the inbox queue is empty or all remaining items are in the "human needed" bucket.

**Failure mode:** duplicate processing. An item processed in the previous run gets processed again. Fix: write a `.dispatched` marker file alongside each raw item after routing; the loop skips files with a `.dispatched` companion. This is the idempotency key pattern applied to files.

**Token economics:** low per-item because triage decisions are short-context classification. High total if the inbox accumulates. Run on a 6-hour cron during active work periods; a file-watcher trigger for time-sensitive items.

**Recommendation for Justin:** Add a `.dispatched` sentinel file pattern to `/dispatch`. Store `dispatched_at`, `destination`, and `item_hash` in the sentinel. A re-run of `/dispatch` on the same raw file is idempotent — the sentinel prevents re-routing. This is missing today and is the highest-risk gap in the current AIOS.

---

### Use Case 3: Growth / Content Loop
**Wiring:** produce content → publish to channel → measure engagement signal → feed signal back as structured learnings → next content iteration informed by learnings. Each stage is a separate agent invocation; state passes as structured files.

**Maker/checker boundary:** content producer (maker) outputs draft; a separate checker evaluates against brand voice (`references/voice.md`) and target criteria before publish. The engagement measurement step is the delayed evaluator — it runs on a different cadence (days later) from the generator.

**Stop condition:** this use case has no single convergence point — it's a recurring queue, not a converging loop. The correct framing: each content piece is a task that closes when published and measurement is recorded. The "loop" is the system that continuously processes the queue.

**Failure mode:** publishing duplicate content if the loop triggers before prior measurement is recorded. Fix: track state per content piece (drafted, published, measured, archived) in a state file. Each piece only advances one state per loop run.

**Token economics:** medium. Content generation is expensive per piece; measurement reading is cheap. The feedback step (encoding learnings) should use a small model — it's pattern extraction from structured engagement data, not generation.

**Recommendation for Justin:** Not a priority until BGD has a systematic content production process. When it arrives, model it as a state machine per content piece (`draft → review → publish → measure → archive`), not as a loop. Each transition is a queue event. Store state in `state/content-pipeline.md`.

---

### Use Case 4: Design Iteration Loop (Figma ↔ Implementation)
**Wiring:** Figma spec → implementation in code → screenshot of rendered component → visual diff against Figma spec → critique → apply refined implementation → repeat until visual diff below threshold.

**Maker/checker boundary:** implementation agent (maker) writes component code; screenshot + visual comparison (checker) measures pixel/layout deviation from Figma. The checker must be deterministic — a structured comparison metric (bounding box alignment, color delta) not "does this look right."

**Stop condition:** visual diff score below a defined threshold (e.g., <5% deviation on layout, exact color match on brand colors). Alternatively: maximum 3 iterations, then flag for human review. Design is subjective enough that unbounded loops produce diminishing returns rapidly.

**Failure mode:** the implementation agent makes changes that "look" correct but break layout in other viewport sizes. Fix: the checker must run multiple viewport screenshots, not just one.

**Token economics:** screenshot generation is expensive; visual analysis is expensive. Cap at 3 iterations hard. If not converged in 3, route to human. This is the use case where the token cost of convergence most commonly exceeds the cost of human judgment.

**Recommendation for Justin:** Use the existing `compound-engineering:ce-design-iterator` agent for this. The engineering addition: add an explicit `max_iterations=3` guard in the skill invocation. If not converged, the agent emits a structured diff report for human decision, not another iteration.

---

### Use Case 5: Planning / Roadmap Loop (GSD Phases)
**Wiring:** Idea → spec → plan → execute → verify → next phase or exit. This is a sequential chain (prompt chaining pattern), not a self-running loop. Each transition is a human checkpoint.

**Maker/checker boundary:** each phase transition has an explicit checker: `/gsd-plan-checker` validates the plan before execution, `/gsd-verifier` validates execution against phase goal. The key engineering property: these are **separate agents with separate contexts**, not the same agent re-reading its own work.

**Stop condition:** explicit phase completion criteria, defined before execution begins. The verifier checks against those criteria deterministically. A phase is done when the criteria are met, not when the agent "feels" done.

**Failure mode:** specification drift — the plan diverges from the spec, and execution diverges from the plan. Fix: each agent in the chain receives the original spec as an immutable reference alongside its immediate input. It checks its output against spec, not just against the prior step's output.

**Token economics:** medium per phase; the chain spans days/weeks so total cost is not a single session concern. The economics question is per-agent: plan-checker and verifier should use a smaller model (they're evaluation tasks, not generation tasks).

**Recommendation for Justin:** The GSD system already implements this pattern well. The missing piece: a spec-as-immutable-reference mechanism. Every downstream agent (planner, executor, verifier) should receive `SPEC.md` as a system-level reference, not just the immediate prior artifact. Add this as a convention to GSD phase PLAN.md templates.

---

### Use Case 6: Monitoring / Self-Audit Loop
**Wiring:** Cron triggers audit agent (daily or weekly) → agent reads one slice of the system (today's scope: BrandOS API routes / tomorrow: dealer configs / etc.) → produces structured findings JSON → findings over a severity threshold go to `todos/pending.md` → findings below threshold are logged to audit trail → loop terminates, next run picks up next slice.

**Maker/checker boundary:** the audit agent is its own checker by design — it reads and evaluates, does not write code. The "maker" here is the codebase being audited, not the agent. No separate verification needed, but the findings must be structured (severity, evidence, recommendation) so a human can evaluate them in under 30 seconds.

**Stop condition:** the scheduled run completes one slice. The system loops via cron, not via agent self-iteration. This is the key architectural decision: the loop is in the scheduler, not in the agent. Each agent invocation is bounded and cheap.

**Failure mode:** finding inflation — the audit agent flags everything as high severity, flooding `todos/pending.md` and training Justin to ignore it. Fix: the findings format must include "evidence" (the actual code or config that triggered the finding) and "prior occurrence" (was this flagged before and not fixed, or is it new?). Novel high-severity findings get routed; repeat low-severity findings get logged-only.

**Token economics:** lowest-cost use case per run because it's read-only and scoped. Use a small model (Haiku) for routine audit passes; escalate to a larger model only when findings exceed a severity threshold. Pocock's "buy a lock" insight: $10/month in Haiku cron runs catches security and quality issues continuously, without waiting for a problem to surface.

**Recommendation for Justin:** Build this first. A `scripts/audit-loop.sh` that runs daily via GitHub Actions (or Claude Code Routines), scopes to one module per run, writes findings to `audits/YYYY-MM-DD-<module>.md`, and copies high-severity items to `todos/pending.md`. Start with BrandOS API routes. This is Pocock's "cron security review" made concrete.

---

### Use Case 7: Learning / Knowledge-Compounding Loop
**Wiring:** `/retro` extracts session patterns → patterns encoded as updated skills or wiki entries → next session applies encoded knowledge → `/retro` detects whether pattern improved → encode the improvement delta.

**Maker/checker boundary:** `/retro` (the miner) is the maker, producing raw patterns. The checker is the question "did this encoding reduce friction in the next session?" — measured by whether the same pattern appears again in the next retro. If a friction pattern persists across three retro cycles without improvement, it escalates to `/level-up` for deeper intervention.

**Stop condition:** no new friction patterns in the retro output. In practice, this never fully converges — it's a continuous improvement system. The correct framing: each skill or wiki update is a task with a done state; the loop measures improvement, not completion.

**Failure mode:** encoding too broadly — a skill that tries to cover every edge case becomes a context bloat problem (Pocock's "100 abilities leaking 100 descriptions"). Fix: each encoded skill should be a single narrow procedure, not a general philosophy. If a skill requires more than 10 sentences to describe, split it.

**Token economics:** very low. Retro is a read-only analysis of session history; encoding is a write to a markdown file. The compounding value is high because each encoding reduces future token cost (the agent needs fewer iterations when it has good skills to reference). This is the use case with the best long-term token economics.

**Recommendation for Justin:** Add a "encoding quality check" step to `/level-up`. After encoding a new skill, the next retro explicitly checks: "did this skill get used in the past week, and did it reduce friction or increase it?" Skills that increase friction (too broad, wrong context, stale) get flagged for revision. This closes the loop on the encoder itself.

---

## (d) Top 5 Systematic Changes

### 1. Add idempotency sentinels to all stateful loop triggers — starting with `/dispatch`

**What:** every loop that writes state (routes items, updates files, posts comments) must record a completion marker keyed to the input item's natural identifier. For `/dispatch`, write `archives/raw/<filename>.dispatched.json` with `{ dispatched_at, destination, hash }` on success. The loop checks for this file before processing.

**Why it matters:** without this, every re-run of `/dispatch` or any scheduled routine risks duplicate `todos/pending.md` entries, duplicate drafted emails, and duplicate wiki stages. This is the highest-risk gap in the current AIOS architecture — it produces silent correctness failures that compound over time.

**File to add:** `.claude/skills/dispatch/SKILL.md` — add an explicit "idempotency check" step at the top of the dispatch procedure. Also applies to `/daily-inbox-triage`, `/scheduled-triage`, and any future cron loops.

---

### 2. Enforce step budgets at the orchestration layer, not in system prompts

**What:** every agent invocation from a skill or loop harness must pass an explicit `max_turns` / `max_steps` parameter at the calling layer. Do not rely on the system prompt saying "stop after 5 iterations" — that's advisory, not enforced.

**Why it matters:** Theo's 8-hour / 3M token overrun happened because the loop had no hard exit at the code layer. System prompt instructions are visible to the agent, which means a confused or adversarially prompted agent can reason past them. Code-layer limits cannot be overridden.

**Where to add:** any GSD skill that spawns sub-agents (executor, planner, verifier) should pass `max_turns` explicitly. Review `.claude/skills/gsd-execute-phase` and similar — if they don't have a numeric step cap in the Agent call, add one. The default: `max_turns=20` for execution phases, `max_turns=5` for review phases.

---

### 3. Model all recurring AIOS work as queues with task state, not as loops

**What:** replace the "loop" mental model for AIOS recurring work with an explicit task state machine: `pending → in_progress → done | escalated`. Track state in structured files (`state/task-queue.md` or a simple YAML) per task type. The cron or trigger picks up items in `pending` state; marks them `in_progress`; marks them `done` on success; marks them `escalated` on failure after N retries.

**Why it matters:** the current AIOS has a loop shape (dispatch runs, triage runs) but no durable task state between runs. If a run fails midway, there's no record of which items were processed and which weren't. A task-state model makes partial failures recoverable and gives Justin a dashboard of queue depth.

**File to add:** `state/loop-state.yaml` — keys are loop names (dispatch, inbox-triage, dealer-health), values are last run timestamp, items processed, items escalated, items failed. This file is the operational heartbeat of the AIOS.

---

### 4. Wire GitHub Actions as the loop scheduler for BrandOS — starting with a daily audit workflow

**What:** add `.github/workflows/daily-audit.yml` to the BrandOS repo. On schedule (`0 2 * * *`): checkout repo, install deps, run a scoped audit agent (start with API route coverage check), write findings to `audits/` directory, open a GitHub issue if severity is high. Use `strategy: matrix` for parallel module coverage.

**Why it matters:** BrandOS currently has no automated self-monitoring. Justin finds problems when dealers report them or when he returns to a module after weeks away. A daily audit running in Actions costs nothing beyond the Claude API call and gives Justin a continuous health signal without manual effort. This is Pocock's "buy a lock" implemented concretely.

**Immediate scope:** one Action, one module (BrandOS portal API routes), one check (type errors + orphaned routes). Expand incrementally. The incremental expansion is itself a queue task tracked in `state/loop-state.yaml`.

---

### 5. Separate maker and checker contexts in every GSD phase by passing `SPEC.md` as an immutable reference

**What:** modify GSD plan and execute skills to explicitly pass the phase's `SPEC.md` to every downstream agent (planner, executor, verifier) as a system-level reference document, not as conversational context. The checker (verifier) compares outputs against SPEC, not just against the prior agent's output.

**Why it matters:** the most common GSD drift pattern is "the plan solves the problem I understood at planning time, not the problem specified." Each agent in the chain adds its own interpretation. Anchoring every agent to the original spec prevents drift. The verifier catches it if it occurs.

**Where to change:** `gsd-executor` and `gsd-verifier` agent calls in the GSD phase skills. Add a `spec_path` parameter that both agents receive. The verifier's first action is "read SPEC.md and extract the success criteria" — not "read what the executor wrote."

---

## (e) Sources

1. **Anthropic — Building Effective Agents** — https://www.anthropic.com/engineering/building-effective-agents
2. **Anthropic — Multi-Agent Research System** — https://www.anthropic.com/engineering/multi-agent-research-system
3. **Anthropic — Recursive Self-Improvement (referenced in background docs)** — https://www.anthropic.com/institute/recursive-self-improvement
4. **Agent Patterns Catalog — Evaluator-Optimizer** — https://www.agentpatternscatalog.org/patterns/evaluator-optimizer/
5. **Agent Patterns Catalog — Step Budget** — https://www.agentpatternscatalog.org/patterns/step-budget/
6. **AWS Well-Architected Agentic AI Lens — Agent Cost BP01** — https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentcost01-bp01.html
7. **Tool Call Convergence: Agents That Know When to Stop** — https://tianpan.co/blog/2026-05-07-tool-call-convergence-agents-stopping-criteria
8. **HLD Handbook — Idempotency and Exactly-Once** — https://hld.handbook.academy/curriculum/distributed-systems-theory/idempotency-exactly-once/
9. **BackendBytes — Idempotency Patterns in Distributed Systems** — https://backendbytes.com/articles/idempotency-patterns-distributed-systems/
10. **GitHub Agentic Workflows (GitHub/Microsoft)** — https://github.github.com/gh-aw/
11. **gitcron — Cron for AI Agents** — https://github.com/open-gitagent/gitcron
12. **IT-Journey — Multi-Agent Orchestration Patterns (GitHub Actions)** — https://it-journey.dev/quests/1011/agentic-multi-agent-orchestration-patterns/
13. **loop-harness — Autonomous Loop Harness (lSAAGl)** — https://github.com/lSAAGl/loop-harness
14. **Background doc: Loop Engineering 2026-06-19** — `brainstorm/research-loop-engineering-2026-06-19.md`
15. **Background doc: Matt Pocock Agentic Workflow 2026-06-19** — `brainstorm/research-matt-pocock-agentic-workflow-2026-06-19.md`
