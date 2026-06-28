# Scheduled Remote Agents (`/schedule` routines)

Routines run as fully isolated remote agents in Anthropic's cloud, on cron schedules. They cannot access local files. Each targets a specific git repo as its working directory and may have MCP connectors attached.

**Source of truth:**
- Live schedule: the cloud routine config at `https://claude.ai/code/routines` is authoritative.
- Importable copies: `docs/routines/` — each file has frontmatter with the full config (cron, model, repo, connectors) + the prompt body. Drop one into another claude.ai account to recreate the routine.
- Mechanism: the `/schedule` skill (`.claude/skills/schedule/`).

## Active recurring routines (inventory 2026-05-03)

| Name | Cron (UTC) | Local equivalent | Repo |
|---|---|---|---|
| Curator pass — component library audit & expansion | `0 2,6,10,14,18,22 * * *` | Every 4h (1/5/9 am, 1/5/9 pm CT) | terraplex-spoke-hub |
| Industry digest — daily | `0 11 * * *` | 6:00 AM CDT daily | terraplex-spoke-hub |
| Industry intelligence — monthly | `0 11 1 * *` | 6:00 AM CDT, 1st of month | terraplex-spoke-hub |
| Industry deep-dive — quarterly | `0 11 1 1,4,7,10 *` | 6:00 AM CDT, 1st of Jan/Apr/Jul/Oct | terraplex-spoke-hub |
| Hub lint — weekly | `0 14 * * 0` | 9:00 AM CDT Sundays | terraplex-spoke-hub |

## Mental model

- **Curator + Hub lint** keep the platform's component library and hub-data clean — operational hygiene.
- **Daily / monthly / quarterly digests** generate research outputs that compound into the dealer-facing knowledge base over time.
- **One-shots** (e.g. the overnight research briefing) are ad-hoc, fire-once research jobs. For these, a single comprehensive prompt with a clear output format works well — the agent dumps the briefing in the run page, and the human pastes it back into the AIOS.

## Notes

- **Curator cadence drifts.** It has been retuned several times (hourly → 2-hourly → daily 5pm → every 4h). Whatever is in the cloud config wins; keep `docs/routines/curator-pass-component-library.md` in sync as the reference.
- **Repo concentration.** Five of the known routines target `terraplex-spoke-hub` — that repo does real platform-research work overnight. It appears to be a sibling of `site-builder-phase2` (the manager app), not part of it.
- **Promote high-signal one-shots.** If a one-shot pattern proves valuable repeatedly, promote it to a recurring routine. The 2026-05-02 overnight briefing caught: the MRR baseline, a missing project (Thermal Kitchen), a delivery risk (ToneQuest), and three silent-but-paying clients — a high cost-to-signal ratio.

Related: [["Cowork" means the Claude app feature]] — scheduled cloud routines are sandboxed, so coverage is narrower than a local run.
