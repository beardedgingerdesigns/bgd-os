# Phase 8: Scheduled Triage Automation - Pattern Map

**Mapped:** 2026-06-08
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` | skill (scheduled) | event-driven, request-response | `.claude/skills/daily-inbox-triage/SKILL.md` | exact — same skill type, same MCP tools, upgraded output contract |
| `aios-ui/lib/types.ts` (edit) | model | transform | `aios-ui/lib/types.ts` (existing `RawDropKind` union) | exact — one-line union extension |
| `aios-ui/lib/cache/triage.ts` (edit) | utility | file-I/O | `aios-ui/lib/cache/triage.ts` (existing) | exact — same cache read/write helpers |
| `aios-ui/.aios-cache/triage-latest.json` | config/cache | file-I/O | `aios-ui/.aios-cache/triage-latest.json` (existing) | exact — same `TriageCacheEntry` shape |
| `todos/pending.md` (append) | store | file-I/O | `todos/pending.md` (existing Phase 6 output) | exact — append to existing format |
| `{wiki}/raw/aios/triage-dispatch-*.md` (new files per run) | data | event-driven | `{wiki}/raw/aios/capture-*.md`, `chat-decision-*.md` (existing drops) | exact — same ADR 0004 naming/frontmatter convention |

---

## Pattern Assignments

### `~/.claude/scheduled-tasks/scheduled-triage/SKILL.md` (skill, event-driven)

**Analog:** `.claude/skills/daily-inbox-triage/SKILL.md`

**SKILL.md frontmatter pattern** (lines 1-8 of analog):
```yaml
---
name: daily-inbox-triage
description: Use each morning, or when Justin asks "what do I owe replies on"...
bike-method-phase: 1
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---
```
New skill frontmatter: use `name: scheduled-triage`, update `description` to reflect scheduled/automated trigger. Keep `three-ms-attribution`. Drop `bike-method-phase` (scheduled tasks don't phase manually).

**Override file read pattern** (analog lines 46-59 — Step 2.0):
```markdown
### Step 2.0 — Read the override file BEFORE evaluating any thread.

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-overrides.json`.
If the file does not exist, treat as `{}`.

Shape: keyed by Gmail thread ID; each value has `status`
(one of `replied | snoozed | not_me | dismissed`) and optionally `snooze_until`.

- If `overrides[threadId].status === 'replied'` → SKIP.
- If `overrides[threadId].status === 'not_me'` → SKIP.
- If `overrides[threadId].status === 'dismissed'` → SKIP.
- If `overrides[threadId].status === 'snoozed'` AND Date.parse(snooze_until) > Date.now() → SKIP.
```
This is Step 2.0 in the analog. The scheduled skill MUST keep this step verbatim — it is the operator's final override word and always wins.

**Thread filter heuristic** (analog lines 68-77 — Step 2.2):
```markdown
A thread qualifies if ALL are true:
- Last message is inbound (sender ≠ `justin@beardedgingerdesigns.com`).
- Last message is >18 hours old.
- Sender domain not in bot/no-reply exclude list.
- Thread not labeled Archived or Done.
- Override file does not skip this thread.
- Thread-participant check (Step 2.1) does not downgrade.
```
Copy this filter block verbatim. The scheduled skill uses the same filter; no changes needed here.

**Scoring table pattern** (analog lines 81-98 — Step 3):
```markdown
Score = sum of:
| Signal | Points |
|---|---|
| Sender is active client | +5 |
| Sender is paying recurring client | +3 |
| Days waiting ≥ 3 business days | +3 |
| Days waiting ≥ 5 business days | +2 |
| Deadline within 14 days | +4 |
| Sender on hard-clock decision | +3 |
| New lead / first-time contact | +2 |
| Relates to Q2 priority | +2 |

Tiers: Reply today (≥8), Reply this week (4-7), FYI (1-3), Archive (0)
```
Copy verbatim. The scheduled skill uses identical scoring — the automation changes trigger and output, not ranking logic.

