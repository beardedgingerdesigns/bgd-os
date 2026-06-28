# Plan: Day/Night Shift Development Workflow

_Round 1 — revised after Codex review_

## Goal

Establish a feature development workflow for all of Justin's projects that separates human judgment (day shift) from agent execution (night shift), modeled on Matt Pocock's process. Three new skills (`/nightshift`, `/dev-feedback`, updated `/wrap`) plus a wiki spec form the implementation.

## Approach

### The workflow (3 phases, repeating)

1. **Day shift (human, interactive):**
   - `/grill-with-docs` — 20-30 min requirements extraction via Q&A. Side-effects: updates `CONTEXT.md` domain glossary, writes ADRs inline.
   - `/to-prd` — synthesizes conversation into a PRD, posts as GitHub issue. No second interview.
   - `/to-issues` — breaks PRD into vertical-slice issues labeled `ready-for-agent`. Human reviews count/sizing only.

2. **Night shift (AFK, agent execution):**
   - `/nightshift` — pulls `ready-for-agent` issues, implements each in an isolated worktree, commits sequentially, closes on success, labels `needs-human` after 3 failed attempts.
   - `/wrap` runs automatically at end — code review, compound, wiki write, state update.

3. **Next day shift (QA + bug loop):**
   - QA the nightshift branch in browser.
   - File bugs via `/dev-feedback` button (creates `ready-for-agent` issues automatically).
   - Run `/nightshift` again on the bug issues.
   - Merge when clean.

### Skills implemented

**`/nightshift`** (global, `~/.claude/skills/nightshift/`):
- Pre-flight: `gh` auth check, issue fetch, `CONTEXT.md` read.
- Dependency resolution: parses `Blocked by` fields, topological sort.
- Isolation: one feature branch in a git worktree. Issues commit sequentially — later issues see earlier work.
- Branch naming: `nightshift/YYYY-MM-DD-HHMM` to avoid same-day collisions.
- Agent: full `claude --print --permission-mode bypassPermissions` per issue with CONTEXT.md + issue body as prompt. Trust boundary: `ready-for-agent` label is human-applied.
- Retry: 3 attempts per issue (incremental — keep changes between attempts). Final failure → `git reset --hard $LAST_GOOD_SHA && git clean -fd` to restore clean state → `needs-human` label + comment with error details → `in-progress` removed.
- Delivery: commits to branch, no PR. Pushes at end.
- Dependency resolution: resolves ALL referenced blocker issues via `gh issue view` (not just batch membership). Skips if any blocker is still open.
- Label lifecycle: `in-progress` removed on both success (issue closed) and failure (labeled `needs-human`).
- Test command: hard pre-flight failure if no test script detected. No silent skip.
- Base SHA: captures `HEAD` before first issue. Passes to `/wrap` for accurate change detection.
- Per-run log: writes `nightshift-runs/<run-id>.md` with issue order, SHAs, attempts, test command, failures.
- End-of-loop: runs `/wrap` (which now includes code review + compound). Appends QA todo to AIOS.
- AIOS-aware: updates `state/<slug>.md` + `todos/pending.md` in claude-os.
- Startup guard: if the worktree/branch already exists, warn and stop (prevents concurrent runs).

