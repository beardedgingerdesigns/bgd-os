---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.youtube.com/watch?v=EJyuu6zlQCg
status: ingested
---

# Process-Driven Development: The Full AI Coding Workflow

**URL:** https://www.youtube.com/watch?v=EJyuu6zlQCg
**Published:** 2026-03-16
**Type:** YouTube transcript (16:42)

## Key Frameworks and Patterns
- **The five-skill daily workflow (in sequence):**
  1. /grill-me -- Reach shared understanding with the LLM through relentless questioning. 16+ questions for moderate features, 30-50 for complex ones.
  2. /write-a-prd -- Turn the grilled idea into a Product Requirements Document. Steps: description, repo exploration, interview, sketch major modules, write PRD from template, submit as GitHub issue.
  3. /prd-to-issues -- Turn the PRD (destination document) into a journey: independently grabbable GitHub issues as vertical slices with blocking relationships for parallel execution.
  4. /tdd -- Red-green-refactor loop for implementation. Forces honest tests and minimal code.
  5. /improve-codebase-architecture -- Periodic architecture health check. Find deepening opportunities. Spawn 3+ subagents for radically different interface designs. Pick the best, create refactor RFC as GitHub issue.
- **Destination vs. Journey.** A PRD describes the destination. Issue decomposition creates the journey. Both are needed. The PRD doesn't prescribe implementation details because they'd go stale.
- **Ralph loops.** Autonomous agent loops that iterate through GitHub issues. Each issue picked up, implemented via TDD, committed, closed, then next issue unblocked. Human reviews asynchronously.
- **Architecture as maintenance.** Run /improve-codebase-architecture once a week or after a surge of development. Identify deepening candidates, design multiple interface options, pick the best, create implementation plan.
- **Process over prompting.** "Right now, process has never been more important." You have access to middling-to-good engineers with no memory. You need strict, well-defined processes.

## Positions and Opinions
- Process is more important than ever in the AI age. You need strict processes because agents have no memory.
- PRDs should describe the destination, not the journey. Don't over-prescribe implementation details or they'll go stale.
- Each issue should be a thin vertical slice (tracer bullet) cutting through all integration layers.
- LLMs are reluctant to refactor their own code within the same context window. Clearing context helps.
- Architecture refactoring requires taste -- these decisions need human-in-the-loop.
- If your codebase is garbage, the AI will produce garbage within it.

## Relevant Quotes
- "At your fingertips now, you have access to a fleet of middling to good engineers that you can deploy at any time. But the weird thing about these engineers is they have no memory."
- "If you have a garbage codebase, then the AI is going to produce garbage within that codebase."
- "If you took all of these skills and said, 'Okay, this is like a little mini markdown book of processes for humans,' then it wouldn't look out of place."
- "The most successful way to get code quality up from agents is just to treat them like humans."

## How This Applies as a Decision Lens
When establishing any development workflow: is there a clear progression from alignment (grilling) through specification (PRD) through decomposition (issues) through execution (TDD) through maintenance (architecture improvement)? This full workflow is the gold standard for AI-assisted development. For BGD's client projects: adopting even a subset (grill -> PRD -> issues) would dramatically improve AI output quality. The Ralph loop pattern is directly applicable to autonomous coding on BrandOS features.
