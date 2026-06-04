---
source: add-board-member
advisor: nate-herk
captured: 2026-06-03
url: https://www.linkedin.com/posts/nateherkelman_were-all-using-ai-agents-wrong-ai-agents-activity-7311384693608759296-heEk
status: ingested
---

# Workflows Over Agents: Why Most Processes Don't Need an AI Agent

**URL:** https://www.linkedin.com/posts/nateherkelman_were-all-using-ai-agents-wrong-ai-agents-activity-7311384693608759296-heEk
**Published:** March 2025
**Type:** LinkedIn post (companion to YouTube: "AI Agents: What 99% of Beginners Get Wrong," ~13 min)

> **Retrieval note:** LinkedIn post text was partially recovered via indexed page fragments. The companion YouTube video and a third-party summary (machinebrain.org, March 27 2025) fill structural gaps. Direct quotes are sourced from the recovered post text only.

## Key Frameworks and Patterns

### The Deterministic Test
The central decision filter: is the process deterministic? If each step follows a predefined sequence with predictable outcomes, a workflow is almost always the better choice. Agents are appropriate when the process requires dynamic judgment — when the path through the task cannot be fully specified in advance. Most business processes do not meet that bar.

The test in practice:
- Can you write down every step and its expected output? Use a workflow.
- Does the process branch unpredictably based on real-time conditions or ambiguous inputs? Consider an agent.
- Are you using an agent because it feels more powerful or impressive? That is the mistake.

### Why Workflows Win for Deterministic Processes
The LinkedIn post lists these as the reasons workflows are (usually) the better choice:
- **Reliability and Consistency** — workflows execute the same path every time; agents can hallucinate, skip steps, or take unexpected detours
- **Cost Efficiency** — workflows call the LLM only where needed; agents run the model continuously to decide what to do next, burning tokens on decisions that weren't necessary
- **Simpler to build and maintain** — no prompt engineering for tool selection, no debugging agent reasoning loops
- **Easier to scale** — deterministic paths are predictable under load; agent behavior can drift

### Case Studies Demonstrated in the Companion Video
1. **Customer support agent vs. customer support AI workflow** — the workflow version delivered more control, consistency, and lower cost for the same outcome. The agent version introduced unnecessary decision-making overhead on a process that had clear, fixed paths.
2. **Technical analyst workflow via Telegram** — demonstrated that even a moderately complex analytical task (pulling data, running analysis, returning output) was cleaner and more reliable as a structured workflow than as an agent making tool-selection decisions at runtime.

### The "Overkill" Trap
Nate's framing: the AI community defaults to agents because agents feel more sophisticated. This leads to using agents for processes that are, in reality, just structured data pipelines. The penalty is higher token cost, harder debugging, and more failure points — with no benefit because the process never needed dynamic reasoning in the first place.

## Positions and Opinions

- Most processes are deterministic. Start with that assumption, not the opposite.
- "Boring is beautiful" — a workflow that runs the same way every time is a feature, not a limitation.
- Using an agent for a deterministic process doesn't make it smarter; it makes it more expensive and less reliable.
- The right question before building is not "should this be an agent?" but "does this actually require dynamic decision-making?"
- Agents have a real role — but that role is narrower than the community assumes. Don't reach for agents by default.
- Workflows are easier to hand off to clients because behavior is predictable and explainable.

## Relevant Quotes

> "We're All Using AI Agents Wrong. AI agents are super powerful, but there is a time and a place. Like many others, I've been guilty of forcing AI agents into workflows where they're unnecessary — or outright overkill."

> "The reality is that most processes are deterministic — each step follows a predefined sequence with predictable outcomes. This is where AI workflows can do the job cheaper, more reliably, and at scale."

> "So why let an AI agent make decisions when the process already follows a clear, predefined path? All this does is increase the chances of mistakes."

> "If your process is deterministic, predictable, and follows a set of structured steps, then an AI workflow is almost always the better option." *(from Nate's Skool community post summarizing the video)*

## How This Applies as a Decision Lens

Before scoping any automation for a BGD client, run the deterministic test first. The question is not "could an agent do this?" — everything above a certain complexity threshold can be framed as an agent task — but "does this process require real-time dynamic judgment, or does it follow a path that can be written down?" For the overwhelming majority of client pain points (lead response, document processing, follow-up sequences, reporting), the answer is the latter. Build a workflow. It will be cheaper to run, easier to explain to the client, faster to debug when something breaks, and more reliable in production. Reserve agents for the genuinely ambiguous cases: tasks where the next step depends on information that cannot be anticipated at build time. This framework also shapes how to pitch AI work to clients — "I'll automate this so it runs the same way every time" is a stronger value proposition than "I'll build an agent to figure it out," because clients don't want their business processes improvised.
