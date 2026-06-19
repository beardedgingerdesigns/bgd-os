---
phase: 06-persistent-to-do-list-skill-lifecycle
verified: 2026-06-04T07:15:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 6: Persistent To-Do List + Skill Lifecycle Verification Report

**Phase Goal:** Stand up the operator-level to-do list and retire/rewire skill lifecycle commands.
**Verified:** 2026-06-04T07:15:00Z
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `todos/pending.md` exists in claude-os and survives across sessions | VERIFIED | File exists, git-tracked (`git ls-files --error-unmatch` passes), 33 lines, committed in `d5e6431` |
| 2 | Operator can add a to-do item manually and it persists until explicitly completed | VERIFIED | Format rules preamble documents manual adding; Source: manual in both seed items; instructions say "appended at the bottom of the Pending section" and "moved to completed.md when marked [x]" |
| 3 | `/load-project` is retired -- invoking it surfaces a deprecation notice pointing to the project wiki | VERIFIED | SKILL.md contains `DEPRECATED` prefix in description, `bike-method-phase: retired`, body says "This skill is deprecated" with redirect to project wikis. All 5 trigger phrases preserved in frontmatter description |
| 4 | `/onboard-client` runs the full sequence: intake -> clients.yaml -> /kickoff-project -> initial STATE.md -> decisions log entry -- in a single uninterrupted flow | VERIFIED | Phase 6 (Kickoff) chains to `/kickoff-project` with operator confirmation; Phase 7 (Initial STATE.md) seeds STATE.md in wiki root + `state/<slug>.md`; Phase 8 (Final Close) expanded checklist; output contract lists 8 artifacts; graceful chain degradation (rule 10) and STATE.md format parity (rule 11) added |
| 5 | Email threads are never written to the to-do list (ephemeral triage output, not persistent actions) | VERIFIED | Preamble contains bold callout: "**Email threads do NOT belong here.** Only extracted action items from triage belong in this list. Raw email threads remain in `aios-ui/.aios-cache/todos-today.json` as ephemeral triage output." |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `todos/pending.md` | Persistent to-do list with structured format | VERIFIED | 33 lines. H1 heading, format rules preamble, `## Pending` section, 2 seed items with checkbox + bold summary + metadata (Added, Source, Priority, Notes). Email exclusion rule present. |
| `todos/completed.md` | Archive for completed items | VERIFIED | 5 lines. H1 heading, preamble, empty `## Completed` section. Correct structure for receiving moved items. |
| `.claude/skills/load-project/SKILL.md` | Deprecation notice replacing original skill | VERIFIED | 33 lines (down from 344). `DEPRECATED` prefix in description, `bike-method-phase: retired`, all 5 trigger phrases preserved, body is informational with "What to do instead" (3 steps), "Why this changed" explanation, `/weekly-project-status` suggestion, Three Ms attribution preserved. |
| `.claude/skills/onboard-client/SKILL.md` | Rewired with full lifecycle chain | VERIFIED | 375 lines. Phases 6-8 added (Kickoff, Initial STATE.md, Final Close). Output contract expanded to 8 items. Rules 10-11 added. Description updated with "Full lifecycle" mention. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `todos/pending.md` | Phase 8 triage skill (future) | Structured format with `Source: triage` metadata line | VERIFIED | Format rules document `triage` as valid Source value; metadata structure is parseable for automated append |
| `.claude/skills/load-project/SKILL.md` | Claude Code skill recognition | Preserved trigger phrases in frontmatter description | VERIFIED | All 5 trigger phrases present: "/load {project}", "switch to {project}", "give me everything on {project}", "hydrate {project} context", "bring me up to speed" |
| `.claude/skills/onboard-client/SKILL.md` | `~/.claude/skills/kickoff-project/SKILL.md` | Skill chaining instruction in Phase 6 | VERIFIED | Phase 6 says "Now run `/kickoff-project {project-slug}`" with explicit reference to the 11-phase kickoff flow |
| `.claude/skills/onboard-client/SKILL.md` | `scripts/state-hook/state-prompt.md` | STATE.md format reference | VERIFIED | Phase 7 references "EXACT format from `scripts/state-hook/state-prompt.md`" and rule 11 enforces format parity |
| `.claude/skills/onboard-client/SKILL.md` | `state/<slug>.md` | Copy of initial STATE.md synced to claude-os | VERIFIED | Phase 7 says "copy the STATE.md to `state/{project-slug}.md` in the claude-os repo root"; `state/` directory exists with `.gitkeep` |

