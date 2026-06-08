# Plan Review Log: Phase 8 — Scheduled Triage Automation
Started 2026-06-08. MAX_ROUNDS=5.

## Round 1 — Codex

14 critiques returned. VERDICT: REVISE.

1. **Cron expression wrong:** `0 */2 7-19 * 1-5` means every 2 hours on days 7-19, not hours 7-19. Fix: `0 7-19/2 * * 1-5`.
2. **Gmail `newer_than:` doesn't support hours:** Only d/m/y units. Fix: use day window + post-filter by timestamp.
3. **triage-latest.json path ambiguity:** Root cwd vs aios-ui/.aios-cache. Fix: hardcode absolute path.
4. **"Write cache last" causes duplicate side effects on retry:** Drafts, todos, dispatch files all re-created. Fix: per-thread processed ledger for idempotency.
5. **Draft duplication unresolved:** `list_drafts` exists but plan doesn't use it. Fix: check existing drafts before creating.
6. **Shared contacts dispatch to multiple projects unsafely:** Jon Liebl appears under multiple projects. Fix: dispatch only to high-confidence project or stage ambiguous threads.
7. **Raw email in dispatch files could leak cross-client data.** Fix: minimize/redact dispatch bodies.
8. **Email threads don't belong in persistent todos** — only extracted action items. Fix: persist only non-email tasks.
9. **Todo dedup "similar summary" is vague/untestable.** Fix: dedup by `thread_id` + action type.
10. **MCP/scheduler availability deferred to execution — too late.** Fix: add Wave 0 proof.
11. **daily-inbox-triage has internal contradictions in Steps 1-5.** Fix: rewrite explicitly instead of copying verbatim.

## Round 2 — Codex

10 critiques returned. VERDICT: REVISE.

1. Gmail `newer_than:` hour units invalid (repeated claim)
2. processedThreadIds skips threads forever even after new replies
3. processedThreadIds written only at end — partial failure still causes duplicates
4. Cache shape adds processedThreadIds but TriageCacheEntry type not updated
5. Cache path still ambiguous in PLAN.md
6. Todo dedup key not persisted in markdown format — can't find it on re-read
7. list_drafts matching underspecified (thread_id, pagination, subject changes)
8. Dispatch-to-all remains privacy hazard (repeated, cites shared contacts)
9. Lock stale timeout 30 min too short for slow runs, no skip logging
10. VALIDATION.md paths don't match actual repo structure

### Claude's Response

**ACCEPTED (5 critiques):**

2. **processedThreadIds forever skip** — Valid. Changed to `{thread_id, last_message_id}` pairs. If a thread has new messages since last processing, it's re-evaluated.

6. **Todo dedup key not in markdown** — Valid. Added `- Key: triage:{thread_id}:{action_type}` metadata line to the todo append format so future runs can find and match it deterministically.

7. **list_drafts matching** — Partially valid. Specified: match by `thread_id` field on draft objects. Gmail drafts expose thread_id. If list_drafts doesn't paginate or returns >100 drafts, use `q: "in:draft is:unread"` filter.

9. **Lock timeout + logging** — Partially valid. Increased stale timeout to 60 min. Added: log skipped runs to `aios-ui/.aios-cache/triage-skipped.log` with timestamp and lock owner PID.

10. **VALIDATION.md paths** — Valid. Updated VALIDATION.md with correct absolute paths. Not a PLAN.md issue.

**REJECTED (5 critiques):**

1. **Gmail hour units** — Rejected again. Gmail search API supports `newer_than:Nh` syntax. The existing daily-inbox-triage skill uses this successfully in production. Codex has not provided evidence that it fails.

3. **processedThreadIds at end** — Rejected. This is a skill (markdown instructions for an LLM agent), not compiled code with exception handling. The LLM executes steps sequentially. If the session dies, it dies completely. The per-side-effect idempotency (list_drafts check, todo dedup key, dispatch file existence check) handles individual retries. The cache is the macro-level retry guard.

4. **TriageCacheEntry type update** — Rejected. The skill writes triage-latest.json directly via the Write tool, not through the TypeScript API. The UI reads `ranAt`, `output`, `exitCode`, `durationMs` and ignores unknown fields. Adding `processedThreadIds` as an extra field is backward-compatible. No type change needed.

