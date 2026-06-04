---
name: ingest-aios-drops
description: Batch-promotes pending raw/aios/*.md drops into the curated wiki. Compares each drop's mtime against the most recent ingest header in log.md, then runs the llm-wiki ingest flow for each pending file. Emits a structured summary on completion.
version: 1.0.0
args:
  - name: wikiPath
    description: Absolute path to the wiki root directory (the directory containing WIKI-CLAUDE.md, decisions/, log.md, and raw/aios/)
    required: true
---

# /ingest-aios-drops

Batch-promotes pending `raw/aios/*.md` drops into the curated wiki.

## Usage

```
/ingest-aios-drops /absolute/path/to/wiki
```

## Argument

- `$1` — absolute wiki root path (required)

## Workflow

### Step 1: Resolve pending drops

1. Set `wikiPath` = `$1` (the argument passed to this skill).
2. List all `*.md` files in `{wikiPath}/raw/aios/`.
3. Read `{wikiPath}/log.md` and find the most recent `## [YYYY-MM-DD] ingest` H2 header.
   - The header regex is: `^##\s+\[?(\d{4}-\d{2}-\d{2})\]?\s*[-—–|]?\s*ingest\b` (case-insensitive).
   - Parse the date, store as `lastIngestDate`.
   - If no such header exists, `lastIngestDate` is null and ALL raw/aios/*.md files are pending.
4. A file is **pending** if its mtime is newer than `{lastIngestDate}T23:59:59Z`, OR if `lastIngestDate` is null.

### Step 2: Bootstrap wiki structure if needed

Before processing any pending files, ensure the wiki has the required structure:
- If `{wikiPath}/decisions/` does not exist, create it with `active/` and `deferred/` subdirectories.
- If `{wikiPath}/log.md` does not exist, create it with a minimal header:
  ```markdown
  # Wiki Log
  
  Append-only log of wiki updates. Each entry is a `## [YYYY-MM-DD] type | summary` H2.
  ```
- If `{wikiPath}/sources/` does not exist, create it.

### Step 3: Evaluate and process each pending file

For each pending file (in mtime ascending order -- oldest first):

1. Read the file contents (frontmatter + body).
2. **Evaluation pass:**
   a. Identify the topic/entity the file describes from its content.
   b. Read existing wiki pages that cover the same topic. Search index.md for matching terms. Check decisions/active/ for related slugs. Read sources/ entries for overlapping dates or topics.
   c. Compare the incoming content against existing wiki knowledge:
      - If the file contains information NOT in any existing wiki page: verdict is **PROMOTE**.
      - If the file's content is substantially covered by existing wiki pages (same facts, same dates, same decisions): verdict is **SKIP** with logged reason.
      - If the file's content CONTRADICTS an existing wiki page (different date for same event, reversed decision, conflicting status at the same point in time): verdict is **FLAG**.
   d. IMPORTANT: A status update is NOT a contradiction. A superseded decision is NOT a contradiction. A contradiction is when two sources claim different facts about the same event or entity at the same point in time. Be specific about the contradiction.
3. For PROMOTE files: invoke the llm-wiki ingest flow as before:
   - Use the `/llm-wiki` skill on this file to promote its content into the wiki.
   - The llm-wiki skill will:
     a. Parse the source file's frontmatter and body.
     b. Draft a summary into `{wikiPath}/sources/YYYY-MM-DD-<slug>.md`.
     c. Identify relevant decisions and either create new entries in `{wikiPath}/decisions/active/` or update existing ones.
     d. Update `{wikiPath}/index.md` (if it exists) to reflect new content.
     e. Append one `## [YYYY-MM-DD] ingest | <one-line summary>` entry to `{wikiPath}/log.md`.
4. For SKIP files: do NOT promote. Record the reason (e.g., "Content fully covered by existing wiki/overview.md").
5. For FLAG files: do NOT promote. Record the contradiction detail (incoming claim, existing claim, existing page, severity).
6. If the llm-wiki flow raises an error or cannot process a PROMOTE file, mark the file as `deferred` and continue with the next file.

**IMPORTANT CONSTRAINTS:**
- Do NOT write to or modify `raw/aios/*.md` files -- they are immutable per ADR 0004.
- Do NOT touch any curated wiki paths outside of those explicitly created or updated by the llm-wiki ingest flow.
- Process files sequentially, not in parallel, to avoid conflicting writes to log.md.
- Do NOT auto-resolve contradictions. Flagged files remain in `raw/aios/` for operator review.

### Step 4: Emit structured summary

After processing all pending files, emit the following block to stdout (verbatim delimiters required):

```
<!-- INGEST_SUMMARY_START -->
```json
{
  "promoted": ["filename1.md"],
  "deferred": ["filename-with-error.md"],
  "skipped": [
    { "file": "filename2.md", "reason": "Content fully covered by existing wiki/overview.md" }
  ],
  "contested": [
    {
      "file": "filename3.md",
      "contradiction": {
        "incoming_claim": "Launch date moved to July 15",
        "existing_claim": "Launch date is June 16",
        "existing_page": "wiki/pages/timeline.md",
        "severity": "high"
      }
    }
  ]
}
```
<!-- INGEST_SUMMARY_END -->
```

- `promoted` -- filenames of drops that were successfully ingested into the wiki.
- `deferred` -- filenames of drops that could not be processed due to an error; retry on next ingest run.
- `skipped` -- files intentionally not promoted because content is redundant with existing wiki knowledge. Each entry is an object with `file` (string) and `reason` (string).
- `contested` -- files that contradict existing wiki knowledge; operator must resolve before promotion. Each entry is an object with `file` (string) and `contradiction` containing `incoming_claim`, `existing_claim`, `existing_page`, and `severity` ("high", "medium", or "low").

If no files were pending, emit the summary with all four arrays empty.
