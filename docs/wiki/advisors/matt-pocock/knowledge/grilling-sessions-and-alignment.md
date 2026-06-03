---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/grill-with-docs
status: ingested
---

# Grilling Sessions: Align Before You Build

**URL:** https://www.aihero.dev/grill-with-docs
**Published:** 2026-05-05
**Type:** Blog post

## Key Frameworks and Patterns
- **Design Tree Resolution.** Before writing any code, walk down every branch of the design tree, resolving dependencies between decisions one by one. The concept comes from Frederick P. Brooks' "The Design of Design." Each branch is a decision point (e.g., cardinality, deletion behavior, status semantics) that must be resolved before implementation.
- **Grilling as alignment tool.** The /grill-me skill is just three sentences, but it forces an LLM to interview the user relentlessly until shared understanding is reached. Sessions can run 16-50+ questions. Skills don't need to be long to be impactful -- you need the right words at the right time.
- **/grill-with-docs evolution.** Combines grilling with domain documentation. Adds three layers: (1) searching for CONTEXT.md with shared language, (2) active language refinement during the session, and (3) Architectural Decision Records (ADRs) for non-obvious decisions.
- **Ubiquitous Language from DDD.** Adopted from Eric Evans' Domain-Driven Design. Create shared language used by codebase, developers, and domain experts. When all three speak the same language, concision and alignment follow. Example: "There's a problem with the materialization cascade" vs. re-explaining the entire concept each time.
- **ADRs only when needed.** Only create an ADR when: the decision is hard to reverse, would be surprising without context, or involved a real trade-off with consequences.

## Positions and Opinions
- The most common failure mode in software development is misalignment, not implementation quality. This is equally true in the AI age.
- Documentation should be the thinnest possible layer that gives the AI a head start. Not comprehensive -- minimal and precise.
- Shared language pays compound dividends: variables and files named consistently, codebase easier to navigate, agent spends fewer tokens on thinking.
- /grill-me is for non-code use cases; /grill-with-docs is strictly better when you have a codebase.
- Always use grilling at the start of a project -- that's when you're establishing shared language.

## Relevant Quotes
- "No-one knows exactly what they want." -- David Thomas & Andrew Hunt, The Pragmatic Programmer (cited as foundation for grilling)
- "With a ubiquitous language, conversations among developers and expressions of the code are all derived from the same domain model." -- Eric Evans, Domain-Driven-Design (cited as foundation for CONTEXT.md)
- "Skills don't have to be long to be impactful. You've just got to choose the right words for the LLM at the right time."

## How This Applies as a Decision Lens
When evaluating any new feature, workflow, or tool design: has alignment been achieved before building? The grilling pattern applies broadly -- any time there's a communication gap between intent and execution (human-AI or human-human), structured questioning resolves it faster than iteration-after-the-fact. Also applies to AIOS design decisions: is there a shared language for the domain, or is every session re-explaining concepts?
