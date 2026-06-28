# Scheduled remote agents (`/schedule` routines)

**Source-of-truth markdown copies live at [`docs/routines/`](../docs/routines/).** Each file there has frontmatter with the full routine config (cron, model, repo, connectors) and the prompt body. Those are the importable copies — drop them into another claude.ai account and the routines can be recreated.

The cloud routine config at https://claude.ai/code/routines is authoritative for the live schedule. Inventory below pulled from the API on 2026-05-03.

These routines run as fully isolated remote agents in Anthropic's cloud, on cron schedules. They cannot access local files. Each routine targets a specific git repo as its working directory and may have MCP connectors attached.

## Active recurring routines

| Name | ID | Cron (UTC) | Local equivalent | Repo |
|---|---|---|---|---|
| **Curator pass — component library audit & expansion** | `trig_017mGRmwXTpkVUyeweCvL4Q3` | `0 2,6,10,14,18,22 * * *` | Every 4 hours (1am, 5am, 9am, 1pm, 5pm, 9pm CT) | terraplex-spoke-hub |
| **Industry digest — daily** | `trig_014rgjYPRbaGVKM6WSXQUYT5` | `0 11 * * *` | 6:00 AM CDT daily | terraplex-spoke-hub |
| **Industry intelligence — monthly** | `trig_01SkSHhfcEo2kXZMMzT5Mpqz` | `0 11 1 * *` | 6:00 AM CDT, 1st of each month | terraplex-spoke-hub |
| **Industry deep-dive — quarterly** | `trig_01Gd3B1zPUAWU2uvjsGrqyJ5` | `0 11 1 1,4,7,10 *` | 6:00 AM CDT, 1st of Jan/Apr/Jul/Oct | terraplex-spoke-hub |
| **Hub lint — weekly** | `trig_01JGVESkYEGL5yeFg9tn7SqL` | `0 14 * * 0` | 9:00 AM CDT Sundays | terraplex-spoke-hub |

## Recent one-shots (fired, disabled)

| Name | ID | Fired | Repo |
|---|---|---|---|
| BGD overnight research briefing 2026-05-02 | `trig_01WVCr3a1KB9GFUoz8P8W7zm` | 2026-05-02 09:00 UTC | inside-out |
| gh-probe diagnostic | `trig_01ReQb6E3ji1kLhU9nqgJRbu` | 2026-05-01 22:38 UTC | terraplex-spoke-hub |
| Bootstrap component-library research cache | `trig_01HHCdoRM8XStgzeuttgyu2o` | 2026-05-01 05:35 UTC | terraplex-site-builder |

## Notes

### Curator cadence history

The curator routine has been retuned several times. As of 2026-05-03 the canonical cadence (per `docs/routines/curator-pass-component-library.md`) is **every 4 hours** — `0 2,6,10,14,18,22 * * *`. That's six runs per day at 1am, 5am, 9am, 1pm, 5pm, 9pm CT. Earlier states observed during this session: every hour, every 2 hours, daily 5pm. Whichever is in the cloud routine config wins; the MD file at `docs/routines/` should be kept in sync as the authoritative reference.

### Repo concentration

Five of the eight known routines target `terraplex-spoke-hub`. That repo is doing real platform-research work overnight. Worth a separate documentation pass at some point, since it appears to be a sibling of `site-builder-phase2` (the manager app) rather than part of it.

### Mental model for these routines

- **Curator + Hub lint** keep the platform's component library and hub-data clean. Operational hygiene.
- **Daily / monthly / quarterly digests** generate research outputs that compound into the dealer-facing knowledge base over time.
- **One-shots** like the overnight research briefing are ad-hoc, fire-once research jobs.

The full routines mechanism is documented in the `/schedule` skill (in this AIOS at `.claude/skills/schedule/`). For one-time research briefings like the 2026-05-02 run, a single comprehensive prompt with a clear output format works well — the agent dumps the briefing in the routine's run page, and the human pastes back into the AIOS.

### Re-running the morning briefing pattern

If the overnight research briefing pattern (`trig_01WVCr3a1KB9GFUoz8P8W7zm`) proves valuable on a recurring basis, consider promoting it from one-shot to a weekly or monthly recurring routine. Today it caught: $4,600/mo MRR baseline, Thermal Kitchen as a missing project, ToneQuest delivery risk, three silent-but-paying clients. The cost-to-signal ratio is high.
