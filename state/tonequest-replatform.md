# Project State: ToneQuest PDF Ingest Pipeline

**Updated:** 2026-06-19 | **Status:** At risk

## Accomplishments (this session)

- Fixed article segmentation (fix #1): moved from 78%/43% match to 100%/86% by analyzing content signals (`TQ—` sign-offs, `-continued-` markers) instead of TOC lines only.
- Fixed image injection (fix #2): replaced unstable freehand image HTML with deterministic `<figure>` rendering from structured placement data; jumped from ~35% unstable to ~100% stable across Dec/Apr.
- Built eval harness with frozen gold answer keys (Dec: 9 articles, Apr: 7 articles).
- Ran generalization test on September 2025 (held-out issue); identified token limit bug as blocker.
- Captured session findings to wiki (`decisions/0002-pdf-engine-fidelity-target`, `log.md`, `product/roadmap.md`, `architecture/ingest-pipeline.md`).

## Current Status

The engine correctly segments articles and renders images on normal-sized issues (verified on Dec/Apr). However, it crashes on very large articles (18+ pages) because the 16k output-token limit truncates `body_html`, causing the entire issue to fail with no retry. This blocks scaling to the 270-issue backlog.

## Next Steps

- [ ] Bump `INGEST_MAX_TOKENS` from 16k to ~32k in `pipeline.ts`
- [ ] Add per-article failure isolation: flag truncated/malformed articles and continue instead of crashing
- [ ] Re-run September 2025 to verify fixes on large-article case
- [ ] Prepare deliverables for Friday's Liz launch status meeting (see `docs/wiki/sources/2026-06-17-launch-status-meeting.md`)

## Blockers

- Engine truncates output on articles >~18 pages due to 16k token cap, causing entire-issue failure with no recovery.

## Key Dates

- 2026-06-21: Liz launch status meeting (Friday)