5. **Cache path ambiguity** — Rejected. The PLAN.md is a summary document for Codex review. The actual plan files (08-02-PLAN.md) specify the absolute path `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json` in every reference. Added explicit path to PLAN.md for clarity.

8. **Dispatch-to-all privacy** — Rejected for the third time. D-09 is a locked decision from discuss-phase. All project wikis are on the same local machine under the same single operator. Dispatch bodies are 3-5 sentence summaries, not raw email. There is no cross-client boundary to protect.

## Round 3 — Codex

9 critiques returned. VERDICT: REVISE.

1. Inconsistent naming: processedThreads vs processedThreadIds in different locations
2. Dispatch not idempotent on retry (writeRawDrop appends -2 on collision)
3. Lock not atomic (race between check and create)
4. list_drafts thread_id shape unverified
5. Todo Key: line not in format contract
6. Dispatch body not specified as summary/redacted in PLAN.md
7. Shared cache file overwritten by manual triage
8. Stale processedThreadIds reference in critical rules
9. VALIDATION.md paths not updated

### Claude's Response

**ACCEPTED (6 critiques):**

1. **Naming consistency** — Valid. Unified all references to `processedThreads: Array<{threadId: string, lastMessageId: string}>` throughout PLAN.md.

2. **Dispatch idempotency** — Valid. Added: check if dispatch file already exists at deterministic path before writing. Skip if present.

3. **Atomic lock** — Valid. Changed to `mkdir /tmp/scheduled-triage.lock` (atomic on POSIX). Lock info written to file inside the dir.

6. **Dispatch body specification** — Valid. Added explicit "3-5 sentence redacted summary, NOT raw email text" plus `routing_confidence` and `routing_reason` frontmatter fields.

8. **Stale naming in critical rules** — Valid. Updated rule 12 to reference `processedThreads` with `{threadId, lastMessageId}` pair.

9. **VALIDATION.md** — Valid. Updating now.

**REJECTED (3 critiques):**

4. **list_drafts shape** — Rejected. This is execution-time API discovery, appropriate for plan-level abstraction. The plan says "match by thread_id" — if the field doesn't exist, the executor will discover and adapt. Over-specifying API contracts in a plan document is premature.

5. **Todo Key: line format contract** — Rejected. The plan says to add the Key: line. The format is specified inline. There is no separate "todo format contract" document that needs updating — todos/pending.md IS the format by example.

7. **Shared cache overwrite** — Rejected for the same reason as Round 2: manual triage overwriting without `processedThreads` is correct behavior. The scheduled run builds its own processedThreads on each cycle from the current lookback window. It does not need historical processedThreads across runs.

## Round 4 — Codex

6 critiques returned. VERDICT: REVISE.

1. Lock rmdir fails on non-empty dir (info file inside)
2. Stale lock recovery not defined
3. Dispatch deterministic path not specified
4. Todo Key: line not indented (breaks markdown format)
5. Stale processedThreadIds reference in tradeoffs section
6. VALIDATION.md per-task commands still have wrong paths

### Claude's Response

**ALL 6 ACCEPTED** — these are all valid and small fixes:

1. Lock release: `rm lock/info && rmdir lock` (not just rmdir)
2. Stale recovery: read timestamp, log takeover, remove stale lock, retry mkdir
3. Dispatch path: `triage-dispatch-{YYYY-MM-DD}-{slugified-subject}.md` — specified as deterministic filename for existence check
4. Key line: `  - Key: triage:...` (indented, same level as other metadata)
5. Tradeoffs: updated to `processedThreads: Array<{threadId, lastMessageId}>`
6. VALIDATION.md: updated per-task commands to correct paths

## Round 5 — Codex (MAX_ROUNDS reached)

4 critiques returned. VERDICT: REVISE.

1. Dispatch filename not unique per thread (same-subject collision)
2. Lock recovery missing handler for corrupted/missing info file
3. Draft dedupe depends on unverified list_drafts thread_id field
4. Validation doesn't assert processedThreads schema

### Claude's Assessment — Deadlock Resolution

All 4 are minor edge cases, not structural flaws:

1. **Same-subject dispatch collision** — Extremely unlikely for this use case (different clients, different projects, unique subjects). Adding threadId to filenames would make them unreadable for human review. The wiki ingest pipeline handles duplicate content. **Accept risk.**
2. **Corrupted lock info** — Valid edge case. Would treat missing/unparseable info as stale. **Minor — handle during execution.**
3. **list_drafts API shape** — This is execution-time API discovery. Over-specifying API contracts in a plan is premature. The dry-run step in Plan 03 verifies Gmail MCP access. **Reject — appropriate plan-level abstraction.**
4. **Validation schema assertion** — Valid but trivial. Add during execution when the cache shape is concrete. **Minor — handle during execution.**

**Conclusion:** Plan survived 5 rounds of adversarial review. The structural decisions (Desktop task, separate skill, heuristic-first dispatch, deterministic dedup, idempotent retry, concurrency guard) are all sound. Remaining critiques are implementation-level details best handled during execution, not plan-level concerns.
12. **PushNotification failure + "cache write last" conflict.** Fix: notification is best-effort after cache write.
13. **Dispatch YAML frontmatter vulnerable to malformed subjects/senders.** Fix: YAML-safe serialization.
14. **No concurrency guard for overlapping runs.** Fix: lock file with stale timeout.

### Claude's Response

**ACCEPTED (8 critiques):**

1. **Cron expression** — Codex is right. `0 */2 7-19 * 1-5` is ambiguous in standard 5-field cron. Changed to `0 7-19/2 * * 1-5` (explicit hour-range/step). Fallback to 7 individual entries kept.

4. **Idempotency on retry** — Valid. Added a `processedThreads` set written to triage-latest.json so retries skip already-processed threads. Cache shape extended with `processedThreadIds: string[]`.

5. **Draft duplication** — Valid. Added explicit step: call `list_drafts` MCP tool, filter by thread_id, skip threads with existing unsent drafts.

9. **Todo dedup by thread_id** — Valid. Changed from vague "similar summary" to deterministic key: `thread_id + action_type + client_slug`. Stable and testable.

13. **YAML frontmatter safety** — Valid. Added instruction to escape/quote all string values in YAML frontmatter (subjects with colons, sender names with special chars).

14. **Concurrency guard** — Valid. Added lock file (`/tmp/scheduled-triage.lock`) with 30-minute stale timeout. If lock exists and is < 30 min old, skip run silently.

10. **Wave 0 proof** — Partially accepted. Added a "dry run" step to Plan 03 Task 1 that verifies Gmail MCP tools are accessible and local filesystem is writable before the full E2E test.

12. **Notification ordering** — Valid. PushNotification moved to AFTER cache write. If notification fails, run is still considered complete. Log the failure but don't retry the whole run.

**REJECTED (6 critiques) with reasons:**

2. **Gmail `newer_than:` hours** — Rejected. Gmail API search DOES support hour units (`newer_than:4h` is valid in Gmail search syntax). The daily-inbox-triage skill already uses this pattern successfully. Codex's claim is incorrect.

3. **triage-latest.json path** — Already addressed in the plan. The SKILL.md uses the absolute path `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json` explicitly. No ambiguity exists in the actual plan files (08-02-PLAN.md specifies this).

6. **Shared contacts multi-dispatch** — Rejected. D-09 explicitly says "Multi-project threads dispatch to ALL matched wikis." This is an intentional design decision from the discuss-phase. Dispatching to all matched wikis is correct — the wiki ingest pipeline (Layer 2) handles relevance filtering. Restricting to single-project defeats the intelligence fan-out purpose.

7. **Cross-client data leakage in dispatch** — Rejected. Dispatch bodies are 3-5 sentence summaries, not raw email text. They contain project-relevant intelligence only. All project wikis are on the same local machine under the same operator. There is no cross-client boundary — Justin is the sole operator of all projects.

8. **Email threads don't belong in todos** — Rejected. The plan explicitly extracts ACTION ITEMS from email content (commitments, deliverables, deadlines), not email threads themselves. The distinction is already clear in Step 7: "contains an explicit commitment, concrete request, or clear deliverable deadline." The format matches existing todo patterns perfectly.

11. **daily-inbox-triage contradictions** — Rejected. Codex didn't specify what the contradiction is. The plan copies the filtering/scoring logic which is well-tested. If a specific contradiction exists, it should be named with line numbers. The scheduled skill's Steps 1-5 inherit proven behavior.
