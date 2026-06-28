---
name: Industry digest — daily
routineId: trig_014rgjYPRbaGVKM6WSXQUYT5
schedule:
  cron: "0 11 * * *"
  human: "Daily at 6am America/Chicago (CDT) / 11am UTC"
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

You are running the daily industry digest pass for the Terraplex ag-drone knowledge system. This hub is an LLM-maintained wiki per [HUB-CLAUDE.md](HUB-CLAUDE.md) — read that file FIRST to understand wiki operations (ingest, query, lint), then proceed.

## Step 1 — Read the schema, source allowlist, and current state

1. Read `HUB-CLAUDE.md` end-to-end (wiki conventions).
2. Read `index.md` (global content catalog) and tail of `log.md` (recent operations).
3. Read `research/README.md` (digest schema, source allowlist, curation gate).
4. Read `raw/README.md` (immutability rule, snapshot frontmatter, naming convention).

## Step 2 — Scan the source allowlist for the prior 24 hours

Use `WebSearch` to find recent ag-drone industry developments. Then use `WebFetch` to retrieve specific articles you want to cite. Stay within the source allowlist in `research/README.md`.

Source scanning order (don't visit all every day — pick 4–6 most likely to have news):
1. sUAS News
2. AgFunder News
3. AgWeb
4. FAA news releases
5. Manufacturer pages (DJI Agras, XAG, Hylio, Joyance, Yamaha)
6. Reddit r/PrecisionAgriculture, r/Agriculture

Lookback: stories published in the last 24 hours OR not referenced in any prior digest in `research/digests/`.

**Source diversity requirement**: for any item you decide to capture, prefer triangulating across **2+ distinct domains** when the item is significant (funding rounds, regulatory rulings, product launches, recalls). If only one source covers it, that's acceptable, but flag in your `Items considered but rejected` section.

**Old-news context**: when you reference a story from prior to the 24-hour window because it provides context for a fresh story, label it explicitly: `(context: ruling occurred 2025-12-22)`.

Budget: 6–10 WebSearch + WebFetch calls total. Do NOT delegate to a Task / subagent.

## Step 3 — Save raw snapshots for every successful WebFetch (BEFORE writing the wiki entry)

For each URL you successfully fetched (HTTP 200) in Step 2:

1. Convert the article body to clean markdown (preserve headings; strip nav/sidebar/footer chrome)
2. Save to `raw/<domain>/<YYYY-MM-DD>-<short-slug>.md` per `raw/README.md` schema:
   ```yaml
   ---
   sourceUrl: https://...
   domain: <domain>
   fetchedAt: <ISO 8601 UTC>
   fetchedBy: "Industry digest — daily"
   title: "<article <title> tag or H1>"
   ---

   [markdown body]
   ```
3. Slug: 2–5 dash-separated words from URL path or article title. Lowercase.
4. SKIP for fetches that returned errors (403, 404, paywall, timeout) — no raw entry, just cite the URL.
5. SKIP if the same URL was already snapshotted today by another routine: check `ls raw/<domain>/<YYYY-MM-DD>-*.md` and grep for `sourceUrl` matching.

## Step 4 — Apply the curation gate

For each candidate item: specific verifiable fact relevant to dealer operations, dealer-actionable, cite-able, not near-duplicate of recent digests.

## Step 5 — Empty-day rule

If 0 items pass the curation gate: do NOT push a branch, do NOT write a digest file, do NOT add to index.md or log.md. Exit with stdout report: `No notable industry developments today. Sources scanned: <list>. Searches: N. Inspections: N. Raw snapshots saved: N.`

Note: the raw snapshots from Step 3 stay even on empty days — they're useful archival regardless. (You can commit them on a non-chore branch later if needed; but for empty days, just leave them locally and exit.)

## Step 6 — Write the digest (only if 1+ items pass)

File path: `research/digests/<YYYY-MM-DD>.md` (today's UTC date).

Frontmatter per `research/README.md` schema. CRITICAL: `sources:` entries must include `localCopy:` for each URL where Step 3 saved a snapshot:

```yaml
sources:
  - url: https://agfundernews.com/...
    accessedAt: 2026-MM-DD
    localCopy: raw/agfundernews.com/2026-MM-DD-hylio-raise.md
  - url: https://hylio.com/...
    accessedAt: 2026-MM-DD
    localCopy: raw/hylio.com/2026-MM-DD-homepage.md
```

If a URL was a failed fetch, omit `localCopy` for that source.

Body sections in order: `## Summary`, `## Why this matters for Terraplex dealers`, `## Key facts` (with inline `[source: <url>]` citations on each bullet), `## Implications`.

**Cross-references**: in `## Key facts`, when an item is about a manufacturer with an existing `research/manufacturers/<name>.md` profile, add a markdown link to that profile (relative path from the digest file: `[DJI Agras profile](../manufacturers/dji-agras.md)`). When an item references a regulatory change, link to `../regulatory/<file>.md` if relevant. Add at least one cross-reference where natural.

Target: 1–4 items per digest.

## Step 7 — Update index.md

Add a line under the `## Industry research → ### Daily digests` section:

```
- [research/digests/<YYYY-MM-DD>.md](research/digests/<YYYY-MM-DD>.md) — <one-line headline summary of items>
```

## Step 8 — Commit and push (auto-PR workflow opens the PR)

**IMPORTANT**: `gh` CLI is NOT installed in this cloud environment. Do NOT attempt `gh pr create`. The repo's `.github/workflows/auto-pr.yml` detects pushes to `chore/**` branches and opens the PR automatically within ~30 seconds. The auto-PR uses your **first commit's message** as the PR title (subject) and PR body. So make the first commit rich.

1. Branch: `git checkout -b chore/digest-<YYYY-MM-DD>`
2. Stage: `git add research/digests/<YYYY-MM-DD>.md raw/ index.md`
3. Write the commit message to a temp file with a rich body, then commit via `git commit -F /tmp/commit-msg`. The body should include:
   ```
   Industry digest <YYYY-MM-DD>

   ## Items in this digest
   - <headline 1> (relevantTo: [...])
   - <headline 2> (relevantTo: [...])

   ## Sources scanned this run
   - <list of sources visited>

   ## Raw snapshots saved
   - raw/<domain>/<filename>.md
   - ...

   ## Cross-references added
   - <new file> → <linked file> (reason)

   ## Tool usage
   - WebSearch calls: N
   - WebFetch calls: N (success: M, errors: K)

   ## Items considered but rejected (and why)
   - <headline> — rejected: opinion piece without specific facts
   - <headline> — captured but only single-source; flagging for human review

   (If nothing was rejected and every captured item had ≥2 sources, write: "None — every candidate item passed the curation gate with multi-source corroboration.")
   ```
4. Push: `git push origin chore/digest-<YYYY-MM-DD>`
5. Done. Auto-PR workflow opens the PR within ~30 seconds.

## Step 9 — Append log.md, second commit, push

Append to `log.md`:

```
## [<YYYY-MM-DD>] ingest | Industry digest <YYYY-MM-DD>
Branch `chore/digest-<YYYY-MM-DD>`. <1–3 sentence summary of items captured + sources used>. PR auto-opened by `.github/workflows/auto-pr.yml`.
```

Then `git add log.md && git commit -m "chore(log): log industry digest <YYYY-MM-DD>" && git push origin chore/digest-<YYYY-MM-DD>`. Second push doesn't open a duplicate PR — the workflow detects the existing PR and no-ops.

## Final report

- Branch pushed: `chore/digest-<YYYY-MM-DD>` (or "No PR — empty-day rule")
- Items captured: N
- Raw snapshots saved: N
- WebSearch / WebFetch counts (success/errors)
- Cross-references added: N
- Anything notable you saw but couldn't cite or didn't fit
