---
source: advisor-bootstrap
advisor: nate-herk
captured: 2026-06-03
url: https://www.youtube.com/watch?v=xxARTGo_Oqg
status: ingested
---

# How to Actually Deliver AI Projects (APIs, Hosting, and Handover)

**URL:** https://www.youtube.com/watch?v=xxARTGo_Oqg
**Published:** 2025-12-27
**Type:** YouTube video (72K+ views)

## Key Frameworks and Patterns

### The Full Delivery Lifecycle
1. Decide where the workflow will live (hosting model)
2. Handle security and data privacy
3. Figure out who owns what with API keys
4. Run testing and QA
5. Execute the handover
6. Close out on legal/billing
7. Decide on ongoing maintenance

### Three Hosting Models (always prefer #1)

1. **Client hosts (recommended).** Each client has their own instance. You work inside it. Client buys their own account, you get invited as a user. Cleanest model. You help them set up but they own and pay for it.

2. **You host for the client.** You run the infrastructure. Gets messy. Billing babysitter role. Avoid unless necessary.

3. **Self-hosted for internal use.** For your own internal automations only (lead routing, content workflows, internal agents).

### API Key Ownership Rule
Clients own their accounts and keys from the start. Don't run everything under your own billing and invoice them later. Token usage is impossible to estimate perfectly. Clients want predictable costs. Separate ownership makes handover easier, maintenance easier, and keeps you out of billing management.

### QA Process
- Internal testing week followed by client testing week before launch.
- For autonomous/conversational systems, QA is intense: tone, memory, tool calls, client-facing behavior all need checking.
- Lots of back-and-forth and tweaks are completely normal, especially with system prompts.
- Capture baseline data to show impact. Creates case studies for future prospects.

### Scope Protection During Delivery
When the client asks for bigger features during QA (and they will), protect the scope. Tell them which requests fit v1 and which get backlogged for a future phase. After v1 is accepted, scope a new project around the extras.

### Handover Best Practices
- Connected tools (CRM, calendar, email, data sources) during kickoff call.
- Used own credentials for testing, then swapped to client's at handover.
- Provided documentation and training.
- Set expectations for what happens post-launch.

## Positions and Opinions

- Client hosting is always the cleanest and most scalable model. It keeps you compliant and out of the billing babysitter role.
- Don't try to make it easy by running everything under your billing. It sounds nice but gets messy fast.
- QA for autonomous AI systems is legitimately intense. Plan for it.
- Scope protection is super important. Most unpaid work comes from not defining v1 boundaries clearly.
- Every project should include documentation, enablement, and training. Not just the build.
- The handover process should be planned from the kickoff, not figured out at the end.

## Relevant Quotes

- "Clients want predictable costs, and token usage is impossible to estimate perfectly." -- context: why clients should own their API keys
- "Scope protection is super important to make sure that we're not adding in all the stuff that you're not getting paid for." -- context: feature requests during QA
- "It's so much cleaner and simpler and way more scalable if they own those accounts and their keys from the start." -- context: API key ownership

## How This Applies as a Decision Lens

When structuring how BGD delivers AI services to clients, this framework provides the operational playbook. Key decisions: who hosts what, who owns the API keys, how QA works, how to handle scope creep, and what the handover looks like. The client-hosts-everything model is the default recommendation. Especially relevant for the Jon Liebl partnership -- any AI services sold through Jon need a clean delivery process that doesn't create billing or maintenance headaches for BGD.
