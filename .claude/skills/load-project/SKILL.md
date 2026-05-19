---
name: load-project
description: Use when Justin says "/load {project}", "load the {project} project", "switch to {project}", "give me everything on {project}", "hydrate {project} context", or any variant of "I'm working on {X} now, bring me up to speed". Hydrates per-project context (memory, references, decisions, external repo docs, recent Gmail, upcoming Calendar) from clients.yaml into the current session. Pure read-only; no state writes.
bike-method-phase: 1
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

Hydrates a **single project's full working context** into the current Claude Code session in one command. Reads from:

1. **In-claude-os sources** — `memory/project_{slug}_*.md`, `references/*` paths registered in `clients.yaml`, `decisions/log.md` filtered by client + project slug
2. **External repos** — directories registered as `docs_paths:` (e.g., `/Users/justinlobaito/repos/terraplex-spoke-hub/`)
3. **LLM-wiki structures inside external repos** — when a `docs_paths` entry is (or contains) an llm-wiki, its `decisions/active/`, `decisions/deferred/`, `log/`, and indexes are promoted to first-class content. See Step 4a.
4. **Recent Gmail** — threads in the last 7 days matching the project's `contacts:` array
5. **Upcoming Calendar** — next 14 days, attendees matching `contacts:`

Output is a Markdown brief printed into the session. Pure read-only — no files written, no Gmail drafts created, no state tracked.

**LLM-wiki is the durable home for per-project decisions and knowledge.** Justin is rolling the llm-wiki pattern out across every project. Project-specific decisions live in their wiki, not in the cross-project `decisions/log.md`. This skill treats wikis as canonical: every `decisions/active/*.md` and `decisions/deferred/*.md` gets read in full on default load, and the most-recent N `log/` entries are read in full. That way `/load {project}` is the single command that answers "what decisions did I make on this project, and what's currently locked?"

Closes the gap from `/audit` baseline: per-project deep-context loading without leaving claude-os. Complements `/weekly-project-status` (cross-project synthesis) and `/daily-inbox-triage` (cross-project inbox queue).

## When to run

- **Manual run, on project switch.** "I'm working on Thermal Kitchen now" → `/load thermal-kitchen`. Bike Method Phase 1 — manual only, no auto-load.
- **Re-load** mid-session if you've been doing other work and want to refresh the project state (Gmail may have new threads).
- **Compose** by running twice when you need two projects loaded simultaneously (e.g., `/load brandos`, then `/load wild-rose` to compare capacity tradeoffs).

## Today's context

- **Date:** {today}
- **Canonical registry:** `clients.yaml` at repo root
- **Active project slugs** (read from `clients.yaml`):
  see [clients.yaml](../../../clients.yaml) for the live list

## Execution

### Step 1 — Parse arguments

Input forms:
- `/load {slug}` — try `slug` as a project-slug across all clients
- `/load {client}/{project}` — compound form, unambiguous
- `/load {slug} --full` — full mode (reads contents of nested files in `docs_paths` directories)
- `/load` (no arg) — print the list of active project slugs from `clients.yaml` and exit

### Step 2 — Resolve the project

Read `clients.yaml`. Resolution algorithm:

1. **Exact project-slug match.** If exactly one project across all clients has `slug: {input}`, load it.
2. **Exact client/project compound match.** If input contains `/` and matches a `{client-slug}/{project-slug}` pair, load it.
3. **Multiple project-slug matches.** Print all matches in `{client-slug}/{project-slug}` form, ask user to specify. Exit without loading.
4. **Zero matches.** Print "No project found." plus 3 closest project slugs by Levenshtein distance. Exit without loading.

Print confirmation header at the top of the load output:

```
> /load {input}
Loaded: {client-slug}/{project-slug} ({status})
Sources read: N in-claude-os files, M external directories, Gmail last 7 days, Calendar next 14 days.
─────────────────────────────────
```

### Step 3 — Read in-claude-os memory + references + decisions

**Memory:**
- Glob `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/project_*.md`
- Filter by frontmatter `client: {client-slug}` AND `project: {project-slug}` (or memory filename containing project slug as fallback if frontmatter is missing)
- Read **full contents** of matching files

**References / docs_paths (in-claude-os):**
- For each `docs_paths` entry that resolves to a relative path inside claude-os, read full contents
- For glob patterns like `references/brand*.md`, expand single-star globs; do not support `**` recursive globs

**Decisions:**
- Grep `decisions/log.md` for client slug AND/OR project name (case-insensitive)
- Pull entries from the last 90 days
- Include the headline, "Why" first paragraph, and any "Open follow-ups" section

### Step 4a — Detect and hydrate LLM-wiki structures (FIRST-CLASS)

Before the generic external walk, check each `docs_paths` entry that resolves to a directory for an **LLM-wiki structure**. Detection is positive when ANY of:

