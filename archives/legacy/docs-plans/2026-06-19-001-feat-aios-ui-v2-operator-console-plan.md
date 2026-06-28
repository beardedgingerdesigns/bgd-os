---
title: "feat: AIOS UI v2 — Three-Panel Operator Console"
date: 2026-06-19
type: feat
depth: Standard
origin: decisions/log.md (2026-06-19 — AIOS UI v2: chat-native operator console)
---

## Summary

Redesign the aios-ui frontend as a three-panel operator console (toolbar / context / chat) while preserving the existing backend, data layer, cache system, Claude subprocess integration, and test suite. Adopt the BrandOS light-first design system (Ink Navy + Mint Signal + Space Grotesk/IBM Plex Sans) replacing the current dark theme. The backend API routes, lib/data, lib/cache, lib/skills, and file watcher infrastructure remain intact.

---

## Problem Frame

The current aios-ui has solid infrastructure (33 tests, 7 SSE surfaces, full data layer) but a layout that doesn't match how Justin uses the AIOS. The chat is a per-project drawer, not a persistent primary interface. Navigation is page-based (home / client / project) rather than view-based (dashboard / triage / projects / todos). The dark color scheme feels heavy compared to the clean BrandOS admin aesthetic Justin prefers.

---

## Requirements

- R1. Three-panel layout: toolbar (10%), context panel (50%), persistent chat (40%) — always visible regardless of context view
- R2. Toolbar-driven context views: Dashboard (default), Triage, Projects, Todos
- R3. Chat spawns `claude --print` pointed at `claude-os` with session persistence (`--resume`)
- R4. Dashboard view: MRR from `clients.yaml`, project state cards from `state/*.md`, triage count from `state/inbox-triage.md`, upcoming calendar
- R5. Triage view: ranked queue from `state/inbox-triage.md` with inline draft/approve email actions
- R6. Projects view: state cards from `state/*.md` with status and next step
- R7. Todos view: checklist from `todos/pending.md` with mark-done/dismiss quick actions
- R8. Quick actions (mark replied, check todo, dismiss) handled locally without Claude round-trip
- R9. Panel updates via file watchers (existing chokidar infrastructure) pushed via SSE
- R10. Light-first design system adapted from BrandOS: `#F6F8F9` bg, `#FFFFFF` surface, `#ff980b` accent (Justin's orange), Space Grotesk headings, IBM Plex Sans body
- R11. Localhost only, no authentication
- R12. Existing API routes, data layer, cache layer, skills layer, and tests preserved

---

## Key Technical Decisions

**KTD1. Frontend layout: CSS Grid three-panel shell, not page routing.**
The current app uses Next.js page routing (home → client → project). The new layout is a single-page shell with a CSS Grid (`grid-template-columns: 56px 1fr 1fr` or similar) where the toolbar drives which component renders in the context panel. The chat panel is always mounted. This eliminates page transitions and keeps chat persistent.
*Rationale:* Page-based routing loses chat state on navigation. A shell with panel switching preserves the chat session across view changes.

**KTD2. Chat panel: reuse existing `lib/skills/chat.ts` and API routes.**
The chat backend (`/api/chat/`) already handles `claude --print` spawning, `--resume` for multi-turn sessions, SSE streaming, and `extractTextDelta()`. The frontend chat components (`chat-drawer.tsx`, `chat-message.tsx`) need to be extracted from the drawer pattern and made persistent in the right panel.
*Rationale:* The subprocess integration is proven and tested. No need to rebuild.

**KTD3. Design system: BrandOS tokens adapted for the AIOS context.**
Adopt BrandOS's color ramp, typography, and radii as CSS custom properties in `globals.css`. Not a copy-paste — the AIOS may need additional tokens (e.g., chat bubble colors, toolbar active state) that BrandOS doesn't have. Keep the existing shadcn component primitives and re-theme them.
*Rationale:* Justin explicitly wants the BrandOS clean aesthetic. Shadcn components are already wired; re-theming is cheaper than replacing them.

**KTD4. Context views: React components switched by toolbar state, not routes.**
Each context view (Dashboard, Triage, Projects, Todos) is a component rendered conditionally based on toolbar selection. State is held in a simple `useState` or URL hash for bookmarkability. The existing data-fetching functions (`lib/data/`) and API routes feed these views.
*Rationale:* Simpler than route-based navigation, keeps chat panel mounted, and the data layer already provides everything these views need.

**KTD5. Toolbar: icon-only vertical strip with tooltips.**
At 10% width (~56-64px), there's no room for labels. Icons from lucide-react (already a dependency) with tooltips on hover. Active state uses the orange accent (`#ff980b`).
*Rationale:* Matches the Linear/Raycast energy from PRODUCT.md. Dense, operator-grade.

---

## Scope Boundaries

### In Scope
- Three-panel layout shell
- Four context views (Dashboard, Triage, Projects, Todos)
- Persistent chat panel with existing Claude integration
- Design system refresh (BrandOS light theme)
- Rewiring existing components into the new layout

### Deferred to Follow-Up Work
- Mobile/remote access (Tailscale tunnel)
- Client/project CRUD (existing dialogs can be re-added later)
- Per-project chat context (current chat is AIOS-level; project-scoped chat is future)
- Admin/rituals page (level-up, weekly-status, audit — can be added as toolbar items later)
- Calendar panel integration (API exists via MCP; rendering deferred)
- Capture box / wiki ingest UI (existing functionality, re-add when layout is stable)

---

## Implementation Units

### U1. App Shell — Three-Panel CSS Grid Layout

**Goal:** Replace the current page-based layout with a fixed three-panel grid shell that persists across all views.

**Requirements:** R1, R11

**Dependencies:** None

**Files:**
- `aios-ui/app/layout.tsx` — modify: replace current layout with grid shell
- `aios-ui/app/page.tsx` — modify: become the single-page shell with panel switching
- `aios-ui/app/globals.css` — modify: replace dark theme tokens with BrandOS light tokens, add grid layout styles
- `aios-ui/components/app-shell.tsx` — create: the three-panel grid container
- `aios-ui/components/toolbar.tsx` — create: vertical icon toolbar with view switching

**Approach:** Single `AppShell` component using CSS Grid with three columns. Toolbar is a fixed-width left column. Context panel and chat panel split the remaining space. `useState` or URL hash tracks the active view. Remove the existing `app/clients/` and `app/admin/` route directories (pages become components within the context panel instead). Keep `app/api/` routes untouched.

**Patterns to follow:** BrandOS `style.css` token naming (`--color-bg`, `--color-bg-surface`, etc.). Existing shadcn component structure for consistency.

**Test scenarios:**
- Shell renders three panels at correct proportions on a standard viewport
- Toolbar click switches the context panel content
- Chat panel remains mounted when switching context views
- Layout doesn't collapse below reasonable minimum widths

**Verification:** The three-panel shell renders with placeholder content in each panel. Toolbar switches context. Chat panel persists.

---

### U2. Design System Refresh — BrandOS Light Theme

**Goal:** Replace the dark theme with BrandOS's light-first design system.

**Requirements:** R10

**Dependencies:** U1

**Files:**
- `aios-ui/app/globals.css` — modify: full token replacement
- `aios-ui/app/layout.tsx` — modify: update font imports (Space Grotesk, IBM Plex Sans)
- `aios-ui/DESIGN.md` — modify: update to reflect new token set
- `aios-ui/components/ui/*.tsx` — audit: verify shadcn primitives render correctly with new tokens

**Approach:** Map BrandOS tokens to shadcn's expected CSS custom property names. BrandOS uses `--color-*`; shadcn expects `--background`, `--foreground`, `--card`, `--accent`, etc. Create the mapping in `globals.css`:

| BrandOS token | shadcn variable | Value |
|---|---|---|
| `--color-bg` | `--background` | `#F6F8F9` |
| `--color-bg-surface` | `--card` | `#FFFFFF` |
| `--color-text` | `--foreground` | `#222E40` |
| `--color-text-muted` | `--muted-foreground` | `#5E6B76` |
| `--color-accent` | `--accent` / `--primary` | `#ff980b` |
| `--color-border` | `--border` | `#DEE4E8` |
| `--color-ink` | `--card-foreground` | `#111A2E` |

Typography: Space Grotesk for headings (`--font-head`), IBM Plex Sans for body (`--font-sans`). Import via Google Fonts in `layout.tsx`.

**Patterns to follow:** BrandOS `style.css` structure exactly. Existing shadcn theming pattern in `globals.css`.

**Test scenarios:**
- All shadcn primitives (Button, Card, Badge, Dialog, Separator) render with correct colors
- No dark-theme artifacts remain (no white-on-white or invisible text)
- Typography loads correctly (Space Grotesk headings, IBM Plex Sans body)

**Verification:** Visual inspection of all rendered components against BrandOS admin aesthetic. No color regressions.

---

### U3. Dashboard Context View

**Goal:** The default landing view showing MRR, project state cards, triage count, and upcoming items.

**Requirements:** R4, R9

**Dependencies:** U1

**Files:**
- `aios-ui/components/views/dashboard-view.tsx` — create
- `aios-ui/components/stat-tile.tsx` — modify: restyle for light theme
- `aios-ui/components/project-card.tsx` — create: compact state card (status + next step)

**Approach:** Compose from existing data sources. `lib/data/mrr.ts` already computes MRR. `lib/data/clients.ts` loads project data. State files are read by existing data functions. Triage count comes from `state/inbox-triage.md` frontmatter (`threads_needing_reply`). Calendar integration deferred — show a placeholder or omit. Layout: stat tiles at top (MRR, active projects count, triage count, pending todos), project state cards below in a grid.

**Patterns to follow:** Existing `stat-tile.tsx` component. BrandOS card styling (14px radius, subtle shadow).

**Test scenarios:**
- MRR displays correctly from `clients.yaml` fixture
- Project cards render with status and next step from state files
- Triage count reflects `state/inbox-triage.md` content
- Stale state files (Updated >7 days) are visually flagged
- Empty state renders cleanly when no state files exist

**Verification:** Dashboard shows real data from the AIOS filesystem. Numbers match what `/brief` would report.

---

### U4. Triage Context View

**Goal:** Display the ranked inbox triage queue with inline actions.

**Requirements:** R5, R8, R9

**Dependencies:** U1

**Files:**
- `aios-ui/components/views/triage-view.tsx` — create
- `aios-ui/components/triage-row-actions.tsx` — modify: restyle, keep action logic
- `aios-ui/components/triage-output.tsx` — modify: adapt for panel layout instead of modal

**Approach:** Read `state/inbox-triage.md` (parse frontmatter + markdown body). Render "Reply today" and "Reply this week" sections as a list with sender, subject, days waiting, score, and project context. Each row has quick action buttons: Mark Replied, Snooze, Dismiss (existing `/api/triage/override/` route handles these). "Draft reply" button sends the thread context to the chat panel with a prompt to draft a reply — this goes through Claude, not a local action.

**Patterns to follow:** Existing `triage-row-actions.tsx` action logic. Existing `triage-overrides.ts` cache layer.

**Test scenarios:**
- Triage queue renders from `state/inbox-triage.md` fixture
- "Reply today" items appear above "Reply this week"
- Mark Replied action writes to `triage-overrides.json` and removes the row
- Snooze action with date writes override and removes the row
- Dismiss action writes override and removes the row
- "Draft reply" sends context to the chat panel
- Empty triage state shows "Inbox is clean" message
- Stale triage (last_run >14h) shows warning

**Verification:** Triage view renders the latest triage results. Quick actions persist to the override file. Draft reply activates the chat.

---

### U5. Projects Context View

**Goal:** Display all active project state cards.

**Requirements:** R6, R9

**Dependencies:** U1

**Files:**
- `aios-ui/components/views/projects-view.tsx` — create
- `aios-ui/components/project-card.tsx` — reuse from U3 (full version with next steps and blockers)

**Approach:** Read all `state/*.md` files. Parse frontmatter (Updated, Status) and extract Current Status and Next Steps sections. Render as cards sorted by status (blocked first, then in-progress, then on-track). Flag stale cards (Updated >7 days). Clicking a card could expand inline or send a "tell me about {project}" message to chat — keep it simple.

**Patterns to follow:** Existing `lib/data/clients.ts` for project data. State file format from `state/*.md`.

**Test scenarios:**
- All state files render as cards
- Cards show status, last updated, current status summary, and next step
- Stale cards are visually differentiated
- Cards sort by status priority (blocked → in-progress → on-track)
- Missing state files don't crash the view

**Verification:** Projects view shows all active projects with current state pulled from the filesystem.

---

### U6. Todos Context View

**Goal:** Display the pending todo list with completion actions.

**Requirements:** R7, R8

**Dependencies:** U1

**Files:**
- `aios-ui/components/views/todos-view.tsx` — create
- `aios-ui/components/todo-list.tsx` — modify: restyle for panel layout

**Approach:** Read `todos/pending.md`, parse the checkbox items with their metadata (Added, Source, Client, Priority, Notes). Render as a checklist grouped by priority (high → medium → low). "Done" button writes `[x]` to the file and moves the item to `completed.md` (existing `/api/todos/` route). Filter/sort controls: by priority, by client, by source.

**Patterns to follow:** Existing `todo-list.tsx` component and `lib/cache/todos.ts` cache layer.

**Test scenarios:**
- Todos render from `todos/pending.md` fixture
- Items grouped by priority
- "Done" action marks item complete and removes from list
- "Dismiss" action removes without completing
- Empty state renders cleanly
- Items with client slug show project context badge

**Verification:** Todos view shows all pending items. Actions persist to the filesystem.

---

### U7. Persistent Chat Panel

**Goal:** Mount the chat interface as a persistent right panel with full Claude session management.

**Requirements:** R3, R1

**Dependencies:** U1, U2

**Files:**
- `aios-ui/components/chat-panel.tsx` — create: persistent chat (evolved from `chat-drawer.tsx`)
- `aios-ui/components/chat-message.tsx` — modify: restyle for light theme and panel width
- `aios-ui/components/chat-input.tsx` — create: message input with send button

**Approach:** Extract the chat logic from `chat-drawer.tsx` (which is a slide-out drawer on project pages) into a permanent panel component. The chat always targets `claude-os` (not a specific project). On mount, call `/api/chat/[client]/[project]/load` with a default AIOS context (or create a new `/api/chat/aios/` route that skips the client/project scoping). Session persists via `--resume`. Chat input at the bottom, messages scrolling above. Support for streaming responses (existing SSE consumer in `use-sse.ts`).

Context views can inject prompts into the chat — e.g., triage "Draft reply" button sends a pre-filled message. This is a simple callback from context view to chat panel, not a complex integration.

**Patterns to follow:** Existing `chat-drawer.tsx` for the SSE consumption pattern. Existing `lib/skills/chat.ts` for subprocess management.

**Test scenarios:**
- Chat panel renders and accepts input
- Sending a message streams a response from Claude
- Chat session persists across context view switches
- Context view can inject a prompt into the chat input
- Chat displays streaming text incrementally (not all-at-once)
- Session resume works after a brief tab close/reopen

**Verification:** Type a message, get a streamed response from Claude running against `claude-os` with full skill access.

---

### U8. File Watcher Integration for Panel Updates

**Goal:** Wire the existing file watcher to push updates to context panels in real-time.

**Requirements:** R9

**Dependencies:** U3, U4, U5, U6

**Files:**
- `aios-ui/lib/watcher.ts` — modify: add watch paths for `state/inbox-triage.md` and `state/*.md`
- `aios-ui/lib/invalidation-bus.ts` — modify: add event types for triage and state changes
- `aios-ui/components/sse-listener.tsx` — modify: handle new event types to trigger panel re-renders

**Approach:** The existing watcher already monitors `clients.yaml`, `decisions/`, and `docs_paths`. Add `state/` and `todos/pending.md` to the watch list. When a file changes, the invalidation bus publishes an event. The SSE listener in the frontend calls `router.refresh()` (existing pattern) to re-fetch server components, which re-read the updated files.

**Patterns to follow:** Existing `watcher.ts` and `invalidation-bus.ts` patterns exactly.

**Test scenarios:**
- Modifying `state/inbox-triage.md` triggers a triage panel refresh
- Modifying `state/*.md` triggers a projects panel refresh
- Modifying `todos/pending.md` triggers a todos panel refresh
- Modifying `clients.yaml` triggers a dashboard MRR refresh
- Watcher doesn't crash on rapid successive file changes

**Verification:** Run `/daily-inbox-triage` in the chat, watch the triage panel update automatically when the triage file is written.

---

## Open Questions

- **Chat API route scoping:** The existing chat routes are scoped to `/api/chat/[client]/[project]/`. The AIOS chat doesn't have a client/project context. Options: (a) create a dedicated `/api/chat/aios/` route, (b) use a sentinel like `_aios`/`_aios` as client/project params, (c) make client/project optional. Resolve at implementation time — (b) is simplest.
- **State file parsing:** `state/*.md` files have a loose format (markdown with some conventions). The parser needs to extract Status, Updated date, Current Status, and Next Steps reliably. Settle the exact parsing logic during implementation.

---

## Risks & Dependencies

- **Next.js 16 + React 19 SSR with persistent client state:** The chat panel must remain mounted across server component re-renders triggered by file watcher invalidation. This requires careful client/server component boundaries — the chat panel must be a client component that doesn't re-mount when the context panel's server component re-renders.
- **Font loading:** Space Grotesk and IBM Plex Sans are Google Fonts. If Justin is offline, they won't load. Consider bundling via `next/font/google` (built-in, already the Next.js pattern).

---

## Sources & Research

- BrandOS design system: `brandos/client/src/style.css` — full token set
- AIOS UI existing infrastructure: `aios-ui/lib/`, `aios-ui/app/api/`, 33 test files
- Decision log: `decisions/log.md` entry 2026-06-19
- PRODUCT.md: strategic principles (density over decoration, chat is first-class, filesystem is truth)
- DESIGN.md: existing component inventory and known gaps
