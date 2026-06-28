# Unified Wiki Skill — Design Plan

**Date:** 2026-06-05
**Status:** Reviewed — cross-agent feedback incorporated
**Skill name:** `/wiki`
**Location:** `~/.claude/skills/wiki/SKILL.md`

## Problem

Wiki operations are fragmented across 5 skills:

| Skill | What it does |
|---|---|
| `llm-wiki` | Bootstrap, ingest, query, lint, record decisions |
| `convert-wiki` | Reshape existing docs into AIOS wiki layout |
| `gsd-wiki-writeback` | Transfer GSD lifecycle knowledge to wiki |
| `research-to-wiki` | Web search → stage to `raw/research/` |
| `ingest-aios-drops` | Batch-promote `raw/aios/` drops |

No skill owns cross-referencing the wiki after ad-hoc changes (staleness guard). Other skills that need wiki operations (like `/kickoff-project`) inline their own wiki logic instead of calling a canonical interface.

## Design Principles

1. **Knowledge arrives, wiki curates.** The skill is source-agnostic. It doesn't care if knowledge came from GSD, AIOS, research, or a conversation. It curates.
2. **The wiki skill is the only writer to curated pages.** External producers stage to `raw/<source>/`. Only the wiki skill and its ingest pipeline write to the curated wiki structure.
3. **WIKI-CLAUDE.md governs.** Every project's schema file controls placement, templates, and ground rules. The ingest pipeline reads it every time.
4. **Curation over completeness.** Only write what future sessions need that they can't derive from code.

## Architecture

### Invocation Patterns

Three ways the skill gets invoked:

1. **Manual with mode** — `/wiki lint`, `/wiki ingest`, `/wiki init`
2. **Natural language** — "log everything to the wiki", "wrap up the wiki", "update the wiki with what we did", "save this session to the wiki", "done, hit the wiki"
3. **Automated** — session-end wrap-up, GSD lifecycle triggers (via staged handoff)

### Modes

| Mode | Invocation | What it does |
|---|---|---|
| `init` | `/wiki init` | Bootstrap a new wiki (scaffold + template + customize). No AIOS dependency. |
| `convert` | `/wiki convert` | Reshape existing docs into wiki layout |
| `ingest` | `/wiki ingest` | Process staged `raw/` files into curated pages |
| `research` | `/wiki research <query>` | Web search → stage to `raw/research/` → optionally ingest |
| `log` | `/wiki log` or natural language | Session wrap-up — extract knowledge and write to wiki |
| `lint` | `/wiki lint` | Orphan detection, stale claims, index gaps |
| `query` | `/wiki query <question>` | Answer a question from wiki content |
| `decide` | `/wiki decide` | Record a decision to `decisions/` |
| (no args) | `/wiki` | Smart routing — detect what needs doing from context |

### Write Path Rules

Two paths, determined by whether the operation is in-session or async:

**Direct write (in-session):**
- Session wrap-up (`/wiki log`)
- Manual operations (`/wiki decide`, `/wiki lint` fixes)
- Staleness corrections
- The wiki skill IS the curator — it has full session context and writes directly to curated pages

**Staged handoff (async/background):**
- GSD background agent → writes to `raw/gsd/`
- AIOS kickoff dispatch → writes to `raw/aios/`
- Research fetch → writes to `raw/research/`
- Any external producer → writes to `raw/<source>/`
- Wiki ingests on next pass

### Source Authority Levels

Not all `raw/` subdirectories are equal. The ingest pipeline treats them differently:

| Source | Authority | Ingest behavior |
|---|---|---|
| `raw/gsd/` | **Trusted** | This work happened in this project. Auto-ingest with high confidence. |
| `raw/research/` | **Trusted provenance** | Research was requested for this project. Auto-ingest, but external claims are cited and qualified, not treated as wiki-authoritative. |
| `raw/external/` | **Trusted** | Operator-provided docs (convert-wiki). Ingest via promotion workflow. |
| `raw/aios/` | **Advisory** | AIOS thinks this might be relevant. Wiki evaluates and decides: promote, adapt, flag, or skip. |

#### AIOS Drop Evaluation

When the ingest pipeline encounters `raw/aios/` files:

1. Read the drop and its dispatch reason (metadata from AIOS)
2. Read the project's WIKI-CLAUDE.md and current wiki state
3. Evaluate: Does this fit the project's scope? Is it redundant? Does it contradict existing knowledge?
4. Four outcomes:
   - **Promote** — new, compatible information gets curated directly
   - **Adapt** — the kernel is relevant but needs reframing for this project's context
   - **Flag** — incoming claim conflicts with existing wiki knowledge; surface both claims to the operator with the existing page, incoming claim, and suggested resolution
   - **Skip** — redundant or irrelevant; leave in `raw/aios/` with a note explaining why

