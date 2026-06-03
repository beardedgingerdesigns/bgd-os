---
source: advisor-bootstrap
advisor: matt-pocock
captured: 2026-06-03
url: https://github.com/mattpocock/skills
status: ingested
---

# Skill Design Philosophy

**URL:** https://github.com/mattpocock/skills
**Published:** 2026-02-03
**Type:** GitHub repository (README + skill catalog)

## Key Frameworks and Patterns
- **Small, composable, adaptable.** Skills should be designed to be small, easy to adapt, and composable. They work with any model. "Hack around with them. Make them your own." This is a deliberate counter-position to monolithic frameworks like GSD, BMAD, and Spec-Kit that "own the process."
- **Skills fix common failure modes.** Four failure modes and their skill-based fixes:
  1. Misalignment ("agent didn't do what I want") -> /grill-me, /grill-with-docs
  2. Verbosity ("agent is way too verbose") -> CONTEXT.md with ubiquitous language
  3. Bad code ("the code doesn't work") -> /tdd with red-green-refactor, /diagnose
  4. Architecture rot ("we built a ball of mud") -> /improve-codebase-architecture, /zoom-out
- **Process encoding.** Skills encode the developer's process so the AI has a strict path to walk. The code quality improvement comes from encoding process, not from prompting harder.
- **Two-tier skill organization.** Engineering skills (daily code work: tdd, grill-with-docs, diagnose, triage, improve-codebase-architecture) vs. Productivity skills (general workflow: caveman, grill-me, handoff, write-a-skill). Keep them categorized by domain.
- **Skills as the fix for statelessness.** Since agents have no memory, skills are the mechanism to carry process knowledge across sessions.

## Positions and Opinions
- Frameworks that "own the process" (GSD, BMAD, Spec-Kit) take away developer control and make bugs in the process hard to resolve. Small composable skills are strictly better.
- "Software engineering fundamentals matter more than ever." AI amplifies the importance of good process, not replaces it.
- Treat AI agents like humans with weird constraints -- no memory, cloned from a birthing pod, go right to work. The most successful way to improve code quality from agents is to treat them like humans.
- Skills don't need to be long. /grill-me is three sentences and is his most impactful skill. The right words at the right time beat comprehensive instructions.
- Every skill should be hackable. "Based on decades of engineering experience" but designed to be modified.

## Relevant Quotes
- "My agent skills that I use every day to do real engineering -- not vibe coding."
- "Developing real applications is hard. Approaches like GSD, BMAD, and Spec-Kit try to help by owning the process. But while doing so, they take away your control and make bugs in the process hard to resolve."
- "These skills are designed to be small, easy to adapt, and composable. They work with any model."
- "The most successful way to get code quality up from agents is just to treat them like humans."

## How This Applies as a Decision Lens
When designing AIOS skills or evaluating skill frameworks: are they small and composable, or do they try to own the process? When building any automation: is it encoding a proven process, or is it just a fancy prompt? This philosophy directly applies to how Justin's AIOS skills should be designed -- small, hackable, process-encoding, and addressing specific failure modes rather than trying to be comprehensive.
