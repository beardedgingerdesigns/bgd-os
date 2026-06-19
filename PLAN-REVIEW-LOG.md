# Plan Review Log: Phase 9 — Prospect Pipeline
Started 2026-06-09. MAX_ROUNDS=5.

## Round 1 — Codex

### Findings (10 issues)

1. **PROSPECT-04 duplicate entries** — onboard-client would create duplicate clients.yaml entry since the entry already exists after bucket flip. VERDICT: Valid.
2. **Unsafe archive ordering** — Archive/delete happens before onboard/kickoff completes, no rollback. VERDICT: Valid.
3. **Contact matching shape inconsistency** — Root-level vs project-level contacts in clients.yaml. VERDICT: Valid.
4. **bucket: prospect vs prospects typo** — CONTEXT.md line 54 says `prospect` (singular), actual value is `prospects`. VERDICT: Valid (CONTEXT.md has a typo, plans use correct value).
5. **Partial dispatch failure silently processed** — Missing prospect doc logged as warning but thread still cached as processed. VERDICT: Valid.
6. **Auto-flip needs status_changed_at** — "Recently cooled" detection in weekly status can't work without a timestamp field. VERDICT: Valid.
7. **ask-the-board skill path wrong** — Plan references `.claude/skills/ask-the-board/` but skill is user-level at `~/.claude/skills/ask-the-board/`. VERDICT: Valid.
8. **Pre-fill bucket as paying conflicts D-12** — Plan 03 pre-fills paying but D-12 says active. VERDICT: Valid.
9. **Dual STATE.md creation** — Both convert-prospect and onboard-client create STATE.md. VERDICT: Valid.
10. **Grep-based verification insufficient** — VERDICT: Partially valid — added manual dry-run scenarios but grep is appropriate for markdown skill verification.

### Claude's Response

All 10 findings addressed:

