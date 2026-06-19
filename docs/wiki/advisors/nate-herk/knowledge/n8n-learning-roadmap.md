---
source: add-board-member
advisor: nate-herk
captured: 2026-06-06
url: https://www.youtube.com/watch?v=Fqeo8q8-nJg
status: ingested
---

# How I'd Learn n8n if I Had to Start Over in 2026

**URL:** https://www.youtube.com/watch?v=Fqeo8q8-nJg
**Published:** 2025-12-10
**Type:** YouTube monologue (14:17)
**Views:** 267K

## Key Frameworks and Patterns

### The Three Layers of Automation (Learning Progression)

1. **Workflows (Start here).** Rule-based, predictable, boring in the best way. Classic business process automation. McKinsey data: standard workflow automation alone delivers 30-200% ROI in year 1, with 25-40% labor cost savings. Most small businesses still do not have basic automations. You could build a solid business as an "efficiency agency" without ever touching AI.
2. **AI Automations (Second step).** Predictable workflows with intelligence sprinkled in. AI at the end to personalize an email, AI at the beginning to score tickets. Small controlled decisions inside a larger rule-based workflow. McKinsey estimates ~50% of work activities can be automated without AI at all.
3. **AI Agents (Top layer).** Make decisions, reference memory, use tools, adjust on context. Much harder to control, higher likelihood of breaking. People jump straight here and that's where they get confused, break things, and quit.

### The Transition Curve

Five-stage emotional cycle when learning something new:
1. **Uninformed Optimist** (up) -- see the opportunity, get excited
2. **Informed Pessimist** (down) -- understand the complexity, feel overwhelmed
3. **Crisis of Meaning** (bottom) -- decision point
4. **Crash and Burn** (one path) -- quit
5. **Informed Optimist** (other path) -- push through with momentum

This is not a one-time thing. Nate says he hit the informed pessimist stage about 17 times in his first 12 months. Knowing the cycle makes it easier to push through.

### Four Core Skills to Learn (in order)

1. **JSON and data types.** The language of automation. Just key-value pairs, not real code. Once you can read and navigate JSON, you stop guessing.
2. **APIs and HTTP requests.** The most important skill in automation. Native integrations (Gmail, Slack, HubSpot nodes) are just pre-built HTTP requests with a cleaner UI. Understanding HTTP requests unlocks any platform n8n doesn't natively support. Pro tip: feed API docs to Claude and it will set up any request.
3. **Webhooks.** Flip the flow. Instead of n8n reaching out, the other tool reaches out to n8n. Enables real-time event-driven triggers.
4. **Logic and error handling.** If nodes, loops, data routing, workflow error behavior. This makes workflows stable, predictable, safe.

### Context Engineering (vs Prompt Engineering)

- Prompt engineering = telling the model what to do
- Context engineering = giving the model the information it needs to know how to think
- Analogy: A system prompt is studying the night before an exam (rules, tone, structure). Good context is having a cheat sheet during the exam (exact details at the exact moment). Best results come from doing both.
- "The model is not magic. It's not a mind reader. It's only as good as the context you give it."

### Four Pillars for Judging Worth-Automating

A process must check at least two of: **Repetitive, Time-consuming, Error-prone, Scalable.** Best automations hit all four.

Key distinction: Build systems that run while you sleep, not systems that sit waiting for you to click a button. Event-driven (new lead, new payment, new email) beats on-demand (personal assistant you have to talk to). That is where you get leverage.

### The Flywheel Effect

When you design a system that saves time AND grows the business, the growth means the system gets used more, which creates an endless flywheel of exponentially scaling ROI.

### Process Engineering Mindset

Before opening n8n, map the process on paper. Questions to answer: Who does what? When does it happen? What triggers this? Where is data coming from? What do we do with it? What is the final outcome?

"If you can't explain a process clearly on paper, there's no way you can automate it clearly."

Lincoln paraphrase: "If I had 6 hours to chop down a tree, I'd spend the first 4 sharpening the axe."

### Testing and MVPs

- First version will always break. That is normal.
- Build POCs (proof of concepts) and MVPs (minimum viable products) to get something working, even if imperfect.
- Try to break your own workflows on purpose. Push edge cases. The more weaknesses found early, the stronger the final system.
- Every workflow needs an audit log on every execution. Feed into Google Sheet or Airtable to find patterns in failures.

### The 90/15 Rule

About 90% of all workflows rely on the same ~15 core nodes. Most errors fall into the same handful of categories. Once you master those, you can build almost anything with confidence.

### Escaping Tutorial Hell

You cannot learn automation by watching someone click buttons. Follow the tutorial, then rebuild yourself. Break things, debug, try variations. Automation becomes pattern recognition -- when errors pop up again, you know exactly where to look.

### Selling in ROI Terms

Clients care about three things: time saved, money saved, better quality work. Not JSON, nodes, or how clever the workflow is. Your job is to communicate business impact: what time it saves, what labor cost it removes, what errors it reduces, what scale it unlocks.

After going live, track: how often it runs, how much time it saves, what outcomes it produces. After a few months, show real numbers. That builds trust, earns long-term relationships, and creates case studies for new business.

## Positions and Opinions

- Do NOT start with AI agents. Start with workflows. Learn automation fundamentals first.
- The building method matters less than the thinking method. Tools change; process engineering is durable.
- Most people quit during the "informed pessimist" dip. Knowing the cycle exists is the single best defense.
- HTTP requests are the most important skill in automation, more than any specific node.
- Event-driven automations create more leverage than on-demand assistants.
- Track everything. If you're not tracking, you're missing out on new business and case studies.

## Relevant Quotes

- "You cannot build good agents if you don't understand how workflows actually function. That's essentially trying to run before you can walk." -- context: learning progression
- "The model is not magic. It's not a mind reader. It's only as good as the context you give it." -- context: context engineering
- "If you can't explain a process clearly on paper, there's no way you can automate it clearly." -- context: process mapping
- "Your job is not only to build systems that work. Your job is to also communicate the value clearly and prove the value over time." -- context: selling automation

## How This Applies as a Decision Lens

When evaluating what to learn or build next, follow this progression: workflows first, then AI-assisted workflows, then agents. When evaluating whether something is worth automating, check the four pillars. When building, always map on paper first, build the MVP, then iterate. When selling, speak in ROI -- time, money, quality -- never in tech jargon.