### Data-Flow Trace (Level 4)

Not applicable -- all artifacts are markdown instruction files and structured text documents. No dynamic data rendering.

### Behavioral Spot-Checks

Step 7b: SKIPPED (no runnable entry points -- all artifacts are markdown files consumed by Claude Code skill recognition, not executable code)

### Probe Execution

Step 7c: SKIPPED (no probes declared or applicable -- markdown-only phase)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TODO-01 | 06-01 | Persistent to-do list stored as first-class AIOS artifact | SATISFIED | `todos/pending.md` git-tracked, committed in `d5e6431` |
| TODO-02 | 06-01 | Action items generated by triage persist until completed | SATISFIED | Format supports `Source: triage` metadata; items persist in git until explicitly moved to `completed.md` |
| TODO-03 | 06-01 | Operator can manually add action items | SATISFIED | Format rules document manual addition; 2 seed items demonstrate the pattern with `Source: manual` |
| TODO-04 | 06-01 | Email threads managed by triage are ephemeral (not stored in to-do list) | SATISFIED | Bold preamble callout: "Email threads do NOT belong here" with explanation |
| SKILL-01 | 06-01 | Retire `/load-project` skill | SATISFIED | `DEPRECATED` in description, `bike-method-phase: retired`, execution body replaced with deprecation notice, all trigger phrases preserved |
| SKILL-02 | 06-02 | `/onboard-client` triggers full lifecycle | SATISFIED | Phases 6-8 chain intake through kickoff, STATE.md seed, and expanded close; graceful degradation ensures core writes survive chain failure |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.claude/skills/onboard-client/SKILL.md` | 14 | Stale intro text: "intake counterpart to `/load-project`" | Info | `/load-project` still exists (shows deprecation notice), so reference is technically accurate. Plan explicitly scoped Phases 1-5 intro as unchanged. |
| `.claude/skills/onboard-client/SKILL.md` | 164 | Stale template: "Run `/load {project-slug}`" in memory file template | Info | Inside a Phase 5 template that was explicitly scoped as "do NOT change." The `/load` command still works (shows deprecation). |
| `.claude/skills/onboard-client/SKILL.md` | 368 | Stale first-run note: "run `/load {new-project-slug}`" | Info | Inside "First-run notes" section explicitly scoped as "do NOT change" in the plan. |
| `.claude/skills/onboard-client/SKILL.md` | 184, 190 | Template placeholders: "{placeholder for description}", "{placeholder rows}" | Info | Inside fenced code block template for reference doc scaffolding. Replaced at runtime. Not stubs. |

No TBD/FIXME/XXX debt markers found in any phase 06 files.

### Human Verification Required

No human verification items identified. All artifacts are structured markdown files verifiable through automated checks. No visual, real-time, or external service dependencies.

### Gaps Summary

No gaps found. All 5 roadmap success criteria verified. All 6 requirement IDs satisfied. All artifacts exist, are substantive, and are correctly wired.

The three stale `/load` references in `onboard-client/SKILL.md` are informational findings. They exist in sections the plan explicitly scoped as "do NOT change" (Phases 1-5 body, First-run notes). Since `/load-project` still exists and responds with a deprecation notice, the references remain technically functional. These could be cleaned up in a future maintenance pass but do not block the phase goal.

---

_Verified: 2026-06-04T07:15:00Z_
_Verifier: Claude (gsd-verifier)_
