# Add Board Member — Design Spec

**Date:** 2026-06-03
**Companion to:** [ask-the-board design spec](2026-06-03-ask-the-board-design.md)

## Core Concept

A skill that onboards new advisors to the board and adds content to existing ones. Takes a creator name (and optionally seed URLs), discovers their public content, distills it into structured knowledge files via parallel agents, writes a persona synthesis, and registers them in the target board's roster.

Two mode axes:
- **New vs. existing advisor** — detected by checking roster.yaml for the advisor name
- **Which board** — the skill asks upfront whether to add to the current project's board or the global AIOS board. If the project has no board yet, offers to scaffold one.

No checkpoints during execution. Full report at the end for review.

## Board Resolution

The skill supports two board locations, mirroring ask-the-board's read-side resolution:

- **Project-local:** `{project}/docs/wiki/advisors/` (roster.yaml + per-advisor dirs)
- **Global (AIOS):** `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/`

On invocation, the skill:
1. Detects the current working directory's project
2. Asks: "Adding to this project's board or the global AIOS board?"
3. If the user picks the project board and none exists yet, scaffolds the full directory structure

This is the write-side counterpart to ask-the-board's read-side resolution.

## Skill Location

User-level at `~/.claude/skills/add-board-member/SKILL.md`. Matches ask-the-board.

## Invocation

**Trigger phrases:** "add board member X", "add X to my board", "onboard advisor X", "add content to X's knowledge base", "expand X's knowledge"

**Input:**
- Required: advisor name
- Optional: one or more seed URLs (YouTube videos, blog posts, podcast episodes)

**Examples:**
- `/add-board-member Alex Hormozi`
- `add Hormozi to my board`
- `add content to Nate Herk's knowledge base`
- `add board member Sara Blakely https://youtube.com/watch?v=...`

## Flow — New Advisor (Full Onboard)

### Step 1 — Resolve target board

Detect current project. Ask: project board or global AIOS? If project board doesn't exist yet, offer to scaffold it.

### Step 2 — Identify the advisor

Parse the name from the invocation. If URLs were provided, note them as seed sources. Derive the advisor slug (kebab-case of the name, e.g., `alex-hormozi`).

### Step 3 — Content discovery

Search for the advisor's public content using Exa and Firecrawl. Cast a wide net across:
- YouTube videos and talks
- Blog posts and articles
- Podcast appearances
- Social threads (Twitter/X, LinkedIn)
- Published frameworks, books, or courses (summaries, not full content)

If seed URLs were provided, include those and expand from there. Target: identify 10-15 candidate sources to yield 8-10 quality knowledge files.

### Step 4 — Parallel knowledge extraction

Spawn one agent per selected source. Each agent:
- Fetches the content via Exa or Firecrawl
- Extracts core frameworks, positions, mental models, and actionable advice
- Writes a single knowledge file following the established format
- Names the file descriptively in kebab-case

Agents are briefed on the existing knowledge file format by reading one example from the AIOS board as a template.

### Step 5 — Persona synthesis

After all knowledge agents complete, a synthesis agent reads all the knowledge files and writes `persona.md` covering:
- **Role on the Board** — one sentence
- **Lens** — how this advisor sees problems
- **Voice Notes** — communication style markers
- **Known Positions** — grouped by theme, derived from the knowledge files
- **Gaps** — content not yet ingested, known limitations

### Step 6 — Register

Add the advisor entry to the target board's `roster.yaml` with:
- `name`
- `slug`
- `role` (one-line description)
- `knowledge_path` (relative path to their directory)

### Step 7 — Report

Output a summary (see Report Format below). No checkpoints during the flow. The report is the review surface.

## Flow — Existing Advisor (Content Addition)

### Step 1 — Resolve target board

Same as new advisor flow.

### Step 2 — Find the advisor

Match name against roster.yaml. Read their existing persona.md and list of knowledge files to understand what's already covered.

