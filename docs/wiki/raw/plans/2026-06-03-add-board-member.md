# Add Board Member — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/add-board-member` skill that onboards new advisors and adds content to existing ones, writing to either a project-local or global AIOS board.

**Architecture:** Single SKILL.md at `~/.claude/skills/add-board-member/SKILL.md`. The skill orchestrates content discovery (Exa/Firecrawl), spawns parallel Agent calls for knowledge extraction (one agent per source), then a synthesis agent for persona.md, and finally updates roster.yaml. No checkpoints — full report at the end.

**Tech Stack:** Claude Code skill (markdown), Agent tool for parallel knowledge extraction, Exa/Firecrawl for content discovery, Write/Edit for file creation.

---

### Task 1: Write the SKILL.md

**Files:**
- Create: `~/.claude/skills/add-board-member/SKILL.md`

- [ ] **Step 1: Create the skill directory**

Run:
```bash
mkdir -p ~/.claude/skills/add-board-member
```

- [ ] **Step 2: Write the full SKILL.md**

Write the following to `~/.claude/skills/add-board-member/SKILL.md`:

````markdown
---
name: add-board-member
description: >
  Onboard a new advisor to the board or add content to an existing advisor's
  knowledge base. Handles content discovery, parallel knowledge extraction,
  persona synthesis, and roster registration. Works with any project's advisory
  board or the global AIOS board.
  Trigger phrases: "add board member X", "add X to my board", "onboard advisor X",
  "add content to X's knowledge base", "expand X's knowledge",
  "add X to this project's board".
  Also triggers on /add-board-member.
---

# Add Board Member

Onboard a new advisor or add content to an existing advisor's knowledge base. Discovers public content, extracts knowledge via parallel agents, synthesizes a persona, and registers in the target board's roster.

## When to invoke

- User asks to add a new advisor/board member
- User asks to add content to an existing advisor
- User names a creator and wants them on their board
- User provides URLs and wants them ingested into an advisor's knowledge base

## Prerequisites

- **Web search available.** At least one of Exa (`mcp__exa__web_search_exa`) or Firecrawl (`mcp__firecrawl__firecrawl_search`) must be accessible. Check with ToolSearch if unsure.
- **Web fetch available.** At least one of Exa (`mcp__exa__web_fetch_exa`) or Firecrawl (`mcp__firecrawl__firecrawl_scrape`) must be accessible.
- If neither search nor fetch tools are available, stop: "Web search tools required. Connect Exa or Firecrawl MCP servers first."

## Execution

### Step 1 — Parse input

Extract from the user's message:
- **Advisor name** (required) — the person to add or update
- **Seed URLs** (optional) — specific content to start from
- Derive the **advisor slug** — kebab-case of the name (e.g., `alex-hormozi`)

### Step 2 — Resolve target board

Determine which board to write to:

1. Detect the current working directory's project.
2. Ask the user: "Adding to **this project's board** or the **global AIOS board**?"
   - If in the claude-os repo, skip the question — default to AIOS board.
   - If in a project repo, present both options.
3. Set the **board root** based on the answer:
   - **Project-local:** `{project-root}/docs/wiki/advisors/`
   - **Global AIOS:** `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/`

### Step 3 — Detect mode (new vs. existing)

Check if `{board-root}/roster.yaml` exists:
- **No roster.yaml:** This is a new board. Will scaffold the full directory structure.
- **Roster exists:** Read it. Check if the advisor slug already has an entry.
  - **Not in roster:** New advisor mode.
  - **Already in roster:** Content addition mode. Read their existing `persona.md` and list their `knowledge/*.md` files to understand what's already covered.

### Step 4 — Content discovery

Search for the advisor's public content. Use Exa (`mcp__exa__web_search_advanced_exa`) as the primary search tool, Firecrawl (`mcp__firecrawl__firecrawl_search`) as fallback.

**If seed URLs were provided:** Include them as known sources. Search for additional content to supplement.

**If no seed URLs:** Cast a wide net. Run 3-5 searches across different content types:
- `"{advisor name}" AI framework OR methodology site:youtube.com` — video content
- `"{advisor name}" blog OR article OR guide` — written content
- `"{advisor name}" podcast OR interview` — podcast appearances
- `"{advisor name}" talk OR conference OR keynote` — talks and presentations

**For content addition mode:** Read existing knowledge file names and their `## Key Frameworks and Patterns` / `## Key Concepts` headers. Exclude sources that cover already-ingested topics. Prioritize gaps listed in the persona.md `Gaps` section.

**Target:** Identify 10-15 candidate sources for new advisors. For content additions, identify 3-8 sources covering gaps.

### Step 5 — Select sources

