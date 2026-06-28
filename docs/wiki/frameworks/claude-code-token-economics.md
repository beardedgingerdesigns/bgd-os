# Claude Code Token Economics — Max Plan Calibration

OS-level reference for budgeting large Claude Code runs (overnight research, multi-agent workflows) on Justin's Max subscription. Calibrated from the real BrandOS overnight research run on 2026-06-09.

## The numbers

- A full 5-hour session window ≈ **~2.7M total tokens** at a read-heavy multi-agent workload (measured: ~2.1M total tokens consumed 76% of a window).
- Total tokens ≈ **~6× output tokens** for research/audit agents that read many files and web pages. Output-token plans understate real consumption by that factor.
- The 2026-06-09 night: ~349k output / ~2.1M total across 30 agents in 3 workflow runs. Started at 24% of window, capped at 100%, spilled **$20.90** into extra usage.

## Rules learned

1. **Workflow `budget.spent()` counts OUTPUT tokens only.** The plan window drains on TOTAL tokens (input + cache misses). Budget in total tokens: planned output × 6.
2. **Extra usage enabled = hitting the cap bills the card instead of pausing.** Justin is fine with small *predicted* overages (he called the $20.90 "a good litmus test"), but spend should be forecast up front, not discovered on the bill. To make cap = pause: claude.ai → Settings → Usage → disable extra usage before the run.
3. **Launch big runs on a fresh window.** The first prompt of the evening starts the 5h clock. A ~150k-output session ≈ ~1M total ≈ ~1/3 of a fresh window.
4. **Workflow scripting gotchas:**
   - `budget.spent()` is cumulative across the conversation, not per-workflow. Snapshot `const START = budget.spent()` and guard on deltas, or guards misfire.
   - Pass Workflow `args` as a real JSON object, never a JSON-encoded string, or `args.X` is undefined and agents improvise output paths.
5. **No official per-window number exists.** Anthropic publishes only "5×/20× Pro" multiples. Treat 2.7M as a calibration that drifts when limits are tuned (they doubled session budgets in June 2026, temporarily).

## Sources

- BrandOS research brief + per-session ledger: `repos/brandos/reference/research-briefs/2026-06-09-overnight-research-brief.md`
- Pointered in BrandOS project auto-memory: `project_overnight-research-token-calibration.md`

Related: [[Agent resumption is the hidden token cost]] — resumes re-read the whole transcript, so batch fat rounds and spawn fresh agents per pipeline stage.
