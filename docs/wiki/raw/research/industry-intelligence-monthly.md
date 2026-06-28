---
name: Industry intelligence — monthly
routineId: trig_01SkSHhfcEo2kXZMMzT5Mpqz
schedule:
  cron: "0 11 1 * *"
  human: "1st of every month at 6am America/Chicago (CDT) / 11am UTC"
enabled: true
model: claude-opus-4-7
repo: https://github.com/beardedgingerdesigns/terraplex-spoke-hub
connectors:
  - Gmail
  - Google-Calendar
  - Google-Drive
  - Refero
status: active
---

You are running the monthly intelligence pass for the Terraplex ag-drone knowledge system. This hub is an LLM-maintained wiki per [HUB-CLAUDE.md](HUB-CLAUDE.md) — read that FIRST to understand wiki operations (ingest, query, lint).

Your job: refresh 1–2 stale manufacturer profiles AND write a regulatory roundup for the prior month. ONE combined PR per month with proper wiki bookkeeping.

## Step 1 — Read the schema and current state

1. Read `HUB-CLAUDE.md` (wiki conventions), `index.md` (catalog), tail of `log.md` (recent operations).
2. Read `research/README.md` (manufacturer profile format, source allowlist).
3. Read `raw/README.md` (immutability rule, snapshot conventions).
4. List `research/manufacturers/` and `research/regulatory/` and read every existing file.
5. Check `research/digests/` for the prior month's daily digests — use as input signals so you don't duplicate.

## Step 2 — Pick which manufacturer profiles to refresh

Manufacturers tracked: DJI Agras, XAG, Hylio, Joyance, Yamaha, Terraplex.

Selection: prefer creating profiles that don't exist yet. If all exist, pick the 2 with the oldest `publishedAt` frontmatter. Limit: 2 profiles per run.

## Step 3 — Research each picked manufacturer

For each: WebFetch their main product page from the allowlist, WebSearch for last-30-day news (launches, pricing, recalls, partnerships, M&A). Cross-reference prior month's digests — reuse facts already captured.

Budget: 3–5 WebSearch + WebFetch calls per manufacturer; 6–10 total across both. Do NOT delegate to a Task / subagent.

## Step 4 — Save raw snapshots for every successful WebFetch (BEFORE writing wiki entries)

Same protocol as the daily digest:
- Save markdown conversion to `raw/<domain>/<YYYY-MM-DD>-<short-slug>.md` per `raw/README.md` schema
- Frontmatter: `sourceUrl`, `domain`, `fetchedAt`, `fetchedBy: "Industry intelligence — monthly"`, `title`
- Skip failed fetches (403/404/timeout)
- Skip duplicates already snapshotted today

## Step 5 — Write or update the manufacturer profile

File path: `research/manufacturers/<name>.md` (lowercase-with-dashes, e.g. `dji-agras.md`).

If the file does NOT exist (first profile):

```markdown
---
title: "<Manufacturer>"
category: manufacturers
publishedAt: 2026-MM-DD
sources:
  - url: ...
    accessedAt: 2026-MM-DD
    localCopy: raw/<domain>/<YYYY-MM-DD>-<slug>.md
relevantTo: [product, pricing, dealers]
tags: [<descriptive>]
---

## Current state (as of 2026-MM-DD)
- Brief summary: products, pricing tiers, market position, recent moves
- 4–6 bullets max

## Revision history

### Revision 2026-MM-DD
- First profile created.
- [Specific facts with [source: <url>] citations]
```

If file EXISTS:
1. Update `publishedAt` in frontmatter to today.
2. Add new sources (with localCopy) to the `sources:` list — don't delete prior sources.
3. Update `## Current state` if material has changed.
4. APPEND new `### Revision <YYYY-MM-DD>` section under `## Revision history`. NEVER delete or modify prior revisions.
5. List specifically what changed since the prior revision. If nothing material: `- No material changes since prior revision.` Still update `publishedAt`.

**Cross-references**: when a manufacturer's product competes with R-32 or I-19, link to `../../products/r-32.md` or `../../products/i-19.md` from the relevant bullet. When a profile references regulatory context, link to the relevant `../regulatory/<file>.md`. At least one cross-reference per profile.

## Step 6 — Regulatory roundup

File path: `research/regulatory/<YYYY-MM>-update.md` (prior month).

Research FAA news, USDA programs, state changes (IA, TX, NE, KS, MO). Budget: 4–6 WebSearch + WebFetch. Save raw snapshots per Step 4 protocol.

File structure:

```markdown
---
title: "Regulatory update — <YYYY-MM>"
category: regulatory
publishedAt: 2026-MM-01
sources: [<all with localCopy>]
relevantTo: [regulatory, dealers]
tags: [<descriptive>]
---

## Summary
2–3 sentence summary.

## Why this matters for Terraplex dealers
1–2 paragraphs.

## Key facts

### Federal (FAA, USDA)
- Bullet facts with inline [source: <url>] citations and cross-refs to manufacturer profiles where relevant

### State (IA, TX, NE, KS, MO)
- Bullet facts with inline citations

## Implications
- For dealer onboarding scripts: ...
- For application support: ...
```

If truly nothing notable: `## Summary: No material regulatory changes affecting ag drone operations in <month>.` Still write the file.

## Step 7 — Update index.md

Add lines under appropriate sections:
- New manufacturer profiles → `## Industry research → ### Manufacturer profiles`
- New regulatory file → `## Industry research → ### Regulatory`
- Refreshed profiles: update the existing line's description (e.g., `(last refreshed 2026-MM-DD)`)

## Step 8 — Commit and push (auto-PR workflow opens the PR)

**IMPORTANT**: `gh` CLI is NOT installed in this cloud environment. Do NOT attempt `gh pr create`. The repo's `.github/workflows/auto-pr.yml` detects pushes to `chore/**` branches and opens the PR automatically within ~30 seconds. The auto-PR uses your **first commit's message** as the PR title and body. So make it rich.

1. Branch: `git checkout -b chore/intelligence-<YYYY-MM>`
2. Stage: `git add research/manufacturers/ research/regulatory/ raw/ index.md`
3. Write the commit message to a temp file with a rich body, then `git commit -F /tmp/commit-msg`. Body should include:
   ```
   Monthly intelligence pass <YYYY-MM>

   ## Manufacturer profiles refreshed
   - <name> — [created | updated]. Material changes: ...

   ## Regulatory update
   - Federal items: N
   - State items: N
   - Notable: <one-line>

   ## Raw snapshots saved
   - raw/<domain>/<filename>.md ...

   ## Cross-references added
   - <file> → <target> (reason)

   ## Tool usage
   - WebSearch calls: N
   - WebFetch calls: N (success: M, errors: K)
   ```
4. Push: `git push origin chore/intelligence-<YYYY-MM>`
5. Done. Auto-PR workflow opens the PR.

## Step 9 — Append log.md, second commit, push

Append to `log.md`:

```
## [<YYYY-MM-DD>] ingest | Monthly intelligence pass <YYYY-MM>
Branch `chore/intelligence-<YYYY-MM>`. Refreshed/created <list>. Regulatory: <count> federal items, <count> state items. Notable: <one-liner>. PR auto-opened by `.github/workflows/auto-pr.yml`.
```

Then `git add log.md && git commit -m "chore(log): log monthly intelligence pass <YYYY-MM>" && git push origin chore/intelligence-<YYYY-MM>`.

## Final report

- Branch pushed: `chore/intelligence-<YYYY-MM>`
- Profiles created/updated
- Regulatory items captured
- Raw snapshots saved
- Cross-references added
- WebSearch / WebFetch counts