**clients.yaml contact matching pattern** (analog lines 102-105 — Step 4):
```markdown
Identify the related project by matching the sender's email address against
`clients.yaml` `contacts:` lists (full address first, then `@domain.com` patterns).
The match produces a `project_slug`.
```
This contact-to-project matching pattern is reused in Step 4 (project context) AND in the new dispatch routing (TRIAGE-04). Both use the same `clients.yaml` lookup.

**NEW STEP: Dynamic lookback window** (insert as Step 0, before Step 1):
```markdown
### Step 0 — Compute lookback window

Read `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json`.

If file missing or `exitCode !== 0`:
  → lookback = "14d"   (first run or last run failed)
Else compute elapsed_hours = (now - ranAt) / 3600000:
  If elapsed_hours > 48:
    → lookback = "3d"  (weekend/holiday gap)
  Else if elapsed_hours > 12:
    → lookback = "14h" (overnight gap)
  Else:
    → lookback = str(ceil(elapsed_hours) + 1) + "h"  (mid-day buffer)

Use lookback in Gmail search: `in:inbox -in:draft newer_than:{lookback} ...`
```

**NEW STEP: Unconditional draft creation** (replaces analog Step 6):
```markdown
### Step 6 — Create Gmail drafts for all reply-needed threads

For each thread in "Reply today" and "Reply this week" tiers, create an actual
Gmail draft via `mcp__claude_ai_Gmail__create_draft`. Do NOT ask for confirmation.

Draft content: use `references/voice.md` register (short sentences, casual
greeting, no em dashes, plain-language status). Attach project context from
Step 4. Thread_id links the draft to the correct conversation.
```
Critical difference from analog: analog Step 6 says "ask first, never auto-create." Scheduled skill removes this gate and always creates drafts. This is the key behavioral split between the two skills.

**NEW STEP: Action item extraction with dedup** (insert after Step 6):
```markdown
### Step 7 — Extract action items to todos/pending.md

For each "Reply today" and "Reply this week" thread that contains an explicit
commitment or concrete request:

1. Read `/Users/justinlobaito/repos/claude-os/todos/pending.md`.
2. Scan `## Pending` section for items where Client: slug matches AND summary
   overlaps AND Added: date is within the last 7 days. If match found → SKIP.
3. If no recent duplicate, append:

```
- [ ] **{Bold action summary}** `#{category}`
  - Added: YYYY-MM-DD
  - Source: triage
  - Client: {client-slug} / {project-slug}
  - Priority: high | medium | low
  - Notes: Re: {email subject} from {sender name}
```

Priority heuristics: deadline mentions = high, routine requests = medium,
soft suggestions = low.
```

**NEW STEP: Wiki dispatch** (insert after Step 7):
```markdown
### Step 8 — Dispatch project-relevant threads to wiki raw/aios/

For each thread where clients.yaml contact matching resolved a project_slug
AND the thread contains project-relevant intelligence (not just a routine
status ping):

Write one file per thread per matched project. Filename:
  `triage-dispatch-YYYY-MM-DD-{slugified-subject}.md`

YAML frontmatter:
```yaml
---
kind: triage-dispatch
thread_id: {Gmail thread ID}
sender: {sender email}
sender_name: {sender display name}
date: YYYY-MM-DD
subject: {email subject}
matched_contacts:
  - {email that triggered the match}
matched_projects:
  - {project-slug}
urgency: high | medium | low
score: {numeric triage score}
---
```

Body: 3-5 sentence summary of project-relevant content. Not raw email text.
Cover: what was asked/told, any action required, relevant dates mentioned.

Multi-project threads: dispatch to ALL matched wikis. One file per thread per wiki.
```

