---
source: advisor-bootstrap
advisor: nate-herk
captured: 2026-06-03
url: https://www.youtube.com/watch?v=0WDkwMxj13s
status: ingested
---

# The Four Cs of an AIOS -- Context, Connections, Capabilities, Cadence

**URL:** https://www.youtube.com/watch?v=0WDkwMxj13s
**Published:** 2026-05-29
**Type:** YouTube video (Claude Opus 4.8 AIOS walkthrough)

## Key Frameworks and Patterns

### The Four Cs (build in order -- each layer depends on the previous)

1. **Context.** The AIOS knows your business. Test: open a fresh session and ask "What does this business do and who works here?" If it answers like a stranger, you have zero context. Start there.

2. **Connections.** The AIOS reaches your data. Think about your week: where do you go to look for things? Seven tier-one domains to map: Revenue, Customer, Calendar, Comms, Tasks, Meetings, Knowledge. Every tool needs an API key, MCP, or CLI bridge.

3. **Capabilities.** The AIOS knows how to do the work. Skills are reusable SOPs. A short phrase triggers a multi-step workflow that produces an artifact. Skills can be as simple as "have you typed this prompt before and don't want to type it again?"

4. **Cadence.** The AIOS runs without being asked. Laptop closed. A brief lands in the inbox. This is where it becomes a 24/7 employee. Don't automate workflows that don't work manually yet.

### Dependency Graph
Context is non-skippable. Connections + Capabilities can build in parallel. Cadence is last. You can't have cadence without connections. You can't have capability without context.

### The AIOS Litmus Test
"While you're not at your desk, your AIOS observes one real-world event and produces an output that's faster and more accurate than what you'd produce yourself."

### Three Success Indicators (not KPIs -- lived experiences)
1. **Team-reaches-out.** A teammate messages you, but you realize your AIOS would answer better and faster. You stop being a bottleneck for your own knowledge.
2. **Context-switching reduction.** You stop opening new tabs. Your first move is to ask the AIOS. The default surface for thought work shifts.
3. **Knowledge-leaves-your-head.** You stop trying to remember business facts. The AIOS holds the truth, you hold the questions.

### Connection Strategy
- Prefer API endpoints over MCP servers. MCPs load every endpoint whether you need it or not, eating tokens. Tell Claude to research the docs once, save as markdown reference, and pull from that file when needed.
- Separate API accounts per agent/service. Don't give Claude your personal key with full permissions.
- Store keys in .env, never in chat.
- Default to lowest permissions, escalate only after trust is built.

### Skills Architecture
- Skills are reusable SOPs: a folder with a skill.md containing YAML front matter + step-by-step instructions.
- Progressive context loading: Level 1 scans front matter (~100 tokens/skill), Level 2 loads full skill.md, Level 3 pulls reference files only when needed.
- Keep skill.md under 500 lines. Reference docs should be separate.
- Six-step skill-building framework: Name/trigger, Goal in one sentence, Step-by-step process, Reference files, Rules/guardrails, Improvement loop.
- Project-level skills (.claude/skills/) vs Global skills (~/.claude/skills/).

### Cadence Options
- Cloud Routines: Anthropic infrastructure, laptop can be off. Runs from cloned GitHub repo (no local file access). Stateless.
- Local Scheduled Tasks: run on your machine, need app open.
- Loop: one-off recurring runs inside a session, 3-day expiry.

## Positions and Opinions

- The "Default Shift" mindset: try to do everything from Claude Code first, before opening Chrome or other apps. Once you have that mindset shift, it's very powerful.
- AI isn't about benchmarks. Who cares about Opus 4.8 benchmarks. What matters is the operating system you build on top.
- Productivity isn't how many hours you worked. It's whether you actually moved the needle closer to your goal.
- Personal AIOS is the foundation for company AI-readiness. Once these indicators show up for one person, the same architecture powers everything else.
- The AIOS is a mentor, not a chatbot. When you have doubt, your brain defaults to what's comfortable. The AIOS should push you past that.

## Relevant Quotes

- "AI isn't king. Who cares? Opus 4.8 benchmarks. Who cares?" -- context: arguing the OS matters more than the model
- "Productivity isn't how many hours did I work today. Productivity is did I actually move the needle closer to my goal." -- context: avoiding tool overwhelm
- "Think of your AI operating system as a mentor rather than just a chatbot." -- context: how to interact with AIOS
- "While you're not at your desk, your AIOS observes one real-world event and produces an output that's faster and more accurate than what you'd produce yourself." -- context: the AIOS litmus test

## How This Applies as a Decision Lens

The Four Cs provide a diagnostic framework for evaluating how mature any AI operating system is. When advising on AIOS development, check: Does it have context (knows the business)? Does it have connections (reaches live data)? Does it have capabilities (can execute workflows)? Does it have cadence (runs autonomously)? The dependency order matters -- don't jump to cadence before the foundation layers are solid. Also useful for evaluating what to build next: which C is weakest?
