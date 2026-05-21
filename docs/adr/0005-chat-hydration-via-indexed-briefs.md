# ADR 0005 — Chat hydration via pre-built indexed briefs

**Status:** Accepted
**Date:** 2026-05-21
**Decision-makers:** Justin Lobaito
**Process:** Resolved during a `/grill-with-docs` session on the AIOS UI v2 "Bidirectional Hub" phase.

## Context

The v1 Project chat endpoint at [`aios-ui/app/api/chat/[client]/[project]/message/route.ts`](../../aios-ui/app/api/chat/[client]/[project]/message/route.ts) errors out with `"no active session — call /load first"`. The intent in [ADR 0001 §6](0001-aios-ui-architecture.md) was that the chat panel would auto-fire `claude --print "/load {slug}"` on first drawer expand. In practice the wiring never landed, and the operator has to drop to the CLI to prep a session before the UI chat works.

Four mechanisms for getting project context into the chat were considered:

1. **Auto-load on first open per session, cached** — Open a project page, background-run `/load-project`, stuff the brief into context, cache to disk. Subsequent opens in the same session reuse. Slow first open (5-15s); fast after.
2. **Pre-built indexed briefs** — A background indexer keeps `.aios-cache/briefs/<slug>.md` fresh as `clients.yaml` / wiki / memory change. Chat reads the cached brief on every open. Always instant; sometimes mildly stale. Adds: file watcher, invalidation rules, indexer process.
3. **Lazy load with hydration tools** — Chat starts blank. The model has tools to call `read_wiki`, `read_decisions`, `read_memory`. It pulls what it needs per turn. Token-cheaper but chat "forgets" until reminded; the operator notices.
4. **Pinned context cards** — Project page renders wiki/decision content as visible cards above the chat. Chat is told "all visible cards are your context." Tightly coupled UI ↔ chat; chat can't see content the operator scrolled past.

## Decision

Adopt **pre-built indexed briefs** (option 2).

A background indexer (`aios-ui/lib/indexer/build-brief.ts`) builds a per-project Markdown brief at `aios-ui/.aios-cache/briefs/<slug>.md` by invoking the existing `/load-project` skill as a subprocess and capturing its stdout. A `chokidar` watcher (`aios-ui/lib/indexer/watcher.ts`) observes `clients.yaml`, `references/`, `memory/`, each project's resolved `docs_paths`, and each project's `wiki/raw/aios/` directory; on change, the affected brief rebuilds with a 500ms debounce.

Project chat reads the cached brief on every session bootstrap. **Dynamic data (Gmail and calendar) is NOT in the static brief** — it's fetched live at chat bootstrap because it goes stale fast. The chat surface shows a "Brief loaded (built Nm ago)" status and a "Refresh context" button that triggers an indexer rebuild + a fresh Gmail/calendar fetch + a session restart.

The rejected alternatives:

- **Auto-load on first open per session** — The 5-15s first-open latency is a real workflow tax. Justin is going to open Project pages dozens of times a day; making him wait every time is the wrong default. The cached-brief approach gives the same content with zero wait.
- **Lazy load with hydration tools** — Token-efficient but the chat's mental model becomes "I don't know what I don't know until I ask." Justin's complaint is exactly about discontinuity; lazy load amplifies it.
- **Pinned context cards** — Tight UI/chat coupling. Works for chat sessions that stay on the project page, but breaks if the operator chats while looking at the receipt feed or the Pending Ingestion section. Less robust.

## Consequences

### Positive

- Project chat becomes instant. No "let me load context first" friction.
- Static brief is cheap to inspect. The operator can `cat .aios-cache/briefs/wild-rose.md` to see exactly what the chat knows. Audit trail for chat behavior.
- The indexer reuses `/load-project` rather than reimplementing it. When `/load-project` improves, briefs inherit the improvement on next rebuild.
- The watcher closes the loop on staged ingestion: when a `raw/aios/` drop lands, the brief rebuilds, and the next chat session sees the new material (even before the wiki ingest pass promotes it to curated structure).

### Negative / accepted trade-offs

- **Indexer lifecycle is real engineering.** Watcher boot, debouncing, error handling, partial rebuilds, recovery from a crashed `/load-project` subprocess. Not free.
- **Staleness window.** Between a file change and the rebuild finishing (typically 1-3 seconds for `/load-project`), the brief is stale. Mitigated by debounce + "built Nm ago" status; the operator sees the staleness and can hit Refresh.
- **Disk usage.** One brief per project. For ~12 projects, ~12 MB at most. Negligible.
- **Cold start.** First time the UI starts, briefs don't exist yet. Either: (a) the indexer builds all briefs at boot (slow startup), or (b) briefs are built lazily on first chat open per project (slow first open per project, but only once). The plan picks lazy with proactive watcher-driven rebuilds thereafter — accept the first-chat-per-project latency once.
- **Gmail/calendar data isn't in the brief** — by design, but means chat sometimes answers stalely about meetings or threads if the operator doesn't refresh. Visible via the timestamp.

### Reversibility

| Component | Cost to reverse |
|---|---|
| Disable the indexer; revert to auto-load-on-open | Low. Chat bootstrap re-invokes `/load-project` per session instead of reading the cache. Briefs remain on disk harmlessly. |
| Replace `chokidar` with a different watcher | Low. File-watching is a small interface (`onChange(path) → rebuildBrief(slug)`). |
| Move from disk cache to in-memory cache | Low. Briefs are derived from filesystem; cache layer is opaque to consumers. |
| Replace `/load-project` subprocess with a TypeScript reimplementation | High. Would require porting all the skill's logic; defeats the "reuse the canonical loader" principle. |

The decision is cheap to reverse in the direction of simpler mechanisms (no indexer, no cache); expensive to reverse in the direction of reimplementing `/load-project` natively. That asymmetry is intentional — when in doubt, fall back to the subprocess pattern that has worked for triage and rituals.

## Cross-references

- [CONTEXT.md → Project brief](../../CONTEXT.md), [Project chat](../../CONTEXT.md)
- [ADR 0001 — AIOS UI architecture](0001-aios-ui-architecture.md) §3 (CLI subprocess pattern) and §6 (chat invocation)
- [ADR 0003 — Bidirectional store model](0003-bidirectional-store-model.md) — chat hydration is the read-side of the bidirectional pipe
- `/load-project` skill at [/Users/justinlobaito/.claude/skills/load-project/SKILL.md](file:///Users/justinlobaito/.claude/skills/load-project/SKILL.md)
- Plan: `/Users/justinlobaito/.claude/plans/wondrous-noodling-bonbon.md`