The project wiki has final say. AIOS is the dispatcher, not the authority.

### Automation Tiers

| Trigger | Behavior | Mechanism |
|---|---|---|
| Session end | Auto-extract knowledge, write to wiki | Natural language trigger ("wrap up", "log everything") |
| GSD lifecycle | GSD packages artifacts → stages to `raw/gsd/` → wiki auto-ingests | GSD skill stages, wiki ingests |
| Staleness guard | Flag + fix stale entries | Inline during session (when capability changes detected) + broader sweep during wrap-up |
| Raw file drops | Manual ingest | User invokes `/wiki ingest` |

### Staleness Guard

Two mechanisms:

1. **Inline catch** — during active session work, when a capability change is detected (new feature built, deferred item resolved), the skill checks wiki pages for stale references and fixes them.
2. **Wrap-up sweep** — during session wrap-up (`/wiki log`), a broader pass checks overview pages, deferred lists, capability docs, and architecture entries for anything that no longer reflects reality.

No persistent staleness report file. The wiki process is trusted.

### Write Safety

Not all fixes are equal. The skill distinguishes two categories:

- **Mechanical hygiene** — missing index entries, orphaned pages, dead wiki links, log/index formatting, decision index gaps. These are auto-fixed without confirmation.
- **Semantic claims** — wiki says X, but reality may have changed. Auto-fix only when code or an active decision clearly settles it (e.g., a deferred item that now has a shipped implementation). When the evidence is ambiguous, the skill flags the contradiction to the operator rather than silently rewriting project truth.

### Wiki Detection

The skill resolves the wiki root using these paths in order:

1. If the user passes an explicit wiki path, resolve that first
2. `docs/wiki/WIKI-CLAUDE.md` (most common — wiki nested under docs/)
3. `wiki/WIKI-CLAUDE.md` (wiki one level from repo root)
4. `WIKI-CLAUDE.md` at repo root (wiki IS the repo root)
5. If only structural markers exist (`decisions/` + `log/` but no WIKI-CLAUDE.md), detect but recommend `/wiki convert`

If no wiki is found, offer to run `/wiki init`.

### Scope Boundary

- **Current repo only.** Wiki writes target the wiki in the current working directory. No cross-repo writes.

### Relationship to Other Skills

| Skill | Relationship |
|---|---|
| `/kickoff-project` | Calls `/wiki init` for wiki bootstrapping. Seeds AIOS knowledge into `raw/aios/` for the wiki to evaluate. |
| GSD skills (`execute-phase`, `complete-milestone`, etc.) | Stage knowledge packets to `raw/gsd/`. Do NOT write to wiki directly. |
| `/deep-research`, `/exa:search` | `/wiki research` wraps the research-to-wiki flow. Other research skills stay independent (no wiki staging unless user asks). |
| AIOS dispatcher | Writes to `raw/aios/` in project repos. Wiki skill handles receiving and evaluating. |

### What Gets Deleted

All 5 existing skills are absorbed and deleted:

1. `~/.claude/skills/llm-wiki/` — core logic moves to `/wiki`
2. `~/.claude/skills/convert-wiki/` — becomes `/wiki convert` mode
3. `~/.claude/skills/gsd-wiki-writeback/` — GSD stages to `raw/gsd/`, wiki ingests
4. `~/.claude/skills/research-to-wiki/` — becomes `/wiki research` mode
5. `~/.claude/skills/ingest-aios-drops/` — absorbed into `/wiki ingest` with advisory evaluation

References to update after deletion:
- Project CLAUDE.md files that mention old skill names
- Memory entries (e.g., `project_gsd-wiki-contract.md` in BrandOS)
- The `feedback_cross-ref-wiki-on-quick-changes.md` entry (logic now built into the skill)
- `clients.yaml` if any `docs_paths` comments reference old skills

### Template

The skill ships with a canonical WIKI-CLAUDE.md template containing:
- Universal ground rules (markdown only, log is append-only, raw is read-only, decisions immutability)
- Placeholder sections for project-specific rules (filled at `/wiki init` time)
- File-authority map template
- Decision page template
- Auto-memory boundary rules

Iowa Everywhere is no longer the canonical source. The skill template is.

## Modes — Detailed Behavior

### `init` — Bootstrap a new wiki

1. Check for existing `docs/wiki/WIKI-CLAUDE.md` — abort if present
2. Scaffold the directory structure
3. Copy and customize the WIKI-CLAUDE.md template (project name, scope exclusions)
4. Create `index.md`, `overview.md`, `log/` with initial entry
5. Create `raw/` with subdirectory README
6. If existing docs are detected, suggest `/wiki convert` instead
7. No AIOS dependency. Works from any project directory.

### `convert` — Reshape existing docs

