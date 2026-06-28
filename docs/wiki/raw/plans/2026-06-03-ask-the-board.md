# Ask the Board — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a user-level skill that lets Justin pose questions to a board of advisors backed by ingested creator content, with structured deliberation and unified output.

**Architecture:** User-level skill at `~/.claude/skills/ask-the-board/SKILL.md` orchestrates advisor agents via agent teams (fallback: parallel Agent tool). Advisor knowledge lives in claude-os at `docs/wiki/advisors/`. Skill resolves advisors from the current project first, then claude-os.

**Tech Stack:** Claude Code skills (SKILL.md), agent teams (TeamCreate/SendMessage), YAML roster, project wiki pattern for advisor knowledge storage.

**Spec:** `docs/superpowers/specs/2026-06-03-ask-the-board-design.md`

---

### Task 1: Scaffold Advisor Directory Structure

**Files:**
- Create: `docs/wiki/advisors/roster.yaml`
- Create: `docs/wiki/advisors/nate-herk/persona.md`
- Create: `docs/wiki/advisors/nate-herk/knowledge/.gitkeep`
- Create: `docs/wiki/advisors/nate-herk/raw/research/.gitkeep`
- Create: `docs/wiki/advisors/matt-pocock/persona.md`
- Create: `docs/wiki/advisors/matt-pocock/knowledge/.gitkeep`
- Create: `docs/wiki/advisors/matt-pocock/raw/research/.gitkeep`

- [ ] **Step 1: Create the advisors directory tree**

```bash
mkdir -p docs/wiki/advisors/nate-herk/{knowledge,raw/research}
mkdir -p docs/wiki/advisors/matt-pocock/{knowledge,raw/research}
touch docs/wiki/advisors/nate-herk/knowledge/.gitkeep
touch docs/wiki/advisors/nate-herk/raw/research/.gitkeep
touch docs/wiki/advisors/matt-pocock/knowledge/.gitkeep
touch docs/wiki/advisors/matt-pocock/raw/research/.gitkeep
```

- [ ] **Step 2: Create roster.yaml**

Write to `docs/wiki/advisors/roster.yaml`:

```yaml
advisors:
  nate-herk:
    name: Nate Herk
    lens: "AI business strategy, the 3Ms framework, leveraging AI as a business operator"
    sources:
      - youtube: "@nateherk"
    knowledge_path: docs/wiki/advisors/nate-herk/

  matt-pocock:
    name: Matt Pocock
    lens: "AI-assisted development, LLM skill design, developer tooling, building effectively with Claude Code"
    sources:
      - youtube: "@mattpocockuk"
    knowledge_path: docs/wiki/advisors/matt-pocock/
```

- [ ] **Step 3: Create Nate Herk persona.md**

Write to `docs/wiki/advisors/nate-herk/persona.md`:

```markdown
# Nate Herk — Advisor Lens

## Role on the Board
AI business strategy. How to think about leveraging AI as a business operator.

## Lens
Applies the Three Ms of AI framework (Mindset, Method, Machine) to business decisions. Focuses on what to automate, how to decide what's worth building, and how AI changes the economics of a solo operator or small team.

## Voice Notes
- Practical, not theoretical. Grounds advice in what actually works for operators.
- Thinks in systems — how does this decision compound over time?
- Skeptical of complexity for its own sake.

## Known Positions
- Populate from ingested content. Leave empty until knowledge/ has material.

## Gaps
This persona is bootstrapping. Knowledge base is empty. Ingested content will fill in frameworks, recurring patterns, and specific positions over time.
```

- [ ] **Step 4: Create Matt Pocock persona.md**

Write to `docs/wiki/advisors/matt-pocock/persona.md`:

```markdown
# Matt Pocock — Advisor Lens

## Role on the Board
AI-assisted development practice. How to actually build with LLMs effectively.

## Lens
Applies deep understanding of developer tooling, skill design, and LLM workflows to decisions about what to build and how to build it. Focuses on the craft of working with Claude Code — skill architecture, composability, and practical patterns.

## Voice Notes
- Technical depth with clear explanations. Makes complex concepts accessible.
- Opinionated about tooling and developer experience.
- Iterative — build, test, refine.

## Known Positions
- Populate from ingested content. Leave empty until knowledge/ has material.

## Gaps
This persona is bootstrapping. Knowledge base is empty. Ingested content will fill in methodologies, skill patterns, and specific positions over time.
```

