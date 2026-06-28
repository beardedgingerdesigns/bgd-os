# AIOS Wiki

This is the curated knowledge base for Justin's AIOS — the strategic layer above individual project wikis. It holds cross-project knowledge, business strategy, research, and compounding insights that don't belong to any single project.

## Structure

| Directory | What lives here |
|---|---|
| `identity/` | Who Justin is, positioning, niche, business identity. The evergreen "about me" that skills reference. |
| `strategy/` | Pivot thesis, business plan thinking, pricing models, partnership structures. |
| `research/` | Curated market analysis, competitive scans, client opportunity audits. |
| `frameworks/` | 3Ms, voice guide, engagement models, repeatable playbooks. |
| `clients/` | Cross-project client knowledge, relationship context, project briefs. |
| `insights/` | Compounding patterns from retros, lessons learned, what keeps breaking. |
| `advisors/` | Advisory board content (Nate Herk, Matt Pocock, Chris Do). |
| `concepts/` | AIOS design principles and architecture concepts. |

## Source Archive

`raw/` is read-only. Source material is preserved as-is. Never edit or delete files under `raw/`.

- `raw/aios/` — drops from AIOS sessions, /dispatch routing
- `raw/research/` — brainstorm output, research artifacts
- `raw/retros/` — retro insights

`/dispatch` writes to `raw/`. `/wiki ingest` reads from `raw/` and curates into wiki pages. Curated pages reference their raw sources as provenance.

## What does NOT live here

- `state/*.md` — operational, dashboard-driven. Lives at repo root.
- `todos/pending.md` — action items, triage-driven. Lives at repo root.
- `decisions/log.md` — append-only log. Stays at repo root. Key decisions may be curated into strategy/ pages.
- `context/priorities.md` — directional, changes by Justin's hand. Stays in context/. Wiki pages can reference it.
- `clients.yaml` — master registry. Stays at repo root.
- `archives/` — cold storage + inbox. Stays at repo root.

## Consumers

- `/brief` reads curated wiki pages alongside state/ for richer context
- `/ask-the-board` draws from advisors/ + strategy/ for deliberations
- `/level-up` reads insights/ for compounding pattern evidence
- `/dispatch` stages to raw/ for curation