- A `WIKI-CLAUDE.md` file exists at the directory root (highest-confidence marker).
- A `wiki/WIKI-CLAUDE.md` exists one level down (the path points at the parent of the wiki — common when `docs_paths` is registered as `repo/docs/`).
- Both `decisions/` and `log/` subdirectories exist at the same level (structural marker — works even if `WIKI-CLAUDE.md` is missing).

When detected, locate the **wiki root** (the directory containing `WIKI-CLAUDE.md` or the `decisions/` + `log/` pair) and hydrate it as follows. The generic walk in Step 4 then **skips the wiki root** to avoid duplication; everything else in the registered `docs_paths` directory still gets the generic treatment.

**Full-content reads (default mode):**

1. **`WIKI-CLAUDE.md`** at wiki root — agent-facing schema. Read first.
2. **`README.md`** at wiki root — orientation.
3. **`index.md`** at wiki root, if present.
4. **`decisions/index.md`** — table of contents for decisions lifecycle.
5. **`decisions/active/*.md`** — every active decision, full contents. These are currently locked and load-bearing.
6. **`decisions/deferred/*.md`** — every deferred decision, full contents. These carry revisit triggers and open questions.
7. **Recent log entries:** read full contents of the **most-recent 10** files in `log/` by filename date (filenames are conventionally `YYYY-MM-DD-<slug>.md`). Sort by the date in the filename, fall back to file mtime if filename doesn't parse.
8. **`CONTEXT.md`** at the **parent repo root** (one level above the wiki — often the canonical glossary per the `grill-with-docs` pattern). If present, read in full.

**Manifest-only (default mode; full contents on `--full`):**

- `decisions/superseded/*.md` — historical context. List with date + title only.
- `decisions/implemented/*.md` — shipped work. List with date + title only.
- All other wiki sections (`plans/`, `architecture/`, `research/`, `strategy/`, `synthesis/`, `raw/`) — list per-section index file (if present) and a paths-only manifest of section contents.

**On `--full`:** every manifest-only file gets read in full, with the standard 500-line per-file cap.

**Per-file caps:** standard exclusions and the 250KB binary cap from Step 4 apply.

**Output shape for an LLM-wiki in default mode:**

```markdown
### LLM-wiki: /path/to/wiki/

**Schema + orientation (full):**
- WIKI-CLAUDE.md ({date})
  [full content]
- README.md ({date})
  [full content]

**Active decisions (full — currently locked):**
- decisions/active/2026-05-18-dealer-portal-pricing-model.md
  [full content]
- ...

**Deferred decisions (full — revisit triggers attached):**
- decisions/deferred/2026-05-18-vertical-expansion.md
  [full content]
- ...

**Recent log entries (full — last 10 ingest events):**
- log/2026-05-18-positioning-rewrite-and-deferrals.md
  [full content]
- ...

**Glossary (CONTEXT.md at repo root, full):**
- /path/to/repo/CONTEXT.md
  [full content]

**Lifecycle manifest (paths only — use --full or ask for a specific file):**
- decisions/superseded/...
- decisions/implemented/...

**Section manifests (paths only):**
- strategy/index.md → strategy/{file}.md, ...
- architecture/index.md → ...
- plans/index.md → ...
- research/index.md → ...
- raw/...
```

If the wiki has >50 active+deferred decisions combined, print a "reading wiki, one moment..." line and continue — don't skip.

### Step 4 — Walk external docs_paths directories (non-wiki)

For each `docs_paths` entry (or sub-tree of one) **not already hydrated by Step 4a**:

1. **Verify path exists.** If missing, print one-line graceful skip note and continue. Do not error.
2. **Walk recursive** with standard exclusions:
   - Skip: `.git/`, `.svn/`, `.hg/`, `node_modules/`, `vendor/`, `__pycache__/`, `dist/`, `build/`, `out/`, `target/`, `.DS_Store`, `Thumbs.db`
   - Skip files >250KB (binary-treat — manifest entry only)
   - Skip hidden dot-files at top level
   - **Skip the wiki root subtree** if Step 4a already hydrated it from this same `docs_paths` entry
3. **File-type whitelist:** `.md`, `.mdx`, `.markdown`, `.txt`, `.rst`, `.adoc`
4. **Tiering by depth:**
   - **Top-level files** (depth 0 within the directory): include full contents in default load
   - **Nested files** (depth ≥ 1): manifest-only in default load — print path + size + last-modified + first-line-of-frontmatter if present
   - **`--full` flag:** read full contents of all nested files too, with per-file cap of 500 lines (note truncation in output)

Output shape for an external directory in **default mode**:

