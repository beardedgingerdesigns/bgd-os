# API & MCP Reference Guide

Consolidated reference for every external service the AIOS reaches through the claude.ai integration. All connections are wired through claude.ai — no `.env` keys are required inside a claude.ai-connected Claude Code session. If the AIOS is ever run outside such a session, every connection here needs rewiring (Google Workspace MCP or a script + OAuth).

`connections.md` at the repo root is the canonical live status registry — trust it over this page when they disagree.

---

## Gmail

**Connection:** claude.ai Gmail integration, scoped to `justin@beardedgingerdesigns.com` (primary). `justinl@2rm.com` is a separate Google identity, not exposed through this MCP.

**Posture:** Draft + archive/label (modify scope since 2026-06-21). **No send capability** — by design, keeps a human in the loop on all outbound. `create_draft` is the terminal action; Justin sends manually from Gmail.

### Key tools

| Tool | Purpose |
|---|---|
| `search_threads` | Find threads by Gmail query. Max 50/page; paginate with `nextPageToken`. Shows ~5 messages per thread, not all. |
| `get_thread` | Full thread with all message bodies. Can be huge — use `MINIMAL` format for headers/IDs only. |
| `create_draft` | Create a draft (never sends). Use `replyToMessageId` to thread into a conversation. |
| `list_labels` | Get label IDs (needed for label-based search). |
| `list_drafts` | List existing drafts. |
| `create_label` / `update_label` / `delete_label` | Manage labels. |
| `label_thread` / `label_message` | Apply a label. |
| `unlabel_thread` / `unlabel_message` | Remove a label. |

### Search syntax (Gmail query language)

```
from:user@example.com        to:user@example.com
subject:(keyword)            is:unread / is:starred
has:attachment               in:inbox / in:sent / in:draft
newer_than:7d / older_than:30d
after:2026/06/01 / before:2026/06/15
label:LABEL_ID  (use IDs, not display names)
-from:noreply   (exclude)
```

Combine with `AND` (default) or `OR`; group with `()`.

### Triage query (last 14 days, skip bots)

```
in:inbox -in:draft newer_than:14d -from:noreply -from:no-reply -from:notifications -from:hellobonsai.com -from:drive-shares-dm-noreply
```

Bot/newsletter noise to exclude: `noreply`, `no-reply`, `notifications`, `hellobonsai.com`, `drive-shares-dm-noreply`.

### Gotchas

- **`search_threads` truncates messages.** A 9-message thread may show only 5. Call `get_thread` to get the latest message ID for reply threading.
- **`replyToMessageId` must be the exact message `id`**, not the thread `id`. A wrong ID returns "Message referenced by reply_to_message_id not found." The reply target is usually the last inbound message.
- **Find latest message ID in a long thread:** save `get_thread` output to file, then `jq -r '.messages[-1].id'`.
- **Label hygiene:** reuse existing client labels (below); don't proliferate new ones for the same client. Automations should label, not create folders.

### Existing user labels (snapshot 2026-05-01)

Wild Rose Resorts · BGD Contact Forms · Co-Line MFG · Liebl MG · Newton Schools · Lilliana Grace Media · Canoyer Garden Center · Team-5 · InVision Comments · Preschool · Paypal · Deleted Messages

---

## Google Calendar

**Connection:** claude.ai Google Calendar integration. Read + write. Time zone is `America/Chicago` across all calendars.

### Calendars accessible

| Calendar | ID | Use |
|---|---|---|
| BGD primary | `justin@beardedgingerdesigns.com` | **Default for queries.** |
| 2RM work | `justinl@2rm.com` | W-2 day-job calendar. |
| Kids Schedule | `beardedgingerdesigns.com_r80duu5j4tak4fbpp6elc99vic@group.calendar.google.com` | Family load. |
| Shared Kids Schedule | `c_127fdf1cb90cfc3c9ebf379df9c6847fa258fd4097ba81314627c47ab3534893@group.calendar.google.com` | Family load. |
| Kids' Events | `c_90a17102cd5898647be24779e855e8c89f821eb9a553ff03708af082e0a33c80@group.calendar.google.com` | Family load. |
| Boy Scout troop | `troop63.pirates@gmail.com` | Personal. |
| SEP Majors Mets | `gsrrfup5nud7ul740vtuvtdnhbv7plbt@import.calendar.google.com` | Baseball. |
| SEP AA Guardians | `t622lfrrtkrq38068lvhv3vv6qbjo89d@import.calendar.google.com` | Baseball. |
| US holidays | `en.usa#holiday@group.v.calendar.google.com` | Ignore for scheduling. |