From the discovered content, select the best sources for knowledge extraction:
- Prioritize content where the advisor explains their own frameworks, mental models, and positions
- Prefer long-form content (talks, interviews, blog posts) over short social posts
- Prefer primary sources (their own channel/blog) over third-party summaries
- Deduplicate — if the same framework appears in multiple sources, pick the richest one
- **New advisor target:** 8-10 sources to yield 8-10 knowledge files
- **Content addition target:** 3-8 sources to fill identified gaps

### Step 6 — Scaffold directory (if needed)

**New board (no roster.yaml):**
```
{board-root}/
├── roster.yaml          # create empty: "advisors:\n"
└── {advisor-slug}/
    ├── persona.md        # placeholder, written in Step 8
    └── knowledge/        # empty, filled in Step 7
```

**New advisor on existing board:**
```
{board-root}/{advisor-slug}/
├── persona.md
└── knowledge/
```

**Content addition:** No scaffolding needed — directory already exists.

Create these directories and any placeholder files using the Write tool.

### Step 7 — Parallel knowledge extraction

Spawn one Agent call per selected source. Run agents in parallel (include all Agent calls in a single message).

Each agent gets this prompt (adapt per source):

```
You are extracting knowledge from a single source for an advisor knowledge base.

**Advisor:** {name}
**Source:** {url}
**Source type:** {YouTube video / blog post / podcast / etc.}

**Your job:** Fetch this content and extract a structured knowledge file.

Use the web fetch tool to retrieve the content at the URL above. If it's a YouTube video, fetch the page to get available transcript/description content.

Write a knowledge file in this exact format:

---
source: add-board-member
advisor: {slug}
captured: {today's date YYYY-MM-DD}
url: {url}
status: ingested
---

# {Topic Title — descriptive, based on the content's core subject}

**URL:** {url}
**Published:** {year or date if known}
**Type:** {content type}

## Key Frameworks and Patterns

{Extract the core frameworks, mental models, and structured thinking. Use ### subheadings for distinct frameworks. Include specific terminology the advisor uses.}

## Positions and Opinions

{Extract clear positions — what they advocate for, what they argue against, and why. Use bullet points.}

## Relevant Quotes

{3-5 direct quotes with context. Format: "quote" -- context: where/why they said it}

## How This Applies as a Decision Lens

{One paragraph: when advising on a business decision, how would this content inform the recommendation? What kinds of questions does this content help answer?}

**Guidelines:**
- Extract THEIR frameworks and positions, not generic advice
- Use their terminology and language
- Be specific — "charge $5K-15K/mo for retainers" not "charge appropriately"
- If the content is thin or low quality, say so in the output rather than padding
- Name the file: {slug for the topic in kebab-case}.md

Write the knowledge file to: {board-root}/{advisor-slug}/knowledge/{topic-slug}.md
```

{existing-topics-briefing — only for content addition mode}:
```
**Already covered topics (avoid overlap):**
{list of existing knowledge file names and their main topics}
```

### Step 8 — Persona synthesis

After all knowledge agents complete, spawn a synthesis agent:

```
You are synthesizing an advisor persona from their extracted knowledge base.

**Advisor:** {name}
**Knowledge files:** Read all .md files in {board-root}/{advisor-slug}/knowledge/

Read every knowledge file. Then write persona.md in this exact format:

# {Name} — Advisor Lens

## Role on the Board
{One sentence — what perspective this advisor brings.}

## Lens
{2-3 sentences — how this advisor sees problems. What they optimize for. What they notice that others miss.}

## Voice Notes
- {Communication style markers}
- {Tone, patterns, verbal habits from their content}
- {How they structure arguments}

## Known Positions

### {Theme 1 — e.g., "Core Frameworks"}
- **{Framework/position name}.** {Concise description with specifics.}

### {Theme 2}
- **{Position name}.** {Description.}

{Continue for all major theme clusters. Group related positions. 4-6 theme sections typical.}

## Gaps

### Content not yet ingested
- {Specific content that would strengthen the knowledge base}
- {Topics they're known for that aren't yet captured}

### Known limitations of this knowledge base
- {Time period covered}
- {Content types missing — e.g., paid courses, live workshops}
- {Context about the advisor that should filter how advice is applied}

**Guidelines:**
- Known Positions must be grounded in the knowledge files — don't invent positions
- Gaps should be specific and actionable — "their content on X" not "more content"
- Voice Notes come from HOW they communicate in the source content
- Keep it under 80 lines total

Write to: {board-root}/{advisor-slug}/persona.md
```

**For content addition mode:** The agent reads existing persona.md first, then all knowledge files (old + new), and updates the persona — refreshing Known Positions, updating Gaps, adding new themes.

### Step 9 — Register in roster

**New advisor:** Append an entry to `{board-root}/roster.yaml`:

```yaml
  {advisor-slug}:
    name: {Full Name}
    lens: "{one-line description of their advisory lens}"
    sources:
      - {source type}: "{handle or domain}"
    knowledge_path: docs/wiki/advisors/{advisor-slug}/
```