```markdown
### docs_paths: /path/to/external/repo/

**Top-level (contents below):**
- README.md (1.4KB, 2026-05-11)
  [full content here]
- OVERVIEW.md (3.2KB, 2026-05-09)
  [full content here]

**Manifest (paths only — request a specific file by name or use --full to read all):**
- subfolder/policies.md (3.2KB, 2026-05-09) — *first-line-of-frontmatter if present*
- subfolder/decisions.md (2.1KB, 2026-05-02)
- ...
```

In **`--full` mode**, nested files get their contents under each manifest entry, capped at 500 lines with truncation marker.

### Step 5 — Pull recent Gmail

If `contacts:` is empty or missing, print one-line skip note and continue. Otherwise:

Use `mcp__claude_ai_Gmail__search_threads` with a query built from the contacts list. Example pattern:

```
({build from contacts: from:deann@thermalkitchen.com OR to:deann@thermalkitchen.com OR ...})
newer_than:7d
```

For `@domain.com` patterns, expand to `from:*@domain.com OR to:*@domain.com` (or the Gmail equivalent — `from:domain.com` works as a substring match in Gmail's query language).

Cap at 10 threads. Output:

```markdown
### Recent Gmail (last 7 days)

**Unanswered (you owe a reply):**
- {sender} — {subject} ({days waiting})

**Active threads:**
- {sender} — {subject} ({last activity date})

**Drafts / sent in window:**
- {recipient} — {subject} ({date})
```

Cross-reference unanswered logic with `/daily-inbox-triage` heuristic: last message inbound + >18hr old.

### Step 6 — Pull upcoming Calendar

If `contacts:` is empty, skip. Otherwise:

Use Google Calendar tools to find events in the next 14 days whose attendees match `contacts:`. Cap at 20 events.

Output:

```markdown
### Upcoming Calendar (next 14 days)

- {date} {time} — {event title} ({attendees matching project})
```

### Step 7 — Synthesize open follow-ups

Scan all read sources for explicit open follow-ups, deadlines, and "TODO" markers. Sources to scan:

- Memory files (`Open follow-ups:` blocks, `**Why:**` lines with deadlines)
- `decisions/log.md` entries (`Open follow-ups:` sections within entries in the 90-day window)
- **LLM-wiki `decisions/active/*.md`** — each active ADR's "Do not relitigate without" triggers and any explicit open questions
- **LLM-wiki `decisions/deferred/*.md`** — the revisit triggers attached to each deferred decision
- **LLM-wiki recent `log/*.md` entries** — `Open follow-ups`, `Effect on iteration`, deadlines mentioned
- Gmail draft mentions

Output:

```markdown
### Open follow-ups

- [deadline-or-blank] — {follow-up description} (source: {memory|decisions-log|wiki-active|wiki-deferred|wiki-log|email})
```

Surface anything dated within the next 30 days at the top, sorted by date.

### Step 8 — Final consolidated brief

Assemble the full output in this order:

1. Header (project name, status, sources read — explicitly note "LLM-wiki detected at {path}" if Step 4a fired)
2. Project state — full contents of all memory files
3. Reference docs — full contents of in-claude-os docs_paths
4. **Decisions for this project — merged view:**
   - **A. LLM-wiki active decisions** (locked, currently in force) — promoted from Step 4a
   - **B. LLM-wiki deferred decisions** (revisit triggers attached) — promoted from Step 4a
   - **C. LLM-wiki recent log entries** (last 10 ingest events) — promoted from Step 4a
   - **D. claude-os `decisions/log.md`** (cross-project) entries matching this project in the last 90 days
   - Sort sections A+B+C chronologically by date; D is its own block beneath.
5. LLM-wiki schema + glossary — `WIKI-CLAUDE.md`, `README.md`, `decisions/index.md`, repo-root `CONTEXT.md` (full content from Step 4a)
6. Open follow-ups (synthesized, sorted by date)
7. Recent Gmail (last 7 days)
8. Upcoming Calendar (next 14 days)
9. LLM-wiki lifecycle + section manifests (paths only — superseded/implemented decisions, strategy/architecture/plans/research/raw)
10. External docs_paths non-wiki (top-level contents + nested manifest, or full if --full)

Close with one-line summary: "Loaded {X} bytes of context for `{client}/{project}` (LLM-wiki: {yes|no}). Ready for work."

## Output contract

Every run produces:

1. **One consolidated Markdown brief** in chat — header + project state + decisions + follow-ups + Gmail + Calendar + external docs (tiered).
2. **No file writes.** No memory updates. No Gmail drafts. No state log.

If anything in the brief surfaces a decision Justin acts on later, log it manually via `decisions/log.md` (or via the standing memory pattern). This skill is pure read.

## Critical implementation rules

1. **Read-only.** No writes, ever, except for graceful one-line "skipped X" notes printed inline.
2. **Graceful degradation.** Missing external path? Skip with note. Missing `contacts:`? Skip Gmail/Calendar steps with note. Missing memory? Show "no memory entries yet" placeholder. Never error out — always produce a usable brief.
3. **Single project per call.** No multi-project support; user composes by running twice.
4. **Slug-only with collision prompt.** Don't fuzzy-match. Print disambiguation options instead.
5. **Don't auto-discover paths.** Read `clients.yaml` only. If a path isn't registered, it's not in scope.
6. **Respect per-file caps.** 250KB max for content inclusion. 500-line cap on `--full` per file.
7. **Manifest tiering by depth — with LLM-wiki override.** Default: top-level content, nested manifest. **Exception:** when a directory is detected as an LLM-wiki (Step 4a), the wiki's `decisions/active/*.md`, `decisions/deferred/*.md`, most-recent 10 `log/*.md`, and schema/glossary files are promoted to full-content regardless of depth. LLM-wiki is the canonical home for per-project decisions and **must not be buried in a paths-only manifest**.
8. **Don't restate raw `clients.yaml` verbatim.** The brief is a hydrated view of context, not a dump of the registry.
9. **2RM work is out of scope.** If a project's contacts include 2RM addresses (`*@tworivers.com`, `*@2rm.com`), skip those for Gmail/Calendar queries per CLAUDE.md.
10. **Stay under ~60s wall-clock** for default mode on average-sized projects. `--full` mode may take longer; print a "reading wiki / external docs, one moment..." line if a wiki has >20 active+deferred decisions combined OR a non-wiki directory has >50 files.
11. **LLM-wiki detection is mandatory.** Every external `docs_paths` directory MUST be checked for the llm-wiki markers in Step 4a before generic walking. Missing this check is the failure mode that prompted this rule — the canonical per-project decision store is invisible if generic depth-tiering wins.

## KPI (Method spec)

- **Bucket:** Less cost (less time-to-context per project switch).
- **Metric:** Time from "I need to work on X" to "I have full X context loaded" drops from N file-reads + 2-3 memory walks + Gmail searches (~3-5 min manually) to one command (<60s).
- **Baseline:** 2026-05-18 — manual context assembly takes 3-5 minutes per project switch.
- **Target:** First `/load brandos` produces a usable brief in <60s on first run.

## Bike Method phasing

- **Phase 1 (current):** Manual run only. User invokes `/load {project}` when switching focus. No scheduled triggers. No state writes.
- **Phase 2 (after 14 clean days):** Share underlying primitive with `/weekly-project-status` so both skills read the same "what is this project right now" function. Refactor without changing user surface.
- **Phase 3:** Lightweight state (last-loaded timestamps in a sidecar file like `briefs/project_state.json`) IF a real downstream need emerges (e.g., bias `/daily-inbox-triage` toward today's loaded project). YAGNI until then.
- **Phase 4:** Pre-load suggestions — when Calendar has a meeting starting in 30 min with project contacts, suggest `/load {project}` proactively.

Advance phases by editing the frontmatter `bike-method-phase` value. Do not auto-advance.

## First-run notes

The first `/load brandos` will surface gaps in `clients.yaml` — specifically, dealer contact emails that are TODO-commented. After the first run, capture missing contacts back to `clients.yaml` so subsequent runs are complete. The skill itself does not write back; the user does (or asks Claude to).

External repos verified to exist on this machine as of 2026-05-18:
- `/Users/justinlobaito/repos/terraplex-spoke-hub/` ✓
- `/Users/justinlobaito/repos/site-builder-phase2/docs/` ✓ — contains `wiki/` LLM-wiki structure (Step 4a fires)
- `/Users/justinlobaito/repos/terraplex-onboarding-form/` ✓ (registered later if needed)

If laptop/dev machine changes, these paths may not resolve. The graceful-skip pattern handles this; refresh the paths in `clients.yaml` on the new machine.

## LLM-wiki rollout context

Justin is integrating the `llm-wiki` pattern (see `llm-wiki` skill) into every project. Going forward, the durable home for per-project decisions is **the project's own wiki**, not the cross-project `decisions/log.md` in claude-os. The split is:

- **`claude-os/decisions/log.md`** = cross-cutting AIOS / business / multi-project decisions (e.g., shipping a new skill, partnership go/no-go, 30-day BrandOS growth target).
- **`{project-repo}/docs/wiki/decisions/`** = project-internal decisions (e.g., dealer-portal pricing model, propagation determinism, tenant substrate). Lifecycle managed via `active/`, `deferred/`, `implemented/`, `superseded/`.

`/load-project` merges both views in the brief. If you find yourself logging a project-internal decision to `claude-os/decisions/log.md`, that's a signal it should be in the project's wiki instead.

**Registering a new project with a wiki:** Add the directory that contains `WIKI-CLAUDE.md` (or its parent `docs/`) to the project's `docs_paths:` in `clients.yaml`. Step 4a auto-detects from there. No per-project config needed.

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
