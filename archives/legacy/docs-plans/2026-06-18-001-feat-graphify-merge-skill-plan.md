---
title: "feat: Cross-project knowledge graph merge skill"
type: feat
status: draft
origin: conversation (grill-me + Nate Herk second brain levels research)
created: 2026-06-18
depth: lightweight
---

# feat: Cross-project knowledge graph merge skill

## Summary

Build a `/graphify-merge` skill that combines per-project knowledge graphs into one unified cross-project graph at the AIOS level. Uses `clients.yaml` as the project registry, collects existing `graphify-out/graph.json` from each repo, merges them using graphify's built-in `merge-graphs` CLI, and outputs a unified graph to the AIOS `graphify-out/`. Enables cross-project relationship queries that no single project graph can answer.

---

## Problem Frame

The AIOS holds thin springboard state about projects (`state/`, `references/`). Deep knowledge lives in each project's own repo wiki. When Justin asks a cross-project relationship question ("who connects to Jon across all projects?", "which projects share a tech stack?"), the AIOS has to manually crawl multiple sources. Individual project graphs exist (BrandOS: 3,674 nodes, Wild Rose: 861, AIOS: 218) but are siloed — no unified view exists.

---

## Requirements

- **R1.** Discover all project repos from `clients.yaml` `docs_paths` entries (extract repo roots from absolute paths)
- **R2.** Check each discovered repo for `graphify-out/graph.json`; skip repos without one silently
- **R3.** Include the AIOS-local graph (`claude-os/graphify-out/graph.json`) in the merge — this graph has cross-cutting entities (personal context, financials, contacts, advisory board) that no project graph contains
- **R4.** Merge all discovered graphs using `graphify merge-graphs`, preserving per-node `repo` provenance
- **R5.** Re-run community detection across the unified graph
- **R6.** Generate `graph.html` interactive visualization
- **R7.** Output replaces `claude-os/graphify-out/` so the AIOS routing table points to the unified graph
- **R8.** Report what was merged: repo name, node count, edge count per source graph, plus unified totals

---

## Key Technical Decisions

### KTD-1: Use `graphify merge-graphs` CLI rather than custom Python merge

**Decision:** Use the existing CLI command.
**Rationale:** `graphify merge-graphs` already handles deduplication by `norm_label`, preserves `repo` provenance per node, and outputs the standard `graph.json` format. No reason to reimplement.

### KTD-2: Discover repos from `clients.yaml` absolute paths

**Decision:** Parse `docs_paths` entries to extract unique repo roots (the `/Users/.../repos/<slug>` prefix before any subdirectory).
**Rationale:** `clients.yaml` is already the master index consumed by other skills (`/dispatch`, `/weekly-project-status`). Using it avoids maintaining a separate registry. Projects without `docs_paths` or without a `graphify-out/` are silently skipped.

### KTD-3: AIOS graph is additive, not replaced

**Decision:** The AIOS-local graph (from `graphify-input/` symlinks) is included as one of the merge sources. The merged output overwrites `graphify-out/` but the `graphify-input/` directory and its cache remain for future AIOS-only rebuilds.
**Rationale:** The AIOS graph has unique cross-cutting entities (personal context, financials, advisory board, contact relationships) that no project repo contains. Dropping it would lose that layer.

### KTD-4: Entity deduplication by normalized label

**Decision:** Let `merge-graphs` handle dedup via `norm_label` (lowercased, whitespace-normalized). When "BrandOS" appears in both the AIOS graph and the BrandOS project graph, they merge into one node with edges from both sources preserved.
**Rationale:** Label-based dedup is what the tool does. The alternative (ID-based matching) won't work across repos since IDs encode file stems that differ per project.

---

## Scope Boundaries

### In scope
- SKILL.md file at `~/.claude/skills/graphify-merge/`
- Discovery logic via `clients.yaml`
- CLI orchestration of `graphify merge-graphs` + `graphify export html`
- CLAUDE.md update (routing already points to `graphify-out/`, just needs to note the merge)

### Deferred to follow-up work
- Automatic merge on `/kickoff-project` (could be added later as a post-kickoff hook)
- Scheduled/cron-based automatic re-merge
- Per-project graph staleness detection (flag repos where graph is older than latest commit)
- Wiki export of the merged graph

---

## Implementation Units

### U1. Create the `/graphify-merge` skill

**Goal:** A working SKILL.md that orchestrates the full merge pipeline.

**Requirements:** R1, R2, R3, R4, R5, R6, R7, R8

**Dependencies:** None

**Files:**
- `~/.claude/skills/graphify-merge/SKILL.md` (create)

**Approach:** The skill is a markdown instruction file (not code). It tells the agent to:
1. Read `clients.yaml` from the AIOS repo root
2. Extract unique repo roots from `docs_paths` absolute paths (pattern: `/Users/.../repos/<slug>/...` → `/Users/.../repos/<slug>`)
3. Check each for `graphify-out/graph.json`
4. Collect all graph paths + the AIOS graph path
5. Run `graphify merge-graphs <path1> <path2> ... --out graphify-out/graph.json`
6. Run `graphify export html` to regenerate the visualization
7. Report the merge summary (per-source counts + unified totals)

**Patterns to follow:** Existing graphify skill structure — name/description frontmatter, step-by-step instructions with bash blocks, clear "what you must do when invoked" section.

**Test scenarios:**
- Happy path: 3 repos with graphs merge into unified output with correct node/edge counts
- Partial coverage: some repos have no `graphify-out/` — they are skipped, others merge successfully
- Solo run: only the AIOS graph exists — merge produces the same graph (no-op but valid)
- Stale AIOS graph: `graphify-input/` exists but `graphify-out/graph.json` doesn't — skill should note it and suggest running `/graphify graphify-input` first

**Verification:** After running `/graphify-merge`, `graphify query "BrandOS"` returns nodes from both the BrandOS project graph and the AIOS relationship graph in a single traversal.

### U2. Update CLAUDE.md routing note

**Goal:** Note that the graph is a merged cross-project graph, not AIOS-only.

**Requirements:** R7

**Dependencies:** U1

**Files:**
- `CLAUDE.md` (modify — the Knowledge graph section added earlier today)

**Approach:** Update the existing Knowledge graph section to note it's a merged cross-project graph and that `/graphify-merge` refreshes it.

**Test expectation:** none — prose update only.

**Verification:** The routing table and Knowledge graph section accurately describe the merged graph and the refresh mechanism.

---

## Sources & Research

- `graphify merge-graphs` CLI: built-in command that takes multiple `graph.json` paths, deduplicates by `norm_label`, preserves `repo` attribute per node
- `clients.yaml`: master index with `docs_paths` containing absolute repo paths — already consumed by 5+ AIOS skills
- Existing graphs: BrandOS (3,674 nodes), Wild Rose (861 nodes), AIOS (218 nodes)
- Nate Herk "Five Levels of a Second Brain" (2026-06-17): Level 4 knowledge graph use case validated for multi-entity CRM-like data; inspired this work
