# Project State: ToneQuest

**Updated:** 2026-07-01 | **Status:** On track

## Accomplishments (this session)

- Ran two nightshift batches (issues #11, #13, #14) — all completed with clean `tsc` passes
- Fixed critical sign-off regex bug in `segment.ts`: Marker italicizes em-dashes in sign-offs (`TQ*—Name*`), which broke segmentation entirely on real data. Regex now tolerates `[*_]*` emphasis markers.
- Fixed segment trailing fallback off-by-one error that was emitting phantom articles from back-matter (Resource Directory, masthead colophon)
- Improved segment title extraction (#16): dedupe doubled titles and skip `TQ:` questions and TOC anchors. Title match rate improved from 3/9 + 0/8 to 5/9 + 2/8 across both gold PDFs.
- Merged both nightshift branches (`2026-06-29-0219` and `2026-06-29-1615`) into `application` — 13 commits, full Marker pipeline + cleanup + validation harness live.

## Current Status

Marker PDF ingest pipeline is validated against real data and merged into `application`. Segmenter and TOC parser handle real Marker output correctly. All nightshift issues closed; 4 issues remain open (PRD umbrella, eval expansion, TOC parsing redesign, and legacy doc cleanup).

## Next Steps

- [ ] Set up GPU cloud provider (DigitalOcean droplet or equivalent) for bulk PDF ingest
- [ ] Batch-ingest 291 PDFs from Liz's archive (Dropbox source located)
- [ ] Begin website implementation (product ship phase)

## Key Dates

- 2026-07-01: Both nightshift branches merged into `application`