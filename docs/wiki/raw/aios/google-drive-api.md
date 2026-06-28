# Google Drive (claude.ai MCP)

Wired through the claude.ai integration. No `.env` keys required.

## Account

`justin@beardedgingerdesigns.com` is the owning account; `sharedWithMe = true` reaches files shared in.

## Available tools

| Tool | Purpose |
|---|---|
| `mcp__claude_ai_Google_Drive__list_recent_files` | Recently touched files. Sort: `recency` (default), `lastModified`, `lastModifiedByMe`. |
| `mcp__claude_ai_Google_Drive__search_files` | Structured query (see syntax below). |
| `mcp__claude_ai_Google_Drive__get_file_metadata` | Metadata for a file ID. |
| `mcp__claude_ai_Google_Drive__read_file_content` | Read text content (Docs, Sheets, etc.). |
| `mcp__claude_ai_Google_Drive__download_file_content` | Binary download. |
| `mcp__claude_ai_Google_Drive__get_file_permissions` | Sharing/permissions. |
| `mcp__claude_ai_Google_Drive__create_file` | Create a new file. |
| `mcp__claude_ai_Google_Drive__copy_file` | Copy a file. |

## Known well-known locations

| What | ID / Location |
|---|---|
| Gemini meeting transcripts | parent folder `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu` |
| "Monthly Financials" spreadsheet | `18WBgJTEvd_Qrbn8lZxbe5of6Y8IBct8zvjTmRCUYb7U` |
| "Selling Expenses" spreadsheet | `19c8jfNuZG11WZkLCgmHK58ccdmeG16czjJcDmGihIik` |

The Monthly Financials sheet appears to be a parallel revenue source-of-truth alongside Bonsai. When working revenue questions, check both.

## Search query syntax

Structured query language for `search_files`:

| Goal | Query |
|---|---|
| Recent Gemini transcripts | `parentId = '1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu' and modifiedTime > '2026-04-01T00:00:00Z'` |
| Find a specific meeting | `title contains 'Terraplex' and mimeType contains 'document'` |
| Spreadsheets only | `mimeType contains 'spreadsheet' and owner = 'me'` |
| Recent docs I modified | `mimeType contains 'document' and modifiedTime > '2026-04-15T00:00:00Z'` |
| Shared with me, recent | `sharedWithMe = true and modifiedTime > '2026-04-01T00:00:00Z'` |
| Project-named docs | `title contains 'Wild Rose' or title contains 'InsideOut' or title contains 'ToneQuest'` |

Operators: `contains`, `=`, `!=`, `<`, `<=`, `>`, `>=`. Combine with `and`, `or`, `not`. String values single-quoted. Dates in RFC 3339 UTC.

## Workflow patterns

**Pull a meeting transcript into context:** `search_files` against the Gemini parent folder by date or title → `read_file_content` on the matching ID. Today's Terraplex check-ins (2026-05-01) are an example of clustered meetings worth reading together for full context.

**Revenue reality-check:** `read_file_content` on the Monthly Financials sheet for the truthful number, cross-reference Bonsai for invoicing-side detail.

**Don't write to Drive without asking.** `create_file` and `copy_file` are available but should only run on explicit instruction. Drive is shared workspace — silent files create surprise.
