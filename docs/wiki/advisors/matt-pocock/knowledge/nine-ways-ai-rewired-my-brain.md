---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/ways-ai-coding-has-rewired-my-brain
status: ingested
---

# 9 Ways AI Coding Has Rewired My Brain

**URL:** https://www.aihero.dev/ways-ai-coding-has-rewired-my-brain
**Published:** 2026-03-11
**Type:** Blog post

## Key Frameworks and Patterns
- **Nine shifts in developer mindset from 100% AI-contributed code:**
  1. Way more time thinking about integration testing. Raise test boundaries to catch more bugs.
  2. Friction via pre-commit hooks, CI, and strong types is super desirable. Immediate feedback = better agent decisions.
  3. AI has no taste for UI -- prototype extremely aggressively. Ask for 5 different options on throwaway routes before committing.
  4. AI has no taste for software architecture. Bad codebases = shallow modules with big interfaces. Good codebases = deep modules with simple interfaces.
  5. Deep, grey-box modules with simple interfaces are king. Test at boundaries, leave implementation to AI.
  6. Use Effect.ts for dependency injection (TypeScript-specific). Services as reusable, deep modules.
  7. Much more meta-programming. Always thinking about how to make agents run automatically -- defining processes, delegating grunt work.
  8. Beware of doc rot. Let AI generate its own docs during exploration instead of maintaining markdown docs that diverge from code.
  9. Much higher cognitive load to keep up with changes. Deep grey-box modules help by letting you trust tests and give cursory glances.

## Positions and Opinions
- 100% AI-contributed code is viable and his current workflow.
- AI has no taste -- not for UI, not for architecture. The human's job is taste at the boundaries and in design decisions.
- Friction (hooks, CI, types) is a feature, not a bug, when working with AI. More friction = better code.
- Meta-programming (defining processes, building skills, automating the automation) is the highest-leverage activity.
- Parallelization isn't necessary for most individual projects. Running 4-5 agents in parallel would be "gnarly" for cognitive load.
- The shift is from "writing code" to "designing systems that agents execute." More architect, less typist.

## Relevant Quotes
- "I have been writing all the software that I work on completely 100% AI-contributed for a few months now."
- "Raising test boundaries lets you catch more bugs and work more comfortably with AI agents running code automatically."
- "AI has no taste for UI -- prototype extremely aggressively."
- "Deep, grey-box modules with simple interfaces are the king."

## How This Applies as a Decision Lens
When evaluating how to integrate AI into any workflow: which of these nine shifts apply? For BGD's AI services pivot: the meta-programming mindset (point 7) is directly relevant -- Justin should be thinking about process design, not individual task execution. The "AI has no taste" position (points 3-4) means human judgment on design and architecture remains essential even with full AI-assisted development. The doc rot warning (point 8) applies directly to AIOS wiki maintenance strategy.
