# ADR 0007 — UI applies AIOS-drafted state diffs

**Status:** Accepted
**Date:** 2026-06-19
**Decision-makers:** Justin Lobaito
**Process:** Brainstorm + spec (`docs/superpowers/specs/2026-06-19-aios-state-writeback-design.md`), then `ce-plan` (`docs/plans/2026-06-19-002-feat-aios-state-writeback-plan.md`). Implemented in the AIOS State Write-Back feature.

## Context

The AIOS UI has been read-only on `state/<slug>.md`. Per PRODUCT.md, "the filesystem is the source of truth" and "editing happens outside in the operator's editor." State files changed only when Justin edited them by hand or a project `/wrap` wrote them.

This left a gap: triage reads email that contradicts a project's state (a launch date slips, a status flips, a blocker clears), AIOS notices the drift (the brief flags it), but nothing reconciles `state/<slug>.md`. The dashboard's source of truth goes stale until a human touches each project. Justin asked for AIOS to act as the project manager — keep state current from what it reads — without silently rewriting the source of truth on inference.

The resolution (see spec): triage **drafts** state-update proposals on contradiction; a new **Sync** review queue in the UI lets Justin apply, edit, or dismiss each as a diff. Applying a proposal means the UI writes `state/<slug>.md` for the first time, which nuances the "editing happens outside" principle and warrants this record.

## Decision

The UI MAY write `state/<slug>.md`, but only by **applying an AIOS-drafted, human-approved diff** — never as freeform editing. The constraints:

- **Drafted, not authored by the UI.** Proposals are produced by the triage skills (the detector) and stored in `aios-ui/.aios-cache/pending-state-updates.json`. The UI applies them; it does not let the operator type arbitrary state-file content (Edit only tweaks a proposed value before applying).
- **Human-gated.** Nothing auto-applies. Every write is one explicit Apply click in the Sync view.
- **Clobber-guarded.** Each proposal records the file's `**Updated:**` date at draft time. Apply refuses (HTTP 409, "re-review") if the file moved since, so a UI apply never overwrites a fresher `/wrap` edit.
- **Thin, field-targeted deltas.** Apply splices one field (status / current status / next step / blocker) and bumps `**Updated:**`, mirroring `/dispatch` Step 4 — not whole-file rewrites.
- **Attributable + reversible.** Applied lines carry a `(via triage)` marker, distinguishing them from `/wrap` edits, and git is the audit trail.

## Consequences

- The dashboard's source of truth stays current ambiently: triage proposes, Justin clears the Sync queue in seconds, no per-project hand-editing.
- A new, narrow write surface exists in the UI. It is bounded by the constraints above; the editor remains the place for freeform state authoring.
- **[ADR 0004](0004-staged-ingestion-via-raw-aios.md) still stands.** This decision applies only to the AIOS operational `state/` layer. The UI still NEVER writes into a project wiki's curated structure — triage continues to stage wiki intelligence to `{wiki}/raw/aios/`, and the wiki's own ingest pass promotes it. State write-back and wiki staging are separate paths.
- Scope is contradictions of existing state fields. Creating state files for projects that lack one remains `/dispatch` / `/kickoff-project` work.