Absorbs current `convert-wiki` logic:
1. Detect existing docs/wiki content
2. Scaffold AIOS skeleton
3. Stage existing content verbatim in `raw/external/`
4. Promote into curated sections
5. Write WIKI-CLAUDE.md, register with clients.yaml
6. Idempotent — detects prior conversion and aborts

### `ingest` — Process staged raw/ files

1. Scan all `raw/` subdirectories for unprocessed files
2. Apply source authority level (trusted vs advisory)
3. For trusted sources: read → draft curated entries → write → update index → log
4. For research sources: ingest but cite and qualify external claims (trusted provenance, not trusted truth)
5. For advisory sources (AIOS): evaluate against WIKI-CLAUDE.md → promote/adapt/flag/skip
6. Update `index.md` and append to `log/`
7. Emit structured receipt (see Operation Receipts)

### `research` — Web search to wiki staging

Absorbs current `research-to-wiki` logic:
1. Run web search (Exa/Firecrawl)
2. Fetch and pre-analyze sources
3. Stage to `raw/research/`
4. Log the research session
5. Optionally trigger ingest

### `log` — Session wrap-up

1. Review the session: recent commits, files changed, decisions made in conversation
2. Extract wiki-worthy knowledge (decisions, architecture patterns, capability changes, deferrals)
3. Write directly to curated pages (in-session = direct write)
4. Run staleness sweep across overview, deferred lists, architecture
5. Update `index.md`, append to `log/`
6. No review gate — wiki process is trusted

### `lint` — Wiki health check

1. Orphan detection (pages not in index)
2. Index gaps (index entries pointing to missing pages)
3. Stale claims (wiki says X, code says Y)
4. Cross-reference integrity (links that point nowhere)
5. Lifecycle drift (deferred decisions whose work shipped, active decisions whose triggers fired)
6. Mechanical issues are auto-fixed. Semantic contradictions follow Write Safety rules (fix when authority is clear, flag when ambiguous).
7. Emit structured receipt

### `query` — Answer from wiki

1. Read `index.md` to find relevant pages
2. Read and synthesize answer
3. Cite wiki pages used
4. If synthesis is reusable, offer to file it

### `decide` — Record a decision

1. Read WIKI-CLAUDE.md for decision template
2. Check for duplicate in `decisions/`
3. Write decision file with context, rationale, and "do not relitigate" trigger if applicable
4. Update `decisions/index.md`
5. Walk wiki pages affected by the decision and update them
6. Append to `log/`

## Operation Receipts

Every write-producing mode emits a consistent summary when it completes:

- Files created
- Files updated
- Files skipped (with reason)
- Decisions recorded
- Flagged/contested items requiring operator attention
- Suggested next action (if any)

This is terminal output, not a persistent file. Keeps the operator informed and makes future automation (UI, routines) easier to build on top of.

## Migration Strategy

No compatibility shims. The old skill names are referenced in ~25 markdown files across repos, not in executable code. Migration is a single pass:

1. Build `/wiki` skill at `~/.claude/skills/wiki/`
2. Write the canonical WIKI-CLAUDE.md template as a bundled asset
3. Sweep all references to old skill names across repos (CLAUDE.md files, memory entries, wiki pages, ADRs, clients.yaml comments) and update to `/wiki` equivalents
4. Delete old skill directories: `llm-wiki/`, `convert-wiki/`, `gsd-wiki-writeback/`, `research-to-wiki/`, `ingest-aios-drops/`
5. Test against BrandOS wiki (most mature, has GSD) and one wiki-only project (e.g., Mr Gym or Thermal Kitchen)
6. Update GSD skills that currently invoke `gsd-wiki-writeback` to instead stage knowledge packets to `raw/gsd/`

## Cross-Agent Review (2026-06-05)

Feedback incorporated from Codex review. Changes made:

| Concern | Resolution |
|---|---|
| Compatibility shims during migration | **Pushed back.** No runtime dependencies on old names — only markdown references. Reference sweep replaces shims. |
| Add Flag/Contested ingest outcome | **Adopted.** Fourth outcome for AIOS drops when incoming claims conflict with existing wiki. |
| Source provenance vs claim authority | **Partially adopted.** Research sources get "trusted provenance" label with behavioral rule: cite and qualify external claims, don't treat as wiki-authoritative. Not formalized as a two-column model. |
| Multi-path wiki detection | **Adopted.** Five detection paths matching existing AIOS semantics. |
| Narrow "fix directly" for semantic claims | **Adopted.** New Write Safety section: mechanical = auto-fix, semantic = only when authority is clear, ambiguous = flag. |
| Structured operation receipts | **Adopted.** Every write mode emits a consistent summary. |

## Next Steps

1. Write the SKILL.md
2. Write the canonical WIKI-CLAUDE.md template (bundled asset)
3. Follow migration strategy: sweep references, delete old skills, update GSD callers
4. Test against BrandOS wiki (GSD project) and one wiki-only project