- [ ] **Step 5: Verify structure**

```bash
find docs/wiki/advisors/ -type f | sort
```

Expected output:
```
docs/wiki/advisors/matt-pocock/knowledge/.gitkeep
docs/wiki/advisors/matt-pocock/persona.md
docs/wiki/advisors/matt-pocock/raw/research/.gitkeep
docs/wiki/advisors/nate-herk/knowledge/.gitkeep
docs/wiki/advisors/nate-herk/persona.md
docs/wiki/advisors/nate-herk/raw/research/.gitkeep
docs/wiki/advisors/roster.yaml
```

- [ ] **Step 6: Commit**

```bash
git add docs/wiki/advisors/
git commit -m "feat: scaffold advisor board — roster + Nate Herk + Matt Pocock"
```

---

### Task 2: Bootstrap Advisor Knowledge — Nate Herk

**Files:**
- Create: `docs/wiki/advisors/nate-herk/knowledge/*.md` (multiple files from ingested content)
- Modify: `docs/wiki/advisors/nate-herk/persona.md` (update Known Positions after ingestion)

This task uses `/wiki research` or manual Exa/Firecrawl fetching to pull Nate Herk's public content and pre-analyze it into the knowledge directory. The goal is enough material for the advisor agent to reason from — at least 5-10 content pieces covering his core frameworks.

- [ ] **Step 1: Identify top content to ingest**

Search for Nate Herk's highest-value public content:

```
mcp__exa__web_search_exa:
  query: "Nate Herk AI automation Three Ms framework business strategy for operators"
  numResults: 10
```

Also search YouTube directly:

```
mcp__firecrawl__firecrawl_search:
  query: "Nate Herk AI automation skills Claude Code site:youtube.com"
  limit: 10
```

Select 5-10 of the most substantive pieces (full talks, deep dives, framework explanations — not clips or reposts).

- [ ] **Step 2: Fetch and pre-analyze each source**

For each selected source, fetch the content and produce a pre-analyzed markdown file following the research-to-wiki format:

```markdown
---
source: advisor-bootstrap
advisor: nate-herk
captured: 2026-06-03
url: <source URL>
status: ingested
---

# <Title>

**URL:** <url>
**Published:** <date>
**Type:** YouTube transcript / blog post / podcast

## Key Frameworks and Patterns
- <framework or recurring pattern extracted>
- <specific methodology or mental model>

## Positions and Opinions
- <strong position the creator holds>
- <what they push back against>

## Relevant Quotes
- "<direct quote>" — context: <where/when>

## How This Applies as a Decision Lens
<2-3 sentences: what kind of decisions would this content inform?>
```

Write each file to `docs/wiki/advisors/nate-herk/knowledge/<topic-slug>.md`.

- [ ] **Step 3: Update persona.md Known Positions**

After ingesting content, update the "Known Positions" and "Gaps" sections of `docs/wiki/advisors/nate-herk/persona.md` with patterns that emerged from the ingested content.

- [ ] **Step 4: Commit**

```bash
git add docs/wiki/advisors/nate-herk/
git commit -m "feat: bootstrap Nate Herk advisor knowledge from public content"
```

---

### Task 3: Bootstrap Advisor Knowledge — Matt Pocock

**Files:**
- Create: `docs/wiki/advisors/matt-pocock/knowledge/*.md` (multiple files from ingested content)
- Modify: `docs/wiki/advisors/matt-pocock/persona.md` (update Known Positions after ingestion)

Same process as Task 2, but for Matt Pocock's content.

- [ ] **Step 1: Identify top content to ingest**

Search for Matt Pocock's highest-value public content:

```
mcp__exa__web_search_exa:
  query: "Matt Pocock TypeScript Claude Code skills LLM development developer tooling best practices"
  numResults: 10
```

Also search YouTube:

```
mcp__firecrawl__firecrawl_search:
  query: "Matt Pocock Claude Code skills developer tooling site:youtube.com"
  limit: 10
```

