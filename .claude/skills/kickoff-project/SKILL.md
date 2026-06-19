---
name: kickoff-project
description: Pass off everything Justin's AIOS knows about a project to seed a new project's wiki — operates as a senior project manager running a kickoff meeting with the dev team. Gathers memory, decisions log entries, references, brainstorm notes, adjacent-client context, and clients.yaml metadata for the project; asks the operator a few targeted questions to fill gaps AIOS doesn't already know (success criteria, milestones, ownership, risks); seeds an LLM-wiki-pattern knowledge base under /Users/justinlobaito/repos/<slug>/docs/wiki/ (creating + git-init'ing the repo if missing); writes a project-root CLAUDE.md modeled on Iowa Everywhere's convention so future Claude sessions know how to operate; dumps any related raw materials Justin already has (Gemini meeting notes, transcripts, PDFs, screenshots) into the wiki's raw/ folder; runs an llm-wiki-style ingest pass over those raw materials; spawns a sub-agent to verify the seed by asking "Give me your understanding of this project"; then updates clients.yaml docs_paths so AIOS knows about the new wiki. Use whenever the user says "kickoff project X", "start project X", "seed the wiki for X", "hand off X to the team", "pass off context for X", "I'm about to start working on X", or anything that sounds like a project kickoff or context handoff. Also use when moving a project from "brewing in AIOS" stage to "active build" stage, or when bootstrapping a fresh repo from existing AIOS knowledge.
---

# Kickoff Project

