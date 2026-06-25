# The New SDLC With Vibe Coding

**Source:** "The New SDLC With Vibe Coding: From ad-hoc prompting to Agentic Engineering" by Addy Osmani, Shubham Saboo, and Sokratis Kartakis (Google, May 2026). Day 1 of a multi-paper series. [PDF in archives/raw/Day_1_v3.pdf]

**Why this matters for Justin:** This paper gives vocabulary and frameworks for what he's already building. His AIOS is a harness. His skills are dynamic context. His CLAUDE.md files are static context. His /dispatch + /wrap loops are orchestrator-mode workflows. The paper validates the architecture and gives him language to explain it to clients and partners.

## Core thesis

The shift in software engineering is from writing code to expressing intent. The developer's primary output is no longer code but the system that produces code: specifications, agents, tests, feedback loops, and guardrails. Google calls this the "factory model."

Key stat: as of early 2026, 85% of professional developers regularly use AI coding agents, 51% use them daily, and an estimated 41% of all new code is AI-generated.

## The spectrum: vibe coding to agentic engineering

Not a binary. A spectrum defined by how much structure, verification, and human judgment surround the AI's output.

| Dimension | Vibe Coding | Structured AI-Assisted | Agentic Engineering |
|---|---|---|---|
| Intent spec | Casual NL prompts | Detailed prompts + constraints | Formal specs, arch docs, memory files |
| Verification | "Does it seem to work?" | Manual testing, spot-checking | Automated tests, CI/CD gates, LM judges |
| Codebase understanding | Minimal; may not read code | Selective review of critical paths | Comprehensive arch review; AI handles details |
| Error handling | Copy-paste errors back to AI | Dev diagnoses root cause, AI fixes | Agents self-diagnose within bounds |
| Appropriate scope | Prototypes, scripts, hackathons | Features in established codebases | Production systems, team-scale |
| Risk profile | High; acceptable for disposable code | Moderate; human judgment at checkpoints | Low; systematic verification at every stage |

The single biggest differentiator: how outputs get verified. Without both tests and evals, it's always vibe coding regardless of prompt sophistication.

## Context engineering

The quality of AI-generated code depends less on prompt cleverness and more on context quality. Six types of context every agent needs:

1. **Instructions** - core role, goals, boundaries
2. **Knowledge** - retrieved docs, architecture diagrams, domain data
3. **Memory** - session logs (short-term) and persistent state (long-term)
4. **Examples** - few-shot demos and codebase reference patterns
5. **Tools** - API definitions, scripts, external services
6. **Guardrails** - hard constraints, formatting rules, safety validations

**Static vs. dynamic context** is a first-class architectural decision:
- Static (always loaded): system instructions, CLAUDE.md, global memory, core guardrails. Expensive because every token is present in every interaction.
- Dynamic (on-demand): agent skills triggered by task matching, tool results, RAG-fetched docs. Efficient because you pay only when needed.

**Agent Skills** are the key pattern for managing dynamic context at scale. They solve: context rot from overloaded prompts, absence of procedural memory for LLMs, operational overhead of multi-agent architectures, and portability across tools/vendors.

## Harness engineering

**Agent = Model + Harness.** The model is ~10% of what determines agent behavior. The harness is ~90%.

A harness includes:
- Instructions and rule files (CLAUDE.md, AGENTS.md, skill files, sub-agent prompts)
- Tools (MCP servers, APIs, functions)
- Sandboxes and execution environments
- Orchestration logic (sub-agent spawning, model routing, hand-offs)
- Guardrails/hooks (deterministic code at lifecycle points: pre-tool-call, post-edit, pre-commit)
- Observability (logs, traces, evals, cost/latency metering)

Benchmark evidence: on Terminal Bench 2.0, one team moved a coding agent from outside Top 30 to Top 5 by changing only the harness with no model change. Most agent failures are configuration failures, not model failures.

## The new SDLC

AI compresses the cycle unevenly. Implementation collapses from weeks to hours. Requirements, architecture, and verification remain human-paced. The result is a different workflow shape, not just a faster version of the old one.

- **Requirements** become a conversation between humans and AI that produces spec + initial implementation simultaneously
- **Architecture** remains the most stubbornly human-centric phase (trade-offs depend on business context AI can't fully grasp)
- **Implementation** transforms from writing to reviewing, guiding, and verifying (25-39% productivity gains, but METR found experienced devs took 19% longer on certain tasks due to verification overhead)
- **Testing** now includes output evaluation (does it pass?) AND trajectory evaluation (did it take the right steps?)
- **Code review** is augmented with AI as first-pass reviewer, but human judgment still required for design/maintainability/strategic alignment
- **Maintenance** is perhaps the most underestimated transformation: legacy codebases that were "too risky to touch" can now be safely refactored

## Developer roles: conductor vs. orchestrator

Two modes developers move between fluidly:

**Conductor** (hands-on, real-time): in the IDE, watching code appear, guiding with prompts and corrections. Fine-grained control, single-file scope, keystroke-level. Best for: exploratory coding, prototyping, learning new APIs, debugging complex logic.

**Orchestrator** (async, multi-agent delegation): defines goals, assigns to agents, reviews results. Goal-level control, multi-file scope, delayed feedback. Best for: feature implementation, migrations, test generation. Requires different skills: specification, decomposition, evaluation, system design.

## The 80% problem

AI agents rapidly generate ~80% of the code for a feature. The remaining 20% (edge cases, error handling, integration points, subtle correctness) demands deep contextual knowledge that models often lack. The nature of AI errors has evolved from syntax mistakes to insidious conceptual failures: wrong business logic assumptions, missing edge cases, architectural decisions that create long-term maintenance burden.

Effective developers don't try to be faster by accepting everything. They focus expertise where it matters most.

## Economics: CapEx vs. OpEx

**Vibe coding** = low CapEx, high OpEx. Near-zero barrier to entry but compounding operational costs: token burn rate (expensive prompting loops with low first-pass success), maintenance tax (unstructured AI-generated spaghetti code), security remediation costs.

**Agentic engineering** = high CapEx, low OpEx. Upfront investment in API schemas, test suites, structured context. But marginal cost of shipping and maintaining features drops dramatically. Context engineering is a financial lever: right context upfront increases first-pass success rate, avoiding costly trial-and-error loops.

**Intelligent model routing** further reduces OpEx: use large models for complex tasks (architecture, initial implementation), route deterministic tasks (test generation, code review, CI/CD) to smaller, cheaper models.

## Companion papers in the series

- Day 3: Context Engineering: Sessions, Skills & Memory (deeper dive on sessions, skill design, persistent memory, token economics)
- Day 5: Spec-Driven Production Grade Development in the Age of Vibe Coding (spec-driven development, structured code review, guardrails, sandboxing, zero-trust development)

## Cross-references

- [AIOS Evolution](aios-evolution.md) - Justin's AIOS is a concrete implementation of the harness/factory model described here
- [Token Economics](../frameworks/claude-code-token-economics.md) - the CapEx/OpEx and context engineering economics align with Justin's agent resumption cost findings
- [Agent Workflow Patterns](../insights/agent-workflow-patterns.md) - conductor/orchestrator maps to Justin's existing loop/goal/queue patterns
- [AIOS Second Brain Principles](../concepts/aios-second-brain-principles.md) - the memory and context architecture described here maps to AIOS's state/context/wiki layers
