# Google Calendar MCP — Reference Guide

## Connection

- Server: `claude.ai` Google Calendar integration
- Calendars: BGD primary + 2RM + family calendars
- Read + write (create events, update events, delete events)

## Key tools

| Tool | Use |
|---|---|
| `list_events` | Events in a date range. Specify `timeMin`/`timeMax` as ISO-8601. |
| `create_event` | New event. Requires `summary`, `startTime`, `endTime`. |
| `update_event` | Modify existing. Requires `eventId`. Only pass fields you want to change. |
| `delete_event` | Remove event by `eventId`. |
| `list_calendars` | All calendars the user has access to. |
| `suggest_time` | Find free slots. |

## Gotchas learned from use

- **Always set `timeZone: "America/Chicago"`** — Justin is in CDT. Omitting timezone defaults to the calendar's zone, which is usually correct, but explicit is safer.
- **`addGoogleMeetUrl: true`** creates a Google Meet link automatically. No need to generate one separately.
- **`update_event` only touches fields you pass.** Attendees, Meet link, description all persist unless you explicitly change them.
- **Date math matters.** Verify day-of-week before creating events. June 19 2026 is Thursday, not Friday. June 20 is Friday. Always double-check with the actual calendar.
- **Calendar filtering rule (from memory):** Treat only 2RM W-2 events + self-scheduled items as time blocks. Ignore birthday/observance entries. Don't surface 2RM details in BGD context.
- **Verify before flagging.** Before raising an alarm about a missing meeting or unconfirmed invite, check `list_events` for that date range. Stale transcript data may say "invite not sent" when it was sent days ago.

## Common patterns

**Check next 3 days:**
```
list_events(timeMin: "2026-06-18T00:00:00-05:00", timeMax: "2026-06-21T00:00:00-05:00")
```

**Create meeting with Google Meet:**
```
create_event(summary: "...", startTime: "...", endTime: "...", timeZone: "America/Chicago", addGoogleMeetUrl: true, attendees: [{email: "..."}])
```
