# Gmail MCP — Reference Guide

## Connection

- Server: `claude.ai` Gmail integration
- Scope: `justin@beardedgingerdesigns.com`
- **Draft-only by design.** The AIOS creates drafts, never sends. This is a CLAUDE.md rule, not a technical limitation.

## Key tools

| Tool | Use |
|---|---|
| `search_threads` | Find threads by query. Returns up to `pageSize` threads (max 50). Each thread shows up to ~5 messages — NOT all messages. Use `nextPageToken` to paginate. |
| `get_thread` | Full thread with all messages + bodies. Can be very large — use `MINIMAL` format if you only need headers. |
| `create_draft` | Create a draft. Use `replyToMessageId` to thread it into an existing conversation. |
| `list_labels` | Get label IDs (needed for label-based search). |

## Search syntax (Gmail query language)

```
from:user@example.com
to:user@example.com
subject:(keyword)
newer_than:7d / older_than:30d
after:2026/06/01 / before:2026/06/15
has:attachment
is:unread
in:inbox / in:sent / in:draft
-from:noreply  (exclude)
label:LABEL_ID  (use IDs, not display names)
```

Combine with `AND` (default) or `OR`. Group with `()`.

## Gotchas learned from use

- **`search_threads` truncates messages.** A thread with 9 messages may only show 5 in search results. To get the full thread (e.g., finding the latest message ID for reply threading), call `get_thread`.
- **`get_thread` can be huge.** Threads with long email chains + HTML bodies can exceed output limits. Use `MINIMAL` format when you only need message IDs and senders, or process the saved output file with jq.
- **`replyToMessageId` must be exact.** Use the message `id` field, not the thread `id`. A wrong ID returns "Message referenced by reply_to_message_id not found."
- **Thread ID ≠ message ID.** Thread ID groups the conversation. Message ID identifies a single email. `create_draft` with `replyToMessageId` takes the message ID of the specific email you're replying to (usually the last inbound message).
- **No send capability.** `create_draft` is the terminal action. Justin sends manually from Gmail.
- **Bot/newsletter filtering.** For triage, exclude: `noreply`, `no-reply`, `notifications`, `hellobonsai.com`, `drive-shares-dm-noreply`. These are noise.

## Common patterns

**Triage query (last 14 days, skip bots):**
```
in:inbox -in:draft newer_than:14d -from:noreply -from:no-reply -from:notifications -from:hellobonsai.com -from:drive-shares-dm-noreply
```

**Reply in thread:** Get the last inbound message ID from the thread, then:
```
create_draft(to: [sender], replyToMessageId: lastMessageId, body: "...")
```

**Find latest message ID in a long thread:** If `search_threads` truncates, save `get_thread` output to file, then `jq -r '.messages[-1].id'` on the file.
