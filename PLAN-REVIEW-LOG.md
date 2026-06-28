# Plan Review Log: Day/Night Shift Development Workflow
Started 2026-06-28 ~12:00 CDT. MAX_ROUNDS=5.

## Round 1 — Codex

Found 18 issues across nightshift, dev-feedback, and wrap. Key themes:

1. **Nightshift state hygiene:** failed issues leave dirty worktree state; commit flow assumes agent already committed; no cleanup between issues.
2. **Branch collision:** same-day reruns create naming conflicts.
3. **Dependency resolution:** treats external open blockers as "ready" — should check actual issue state.
4. **Label lifecycle:** incomplete transitions (in-progress not removed on success).
5. **Dev-feedback security:** command injection via `execSync` with interpolated user text; server gated on public env var; no `res.ok` check on client.
6. **Dev-feedback stack detection:** conflates any React project with Next.js App Router.
7. **Wrap ordering:** digest written before review runs — findings won't appear in the digest.
8. **Wrap change detection:** `HEAD~5` is arbitrary; should use session/run base SHA.
9. **Wiki policy contradiction:** plan says write directly, wrap skill says staging only.
10. **Security model:** bypassPermissions on issue text from GitHub = prompt injection surface.
11. **Observability:** no durable per-run log.
12. **No concurrency guard.**
13. **Silent test skip** if no test command detected.

### Claude's response

**Accepted and will fix:**

- Branch naming → `nightshift/YYYY-MM-DD-HHMM` (trivial fix)
- Failed issue cleanup → `git checkout -- .` after failure before next issue
- Dependency resolution → check all blockers via `gh issue view`, not just batch membership
- Label lifecycle → remove `in-progress` on both success and failure
- Dev-feedback `execSync` → switch to `execFileSync` with argv array, no shell
- Dev-feedback server gate → separate `DEV_FEEDBACK_SECRET` server-only var
- Dev-feedback client `res.ok` check → add error handling
- Wrap ordering → move review+compound before digest assembly
- Wrap change detection → accept base SHA from caller (nightshift passes the pre-run HEAD)
- Wiki policy → already resolved this session (CLAUDE.md updated); wrap skill needs matching update
- Observability → add `nightshift-runs/<run-id>.md` per-run log
- Test command detection → hard fail if no test script found (require it, don't skip)

**Rejected:**

- Stack detection granularity (Vite React, Remix, etc.) — YAGNI. Justin's projects are Next.js or vanilla. Detect `next` in deps for Next.js, fall back to vanilla. Don't over-detect.
- Concurrency guard — single operator, single machine. Two nightshift runs at once is a user error, not an architecture problem. A warning at startup ("worktree already exists") is sufficient.
- Prompt injection from issue text — the `ready-for-agent` label is human-applied after `/to-issues` (which Justin reviews). The trust boundary is the label application, not the issue content. Adding author-allow-lists is overhead for a solo operator.
- Wrap Bike Method conflict — nightshift invoking `/wrap` via `claude --print` is the agent calling it, not a hook. The Bike Method phase refers to automated hook triggers, not subprocess invocations. No conflict.

## Round 2 — Codex

Codex correctly identified that Round 1 fixes were in PLAN.md but not in skill files. All 12 findings were "plan says X, skill still says old thing."

### Claude's response
Applied all 12 accepted fixes to the actual skill files. Sent Round 3.

## Round 3 — Codex

13 findings, mostly shell execution correctness in nightshift:

1. Path references broken after `cd` into worktree (log paths, git -C paths)
2. `LAST_GOOD_SHA` uninitialized before first issue
3. No enforcement that agent actually committed (HEAD may not have moved)
4. Test detection described as pre-flight but placed after agent run
5. Retry policy unspecified (incremental vs clean-room between attempts)
6. Worktree guard checks branch but not path
7. `/wrap` invoked without BASE_SHA
8. `/wrap` claude-os special case still stale
9. dev-feedback throw without UI error state
10. Vanilla dev-feedback still broken
11. PLAN.md cleanup description doesn't match skill
12. Wiki spec page is stale vs skill

### Claude's response

**Accepted:**
- Use absolute `REPO_ROOT` and `RUN_LOG` paths throughout (no relative paths after cd)
- Initialize `LAST_GOOD_SHA=$BASE_SHA` before the loop, use full SHAs
- Add commit verification (HEAD must differ from checkpoint)
- Move test detection to Step 0
- Define retry policy: incremental (keep changes between attempts 1-3, reset only on final failure)
- Check both branch and path in existence guard
- Pass BASE_SHA to wrap via environment variable
- Fix wrap claude-os special case
- Add error state to React dev-feedback component
- Update PLAN.md cleanup to match skill's reset --hard

**Rejected:**
- Vanilla dev-feedback overhaul — ponytail: vanilla is a fallback for non-Next projects. Justin's active dev projects are all Next.js. Mark vanilla as "requires a server endpoint — see Process step 3" and move on. Don't gold-plate a fallback.
- Wiki spec update — mark as "reflects grilled design, not implementation details; skill is authoritative." The wiki page is a concept doc, not a mirror of the skill.

## Round 4 — Codex

6 findings: --cwd doesn't exist (use cd subshell), wrap internal contradiction, stale plan refs, vanilla caveat, unchanged-HEAD retry spec, wiki doc stale.

### Claude's response
All 6 fixed in skill files and PLAN.md.

## Round 5 — Codex (MAX_ROUNDS reached)

5 findings:
1. Blocked issues still processed after sorting — need explicit ready/skipped split
2. Issues closed before push — push failure leaves closed issues with no branch
3. /wrap in worktree may dirty it before removal
4. PLAN.md still says "react" in one spot
5. Wiki doc stale vs skill

### Claude's response

**Accepted (will fix):**
- Blocked issues: split into READY and SKIPPED lists, only loop READY
- Close-after-push: defer issue closure until branch is pushed successfully
- Wrap/worktree ordering: run wrap against main repo paths (AIOS state, wiki), not in the worktree

**Rejected:**
- PLAN.md "react" mention — this is the Approach section describing the original design; the Implementation Decisions section already says "next". The plan is a living document, not a spec mirror.
- Wiki doc staleness — already addressed in Round 3: the wiki page is conceptual, the skill is authoritative. Not updating it every round.

### Unresolved disagreements at MAX_ROUNDS

Codex wants the wiki doc updated to mirror every operational detail in the skill. Claude's position: the wiki page is a concept document that describes the workflow model; the skill is the authoritative implementation reference. Keeping two documents in sync at the implementation level is maintenance debt for zero value — anyone implementing reads the skill, not the wiki.