### Key tools

| Tool | Purpose |
|---|---|
| `list_events` | Events in a window. Set `timeMin`/`timeMax` as ISO-8601. |
| `get_event` | Single event detail. |
| `create_event` | New event. Requires `summary`, `startTime`, `endTime`. |
| `update_event` | Modify existing. Requires `eventId`; only pass fields to change (attendees, Meet link, description persist otherwise). |
| `delete_event` | Remove by `eventId`. |
| `list_calendars` | Discover calendar IDs. |
| `respond_to_event` | RSVP. |
| `suggest_time` | Find open slots for a given duration. |

### Gotchas

- **Always set `timeZone: "America/Chicago"`** — explicit is safer than relying on the calendar's default.
- **`addGoogleMeetUrl: true`** auto-creates a Meet link; no need to generate one separately.
- **Verify day-of-week before creating events.** Date math is a recurring error source — double-check against the actual calendar.
- **Filtering rule:** treat only 2RM W-2 events + self-scheduled items as real time blocks. Ignore birthday/observance entries. Don't surface 2RM details in BGD context.
- **Verify before flagging.** Before raising an alarm about a missing meeting or unconfirmed invite, check `list_events` for that range — stale transcript data may say "invite not sent" when it went out days ago.
- **Don't create or modify events without explicit instruction.** Writes are visible to attendees instantly. Confirm date, time, duration, and full attendee list before calling `create_event`.

### Create meeting with Google Meet

```
create_event(summary: "...", startTime: "...", endTime: "...",
             timeZone: "America/Chicago", addGoogleMeetUrl: true,
             attendees: [{email: "..."}])
```

---

## Google Drive

**Connection:** claude.ai Google Drive integration. Owning account `justin@beardedgingerdesigns.com`; `sharedWithMe = true` reaches files shared in. Information flows inward (Drive → AIOS → wikis); the AIOS rarely writes back.

### Key tools

| Tool | Purpose |
|---|---|
| `search_files` | Structured query (syntax below). |
| `list_recent_files` | Recently touched. Sort: `recency` (default), `lastModified`, `lastModifiedByMe`. |
| `read_file_content` | Read text content (Docs, Sheets, etc.). |
| `download_file_content` | Binary download. |
| `get_file_metadata` | Metadata for a file ID. |
| `get_file_permissions` | Sharing/permissions. |
| `create_file` / `copy_file` | Write/copy (explicit instruction only). |

### Well-known locations

| What | ID |
|---|---|
| Gemini meeting transcripts (parent folder) | `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu` |
| "Monthly Financials" spreadsheet | `18WBgJTEvd_Qrbn8lZxbe5of6Y8IBct8zvjTmRCUYb7U` |
| "Selling Expenses" spreadsheet | `19c8jfNuZG11WZkLCgmHK58ccdmeG16czjJcDmGihIik` |

Monthly Financials is a parallel revenue source-of-truth alongside Bonsai — check both on revenue questions.

### Search query syntax

Operators: `contains`, `=`, `!=`, `<`, `<=`, `>`, `>=`. Combine with `and`, `or`, `not`. String values single-quoted; dates in RFC 3339 UTC.

```
parentId = '1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu' and modifiedTime > '2026-04-01T00:00:00Z'
title contains 'Terraplex' and mimeType contains 'document'
mimeType contains 'spreadsheet' and owner = 'me'
sharedWithMe = true and modifiedTime > '2026-04-01T00:00:00Z'
```

### Gotchas

- **Gemini transcripts are PDFs** — often large; read by page range (summaries on pages 1-2, full transcript after).
- **Attribution:** Cherity at Terraplex speaks under the "Jack Schroeder" account in Terraplex meeting transcripts. Attribute to Cherity at ingest.
- **Drive ≠ Dropbox.** Some clients (e.g. Deann / Thermal Kitchen) share via Dropbox, a separate MCP. Check which service a client uses before searching the wrong one.

---

## Connection summary

| Service | Posture | Notes |
|---|---|---|
| Gmail | Draft + archive/label, **no send** | Human-in-the-loop on all outbound. |
| Google Calendar | Read + write | Writes visible to attendees instantly — confirm first. |
| Google Drive | Read-heavy; write on instruction | Inbound information flow; Gemini transcripts live here. |
| Dropbox | Separate MCP | Some clients share here instead of Drive. |
| DigitalOcean | MCP | Infra/droplet management. |

Not wired: Bonsai (financials readable via the Monthly Financials Sheet on Drive), Google Chat, Discord.
