---
source: add-board-member
advisor: nate-herk
captured: 2026-06-03
url: https://www.youtube.com/watch?v=kmwWSBJGewM
status: ingested
---

# Agents vs. Workflows: What 99% of Beginners Get Wrong

**URL:** https://www.youtube.com/watch?v=kmwWSBJGewM
**Published:** March 2025
**Type:** YouTube video

> Note: The URL above (kmwWSBJGewM) points to a video by Akshat Bahety covering the same n8n agent vs workflow distinction. Nate Herk's canonical take on this topic is in his own video "AI Agents: What 99% of Beginners Get Wrong" (https://www.youtube.com/watch?v=HuTyZiUDz2k, published March 27, 2025). The knowledge below synthesizes both, with Nate's framing as the primary lens.

## Key Frameworks and Patterns

### The Core Distinction: Predefined Path vs. Dynamic Routing

A **workflow** follows a predefined, linear sequence of steps. You design the path ahead of time — every time a trigger fires, the same steps execute in the same order. There is no flexibility.

An **AI agent** has no predefined path. It has access to a set of tools and decides at runtime which tools to call, in what order, and how many times — based on user input and intermediate results. The path is dynamic.

The single most important question: "Does this process have a defined, deterministic sequence of steps?"
- Yes → build a workflow.
- No → build an agent.

### The "Forcing" Anti-Pattern

Nate's explicit position: most people are forcing AI agents into processes that don't need them. This is a mistake. Simple automations (send email → log to sheet → reply) do not require an agent. Building an agent for a deterministic process makes the system more expensive, less consistent, and harder to debug.

"Most people are using them when they don't need to. If your process is deterministic, predictable, and follows a set of structured steps, then an AI workflow is almost always the better option."

### The AI Systems Pyramid (from Nate's December 2025 video)

Four-layer hierarchy for deciding what to build, from lowest to highest complexity:

1. **Custom GPTs / Chat interfaces** — Foundation layer. No automation, no external tools. Just prompt + model.
2. **Simple workflow automations (no AI)** — Trigger → action chains. Zero LLM calls. Cheap and reliable.
3. **AI workflows** — Workflows with LLM calls at specific nodes (e.g., classify this email, summarize this document). Still linear, still deterministic in structure.
4. **Full AI agents** — LLM is the router. It decides which tools to call. Non-linear. Use only when the problem genuinely requires dynamic decision-making.

As you move up the pyramid: complexity increases, cost increases, failure surface increases.

### Tools Are the Defining Feature of Agents

An agent's power comes from tools — external capabilities the LLM can invoke. In n8n, this is literally implemented as a "tools" input to the AI Agent node. Examples: read email, send email, add label, search web, call a sub-workflow.

Without tools, a model is just a text-in/text-out transformer. Tools are what enable agents to interact with the world outside the model.

### Agents + Workflows: Not Either/Or

Both Nate and Akshat Bahety converge on this: the real answer is **agents plus workflows, not agents versus workflows**.

Complex real-world solutions include:
- A top-level agent that routes between tools
- Individual workflows (sub-workflows) called as tools by the agent
- Some fully deterministic branches (workflows) for processes that require a fixed sequence (e.g., a payment flow)

The pattern: agent handles dynamic routing; workflows handle fixed, auditable sequences. Abstract your deterministic steps into reusable sub-workflows that the agent can invoke as tools.

### When to Use Each (Decision Criteria)

| Use a Workflow | Use an Agent |
|---|---|
| Fixed, repeatable steps | Requires runtime decision-making |
| Cheaper to run | Path varies by input or intermediate output |
| Easier to debug | Needs to choose among multiple tools |
| Auditable, consistent output | Adapts to changing circumstances |
| Sending money, compliance steps | Email triage, research, multi-step reasoning |

## Positions and Opinions

- Agents are massively overused. Most "agents" people build should be workflows.
- A simple AI workflow is easier to build, more cost-effective, and more reliable than an agent for deterministic tasks.
- "Agents vs. workflows" is a false framing — the answer is almost always a combination.
- Admitting he was guilty of the same mistake: "Admittedly, myself included. I've been running an agency delivering AI solutions to clients, and I've caught myself building agents where a workflow would have been better."
- The industry hype around agents creates a bias to over-engineer. Resist it.
- You should be able to articulate *why* a process needs an agent. If you can't, it probably doesn't.

## Relevant Quotes

- "Everyone is talking about AI agents right now, but the truth is most people are using them completely wrong, and admittedly, myself included." — Nate Herk, March 2025

- "A simple AI workflow is not only going to be easier to build, it's going to be more cost-effective, and also more reliable in the long run." — Nate Herk

- "It's not agents versus workflows. It's agents plus workflows. You can't debate that." — Akshat Bahety (same topic, same month)

- "An agent will always have access to tools and will not have a predefined path. That's what makes them fundamentally different from a workflow." — Akshat Bahety

- "If you're sending someone money, there is a process. You need that person's bank account details, you need to check your balance, and then send. There is a defined process. There's nothing new that's going to be changing. That's a workflow, not an agent." — Akshat Bahety

## How This Applies as a Decision Lens

Before scoping any automation build for a client, ask: "Does this process need to make decisions, or does it just need to execute steps?" For BGD's AI services work — email triage, document processing, lead qualification, deployment pipelines — the majority of valuable automations are structured enough to be workflows, or hybrid systems where a thin agent layer routes to well-defined workflow tools. Defaulting to agents for everything drives up token costs, makes debugging harder, and creates reliability problems that erode client trust. The framing to use with clients: workflows deliver consistency and auditability; agents deliver flexibility. Start with the simplest thing that works. Escalate to agents only when the routing problem genuinely can't be hardcoded.