Select 5-10 of the most substantive pieces. Prioritize content about skill design, LLM workflows, and developer tooling philosophy over pure TypeScript tutorials.

- [ ] **Step 2: Fetch and pre-analyze each source**

Same format as Task 2 Step 2, writing files to `docs/wiki/advisors/matt-pocock/knowledge/<topic-slug>.md`.

- [ ] **Step 3: Update persona.md Known Positions**

Update `docs/wiki/advisors/matt-pocock/persona.md` with patterns from ingested content.

- [ ] **Step 4: Commit**

```bash
git add docs/wiki/advisors/matt-pocock/
git commit -m "feat: bootstrap Matt Pocock advisor knowledge from public content"
```

---

### Task 4: Write the Ask-the-Board Skill

**Files:**
- Create: `~/.claude/skills/ask-the-board/SKILL.md`

- [ ] **Step 1: Write the skill file**

Write to `~/.claude/skills/ask-the-board/SKILL.md`:

```markdown
---
name: ask-the-board
description: >
  Deliberate with your board of advisors. Each advisor is an agent backed by
  ingested creator content — they reason independently, then the board synthesizes
  a unified response. The defining signal is asking advisors, the board, or
  seeking multi-perspective counsel on a decision.
  Trigger phrases: "ask my board about X", "run this by my advisors",
  "what would my board say about X", "board meeting on X",
  "get my advisors' take on X", "deliberate on X".
  Depth: defaults to quick take. Say "deliberate deeply" or "deep" for full
  multi-round deliberation.
  Also triggers on /ask-the-board.
---

# Ask the Board

Pose a question to your board of advisors. Each advisor is an independent agent
backed by ingested public content from real creators. They deliberate and return
a unified perspective — not individual reports.

## When to invoke

- User wants multi-perspective counsel on a business or technical decision
- User says "ask my board", "run this by my advisors", "what would my board say"
- User invokes /ask-the-board

## Prerequisites

- **Advisor roster** must exist. Check these locations in order:
  1. `docs/wiki/advisors/roster.yaml` in the current project
  2. `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/roster.yaml` (global fallback)
- If no roster is found, stop: "No advisor roster found. Set up advisors in your project wiki or in claude-os."
- Each advisor in the roster must have a `persona.md` and at least some files in `knowledge/`.

## Detect deliberation depth

- **Quick take (default):** one round of independent analysis + synthesis.
- **Deep deliberation:** user includes "deliberate deeply", "deep", or "full deliberation" in the prompt. Multi-round: independent analysis → cross-examination → synthesis.

---

## Execution

### Phase 1 — Frame the Question

Before spawning advisor agents, frame the question:

1. **Restate the question clearly** — remove ambiguity, identify the decision type.
2. **Surface missing context** that would materially change the answer:
   - Decision type (one-way door vs. reversible)
   - Stakes (what's on the line)
   - Time horizon (this week vs. this quarter vs. this year)
   - Budget or revenue impact
   - Reversibility (how hard to undo)
   - Audience/customer (who this affects)
   - Constraints (time, money, dependencies, contracts)
   - What Justin is leaning toward
   - What failure would look like
3. **Do not block on missing info.** Make reasonable assumptions and label them clearly. Advisors can challenge assumptions during deliberation.

Present the framing to Justin for a quick gut check before proceeding. If he corrects an assumption, update and continue.

### Phase 2 — Isolate (Independent Advisor Analysis)

Load the roster. For each advisor:

1. Read their `persona.md` for role framing.
2. Read all files in their `knowledge/` directory for reference material.
3. Spawn an agent (via agent teams or Agent tool fallback) with:
   - **System context:** the persona.md content + "You are an advisor on Justin's board. Your lens: [lens from roster]. Use your knowledge base to inform your analysis. Do not impersonate this person. Do not claim they would definitely say something. Use their documented ideas, patterns, and public positions as a decision lens. When your knowledge doesn't cover the topic, say so and reason from adjacent principles — label it as extrapolation. Never fabricate quotes or positions."
   - **Knowledge context:** all knowledge/*.md files concatenated or summarized
   - **The framed question** from Phase 1 with assumptions

Each advisor produces independent analysis. No cross-talk during this phase.

**Agent teams path:**
```
TeamCreate: team_name: "board-deliberation"
Agent (per advisor): name: "<advisor-slug>", team_name: "board-deliberation"
```

**Parallel agent fallback:**
```
Agent (per advisor): run in parallel, collect results
```

### Phase 3 — Deliberate + Synthesize

**Quick take:**
Spawn a synthesis agent that receives all Phase 2 positions and produces the unified output. One pass.

**Deep deliberation:**
1. Send each advisor the other advisors' Phase 2 positions via SendMessage.
2. Each advisor responds: where they agree, where they push back, what the other missed.
3. Synthesis agent receives the full exchange (Phase 2 positions + Phase 3 responses) and produces the unified output.

**Synthesis agent instructions:**
"You are synthesizing a board deliberation into a unified response. Do NOT attribute positions to individual advisors by name. Write as a single coherent perspective that weaves together the board's thinking. Surface genuine disagreements as tensions, not as 'Advisor A vs Advisor B.' The output must follow this format exactly:"

### Output Format

```markdown
## Bottom Line
[One sentence — what to do]

