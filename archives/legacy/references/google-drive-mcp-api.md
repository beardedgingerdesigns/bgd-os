# Google Drive MCP — Reference Guide

## Connection

- Server: `claude.ai` Google Drive integration
- Access: Justin's BGD Drive, including shared folders from clients
- Includes Gemini meeting transcripts folder: `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu`

## Key tools

| Tool | Use |
|---|---|
| `search_files` | Search by name, type, or folder. |
| `read_file_content` | Read a file's content (text-based files). |
| `download_file_content` | Download binary files. |
| `list_recent_files` | Recently modified files. |
| `get_file_metadata` | File details (size, modified date, sharing). |
| `create_file` | Create a new file in Drive. |

## Key folders

- **Gemini meeting transcripts:** Auto-generated after Google Meet calls. Search by meeting title or date. Attribution note: Cherity at Terraplex speaks under "Jack Schroeder" account in Terraplex meetings.
- **Client shared folders:** Clients like Deann (Thermal Kitchen) share Dropbox folders, but some also share via Drive.
- **Monthly Financials:** Google Sheet — the indirect path to revenue data until Bonsai is wired.

## Gotchas

- **Gemini transcripts are PDFs.** They can be large and require page-range reading. Summaries are usually on pages 1-2; full transcript follows.
- **Drive ≠ Dropbox.** Some clients share via Dropbox (separate MCP). Check which one the client uses before searching the wrong service.
- **Read-only for most practical purposes.** While `create_file` exists, the AIOS doesn't typically write back to Drive. Information flows inward (Drive → AIOS → wikis), not outward.
