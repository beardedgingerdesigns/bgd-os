---
name: Hub lint — weekly
routineId: trig_01JGVESkYEGL5yeFg9tn7SqL
schedule:
  cron: "0 14 * * 0"
  human: "Sundays at 9am America/Chicago (CDT) / 2pm UTC"
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

You are running the weekly hub lint pass on the Terraplex spoke-hub repo. This hub is an LLM-maintained wiki per [HUB-CLAUDE.md](HUB-CLAUDE.md) — read that FIRST.

Your job: audit the entire wiki for health issues, apply safe auto-fixes, surface unsafe issues for human review. ONE PR per run. No web research — lint is internal.

## Step 1 — Read the hub

1. Read `HUB-CLAUDE.md` (wiki conventions, file authority map).
2. Read `index.md` (current catalog).
3. Read tail of `log.md` (recent operations, ~last 50 entries).
4. Read `raw/README.md` (snapshot conventions).
5. List every wiki content file across the hub. Use `find . -type f \( -name '*.md' -o -name '*.json' \) -not -path './.git/*' | sort` from the repo root.
6. Read each wiki file (don't read raw/ snapshots in full — just frontmatter and first 20 lines for inventory).

## Step 2 — Build the inventory

For each file, capture:
- Path
- Frontmatter (if .md): `title`, `category`, `publishedAt`, `relevantTo`, `tags`, `sources` with `localCopy`, etc.
- Outbound links: every markdown link `[label](path)` in the body. Resolve relative paths to repo-root absolute paths.
- Inbound links (computed): for every other file, who links TO this one.

## Step 3 — Check for issues

Walk the inventory and identify:

### 3a. Index coverage
- **Pages on disk not in `index.md`** → add them (auto-fix)
- **Pages in `index.md` but missing from disk** → remove from index (auto-fix); note in PR body
- **Index entries with stale descriptions** (e.g., `(last refreshed 2026-04-01)` when frontmatter says `publishedAt: 2026-05-15`) → update description (auto-fix)

### 3b. Orphans
- **Pages with zero inbound links** (excluding hub-root pages: README.md, HUB-CLAUDE.md, NOTES.md, index.md, log.md, hub.json, assets.json, feature-gaps.md, raw/README.md, component-library/README.md, research/README.md — these are landing pages and don't need inbound links) → list in PR body for human review. Don't auto-delete.

### 3c. Stale claims (research/ only)
- **Files in `research/` with `publishedAt` older than 90 days** → flag for refresh in PR body. Cap: list at most 3 per run (most-stale first).
- **Files where newer digests have superseded a fact**: hard to detect automatically. If you spot one, flag in PR body.

### 3d. Contradictions
- **Same field, different values across files**. Especially:
  - Product specs in `products/r-32.md` vs `products/r-32.json` vs `research/manufacturers/dji-agras.md`
  - Pricing claims in `content/pricing-policy.md` vs digests/manufacturer profiles
  - Archetype constraints in `archetypes/*.md` vs `guidelines/design-do-dont.md`
  - Conflicting `applicableArchetypes` in component-library notes
- Flag in PR body. NEVER auto-resolve.

### 3e. Missing cross-references
- A page mentions another wiki entity by name but doesn't link to it.
- Apply up to 10 cross-reference additions per run (cap). Beyond that, list as PR-body suggestions.
- Auto-fix style: insert markdown link inline. Don't restructure paragraphs.

### 3f. Suggested investigations
- Knowledge gaps surfaced by reading across the hub. List in PR body. Never auto-create content.

### 3g. raw/ layer health
- `raw/` orphans: snapshot files no wiki entry's `sources[*].localCopy` cites. List candidates >90 days old in PR body. Don't auto-delete.
- Broken `localCopy` links: a wiki entry's `localCopy:` points to a path that doesn't exist. Auto-fix by removing the broken `localCopy` line (live URL still works).

## Step 4 — Apply auto-fixes

**Auto-applied:**
- Index gaps (additions and removals)
- Index entry description updates
- Cross-reference additions (up to 10 per run)
- Removal of broken `localCopy:` paths (up to 5 per run)

**Flagged for human review:**
- Orphan pages
- Stale claims (research/ >90 days)
- Contradictions
- Suggested investigations
- Cross-reference suggestions beyond the 10-cap
- raw/ orphan candidates

## Step 5 — Commit and push (auto-PR workflow opens the PR)

**IMPORTANT**: `gh` CLI is NOT installed. Do NOT attempt `gh pr create`. The repo's `.github/workflows/auto-pr.yml` opens the PR automatically within ~30 seconds of pushing to a `chore/**` branch, using your first commit's message as the PR title and body.

1. Branch: `git checkout -b chore/hub-lint-<YYYY-MM-DD>`
2. Stage: `git add index.md` and any wiki files where you applied cross-reference additions or `localCopy:` removals.
3. Write the commit message to a temp file with a rich body, then `git commit -F /tmp/commit-msg`. Body should include:
   ```
   Hub lint <YYYY-MM-DD>

   ## Auto-fixes applied

   ### Index updates
   - Added: <N> pages
   - Removed: <N> stale entries
   - Updated descriptions: <N>

   ### Cross-references added (cap: 10/run)
   - <file>: linked "<phrase>" to [<target>](path) (reason)
   - ...

   ### `localCopy:` removals
   - <file>: removed broken `localCopy: raw/<...>.md` for source <url>
   - ...

   ## Flagged for human review

   ### Orphan pages
   - <path> — zero inbound links.

   ### Stale claims (research/ >90 days)
   - <path> — publishedAt <date>, age <N> days.

   ### Contradictions
   - <field> differs between [<file1>](...) and [<file2>](...): "<value1>" vs "<value2>".

   ### Suggested cross-references (beyond 10-cap)
   - <file> mentions "<phrase>" but doesn't link to [<target>](path)

   ### Suggested investigations
   - <gap>: <one-line context>

   ### `raw/` orphan candidates
   - <path>

   ## Inventory snapshot
   - Total wiki pages: N
   - raw/ snapshots: N
   - Pages updated this lint: N
   - Healthiest signal: <one-line>
   ```
4. Push: `git push origin chore/hub-lint-<YYYY-MM-DD>`
5. Done. Auto-PR workflow opens the PR.

If the hub is genuinely clean (no auto-fixes AND no flags), still push a 1-line commit ("Hub lint <YYYY-MM-DD> — healthy; no changes") on the branch — useful as a record that lint actually ran.

## Step 6 — Append log.md, second commit, push

Append to `log.md`:

```
## [<YYYY-MM-DD>] lint | Hub lint <YYYY-MM-DD>
Branch `chore/hub-lint-<YYYY-MM-DD>`. Auto-fixes: <count> index updates, <count> cross-refs, <count> broken localCopy removals. Flagged: <count> orphans, <count> stale, <count> contradictions, <count> suggested investigations. PR auto-opened by `.github/workflows/auto-pr.yml`.
```

Then second commit on log.md and push.

## Final report

- Branch pushed: `chore/hub-lint-<YYYY-MM-DD>`
- Auto-fixes applied (counts by category)
- Items flagged for review (counts by category)
- Any pattern worth noting
