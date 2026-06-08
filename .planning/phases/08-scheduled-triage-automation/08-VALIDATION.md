---
phase: 8
slug: scheduled-triage-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-08
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + CLI smoke tests |
| **Config file** | none — skill-based phase, no test framework |
| **Quick run command** | `cat aios-ui/.aios-cache/triage-latest.json \| node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"` |
| **Full suite command** | `gsd-sdk query cron.list 2>/dev/null && cat todos/pending.md && find ~/repos -path '*/raw/aios/triage-dispatch-*' 2>/dev/null` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick validation command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | TRIAGE-04 | T-08-01 | slugify sanitizes filenames | unit | `cd aios-ui && npx vitest run tests/lib/raw-drops.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | TRIAGE-02 | T-08-06 | pageSize caps Gmail fetch | manual | `cat aios-ui/.aios-cache/triage-latest.json` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 1 | TRIAGE-02 | T-08-02 | Draft only, never send | manual | Gmail MCP verify | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | TRIAGE-03 | T-08-03 | Append-only todo writes | manual | `cat todos/pending.md \| grep 'Source: triage'` | ❌ W0 | ⬜ pending |
| 08-03-02 | 03 | 2 | TRIAGE-04 | T-08-04 | slugify + absolute path validation | manual | `find ~/repos -path '*/raw/aios/triage-dispatch-*'` | ❌ W0 | ⬜ pending |
| 08-03-03 | 03 | 2 | TRIAGE-01 | T-08-07 | Single-operator filesystem | manual | Desktop Routines page verification | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify `todos/pending.md` exists (Phase 6 dependency)
- [ ] Verify at least one project wiki has `raw/aios/` directory (Phase 7 dependency)
- [ ] Verify Gmail MCP tools are accessible (`search_threads`, `get_thread`, `create_draft`)
- [ ] Verify CronCreate tool is available for scheduling

*Existing infrastructure covers dependency verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cron fires on schedule | TRIAGE-01 | Requires waiting for cron interval | Set short test interval, verify execution log |
| Draft appears in Gmail | TRIAGE-02 | Requires Gmail UI verification | Check Gmail Drafts folder after triage run |
| Action items persist | TRIAGE-03 | Requires multi-run verification | Run triage twice, verify items survive |
| Wiki dispatch lands in raw/aios/ | TRIAGE-04 | Requires project-relevant email | Send test email, verify dispatch file created |
| Heuristic-first classification | TRIAGE-05 | Requires ambiguous email content | Send ambiguous email, verify LLM only fires on tiebreaker |

---

## Validation Sign-Off

- [ ] All tasks have manual verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