You are a senior project manager running a kickoff meeting. The team (the developer reading the new project's wiki) is about to inherit a project that's been brewing inside Justin's AIOS for weeks or months. Your job is to **pass off everything Justin knows** about this project — the goals, the people, the decisions made so far, the constraints, the timeline — into a fresh wiki the team can operate from on day one.

You're not creating new strategy. You're translating accumulated context into something the team can read in 10 minutes and start building.

## What this skill does

Eleven phases. Run in order — each depends on the prior.

1. **Resolve** — figure out which project we're seeding, whether the target directory exists, whether the project is already in `clients.yaml`.
2. **Gather** — pull everything AIOS knows about the project from memory, decisions, references, brainstorm, adjacent-client context.
3. **Interview** — ask only what AIOS doesn't already know. Target 3-6 questions; batch them via the user's question prompt UI if available.
4. **Seed wiki** — bootstrap the LLM-wiki at `docs/wiki/` using gathered context + interview answers. Schema file MUST be named `WIKI-CLAUDE.md` (AIOS's `detectWiki()` looks for that, not `SCHEMA.md`).
5. **Write CLAUDE.md + .gitignore** — write a project-root `CLAUDE.md` modeled on the Iowa Everywhere convention so future Claude sessions know to read the wiki first; write a `.gitignore` covering at least `.DS_Store`.
6. **Gut-check sub-agent** — spawn an isolated sub-agent with the new project directory as cwd. Ask: "Give me your understanding of this project." Report back what it said.
7. **Dump external raw docs** — search Justin's filesystem (claude-os `docs/` folder at minimum, plus anywhere else Gemini notes / transcripts / PDFs live) for any file related to the project. Copy matching files into `docs/wiki/raw/external/`.
8. **Ingest raw docs into the wiki** — for each newly-dumped raw file, follow the llm-wiki ingest workflow: read end-to-end, write a `wiki/sources/YYYY-MM-DD-<slug>.md` summary page, integrate the source into relevant wiki pages, append a log entry.
9. **Sync clients.yaml** — point the project's `docs_paths` at `/Users/justinlobaito/repos/<slug>/docs` (not the repo root). AIOS detectWiki walks one level down from there to find `wiki/WIKI-CLAUDE.md`.
10. **Initial git commit** — make a clean baseline commit inside the new repo so the project starts from a known state.
11. **Report back** — summary of what was seeded, what was dumped, what the gut-check said, what's still open.

## Where things live

- **AIOS repo root**: `/Users/justinlobaito/repos/claude-os/`
- **clients registry**: `/Users/justinlobaito/repos/claude-os/clients.yaml`
- **decisions log**: `/Users/justinlobaito/repos/claude-os/decisions/log.md`
- **references**: `/Users/justinlobaito/repos/claude-os/references/`
- **brainstorm**: `/Users/justinlobaito/repos/claude-os/brainstorm/`
- **claude-os docs (PDFs, transcripts, etc.)**: `/Users/justinlobaito/repos/claude-os/docs/`
- **auto-memory dir**: `/Users/justinlobaito/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/`
- **target wiki**: `/Users/justinlobaito/repos/<project-slug>/docs/wiki/`
- **target CLAUDE.md**: `/Users/justinlobaito/repos/<project-slug>/CLAUDE.md`
- **CLAUDE.md reference template**: `/Users/justinlobaito/repos/iowa-everywhere/CLAUDE.md`
- **wiki schema reference template**: `/Users/justinlobaito/repos/iowa-everywhere/docs/wiki/WIKI-CLAUDE.md`

## Invocation

The user provides a project slug (kebab-case, matches the GitHub repo name and the `slug` field in clients.yaml). If they don't, ask:

> Which project? Give me the slug — same name as the repo at `~/repos/<slug>/`.

Don't proceed without a slug.

---

## Phase 1: Resolve

### 1a. Check the target repo directory

Check `/Users/justinlobaito/repos/<slug>/`. Three outcomes:

- **Exists with `.git/`**: good, use as-is.
- **Exists without `.git/`**: run `git init -b main` inside.
- **Doesn't exist**: create the directory and run `git init -b main` inside. Tell the operator you did this — they may want to set up a remote.

If a `docs/wiki/` folder already exists at the target with a `WIKI-CLAUDE.md` (or `SCHEMA.md` from an older bootstrap), **stop and ask** before overwriting. Seeding a non-empty wiki is destructive.

### 1b. Check clients.yaml

Read `/Users/justinlobaito/repos/claude-os/clients.yaml`. Search for a project entry with `slug: <input-slug>` under any client's `projects:` list.

- **Found**: note the client slug, project name, status, contract, MRR, contacts, and current `docs_paths`. You'll append to `docs_paths` in Phase 9.
- **Not found**: the project is new to AIOS. Collect the minimum metadata during the interview (Phase 3) and write a fresh entry in Phase 9.

If the client itself isn't in clients.yaml, ask Justin which existing client to attach this project to — don't create new client entries silently. Clients deserve their own intake (`/onboard-client` handles that).

---

## Phase 2: Gather

Pull every piece of context AIOS has about this project. Collect file paths + short excerpts; don't read everything into your reasoning at once.

### Sources to scan

1. **clients.yaml entry** for the project (Phase 1).
2. **Adjacent client context.** Once you've identified the parent client, also scan for files mentioning the OTHER projects under that same client. The Wild Rose Casinos work, for example, has a `references/wild-rose-project.md` that contains a Thermal Kitchen section — the parent-client doc routinely carries early framing that matters. Same for Kirke LLC, Liebl MG, etc. when those orgs broker engagements.
3. **Auto-memory files** at `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/` — grep filenames + bodies for the slug, the project's human name, and any client-level alias. Memory frontmatter has `name:` / `description:` / `metadata.type:` — capture for citation. Don't skip `MEMORY.md` (the index).
4. **Decisions log** at `decisions/log.md` — grep for project name + slug. Entries follow `## YYYY-MM-DD — Title` then body until next `---` or `## `. Collect every section that mentions the project. Note which decisions have been **superseded** by later entries — those carry historical weight but shouldn't drive current behavior.
5. **References** at `references/` — files whose name contains the slug or the project's human name. Read these in full; they tend to be primary sources.
6. **Brainstorm** at `brainstorm/` — same name-matching pass.
7. **CLAUDE.md + CONTEXT.md** at the AIOS repo root — only excerpt lines that mention the project. These usually carry client/business framing worth preserving.
8. **Justin's docs/ folder** at `/Users/justinlobaito/repos/claude-os/docs/` — note (but don't copy yet) any PDFs, .docx, .txt, .md, .png files whose name mentions the project. These get DUMPED in Phase 7, not yet — but knowing they exist informs Phase 4 sources/.

For each source you find, note:
- Full file path
- One-line summary of what it says about the project
- The date (frontmatter, filename date prefix, or file mtime)

Don't paste full file bodies — that's what `raw/` is for.

### Build the working brief

Assemble in your head (or as scratch markdown):

- **What this project is** — 1-2 sentences from the strongest sources.
- **Why it matters** — strategic context from CLAUDE.md / decisions.
- **Where it stands** — latest activity from decisions + memory. Absolute dates only.
- **People** — every name + email mentioned across sources, with role if known.
- **Decisions already made** — chronological list, citing source. Flag supersessions.
- **Recent activity** — last 30-60 days.
- **What's not yet decided** — open questions, deferred items, anything explicitly TBD.

This becomes the kickoff packet for `docs/wiki/overview.md` in Phase 4.

---

## Phase 3: Interview

You've loaded the AIOS context. Find the gaps and fill them — like a real senior PM would in the first 30 minutes of a kickoff.

### Only ask what AIOS doesn't already know

Look at the working brief and identify which of these has thin/missing context:

| Category | What "filled in" looks like |
|---|---|
| Success criteria | "Launch by X date with Y feature working" — not "make it good" |
| Milestones / dates | At least 2-3 dated checkpoints on the way to done |
| Ownership | Who's the dev lead, who's the client point of contact, who approves |
| MVP scope | What ships in v1 vs nice-to-have |
| Constraints | Budget, tech stack, hard deadlines, dependencies |
| Known risks | What's likely to go wrong, what's blocking |
| Comm cadence | How often you talk to the client, channel, who initiates |
| Definition of done | Handed off? Ongoing maintenance? Sunset? |

For each: do I have enough? If yes, skip. If no, queue a question.

**Cap at 6 questions.** If the platform has a structured user-question tool (AskUserQuestion or similar) that presents multiple cards at once, batch all your questions into one prompt — it respects Justin's time better than 5 sequential turns. Acknowledge what AIOS already knows in your framing so Justin sees you're not making him repeat himself.

### Question style

Senior PM, not bureaucratic project tracker. Match Justin's voice from the AIOS CLAUDE.md: direct, no fluff, short sentences, no em dashes in your prompts, plain English. Examples:

**Bad**: *"What are the success criteria for this project?"*
**Good**: *"Looking at memory, this project is the Wild Rose banquet site relaunch. AIOS doesn't say what 'done' means. Is it 'live before the next event', a specific feature set, or something else?"*

**Bad**: *"Who are the stakeholders?"*
**Good**: *"I see Cherity and Frank Lama mentioned in memory. Are either of them the day-to-day point of contact, or is someone else the primary client voice?"*

When you have the answers, you have the full kickoff packet.

---

## Phase 4: Seed wiki

You're bootstrapping the LLM-wiki at `/Users/justinlobaito/repos/<slug>/docs/wiki/`. Conventions match Iowa Everywhere's wiki (see `/Users/justinlobaito/repos/iowa-everywhere/docs/wiki/` for the reference layout).

### 4a. Create the structure

```
<target>/
├── docs/
│   └── wiki/
│       ├── WIKI-CLAUDE.md         schema (must be this name for AIOS detectWiki)
│       ├── index.md               catalog of every page
│       ├── log.md                 chronological event log
│       ├── overview.md            the kickoff brief
│       ├── sources/               per-source summary pages
│       ├── decisions/             ADR-style decisions (NNNN-<slug>.md)
│       └── raw/
│           ├── README.md          how-to-ingest
│           ├── aios-snapshot/     frozen copies of AIOS source material
│           └── external/          (created in Phase 7) PDFs / transcripts / etc.
```

### 4b. Snapshot AIOS sources

Copy the actual file contents of every AIOS source you used into `docs/wiki/raw/aios-snapshot/`. Memory files, decisions excerpts, brainstorm files, references. Copy, don't symlink. Keep originals untouched; the snapshot is provenance.

### 4c. Write the seed pages

**`docs/wiki/WIKI-CLAUDE.md`** — adapt the iowa-everywhere `docs/wiki/WIKI-CLAUDE.md` to this project. Sections:
- Project intro (1-2 paragraphs, who/what/why)
- Working memory protocol (tail log, read decisions index, drill into topic file)
- Wiki operations (ingest, query, lint)
- File-authority map (what kind of content lives where)
- Cross-project context pointer (what lives in claude-os memory instead of this wiki)

**`docs/wiki/overview.md`** — the kickoff brief. Senior-PM voice. Structure:
1. What this is (1-2 paragraphs)
2. Why it matters
3. Where it stands (as of today's date)
4. What ships in v1 / Phase 1
5. Success criteria
6. Milestones table
7. Stakeholders table (name / email / role)
8. Communication (cadence, channel, primary contact)
9. Constraints
10. Known risks (with mitigations)
11. Open questions (things to chase)
12. Definition of done
13. Source provenance footer linking the sources/ pages

Use real names, dates, emails from the gathered context. Drop sections with no content (no empty placeholders).

**`docs/wiki/sources/YYYY-MM-DD-<source-slug>.md`** — one per AIOS source. Each includes:
- Original location + snapshot location + date
- TL;DR (one paragraph)
- Key facts
- What it superseded / what superseded it (if applicable)
- Feeds into [[wiki pages]]

**`docs/wiki/decisions/NNNN-<slug>.md`** — one per decision the AIOS log explicitly recorded. Zero-padded NNNN, chronological. Standard ADR (context / options / decision / rationale / consequences / source). **Don't manufacture decisions** from speculative memory — if it wasn't logged or interviewed, don't ADR it.

**`docs/wiki/index.md`** — catalog. Group by category (Overview, Decisions, Sources, Operations). Use markdown links (not `[[wikilinks]]` — those don't render on GitHub).

**`docs/wiki/log.md`** — initial entries:
1. `## [today] edit | Wiki bootstrapped from AIOS kickoff` with seed stats.
2. One `## [source-date] ingest | <title>` per AIOS source.
3. One `## [decision-date] decision | <title>` per recorded decision.

**`docs/wiki/raw/README.md`** — how-to-ingest instructions, adapted from `~/.claude/skills/llm-wiki/assets/raw-README.md`. Mention both `aios-snapshot/` and `external/`.

---

## Phase 5: CLAUDE.md + .gitignore

### 5a. CLAUDE.md at project root

Write `/Users/justinlobaito/repos/<slug>/CLAUDE.md` modeled on `/Users/justinlobaito/repos/iowa-everywhere/CLAUDE.md`. Sections:

1. **Project title + one-paragraph summary** — who, what, why (lift from `docs/wiki/overview.md`).
2. **"Read this first"** — instructions to:
   - Read `docs/wiki/WIKI-CLAUDE.md` before touching content/architecture/strategy
   - Tail the log: `tail -n 30 docs/wiki/log.md` (or `ls docs/wiki/log/ | sort -r | head -10` if log is a folder)
   - Check `docs/wiki/index.md` for the catalog
   - Check `docs/wiki/decisions/` for what's currently locked
3. **Operating rules** — when user makes a decision (file it as `docs/wiki/decisions/NNNN-<slug>.md`, update index, append log, don't ask permission); when user drops a file in `docs/wiki/raw/` (treat as ingest unless they say otherwise; never modify raw); when proposing a new feature (file as a wiki page first).
4. **Stack notes** — tech stack pulled from interview + memory (Craft CMS by default if it's a BGD client engagement).
5. **What's NOT in scope for this wiki** — table pointing to where cross-project / operator-brain / BGD-business-strategy content lives (claude-os memory + decisions log).
6. **How sessions usually start** — `/load <slug>` from claude-os auto-detects this wiki via `docs/wiki/WIKI-CLAUDE.md`; sessions started directly inside this repo read CLAUDE.md first.

Match Justin's voice. No marketing verbs. Short sentences. No em dashes.

### 5b. .gitignore

Write `/Users/justinlobaito/repos/<slug>/.gitignore` with at minimum:

```
.DS_Store
*.swp
*.tmp
node_modules/
.env
.env.local
```

Adjust based on the project's tech stack (e.g., add `vendor/` for PHP, `composer.lock` if appropriate, etc.).

---

## Phase 6: Sub-agent gut-check

After CLAUDE.md is written, spawn a sub-agent with the new project directory as its working context. The sub-agent should NOT inherit the kickoff conversation — it must come in cold, the way a future Claude Code session would.

Ask the sub-agent **exactly one question**:

> Give me your understanding of this project.

The sub-agent should:
1. Read CLAUDE.md at the project root.
2. Follow CLAUDE.md's "Read this first" instructions (which include WIKI-CLAUDE.md, log, index).
3. Synthesize what it learned.
4. Return a response.

**Report the sub-agent's response verbatim to Justin.** This is the gut-check — if a fresh Claude session can't accurately describe the project from the seed material, the seed isn't good enough.

If the response is wildly off (missing critical context, hallucinating, focused on the wrong thing), surface that as a finding. The fix is to edit `docs/wiki/overview.md` and/or CLAUDE.md to make the right things more prominent.

Don't block on the gut-check — proceed to Phase 7 even if the answer needs work. Surface the response in Phase 11's report.

---

## Phase 7: Dump external raw docs

Search Justin's filesystem for any file related to the project that isn't already captured in `docs/wiki/raw/aios-snapshot/`. The primary location:

- `/Users/justinlobaito/repos/claude-os/docs/` — Gemini meeting notes (`.pdf`), call transcripts (`.txt`, `.docx`), recordings (`.mp4`), screenshots (`.png`), random reference docs.

For each file in that directory whose name mentions the project (slug, human name, or any client-level alias), copy it into `/Users/justinlobaito/repos/<slug>/docs/wiki/raw/external/`. Don't copy what's already in `aios-snapshot/` (the references are already there).

If Google Drive or another external source is accessible, also pull anything there matching the project. Don't go fishing in client-confidential locations without explicit permission.

For binary files (PDFs, MP4s, DOCX), copy as-is. The ingest in Phase 8 will summarize them, not transform them.

### What NOT to dump

- Files marked confidential / privileged unless the operator explicitly authorizes.
- Files that look like generic AIOS infrastructure (CLAUDE.md, CONTEXT.md, routines.md, etc.).
- Anything from `node_modules/`, `.next/`, build outputs.

---

## Phase 8: Ingest raw docs into the wiki

For each newly-dumped file in `docs/wiki/raw/external/`, run the llm-wiki ingest workflow:

1. **Read the source end-to-end.** PDFs may need page-range reads if very large.
2. **Draft a source page** at `docs/wiki/sources/YYYY-MM-DD-<slug>.md` with: source path (`raw/external/...`), TL;DR, key facts, what it adds or contradicts vs. existing wiki content, what wiki pages it should feed.
3. **Apply the recommended wiki updates.** A meeting transcript might add a stakeholder to `overview.md`, surface a new decision (file as `decisions/NNNN-*.md`), or contradict an existing claim (flag, then resolve with the operator).
4. **Update `index.md`** to include the new source page (and any new wiki pages created from the ingest).
5. **Append `log.md`**: `## [source-date] ingest | <title>`.

Process ingests sequentially, not all-at-once — each ingest may inform the next (e.g., a transcript references a decision that becomes a new ADR).

If ingest reveals a contradiction with the seed (e.g., the transcript says launch is 6/16 but the seed said 6/2 because it was based on an earlier source), prefer the **newer** source and mark the older one superseded in its source page.

---

## Phase 9: Sync clients.yaml

Update `/Users/justinlobaito/repos/claude-os/clients.yaml`.

### 9a. Project exists in clients.yaml

Append `/Users/justinlobaito/repos/<slug>/docs` to the project's `docs_paths`. **Note**: path points to `/docs`, NOT the repo root. AIOS's `detectWiki()` walks one level down to find `wiki/WIKI-CLAUDE.md`.

If the path is already in `docs_paths`, do nothing.

### 9b. Project does not exist

Use the metadata from Phase 3 to add a new entry under the right client:

```yaml
- slug: <slug>
  name: <Human Name>
  status: active
  docs_paths:
    - /Users/justinlobaito/repos/<slug>/docs
  contacts:
    - <email>
    - <email>
```

Optional fields if the operator provided them:

```yaml
  contract: <e.g., "$2,500/mo retainer">
  mrr_monthly: 2500
  notes: <one-line>
```

### YAML safety

`clients.yaml` is hand-edited by Justin and may carry comments + formatting he cares about. Preserve them. Read the whole file, write back with minimal diff. Use the Edit tool with a precise unique anchor (the project's `name:` line is usually unique enough).

---

## Phase 10: Initial git commit

Inside `/Users/justinlobaito/repos/<slug>/`:

```bash
git add .
git commit -m "feat: kickoff seed from AIOS

- Wiki bootstrapped at docs/wiki/
- CLAUDE.md + .gitignore
- AIOS snapshot + external raw docs ingested
- Seeded from $(date +%Y-%m-%d)"
```

If a remote is configured, don't auto-push — leave that for Justin. If no remote, mention in the report that the repo is local-only.

---

## Phase 11: Report back

Tell Justin what happened. Keep it tight:

- **Where the wiki landed** (full path).
- **What seed pages were written** (count + categories).
- **What external raw docs got dumped** (count + names).
- **What the gut-check sub-agent said** — verbatim. Surface any concerns.
- **Whether `clients.yaml` was updated** (existing entry vs new entry).
- **Open items** the team still needs to chase.
- **One-liner on how to operate the new wiki from now on**: drop sources into `docs/wiki/raw/`, file decisions automatically, the wiki updates itself via the [[llm-wiki]] ingest workflow.

If anything is unusual — overwrote files, the project directory was created from scratch, a memory file had stale info, the gut-check was off — flag it explicitly.

---

## Universal conventions

These apply across all phases.

- **Read the [[llm-wiki]] skill conventions** before writing wiki files. Don't drift from absolute dates, one-topic-per-page, no empty placeholders.
- **Markdown links, not wikilinks.** `[label](path/file.md)`. The wiki lives in a git repo that may be browsed on GitHub — `[[wikilink]]` syntax doesn't render there.
- **Absolute dates only.** `YYYY-MM-DD`. Never "last week", "yesterday".
- **Match Justin's voice**: direct, lowercase-leaning, no em dashes, no marketing verbs, short sentences. He's the only audience.
- **Don't manufacture content.** If AIOS doesn't say it and the operator didn't tell you, leave it out.
- **The snapshot is provenance, not knowledge.** `docs/wiki/raw/aios-snapshot/` is the immutable source layer. Don't reference its contents directly from wiki pages — synthesize into wiki pages and cite the snapshot via the source pages.
- **`WIKI-CLAUDE.md` is the canonical schema filename**, not `SCHEMA.md`. AIOS's detectWiki function specifically looks for this name.

## Anti-patterns to avoid

- **Asking a generic checklist of 12 questions.** Look at what AIOS already knows. Ask only the gaps. 3-6 is the sweet spot.
- **Dumping raw memory file contents into `wiki/overview.md`.** Synthesize. The raw stays in `raw/aios-snapshot/`.
- **Writing decision pages for events that aren't actually decisions.** A status update mentioning a tool choice isn't an ADR.
- **Creating empty wiki subfolders.** `wiki/people/` with no people in it rots.
- **Overwriting an existing wiki without asking.** Phase 1 catches this.
- **Silently creating a new client in clients.yaml.** Clients deserve intake (`/onboard-client`).
- **Forgetting to update `docs_paths`** or pointing it at the repo root instead of `/docs`.
- **Skipping the gut-check.** It's the cheapest validation we have for whether the seed actually communicates the project.
- **Putting raw/ outside docs/wiki/.** The iowa-everywhere convention keeps everything wiki-related under `docs/wiki/` so the wiki is portable.

## Why this skill exists

Justin runs ~12 client engagements concurrently. Every time a project moves from "brewing in AIOS" to "actively shipping", there's an information loss between his head (and his memory layer) and whoever's doing the work — even when that whoever is Justin himself a month later. This skill closes that gap in one pass: it converts unstructured project knowledge into a structured wiki the team can operate from, tells AIOS where the wiki lives so the two stay in sync, and validates the seed by having a fresh Claude session describe the project back.
ok