---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/a-complete-guide-to-agents-md
status: ingested
---

# AGENTS.md, CLAUDE.md, and Progressive Disclosure

**URLs:**
- https://www.aihero.dev/a-complete-guide-to-agents-md (2026-01-18)
- https://www.aihero.dev/never-run-claude-init (2026-02-24)
**Type:** Blog posts (two related pieces synthesized)

## Key Frameworks and Patterns
- **Never run /init.** Auto-generated CLAUDE.md/AGENTS.md files dump irrelevant information into global context, inflate the system prompt, waste the instruction budget, and rot the moment code changes. Delete any auto-generated ones.
- **Instruction Budget.** LLMs can realistically handle around 300-400 instructions at a time. Every sentence in CLAUDE.md is an instruction. Stuffing irrelevant instructions burns the budget before the agent even starts working.
- **The Globality Problem.** CLAUDE.md is global -- every instruction applies to every session. A React rule is useful for frontend sessions but irrelevant for backend work. Every line has a cost that compounds across every session.
- **Progressive Disclosure.** Instead of cramming everything into AGENTS.md, give the agent only what it needs now and point it to other resources when needed. Agents are fast at navigating documentation hierarchies. Move domain-specific rules to separate files (e.g., docs/TYPESCRIPT.md -> docs/TESTING.md) and use skills for behavioral steering.
- **Four phases of agent context:** System Prompt (hardwired, not flexible), Exploration (flexible), Implementation (flexible), Testing (flexible, can balloon). Shrinking the system prompt gives more room for actual work.
- **The "ball of mud" feedback loop.** Agent does something wrong -> add a rule -> repeat hundreds of times -> unmaintainable mess. Different developers add conflicting opinions. Nobody does a full style pass.
- **What belongs in root AGENTS.md:** One-sentence project description, package manager (if not npm), non-standard build commands. Maybe 6 words total. His entire CLAUDE.md: "you are on WSL on Windows."

## Positions and Opinions
- Trust the explore step. Every modern agent has an explore phase that's strictly better than a static CLAUDE.md because it only loads what's relevant and always reflects current state.
- Use skills for steering, not CLAUDE.md rules. Skills are discoverable instructions pulled in when relevant.
- The file system IS the documentation. If structured well, the agent gets an accurate picture from source of truth, not a rotting summary.
- Everything /init generates is either trivially discoverable from source or will go stale. Command listings, architecture descriptions, file references, implementation patterns -- all problematic.
- "Beware of doc rot." Lots of people stuff repos with markdown docs. The LLM doesn't know which to trust when docs and code diverge. Let the AI generate its own docs during exploration instead.
- Describe capabilities, not structure. Give hints about where things might be. Let the agent generate just-in-time documentation during planning.

## Relevant Quotes
- "Never run init. The file it generates dumps irrelevant information into your global context, inflates your system prompt, wastes your instruction budget, and rots the moment your code changes."
- "Your file system is the documentation."
- "The ideal AGENTS.md is small, focused, and points elsewhere."
- "Only include what is both undiscoverable and globally relevant."

## How This Applies as a Decision Lens
When designing CLAUDE.md files for BGD projects: is the content undiscoverable AND globally relevant? If not, it doesn't belong there. When evaluating AIOS documentation strategy: is it using progressive disclosure, or is it front-loading everything? This directly challenges the instinct to put "everything the agent needs" into CLAUDE.md -- the answer is almost always less, not more. Skills and file hierarchy handle the rest.
