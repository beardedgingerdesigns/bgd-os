---
source: add-board-member
advisor: nate-herk
captured: 2026-06-06
url: https://www.youtube.com/watch?v=ZeJXI2MAhj0
status: ingested
---

# Stop Learning n8n in 2026 -- Learn Agentic Workflows Instead

**URL:** https://www.youtube.com/watch?v=ZeJXI2MAhj0
**Published:** 2026-03-21
**Type:** YouTube monologue (18:37)
**Views:** 270K

## Key Frameworks and Patterns

### The Three Waves of AI Automation

1. **Wave 1: AI Chatbots (Nov 2022-2023).** ChatGPT. Conversational AI hit the scene. People bolted chatbots onto everything -- websites, support. Exciting but mostly conversational. Not really doing work for you.
2. **Wave 2: AI + Automation Platforms (2023-2025).** Combining AI brains with platforms like n8n. Real tools, real APIs, real workflows. Classify tickets, personalize emails, summarize documents. Full AI agents that made decisions, referenced memory, used tools. This is where most real value has been delivered. Still incredibly powerful today. But you were still the one building everything -- dragging nodes, configuring API calls, mapping variables, debugging errors. The ceiling was how long it took you to build.
3. **Wave 3: Agentic Workflows (2026+).** Natural language becomes the interface. Instead of telling the system HOW to do something step-by-step, you tell it WHAT you want. Describe the destination, the system figures out the route. The same automation that took a full day in n8n can now be described in plain English and running in minutes.

Market data: Agentic AI market was $5B in 2024, projected to hit ~$200B by 2034. 96% of enterprises plan to expand agentic AI usage. By 2028, a third of all enterprise software expected to have agentic AI built in. 50% of enterprises estimated to deploy these systems by 2027.

### n8n Is Not Dead -- It Became the Foundation

Each wave does not kill the previous wave. It is a stepping stone. Chatbots still work. Traditional AI workflows and agents still provide value. But each wave makes you way more productive.

n8n taught you how to think in terms of automation: triggers, actions, data flow, error handling, AI prompting, observability. That knowledge is exactly what matters when directing an agentic system. Your understanding of workflow architecture makes you better at directing Claude Code than someone starting from zero.

"Your job shifts from configuring nodes individually to providing the plan, the direction, and the guardrails, and spotting when the agent gets things wrong. That's a skill that only comes from experience."

### Four Gotchas of Agentic Workflows

1. **Context drift.** The longer you work within a single session, the more the agent forgets earlier instructions. Fix: break work into shorter focused sessions, keep a project summary updated.
2. **Hallucinations.** The agent invents functions, API endpoints, rules that don't exist. Code looks clean but breaks on real data. Fix: always run whatever it builds. Don't take its word for it. Build custom QA sub-agents to review before shipping.
3. **Scoping problems.** Sometimes over-engineers (multi-layered architecture you don't need). Sometimes under-engineers (band-aid fixes instead of root fixes). Fix: be very specific up front, use plan mode, have it ask you questions, set boundaries.
4. **Post-build operations.** n8n has a dashboard with execution data. Code needs error notifications, observability, and version control. The agent can help set all of this up, but you need to ask for it.

### Claude Code + Trigger.dev as New Stack

Nate demonstrates building automations by describing them in natural language to Claude Code, deploying via Trigger.dev. Key advantages:
- Deduplication logic handled automatically (video ID idempotency keys)
- API polling patterns (image generation wait-and-check loops) handled without manual configuration
- Error detection and auto-fix without being told
- Visual component in Trigger.dev for seeing execution steps, comparable to n8n canvas

Live demo: LinkedIn content creator agent built from one prompt -- ClickUp task triggers research, writes LinkedIn post, generates infographic via Key.ai, posts back to ClickUp. Built and running in ~2 minutes.

### The Job Shift

Old job: configure nodes individually, manage each API call, wire data flows by hand.
New job: provide the plan, the direction, and the guardrails. Spot when the agent gets things wrong. Direct the system using your automation knowledge.

## Positions and Opinions

- Drag-and-drop platforms are becoming the old way of building. Agentic workflows are the cutting edge. But n8n is the foundation, not obsolete.
- Workflow architecture knowledge is a competitive advantage in the agentic era. People who understand automation fundamentals direct agentic systems better than those starting from zero.
- Always test what the agent builds. Never trust it blindly.
- Plan mode is essential before building. Have the agent ask questions, set scope.
- Post-build operations (error notifications, observability, version control) are the unsexy but critical part most people skip.

## Relevant Quotes

- "Drag-and-drop platforms are becoming the old way of building, and it's happening faster than anyone expected." -- context: wave 3 transition
- "If you hired a talented developer to build something for you, you wouldn't sit there dictating every line of code. You'd explain the problem, describe the outcome, and say 'What do you need from me?' That's exactly how agentic workflows work." -- context: natural language interface
- "n8n is certainly not dead. It just became the foundation." -- context: the wave progression
- "Your job shifts from configuring nodes individually to providing the plan, the direction, and the guardrails." -- context: new role of the builder

## How This Applies as a Decision Lens

When choosing build methodology: if the automation is well-understood, traditional n8n workflows are still excellent. When building fast, iterating quickly, or handling complex multi-tool orchestration, agentic workflows (Claude Code + Trigger.dev) can compress days into minutes. The decision is not either/or -- workflow architecture knowledge is prerequisite for both approaches. When evaluating claims about tools being "dead": every new wave is a stepping stone, not a replacement. The fundamentals always transfer.
