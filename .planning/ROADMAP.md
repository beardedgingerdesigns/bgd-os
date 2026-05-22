# Roadmap: claude-os

## Overview

claude-os is Justin's personal AIOS — a local-only Next.js workspace combining filesystem-source-of-truth (`clients.yaml`, `references/`, `memory/`, `decisions/`, per-client wikis), Claude Code skills, and an append-only decisions log. Roadmap is split by milestone; each milestone covers a coherent slice of operator-facing capability. Completed milestones are archived to `.planning/milestones/` to keep this file small.

## Milestones

- [x] **v1.0 — AIOS UI v0→v2 (Local Operator Command Center)** ✅ SHIPPED 2026-05-22 — see [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Phases 1-4: read-only nav + MRR; live sync + daily triage; capture + ritual launchers; bidirectional hub with brief-hydrated chat, staged ingestion to `raw/aios/`, Receipt feed, Pending Ingestion. 267 tests, 9,932 LOC added, 5 ADRs locked.

## Active Phases

No active phases — milestone v1.0 closed. Run `/gsd-new-milestone` to plan the next cycle.

## Phase Numbering

- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions
- Phase numbering does NOT reset across milestones — next phase is Phase 5

## Progress

Milestone v1.0: 4/4 phases complete, 100%.
