---
name: gemini-sweep
description: Collect new Gemini meeting notes and transcripts from Drive and stage them to archives/raw/ for /dispatch to route. Called by /scheduled-triage or manually via /gemini-sweep. Use when Justin says "ingest the Gemini notes", "check for meeting transcripts", "sweep Gemini", or after any meeting.
bike-method-phase: 1
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

**Collector only.** Sweeps the Gemini Drive folder for new meeting notes and transcripts, classifies them, infers the project from participants, and stages them to `archives/raw/` with rich frontmatter. Does NOT route to project wikis or update state — that's `/dispatch`'s job.

Callable standalone (`/gemini-sweep`) or as a step inside `/scheduled-triage` (Step 8.7).

## Constants

- **Gemini Drive folder:** `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu`
- **Project registry:** `/Users/justinlobaito/repos/claude-os/clients.yaml`
- **Staging destination:** `/Users/justinlobaito/repos/claude-os/archives/raw/`

## Execution

### Step 1 -- List today's files

Call `mcp__claude_ai_Google_Drive__search_files` with query: `parentId = '1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu' and modifiedTime >= '{today}T00:00:00Z'` (substitute today's date as YYYY-MM-DD).

If zero files, report "Gemini sweep: no new files today" and exit.

### Step 2 -- Read and classify

For each new file, call `mcp__claude_ai_Google_Drive__read_file_content` to get its content.

Classify as **notes** or **transcript**:

| Signal | Classification |
|--------|---------------|
| Title contains "Meeting notes" or "Notes" | notes |
| Title contains "Transcript" | transcript |
| Content has speaker labels with timestamps (e.g., "Justin Lobaito 0:03:42") | transcript |
| Content has summary bullets, action items, key points | notes |
| Ambiguous | notes (safer default -- notes are higher-signal) |

### Step 3 -- Pair notes + transcript

Group files by meeting. Match on:
1. Same date in title
2. Overlapping meeting title or subject
3. Overlapping participants

A meeting may produce one file (notes only, transcript only) or two (both). Unpaired files are processed individually.

### Step 4 -- Infer project

Extract participant names and email addresses from each file's content. Gemini typically lists attendees at the top or references them throughout.

Match participants against `clients.yaml` `contacts:` lists:
1. **Exact email match** -- highest confidence
2. **@domain.com pattern match** -- second pass
3. **Name match** against contact names in the registry -- lowest confidence, use only to break ties

The project with the most participant matches wins. On tie, tag **all** matched project slugs in the frontmatter.

**Exclude Justin's own addresses** (`justin@beardedgingerdesigns.com`, `justinl@2rm.com`) from matching -- they appear in every meeting.

**No match:** Still stage to `archives/raw/` with `matched_projects: []`. `/dispatch` will handle unmatched files.

### Step 5 -- Stage to archives/raw/

Write each file to `archives/raw/` with frontmatter that gives `/dispatch` everything it needs to route.

**File path:**
```
archives/raw/gemini-{YYYY-MM-DD}-{slug}-{notes|transcript}.md
```

Slug: lowercase the meeting title, replace non-alphanumeric runs with hyphens, strip leading/trailing hyphens, cap at 60 chars.

**Idempotency:** If the file already exists at this path, skip.

**File content:**

```yaml
---
kind: gemini-sweep
source_file_id: {Drive file ID}
source_title: "{original Drive file title}"
type: notes | transcript
date: YYYY-MM-DD
participants:
  - {name or email}
matched_projects:
  - {project slug}
dispatch_to:
  - target: project-wiki
    path_hint: raw/gemini/
  - target: aios-wiki
    path_hint: raw/research/
swept_at: {ISO timestamp}
---

{full file content from Drive}
```

The `dispatch_to` field tells `/dispatch` where to route: full content to the project wiki's `raw/gemini/`, and the file also stages to the AIOS wiki's `raw/research/` so AIOS gets the business-level context.

### Step 6 -- Report

**Output summary** (printed to chat, also returned for scheduled-triage's notification):

```
Gemini sweep: {N} new files collected
  - {M} matched ({list of project slugs})
  - {K} unmatched
  - Staged to archives/raw/ for /dispatch
  - Files: {list of file titles}
```

If called from scheduled-triage, this summary is included in the Step 9 push notification.

## Critical rules

1. **Collector only.** Stage to `archives/raw/`. Never write to project wikis or AIOS wiki directly. `/dispatch` handles routing.
2. **Never delete or move the Drive originals.** Read-only on Drive.
3. **Idempotent.** Safe to run multiple times -- file-exists check at staging prevents duplication.
4. **Fail gracefully.** If Drive MCP is unavailable or a file can't be read, log the error and continue with remaining files. Never crash the parent triage run.
5. **Exclude 2RM meetings.** If all participants are `@2rm.com` / `@tworivers.com` with no BGD contacts, skip the file entirely.
6. **Rich frontmatter.** The frontmatter is the handoff contract to `/dispatch`. Include everything dispatch needs so it never has to re-infer the project.

> *Adapted from The Three Ms of AI™. (C) 2026 Nate Herk. All rights reserved.*
