# ADR 0006 — CLAUDE.md as router; claude-os as dispatcher and advisory layer

**Status:** Accepted
**Date:** 2026-06-12
**Decision-makers:** Justin Lobaito
**Process:** Followed from the 2026-06-12 router-test audit (`audits/audit-2026-06-12.md`), triggered by ingesting Nate Herk's "I Turned Claude Fable Into The Ultimate Second Brain" (2026-06-10, `docs/wiki/advisors/nate-herk/raw/research/`). Builds on the 2026-06-03 "dispatcher + strategic partner" decision.

## Context

CLAUDE.md had grown into a hybrid: part routing manual, part knowledge store. The audit found the knowledge-store half already rotting (a pitch date 13 days stale, an MRR figure $250 off against memory, a launched project listed as in-flight) while the routing half was incomplete (`state/`, `todos/`, `docs/wiki/` — including the three-advisor board — `brainstorm/`, `audits/`, and `clients.yaml` were unrouted or under-routed). Two inboxes existed (`raw/` and `archives/raw/`), and `docs/` root had become a junk drawer of meeting PDFs.

Nate Herk's router principle names the failure mode: a `CLAUDE.md` should mostly *point* — to context, indexes, skills, and method — and carry only evergreen role/goal framing. The pulse check: could the operator find the file by hand, does the agent find it fast, and do facts in the manual go stale? Every duplicated fact is a future contradiction.

## Decision

1. **CLAUDE.md stores pointers, not content.** Structure: identity stub (evergreen only) → operating model (read / route / advise) → routing tree (every directory, what it is, when to read it) → current-focus pointer → full skills table → rules → connections hot-cache line. Dated facts are banned; `context/` is canonical for anything that changes.
2. **`context/` is the single source of truth** for priorities, business facts, and identity detail. On conflict, `context/priorities.md` wins and the disagreeing artifact gets fixed.
3. **One inbox: `archives/raw/`.** All drops land there. `/dispatch` routes them: project material → project wiki `raw/aios/` staging (ADR 0004), OS-level knowledge → `context/`/`references/`, decisions → log, action items → todos, ephemera stays. A `ROUTING-LOG.md` records every routed item. Originals are never deleted.
4. **`state/` is the springboard layer** — one thin file per active project, consumed by `/brief` for "what needs a decision today." This plus `todos/` is the in-house answer to the project-tracking domain.
5. **The router test joins `/audit`** as a standing maintenance rule: long hunts and stale manual facts are architecture failures, not editorial ones.

## Consequences

- Reading CLAUDE.md alone no longer answers business questions — by design. The agent follows pointers, which costs one extra hop but eliminates the contradiction class entirely.
- `context/priorities.md` must be actively maintained; it now carries everything dated. `/brief` and `/audit` both flag staleness.
- Nate's full monorepo ("other worlds") pattern was considered and rejected: BGD project repos are client deliverables with independent deploy/handoff lifecycles. The hub-and-spoke two-tier model (claude-os + `repos/<slug>/docs/wiki/`, indexed by `clients.yaml`) keeps cross-project context without entangling client repos with the personal OS.
- `/load-project` is retired to `archives/skills/`; `/dispatch` + `/brief` + project wikis cover its job.
