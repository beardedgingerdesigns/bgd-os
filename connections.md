# Connections

Registry of every system your AIOS can reach. Filled by `/onboard` from Q4-Q7 answers; expanded over time as you wire new tools. `/audit` checks this file for domain coverage and freshness.

| # | Domain | Tool | Mechanism | Auth | Last checked |
|---|---|---|---|---|---|
| 1 | Revenue / Financials | Bonsai | not yet connected | — | — |
| 1b | Revenue (parallel) | "Monthly Financials" Google Sheet | via Drive MCP (read) | claude.ai | 2026-05-01 |
| 2 | Customer interactions | Gmail (`justin@beardedgingerdesigns.com`) | mcp (claude.ai) — drafts only, no send | claude.ai | 2026-05-01 |
| 3 | Calendar | Google Calendar (BGD primary + 2RM + family calendars) | mcp (claude.ai) | claude.ai | 2026-05-01 |
| 4 | Communication | Gmail (wired), Google Chat (not wired), Discord (incoming), phone, in-person | partial — Gmail only | claude.ai (Gmail) | 2026-05-01 |
| 5 | Project / task tracking | _none yet — open question, top pain area_ | not yet connected | — | — |
| 6 | Meeting intelligence | Gemini transcripts in Drive folder `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu` | mcp (claude.ai, via Drive) | claude.ai | 2026-05-01 |
| 7 | Knowledge / files | Google Drive | mcp (claude.ai) | claude.ai | 2026-05-01 |
| 8 | Channel platform — onboarding form | [terraplex-onboarding-form](https://github.com/beardedgingerdesigns/terraplex-onboarding-form) (public, Vue 3 + Netlify Forms) | git | public | 2026-05-02 |
| 9 | Site Manager (the engine) | `site-builder-phase2` at `/Users/justinlobaito/repos/site-builder-phase2`; production `manager.beardedgingerdesigns.com` | local repo + production droplet | session/bcrypt | 2026-05-02 |

**Mechanism options:** `mcp` (MCP server), `script` (Python/Bash hitting an API, in `scripts/`), `export` (CSV/JSON dump pipeline), `key+ref` (`.env` key + `references/{tool}-api.md` guide), `not yet connected`.

When you wire a new tool, also save `references/{tool}-api.md` capturing endpoints, auth flow, and common queries — researched-once-saved-forever.

## Notes from intake

- **Domain 5 is the open question.** No project/task tracker today. Currently leaning on Google + claude.ai as a stand-in. This is the area `/level-up` should hunt first — it's tied directly to the stated top pain (juggling concurrent projects).
- **Domain 6 is now auto-accessible.** Gemini transcripts land in Drive folder `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu`; readable via the Drive MCP without manual import.
- **Discord is incoming, not active.** Don't assume it's connected; revisit when it lands.

## Onboarding pipeline (per 2026-05-02 decision log entry)

The dealer onboarding flow is the de facto productized BGD tier. Sequence:

1. **Discovery call** — typically 15-30 min via Google Meet, transcribed by Gemini into Drive folder `1vx0unSfZbDnJMOU9S9d4N4N_p7xIF-vu`.
2. **Follow-up email** with questionnaire URL → [https://terraplex-onboarding.netlify.app/](https://terraplex-onboarding.netlify.app/). Vue 3 + Vite SPA, Netlify Forms capture. Schema-driven via `questionnaire.json` (10 sections, ~40 fields). Full field inventory + architecture in `references/terraplex-platform.md`.
3. **Bonsai-issued contract** — first invoice generated same day; recurring monthly invoicing for the 18-month term.
4. **Site build** kicks off once questionnaire is returned; ~1-1.5 weeks for a 3-page dealer site.
5. **Recurring monthly check-ins** post-launch (Justin↔dealer) for service feedback + roadmap input.

This pipeline is the productized tier in everything but published packaging (priority #1).

## Notes from Day 1 wiring (2026-05-01)

- **Gmail / Drive / Calendar wired via claude.ai MCP.** No `.env` keys in this session. Dependency: this connection only works inside a claude.ai-connected Claude Code session. If the AIOS is ever used standalone (cron, server, separate Claude Code install), these will need to be rewired.
- **Gmail is draft-only.** No `send` capability exposed. Outbound mail always requires human send.
- **2RM calendar (`justinl@2rm.com`) is visible via the Calendar MCP** even though 2RM is W-2 and outside BGD's book. Useful for conflict checks against BGD work, but treat 2RM data as work-account data — don't move 2RM events into BGD-side artifacts.
- **A "Monthly Financials" Google Sheet exists alongside Bonsai.** Two revenue sources of truth. Worth reconciling them in a `/level-up` pass before picking a single canonical view.
- **Reference docs:** see `references/gmail-api.md`, `references/google-drive-api.md`, `references/google-calendar-api.md` for available tools, query syntax, and workflow patterns.