Use the Edit tool to append under the `advisors:` key.

**Content addition:** No roster change needed.

**New board:** The roster.yaml was created in Step 6. Edit it to add the advisor entry.

### Step 10 — Report

Output a report in this format:

```markdown
## Board Member Added: {Name}

**Board:** {project name} / AIOS (global)
**Mode:** New advisor / Content addition
**Knowledge files created:** {count}

| File | Topic | Source |
|------|-------|--------|
| {filename}.md | {topic description} | {source type}: {title or URL} |
| ... | ... | ... |

**Persona:** {full path to persona.md}
**Roster:** {full path to roster.yaml}
**Gaps identified:**
- {gaps from persona.md}

**Sources used:** {count} sources ({breakdown by type})
```

After the report, remind the user: "Review the knowledge files and persona for accuracy. Use `/ask-the-board` to test the new advisor."

### Shutdown

Do not summarize what the skill does. Do not offer to do more. The report is the final output.
````

- [ ] **Step 3: Verify the file was created**

Run:
```bash
ls -la ~/.claude/skills/add-board-member/SKILL.md
```

Expected: file exists with content.

- [ ] **Step 4: Commit**

```bash
cd /Users/justinlobaito/repos/claude-os && git add docs/superpowers/specs/2026-06-03-add-board-member-design.md docs/superpowers/plans/2026-06-03-add-board-member.md && git commit -m "docs: add-board-member implementation plan"
```

Note: The SKILL.md lives in `~/.claude/skills/` (user-level, outside the repo). It is not committed to claude-os. Only the spec and plan are committed.

---

### Task 2: End-to-end test — new advisor on AIOS board

**Purpose:** Validate the full new-advisor flow works end-to-end.

**Files:**
- Created by the skill at runtime:
  - `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/{test-advisor}/persona.md`
  - `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/{test-advisor}/knowledge/*.md`
  - Modified: `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/roster.yaml`

- [ ] **Step 1: Invoke the skill with a real advisor**

Pick a creator Justin would actually want on the board (Alex Hormozi, Pat Flynn, or whoever Justin chooses). Run:

```
/add-board-member {chosen advisor name}
```

- [ ] **Step 2: Verify the skill asks which board**

Expected: Since we're in the claude-os repo, the skill should default to the AIOS board without asking (per Step 2 logic).

- [ ] **Step 3: Verify the report**

Check the report output:
- Lists 8-10 knowledge files created
- Each file has a topic and source
- Gaps section is populated
- Persona path is correct
- Roster path is correct

- [ ] **Step 4: Spot-check knowledge files**

Read 2-3 of the created knowledge files. Verify:
- Frontmatter is present (source, advisor, captured, url, status)
- All sections populated (Key Frameworks, Positions, Quotes, Decision Lens)
- Content is specific to the advisor, not generic
- File names are descriptive kebab-case

- [ ] **Step 5: Verify persona.md**

Read the persona. Verify:
- Role, Lens, Voice Notes populated
- Known Positions grouped by theme with specifics
- Gaps section has actionable items
- Content matches what's in the knowledge files

- [ ] **Step 6: Verify roster.yaml**

Read roster.yaml. Verify:
- New entry added under `advisors:`
- Schema matches existing entries (name, lens, sources, knowledge_path)

- [ ] **Step 7: Cross-test with ask-the-board**

Run `/ask-the-board` with a question relevant to the new advisor's domain. Verify:
- The new advisor participates in the deliberation
- Their knowledge is reflected in the board's response

- [ ] **Step 8: Commit the new advisor**

```bash
cd /Users/justinlobaito/repos/claude-os && git add docs/wiki/advisors/ && git commit -m "feat: add {advisor name} to advisory board"
```

---

### Task 3: Test — content addition to existing advisor

**Purpose:** Validate the content addition flow.

- [ ] **Step 1: Invoke the skill for an existing advisor**

```
add content to Nate Herk's knowledge base
```

Or provide a specific URL:

```
/add-board-member Nate Herk https://youtube.com/watch?v={specific-video}
```

- [ ] **Step 2: Verify mode detection**

Expected: The skill detects Nate Herk exists in roster.yaml and enters content addition mode. It reads existing knowledge files and persona to identify gaps.

- [ ] **Step 3: Verify the report**

Check the report:
- Mode shows "Content addition"
- Knowledge files created are NEW (not duplicates of existing topics)
- Gaps section is updated

- [ ] **Step 4: Verify persona was updated**

Read persona.md. Verify:
- Known Positions section includes new themes from added content
- Gaps section updated — previously listed gaps that were filled should be removed
- Existing content is preserved, not overwritten

- [ ] **Step 5: Commit**

```bash
cd /Users/justinlobaito/repos/claude-os && git add docs/wiki/advisors/nate-herk/ && git commit -m "feat: expand Nate Herk advisor knowledge base"
```
