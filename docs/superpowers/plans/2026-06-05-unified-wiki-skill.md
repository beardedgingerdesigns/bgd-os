# Unified `/wiki` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 5 existing wiki skills into a single `/wiki` skill with 8 modes, a canonical WIKI-CLAUDE.md template, and a migration sweep.

**Architecture:** One monolithic SKILL.md at `~/.claude/skills/wiki/SKILL.md` with smart mode routing. Ships with two bundled template assets. Absorbs logic from `llm-wiki`, `convert-wiki`, `gsd-wiki-writeback`, `research-to-wiki`, and `ingest-aios-drops`. All external wiki producers stage to `raw/<source>/`; the wiki skill is the only writer to curated pages.

**Tech Stack:** Markdown skill files, no runtime code. Templates are static markdown with placeholder tokens.

**Spec:** `docs/superpowers/specs/2026-06-05-unified-wiki-skill-design.md`

---

### Task 1: Create skill directory and raw-README template

**Files:**
- Create: `~/.claude/skills/wiki/assets/raw-README.md`

- [ ] **Step 1: Create the skill directory structure**

```bash
mkdir -p ~/.claude/skills/wiki/assets
```

- [ ] **Step 2: Write the raw-README template**

This template gets placed at `docs/wiki/raw/README.md` during `/wiki init`. It explains the staging directory structure.

Write to `~/.claude/skills/wiki/assets/raw-README.md`:

```markdown
# raw/

Immutable source documents. The wiki skill reads from here but never modifies existing files.

Drop source material into the appropriate subdirectory. The `/wiki ingest` command processes files from here into the curated wiki.

## Subdirectories

| Directory | Source | Authority | What goes here |
|---|---|---|---|
| `research/` | `/wiki research` | Trusted provenance | Web research fetched and pre-analyzed for this project. Claims are cited and qualified, not wiki-authoritative. |
| `external/` | `/wiki convert` | Trusted | Operator-provided docs staged verbatim during wiki conversion. Originals preserved as-is. |
| `gsd/` | GSD lifecycle | Trusted | Knowledge packets from GSD phase completion, milestone close, and deferred decisions. Auto-ingested. |
| `aios/` | AIOS dispatcher | Advisory | Cross-project knowledge AIOS thinks this project should know about. Wiki evaluates and decides: promote, adapt, flag, or skip. |
| `conversations/` | Manual | Trusted | Exported Claude Code transcripts or meeting notes worth preserving. |

## How to ingest

Run `/wiki ingest` to process any unprocessed files. The skill reads `WIKI-CLAUDE.md` to determine where content belongs in the curated wiki.

Each subdirectory's files are treated according to their source authority level. `raw/aios/` drops are advisory and will be evaluated against existing wiki state before ingestion.

## File-format tips

- **Markdown / text:** ideal — Claude reads directly.
- **PDF:** Claude can read up to 20 pages per request. Big PDFs may need page-range hints.
- **Images:** Claude can view them. For images with text, say what you want extracted.
- **Web articles:** save as `.md` and drop the markdown file here.
- **Audio / video transcripts:** transcribe first, then drop the transcript.

## Out of scope for this folder

- Anything that belongs in the live project (production code, deployed assets).
- LLM-generated content — those go in `wiki/`.
- Operating instructions (WIKI-CLAUDE.md) — those are project-level, not sources.
```

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/skills/wiki/assets/raw-README.md
git commit -m "feat(wiki): add raw-README template asset"
```

---

### Task 2: Write the canonical WIKI-CLAUDE.md template

**Files:**
- Create: `~/.claude/skills/wiki/assets/WIKI-CLAUDE-TEMPLATE.md`

This template replaces Iowa Everywhere as the canonical source. It's project-agnostic with `{{PLACEHOLDER}}` tokens that `/wiki init` fills in.

- [ ] **Step 1: Write the template**

Write to `~/.claude/skills/wiki/assets/WIKI-CLAUDE-TEMPLATE.md`:

```markdown
# WIKI-CLAUDE.md — {{PROJECT_NAME}} Knowledge Wiki Schema

Claude Code session guidance for the knowledge wiki at [docs/wiki/](.). Read this before creating or editing any file under `docs/wiki/`.

This wiki's primary subject is **{{PROJECT_NAME}}** — {{PROJECT_DESCRIPTION}}. {{SCOPE_NOTE}}

Modeled on the canonical wiki template from the `/wiki` skill. Kept in sync at lint cadence.

## Working Memory Protocol

**At the start of every session:**

1. Tail the log: `ls docs/wiki/log/ | sort -r | head -10` — gives the last 10 ingest events.
2. Read [decisions/index.md](decisions/index.md) — list of currently-locked decisions.
3. If the work touches a known topic, drill into the matching `decisions/active/*.md` or `architecture/*.md` file before changing code.

Auto-memory at `~/.claude/projects/{{MEMORY_PATH}}/memory/` is the **pointer layer** — `MEMORY.md` lists wiki destinations with one-sentence "why this matters at session start" summaries. The wiki itself is the canonical store.

## Wiki operations

### Ingest

Adding new content — a locked decision, an architecture distillation, a strategy brief, a deferred plan, raw source material. Every ingest must:

1. **Write/update the content file** per the file-authority map below.
2. **Update the relevant section's `index.md`** with a one-line entry. Do NOT update a global `index.md` for every ingest — section indexes are per-section.
3. **Append a new file to `log/YYYY-MM-DD-<slug>.md`** with date, operation type, scope, and 1-3 sentences of context.
4. **Add at least one cross-reference** from the new page to at least one sibling, and ensure the new page is linked from its section's `index.md`. Markdown links only.
5. **For external sources** (PDFs, DOCX, exported conversations, screenshots): file under `raw/<subdir>/` and reference from the wiki page that consumes them.

### Query

Using the wiki to answer a question — typically during planning, code review, or session bootstrap. Read [decisions/index.md](decisions/index.md) and the relevant section's `index.md` first to find candidate pages, then drill into them.

When a synthesis is library-worthy (cross-section, would inform multiple future sessions, not redundant with existing content), file it under the appropriate section following the same ingest rules above.

### Lint

Periodic health-check. Looks for:

- **Orphans** — pages no other page links to.
- **Index gaps** — pages on disk but not in their section's `index.md`, or in `index.md` but missing on disk.
- **Stale claims** — `decisions/active/*.md` whose preconditions have changed; `architecture/*.md` whose references no longer match.
- **Contradictions** — pages claiming conflicting facts.
- **Missing cross-references** — pages that should link based on content overlap but don't.
- **`raw/` orphans** — source material no wiki page references.
- **Lifecycle drift in `decisions/`** — `active/` decisions whose triggers fired but never moved to `superseded/`; `deferred/` decisions whose work has shipped but never moved to `implemented/`.

Mechanical issues (index gaps, dead links, formatting) are auto-fixed. Semantic contradictions are auto-fixed only when code or an active decision clearly settles the issue; otherwise they are flagged for operator review.

## Architectural ground rules

These are inviolable. If a requested change would break one of these, stop and raise it rather than silently working around it.

1. **Markdown only.** Wiki content is prose markdown. Structured data (JSON, YAML config) lives in the codebase, not the wiki. The wiki references code files; it does not duplicate them.
2. **`decisions/active/` is immutable for substantive changes.** To revise a locked decision in a way that changes scope, technical content, or trigger semantics, move the existing file to `decisions/superseded/` and write a new file in `active/` that references it. Edit-in-place is permitted ONLY for typos, cross-ref updates, and framing clarifications that don't change scope or technical content.
3. **`log/` is append-only.** One file per ingest event. Never reorganize, never edit retroactively. To re-classify a past entry, append a new entry that references the old one.
4. **One ingest = one log entry.** Each commit that adds/moves wiki content appends exactly one file to `log/`. Multi-section ingests get one log entry summarizing all affected sections.
5. **`raw/` is read-only.** Once a file is placed in `raw/`, it is never modified or deleted. New versions are placed alongside.

{{PROJECT_SPECIFIC_RULES}}

## File-authority map

Each path is authoritative for a specific class of fact. When the same topic appears in multiple places, the authoritative file wins.

| Path | Authoritative for |
|---|---|
| `decisions/active/<date>-<slug>.md` | A single locked decision: scope, rationale, trigger semantics |
| `decisions/deferred/<date>-<slug>.md` | A deferred decision with revisit trigger |
| `decisions/implemented/<date>-<slug>.md` | A decision that has been fully built |
| `decisions/superseded/<date>-<slug>.md` | A replaced decision, kept for audit trail |
| `architecture/<slug>.md` | A subsystem or pattern that other work must follow |
| `overview/<slug>.md` | High-level project state: capabilities, status, roadmap |
| `strategy/<slug>.md` | Commercial / market / positioning context |
| `plans/<slug>.md` | Forward-looking plans not yet hardened into decisions |
| `research/<slug>.md` | Research findings, analysis, investigations |
| `synthesis/<slug>.md` | Cross-cutting analyses derived from multiple wiki sources |
| `sources/YYYY-MM-DD-<slug>.md` | Per-source summary of an ingested raw document |
| `<section>/index.md` | Per-section catalog: every page in that section with a one-line description |
| `index.md` (top-level) | Catalog of catalogs: links to each section's `index.md` |
| `log/<date>-<slug>.md` | One ingest event |

## Decision page template

Every file under `decisions/` follows this shape:

```
# <Title>

**Status:** active | deferred | implemented | superseded
**Date:** YYYY-MM-DD
**Scope:** <what work this decision governs>
**Supersedes:** <link to prior decision, if any>
**Superseded by:** <link to replacement, when status=superseded>

## Decision

<1-3 sentence statement of what was chosen.>

## Rationale

<Why this choice over alternatives. Include trade-offs accepted.>

## Cross-references

- <link to architecture/strategy/synthesis pages this decision relates to>

## Do not relitigate without

<The trigger condition that would justify revisiting.>
```

## Cross-reference conventions