**NEW STEP: Cache write + push notification** (final step):
```markdown
### Step 9 — Write cache and send notification

Write `/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json`:
```json
{
  "ranAt": "{ISO timestamp}",
  "output": "{full markdown output}",
  "exitCode": 0,
  "durationMs": {elapsed ms}
}
```

Send PushNotification:
  title: "Inbox Triage — {N} threads need reply"
  body: "Highest priority: {top subject} ({client name}, {days}d)"

If 0 threads qualify: "Inbox clear as of {time}."
```

**Critical implementation rules to carry forward** (analog lines 214-223):
```markdown
1. Never send. No matter how clear the reply seems.
2. Don't fabricate "days waiting." Use actual date field from last inbound message.
3. Don't surface 2RM threads as actionable. *@2rm.com / *@tworivers.com under FYI only.
4. If zero threads qualify, say so — "Inbox is clean as of {time}."
5. Never conflate two contacts by first name alone.
6. Render actual sender name from email header; don't substitute from memory.
```

---

### `aios-ui/lib/types.ts` — `RawDropKind` extension (model, transform)

**Analog:** `aios-ui/lib/types.ts` lines 242-243 (current `RawDropKind` union)

**Current pattern** (line 242):
```typescript
export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session'
```

**Change required** (add one member):
```typescript
export type RawDropKind = 'capture' | 'chat-decision' | 'chat-session' | 'triage-dispatch'
```

**Also update `PendingFile.kind`** (line 81 — `PendingFile` interface):
```typescript
kind: 'capture' | 'chat-decision' | 'chat-session' | 'other'
```
This field is not `RawDropKind` — it uses `'other'` as a catch-all. The `detectKind()` function in `wiki.ts` (line 266) already handles unknown prefixes by returning `'other'`. A `triage-dispatch-*.md` file will therefore show as `'other'` in the pending ingest UI unless `detectKind` is updated too. The planner should decide whether to extend `detectKind` in `wiki.ts` to recognize `triage-dispatch-` prefix and return a named kind, or accept `'other'` for now.

---

### `aios-ui/lib/cache/triage.ts` — cache path re-export (utility, file-I/O)

**Analog:** `aios-ui/lib/cache/triage.ts` (full file — 26 lines)

**Existing pattern** (lines 1-26, full file):
```typescript
import fs from 'fs/promises'
import path from 'path'
import type { TriageCacheEntry } from '@/lib/types'

function cacheDir(): string {
  return process.env.AIOS_CACHE_DIR ?? path.join(process.cwd(), '.aios-cache')
}

export function triageCachePath(): string {
  return path.join(cacheDir(), 'triage-latest.json')
}

export async function readTriageCache(): Promise<TriageCacheEntry | null> {
  try {
    const raw = await fs.readFile(triageCachePath(), 'utf-8')
    return JSON.parse(raw) as TriageCacheEntry
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function writeTriageCache(entry: TriageCacheEntry): Promise<void> {
  await fs.mkdir(cacheDir(), { recursive: true })
  await fs.writeFile(triageCachePath(), JSON.stringify(entry, null, 2), 'utf-8')
}
```

**Required change:** The scheduled task does NOT go through the Next.js API route, so `writeTriageCache` is never called by the route handler. The skill writes `triage-latest.json` directly using the Write tool. The cache file path is deterministic:
```
/Users/justinlobaito/repos/claude-os/aios-ui/.aios-cache/triage-latest.json
```

No code change is strictly required for the cache module to work — the existing `readTriageCache` and `writeTriageCache` are correct and the API route (`/api/triage/latest`) still works. The only change needed is if the RESEARCH.md recommendation to "re-export `triageCachePath()` for skill access" is implemented — in that case it is already exported (line 9), so no change is needed.

---

### `aios-ui/.aios-cache/triage-latest.json` (cache file, file-I/O)

**Analog:** `TriageCacheEntry` interface in `aios-ui/lib/types.ts` lines 115-120

**Shape pattern** (lines 115-120):
```typescript
export interface TriageCacheEntry {
  ranAt: string      // ISO timestamp the skill ran
  output: string     // raw Markdown produced by /daily-inbox-triage
  exitCode: number   // 0 if subprocess succeeded
  durationMs: number // wall-clock runtime
}
```