**`/dev-feedback`** (global, `~/.claude/skills/dev-feedback/`):
- Stack detection: React component if `package.json` has `react`, vanilla JS widget otherwise.
- Produces: floating bug button (bottom-right), modal with textarea, submits to `gh issue create`.
- Gating: `NEXT_PUBLIC_DEV_FEEDBACK=true` (client rendering) + `DEV_FEEDBACK_SECRET` (server-only, API route gate). Vanilla uses `window.__DEV_FEEDBACK__` flag.
- Labels: `ready-for-agent` + `qa-feedback` on every filed issue.
- API route: Next.js route handler calls `execFileSync('gh', [...args])` — no shell, argv array, prevents command injection. Client checks `res.ok` and surfaces errors.
- Stack detection: checks for `next` in deps → Next.js App Router component + API route. Anything else → vanilla JS widget (requires a server endpoint — not self-contained for static/Craft projects). Does not over-detect (no Vite/Remix/etc. — YAGNI for Justin's projects).

**`/wrap` update** (global, `~/.claude/skills/wrap/`):
- Added code review gate: when code changes detected, run `/ce-code-review` before `/ce-compound`.
- Revised ordering: review → compound → digest assembly (so findings appear in digest) → wiki → state → breadcrumb.
- Change detection: accepts optional base SHA from caller. Falls back to `HEAD~5` for interactive sessions. Nightshift passes the pre-run HEAD for accurate diffing.
- Claude-os special case needs updating: currently stages to `archives/raw/`, should write directly per updated CLAUDE.md rule.

### What retires

- `/ship` — monolithic pipeline replaced by the issue queue as orchestration layer.
- `ce-brainstorm` — replaced by `/grill-with-docs` (builds glossary inline).
- `ce-plan` — replaced by `/to-prd` + `/to-issues` (lighter, issue-native).
- `ce-work` — replaced by the AFK agent loop.

### What stays (CE back half)

- `ce-code-review` — now wired into `/wrap`, runs on every code session.
- `ce-compound` — same, runs after review.
- `ce-simplify-code` — post-implementation cleanup (manual).
- `ce-debug` — when things break during QA (manual).

## Key decisions & tradeoffs

1. **Git worktrees over Docker for isolation.** Worktrees solve file isolation natively. Docker would add reproducible environments but requires container infra Justin doesn't have set up. Tradeoff: agent inherits the host's Node/Python versions — if deps are pinned this is fine, if not it's a source of "works on my machine."

2. **Sequential on one branch over independent branches per issue.** Sequential means later issues see earlier work (they're designed as building blocks). Tradeoff: if issue #3 fails and corrupts state, issues #4-6 may also fail. Independent branches would isolate failures but prevent issues from building on each other.

3. **Commits to branch, no PR.** Matches Matt's model — QA is the human review gate, not a PR review. Tradeoff: no diff review surface before merge. `/ce-code-review` in `/wrap` partially compensates.

4. **3 attempts then bail.** Balances cost vs. success rate. 1 attempt is too aggressive (many issues just need a second pass after test feedback). Time-boxed would be more flexible but harder to reason about cost.

5. **`execFileSync` with argv array for `gh issue create`.** No shell, no interpolation, no injection. Blocking is irrelevant for a dev-only tool. Server-side gate uses `DEV_FEEDBACK_SECRET` (not the public client env var).

6. **Code review in `/wrap` runs on every code session.** Catches bugs while context is fresh. Tradeoff: adds tokens and time to every wrap. Could be gated on diff size (skip review for < 20 lines changed).

7. **`/wrap` stages to `raw/aios/` in project wikis but writes directly in claude-os.** Follows the updated CLAUDE.md rule. Wrap skill updated to match — project repos stage, claude-os writes directly.

## Risks / open questions

1. **`/wrap` running inside a worktree context.** `/wrap` resolves `{repo}` from the git root. When running inside `.worktrees/nightshift/2026-06-28`, does `git rev-parse --show-toplevel` return the worktree path or the main repo path? If the worktree path, wiki detection, CONTEXT.md reads, and state file paths may break.

2. ~~**Test command detection.**~~ RESOLVED — hard pre-flight failure if no test script detected.

3. ~~**Branch collision on same-day re-run.**~~ RESOLVED — branch uses `YYYY-MM-DD-HHMM` timestamp + existence guard.

4. **`CONTEXT.md` glossary doesn't exist yet in any project.** The workflow depends on `/grill-with-docs` creating it on first run. First nightshift on a project without a prior grilling session would have no glossary context.

5. **Vanilla JS dev-feedback needs a server endpoint.** The skill spec assumes `/api/dev-feedback` exists, but for non-Next.js projects (Craft CMS, static HTML) there's no obvious server to host it. The skill would need to provide a standalone Node server or use a different approach (direct GitHub API with a PAT).

6. ~~**The `/wrap` skill still references `archives/raw/` for claude-os.**~~ RESOLVED — wrap updated to write directly to curated `docs/wiki/` for claude-os, stage to `raw/aios/` for project repos.

## Out of scope

- Docker/container isolation — worktrees are sufficient for now.
- Scheduled nightshift runs — manual kick first, scheduling is a separate concern.
- Multi-repo nightshift — runs against current repo only.
- `/to-prd` and `/to-issues` skill authoring — these are Matt's existing skills, adopted as-is.
- CONTEXT.md template creation — deferred to first `/grill-with-docs` run per project.
