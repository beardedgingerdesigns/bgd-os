---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://www.aihero.dev/tracer-bullets
status: ingested
---

# Tracer Bullets: Keeping AI Slop Under Control

**URL:** https://www.aihero.dev/tracer-bullets
**Published:** 2026-01-22
**Type:** Blog post

## Key Frameworks and Patterns
- **Tracer Bullets (from The Pragmatic Programmer).** A small, end-to-end slice of functionality that touches all layers of the system at once. Build vertically, not horizontally. The cycle: build a small feature end-to-end, test it immediately, get feedback, move to the next slice in a fresh context window, repeat.
- **"Outrunning your headlights."** AI's natural inclination is to build complete solutions all at once -- entire API layers, middleware, auth, logging -- then discover the core assumption was wrong. This creates massive review burden and slop.
- **Vertical slices vs. horizontal layers.** Each issue/task should be a thin vertical slice cutting through all integration layers, not a horizontal slice of one layer. This applies to issue decomposition (PRD to issues) and to individual implementation tasks.
- **Explicit prompting required.** AI's sycophantic tendency makes it want to produce complete solutions. You must be extremely explicit in prompts to force small, end-to-end slices.
- **Context window constraints make this non-negotiable.** These principles apply harder to AI than they ever did to humans. The consequences of ignoring tracer bullets with an AI agent are immediate and visible.

## Positions and Opinions
- The slop problem is fundamentally about building too much without feedback. Tracer bullets are the antidote.
- "The classics have the answers." TDD, tracer bullets, and other proven techniques from foundational software engineering books work better with AI, not worse. People get excited about new technology and forget the proven fundamentals.
- Context window constraints make the discipline non-negotiable. You can't ignore tracer bullets with an AI agent the way you might with a human developer.
- Each task in a Kanban/issue board should be independently grabbable, with clear blocking relationships for parallel agent execution.
- Always ask: "Am I letting it outrun its headlights? Am I getting it to validate assumptions early, or is it building in the dark?"

## Relevant Quotes
- "AI has a natural inclination to sycophancy. It aims to please, in all aspects of its behavior. In code, this means it wants to produce complete solutions all at once."
- "The principles apply harder to AI than they ever did to humans. Context window constraints make the discipline non-negotiable."
- "Use tracer bullets. Force the agent to think small, build end-to-end, get feedback, and move forward with confidence."

## How This Applies as a Decision Lens
When scoping any feature or project phase: is it decomposed into tracer bullets, or is it a monolithic horizontal layer? When reviewing AI-generated code: did the agent validate assumptions early, or did it build the entire thing in the dark? This framework directly applies to how BGD decomposes work for AI execution -- BrandOS features, client automations, and AIOS skills should all be built as thin vertical slices with feedback loops between them.
