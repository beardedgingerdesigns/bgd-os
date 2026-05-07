---
title: Scheduled routines
description: Source-of-truth MD copies of remote Claude Code routines (claude.ai cloud)
---

These files mirror the routine prompts living in claude.ai cloud (https://claude.ai/code/routines). The cloud routine config is authoritative for the live schedule; these files are the importable copy you can move into another project.

Each file's frontmatter captures everything needed to recreate the routine:

- `name` — display name
- `routineId` — claude.ai trigger id (omit when importing into a new account)
- `schedule.cron` — UTC cron expression (or `runOnceAt` for one-shots)
- `schedule.human` — human-readable schedule with timezone
- `enabled` — true/false
- `model` — Claude model used
- `repo` — git source for the working directory
- `connectors` — list of MCP connectors required
- `status` — active / fired (one-shots) / disabled

The body of each file IS the prompt sent to the agent at run time.

## Active recurring routines

- [curator-pass-component-library.md](curator-pass-component-library.md) — every 4 hours
- [industry-digest-daily.md](industry-digest-daily.md) — daily 6am Chicago
- [industry-intelligence-monthly.md](industry-intelligence-monthly.md) — 1st of month, 6am Chicago
- [industry-deep-dive-quarterly.md](industry-deep-dive-quarterly.md) — quarterly, 1st of Jan/Apr/Jul/Oct, 6am Chicago
- [hub-lint-weekly.md](hub-lint-weekly.md) — Sundays 9am Chicago

## One-shot / fired routines (kept as templates)

- [bgd-overnight-research-briefing.md](bgd-overnight-research-briefing.md) — fired 2026-05-02; reusable as a nightly briefing template
- [bootstrap-component-library-cache.md](bootstrap-component-library-cache.md) — fired 2026-05-01; reusable when seeding a new spoke hub

## Importing into another project

When recreating these in a different claude.ai account or project:

1. Strip the `routineId` field from the frontmatter.
2. Update `repo` to point at the target git source.
3. Update `connectors` against the destination account's connected MCPs (https://claude.ai/customize/connectors).
4. Pass the body content as the agent prompt; pass the frontmatter values to the `RemoteTrigger create` API or paste into the routines UI.
