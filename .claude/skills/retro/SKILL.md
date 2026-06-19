---
name: retro
description: Weekly session-mining pass. Extracts Justin's real messages from the week's Claude Code JSONL history across ALL project repos, fans out fresh analysis agents to hunt repetition patterns (same ask 3+ times = missing skill) and friction patterns (churn, corrections, manual relays, re-orientation), and writes a ranked candidate report to retros/ that feeds /level-up with evidence instead of recall. Use on Fridays before /level-up, or when Justin says "/retro", "run a retro", "what did I keep doing this week", "mine my sessions", "find my patterns". Origin: Zack Proser's self-improving-system loop (AI Engineer talk, digested 2026-06-12).
---

# Retro

Your sessions are gold — stop throwing them away. This skill mines a week of actual usage and answers: **what did Justin repeatedly do, struggle with, or hand-hold that a skill, rule, or hook should absorb?**

## Pipeline

### 1. Extract

```
python3 scripts/retro-extract.py 7 /tmp/retro
```

Pulls only Justin's real typed/dictated messages (no subagent sidechains, no tool noise, no system reminders) from `~/.claude/projects/*/`, grouped by session, chronological, into per-project corpus files. ~150MB of JSONL compacts to ~100KB. Adjust days_back if the last retro was more or less than a week ago (check `retros/` for the previous report date).

### 2. Fan out fresh analysis agents

One agent per major corpus (group small corpora into one agent). Fresh agents, parallel, never resumed. Each hunts four signal types and returns structured findings only:

- **REPETITION** — same kind of ask 3+ times. A repeated prompt is a missing skill.
- **FRICTION/CHURN** — corrections, re-explanations, the same instruction re-stated across sessions (should be a permanent rule).
- **MANUAL PROCESS** — work Justin does by hand outside the agent (relays, deploys, verification, copying between tools).
- **NAVIGATION/ROUTER FAILURES** — re-orienting the agent about where things live or where work left off.

Per pattern: name, type, count, 2-3 verbatim quotes with timestamps, proposed fix (one line), weekly cost (high/medium/low). Max 8 per agent, no padding. Plus TOTAL_MSGS_REVIEWED and a one-line GENERAL_SHAPE of the week. Warn agents that messages are often voice-dictated (transcription artifacts).

### 3. Synthesize

Merge agent findings. **Cross-project patterns rank highest** — the same pain in three repos is worth triple. Dedupe, re-rank by total weekly cost, and mark each with its fix type: skill / rule / hook / script / config.

### 4. Write the report

`retros/retro-YYYY-MM-DD.md`: ranked patterns with evidence counts, proposed fixes, the **#1 candidate for next /level-up** called out explicitly, week-shape summary per repo, and anything security-relevant found in transcripts (pasted secrets → flag for rotation immediately).

### 5. Hand off

Tell Justin the top 3-5 patterns and the #1 candidate. `/level-up` reads the latest `retros/` report as Phase 1 evidence. One retro = one report; shipping the fix belongs to `/level-up`, not here.

## Rules

- **Evidence over vibes.** Every pattern carries verbatim quotes and counts. No quote, no pattern.
- **Fresh agents per corpus** — never one long-lived reader (resumption re-reads the whole transcript; see references/claude-code-token-economics.md).
- **Don't pad.** A quiet week with 2 real patterns beats 8 invented ones.
- **Flag secrets.** Pasted tokens/keys in session history get a rotation flag at the top of the report.
- **Phase 2 (not yet built):** a session-end distillation hook writing "key bits + struggles" to a clean store, so retro reads distilled summaries instead of raw JSONL. Revisit once session-wrap automation ships.
