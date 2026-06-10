# Claude Code token economics — Max plan calibration

OS-level reference for budgeting big Claude Code runs (overnight research, multi-agent workflows) on Justin's Max subscription. Calibrated from the real BrandOS overnight research run, 2026-06-09.

## The numbers

- A full 5-hour session window ≈ **~2.7M total tokens** at a read-heavy multi-agent workload. (Measured: ~2.1M total tokens consumed 76% of a window.)
- Total tokens ≈ **~6x output tokens** for research/audit agents that read lots of files and web pages. Output-token plans understate real consumption by that factor.
- The 2026-06-09 night: ~349k output / ~2.1M total across 30 agents in 3 workflow runs. Started at 24% of window, capped 100%, spilled **$20.90** into extra usage.

## Rules learned

1. **Workflow `budget.spent()` counts OUTPUT tokens only.** The plan window drains on TOTAL tokens (input + cache misses). Budget runs in total tokens: planned output × 6.
2. **Extra usage enabled = hitting the cap bills the card instead of pausing.** Justin is fine with small *predicted* overages (called the $20.90 "a good litmus test") but spend gets forecast up front, not discovered on the bill. To make cap = pause: claude.ai → Settings → Usage, disable extra usage before the run.
3. **Launch big runs on a fresh window.** First prompt of the evening starts the 5h clock. A ~150k-output session ≈ ~1M total ≈ ~1/3 of a fresh window.
4. **Workflow scripting gotchas:** `budget.spent()` is cumulative across the conversation, not per-workflow — snapshot `const START = budget.spent()` and guard on deltas, or guards misfire. Pass Workflow `args` as a real JSON object, never a JSON-encoded string, or `args.X` is undefined and agents improvise output paths.
5. Anthropic publishes no official token-per-window number — limits are "5x/20x Pro" multiples. Treat the 2.7M figure as a calibration that drifts when Anthropic tunes limits (they doubled session budgets June 2026, temporarily).

## Source

- BrandOS research brief + per-session ledger: `repos/brandos/reference/research-briefs/2026-06-09-overnight-research-brief.md`
- Same calibration is pointered in BrandOS project auto-memory (`project_overnight-research-token-calibration.md`).
