# Nate Herk's Five Levels of a Second Brain — Opportunities for Justin's AIOS

Source: [Every Level of a Claude Second Brain Explained](https://www.youtube.com/watch?v=DTCyvo6cC54) (2026-06-17)
Research date: 2026-06-17

## Where the AIOS Sits Today

Justin's AIOS is **already a mixed-level system** — which is exactly what Nate advocates. Here's the map:

| AIOS Component | Nate's Level | Assessment |
|---|---|---|
| CLAUDE.md routing table | Level 1 | Solid. Clear routing tree with path/purpose/trigger table. |
| context/, state/, decisions/, references/ | Level 1 | Standard folder architecture with routing rules. |
| Project wikis (LLM wiki pattern, ADR 0004) | Level 2 | Multiple wikis with indexes, cross-refs, raw/ staging, source authority tiers. **Goes further than Nate's implementation** with the staged ingestion pipeline. |
| Auto-memory (~/.claude/projects/.../memory/) | Level 2 | Robust typed memory system (user, feedback, project, reference). |
| Advisory board (docs/wiki/advisors/) | Level 2+ | Each advisor = mini knowledge base. Unique architecture Nate doesn't have. |
| Gmail/Calendar/Drive MCPs | Connections layer | Real-time access without ingestion. Matches Nate's "connections" concept exactly. |
| Graphify skill | Level 4 (installed, dormant) | Has the capability but hasn't deeply applied to AIOS data. |
| /scheduled-triage, /retro | Level 5 (partial) | Autonomous routines, but scoped to email triage and session mining. |

**Bottom line:** The AIOS is primarily Level 2 with Level 5 automation touches — the same place Nate sits with Herk2, plus additional sophistication in the ingestion pipeline and advisory board. This is a strong position.

## Validation Points

Three things Nate explicitly endorses that Justin already has:

### 1. Context vs. Connections Separation (already nailed)

Nate's biggest architectural point: ingest evergreen "context," but DON'T ingest transient "connections" — just give the brain access to go grab them live.

Justin's architecture does this exactly:
- **Context (ingested):** `context/`, `state/`, `decisions/`, project wikis
- **Connections (live access):** Gmail MCP (draft-only), Calendar MCP, Drive MCP, Gemini transcripts in Drive

This is architecturally correct and matches Nate's recommendation. The connections.md registry IS the "where to look in what order" routing that Nate describes.

### 2. Staged Ingestion Pipeline (ahead of Nate)

Nate's wiki: drop in raw/, tell Claude to ingest, it creates wiki pages.

Justin's pipeline (ADR 0004): raw/ with source authority tiers (trusted, trusted provenance, advisory) determining four outcomes (promote, adapt, flag, skip). External producers stage to raw/<source>/; the wiki skill owns curation.

This is more sophisticated than what Nate showed. The source authority concept and the four-outcome model add governance that Nate handles manually.

### 3. Mixed-Level Architecture (already doing it)

Nate: "Your whole project doesn't fit into one level. Maybe this folder is Level 2, maybe this folder is Level 4."

Justin: AIOS core (Level 1 routing) + project wikis (Level 2) + automation (Level 5 partial). Each project repo has its own wiki at its own maturity level.

## Opportunities — Ranked by Pain-to-Effort Ratio

### Opportunity 1: Client Relationship Graph (Level 4) — HIGH VALUE

**The case Nate made FOR you:** "If I had a massive CRM to manage with a bunch of different businesses and clients, maybe a knowledge graph would make a lot more sense, and it probably would."

Justin has exactly this use case:
- 10+ active clients across clients.yaml
- Contacts spread across state/ files, memory, and project wikis
- Revenue relationships (who pays what, through which channel)
- Referral chains (Jon → Terraplex → dealers, Nel → Crash Champions)
- Technology dependencies (who runs BrandOS, who's on Base 44, who's on Craft)

**What a graph would enable:**
- "Show me everyone connected to Jon Liebl and what projects they touch"
- "Which clients are on Base 44 and candidates for BrandOS migration?"
- "Who do I owe follow-ups to this week across all projects?"
- "What's my exposure if Jon goes dark?" (the reduce-Jon-dependence question)

**The graphify skill is already installed.** This is the natural application. The data already exists in clients.yaml + state/ + memory — it just needs to be graphified.

**Nate's prerequisite:** Use /grill-me brainstorm sessions to build up richer client context BEFORE graphifying. Data quality drives graph quality.

**Effort:** Medium. Data exists, tool exists, need to run the ingestion.
**Pain solved:** High. Cross-project relationship queries are currently manual.

### Opportunity 2: Expand Autonomous Cadence (Level 5) — MEDIUM VALUE

Justin already has /scheduled-triage for email. Nate's Level 5 is about the WHOLE system auto-syncing. Current gaps:

- **Gemini transcripts:** Auto-land in Drive but still need manual /dispatch. A routine that polls the Drive folder and auto-stages transcripts to the right project wiki's raw/aios/ would remove a manual step.
- **State freshness:** state/ files get stale between sessions. A routine that checks project repos for recent commits and flags state drift could help.
- **Memory pruning:** As memory grows, a routine that surfaces potentially-stale memories for review.

**Nate's caution:** "When do you have too much context? When does it start doing more damage than good?" He explicitly values being in control of ingestion. Justin should expand autonomy incrementally, not all at once.

**Effort:** Low per routine. Use existing /level-up to scope one at a time.
**Pain solved:** Medium. Reduces manual dispatch triggers.

### Opportunity 3: Semantic Search for Advisory Board (Level 3) — LOW PRIORITY NOW

33+ knowledge files across 3 advisors. Currently /ask-the-board reads full files per advisor.

As the board grows (more advisors, more content per advisor), semantic search could surface the most relevant passages across ALL advisors for a given question, rather than having each advisor agent read everything.

**But Nate's own data point applies:** He runs at Level 2 with a larger knowledge base and hasn't felt enough pain to add semantic search. The advisory board file count is still manageable.

**When this becomes worth it:** When an individual advisor has 30+ knowledge files, OR when the board has 6+ advisors, OR when /ask-the-board starts returning superficial answers because agents are spending too many tokens reading irrelevant files.

**Effort:** Medium (needs vector DB setup).
**Pain solved:** Low right now. Revisit when the board grows.

### Opportunity 4: Cross-Project Wiki Search (Level 3) — FUTURE

Justin has wikis in multiple repos. Currently, cross-project questions route through state/ (thin layer) then require jumping to the project repo.

A unified vector index across all project wikis would enable: "What have we decided about payment processing across all projects?" or "Which projects use Pelcro?"

**Not painful yet** — the state/ thin-layer design explicitly avoids needing this by keeping the AIOS lightweight. But as project count grows, this could become valuable.

**Effort:** High (cross-repo indexing infrastructure).
**Pain solved:** Low currently.

### Opportunity 5: Tool-Agnostic Parity (Level 2 hygiene) — EASY WIN

Nate keeps agents.md alongside claude.md so Codex can read the same routing. Justin may want to ensure AGENTS.md parity if he evaluates other agent harnesses (Codex, Hermes, etc.).

**Effort:** Trivial — copy or reference.
**Pain solved:** Only matters when evaluating other harnesses.

## Key Takeaway

The AIOS is architecturally sound at Level 2 with smart Level 5 automation. The biggest unlock is **Opportunity 1: client relationship graph** — Justin has the exact use case Nate says knowledge graphs are built for, the graphify tool is already installed, and the data already exists. Everything else is either future-proofing or polish.

The meta-lesson from Nate: **don't move up levels without pain.** Ask "what question am I failing to answer?" before adding architecture.
