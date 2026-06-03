---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/skill-test-driven-development-claude-code
status: ingested
---

# TDD with AI Agents: Red-Green-Refactor

**URL:** https://www.aihero.dev/skill-test-driven-development-claude-code
**Published:** 2026-02-10
**Type:** Blog post

## Key Frameworks and Patterns
- **Red-Green-Refactor with vertical slices.** ONE test, ONE implementation, repeat. Each cycle responds to what you learned from the previous cycle. The constraint prevents the LLM from faking test results.
  - RED: Write ONE test that fails. Just one.
  - GREEN: Write minimal code to pass that test only. Nothing speculative.
  - REFACTOR: After all tests pass, clean up duplications and simplify.
- **Tests as honest conversation.** When you use TDD with AI, the tests become a conversation Claude is having with its own code. It discovers things about its own implementation as it goes, rather than just checking boxes.
- **Forced constraints prevent cheating.** If a test fails first, the LLM can't fake it -- it has to write real implementation. The one-at-a-time constraint prevents: writing imagined behavior instead of observed behavior, mocking internals and faking test passes, over-engineering upfront, and writing tests coupled to implementation details.
- **Interface-first design.** Before TDD begins, confirm with the user what interface changes are needed. When the AI changes an interface, that's an important decision it needs to take time over. Design interfaces for testability.
- **TDD demands deep modules.** TDD is really hard in a badly structured codebase because test boundaries are unclear. Deep modules with clear boundaries make TDD natural.

## Positions and Opinions
- Red-green-refactor with AI agents is "incredible" -- the most consistent way to improve agent output quality.
- LLMs are reluctant to refactor their own code while it's in their context window. Clearing context makes them less precious about code they've just written.
- It's not about more tests. It's about honest tests through forced constraints.
- Integration testing matters more than unit testing for AI workflows. Raising test boundaries lets you catch more bugs and work more comfortably with AI agents.
- A test that passes immediately isn't wasted -- it means the implementation is already robust enough to handle that case.

## Relevant Quotes
- "ONE test, ONE implementation, repeat."
- "The tests become a conversation Claude is having with its own code."
- "It's not about more tests. It's about honest tests through forced constraints."

## How This Applies as a Decision Lens
When building any feature with AI assistance: is there a TDD loop in place, or is the agent writing code without feedback? When evaluating code quality: were tests written before implementation (honest) or after (potentially dishonest)? This directly applies to any BGD project using Claude Code -- the /tdd skill pattern should be standard practice for backend work. For frontend, direct implementation with visual feedback loops is acceptable.
