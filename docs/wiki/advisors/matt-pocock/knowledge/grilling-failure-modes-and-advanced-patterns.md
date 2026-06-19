---
source: add-board-member
advisor: matt-pocock
captured: 2026-06-06
url: https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs
status: ingested
---

# 9 Things People Get Wrong With Grilling

**URL:** https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs
**Published:** 2026-05-25 (AI Hero)
**Type:** Blog post (long-form guide)

## Key Frameworks and Patterns

### Low Fidelity vs. High Fidelity Questions
- **Low fidelity questions** don't require detailed prototypes or images to answer. "What URL should this route live on?" These are grillable.
- **High fidelity questions** need zoomed-in prototypes or real interaction to answer. "How should this UI feel when we're using it?" These are NOT grillable.
- **The first failure mode:** trying to answer high-fidelity questions during a grilling session. When you hit one, use the handoff pattern: grill -> prototype -> grill again.

### Scope Management
- **Too-large scope creates two problems:** (1) Hidden high-fidelity questions that you won't discover until deep in the session. (2) Context window limits -- you hit the "dumb zone" (~120K tokens) before finishing.
- **Solution:** Ask the agent upfront to break a large scope into smaller, grillable chunks. Grill on each smaller scope individually. Stays within the "smart zone."
- **Building off known-good foundations beats planning into the future.** It's always easier to build off something you know works rather than endlessly planning for days of future work.

### Active vs. Passive Engagement
- **Too passive:** The agent bombards you with 540 questions and explodes the scope with requests about things that are way too low-fidelity.
- **Too active:** Grilling endlessly on low-fidelity details when you should actually be writing code. Over-grilling.
- **The balance:** Actively steer the conversation while knowing when to stop planning and start implementing. It's a conversation, not an interview.

### Preserving Design Decisions
- **A grilling session creates an incredibly valuable artifact: a context window full of design decisions.** By the time you finish, you've made hundreds of tokens worth of choices about how your system should work.
- **If you have context budget left:** Implement directly in the same session without handing off.
- **If running out of context:** Create a PRD using /2PRD as a handoff artifact.
- **Never clear the context and start fresh just to write a PRD.** That's throwing away all your design work. Every decision in that grilling session has value.

### Model Selection for Grilling
- **Two knowledge sources during grilling:** Contextual knowledge (files, prompts, tool results -- very reliable) and Parametric knowledge (model's training data -- less reliable but creative).
- **During grilling, you rely on parametric knowledge** -- the model's innate understanding to suggest things you might not have considered. If you had thought of them, you would have passed them in as context.
- **A dumb model won't give you good ideas.** Use the big frontier models for grilling. Parametric knowledge needs lots of parameters.
- **For implementation, you can use a smaller model** since most information is contextual (your detailed plan, the codebase).

### Parallel Grilling Sessions
- **Run multiple grilling sessions simultaneously.** While the agent thinks in session A, switch to session B, answer its question, switch back.
- **Like managing two Slack threads.** Not heavy context-switching, just managing separate conversations.
- **Most people max out at two sessions comfortably.** If one is doing long-running research, maybe three.
- **Double your throughput** with minimal cognitive overhead.

## Positions and Opinions
- /grill-with-docs has become a popular replacement for plan mode, but most people use it wrong.
- The skills aren't meant to replace engineers. They aid engineers who already have planning skills.
- Not all questions are equal. Recognizing grillable vs. ungrillable questions is the most important skill.
- Scope is absolutely critical. Smaller scopes keep you in the smart zone.
- Design decisions made during grilling are pure gold. Never throw them away by clearing context carelessly.
- Use smart models for grilling (parametric knowledge matters), cheaper models for implementation (contextual knowledge dominates).
- Parallel sessions are a simple throughput multiplier most people overlook.

## Relevant Quotes
- "The /grill-with-docs skill has become a popular replacement for plan mode in agent workflows. However, many people struggle with using it effectively."
- "It's always easier to build off something you know works rather than endlessly planning into the future."
- "If you're just planning and planning without building, you're over-grilling."
- "By the time you finish grilling, you've made hundreds of tokens worth of choices about how your system should work. This is pure gold."
- "A dumb model won't give you good ideas."

## How This Applies as a Decision Lens
When running any alignment or planning session with an AI: (1) Is the scope right-sized? (2) Are you distinguishing grillable questions from ones that need prototyping? (3) Are you actively steering or passively accepting? (4) Are you preserving the design decisions you've made? (5) Are you using a model with enough parametric knowledge for creative suggestions? These five checks prevent the most common grilling failures.
