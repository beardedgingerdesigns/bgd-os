---
source: youtube-transcript
title: How to Keep Shipping When You Walk Away from Your Desk — Zack Proser, WorkOS
url: https://www.youtube.com/watch?v=so9l_MwS2yg
channel: AI Engineer (conference talk)
published: 2026-06-11
captured: 2026-06-12
transcript: archives/raw/2026-06-12-zack-proser-keep-shipping-aie-talk-transcript.txt
status: digested, not yet actioned
related:
  - docs/wiki/concepts/aios-second-brain-principles.md
  - docs/wiki/advisors/nate-herk/raw/research/2026-06-10-claude-fable-ultimate-second-brain.md
---

# Digest — Zack Proser, "How to Keep Shipping When You Walk Away from Your Desk"

Applied AI team at WorkOS. 25-min AI Engineer talk. One thesis, four layers, three gates.

## Core thesis

**Agents are no longer the bottleneck. Human attention is.** Agents scale infinitely and loop until criteria are met; human attention degrades under load and is now the hard constraint. "The tools are nuclear, our nervous systems are ancient." Simon Willison: fires up four parallel agents, wiped out by 11am. If you scale your output linearly with the new tools, the default path is burnout — "burnout turbo." Humans keep judgment, taste, and knowing-something-is-actually-solved; everything else should be structured to protect attention.

## The four-layer stack

### 1. Signal layer
Agents read your noisy channels (Slack, Linear) on a loop so you never open them yourself. Surfaces @mentions, DMs, genuinely high-priority asks; dedupes asks against existing tickets. Rationale: combing Slack yourself = 80% chance of getting pulled off task. The layer is a facade that protects focus. Advice: start by plugging in whichever channel is your highest-cost context switch.

### 2. Voice-first flows
Speaking at ~184 wpm vs ~90 wpm typing. Not just faster input — enables parallel prompting across multiple agent sessions ("they're running while a traditional developer is still typing their first prompt") and enables leaving the desk at all. Compounds over years. Q&A: 2-hour walk brain-dumps with voice mode, ending with "now make this a succinct transcript/architecture I can paste."

### 3. Remote control + the shower principle
Focus mode (IDE, executing a clear blueprint) vs diffuse mode (walk/shower, creative insight, fewer blind spots). Walking away used to mean stopping work; with remote control the Claude Code session keeps running on the dev machine and you steer it from your phone on LTE. Proposed day shape: morning deep-focus session loads the day's work into agents (backlog chores → one set of agents, the feature you care about → your main aperture), then leave the desk; review PRs from the phone; natural-language PR comments ("@claude this needs to change") are now reliable enough to direct work remotely.

### 4. System self-improvement (the skills-audit loop)
Claude Code saves every conversation locally as JSONL. Run a **scheduled weekly (or daily) agent pass over your own conversation history** hunting for:
- places with heavy thinking-token spend to get something right
- back-and-forth churn to eliminate ambiguity
- repeated friction and struggle

Then ask: **"What's the delta? What skill, MCP server, or tool would have made this one-shot? How do we tighten the loop so it doesn't happen next week?"** — and generate the missing skills. "Treat your sessions as gold — you're not trashing the context you build up while working; a single pass can reveal a ton of skills."

**Q&A refinement (JSONL hygiene):** raw JSONL is long and gross. Alternative: a session-end hook (trigger: session done / PR merged) distills "key bits + where we struggled + where we spent extra time" into a flat markdown store (Obsidian, weekly file, simple archive). Run the weekly analysis over the distilled store instead of raw JSONL.

## Verification gates ("speed requires safety")

- **Gate 1:** lint + build + unit tests via hooks — agents verify their own work at code level every time.
- **Gate 2:** agent verifies in the browser — click through, confirm login isn't broken (`--chrome` flag).
- **Gate 3:** constitutional — a second agent verifies the work against a constitution and feeds corrections back.

His opening story: gave Claude Slack read/write + Linear access, said "fix this and verify your own work, don't stop until verified." Came back to a completed, self-verified loop — no "this part's still broken" round-trip.

## Other notes

- **Oura ring via MCP:** body data in context; Claude pushes back "you didn't sleep last night, we're only doing part one today." Holistic view: work + tickets + skills + body condition. He overrides it, "but at least I thought about taking a break."
- **Night shift (Q&A):** cron jobs churn content overnight; he reviews in the morning and merges a small percentage. Target end-state: tickets for everything, tag `agent-ready`, a loop every 15 minutes day and night churning through them.
- **Early career (Q&A):** don't use AI to do what you don't know how to do already — battle scars are what let you catch hallucinations instantly. But use AI to "test me, where's my mental model murky" to go deeper faster.
- **Chunky cross-stack features (Q&A):** git worktrees so agents truly parallelize, agent teams with clearly defined prompts, verification gates + CI against a spec become even more important.

## Preliminary mapping to Justin's AIOS (to discuss — circle back)

1. **Signal layer ≈ `/scheduled-triage`.** Already built, for Gmail. Validates the architecture; extension candidates are whatever the next highest-cost context switch is (Google Chat? Discord?).
2. **The skills-audit loop is the big one.** The AIOS already holds "skills are never finished" (Nate) as a *manual* habit; Zack automates the feedback collection. Marriage candidate: a weekly JSONL/session-history mining pass that **feeds `/level-up` with evidence instead of recall** — today level-up interviews Justin's memory; this would hand it data on where sessions actually churned and which skills are missing. The repo already has `scripts/state-hook` (session-distillation infrastructure) and an open todo about PostToolUse STATE.md generation — the distilled-store variant from the Q&A is half-built here already.
3. **Verification gates map to existing practice:** codex-review = gate 3 (cross-model critic); Nate's "make it verify its own work" = gate 2. Worth making gates an explicit rule in skills that ship work product.
4. **Remote control + voice:** lifestyle-leverage for a parent of 3 — morning load-up, steer from the phone. Low build cost, mostly adoption.
5. **Night shift:** overnight research runs already proven (2026-05-28); the `agent-ready` ticket tag + recurring loop pattern maps cleanly onto `todos/pending.md` + the routines vision.