1. **Duplicate entries**: Added "conversion mode" to onboard-client (Task 2, Plan 04). Detects existing clients.yaml entry with bucket: active and UPDATES instead of creating new.
2. **Unsafe archive**: Rewrote Plan 04 with two-phase commit pattern. Step 2 sets status: converting (prevents triage race). Archive (Step 6) is the LAST step, only after all outputs verified. Failed conversion leaves doc at original location with status: converting.
3. **Contact matching**: Added explicit note to Plan 01 Task 2 that prospect entries MUST use root-level contacts (same shape as existing clients). Added IMPORTANT callout.
4. **Bucket typo**: CONTEXT.md line 54 is a pre-existing typo in the discuss-phase output. Plans use correct `prospects` value. Not changing CONTEXT.md (that's a separate artifact).
5. **Partial dispatch**: Changed "skip and log warning" to deferred dispatch — failed dispatches recorded in triage-latest.json `deferredDispatches` array and retried on next triage run.
6. **status_changed_at**: Added `status_changed_at` and `previous_status` fields to prospect doc frontmatter (Plan 01). Auto-flip writes both fields (Plan 02). Weekly status reads them (Plan 05).
7. **ask-the-board path**: Fixed all references to `~/.claude/skills/ask-the-board/SKILL.md` (user-level skill).
8. **Bucket pre-fill**: Changed from `paying` to `active` with note about D-12 in Plan 03.
9. **STATE.md ownership**: Removed fallback STATE.md creation from convert-prospect. Single owner: /onboard-client → /kickoff-project chain. Convert-prospect only verifies it exists after chain completes.
10. **Manual verification**: Added `<manual_verification>` sections to Plans 01, 02, and 04 with concrete dry-run scenarios.

Rejected: None. All findings were legitimate.

## Round 2 — Codex

### Findings (8 issues)

1. **Contact shape mismatch** — Plan uses object contacts at root level, actual clients.yaml uses simple email strings under projects[].contacts. VERDICT: Valid — critical architectural issue.
2. **Prospects have projects: [], triage dispatch loop never runs** — matched_projects empty for new prospects. VERDICT: Valid — critical routing issue.
3. **Converting status not checked in dispatch or auto-flip** — Asserted but not specified. VERDICT: Valid.
4. **Deferred dispatch too narrow** — Only covers doc-missing, not parse errors or write failures. VERDICT: Valid.
5. **Plan 04 acceptance criteria stale** — Still references old step numbers after two-phase rewrite. VERDICT: Valid.
6. **PROSPECT-05 weakened** — Warning instead of blocking failure for missing STATE.md. VERDICT: Valid.
7. **CONTEXT.md typo** — `bucket: prospect` should be `bucket: prospects`. VERDICT: Valid.
8. **Plan 05 mixed ask-the-board paths** — Inconsistent between files_modified, artifacts, and verify. VERDICT: Valid.

### Claude's Response

All 8 findings addressed:

1. **Contact shape**: Rewrote Plan 01 clients.yaml entry to use simple email strings (matching existing format). Added explicit note about two separate contact surfaces: clients.yaml (simple emails for triage matching) vs prospect doc frontmatter (rich objects for dossier).
2. **Triage routing**: Rewrote Plan 02 Task 1 with TWO changes: (a) extend Step 4 to check root-level `client.contacts` in addition to `projects[].contacts`, (b) change Step 8 from "for each matched_project" to "for each matched_entity" with `{client_slug, bucket, project_slug?}`. Prospect dispatch keyed on client_slug even when project_slug is null.
3. **Converting status guards**: Added explicit `status in [converting, converted, dead]` check to prospect dispatch (before write) AND to auto-flip (skip converting alongside converted/dead).
4. **Deferred dispatch broadened**: Now covers all failure modes with reason codes: `prospect-doc-missing`, `frontmatter-parse-error`, `timeline-section-missing`, `write-failed`, `status-blocked`. 3-retry cap per thread/slug pair.
5. **Plan 04 acceptance criteria**: Rewritten to match two-phase flow. Step numbers corrected. Added `converting` grep check.
6. **PROSPECT-05 blocking**: Missing STATE.md is now a BLOCKING failure that prevents archive (Phase B). Conversion stays in `converting` state until STATE.md exists.
7. **CONTEXT.md fixed**: Changed `bucket: prospect` to `bucket: prospects` on line 54.
8. **Plan 05 paths unified**: All artifact, key_link, verify, and files_modified paths now consistently use `~/.claude/skills/ask-the-board/SKILL.md`.

Rejected: None. All findings were legitimate. Finding #1 and #2 were particularly important — they would have caused triage to silently ignore all new prospects.

## Round 3 — Codex

### Findings (4 issues)

1. **Bucket flip timing race** — Bucket flipped to active in Phase A, but triage sees active + no project = falls through to wiki dispatch (no wiki exists yet). VERDICT: Valid — subtle timing bug.
2. **Retry not idempotent** — Re-running after failure finds bucket already flipped, Step 1 rejects `converting`. VERDICT: Valid.
3. **Plan 03/04 ordering unsafe** — Plan 04 Task 2 depends on Plan 03's Step 0 addition. Both Wave 2, no dependency declared. VERDICT: Valid.
4. **status-blocked deferred is wrong for terminal states** — Retrying dead/converted dispatches 3 times is noise. Only converting is transient. VERDICT: Valid.

### Claude's Response

All 4 addressed:

1. **Bucket flip deferred to Phase B**: Bucket stays `prospects` throughout Phase A (converting status prevents dispatch). Bucket flips to `active` only in Phase B after wiki/STATE.md confirmed. This eliminates the active-with-no-wiki window.
2. **Idempotent retry**: Step 1 now detects `converting` status as a retry case. Checks what state survived: if wiki+STATE.md exist → skip to Phase B; if not → resume from Step 3. No rejection on retry.
3. **Dependency fixed**: Plan 04 `depends_on: [1, 3]` — must wait for Plan 03 (onboard-client Step 0) before Plan 04 Task 2 patches it.
4. **Terminal vs transient**: `converted`/`dead` are terminal skips (marked handled, no deferred entry). Only `converting` is deferred with reason `status-converting` for retry.

Rejected: None.

## Round 4 — Codex

### Findings (4 issues)

1. **Conversion mode detection wrong trigger** — Task 2 detects on bucket: active, but bucket is still prospects during Phase A. VERDICT: Valid.
2. **Retry can skip wiki seeding** — Wiki + STATE.md exist but seed files didn't write. Skip to Phase B loses content. VERDICT: Valid.
3. **Deferred dispatch after conversion loses intel** — After conversion completes, deferred entries retry but doc is archived and bucket is active. Need to reroute to wiki. VERDICT: Valid.
4. **Stale step numbers in acceptance criteria** — Steps 4/5 swapped but criteria not updated. VERDICT: Valid.

### Claude's Response

All 4 addressed:

1. **Conversion mode trigger**: Changed from `bucket: active` to `status: converting` in prospect doc frontmatter. onboard-client detects existing entry by slug match regardless of bucket value.
2. **Retry checks seed files**: Added check for prospect seed files (prospect-timeline-*, prospect-problems-*) in wiki raw/aios/ before skipping to Phase B. Three resume points: Step 3 (no wiki), Step 4 (wiki exists, no seeds), Phase B (all present).
3. **Deferred dispatch re-resolves target**: Retry logic now re-reads clients.yaml for current bucket. If bucket changed to active/paying with a wiki → reroute to wiki dispatch. If still prospects → retry prospect dispatch. If converted/dead → clear (terminal). Retry cap increased to 5 to handle conversion windows.
4. **Step numbers aligned**: Acceptance criteria now correctly reference Step 3 (onboard), Step 4 (seed/verify), Step 5 (bucket flip), Step 6 (archive).

Rejected: None.

## Round 5 — Codex

VERDICT: APPROVED

No material blockers. Key improvements confirmed:
- Prospect registry contacts as simple strings
- Triage routes via matched_entity
- Conversion keeps bucket: prospects until Phase B
- Onboard conversion mode triggered by status: converting
- Retry checks wiki/STATE/seed files before finalizing
- Deferred dispatch re-resolves clients.yaml
- Plan 04 depends on Plan 03

Residual risk: grep-heavy verification for markdown skills. Manual dry-runs are the real safety net.

## Summary

| Round | Issues Found | Issues Addressed | Key Improvement |
|-------|-------------|------------------|-----------------|
| 1 | 10 | 10 | Two-phase commit, deferred dispatch, status_changed_at |
| 2 | 8 | 8 | Contact matching architecture, matched_entity routing |
| 3 | 4 | 4 | Bucket flip deferred to Phase B, idempotent retry |
| 4 | 4 | 4 | Conversion mode trigger, seed file checks, dispatch rerouting |
| 5 | 0 | - | APPROVED |

Total: 26 issues found and addressed across 4 revision rounds.