### Step 3 — Content discovery

Same wide net or seed URL approach, but filtered against existing knowledge. The skill reads existing knowledge file names and topics to avoid duplicating what's already ingested. Prioritizes gaps noted in the persona.md `Gaps` section if they exist.

### Step 4 — Parallel knowledge extraction

Same as new advisor. One agent per source, writes a knowledge file each. Agents are briefed on existing topics to avoid overlap.

### Step 5 — Persona update

Synthesis agent reads the full knowledge set (old + new) and updates persona.md:
- Refreshes known positions with new material
- Updates the gaps section
- Adds any new themes

### Step 6 — Report

What was added, what gaps remain, updated file list. No roster.yaml change needed since the advisor already exists.

## Scaffolding — New Project Board

When the skill creates the first advisor on a project board that doesn't exist yet:

```
{project}/docs/wiki/advisors/
├── roster.yaml
└── {advisor-slug}/
    ├── persona.md
    └── knowledge/
        ├── topic-one.md
        └── ...
```

The roster.yaml follows the same schema as the AIOS global roster. No other project files are touched (no CLAUDE.md or clients.yaml modifications).

## Knowledge File Format

Each knowledge file follows the pattern established by the existing Nate Herk and Matt Pocock advisors:

```markdown
# {Topic Title}

## Context
Where this comes from (video title, blog post, talk).

## Key Concepts
- Concept with explanation

## Positions
Detailed positions, frameworks, mental models extracted from the content.

## Actionable Takeaways
What Justin can actually do with this.
```

Target: 8-10 knowledge files per advisor for a full onboard. Content additions add incrementally on top.

## Persona Format

Follows the established pattern from existing advisors:

```markdown
# {Name} — Advisor Lens

## Role on the Board
One sentence.

## Lens
How this advisor sees problems. 2-3 sentences.

## Voice Notes
- Communication style markers
- Verbal patterns, tone

## Known Positions

### {Theme 1}
- Position with context

### {Theme 2}
- Position with context

## Gaps

### Content not yet ingested
- Specific content that would strengthen the knowledge base

### Known limitations of this knowledge base
- What the current knowledge doesn't cover
```

## Report Format

Displayed at the end of every run:

```
## Board Member Added: {Name}

**Board:** {project name} / AIOS (global)
**Mode:** New advisor / Content addition
**Knowledge files created:** {count}

| File | Topic | Source |
|------|-------|--------|
| pricing-ai-workflows.md | How to price AI services | YouTube: "Stop Selling Hours" |
| ... | ... | ... |

**Persona:** {path to persona.md}
**Gaps identified:**
- {what's missing or thin}

**Sources used:** {count} sources ({types: YouTube, blog, etc.})
```

## Architecture — Parallel Agents

The skill orchestrates but delegates heavy lifting to parallel agents:

```
Skill (main context)
├── Content discovery (Exa/Firecrawl search)
├── Parallel knowledge agents (one per source)
│   ├── Agent 1 → knowledge/topic-one.md
│   ├── Agent 2 → knowledge/topic-two.md
│   └── ...
├── Persona synthesis agent → persona.md
└── Roster update + report
```

Each knowledge agent gets a clean context with:
- The source URL to fetch
- One example knowledge file as a format template
- Instructions on the extraction format
- (For content additions) List of existing topics to avoid overlap

This keeps quality consistent across all files regardless of how many sources are processed.

## What's Explicitly Out of Scope

- **Auto-discovery of new content** — no background polling of YouTube channels or RSS feeds
- **Book ingestion** — can reference books in knowledge files but won't ingest full book content
- **Cross-board advisor sharing** — no mechanism to clone an advisor from global to project or vice versa
- **Removing advisors** — separate concern, trivially manual (delete directory, remove roster entry)
- **Modifying ask-the-board** — this skill writes the data, ask-the-board reads it. No changes to ask-the-board needed.
