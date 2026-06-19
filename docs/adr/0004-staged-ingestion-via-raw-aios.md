# ADR 0004 — Staged ingestion via `raw/aios/`

**Status:** Accepted
**Date:** 2026-05-21
**Decision-makers:** Justin Lobaito
**Process:** Resolved during a `/grill-with-docs` session on the AIOS UI v2 "Bidirectional Hub" phase. The initial design had AIOS writing directly to curated wiki structure; Justin pivoted mid-session to staged ingestion.

## Context

[ADR 0003](0003-bidirectional-store-model.md) establishes that the AIOS UI is the seam between operator inputs and durable storage. The follow-on question: when AIOS writes to a project wiki (a capture, a chat-decision promotion, a session transcript), WHERE in the wiki does it land?

The wiki structure (per the `/wiki` skill at [/Users/justinlobaito/.claude/skills/wiki/SKILL.md](file:///Users/justinlobaito/.claude/skills/wiki/SKILL.md)) is curated:

```
{project}/
├── raw/                     # immutable source documents
│   └── README.md            # drop files here; LLM reads but never writes
└── wiki/
    ├── SCHEMA.md            # operating manual
    ├── index.md             # catalog of every wiki page
    ├── log.md               # append-only event log
    ├── overview.md          # current synthesis
    ├── sources/             # per-source summary pages
    └── decisions/           # ADR-style decisions (NNNN-slug.md)
```

The `/wiki ingest` workflow reads from `raw/`, drafts a summary into `wiki/sources/YYYY-MM-DD-<slug>.md`, proposes page updates, applies them, updates `index.md`, and appends to `log.md`.

Initial design: AIOS captures and chat decisions would write directly to `wiki/decisions/NNNN-<slug>.md` (or `wiki/sources/`) — the curated layer. Alternatives considered:

1. **Direct-to-curated writes** — AIOS picks decision numbers, generates slugs, applies the ADR template, updates `index.md`, appends to `log.md`. Fastest path from capture to visible-in-wiki.
2. **Gated promotion modal** — AIOS proposes a write, UI shows a diff, operator approves, then write lands in curated structure. Trust via approval.
3. **Staged ingestion via `raw/aios/`** — AIOS drops markdown files into `{wiki}/raw/aios/` only. The wiki's own `/wiki ingest` pass promotes from staging into curated form, on operator demand.
4. **Manual-only writes** — Capture and chat are scratch; nothing auto-writes anywhere. Operator copies content into the wiki by hand.

## Decision

Adopt **staged ingestion via `raw/aios/`**. AIOS writes ONLY to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md`, never into `wiki/decisions/`, `wiki/sources/`, `wiki/log.md`, or `wiki/index.md`. Promotion from `raw/aios/` into curated form is the responsibility of the `/wiki ingest` pass, invoked from the UI's Pending Ingestion section on each Project page.

Three drop kinds:
- `capture-YYYY-MM-DD-<slug>.md` — operator capture from the Capture box.
- `chat-decision-YYYY-MM-DD-<slug>.md` — operator promoted a chat AI turn via "Drop to raw."
- `chat-session-YYYY-MM-DD-<id>.md` — full chat transcript dropped on session close.

Files in `raw/aios/` are **immutable once written**. The wiki's existing `raw/` convention (LLM reads, never modifies) extends to AIOS-sourced material.

The rejected alternatives:

- **Direct-to-curated writes** — Would require AIOS to reimplement decision numbering, slug generation, ADR templating, and `index.md` / `log.md` maintenance per wiki. That's the `/wiki` skill's entire job; double-implementing creates drift. Also makes AIOS edits show up in the wiki repo's git history as edits to canonical structure, blurring authorship.
- **Gated promotion modal** — Conflicts with the "auto-write + receipt feed" trust model adopted alongside this decision. Gates slow the operator down; the staging-inbox approach gets the same safety without the friction.
- **Manual-only writes** — Defeats the bidirectional-store model from [ADR 0003](0003-bidirectional-store-model.md). If AIOS can't write, it's just a viewer.

## Consequences

### Positive

- AIOS doesn't have to know wiki structure beyond "there's a `raw/` folder." Each new project wiki works out of the box.
- The `/wiki ingest` pass remains canonical curator. Justin's existing investment in that skill compounds.
- Cross-repo boundaries stay clean. AIOS writes land in an inbox that the operator can review file-by-file. The wiki repo's git history shows AIOS-sourced raw drops as their own commits, distinct from ingestion-promoted edits to curated files.
- The trust model improves. Receipts show "dropped to `raw/aios/`" (staging), and a separate Pending Ingestion surface shows what hasn't been promoted yet. Two-stage visibility instead of one-stage hope.
- Same pattern as how PDFs and meeting notes already land in `raw/` — AIOS becomes just another source.

### Negative / accepted trade-offs

- **Latency between capture and "in the wiki."** A captured decision doesn't appear in `wiki/decisions/active/` until the operator runs the ingest. Mitigated by the Pending Ingestion surface making the gap visible and one-click to close.
- **Two-step mental model.** Operator has to know: AIOS captures → raw drops → ingest pass → curated wiki. More cognitive overhead than "I typed it, it's in the wiki."
- **Risk of stale `raw/aios/` buildup.** If the operator never runs the ingest, the staging inbox accumulates. The Pending Ingestion count is the pressure valve; it should be visibly non-zero often enough to prompt action.
- **The `/wiki ingest` workflow needs to be reasonably batch-friendly.** If it can only ingest one source at a time interactively, the operator UX degrades. The unified `/wiki ingest` skill handles batch processing of everything new in `raw/aios/`.

### Reversibility

| Component | Cost to reverse |
|---|---|
| Stop writing to `raw/aios/`, write to curated instead | High. AIOS would need decision-numbering, templating, index/log maintenance — all the curator logic it deliberately doesn't have. |
| Add gated promotion alongside staging | Medium. UI gains a diff-preview modal; staging path stays the same. Could be added later without breaking existing drops. |
| Move from `raw/aios/` to a different staging path | Low. One constant in `aios-ui/lib/raw-drops.ts`. Existing drops can be relocated by `mv`. |

The decision is hard to reverse in the "go direct to curated" direction because that's a major curator-logic implementation, but cheap to extend with additional trust mechanisms later.

## Cross-references

- [CONTEXT.md → Raw drop](../../CONTEXT.md), [Pending ingestion](../../CONTEXT.md), [LLM-wiki](../../CONTEXT.md)
- [ADR 0003 — Bidirectional store model](0003-bidirectional-store-model.md)
- [wiki SKILL.md](file:///Users/justinlobaito/.claude/skills/wiki/SKILL.md) — canonical wiki structure and ingest workflow
- Memory: [project-aios-ui-staged-ingestion](../../../../.claude/projects/-Users-justinlobaito-repos-claude-os/memory/project_aios_ui_staged_ingestion.md), [feedback-prefer-staged-ingestion](../../../../.claude/projects/-Users-justinlobaito-repos-claude-os/memory/feedback_prefer_staged_ingestion.md)
- Plan: `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md`
