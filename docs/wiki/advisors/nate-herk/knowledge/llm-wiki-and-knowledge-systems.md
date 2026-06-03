---
source: advisor-bootstrap
advisor: nate-herk
captured: 2026-06-03
url: https://x.com/nateherk/status/2050116705322512766
secondary_sources:
  - https://github.com/nateherkai/AIS-OS
status: ingested
---

# The LLM Wiki Layer and Knowledge Systems

**URL:** https://x.com/nateherk/status/2050116705322512766
**Published:** 2026-05-01
**Type:** X thread (long-form article) + GitHub repo

## Key Frameworks and Patterns

### Karpathy's LLM Wiki Pattern (as implemented by Nate)
No fancy RAG. No embeddings. No vector DB. Just a folder with markdown files, an index file, and a log file.

**Structure:**
- `/raw` -- source documents (transcripts, articles, meeting notes)
- `/wiki` -- organized output (concepts, entities, sources, analysis)
- `/wiki/_index.md` -- master index
- `/wiki/_log.md` -- append-only operation history
- `/wiki/_hot.md` -- 500-token cache of what was most recently active

**Workflow:** Drop a file into /raw, tell Claude "ingest this." It reads the source, creates wiki pages, builds backlinks between concepts, updates the index, logs the operation.

### The Hot Cache
A small 500-token file at the top of the wiki that captures the active state of your week. Claude reads it first, before crawling the bigger wiki. Saves tons of tokens on repeat queries.

### Nate's Two Vaults
1. **YouTube Transcripts Vault.** 36+ video transcripts ingested. Can ask any question about his own content and it answers from the wiki, not from vector search.
2. **Herk Brain Vault.** Personal second brain. Meeting notes, business decisions, priorities.

### Impact
One X user moved 383 scattered files and 100+ meeting transcripts into a wiki and dropped token usage by 95% on queries. Kills the "I forgot which Slack thread that was in" problem.

### Pair with Obsidian
Obsidian is just a markdown viewer -- changes nothing about how Claude reads the files. But the visual graph layer helps spot relationship clusters you didn't know were there.

### Skills as SOPs
Skills are reusable SOPs for AI agents. Same way you'd train a human with an SOP, you train Claude with a skill. A skill is just a folder: `.claude/skills/skill-name/skill.md`. The improvement loop is the real unlock: run it, watch it, give feedback, fix it, run it again. By the tenth run the skill is sharp. By the thirtieth, it's part of how your business runs.

### The Feedback Cycle (for skills and systems)
- Run it, watch it the first few times
- Patch the obvious waste
- Move on
- Every failure becomes permanent learning if you build the loop
- "The first time a connection fails, treat it as a gift. Ask Claude to update the relevant API doc or skill so the same failure can never happen again."

### Daily/Weekly Operating Loops
**Daily:** Morning: ask Claude to plan your day. If the plan is bad, write down what context it was missing. Patch tomorrow. End of day: which skills did you use, which prompts did you repeat, what did you correct.

**Weekly:** Friday: run /audit then /level-up. Pick one gap from each, build it next week. The OS doesn't need a manager. It needs a loop.

## Positions and Opinions

- The LLM wiki is the unlock most people miss. No need for complex RAG, embeddings, or vector DBs.
- Markdown + folder structure beats every "AI knowledge management" SaaS tool.
- The hot cache is critical for token efficiency. Don't make Claude crawl the whole wiki every time.
- Every failure is data. Build the loop so nothing breaks twice.
- Skills should be treated like hiring and training a new employee -- SOPs, not prompts.
- The AIOS claude.md is the file that evolves the most. Updated 2x/day as you add new folders, skills, connections.

## Relevant Quotes

- "The wiki has the source link, the date, the entity references, all in one place." -- context: why wikis beat scattered files
- "The first time a connection fails, treat it as a gift." -- context: building learning loops
- "The OS doesn't need a manager. It needs a loop." -- context: daily/weekly operating rhythm
- "Tools change. Models change. The Three Ms and the Four Cs don't." -- context: what's durable vs disposable
- "Failure is data: every broken run becomes a skill update or a reference doc update. Nothing breaks twice." -- context: the learning loop

## How This Applies as a Decision Lens

The LLM wiki pattern is already implemented in Justin's AIOS (the llm-wiki skill). Nate's implementation validates the approach and adds specific operational practices: the hot cache for token savings, the daily/weekly loops for continuous improvement, and the skill-as-SOP framing. When evaluating knowledge management approaches for client projects, the wiki-over-RAG position is the default recommendation. The feedback loop discipline (nothing breaks twice) applies to every automation BGD builds.
