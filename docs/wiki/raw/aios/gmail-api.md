# Gmail (claude.ai MCP)

Wired through the claude.ai integration. No `.env` keys required in this session — auth is handled by claude.ai. If the AIOS is ever used outside a claude.ai-connected Claude Code session, this connection will need to be rewired (Google Workspace MCP or a script + OAuth).

## Account

`justin@beardedgingerdesigns.com` (primary). Note that `justinl@2rm.com` is a separate Google identity and not currently exposed through this MCP.

## Available tools

| Tool | Purpose |
|---|---|
| `mcp__claude_ai_Gmail__search_threads` | Find threads by query (Gmail search syntax). 50/page max. |
| `mcp__claude_ai_Gmail__get_thread` | Pull full message bodies for a thread. |
| `mcp__claude_ai_Gmail__list_labels` | Discover user-defined label IDs. |
| `mcp__claude_ai_Gmail__list_drafts` | List existing drafts. |
| `mcp__claude_ai_Gmail__create_draft` | Create a draft (does **not** send). |
| `mcp__claude_ai_Gmail__create_label` | Create a new label. |
| `mcp__claude_ai_Gmail__label_thread` / `label_message` | Apply a label. |
| `mcp__claude_ai_Gmail__unlabel_thread` / `unlabel_message` | Remove a label. |

**Not available:** sending mail directly. Drafts only. That's a feature — keeps a human in the loop on outbound communication.

## Existing user labels (snapshot from 2026-05-01)

Client/project labels in use:
- Wild Rose Resorts
- BGD Contact Forms
- Co-Line MFG
- Liebl MG
- Newton Schools
- Lilliana Grace Media
- Canoyer Garden Center
- Team-5
- InVision Comments
- Preschool
- Paypal
- Deleted Messages

Good organizational hygiene already in place. New automations should label, not create folders, and reuse these IDs where they apply.

## Common query patterns

Gmail search syntax (passed as `query` to `search_threads`):

| Goal | Query |
|---|---|
| Unread inbox | `is:unread in:inbox` |
| Recent client thread | `from:client@domain.com newer_than:14d` |
| Stalled (waiting on me) | `is:unread label:"BGD Contact Forms" newer_than:30d` |
| Pipeline emails | `subject:proposal OR subject:quote newer_than:30d` |
| Wrap-up project triage | `subject:"Wild Rose" OR subject:"InsideOut" OR subject:ToneQuest is:unread` |
| Attachments needed | `has:attachment newer_than:7d is:unread` |

Operators: `from:`, `to:`, `subject:`, `is:unread`, `is:starred`, `has:attachment`, `after:YYYY/MM/DD`, `before:`, `newer_than:7d`, `AND`, `OR`, `-` (exclude). Combine with parentheses.

## Workflow patterns

**Triage pass (top pain area):** Pull `is:unread in:inbox newer_than:7d`, group by sender or label, draft replies for the top 5 — never send. Justin reviews and sends.

**Voice rule reminder:** Drafts must match `references/voice.md`. Short sentences, casual greeting, no em dashes, no "I hope this finds you well." For external-going content (anything beyond a single known recipient), show a draft first.

**Label hygiene:** When creating a draft for a known client thread, ensure the existing project label is applied. Don't proliferate new labels for the same client.
