# Google Calendar (claude.ai MCP)

Wired through the claude.ai integration. No `.env` keys required.

## Calendars accessible

| ID | Use |
|---|---|
| `justin@beardedgingerdesigns.com` | Primary BGD calendar. **Default for queries.** |
| `justinl@2rm.com` | 2RM work calendar (W-2 day job). |
| `beardedgingerdesigns.com_r80duu5j4tak4fbpp6elc99vic@group.calendar.google.com` | Kids Schedule |
| `c_127fdf1cb90cfc3c9ebf379df9c6847fa258fd4097ba81314627c47ab3534893@group.calendar.google.com` | Shared Kids Schedule |
| `c_90a17102cd5898647be24779e855e8c89f821eb9a553ff03708af082e0a33c80@group.calendar.google.com` | Kids' Events |
| `troop63.pirates@gmail.com` | Boy Scout troop |
| `gsrrfup5nud7ul740vtuvtdnhbv7plbt@import.calendar.google.com` | SEP Majors Mets (baseball) |
| `t622lfrrtkrq38068lvhv3vv6qbjo89d@import.calendar.google.com` | SEP AA Guardians (baseball) |
| `en.usa#holiday@group.v.calendar.google.com` | US holidays |

Time zone is `America/Chicago` across the board.

## Available tools

| Tool | Purpose |
|---|---|
| `mcp__claude_ai_Google_Calendar__list_calendars` | Discover calendar IDs. |
| `mcp__claude_ai_Google_Calendar__list_events` | Events in a time window. |
| `mcp__claude_ai_Google_Calendar__get_event` | Single event detail. |
| `mcp__claude_ai_Google_Calendar__create_event` | Create new event. |
| `mcp__claude_ai_Google_Calendar__update_event` | Modify existing. |
| `mcp__claude_ai_Google_Calendar__delete_event` | Delete event. |
| `mcp__claude_ai_Google_Calendar__respond_to_event` | RSVP. |
| `mcp__claude_ai_Google_Calendar__suggest_time` | Find open time slots. |

## Common query patterns

| Goal | Approach |
|---|---|
| What's today | `list_events` on primary, `startTime=today_midnight`, `endTime=tomorrow_midnight` |
| This week's BGD meetings | `list_events` on `justin@beardedgingerdesigns.com`, week range, `eventTypeFilter=['default']` |
| 2RM commitments | `list_events` on `justinl@2rm.com` |
| Personal load this week | List on Kids Schedule + Boy Scout + baseball calendars to see family/personal time |
| Find open block for deep work | `suggest_time` with desired duration |
| Search by topic | `list_events` with `fullText` parameter |

## Workflow patterns

**Weekly focus answer:** Pull the next 7 days from `justin@beardedgingerdesigns.com` + `justinl@2rm.com`, plus kid/scout calendars for personal load. Cross-reference against `priorities.md` to spot conflicts between the strategic priorities and what the calendar actually has him doing.

**Conflict awareness:** The W-2 calendar (2RM) and BGD calendar are separate. When answering "do I have time for X," check both — work-day BGD activity often happens around 2RM blocks.

**Don't create or modify events without explicit instruction.** Calendar writes are visible to attendees instantly.
