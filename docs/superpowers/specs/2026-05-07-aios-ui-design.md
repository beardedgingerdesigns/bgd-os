# AIOS UI — design spec

**Date:** 2026-05-07
**Owner:** Justin Lobaito (BGD)
**Status:** Approved for implementation planning

## Summary

A local Next.js web app that turns Justin's existing markdown-based AIOS into a browseable, project-scoped tracker with an AI thought-partner per project. Reads `references/`, `decisions/`, `context/`, `connections.md`, and the Claude Code memory directory. Groups everything by client → project. Renders a triage-first dashboard per project. Provides a per-project chat panel that shells out to the Claude Code CLI with that project's context auto-loaded. Adds a top-level Command Center surface for operator-level rituals (`/level-up`, `/audit`).

Solves a stated top pain: "no real tracker" for juggling concurrent projects.

## Goals

- See every active project at a glance, grouped by client, with risk flags surfaced
- Open any project and immediately see what to *do* (action items, blockers, stale commitments)
- Ask AI questions inside a project view with that project's full context auto-loaded — without copy-pasting into a Claude Code conversation
- Capture new information (a memory, a decision, a commitment) without leaving the project view
- Run operator-level skills (`/level-up`, `/audit`) from a Command Center, separate from project work
- Two-way sync with Claude Code conversations: edits in either place show up in the other within seconds, no database, no manual reconciliation

## Non-goals (v1)

- Mobile or phone access (local-only by choice; PWA/mobile is a future cycle)
- Multi-user, auth, sharing, or hosting
- Direct email / calendar / Bonsai integrations (those are separate `/level-up` candidates)
- In-browser markdown editing for general editing (capture box only — heavy edits stay in Claude Code or the code editor)
- Notifications, reminders, scheduled jobs
- Full-text search across all projects (basic project-scoped find is fine; cross-project search is v2)
- Two-way conflict resolution when the same file is edited in two places at once (last-write-wins is acceptable)

## Key decisions

| Decision | Choice | Why |
|---|---|---|
| Where it runs | Local-only on Mac (localhost) | No auth, no deploy, no cloud cost. Files stay on disk. Fastest to ship. |
| Project page shape | Computed dashboard | Tracker, not reader. Surfaces action items + risks, not just rendered markdown. |
| Project scope | All three buckets: paying clients, prospects, BGD-internal | Strategic work (BrandOS, productize) deserves a dashboard the same as client work. |
| File→project linking | YAML frontmatter on every project-scoped file | Explicit, durable, travels with the file. Requires one-time normalization pass. |
| MVP feature set | Dashboard + chat panel together | Both were the user's stated goal; ship together, minimal. |
| AI plumbing for chat | Shell out to Claude Code CLI | Inherits memories, skills, MCP servers. Chat IS Claude Code, not a lite version. |
| Input model | Capture box + filesystem watch | Low-friction capture via existing `/gsd-capture` skill. No in-browser editor. |
| Tech stack | Next.js + Tailwind + shadcn/ui | Full-stack in one process; server actions handle subprocess + file I/O; streaming first-class. |
| Top-level layout | Sidebar nav + dashboard right + chat collapsed at bottom | Classic SaaS layout, dense, familiar. |
| Dashboard composition | Triage-first | Risks at top, action items immediately below, brief collapsed by default. |
| Skill access | Chat panel only (no global cmd+K palette) | Skills run from whichever chat panel you're in (project or Command Center). |
| Extraction strategy | AI-extracted from prose + manual overrides | Handles existing loose-prose markdown without rewriting; overrides cover AI mistakes. |

## Architecture

Single-process Next.js app, run with `npm run dev`, opened at `http://localhost:3000`.

