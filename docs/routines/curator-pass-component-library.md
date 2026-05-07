---
name: Curator pass — component library audit & expansion
routineId: trig_017mGRmwXTpkVUyeweCvL4Q3
schedule:
  cron: "0 2,6,10,14,18,22 * * *"
  human: "Every 4 hours at 1am, 5am, 9am, 1pm, 5pm, 9pm America/Chicago (CDT). Cron is fixed UTC; under CST the local hours shift to midnight, 4am, 8am, noon, 4pm, 8pm."
enabled: true
model: claude-opus-4-7
repo: https://github.com/beardedgingerdesigns/terraplex-spoke-hub
connectors:
  - Refero
  - Gmail
  - Google-Calendar
  - Google-Drive
status: active
---

You are running the curator pass on the Terraplex component library. This hub is an LLM-maintained wiki per [HUB-CLAUDE.md](HUB-CLAUDE.md) — read that FIRST.

Your job: audit, dedupe, expand cross-archetype applicability, and proactively explore new design references via Refero. Produce ONE PR per run with proper wiki bookkeeping.

## Step 1 — Read the schema and current state

1. Read `HUB-CLAUDE.md` (wiki conventions), `index.md`, tail of `log.md`.
2. Read `component-library/README.md` (frontmatter schema, body sections, library-worthy criteria, filename conventions).
3. List every file under `component-library/<section>/research/` for sections: hero, product-block, services, contact. Read all research notes. Build internal inventory keyed by section: filename, applicableArchetypes, incompatibleArchetypes, tags, one-line takeaway.

## Step 2 — Redundancy pass

Within each section:
- Same `referoScreenId` in two files → merge, keep one.
- Substantially overlapping `What to take` content → merge into one stronger note (preserve `applicableArchetypes` union, dedupe takeaways, add `mergedFrom: [<old screen ids>]` to frontmatter).
- Note degraded to single bland bullet → propose deletion.

CAPS: ≤5 deletions per run. Uncertain deletes go in PR's "Open questions" section.

## Step 3 — Cross-pollination expansion

For each existing note, evaluate whether `applicableArchetypes` could plausibly broaden (archetypes: field, forge, tactical, clean, terrain, patriot). If yes, update frontmatter AND add a clear "Adaptation notes (cross-archetype)" body section. NEVER broaden without articulating the adaptation.

## Step 4 — Section-quota allocation (sparsity-weighted)

The library has 4 sections: hero, product-block, services, contact. Each run must touch ALL FOUR sections, weighted toward the sparsest.

1. Count notes per section (raw file count under `component-library/<section>/research/`).
2. Rank sections from sparsest (rank 1) to most-covered (rank 4).
3. Pick a run target between 15 and 20 new notes (your choice based on how rich Refero looks for the current gaps; default 17).
4. Allocate the target across sections with sparsity weights: sparsest ~40%, 2nd ~30%, 3rd ~18%, most-covered ~12%.

   Reference allocations:
   | Section rank | Share | 15-target | 17-target | 20-target |
   |---|---|---|---|---|
   | 1 (sparsest)   | ~40% | 6 | 7 | 8 |
   | 2              | ~30% | 4 | 5 | 6 |
   | 3              | ~18% | 3 | 3 | 4 |
   | 4 (most-covered)| ~12% | 2 | 2 | 2 |

5. Within each section, the search anchor is that section's sparsest archetype (across the 6 archetypes). If multiple archetypes tie for sparsest in the section, pick whichever the existing notes' takeaways least reach toward.
6. Every section gets at least one attempt — even the most-covered. The whole point of this step is to break the dog-pile pattern where the curator dumps all adds into one section.

## Step 5 — Exploration (always run, per-section)

Run Refero queries section-by-section in the order rank 1 → rank 4. Per-section budget guidance, scaled to its share of the run:

| Section rank | Refero searches | Refero inspections |
|---|---|---|
| 1 (sparsest)   | 3   | 10–12 |
| 2              | 2–3 | 7–9   |
| 3              | 2   | 5–6   |
| 4 (most-covered)| 1–2 | 3–4   |

Total-run budget: **8–12 searches**, **25–35 inspections**. Vary queries within and across sections — no near-duplicates. Do NOT call `mcp__refero__refero_get_similar_screens`. Do NOT delegate to a Task / subagent.

For each library-worthy screen, save a research note per the schema. CAP: **≤20 new notes per run**. The per-section quota from Step 4 is a target, NOT a floor. If a section's Refero pass produces zero library-worthy screens after its budget is spent, save zero for that section — empty-pass on a section is healthy. Better an under-target run than a degraded library.

Library-worthy gate: specific transferable design move, articulable in archetype-neutral terms, not a near-duplicate (check screen ID + takeaway + adjacent existing notes).

Note: this routine uses the Refero MCP, NOT WebFetch. Refero responses do not get raw/ snapshots — the wiki note IS the distillation, and Refero is a stable API.

