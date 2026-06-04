---
source: add-board-member
advisor: nate-herk
captured: 2026-06-03
url: https://www.youtube.com/watch?v=Svp7fbF0g2I
status: ingested
---

# Lessons From Building 500+ AI Agents

**URL:** https://www.youtube.com/watch?v=Svp7fbF0g2I
**Published:** 2025-06-22
**Type:** YouTube interview
**Host:** David Ondrej
**Length:** 54:34

## Key Frameworks and Patterns

### The Multi-Agent Sales Team Pattern

The centerpiece demo is a multi-agent outreach workflow built in n8n:

- **Writer agent** — receives lead form data (name, email, intent, budget, company, project description, timeline), calls a "project database" tool to pull relevant past work, then writes a personalized outreach email
- **Human-in-the-loop gate** — email is never sent automatically; it goes to the operator's inbox (Gmail, Slack, Discord, Telegram — swappable) for approval or feedback
- **Revision agent** — takes the operator's written feedback, revises the most recent email draft (not the original), and sends back for re-approval
- **Set node as source of truth** — a persistent variable always holds the most recent email version, enabling unlimited revision cycles without losing track of which draft to revise next

Architecture principle: each agent has a clear role and a defined end goal in its system message. The writer agent is told "you are an expert salesperson; your goal is to get this person to book a call." Goal-definition shapes how the agent tailors every output.

### Linear vs. Agentic Complexity

Nate explicitly distinguishes two levels of n8n builds:

- **Linear workflows** — sequential nodes with no branching agent decisions. Lower complexity. Where beginners should start. This sales-team workflow is linear despite involving multiple AI agents.
- **Agentic tool-calling systems** — agents that autonomously decide which tools to invoke, in what order, with branching paths. Higher complexity. Where most beginners get stuck.

His recommendation: start linear. Agentic tool calling is where the real complexity lives. Master the foundational nodes before layering in autonomous decision-making.

### Human-in-the-Loop as the Product Feature

Human approval is not a concession to the technology's limitations — it is the product. The value proposition is: "The AI drafts, you steer." This maps to Nate's broader view that the near-term future (pre-AGI/ASI) is human + AI, not full automation. Building workflows where humans remain in the decision seat is the right posture for production systems right now.

### Tool Agnosticism and the Mastery Principle

Nate's position on the n8n vs. Make vs. other-tools debate: become tool-agnostic by mastering one tool deeply. Analogy: learning ten programming languages at surface level won't land a job; mastering one will. If a better tool emerges, deep foundational skill transfers. The same principle applies to AI automation platforms.

### Modular, Swappable Architecture

Every component in a workflow should be mentally framed as swappable:

- Trigger: Airtable today, Slack or WhatsApp tomorrow
- Approval channel: Gmail today, Discord or Telegram tomorrow
- AI model: Claude 3.5 Sonnet for copy, OpenAI for tool use — pick the right model for the job

Templates from the n8n library are starting points, not finished products. "Switch out a few things and you're already 80% of the way there." The skill is knowing which pieces to swap and why.

### Model Selection by Task Type

Nate uses Claude 3.5 Sonnet for copywriting and email revision. His reasoning: GPT-written output is increasingly recognizable to readers — certain phrases ("keen," long em-dashes) are fingerprints. Claude's writing voice is less identifiable, which makes outreach feel more human. For tool-use-heavy steps, he's open to OpenAI models. The principle: match the model to the task's primary requirement.

### Background / Origin Story

Nate's path into n8n came from a no-code/low-code automation background, not formal software engineering. His day job out of college was automation. The pain point he kept hitting: human approval steps were clunky and manual in legacy tools. n8n's native human-in-the-loop node solved the problem he'd been hacking around for years. That specific frustration became his entry point into AI-native automation.

## Positions and Opinions

- Most people are forcing AI agents into processes that don't need them. A simpler AI workflow is cheaper, more reliable, and easier to maintain.
- The near-term future is "AI + humans," not full automation. Until AGI/ASI, the right design is humans steering AI, not AI running solo.
- Most processes are deterministic. Deterministic processes should use workflows, not agents. Reserve agents for the steps where genuine reasoning or decision-branching is required.
- Beginners get in trouble by jumping to agentic tool-calling before they understand linear node execution. Learn linear first.
- Mastery of one tool beats shallow familiarity with ten. Foundational skills transfer when the tools change.
- Claude writes better copy than GPT for outreach — the output is less recognizable as AI-generated. GPT has "tell" phrases that readers are starting to spot.
- n8n templates are not copy-paste solutions. They're starting points that require prompt customization and trigger swaps for each specific business.
- Production AI agents should still be rare. Most "agent" use cases are actually workflow use cases.

## Relevant Quotes

> "The purpose of this flow is that whenever you have some sort of trigger — whether that's a lead form submission or whatever — the agent will write the initial copy, but it's not going to actually send it to that lead until you've said it's good to go 100%."
— Explaining the human-in-the-loop gate in the sales agent workflow

> "AI agents plus humans — that really is the next few years, you know, until AGI, until ASI. It's not like only human or only AI. Stuff like this, where you still give your input, you steer the AI — I think this is the way."
— On the near-term human+AI model

> "People kind of know what GPT models feel like. I think people can spot a GPT-written email way faster than a Claude-written one."
— On model selection for copywriting; notes specific GPT tells like "keen" and long em-dashes

> "If you learn a little bit of ten different languages, you probably won't be able to land a job. But if you master one language — doesn't really matter which one — there are going to be six-figure positions for that language. Mastery is way more important than choosing the tool."
— On tool agnosticism and the principle of depth over breadth

> "When beginners hop into n8n, a lot of the troubles come with doing all these agentic tool callings, multi-agent systems. [This workflow] is super linear — it's the only workflow. So it's really not too tough."
— On why starting linear is the right beginner path

## How This Applies as a Decision Lens

When evaluating any new automation or agent project, start with Nate's agent-vs-workflow filter: is this process deterministic or does it require genuine reasoning? Most processes are deterministic — build a linear workflow, not an agent. If an agent is warranted, give it a single clear end goal in the system message, one or two tools, and a human-in-the-loop approval gate before anything consequential leaves the system. For Justin's AI services pivot with Jon, this is the right framing for client pitches: start with a linear workflow that keeps the human in the seat, demonstrate measurable value, then introduce more agentic capability as trust builds. The modular-and-swappable architecture principle also maps directly to BrandOS — every integration point (trigger, channel, model) should be designed to swap without rebuilding the core.