The scheduled skill writes this file directly with the Write tool. Use the same shape exactly. `writeTriageCache()` in `lib/cache/triage.ts` writes `JSON.stringify(entry, null, 2)` — the skill should produce the same 2-space-indented JSON for UI compatibility.

---

### `todos/pending.md` — append target (store, file-I/O)

**Analog:** `todos/pending.md` lines 1-40 (full existing file)

**Format rules pattern** (lines 1-18):
```markdown
## Format rules

- Each item starts with `[ ]` or `[x]`
- Bold summary on the first line, optional `#hashtag` category tag
- Indented metadata lines:
  - **Added:** YYYY-MM-DD
  - **Source:** one of `manual`, `triage`, `onboard`, `skill:<name>`
  - **Client:** client-slug / project-slug compound form
  - **Priority:** one of `high`, `medium`, `low`
  - **Notes:** optional one-line context
- New items appended at bottom of `## Pending` section
```

**Existing item pattern** (lines 22-27 — first pending item):
```markdown
- [ ] **Revisit STATE.md output format and content quality** `#ops`
  - Added: 2026-06-04
  - Source: manual
  - Priority: medium
  - Notes: Phase 5 UAT passed (concept proven). Review the actual generated STATE.md output...
```

**Triage-sourced item pattern** (new items from Phase 8 must follow this exact shape):
```markdown
- [ ] **{Bold action summary}** `#{category}`
  - Added: YYYY-MM-DD
  - Source: triage
  - Client: {client-slug} / {project-slug}
  - Priority: high | medium | low
  - Notes: Re: {email subject} from {sender name}
```

Key difference from existing items: triage items always have `Source: triage` and always have a `Client:` line (never omit it for triage-sourced items). The `Notes:` line anchors the item to the originating email thread.

---

### `{wiki}/raw/aios/triage-dispatch-*.md` (data drop, event-driven)

**Analog:** `aios-ui/lib/raw-drops.ts` `writeRawDrop` function (lines 96-134) + ADR 0004

**File naming pattern** (from `buildRawDropPath` lines 63-78):
```typescript
const dateStr = date.toISOString().slice(0, 10)          // YYYY-MM-DD
const rawAiosDir = path.join(args.wikiPath, 'raw', 'aios')
const target = path.join(
  rawAiosDir,
  `${args.kind}-${dateStr}-${args.slug}.md`,             // kind-YYYY-MM-DD-slug.md
)
```
New files follow `triage-dispatch-YYYY-MM-DD-{slugified-subject}.md`. The `slugify()` function (lines 21-31) lowercases and hyphenates non-alphanumeric runs, caps at 60 chars.

**slugify pattern** (lines 21-31):
```typescript
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LEN)
    .replace(/-+$/g, '')
  return slug.length > 0 ? slug : 'untitled'
}
```
The skill uses this same slug logic when constructing dispatch filenames. Email subjects with special characters (quotes, colons, slashes) all normalize to `[a-z0-9-]`.

**YAML frontmatter pattern** (from RESEARCH.md Pattern 3 — consistent with ADR 0004 structure):
```yaml
---
kind: triage-dispatch
thread_id: {Gmail thread ID}
sender: {sender email}
sender_name: {sender display name}
date: YYYY-MM-DD
subject: {email subject}
matched_contacts:
  - {email addresses that triggered the match}
matched_projects:
  - {project slugs}