```
┌─ Next.js app ───────────────────────────────────────────────┐
│                                                             │
│  Server (App Router server actions / API routes)            │
│   ├── file readers      reads markdown from configured      │
│   │                     roots                               │
│   ├── frontmatter parser  gray-matter                       │
│   ├── extractor         shells `claude --print --model      │
│   │                     haiku-4.5`, caches JSON to disk     │
│   ├── capture handler   shells `claude --print "/gsd-       │
│   │                     capture <input>"` with project      │
│   │                     context                             │
│   ├── chat handler      spawns `claude --resume <id>`,      │
│   │                     streams stdout to client over       │
│   │                     WebSocket / SSE                     │
│   └── file watcher      chokidar; invalidates extractor     │
│                         cache on change, pushes UI refresh  │
│                                                             │
│  Client (React + Tailwind + shadcn/ui)                      │
│   ├── Sidebar           Command Center · Paying ·           │
│   │                     Prospects · BGD HQ                  │
│   ├── Dashboard         Triage-first composition            │
│   ├── Capture box       Per-project input                   │
│   └── Chat panel        Collapsible drawer at bottom        │
└─────────────────────────────────────────────────────────────┘
        ↑                                          ↑
   reads/writes                              spawns subprocess
        ↓                                          ↓
  ~/repos/claude-os/**.md                    Claude Code CLI
  ~/.claude/.../memory/**.md                 (Justin's existing setup)
```

## Data model

### Frontmatter schema

Every project-scoped markdown file gets YAML frontmatter:

```yaml
---
client: inside-out              # slug, matches clients.yaml key
project: inside-out-website     # slug, matches a projects entry
type: brief | memory | decision | note
status: active | paused | done  # optional
created: 2026-05-07             # ISO date
---
```

Files without a `client` or `project` value land in an "Unfiled" sidebar bucket and surface a one-click "assign to project" action.

### Client registry

A single top-level config defines the canonical client/project tree. Initial draft (subject to confirmation in implementation):

```yaml
clients:
  inside-out:
    name: Inside Out Iowa
    bucket: paying
    projects:
      inside-out-website:
        name: Website redesign
        status: active
        contract: $400/mo Bonsai
  wild-rose:
    name: Wild Rose Corporate
    bucket: paying
    projects:
      wild-rose-redesign: { name: Wild Rose redesign, status: active }
      thermal-kitchen:    { name: Thermal Kitchen redesign, status: active }
  tonequest:
    name: ToneQuest Report
    bucket: paying
    projects:
      tonequest-replatform: { name: Replatforming, status: active }
  terraplex:
    name: Terraplex
    bucket: paying
    projects:
      terraplex-hub: { name: Hub + dealer migrations, status: active }
  revolution:
    name: Revolution Drones
    bucket: prospects
    projects:
      brandos-phase1: { name: BrandOS Phase 1 hub, status: active }
  bgd-hq:
    name: BGD HQ
    bucket: internal
    projects:
      productize:    { name: Productize 18-month offering, status: active }
      business-plan: { name: 12-month business plan, status: active }
      brandos:       { name: BrandOS productization, status: active }
```

Lives at `~/repos/claude-os/clients.yaml`.

### Cache layout

```
~/repos/claude-os/.aios-cache/
  ├── extraction/
  │   ├── inside-out-website.json   # {action_items, stakeholders, ...}
  │   └── wild-rose-redesign.json
  ├── overrides/
  │   ├── inside-out-website.yaml   # manual pins/corrections
  │   └── ...
  └── sessions.json                  # project → claude session id
```

`.aios-cache/` is gitignored.

### Extraction output schema

```typescript
interface ExtractedProject {
  source_files: { path: string; mtime: number }[];
  action_items: { text: string; status: 'open' | 'done' | 'waiting'; source_file: string; source_line?: number }[];
  open_questions: { text: string; source_file: string }[];
  stakeholders: { name: string; role?: string; contact?: string }[];
  status_flags: { kind: 'risk' | 'info'; text: string; severity: 'high' | 'med' | 'low' }[];
  recent_decisions: { date: string; text: string; source_file: string }[];
  next_dates: { date: string; what: string }[];
  generated_at: number;
}
```

## Components

### Sidebar

```
┌─────────────────────┐
│ ▸ COMMAND CENTER  ●│   ← red dot = pending audit / overdue ritual
│                    │
│   PAYING           │
│     Inside Out   ●│   ← red = AR / risk
│     Wild Rose    ○│   ← grey = nominal
│     ToneQuest    ●│   ← red = active incident
│     Thermal K    ◐│   ← orange = launch approaching
│     Terraplex   ○│
│                    │
│   PROSPECTS        │
│     Revolution   ○│
│                    │
│   BGD HQ           │
│     Productize  ○│
│     Business pln ○│
│     BrandOS     ○│
│                    │
│   ▾ Unfiled (3)    │
└─────────────────────┘
```

Single-character status dot per project, color-coded from `status_flags` severity. Click to drill in.

### Dashboard (triage-first)

Sections in order, top to bottom:

1. **Header:** project name, client, contract context, single-line status summary
2. **Risk strip:** red/orange status flags from extraction. Dismissible only via override.
3. **Action items:** open list. Checkbox toggles `status` and writes back to source markdown.
4. **Capture box:** single-line input ("Capture: memory · action · decision · note") with auto-detected type
5. **Two-column band:** Stakeholders (left) · Recent decisions (right)
6. **Collapsible:** Project brief · Timeline · Linked memories · Open questions
7. **Chat panel drawer:** collapsed by default; click to expand; persistent session per project

### Capture box behavior

User types → submit → server shells `claude --print "/gsd-capture <input>" --add-context "project: <slug>"` → skill writes to the right file → file watcher invalidates extraction cache for that project → UI refetches and shows the new item.

Type detection happens inside the skill. UI just passes the raw input + project slug.

### Chat panel

- Collapsible drawer at the bottom of the dashboard
- One persistent session per project (resumed via `claude --resume <session-id>`)
- Initial system-prompt augment: project frontmatter + latest extraction JSON + linked memories
- Streams stdout to the client over WebSocket or SSE
- New session button if you want a fresh context

### Command Center

A top-level entry above the client buckets. Has its own dashboard:

- Four-Cs scoreboard (last `/audit` result)
- Weekly ritual status (last `/level-up`, last `/audit`, days since)
- Operator chat panel (persistent session, no project context — operator-level conversation)

Skills like `/level-up`, `/audit`, `/onboard` run from the Command Center chat.

## AI plumbing

### Extraction

- Triggered on boot for any project with stale cache, and on file change
- Uses `claude --print --model haiku-4.5` (cheap + fast) with an extraction prompt that takes one or more markdown files and returns the JSON shape above
- Cached to `.aios-cache/extraction/<project>.json` keyed by `mtime` of source files
- On parse failure, retry once with a stricter "JSON only" prompt; if still bad, keep the previous cache and surface a "stale extraction" banner

### Capture

- `claude --print "/gsd-capture <input>"` with project context as an `--add-context` arg or environment variable
- Synchronous; UI shows a spinner during the ~2-5s roundtrip
- Captured file path is returned in the skill's output and displayed as a confirmation toast

### Chat

- Per project, one Claude Code session: `claude --resume <session-id>` for continuation, `claude` for new
- Session IDs persisted in `.aios-cache/sessions.json`
- Initial message in a fresh session injects: project frontmatter + extraction JSON + a "you are inside the AIOS UI viewing project X" framing
- UI streams `stdout` line-by-line via SSE
- Default model is whatever Claude Code is configured for (Sonnet/Opus); user can override per-message via the chat input

## File watching

`chokidar` watcher with these globs:

- `~/repos/claude-os/{references,decisions,context}/**/*.md`
- `~/repos/claude-os/connections.md`
- `~/repos/claude-os/clients.yaml`
- `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/**/*.md`

On change:

1. Identify which project(s) the changed file belongs to (via frontmatter)
2. Invalidate that project's extraction cache
3. Push WebSocket message to the client: `{ kind: 'invalidate', project: 'inside-out-website' }`
4. Client refetches that project's data on receipt

## Error handling

- **Claude Code subprocess fails** (auth lapse, network, etc.): surface "Extraction stale, last cached <time>" banner in dashboard. Chat panel shows the actual error inline. No retry storm.
- **Frontmatter missing** on a file: file appears under "Unfiled" sidebar bucket. Click → modal with project picker → writes frontmatter back to the file.
- **Extraction returns invalid JSON**: log; retry once with stricter prompt; if still bad, fall back to last cached extraction and show "stale" banner.
- **File watcher misses a change**: include a manual "refresh project" button in the dashboard header.
- **Concurrent edits** (UI capture + terminal Claude editing same file): last-write-wins. The user is aware; `git status` makes any oddness obvious. No locking.
- **Skill not found** (e.g., user types `/gsd-capture` but it's not installed): subprocess returns an error; UI shows the raw error in the capture box's status line.

## Testing

- **Manual end-to-end** is the primary test: open a project, see real data, capture an item, see it appear, ask the chat a question, get an answer.
- **Unit tests** for: frontmatter parser, extraction-JSON validator, client/project registry loader.
- **Snapshot tests** for: dashboard renderer given a known extraction JSON.
- No test for subprocess streaming in v1 (manual verification only).

## v1 build milestones

1. **Day 1-2:** Project skeleton (Next.js + Tailwind + shadcn). Hardcoded `clients.yaml`. Sidebar renders three buckets with placeholder data. Static project page route.
2. **Day 3-4:** File reader + gray-matter parser. One-time normalization pass over existing files (script + spot-check). Sidebar shows real client/project tree.
3. **Day 5-6:** Extraction layer (Claude Code subprocess + file cache). Triage dashboard renders extracted data for one project end-to-end.
4. **Day 7:** Chat panel with persistent session per project. Streaming over SSE.
5. **Day 8:** Capture box → `/gsd-capture` integration. Confirmation toast.
6. **Day 9:** File watcher + WebSocket / SSE invalidation.
7. **Day 10:** Command Center surface (operator chat, ritual status placeholders).
8. **Day 11-12:** Polish — Unfiled bucket UX, error states, all projects loaded, manual refresh, override editor.

Realistic ship: ~2 weeks of focused evening/weekend work. Faster with full days.

## Open items deferred to implementation

- Exact extraction prompt wording (will iterate during Day 5-6)
- Override schema details (likely YAML mirroring extraction JSON shape)
- Whether the chat panel uses SSE or WebSocket (SSE is simpler; WebSocket future-proofs)
- Whether `clients.yaml` is hand-edited or has a UI editor (v1: hand-edited)
- One-time normalization pass: scripted with a human-in-the-loop confirmation per file vs fully automatic

## Risks

- **Subprocess management** is the highest-risk area. Claude Code session resume + streaming is doable but fiddly. If it gets stuck for more than ~half a day, fall back to one-shot `claude --print` per message (lose conversation continuity but ship sooner).
- **Extraction quality** on day one will be uneven. Plan for a few iterations on the prompt during Day 5-6, and lean on the override system to paper over remaining gaps.
- **Scope creep** is real — the feature list above is already ambitious. Resist adding mobile, auth, search, or integrations until v1 is in daily use.
