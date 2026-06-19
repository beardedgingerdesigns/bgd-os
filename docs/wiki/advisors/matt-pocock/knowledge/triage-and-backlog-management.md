---
source: add-board-member
advisor: matt-pocock
captured: 2026-06-06
url: https://www.aihero.dev/burn-through-your-backlog-with-my-triage-skill
status: ingested
---

# Triage: Turn Backlog Mess Into Agent-Ready Work

**URL:** https://www.aihero.dev/burn-through-your-backlog-with-my-triage-skill
**Published:** 2026-05-05 (AI Hero)
**Type:** Blog post with walkthrough

## Key Frameworks and Patterns

### The Team-Scale Gap
- **Most skill-based setups work great for solo developers.** But when you move into teams, or start building for other people, everything changes.
- **Team-scale challenges:** Triage other people's ideas, determine if something is a bug report, decide if you need to reproduce it, figure out if it's worth building.
- **This is the first Matt Pocock content explicitly addressing team/multi-person workflows.**

### State Machine Approach to Backlog
- **Two category roles:** `bug` (something is broken) and `enhancement` (new feature or improvement).
- **Five state roles that track lifecycle:**
  - `needs-triage` -- Requires a maintainer to review
  - `needs-info` -- Waiting on the reporter for more information
  - `ready-for-agent` -- Fully specified and ready to be implemented by an AI agent
  - `ready-for-human` -- Needs a human to implement it
  - `wontfix` -- Not going to be actioned
- **Proper state machine:** Every triaged issue carries exactly one category role and one state role. Can't have "ready for human" and "needs triage" at the same time.
- **The `ready-for-agent` state is the key innovation.** It explicitly separates work that an AI can pick up from work requiring human judgment.

### Usage Patterns
- Triage a specific issue
- Triage the entire backlog and show only items needing attention
- Move a specific issue to a new state
- Create an agent brief for tasks moving to `ready-for-agent`

### Out-of-Scope Files
- **`.out-of-scope` directory in the repo** contains architectural decision records for features not being implemented.
- **The agent checks these before triaging enhancements.** If an issue matches something already decided against, the agent can close it immediately.
- **Prevents scope creep through documented negative decisions.** Saying "we won't build X" is as valuable as saying "we will build X."

### Bug Diagnosis Workflow
- When triaging a bug, don't just trust the reporter. Have the agent reproduce and diagnose it.
- The /diagnose skill uses the same pattern as TDD: create the regression test first, then fix the bug within that feedback loop.
- **Context budget awareness:** Check token usage before deciding to diagnose inline vs. hand off.

### End-to-End Triage-to-Fix
- Agent labels issues with categories and states
- Agent checks out-of-scope files to auto-close invalid requests
- For bugs: reproduce, diagnose, create regression test, fix, push, close issue
- For enhancements: assess scope, create agent brief if `ready-for-agent`, or mark `ready-for-human`

## Positions and Opinions
- The /triage skill is designed for GitHub issues but works with Jira or any backlog system.
- A state machine encoded in labels is the right abstraction for backlog management. It's deterministic, visible, and forces clear status.
- The `ready-for-agent` vs `ready-for-human` distinction is critical. Not all work should be delegated to AI.
- Out-of-scope documentation prevents the same rejected features from being re-proposed.
- Always reproduce bugs before marking them ready. Don't trust reporters blindly.
- Triage is the bridge between team input and autonomous agent execution.

## Relevant Quotes
- "Most skill-based setups work great for solo developers. But when you move into teams, or start building for other people, everything changes."
- "You need to triage other people's ideas. Figure out if they're worth building."
- "This is a proper state machine. Every triaged issue carries exactly one category role and one state role."

## How This Applies as a Decision Lens
When managing any backlog (personal or team): is there a clear state machine defining what's triaged, what's waiting for info, and critically, what's ready for an AI agent vs. what needs a human? The out-of-scope pattern is broadly applicable -- documenting what you will NOT build prevents recurring scope creep. For BGD: the `ready-for-agent` concept maps directly to deciding which client tasks can be delegated to AI workflows vs. which need Justin's direct involvement. The triage state machine could structure the project tracker that's currently missing.
