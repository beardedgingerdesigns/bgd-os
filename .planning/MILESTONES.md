# Milestones

## v2.0 AIOS v2: Dispatcher + Strategic Partner (Shipped: 2026-06-28)

**Phases completed:** 5 phases, 15 plans, 16 tasks

**Key accomplishments:**

- PostToolUse hook that accumulates Edit/Write/Bash/commit counts in /tmp temp files, plus LLM prompt template defining the STATE.md format for session summarization
- SessionEnd hook that auto-generates STATE.md in project wikis via cwd-to-clients.yaml reverse lookup, substance threshold gating, and LLM summarization with claude -p --bare --model haiku
- Persistent to-do list as first-class AIOS artifact with structured markdown format, plus /load-project skill retired with deprecation notice preserving all trigger phrases
- Rewired /onboard-client with three new phases (Kickoff, Initial STATE.md, Final Close) chaining intake through /kickoff-project wiki seed with graceful degradation
- Heuristic content classifier with 4-rule priority chain gating all 3 write surfaces before raw/aios/ drops
- Three-outcome ingest evaluation (promote/skip/flag) with ContestedEntry/SkippedEntry types and backward-compatible parser
- Side-by-side contradiction viewer with operator resolution (keep/accept/review) and .resolved/ metadata ledger
- One-liner:

---
