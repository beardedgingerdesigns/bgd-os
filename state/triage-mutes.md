# Triage mute-list

Patterns the inbox triage skips **every run** — permanently, no UI needed.
Read by `.claude/skills/daily-inbox-triage/SKILL.md` (Step 2.0b) before any thread is evaluated.
A thread matching any line in any section is dropped entirely: not surfaced, not drafted, not counted.

Edit by hand or tell Claude "mute X". One entry per line. `#` starts an inline comment; blank lines ignored.
This is pattern-level and permanent. For a one-off "I handled this thread," the UI's per-thread dismiss
(`aios-ui/.aios-cache/triage-overrides.json`) is the separate, independent layer.

## senders
# glob/substring on the From address. `*@domain` matches the whole domain; a bare address matches exactly.
*@scouting.org              # Boy Scout Camp Mitigwa — personal, not BGD
cara@healingrockia.com      # Cara — personal co-parent contact, never a lead
cara.sanders.18@gmail.com   # Cara — personal

## subjects
# substring or regex on the subject, case-insensitive
Notes:                      # Gemini meeting-notes / recaps (future: automate handling — todos/pending.md)

## categories
# known enum the skill detects: calendar-accept | auto-notification
calendar-accept             # "Accepted:" / "Declined:" / "Tentative:" calendar RSVPs (e.g. Liz accepting an invite)
auto-notification           # no-reply / notification-class senders with machine-generated bodies