## The Thinking
[Narrative synthesis — where the board aligned, where they diverged,
and how the tension resolved. Written as a unified perspective,
not individual advisor attributions.]

## Stress Test
- What could be wrong about this
- The hidden assumption
- The risk if Justin is overconfident

## How to Act
[Concrete next steps]

## Your Call
[If there's a genuine fork the board can't resolve, frame it as
a clear choice with trade-offs. Omit this section if consensus is clear.]
```

### Shutdown

After delivering the output:
- **Agent teams:** send shutdown_request to all team members, then TeamDelete.
- **Parallel agents:** agents return naturally, no cleanup needed.
```

- [ ] **Step 2: Verify the skill appears in the skill list**

```bash
ls ~/.claude/skills/ask-the-board/SKILL.md
```

Expected: file exists.

Start a fresh Claude Code session (or check the skill list in the current one) and confirm `ask-the-board` appears in the available skills list.

- [ ] **Step 3: Commit**

This is a user-level skill file outside the claude-os repo, so no git commit needed. The file is ready to use.

---

### Task 5: End-to-End Test

**Files:**
- No new files. This task validates the skill works.

- [ ] **Step 1: Test with a real question — quick take**

From the claude-os directory (where the roster lives as the global fallback), invoke:

```
/ask-the-board Should I price AI services for mid-market manufacturers at $750/$2,500/$5,000 per month tiers?
```

Verify:
- Roster is found and both advisors load
- Phase 1 frames the question and surfaces assumptions
- Phase 2 spawns independent advisor agents
- Phase 3 produces unified output in the correct format (Bottom Line → The Thinking → Stress Test → How to Act → Your Call)
- No individual advisor attributions in the output ("Nate says" / "Matt says" should not appear)

- [ ] **Step 2: Test deep deliberation**

```
/ask-the-board deep — Should I take on Crash Champions as a client through Nel's agency connection, or focus entirely on the Jon Liebl sales channel?
```

Verify:
- Deep mode is detected from "deep" keyword
- Phase 2 produces independent positions
- Advisors receive and respond to each other's positions before synthesis
- Output is richer/more nuanced than quick take

- [ ] **Step 3: Test from a project repo (fallback resolution)**

Navigate to a project repo without its own advisors (e.g., `/Users/justinlobaito/repos/mr-gym-online-store/`) and invoke:

```
/ask-the-board What's the best retention strategy for a pop-up fitness store with no digital marketing?
```

Verify:
- Skill detects no local roster
- Falls back to claude-os roster
- Deliberation works identically

- [ ] **Step 4: Fix any issues found during testing**

Address failures from Steps 1-3. Common issues to watch for:
- Knowledge files too large to load into agent context → summarize or chunk
- Agent teams API errors → fall back to parallel agents
- Output format drift → tighten synthesis agent instructions
- Advisor attributions leaking into output → strengthen synthesis prompt

- [ ] **Step 5: Commit any test-driven fixes**

```bash
git add -A
git commit -m "fix: ask-the-board adjustments from end-to-end testing"
```