urgency: high | medium | low
score: {numeric triage score}
---
```

**Body pattern** (3-5 sentence project-relevant summary, not raw email):
```markdown
{Sender} asked/told/requested {what}. {Relevant context from thread}.
{Action required if any}. {Deadline or date mentioned}.
{Any other project-relevant detail}.
```

**assertInside security guard pattern** (lines 47-53 — already enforced by writeRawDrop):
```typescript
function assertInside(root: string, target: string): void {
  const absRoot = path.resolve(root)
  const absTarget = path.resolve(target)
  if (absTarget !== absRoot && !absTarget.startsWith(absRoot + path.sep)) {
    throw new Error(`raw-drop path escaped root: target=${absTarget} root=${absRoot}`)
  }
}
```
The skill writes via the Write tool (not `writeRawDrop` directly since it runs as a Claude Code session, not Node.js). The skill must construct the correct path manually and not bypass the naming convention.

---

## Shared Patterns

### Gmail Thread Filtering
**Source:** `.claude/skills/daily-inbox-triage/SKILL.md` lines 36-77 (Steps 1, 2.0, 2.1, 2.2)
**Apply to:** `scheduled-triage/SKILL.md` Steps 1-2 (copy verbatim)
```markdown
in:inbox -in:draft newer_than:{lookback} -from:noreply -from:no-reply
-from:notifications -from:hellobonsai.com -from:drive-shares-dm-noreply
pageSize: 50
```
Override-file read (2.0) and thread-participant check (2.1) copy verbatim. These are load-bearing correctness guards.

### clients.yaml Contact-to-Project Matching
**Source:** `.claude/skills/daily-inbox-triage/SKILL.md` lines 102-124 (Step 4) + `aios-ui/lib/data/clients.ts` lines 30-37
**Apply to:** `scheduled-triage/SKILL.md` Step 4 (project context) AND Step 8 (dispatch routing)
```markdown
Match sender email against clients.yaml `contacts:` lists.
Full address match first, then @domain.com pattern match.
Produces project_slug. Never conflate by first name alone.
```
Both the project-context fetch (Step 4) and the dispatch routing (Step 8) use this same lookup. The skill should deduplicate: run matching once and reuse the resolved `project_slug` in both steps.

### RawDropKind Immutability Contract
**Source:** `aios-ui/lib/raw-drops.ts` + `docs/adr/0004-staged-ingestion-via-raw-aios.md`
**Apply to:** All dispatch file writes in `scheduled-triage/SKILL.md` Step 8
```
Files in raw/aios/ are immutable once written.
One file per thread per matched wiki (D-08).
Never batch multiple threads into one file.
Never write into wiki/decisions/, wiki/sources/, or wiki/log.md.
```

### Voice Register for Draft Replies
**Source:** `references/voice.md` lines 6-38
**Apply to:** `scheduled-triage/SKILL.md` Step 6 (Gmail draft creation)
```
- Short sentences, often one clause.
- Casual greeting: "Hey {Name},"
- No em dashes. Hyphens or full stops only.
- Plain-language status. No project-management speak.
- Contractions welcome. Loose lowercase OK.
- Link to work-in-progress as proof; no over-explaining.
```

### TriageCacheEntry Shape
**Source:** `aios-ui/lib/types.ts` lines 115-120, `aios-ui/lib/cache/triage.ts` lines 1-26
**Apply to:** `scheduled-triage/SKILL.md` Step 9 (cache write)
```typescript
{ ranAt: string, output: string, exitCode: number, durationMs: number }
```
Scheduled skill writes this shape directly via Write tool to `aios-ui/.aios-cache/triage-latest.json`. The `ranAt` field is what Step 0 of the NEXT run reads to compute lookback.

---

## No Analog Found

All files in Phase 8 have strong analogs. No new structural patterns are introduced — this phase is an orchestration of existing primitives.

| File | Note |
|------|------|
| Desktop scheduled task definition format | No existing `~/.claude/scheduled-tasks/` directory — first scheduled task in the project. Planner should follow RESEARCH.md Pattern 1 (cron expression `0 */2 7-19 * 1-5`). No codebase analog exists; create from docs. |

---

## Metadata

**Analog search scope:** `.claude/skills/`, `aios-ui/lib/`, `aios-ui/app/api/triage/`, `todos/`, `docs/adr/`, `references/`
**Files scanned:** 14
**Pattern extraction date:** 2026-06-08
