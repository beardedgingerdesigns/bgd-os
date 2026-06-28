# Day Shift / Night Shift Workflow

**Curated:** 2026-06-28 | **Source:** Matt Pocock video "Building a REAL feature with Claude Code" (2026-03-18), mattpocock/skills repo, session analysis against current AIOS + CE pipeline

The workflow model for how Justin should build features across all projects. Replaces the monolithic `/ship` pipeline with a queue-based handoff between human judgment (day shift) and agent execution (night shift).

---

## The core idea

"I'm doing the day shift — thinking of ideas, grilling with the LLM, turning this into PRDs. And then the LLM takes the night shift." — Matt Pocock

The issue queue is the handoff mechanism between shifts. Not a script, not a pipeline — just GitHub Issues with labels. You stop when the issues are filed. The agent starts when you walk away.

---

## The three shifts

### Day shift (interactive, human judgment)

1. **`/grill-with-docs`** — dictate a rough idea, get grilled for 20-30 min. Agent explores the codebase via sub-agent, challenges your framing, forces precision. Updates `CONTEXT.md` domain glossary and writes ADRs inline as decisions crystallize.

2. **`/to-prd`** — synthesizes the grilling conversation into a PRD. No second interview — just synthesis of what was already discussed. Posts to GitHub Issues. Don't review the prose — LLMs are good at summarizing. Review the scope.

3. **`/to-issues`** — breaks the PRD into vertical-slice GitHub issues with blocking relationships. Each issue is a thin tracer bullet through all layers (schema, API, UI, tests). Review the count and sizing, not the content. Label them `ready-for-agent`.

Then walk away.

### Night shift (AFK, agent execution)

An AFK agent loop (working name: "Ralph loop") that:

1. Queries GitHub for issues labeled `ready-for-agent`, sorted by dependency order
2. Picks the next unblocked issue
3. Spins up an isolated worktree
4. Runs `claude` with the issue body as the prompt
5. Tests pass → commit, push, close issue, grab next
6. Tests fail → label `needs-human`, move on
7. Loop until queue is empty

Key constraints: tests and types must run on every commit (the feedback loop that keeps the agent honest). No human in the loop during night shift.

### Next day shift (QA + bug loop)

1. Walk through a QA plan (generated from the last N commits) in the browser
2. File bugs via whatever is fastest (in-app button, GitHub issue, voice note)
3. Agent picks up bug issues while you continue QAing — parallelized
4. Repeat until done

Post-merge: `/ce-code-review` for what manual QA misses, `/ce-compound` to record what the codebase learned.

---

## What retires

| Old | Why |
|---|---|
| `/ship` | Monolithic pipeline; the issue queue replaces the orchestration |
| `ce-brainstorm` | `/grill-with-docs` is better — builds domain glossary inline |
| `ce-plan` | `/to-prd` + `/to-issues` is lighter and issue-queue native |
| `ce-work` | The AFK agent loop replaces the execution phase |

## What stays (CE back half)

| Skill | Role in new workflow |
|---|---|
| `ce-code-review` | Post-merge review — Matt has no equivalent |
| `ce-compound` | Records what the codebase learned — Matt has no equivalent |
| `ce-simplify-code` | Post-implementation cleanup |
| `ce-debug` | When things break during QA |
| `ce-sessions` | Session history mining, feeds `/retro` |

---

## CONTEXT.md — the ubiquitous language

Each project repo gets a thin `CONTEXT.md` that defines domain terms. Example from Matt's course-video-manager:

- "materialization cascade" instead of "when a lesson inside a section of a course is made real"
- "triage role" instead of "a canonical state-machine label applied to an issue"

Benefits: variables/functions/files named consistently, agent spends fewer tokens thinking, conversations become 5x shorter. `/grill-with-docs` builds and updates this document as a side effect of every grilling session.

This is complementary to CE's `CONCEPTS.md` (which compounds learnings) and the project wiki (which holds deep knowledge). `CONTEXT.md` is just the glossary — the 20 lines that make every future prompt cheaper.

---

## The AFK runner (to build)

The missing piece. Conceptual design:

```
loop:
  issues = gh issue list --label "ready-for-agent" --state open --json number,title,body
  for issue in issues (respecting blocked-by):
    worktree = create isolated git worktree
    result = claude --print "Implement this: {issue.body}" in worktree
    if tests pass:
      commit, push branch, open PR or close issue
    else:
      gh issue edit --add-label "needs-human"
    cleanup worktree
```

Isolation via git worktrees (already available via superpowers skill), not Docker. Can run as a scheduled Claude Desktop task, a cron job, or a manual `/nightshift` kick.

---

## Related pages

- [Agent workflow patterns](agent-workflow-patterns.md) — the queue-over-loop principle this workflow embodies
- [Token economics](../frameworks/claude-code-token-economics.md) — fresh agents per issue, not one long-lived session
- Advisors: [Matt Pocock](../advisors/matt-pocock/persona.md) — source of this workflow model
