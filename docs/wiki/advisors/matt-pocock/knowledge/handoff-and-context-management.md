---
source: add-board-member
advisor: matt-pocock
captured: 2026-06-06
url: https://www.aihero.dev/skills-handoff
status: ingested
---

# Handoff: Context Management Between Agent Sessions

**URL:** https://www.aihero.dev/skills-handoff
**Supplementary:** https://www.youtube.com/watch?v=dtAJ2dOd3ko (12:24 video, 258K views)
**Published:** 2026-05-13 (article), 2026-05-21 (video)
**Type:** Blog post + YouTube deep dive

## Key Frameworks and Patterns

### The Smart Zone vs. The Dumb Zone
- **Context windows have quality gradients.** Early in the context window, the agent performs well because attention relationships are not strained. As tokens accumulate, responses gradually degrade.
- **The dumb zone starts around 120K tokens.** Even though Claude Code advertises 1M tokens, realistically you have about 120K tokens for smart work. Budget efficiently and stay aware of your context window at all times.
- **Compact recovers intelligence.** `/compact` summarizes a large conversation, moving you from the dumb zone back to the smart zone. Auto-compact kicks in when you go deep into the dumb zone. Summaries build up like sediment across compactions.

### Handoff vs. Compact
- **Compact is for continuing.** It summarizes the current session so the same thread can continue. Good for long-running, single-threaded work, especially debugging.
- **Handoff is for branching.** It takes a slice of context relevant to a different task and hands it to a new, separate session. The original session stays pure and focused.
- **The three options when you notice an out-of-scope task:** (1) Extend current session -- dilutes context, hits dumb zone before finishing. (2) Compact -- clobbers progress on current task. (3) Handoff -- takes just the relevant slice, keeps current session clean.

### The Handoff Document
- **Contents:** Purpose of the next session, relevant context from current session, suggested skills to invoke, pointers to existing artifacts (not duplicated content).
- **Saved to OS temp directory.** These are disposable working documents, not permanent documentation. Not something to keep in your codebase, rotting over time.
- **Redact sensitive information.** API keys, passwords, PII should never float around in handoff documents.
- **Tailor to the next session's purpose.** If the user describes what the next session will focus on, use that as the guide for what to include.

### Common Handoff Patterns

#### Grill -> Handoff -> Grill
- During a grilling session, notice something out of scope. Declaring it out of scope focuses the grilling. The handoff document captures just what's needed for a separate task. Grilling session stays pure and completes faster.

#### Grill -> Prototype -> Grill (DIY Sub-Agent Pattern)
- When grilling surfaces questions you need to see (UI interactions, complex logic, architectural decisions that need prototyping):
  1. Identify what needs prototyping during grilling
  2. Use /handoff to create a focused prototype document
  3. Build the prototype in a separate session (can use 100K+ tokens)
  4. Create another handoff document passing learnings back
  5. Return to the grilling session with compressed insights
- **This creates a DIY sub-agent pattern:** use a full context window for exploration, compress learnings, pass them back to the parent session.

### Cross-Agent Workflow
- **Markdown is portable.** Your first session might be Claude Code, but you can pass the handoff document to Codex, Copilot CLI, or any other coding agent.
- **Possibilities:** Adversarial review (different agents reviewing each other's work), tool diversity (best tool for each task), flexibility (not locked into one vendor).

### Skill Design Decisions
- **Suggested skills section in handoff documents.** Skills define the flavor of a session. Suggesting /grill-with-docs, /diagnose, or /prototype means the next agent session can immediately invoke them.
- **Avoid duplication.** Use pointers to existing content rather than duplicating it. Handoff documents get bloated fast otherwise.
- **The skill itself is very simple.** "Write a handoff document summarizing the current conversation so a fresh agent can continue the work. Save it to the temporary directory of the user's operating system, not the current workspace."

## Positions and Opinions
- Even though context windows are massive (1M tokens), you realistically only have about 120K for smart work. Budget accordingly.
- Compaction is for continuing; handoff is for branching. They solve different problems.
- Handoff documents are disposable. Don't let them become permanent documentation that rots.
- The simplest skills are often the most impactful. /handoff is a few sentences and became his most-used productivity skill.
- Cross-agent workflows via markdown documents are more flexible than native agent features.
- Always describe the purpose when invoking handoff. A good handoff document requires knowing what the next agent will do.

## Relevant Quotes
- "There's a smart zone and a dumb zone in these context windows. Early on you get much better performance because the attention relationships aren't strained."
- "By around 120,000 tokens, I personally feel like I've entered the dumb zone."
- "Handoff lets you split concerns across independent sessions while keeping each one focused and smart."
- "What's elegant about using a markdown document instead of relying on native agent features is portability."
- "I thought it was just too simple to require a skill... And it turns out I used it a lot."

## How This Applies as a Decision Lens
When managing any multi-session AI workflow: are you losing context quality by overloading a single session, or branching intelligently via handoff? The smart zone / dumb zone model is a concrete way to evaluate session health. The DIY sub-agent pattern (grill -> prototype -> grill) is directly applicable to any design exploration. For AIOS: the handoff pattern maps naturally to staged ingestion and dispatcher-to-worker architecture.
