# Project State: ToneQuest

**Updated:** 2026-06-26 | **Status:** On track

## Accomplishments (this session)

- 6/26 check-in with Liz: meetings moved to Wednesdays, website confirmed as delivery channel (replaces Mailchimp PDF emails), archive import will be tested in year-clusters
- Pelcro international subscriber data issues surfaced (wrong plans); Liz cleaning manually + support ticket open

## Current Status

Server-side paywall shipped (PR #1, 2026-06-21). PDF ingest pipeline operational with admin review queue. Website established as the delivery channel — subscribers access PDFs and articles through the platform, entitlements determine access. Archive engine being tested in clusters (initial, middle, final years) before full 25-year ingestion. Pelcro has data quality issues with international subscribers that Liz is cleaning up.

## Next Steps

- [ ] Contact Pelcro next week re: launch alignment
- [ ] Review imported archive file status on Monday (6/30)
- [ ] Test archive engine Wednesday (7/2) against year clusters (initial, middle, final 5)
- [ ] Follow-up meeting with Liz on Friday (7/4 — confirm, may shift due to holiday)
- [ ] Evaluate articles in admin review queue from recent PDF ingests

## Key Dates

- 2026-06-26: Check-in — meetings moved to Wed, website = delivery channel, archive cluster testing plan
- 2026-06-21: Server-side paywall merged (PR #1)
- 2026-06-19: Client check-in — Claude Code pivot acknowledged; timeline extension accepted with fee waiver
## nightshift 2026-06-29-0219 — complete (awaiting QA)

Built the Marker PDF Stage-0 replatform (issues #2-#9) on branch `nightshift/2026-06-29-0219` (pushed, 8 commits). Vision-first PDF ingest → Marker-first (ML PDF→markdown + heuristic segmentation + Claude markdown→HTML). All TypeScript typechecks green, per-module regression tests pass, `pnpm build` green with a seeded DB.

- **7 issues implemented + verified:** #2 (PRD doc), #3 (marker_extract.py), #5 (segmenter), #6 (TOC parser), #7 (page fallback heuristic), #8 (markdown Claude stage), #9 (pipeline integration — deleted the old vision Stage 0). Left OPEN with implementation comments (auto-close blocked by a permission guardrail — close after QA).
- **1 needs-human:** #4 (spike) — harness committed + ready to run, but scoring can't execute AFK (system Python 3.9 vs marker's ≥3.10 + no torch/API keys).
- **4 follow-ups filed:** #11/#12/#13 (ready-for-agent), #14 (needs-human, validate heuristics on real Marker output).
- **Not verified:** no end-to-end ingest ran (no marker/torch/API/DB). Human QA = run the #4 spike on a 3.10+ venv, then a real PDF ingest through /admin. Learnings staged to `docs/wiki/raw/aios/nightshift-learnings-2026-06-29-0219.md`.
