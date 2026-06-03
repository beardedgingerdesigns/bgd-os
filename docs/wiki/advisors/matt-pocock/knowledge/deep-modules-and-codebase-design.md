---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/how-to-make-codebases-ai-agents-love
status: ingested
---

# Deep Modules and Codebase Design for AI

**URL:** https://www.aihero.dev/how-to-make-codebases-ai-agents-love
**Published:** 2026-02-26
**Type:** Blog post

## Key Frameworks and Patterns
- **AI as a "new starter with no memory."** Every agent spawn is like the guy from Memento stepping into your codebase. Your codebase is the biggest influence on AI output -- more than prompts or AGENTS.md files.
- **Deep Modules (from "A Philosophy of Software Design" by John Ousterhout).** Lots of implementation controlled by a simple interface. Instead of many small interconnected modules, create big chunks of functionality with simple, controllable interfaces. All exports go through the interface.
- **Grey Box Modules.** You own the interface. AI owns the implementation. Tests keep it honest. You can look inside if you want, but as long as tests pass, you don't need to care. This is the core pattern for human-AI collaboration on code.
- **Progressive Disclosure of Complexity.** Design codebases so the interface sits at the top and explains what the module does. Only drill deeper when needed. This mirrors how AI navigates code -- read types and interfaces first, implementation only when necessary.
- **Three costs of bad codebase design for AI:** (1) Poor feedback loops -- AI doesn't know if changes worked, (2) Hard to navigate -- AI can't find files or understand relationships, (3) Cognitive burnout -- human has to patch everything together manually.

## Positions and Opinions
- Your codebase, not your prompt, is the biggest influence on AI output. If the codebase is designed wrong, no amount of prompting fixes it.
- Good practice for humans remains good practice for AI. Deep modules with clear interfaces have been best practice for 20 years.
- Instead of holding hundreds of interrelated modules in your head, keep seven or eight chunks. The AI manages what's inside each one.
- This is still "a million miles from vibe coding." Taste at the boundaries -- deciding what goes into which module -- is the human's job.
- AI accelerates software entropy. Codebases get more complex at an unprecedented rate. The fix: caring about the design of the code.

## Relevant Quotes
- "AI is not a super-powered developer. It's a new starter with no memory."
- "The best modules are deep. They allow a lot of functionality to be accessed through a simple interface." -- John Ousterhout
- "Invest in the design of the system every day." -- Kent Beck, Extreme Programming Explained
- "These are grey box modules. You own the interface. AI owns the implementation. Tests keep it honest."

## How This Applies as a Decision Lens
When making architecture decisions for any project: are modules deep enough for AI to work effectively? When evaluating whether to add AI to a workflow: is the codebase structured for progressive disclosure, or will the AI get lost? This framework directly informs BrandOS architecture and any new project scaffolding decisions -- deep modules with tested interfaces are prerequisite for effective AI-assisted development.
