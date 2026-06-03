---
source: advisor-bootstrap
advisor: nate-herk
captured: 2026-06-03
url: https://assets.skool.com/f/b51c57150c70495899bf4bc8aaee8166/66ec1285dca349dd95b122d8c70715f4e2265bc015ee4fb8a8bece86717e3d12
status: ingested
---

# The Three Ms of AI -- Mindset, Method, Machine

**URL:** https://assets.skool.com/f/b51c57150c70495899bf4bc8aaee8166/66ec1285dca349dd95b122d8c70715f4e2265bc015ee4fb8a8bece86717e3d12
**Published:** 2026 (Version 01)
**Type:** Interactive framework document (Skool asset)

## Key Frameworks and Patterns

### Layer 1: Mindset (The Brain -- How to Think)

- **The Default Shift.** Before doing any task the old way, ask: "How could AI do this -- or at least 30% of it?" It is never binary. The real question is always "to what extent can AI be leveraged here?" AI is better than you think and improving faster than you think. If AI can't do something today, try again next month.
- **The Function Breakdown.** Your role is a set of functions. Each breaks into tiny tasks. Automate one piece at a time. One small task per day for six months = hundreds of automated tasks. The compounding is real.
- **The Curiosity Rule.** Never accept AI output without asking why. Treat AI as a mentor, not a vending machine. The vending machine approach gives you output. The mentor approach gives you understanding. This is the antidote to "dark code" -- automations you don't understand become liabilities, not assets.

### Layer 2: Method (The Lens -- How to Decide)

Five-step decision pipeline: Find Constraint -> EAD -> Map Process -> Autonomy Level -> Tie to KPI.

- **Find the Constraint.** Two power questions: (1) "If 500 new clients showed up tomorrow, what would break first?" (finds bottlenecks). (2) "What would give you 500 more clients tomorrow?" (finds growth levers).
- **EAD (Eliminate, Automate, Delegate).** In that order. Eliminate first: "What happens if we just stop doing this?" Don't automate waste. Automate second: apply the 60/30/10 rule. Delegate third: not everything should be automated.
- **The 60/30/10 Golden Rule.** ~60% fully automated (no human touch). ~30% AI-assisted (AI does the work, human reviews). ~10% stays manual (too nuanced or too risky). This ratio normalizes expectations. If someone promises 100% automation on anything meaningful, they're selling you something.
- **Map the Process.** Five elements on paper before touching any tool: Trigger, Sources, Transforms, Decisions, Destination. If you can't explain it to a person, you can't explain it to an AI.
- **Autonomy Spectrum (L0-L4).** Manual -> Suggested -> Drafted -> Supervised -> Autonomous. Default to the lowest level that works. Deterministic beats non-deterministic. Workflows beat agents. If a decision doesn't HAVE to be made by AI, don't let AI make it.
- **Tie to KPI.** Three buckets: More Customers, More Value, Less Cost. If your automation doesn't move a number, why are you building it? "Because it's cool" isn't a business case.

### Layer 3: Machine (The Hands -- How to Build and Operate)

**Build:**
- **The Lego Principle.** Smallest possible blocks. One input, one output. Start with zero-AI deterministic steps first, then layer in AI where actually needed.
- **The Assembly Line.** Each AI step does one specialized job. No generalists. Easier to debug, swap models, adjust prompts.
- **The Validation Chain.** Validate each step's output before chaining to the next. Do NOT build the whole pipeline then test end-to-end.
- **The Iteration Mindset.** Deterministic scripts can be finished. AI steps are always evolving. Ship the POC. Perfectionism is the enemy of deployment.

**Operate:**
- **The Bike Method.** Roll out in phases: Training Wheels (manual, watch everything) -> Guided (AI runs, you check every output) -> Watched (AI runs autonomously, you spot-check) -> Hands-Off (full confidence, review monthly). Use confidence thresholds: high auto-sends, medium goes to draft queue, low escalates to human.
- **The Intern Rule.** Own identity. Scoped permissions. Full audit trail. Never impersonates you. You wouldn't hand an intern your personal bank login.
- **The Kill Switch.** If it costs more to maintain than it saves, tear it down. Don't fall into the sunk cost trap. Good operators know when to build AND when to destroy.

### Meta: Cross-Layer Connections

- Function Breakdown (Mindset) <-> Lego Principle (Machine): both are about decomposition, different targets.
- Curiosity Rule (Mindset) <-> Validation Chain (Machine): one is the human habit, the other is its mechanization.
- Autonomy Spectrum (Method) <-> Bike Method (Machine): spectrum defines WHERE, Bike Method defines HOW to get there safely.
- Three Buckets (Method) <-> Kill Switch (Machine): one sets the bar, the other holds the hammer.

### Governing Principles
- "Boring is Beautiful." Predictable is better than clever. Default to the simplest, most deterministic approach.
- "Deterministic != AI." Deterministic steps can be finished. AI steps are always evolving. Set expectations accordingly.
- "Fail Fast, Learn Faster." Get to your first 10 mistakes as safely and quickly as possible. That's where the real learning lives.

## Positions and Opinions

- Workflows beat agents for most business processes. If a decision doesn't HAVE to be made by AI, don't let AI make it.
- 100% automation promises are a red flag. The 60/30/10 ratio normalizes expectations.
- Eliminate before automating. Don't automate waste.
- Tools change every six months. The Three Ms framework is the durable layer.
- Process mapping on paper before touching any tool is non-negotiable.
- Default to the lowest autonomy level that works. Most people jump straight to fully autonomous and that's where things go wrong.

## Relevant Quotes

- "If you can't explain it to a person, you can't explain it to an AI." -- context: Map the Process step
- "Because it's cool isn't a business case." -- context: Tie to KPI step
- "You wouldn't trust someone you just met with your bank account. Don't do it with AI either." -- context: Intern Rule
- "Good operators know when to build AND when to destroy." -- context: Kill Switch
- "Boring is Beautiful." -- context: governing principle

## How This Applies as a Decision Lens

This is Nate's mothership framework. Every business decision about AI adoption should run through the three layers: first check the mindset (are you even asking the right question about AI involvement?), then apply the method (find the constraint, decide eliminate/automate/delegate, map the process, set autonomy level, tie to KPI), then build with the machine principles (small blocks, validation, phased rollout). When evaluating any AI project or automation idea, the Three Ms provide a complete decision pipeline from "should we do this" through "how to build it" to "how to operate it."
