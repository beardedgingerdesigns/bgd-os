---
name: Industry deep-dive — quarterly
routineId: trig_01Gd3B1zPUAWU2uvjsGrqyJ5
schedule:
  cron: "0 11 1 1,4,7,10 *"
  human: "Quarterly on the 1st of January, April, July, October at 6am America/Chicago (CDT) / 11am UTC"
enabled: true
model: claude-opus-4-7
repo: https://github.com/beardedgingerdesigns/terraplex-spoke-hub
connectors:
  - Google-Calendar
  - Google-Drive
  - Refero
  - Gmail
status: active
---

You are running the quarterly deep-dive for the Terraplex ag-drone knowledge system. This hub is an LLM-maintained wiki per [HUB-CLAUDE.md](HUB-CLAUDE.md) — read that FIRST.

Your job: pop the top topic from the queue in `research/README.md`, write a substantial 800–1500 word analysis grounded in cited sources, with proper wiki bookkeeping. ONE PR per run.

## Step 1 — Read the schema, queue, prior context

1. Read `HUB-CLAUDE.md` (wiki conventions), `index.md`, tail of `log.md`.
2. Read `research/README.md` and find `## Deep-dive topic queue`. The top topic is your assignment.
3. Read `raw/README.md` (snapshot protocol).
4. Read `research/digests/` (last ~90 days) and existing `research/application/` and `research/dealer-economics/` for context.

## Step 2 — Pick destination subdir

- `research/application/` — agronomic uses, ROI economics, spray methods, customer workflow
- `research/dealer-economics/` — distribution, financing, training, dealer-mfr dynamics

If either could fit, pick the more dealer-actionable framing.

## Step 3 — Research deeply

Use the source allowlist. Budget: 5–8 WebSearch queries + 8–12 WebFetch retrievals (13–20 total). Triangulate across trade pubs, manufacturer pages, regulatory sources, practitioner forums. Do NOT delegate to a Task / subagent.

## Step 4 — Save raw snapshots for every successful WebFetch

Same protocol as digest/intelligence: save to `raw/<domain>/<YYYY-MM-DD>-<short-slug>.md` per `raw/README.md` schema, with `fetchedBy: "Industry deep-dive — quarterly"`. Skip failed fetches and duplicates.

## Step 5 — Write the deep-dive

File path: `research/<application|dealer-economics>/<topic-slug>.md` (slug: 2–4 lowercase dashed words from title).

Length: 800–1500 words. Frontmatter:

```yaml
---
title: "<topic title>"
category: <application | dealer-economics>
publishedAt: 2026-MM-DD
sources: [<all cited URLs with accessedAt and localCopy>]
relevantTo: [<applicable controlled vocab>]
tags: [<descriptive>]
---
```

Body sections:
```markdown
## Summary
3–5 sentence executive summary.

## Why this matters for Terraplex dealers
2–3 paragraphs.

## Key facts
3–5 subsections relevant to the topic with bullet facts and inline `[source: <url>]` citations.

## Implications
- For dealer positioning copy
- For pricing conversations
- For onboarding scripts
- For equipment recommendations

## Open questions / things to revisit
- Anything you couldn't cite definitively
- Industry-level uncertainties to track in future digests
```

**Cross-references**: link to `../digests/<YYYY-MM-DD>.md` entries that informed the analysis (search the log.md history). Link to relevant `research/manufacturers/<name>.md` profiles. Link to `../../products/r-32.md` or `i-19.md` if the analysis affects how dealers position those products. At least 2 cross-references per deep-dive.

## Step 6 — Update research/README.md to remove the topic from the queue

- Remove the topic from `## Deep-dive topic queue`
- Renumber remaining items 1…N
- Add a one-line completion note at the bottom of that section: `Completed: <topic title> → research/<subdir>/<slug>.md (YYYY-MM-DD)`

If queue is empty: do NOT make up a topic. Exit with stdout report telling the user to add topics. No PR.

## Step 7 — Update index.md

Add a line under `## Industry research → ### <Application | Dealer economics>` (create the subsection if first entry):
```
- [research/<subdir>/<slug>.md](research/<subdir>/<slug>.md) — <one-line description>
```

## Step 8 — Commit and push (auto-PR workflow opens the PR)

**IMPORTANT**: `gh` CLI is NOT installed in this cloud environment. Do NOT attempt `gh pr create`. The repo's `.github/workflows/auto-pr.yml` opens the PR automatically within ~30 seconds of pushing to a `chore/**` branch, using your first commit's message as the PR title and body.

1. Branch: `git checkout -b chore/deep-dive-<YYYY>-Q<N>` (Q1=1, Q2=4, Q3=7, Q4=10)
2. Stage: `git add research/ raw/ index.md`
3. Write commit message to a temp file with a rich body, then `git commit -F /tmp/commit-msg`. Body should include:
   ```
   Deep-dive: <topic title>

   ## Topic
   <title>

   ## Word count
   N words

   ## Sources cited
   N across [<source domains>]

   ## Raw snapshots saved
   - raw/<domain>/<filename>.md ...

   ## Cross-references added
   - <file> → <target> (reason)

   ## Key implications for dealers
   - <bullet 1>
   - <bullet 2>

   ## Tool usage
   - WebSearch: N
   - WebFetch: N (success: M, errors: K)

   ## Open questions / future tracking
   - ...
   ```
4. Push: `git push origin chore/deep-dive-<YYYY>-Q<N>`
5. Done. Auto-PR workflow opens the PR.

## Step 9 — Append log.md, second commit, push

Append to `log.md`:

```
## [<YYYY-MM-DD>] ingest | Deep-dive: <topic title>
Branch `chore/deep-dive-<YYYY>-Q<N>`. <subdir>/<slug>.md. <Word count> words, <source count> sources. Key findings: <one-liner>. PR auto-opened by `.github/workflows/auto-pr.yml`.
```

Then second commit on log.md and push.

## Final report

- Branch pushed: `chore/deep-dive-<YYYY>-Q<N>` (or "No PR — queue was empty")
- Topic written
- Word count
- Source count, raw snapshots saved, cross-references added
- Key implication highlights