- **Markdown links only.** Wikilinks `[[label]]` are NOT used (they don't render on GitHub).
- **Repo-relative paths** from the linking file: `[slug](../architecture/slug.md)`, not absolute paths.
- **Every new page links to at least one sibling** and is linked from its section's `index.md`.
- **`raw/` references** from wiki pages should use a `Sources:` section near the top.

## Boundary with auto-memory

Three classes in the project's auto-memory, three rules:

1. **`project_*` memories become pointers.** Two-line shape: a link to the wiki file, then one sentence explaining why it matters at session start.
2. **`feedback_*` and `user_*` memories stay as-is.** About the operator, not project knowledge.
3. **Ephemeral session context stays in auto-memory exclusively.** Wiki = committed knowledge; auto-memory = in-flight state.

## When this wiki does NOT apply

If a requested change would be a better fit elsewhere, push back rather than silently filing it here.

{{EXCLUSION_TABLE}}
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/wiki/assets/WIKI-CLAUDE-TEMPLATE.md
git commit -m "feat(wiki): add canonical WIKI-CLAUDE.md template"
```

---

### Task 3: Write SKILL.md — frontmatter, overview, detection, routing

**Files:**
- Create: `~/.claude/skills/wiki/SKILL.md`

This task creates the SKILL.md with the top-level structure: frontmatter, overview, wiki detection, mode routing, and the first two modes (init, convert). Subsequent tasks append the remaining modes and universal sections.

- [ ] **Step 1: Write the skill file — frontmatter through convert mode**

Write to `~/.claude/skills/wiki/SKILL.md`:

```markdown
---
name: wiki
description: >
  Canonical project wiki curator. One skill for all wiki operations: bootstrap, convert,
  ingest, research, session wrap-up, lint, query, and record decisions. The wiki skill is
  the only writer to curated pages — external producers (GSD, AIOS, research tools) stage
  to raw/<source>/ and the wiki's ingest pipeline curates.
  Trigger phrases: "log everything to the wiki", "wrap up the wiki", "update the wiki",
  "save this session to the wiki", "done hit the wiki", "set up project memory",
  "add a wiki", "build a knowledge base", "ingest these docs", "remember our decisions",
  "ingest the raw files", "research X and save to the wiki", "research X for this project",
  "lint the wiki", "what does the wiki say about X", "record this decision",
  "convert this wiki", "bootstrap a wiki", "wiki health check".
  Also triggers on /wiki, /wiki init, /wiki convert, /wiki ingest, /wiki research,
  /wiki log, /wiki lint, /wiki query, /wiki decide.
---

# /wiki — Project Wiki Curator

The canonical interface for all wiki operations. One skill, eight modes.

## Principles

1. **Knowledge arrives, wiki curates.** Source-agnostic. Doesn't matter if knowledge came from GSD, AIOS, research, or conversation.
2. **The wiki skill is the only writer to curated pages.** External producers stage to `raw/<source>/`. The wiki skill's ingest pipeline is the single gateway.
3. **WIKI-CLAUDE.md governs.** Every project wiki has a schema file. Read it before every write operation.
4. **Curation over completeness.** Only write what future sessions need that they can't derive from code.

## Wiki Detection

Resolve the wiki root in this order. Stop at the first match:

1. Explicit path passed as argument — use that
2. `docs/wiki/WIKI-CLAUDE.md` — most common layout
3. `wiki/WIKI-CLAUDE.md` — wiki one level from repo root
4. `WIKI-CLAUDE.md` at repo root — wiki IS the repo root
5. Structural markers only (`decisions/` + `log/` exist but no WIKI-CLAUDE.md) — detect but recommend `/wiki convert`

If no wiki found, suggest `/wiki init`.

Once found, read `WIKI-CLAUDE.md` before any write operation. It governs file placement, templates, and ground rules.

## Mode Routing

With explicit mode argument, route directly:
- `/wiki init` | `/wiki convert` | `/wiki ingest` | `/wiki research <query>` | `/wiki log` | `/wiki lint` | `/wiki query <question>` | `/wiki decide`

With no args or natural language, detect from context:
- Pending files in `raw/` subdirectories → suggest `ingest`
- Session produced commits/changes → suggest `log`
- User asking a question about the project → route to `query`
- "wrap up", "done", "log everything" → route to `log`

For state-changing operations detected via smart routing, briefly announce the selected mode before proceeding.

---

## Mode: `init`

Bootstrap a new wiki in the current project. No AIOS dependency — works from any project directory.

### Prerequisites
- No existing wiki detected (if `WIKI-CLAUDE.md` exists, abort with message)
- If existing docs are detected (markdown files in `docs/`, a `wiki/` folder, etc.), suggest `/wiki convert` instead

### Workflow

1. **Discover existing context.** Check for: README, CLAUDE.md, package.json, existing docs, recent git history. Gather enough to seed an overview.

2. **Ask 2-3 setup questions:**
   - Project name and one-line description
   - What should NOT go in this wiki (project-specific exclusions)
   - Optionally: any known decisions or architectural patterns to seed

3. **Scaffold the directory structure:**
   ```
   docs/wiki/
     WIKI-CLAUDE.md
     index.md
     overview.md
     log/YYYY-MM-DD-wiki-bootstrapped.md
     raw/
       README.md
       research/.gitkeep
       external/.gitkeep
       gsd/.gitkeep
       aios/.gitkeep
       conversations/.gitkeep
     sources/.gitkeep
     decisions/
       index.md
       active/.gitkeep
       deferred/.gitkeep
       implemented/.gitkeep
       superseded/.gitkeep
     architecture/.gitkeep
     overview/.gitkeep
     strategy/.gitkeep
     plans/.gitkeep
     research/.gitkeep
   ```

4. **Write WIKI-CLAUDE.md.** Copy from the canonical template at `~/.claude/skills/wiki/assets/WIKI-CLAUDE-TEMPLATE.md`. Replace placeholder tokens:
   - `{{PROJECT_NAME}}` — from setup question
   - `{{PROJECT_DESCRIPTION}}` — from setup question
   - `{{SCOPE_NOTE}}` — derive from project context
   - `{{MEMORY_PATH}}` — derive from the repo path (e.g., `-Users-justinlobaito-repos-<slug>`)
   - `{{PROJECT_SPECIFIC_RULES}}` — from exclusion question, or empty if none
   - `{{EXCLUSION_TABLE}}` — build from exclusion question

5. **Write raw/README.md.** Copy from `~/.claude/skills/wiki/assets/raw-README.md`.

6. **Seed initial content:**
   - `index.md` — catalog of initial pages
   - `overview.md` — 2-minute briefing from discovered context
   - `decisions/index.md` — empty catalog, ready for entries
   - `log/YYYY-MM-DD-wiki-bootstrapped.md` — initial log entry

7. **Emit receipt** (files created, sections scaffolded).

8. **Commit:** `docs(wiki): bootstrap wiki for <project-name>`

---

## Mode: `convert`

Reshape existing docs, wikis, or knowledge bases into the canonical wiki layout. For projects that already have documentation but not in the AIOS-expected structure.

### Prerequisites
- Existing docs detected (markdown files, wiki folder, Obsidian vault, Notion export, etc.)
- No prior conversion detected (check for `WIKI-CLAUDE.md` + a `sources/*-import.md`). If found, abort with "already converted — use `/wiki ingest` for incremental additions."

### Workflow

1. **Detect and snapshot.** Identify the existing docs: location, format, file count, structure. Print a summary.

2. **Scaffold the wiki skeleton.** Create the same structure as `init` mode at `docs/wiki/`.

3. **Stage existing content verbatim.** Copy all existing doc files into `raw/external/<source-folder>/`. Never modify originals. This is the immutable archive.

4. **Write source summary.** Create `sources/YYYY-MM-DD-<slug>-import.md` summarizing the imported content: file count, structure, key topics found.

5. **Promote into curated sections.** Walk each source file and determine where its content belongs:
   - Decisions → `decisions/active/` or `decisions/deferred/`
   - Architecture docs → `architecture/`
   - Strategy/business docs → `strategy/`
   - Plans/roadmaps → `plans/`
   - Research → `research/`
   - Everything else → assess per WIKI-CLAUDE.md

   Write curated pages. Cross-reference with siblings. Update section indexes.

6. **Write WIKI-CLAUDE.md.** Use the canonical template, customized for this project.

7. **Register with AIOS.** Edit `/Users/justinlobaito/repos/claude-os/clients.yaml` — set or append `docs_paths` for this project.

8. **Log the conversion.** Write `log/YYYY-MM-DD-wiki-converted-from-<source>.md` with: source path, file count, what was staged, what was promoted, sections populated.

9. **Emit receipt.**

10. **Commit:** `docs(wiki): convert existing docs to wiki structure`

### Idempotency
- Never overwrite `raw/external/`. If re-running, stage new version alongside as `raw/external/<folder>-YYYY-MM-DD/`.
- If the source has new material since last conversion, route to `/wiki ingest` for incremental additions.
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/wiki/SKILL.md
git commit -m "feat(wiki): SKILL.md with frontmatter, detection, routing, init, convert modes"
```

---

### Task 4: Append ingest and research modes to SKILL.md

**Files:**
- Modify: `~/.claude/skills/wiki/SKILL.md` (append after convert mode)

- [ ] **Step 1: Append the ingest and research modes**

Append to `~/.claude/skills/wiki/SKILL.md` after the convert mode section:

```markdown

---

## Mode: `ingest`

Process staged `raw/` files into curated wiki pages. The core curation pipeline.

### Source Authority Levels

Not all `raw/` subdirectories are equal:

| Source | Authority | Ingest behavior |
|---|---|---|
| `raw/gsd/` | **Trusted** | Work completed in this project. Auto-ingest with high confidence. |
| `raw/research/` | **Trusted provenance** | Research requested for this project. Auto-ingest, but cite and qualify external claims — not wiki-authoritative. |
| `raw/external/` | **Trusted** | Operator-provided docs. Ingest via promotion workflow. |
| `raw/aios/` | **Advisory** | AIOS thinks this might be relevant. Evaluate against wiki state before deciding. |

### AIOS Drop Evaluation

When the ingest pipeline encounters `raw/aios/` files:

1. Read the drop and its dispatch reason (frontmatter metadata from AIOS)
2. Read the project's WIKI-CLAUDE.md and current wiki state
3. Evaluate: Does this fit the project's scope? Is it redundant? Does it contradict existing knowledge?
4. Four outcomes:
   - **Promote** — new, compatible information gets curated directly
   - **Adapt** — relevant but needs reframing for this project's context before curation
   - **Flag** — incoming claim conflicts with existing wiki knowledge. Surface both claims to the operator: the existing page, the incoming claim, and a suggested resolution. Do not silently overwrite.
   - **Skip** — redundant or irrelevant. Leave in `raw/aios/` with a frontmatter note: `status: skipped` and `reason: <why>`

The project wiki has final say. AIOS is the dispatcher, not the authority.

### Workflow

1. **Read WIKI-CLAUDE.md.** Understand file-authority map, ground rules, exclusions.

2. **Scan `raw/` subdirectories** for unprocessed files. A file is unprocessed if it has no corresponding `sources/` summary or no `status:` frontmatter marking it as processed.

3. **For each file, by source authority:**

   **Trusted sources (gsd/, external/):**
   - Read the file
   - Draft curated entries per the file-authority map
   - Write to the appropriate wiki sections
   - Create a `sources/YYYY-MM-DD-<slug>.md` summary
   - Update section `index.md` files
   - Add cross-references to related pages

   **Trusted provenance (research/):**
   - Same as trusted, but qualify external claims with citations
   - Frame research findings as "according to [source]" rather than wiki-authoritative statements
   - Note the research date — external info ages

   **Advisory (aios/):**
   - Run the AIOS Drop Evaluation above
   - For promoted/adapted content: proceed as trusted
   - For flagged content: surface the conflict, do not curate until resolved
   - For skipped content: mark the file with `status: skipped` frontmatter

4. **Append to `log/`.** One log entry per ingest run, summarizing all files processed.

5. **Emit receipt:**
   - Files ingested (by source)
   - Pages created / updated
   - Files skipped (with reason)
   - Flagged/contested items requiring operator attention

6. **Commit:** `docs(wiki): ingest <N> sources from raw/<subdirs>`

---

## Mode: `research`

Fetch web research and stage it for wiki ingestion. Chains: semantic search, source fetch, pre-analysis, staging to `raw/research/`.

### Prerequisites
- A wiki exists in the current repo (detection passes)
- Web search tools available (Exa via `mcp__exa__web_search_exa` or Firecrawl via `mcp__firecrawl__firecrawl_search`)

### Workflow

1. **Contextualize the query.** Read the wiki's `overview.md` and `index.md` to understand existing coverage. Refine the research query to avoid duplicating what the wiki already knows.

2. **Run web search.** Use Exa semantic search as the primary tool:
   ```
   mcp__exa__web_search_exa:
     query: <refined query>
     numResults: 10
     type: auto
   ```
   For news/recency: set `type: news`. For technical docs: set `type: auto`.

3. **Present source candidates.** Show the operator a ranked list of results with titles, URLs, and relevance notes. Let them select which to fetch. If running unattended, select the top 3-5 most relevant.

4. **Fetch selected sources.**
   - Static pages: `mcp__exa__web_fetch_exa` with `maxCharacters: 10000`
   - JS-heavy pages: `mcp__firecrawl__firecrawl_scrape` with `formats: ["markdown"]`
   - Fallback: `WebFetch`

5. **Pre-analyze and structure.** For each fetched source, create a structured markdown file:
   ```markdown
   ---
   source_url: <url>
   fetched: YYYY-MM-DD
   query: <original query>
   status: staged
   ---
   # <Title>

   ## TL;DR
   <2-3 sentence summary>

   ## Key findings
   <Bullet points of relevant information>

   ## Relevance to {{PROJECT_NAME}}
   <How this connects to the project>

   ## Raw content
   <Fetched content, trimmed to relevant sections>
   ```

6. **Stage to `raw/research/`.** Write each file as `raw/research/YYYY-MM-DD-<slug>.md`.

7. **Ingest decision.** Ask the operator:
   - **Ingest now** — run the ingest pipeline on the new files
   - **Stage only** — leave in `raw/research/` for later review

   Default recommendation: **ingest now** (the staging-only default was a bootstrap-era caution that's no longer needed).

8. **Log the research session.** Write `log/YYYY-MM-DD-research-<slug>.md`:
   ```
   ## [YYYY-MM-DD] research | <query>
   Searched: N results via Exa/Firecrawl
   Selected: M sources
   Staged: K files in raw/research/
   Status: staged | ingested
   ```

9. **Emit receipt.**

10. **Commit:** `docs(wiki): research — <query summary>`
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/wiki/SKILL.md
git commit -m "feat(wiki): add ingest and research modes"
```

---

### Task 5: Append log, lint, query, and decide modes to SKILL.md

**Files:**
- Modify: `~/.claude/skills/wiki/SKILL.md` (append after research mode)

- [ ] **Step 1: Append the remaining four modes**

Append to `~/.claude/skills/wiki/SKILL.md`:

```markdown

---

## Mode: `log`

Session wrap-up. Extract wiki-worthy knowledge from the current session and write it directly to the curated wiki. This is the primary way knowledge enters the wiki during active work.

### When to invoke
- End of a productive session: "log everything to the wiki", "wrap up", "done hit the wiki"
- After a significant change: "update the wiki with what we did"
- `/wiki log` explicitly

### Workflow

1. **Review the session.** Examine:
   - Recent git commits (since last wiki log entry or session start)
   - Files changed and their nature (new features, refactors, fixes)
   - Decisions made during conversation (explicit choices, trade-offs discussed)
   - Deferred items mentioned but not acted on
   - Architecture patterns established or modified
   - Capability changes (features added, removed, or modified)

2. **Extract wiki-worthy knowledge.** Categorize into:
   - **Decisions** — choices made with rationale. Write to `decisions/active/` or `decisions/deferred/`.
   - **Architecture** — new subsystems or patterns future work must follow. Write to `architecture/`.
   - **Capability changes** — update `overview/` pages to reflect current state.
   - **Deferrals** — things explicitly pushed to later. Write to `decisions/deferred/` with revisit trigger.

3. **Write directly to curated pages.** This is an in-session operation — the wiki skill has full conversation context and writes directly. No staging to `raw/`.

4. **Run staleness sweep.** Check:
   - `overview/` pages — do capability descriptions match what was just built?
   - `decisions/deferred/` — did this session resolve any deferred items?
   - `architecture/` pages — do patterns described match current implementation?
   - For each stale entry found, apply Write Safety rules (see below).

5. **Update indexes and log.**
   - Update all affected section `index.md` files
   - Write `log/YYYY-MM-DD-session-<slug>.md` summarizing what was logged

6. **Emit receipt:**
   - Decisions recorded
   - Architecture pages created/updated
   - Capability pages updated
   - Deferred items resolved or added
   - Stale entries fixed
   - Flagged items (ambiguous staleness that needs operator input)

7. **Commit:** `docs(wiki): session wrap-up — <1-line summary of session>`

---

## Mode: `lint`

Wiki health check. Finds and fixes mechanical issues, flags semantic problems.

### Checks

1. **Orphans** — pages on disk that no other page links to
2. **Index gaps** — pages on disk not in their section's `index.md`, or `index.md` entries pointing to missing files
3. **Dead links** — markdown links pointing to non-existent files
4. **Stale claims** — `decisions/active/*.md` whose preconditions changed; `architecture/*.md` whose code references no longer match
5. **Contradictions** — pages claiming conflicting facts (especially `decisions/` vs `architecture/` vs `strategy/`)
6. **Missing cross-references** — pages that should link based on content overlap but don't
7. **`raw/` orphans** — source material no wiki page references
8. **Lifecycle drift** — `active/` decisions whose triggers fired but never moved to `superseded/`; `deferred/` decisions whose work shipped but never moved to `implemented/`
9. **Log formatting** — log entries following the expected format

### Fix Rules (Write Safety)

**Auto-fix (mechanical):**
- Missing index entries — add them
- Dead links — remove or update
- Index entries pointing to missing files — remove
- Missing cross-references (up to 10 per run) — add them
- Log formatting issues — correct

**Auto-fix only when authority is clear (semantic):**
- Deferred decisions where the feature is now demonstrably shipped in code — move to `implemented/`
- Architecture pages where code clearly contradicts the documented pattern AND no active decision protects the old pattern — update
- Capability descriptions that are factually wrong per current codebase — update

**Flag for operator (ambiguous semantic):**
- Contradictions between `decisions/` and `architecture/` where both could be right
- Stale claims where the "correct" answer is unclear
- Active decisions whose triggers may have fired but the evidence is ambiguous

### Workflow

1. Read WIKI-CLAUDE.md
2. Walk all wiki pages, build a page graph (links, indexes, sections)
3. Run all checks above
4. Apply auto-fixes
5. Collect flagged items
6. Emit receipt:
   - Issues found (by category)
   - Auto-fixed (by category)
   - Flagged for operator review (with details)
7. Commit: `docs(wiki): lint — <N> fixes, <M> flags`

---

## Mode: `query`

Answer a question using wiki content. Read-only unless a synthesis is worth filing.

### Workflow

1. Read the wiki's `index.md` and relevant section indexes to identify candidate pages.
2. Read candidate pages. Synthesize an answer.
3. **Cite wiki pages used.** Every factual claim in the answer should reference the wiki page it came from.
4. If the synthesis is reusable (cross-section, took significant work to derive, would inform multiple future sessions), offer to file it:
   - As a new page under the appropriate section
   - Or under `synthesis/` if it spans multiple sections
   - Follow the standard ingest rules (update index, write log entry, add cross-references)
5. Append to `log/` only if the query produced a wiki update.

---

## Mode: `decide`

Record a decision and update all affected wiki pages.

### Workflow

1. **Read WIKI-CLAUDE.md** for the decision page template and ground rules.

2. **Check for duplicates** in `decisions/` — is this decision already recorded? If so, surface the existing entry. If the user wants to update it, follow the immutability rules (supersede, don't edit-in-place for substantive changes).

3. **Determine status:**
   - `active` — the decision is made and governs current work
   - `deferred` — the decision is pushed to later, with a revisit trigger
   - `implemented` — the decision has been fully built (usually transitions from active)

4. **Write the decision file** at `decisions/<status>/YYYY-MM-DD-<slug>.md` using the template from WIKI-CLAUDE.md. Include:
   - Decision statement (1-3 sentences)
   - Rationale (why this over alternatives, trade-offs accepted)
   - Scope (what work this governs)
   - Cross-references to related pages
   - "Do not relitigate without" trigger

5. **Walk affected wiki pages.** A decision changes the wiki — find all pages whose content is affected and update them. Check:
   - `architecture/` pages that reference the topic
   - `overview/` pages listing capabilities or plans
   - `strategy/` pages if the decision has commercial implications
   - Other `decisions/` pages that cross-reference the topic

6. **Update `decisions/index.md`** with a one-line entry.

7. **Write log entry** to `log/YYYY-MM-DD-decision-<slug>.md`.

8. **Emit receipt.**

9. **Commit:** `docs(wiki): decide — <slug>`
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/wiki/SKILL.md
git commit -m "feat(wiki): add log, lint, query, decide modes"
```

---

### Task 6: Append universal sections to SKILL.md

**Files:**
- Modify: `~/.claude/skills/wiki/SKILL.md` (append after decide mode)

- [ ] **Step 1: Append the staleness guard, conventions, and anti-patterns sections**

Append to `~/.claude/skills/wiki/SKILL.md`:

```markdown

---

## Staleness Guard

Two mechanisms that work together:

### Inline Catch
During any active session work (not just `/wiki log`), when the skill detects a capability change — a new feature built, a deferred item resolved, a pattern changed — it checks wiki pages for stale references. Apply Write Safety rules: auto-fix when authority is clear, flag when ambiguous.

This catches the obvious case: you just built the thing the wiki says is deferred.

### Wrap-up Sweep
During `/wiki log`, a broader pass checks all overview pages, deferred lists, capability docs, and architecture entries. This catches cross-cutting staleness you didn't touch directly during the session.

Together, inline + sweep means the wiki stays current without a separate maintenance ritual.

---

## Operation Receipts

Every write-producing mode emits a consistent summary when it completes:

- Files created
- Files updated
- Files skipped (with reason)
- Decisions recorded
- Flagged/contested items requiring operator attention
- Suggested next action (if any)

This is terminal output, not a persistent file.

---

## Universal Conventions

These hold across all modes. Don't drift from them.

- **Markdown only.** Frontmatter optional; use it when it helps (tags, status, source counts).
- **Absolute dates everywhere.** `YYYY-MM-DD`. Never "yesterday", "last week", relative.
- **Markdown links between wiki pages.** Repo-relative paths. No wikilinks.
- **One topic per page.** If a page covers two distinct things, split.
- **Promote when content grows.** Topics start as rows in an overview page; promote to a dedicated file when content exceeds roughly 5 lines of substance. Replace the row with a link.
- **Cite sources for claims.** Anything traceable to a raw doc should reference its source page.
- **`index.md` and `log/` are navigation, not knowledge.** Don't put substantive content there.
- **No empty placeholder pages.** A page exists only when there's something in it.
- **`raw/` is read-only.** Read from it, never modify existing files in it.

---

## Anti-Patterns

- **Creating a giant taxonomy of empty folders.** Only create directories when you have content. The init scaffold uses `.gitkeep` files that should be replaced with real content as it arrives.
- **Asking the user to fill out forms.** The user's job is sourcing and questions; the wiki skill's job is bookkeeping.
- **Treating ingest as one-shot retrieval.** Ingest means integrating — touching every page the new source affects. A source might update many pages.
- **Filing decisions silently then forgetting to apply them.** A decision changes the wiki; the page-level updates are part of the decision.
- **Letting `index.md` drift from reality.** Update it every time a page is created, renamed, or deleted.
- **Re-deriving the same synthesis every query.** If you've pieced together the same answer twice, file it.
- **Writing to curated pages from outside the wiki skill.** If you're a GSD agent, a kickoff-project agent, or any other producer — stage to `raw/<source>/`. Let the wiki skill curate.
- **Silently overwriting contested claims.** When incoming information contradicts existing wiki knowledge and the authority is ambiguous, flag it. Don't pick a winner.
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/wiki/SKILL.md
git commit -m "feat(wiki): add staleness guard, receipts, conventions, anti-patterns"
```

---

### Task 7: Delete old skills

**Files:**
- Delete: `~/.claude/skills/llm-wiki/` (entire directory)
- Delete: `~/.claude/skills/convert-wiki/` (entire directory)
- Delete: `~/.claude/skills/gsd-wiki-writeback/` (entire directory)
- Delete: `~/.claude/skills/research-to-wiki/` (entire directory)
- Delete: `/Users/justinlobaito/repos/claude-os/.claude/skills/ingest-aios-drops/` (entire directory)

- [ ] **Step 1: Delete all five old skill directories**

```bash
rm -rf ~/.claude/skills/llm-wiki
rm -rf ~/.claude/skills/convert-wiki
rm -rf ~/.claude/skills/gsd-wiki-writeback
rm -rf ~/.claude/skills/research-to-wiki
rm -rf /Users/justinlobaito/repos/claude-os/.claude/skills/ingest-aios-drops
```

- [ ] **Step 2: Verify deletion**

```bash
ls ~/.claude/skills/llm-wiki 2>&1
ls ~/.claude/skills/convert-wiki 2>&1
ls ~/.claude/skills/gsd-wiki-writeback 2>&1
ls ~/.claude/skills/research-to-wiki 2>&1
ls /Users/justinlobaito/repos/claude-os/.claude/skills/ingest-aios-drops 2>&1
```

Expected: all five should return "No such file or directory"

- [ ] **Step 3: Commit the ingest-aios-drops deletion (it's in the claude-os repo)**

```bash
cd /Users/justinlobaito/repos/claude-os
git add -A .claude/skills/ingest-aios-drops/
git commit -m "chore: delete ingest-aios-drops skill (absorbed into /wiki)"
```

Note: the user-level skill deletions (`~/.claude/skills/`) are outside git and don't need a commit.

---

### Task 8: Update references across repos

**Files to modify** (sweep all files referencing old skill names):

In `claude-os` repo:
- `CLAUDE.md` — if it references old skill names
- `CONTEXT.md:255` — references `llm-wiki` ingest workflow
- `.claude/skills/weekly-project-status/SKILL.md:22` — references `llm-wiki`
- `references/partners-for-sight-project.md:67` — references `llm-wiki pattern`
- `docs/adr/0004-staged-ingestion-via-raw-aios.md` — may reference old skills
- `.planning/` files — references in STATE.md, intel docs

In project repos (BrandOS, Iowa Everywhere, etc.):
- `CLAUDE.md` files referencing `/llm-wiki`, `/gsd-wiki-writeback`, `/convert-wiki`
- `docs/wiki/WIKI-CLAUDE.md` files referencing old skill names
- Wiki pages that mention old skill invocations

- [ ] **Step 1: Find all references in claude-os**

```bash
cd /Users/justinlobaito/repos/claude-os
grep -rn '/llm-wiki\|/convert-wiki\|/gsd-wiki-writeback\|/research-to-wiki\|/ingest-aios-drops' \
  --include='*.md' --include='*.yaml' --include='*.json' \
  . | grep -v node_modules | grep -v .git | grep -v '2026-06-05-unified-wiki'
```

- [ ] **Step 2: Update each reference**

For each file found, replace old skill names with their `/wiki` equivalents:
- `/llm-wiki` → `/wiki` (or `/wiki ingest`, `/wiki query`, `/wiki lint` depending on context)
- `/convert-wiki` → `/wiki convert`
- `/gsd-wiki-writeback` → describe the new flow: "GSD stages to `raw/gsd/`, wiki ingests"
- `/research-to-wiki` → `/wiki research`
- `/ingest-aios-drops` → `/wiki ingest`
- `llm-wiki pattern` → `wiki pattern` or just `project wiki` (the pattern reference in partners-for-sight)

Read each file, understand the context of the reference, and make the appropriate replacement. Some references are to the pattern/concept (keep "wiki pattern"), not the skill name.

- [ ] **Step 3: Update BrandOS memory entries**

Update the BrandOS project memory that references old skills:
- `~/.claude/projects/-Users-justinlobaito-repos-brandos/memory/project_gsd-wiki-contract.md` — update to reference the new staging model
- `~/.claude/projects/-Users-justinlobaito-repos-brandos/memory/feedback_cross-ref-wiki-on-quick-changes.md` — this logic is now built into the `/wiki` staleness guard. Update the memory to reference the skill instead.

- [ ] **Step 4: Find and update references in project repos**

```bash
for repo in brandos iowa-everywhere mr-gym-online-store thermal-kitchen deploy-answers inside-out; do
  echo "=== $repo ==="
  grep -rn '/llm-wiki\|/convert-wiki\|/gsd-wiki-writeback\|/research-to-wiki\|/ingest-aios-drops' \
    "/Users/justinlobaito/repos/$repo/" --include='*.md' 2>/dev/null | grep -v .git
done
```

Update each reference in context. Changes in project repos should be committed in those repos.

- [ ] **Step 5: Commit claude-os reference updates**

```bash
cd /Users/justinlobaito/repos/claude-os
git add -A
git commit -m "chore: update all references from old wiki skills to /wiki"
```

---

### Task 9: Verification

- [ ] **Step 1: Verify the skill loads**

```bash
ls -la ~/.claude/skills/wiki/
ls -la ~/.claude/skills/wiki/assets/
```

Expected: `SKILL.md`, `assets/WIKI-CLAUDE-TEMPLATE.md`, `assets/raw-README.md`

- [ ] **Step 2: Verify old skills are gone**

```bash
ls ~/.claude/skills/llm-wiki 2>&1
ls ~/.claude/skills/convert-wiki 2>&1
ls ~/.claude/skills/gsd-wiki-writeback 2>&1
ls ~/.claude/skills/research-to-wiki 2>&1
```

Expected: all return "No such file or directory"

- [ ] **Step 3: Verify no stale references remain in claude-os**

```bash
cd /Users/justinlobaito/repos/claude-os
grep -rn '/llm-wiki\|/convert-wiki\|/gsd-wiki-writeback\|/research-to-wiki\|/ingest-aios-drops' \
  --include='*.md' --include='*.yaml' . | grep -v node_modules | grep -v .git | grep -v '2026-06-05-unified-wiki'
```

Expected: zero results (or only historical references in archived files that are acceptable)

- [ ] **Step 4: Smoke test — invoke /wiki in a project with a wiki**

Open a new Claude Code session in the BrandOS repo and run `/wiki`. Verify:
- Wiki detection finds `docs/wiki/WIKI-CLAUDE.md`
- Smart routing suggests an appropriate mode based on context
- The skill's principles and modes are coherent

- [ ] **Step 5: Smoke test — invoke /wiki lint against BrandOS**

Run `/wiki lint` in BrandOS. Verify:
- It reads WIKI-CLAUDE.md
- It walks all wiki pages
- It identifies any mechanical issues
- It emits a receipt

- [ ] **Step 6: Smoke test — invoke /wiki in a project without GSD**

Open a session in `mr-gym-online-store` or `thermal-kitchen` and run `/wiki`. Verify:
- Wiki detection works
- No GSD-specific errors
- Modes that don't depend on `.planning/` work correctly
