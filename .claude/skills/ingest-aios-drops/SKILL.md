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

### Step 3: Process each pending file

For each pending file (in mtime ascending order — oldest first):

1. Read the file contents.
2. Invoke the llm-wiki ingest flow for this source file:
   - Use the `/llm-wiki` skill on this file to promote its content into the wiki.
   - The llm-wiki skill will:
     a. Parse the source file's frontmatter and body.
     b. Draft a summary into `{wikiPath}/sources/YYYY-MM-DD-<slug>.md`.
     c. Identify relevant decisions and either create new entries in `{wikiPath}/decisions/active/` or update existing ones.
     d. Update `{wikiPath}/index.md` (if it exists) to reflect new content.
     e. Append one `## [YYYY-MM-DD] ingest | <one-line summary>` entry to `{wikiPath}/log.md`.
3. If the llm-wiki flow raises an error or cannot process the file, mark the file as `deferred` and continue with the next file.

**IMPORTANT CONSTRAINTS:**
- Do NOT write to or modify `raw/aios/*.md` files — they are immutable per ADR 0004.
- Do NOT touch any curated wiki paths outside of those explicitly created or updated by the llm-wiki ingest flow.
- Process files sequentially, not in parallel, to avoid conflicting writes to log.md.

### Step 4: Emit structured summary

After processing all pending files, emit the following block to stdout (verbatim delimiters required):

```
<!-- INGEST_SUMMARY_START -->
```json
{
  "promoted": ["<filename1>", "<filename2>"],
  "deferred": ["<filename3>"],
  "contested": []
}
```
<!-- INGEST_SUMMARY_END -->
```

- `promoted` — filenames of drops that were successfully ingested into the wiki.
- `deferred` — filenames of drops that could not be processed (errors, conflicts, unclear mapping).
- `contested` — filenames where the ingest produced conflicting decision updates that require human review (e.g., a drop contradicts an existing active decision).

If no files were pending, emit the summary with all three arrays empty.
