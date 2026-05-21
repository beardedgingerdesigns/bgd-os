# Constraints — synthesized intel

Source: SPEC-type docs. Per-precedence rules, SPEC content is binding for engineering but overridden by locked ADRs where conflicts exist (see `INGEST-CONFLICTS.md`).

---

## CON-v3-capture-pipeline

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Architecture, §Components, §AI plumbing
- type: api-contract + protocol
- content:
  - **CaptureBox component** (`components/capture-box.tsx`) — client component on project pages; props `clientSlug`, `projectSlug`, `projectName`. States: idle / submitting / success / error. Keyboard: ⌘↵ submits, Escape clears. `aria-label="Capture text for ${projectName}"`. Status line `aria-live="polite"`.
  - **API route** `/api/capture/[client]/[project]` — POST, SSE-streaming. Spawns `claude --permission-mode bypassPermissions --print --output-format stream-json --verbose "/capture <text>"`. Streams `event: chunk` (text deltas) + final `event: done` (`CaptureRunResult`). 90s timeout.
  - **Wrapper** `lib/skills/capture.ts` exports `runCapture(text, { clientSlug, projectSlug, projectName, claudeOsRoot })`. Stream-json parser shared with v1/v2.
  - **No cache** — capture is one-shot writes; `/capture` skill is source of truth for what got written; UI reports success only.
- supersession note: v3 SPEC describes `/capture` as "routes the content to the right filesystem destination (memory, wiki, decisions log)." ADR 0004 (LOCKED, newer) restricts AIOS writes to `raw/aios/` staging only. The capture pipeline plumbing (subprocess, SSE) stays; the routing target is now `raw/aios/<kind>-YYYY-MM-DD-<slug>.md`. See INGEST-CONFLICTS.md → auto-resolved.

## CON-v3-admin-ritual-launcher

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Architecture, §Components, §AI plumbing
- type: api-contract + protocol
- content:
  - **RitualTile component** (`components/ritual-tile.tsx`) — server-component-capable tile in Admin grid. Renders title, description, "Last ran Xd ago" (from cache) + "run →" affordance. Placeholder tile uses dashed border + "Coming soon" line.
  - **RitualModal component** (`components/ritual-modal.tsx`) — client component. Dialog header (ritual name + last-ran timestamp), streaming output panel (plain mono pre-wrap), Run / Re-run button at bottom. Sibling of `DailyIngestModal`, not a refactor.
  - **API route** `/api/admin/[ritual]` — POST, SSE-streaming. Slug-validated against `RITUAL_SLUGS`. Spawns `claude --permission-mode bypassPermissions --print --output-format stream-json --verbose "/<ritual-command>"`. 5-minute timeout. On success, writes `RitualCacheEntry` to `.aios-cache/rituals/<slug>.json`.
  - **Slug → command map**: `level-up → /level-up`, `weekly-status → /weekly-project-status`, `audit → /audit`. Fourth tile `business-plans` is a v3.1 placeholder, not clickable.
  - **Wrapper** `lib/skills/ritual.ts` exports `runRitual(slug, { claudeOsRoot })`.
  - **Cache module** `lib/cache/rituals.ts` exposes `readRitualCache(slug)` / `writeRitualCache(entry)`. Env-var override `AIOS_CACHE_DIR` for tests. Per-ritual file; no master index. Malformed JSON → treat as missing (returns null).

## CON-v3-types

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Data model
- type: schema
- content (new types in `lib/types.ts`):
  ```ts
  interface CaptureRunResult {
    status: 'success' | 'failed' | 'timeout'
    output: string
    exitCode: number
    durationMs: number
    error?: string
  }
  type RitualSlug = 'level-up' | 'weekly-status' | 'audit'
  const RITUAL_SLUGS: readonly RitualSlug[]
  interface RitualRunResult {
    status: 'success' | 'failed' | 'timeout'
    exitCode: number
    output: string
    durationMs: number
    error?: string
  }
  interface RitualCacheEntry {
    ritual: RitualSlug
    ranAt: string                // ISO timestamp
    output: string               // raw Markdown
    exitCode: number
    durationMs: number
  }
  ```

## CON-v3-cache-layout

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Cache layout
- type: schema
- content:
  ```
  .aios-cache/
    triage-latest.json      (v1)
    sessions.json           (v2)
    rituals/                (v3)
      level-up.json
      weekly-status.json
      audit.json
    briefs/                 (v2, per ADR 0005)
      <slug>.md
  ```
  Per-ritual file shape matches `TriageCacheEntry`. No master index file.

## CON-v3-error-handling

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Error handling
- type: nfr
- content:
  - Capture subprocess fail → status line shows output + error; textarea retains content.
  - Capture timeout (90s) → "Capture timed out after 90s — try again with shorter text."; textarea retains content.
  - Capture network error → "Couldn't reach capture endpoint." Generic retry.
  - Ritual subprocess fail → modal shows streamed output to failure + error footer. Cache NOT written. Re-run available.
  - Ritual timeout (5 min) → "Ritual timed out after 5 min." Modal stays open. Cache NOT written.
  - Ritual cache JSON malformed → tile renders "Never run". Log parse error server-side.
  - Two tabs same ritual concurrently → both run; second-to-finish wins cache write. Accepted (no locking in v3).

## CON-v3-testing

- source: `/Users/justinlobaito/repos/claude-os/docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md` §Testing
- type: nfr
- content:
  - Fake `claude` fixtures at `tests/fixtures/fake-claude-capture.sh` and `tests/fixtures/fake-claude-ritual.sh`.
  - Unit tests for `runCapture`, `runRitual`, `readRitualCache`, `writeRitualCache` via Vitest, TDD-flow.
  - API route smoke tests for `/api/capture/[client]/[project]` and `/api/admin/[ritual]`.
  - No component tests (matches v2 omission).
  - Full Vitest run + HTTP smoke checks against live dev server.
  - Test count target after v3: ~69 (v2 baseline 57 + 12 new = 3 capture + 4 cache + 5 ritual).