## Step 6 — Cross-references in new content

For each new component-library note, where natural, link to:
- The relevant archetype file(s): e.g., `[FIELD archetype](../../../archetypes/field.md)` (path is relative from `component-library/<section>/research/<file>.md`)
- Other component-library notes in the same section that share `applicableArchetypes`
- Sibling notes in OTHER sections that compose into a page rhythm (e.g., a hero pattern paired with a product-block pattern)

At least one cross-reference per new note unless genuinely standalone.

## Step 7 — Update index.md

Add a line under `## Component library` for each new note:
```
- [component-library/<section>/research/<file>.md](component-library/<section>/research/<file>.md) — <one-line description>
```

For merged or deleted notes, remove the corresponding lines.

## Step 8 — Commit and push (auto-PR workflow opens the PR)

**IMPORTANT**: `gh` CLI is NOT installed in this cloud environment. Do NOT attempt `gh pr create`. The repo's `.github/workflows/auto-pr.yml` detects pushes to `chore/**` branches and opens the PR automatically within ~30 seconds. The auto-PR uses your **first commit's message** as the PR title (subject line) and PR body (everything below the blank line). So make the first commit's message rich — it IS the PR.

1. Today's date YYYY-MM-DD. Branch: `git checkout -b chore/library-audit-<YYYY-MM-DD>`
2. Stage: `git add component-library/ index.md`
3. Write the commit message to a temp file (so you can include a multi-line body), e.g.:
   ```bash
   cat > /tmp/commit-msg <<'EOF'
   Library audit <YYYY-MM-DD>

   ## Inventory snapshot

   | Section | Notes (before) | Adds this run | Notes (after) |
   |---|---|---|---|
   | hero          | N | N | N |
   | product-block | N | N | N |
   | services      | N | N | N |
   | contact       | N | N | N |
   | **TOTAL**     | N | N | N |

   Per-archetype distribution (notes whose applicableArchetypes includes each):
   - field: N
   - forge: N
   - tactical: N
   - clean: N
   - terrain: N
   - patriot: N

   ## Section-quota allocation (Step 4)

   Section ranks before this run (sparsest → most-covered): <rank-1>, <rank-2>, <rank-3>, <rank-4>.
   Run target: <N>. Allocations: rank-1=<n>, rank-2=<n>, rank-3=<n>, rank-4=<n>.
   Hits: rank-1=<n actual>, rank-2=<n actual>, rank-3=<n actual>, rank-4=<n actual>.

   ## Redundancies addressed
   - merged: <new> ← <old>. Reasoning: ...
   - deleted: <file>. Reasoning: ...

   (Or "None — library is healthy on this dimension.")

   ## Cross-pollination updates
   - <file>: applicableArchetypes <old> → <new>. Adaptation: <one line>

   (Or "None this pass.")

   ## New research from Refero
   - <file> (screen <id>) → section, applicable to [<archetypes>]. Takeaway: <one line>

   ## Cross-references added
   - <file> → <target> (reason)

   ## Refero usage this run
   - Searches: N (per-section: hero=N, product-block=N, services=N, contact=N)
   - Inspections: N (per-section: hero=N, product-block=N, services=N, contact=N)

   ## Open questions for human review
   - ...
   EOF
   ```
   Then commit: `git commit -F /tmp/commit-msg`
4. Push: `git push origin chore/library-audit-<YYYY-MM-DD>`
5. Done with this step. The auto-PR workflow will open the PR. No need to run `gh pr create` (it would fail — gh isn't installed).

If nothing landed AT ALL across all four sections (every section's Refero pass came up empty), the commit message can be a 1-line subject only ("Library audit <YYYY-MM-DD> — audited; no changes") with an empty body — still valuable as a record.

## Step 9 — Append log.md, second commit, push

Append to `log.md`:

```
## [<YYYY-MM-DD>] ingest | Library audit <YYYY-MM-DD>
Branch `chore/library-audit-<YYYY-MM-DD>`. <count> notes added across <hero/product-block/services/contact> (<n>/<n>/<n>/<n>), <count> merged, <count> deleted, <count> broadened. Refero usage: <searches> searches, <inspections> inspections. PR auto-opened by `.github/workflows/auto-pr.yml`.
```

Then `git add log.md && git commit -m "chore(log): log library audit <YYYY-MM-DD>" && git push origin chore/library-audit-<YYYY-MM-DD>`. The push doesn't open a duplicate PR — the workflow detects the existing PR and no-ops; your second commit appears in the existing PR.

## Final report

- Branch pushed: `chore/library-audit-<YYYY-MM-DD>`
- Counts per section: hero=<n>, product-block=<n>, services=<n>, contact=<n>
- Refero calls used
- Cross-references added
- Anything punted to "Open questions"

Note: you won't have the PR URL because gh isn't installed and the auto-PR workflow runs after your push completes. The user will see the PR appear automatically.
