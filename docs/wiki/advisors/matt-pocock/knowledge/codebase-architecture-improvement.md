---
source: add-board-member
advisor: matt-pocock
captured: 2026-06-06
url: https://www.aihero.dev/skills-improve-codebase-architecture
status: ingested
---

# Codebase Architecture Improvement: Finding Deepening Opportunities

**URL:** https://www.aihero.dev/skills-improve-codebase-architecture
**Published:** 2026-05-13 (AI Hero)
**Type:** Skill guide

## Key Frameworks and Patterns

### Deepening Over Rewriting
- **/improve-codebase-architecture does not start by proposing a rewrite.** It looks for deepening opportunities -- places where the codebase is hard to understand, hard to test, or hard for agents to navigate.
- **Deep module:** Puts useful behavior behind a small, stable interface. High leverage.
- **Shallow module:** Makes callers learn almost as much as the implementation knows. Low leverage.
- **The goal is always to deepen** -- increase the ratio of implementation complexity hidden behind simple interfaces.

### Precise Architecture Language
- **Module:** Something with an interface and implementation
- **Interface:** Everything a caller must know to use the module
- **Implementation:** The code inside
- **Depth:** How much leverage the interface gives you
- **Seam:** Where behavior can change without editing in place
- **Adapter:** A concrete thing satisfying an interface at a seam
- **Locality:** Keeping related change, bugs, and knowledge together
- **"Vague architecture words create vague refactors."** This shared language is non-negotiable.

### When to Use It
- After an agent run, a code review, or a planning session exposes friction
- **Good signals:** Understanding one concept requires bouncing through many files. Tests only work by reaching into implementation details. Helpers were extracted but didn't make the system easier to change. The agent keeps choosing the wrong place to edit. The code works, but the workflow keeps producing avoidable mistakes.

### The Meta-Workflow: Fix Output, Then Fix the System
- **The critical insight:** When an agent finishes, do not only ask whether the code works. Ask WHY the agent made the mistakes it made.
- **The answer might be:** Weak instructions, vague issues, missing domain language, or architecture that hides the right path.
- **Fix the output, then improve the system that produced it.** This is a double-loop learning pattern.
- **Workflow position:** AFK agent finishes -> /review the diff -> improve the workflow -> improve the codebase.

### Reads Domain Context First
- The skill reads the project's domain glossary and ADRs before exploring code
- Proposes a numbered list of deepening opportunities with: which modules are involved, what friction exists, what would change, how it improves locality/leverage/testability
- Then the human chooses which candidate to explore

### Pairs Well With
- /grill-with-docs -- sharpen domain language before architecture work
- /to-issues -- turn architecture improvements into thin reviewable slices
- /review -- separate standards review from spec review

## Positions and Opinions
- Never start architecture improvement by proposing a rewrite. Start by finding deepening opportunities.
- Architecture language must be precise. Vague words produce vague refactors.
- The most valuable question after any agent run is "why did the agent make these mistakes?" not just "did the code work?"
- Architecture improvement is maintenance, not a one-time event. Run it weekly or after development surges.
- The agent choosing the wrong place to edit is a codebase design problem, not an agent problem.
- Extracted helpers that don't make the system easier to change are shallow refactors -- avoid them.

## Relevant Quotes
- "A deep module puts useful behavior behind a small, stable interface. A shallow module makes callers learn almost as much as the implementation knows."
- "Vague architecture words create vague refactors."
- "Fix the output, then improve the system that produced it."
- "When an agent finishes, do not only ask whether the code works. Ask why the agent made the mistakes it made."

## How This Applies as a Decision Lens
When evaluating any codebase or system design: is the architecture deep (simple interfaces, complex implementations) or shallow (callers must know everything)? The "fix the system, not just the output" principle applies beyond code -- to any process that produces suboptimal results. For AIOS: if a skill or workflow produces bad output, the answer is often not better prompting but better architecture underneath. The precise language framework (module, interface, seam, adapter, locality) can be applied to evaluate any system's design quality.
