---
source_url: https://www.youtube.com/watch?v=bygXK_9MYk0
source_title: "Claude Fable 5 Makes New Things Possible"
source_channel: BridgeMind (bridgemind.ai)
published: 2026-06-10
fetched: 2026-06-10
query: What BridgeMind says about Fable 5 "one-shotting" and building his BridgeAgent app
status: staged
---

# BridgeMind on Fable 5: one-shotting + building BridgeAgent

15:51 video, published 2026-06-10 (day after Fable 5 release). Creator runs BridgeMind, a vibe-coding tool suite (BridgeSpace, BridgeVoice, BridgeMemory, BridgeAgent). Claims 700M tokens spent in one day across three $200 Claude Max subscriptions; canceled his $200/mo ChatGPT Pro plan after the comparison.

## TL;DR

Fable 5's signature behavior per this creator: **complete one-shots of tasks that previously took multiple attempts or failed entirely** — a full playable horror game, backend features, and a 2-month-old bug that Opus 4.8, Opus 4.7 Max, and GPT 5.5 Extra High all failed on. He built the entire BridgeAgent MVP (a self-improving autonomous software-dev agent) with it. Caveats: ~2x Opus cost, usage limits evaporate fast (sub-agents are the main culprit), and frontend/design ability did NOT leap the way backend did.

## What he means by "one-shotting"

- **Bridge Horror House**: fully playable 3D horror game (keys, doors, flashlight/battery mechanic, light-sensitive ghost AI, escape objective) one-shot live on stream. His claim: never seen AI output a game at this level in one pass.
- **Backend features one-shot by default**: a voice transcription feature for BridgeAgent worked first try — "I didn't have to two-shot this, didn't have to three-shot this."
- **The bug proof point**: a 2-month-old BridgeVoice push-to-talk/widget-styling bug he'd thrown at GPT 5.5 Extra High, Opus 4.7 Max, and Opus 4.8 Max without success. Fable 5 read the diagnostics file, found it, fixed it — one shot.
- **Broad prompts work**: his workflow shifted to broader, intent-level prompts ("review all integrations and improve the agent's skills") because the model fills in the decomposition itself.
- **The asymmetry**: the leap is in *backend* capability. Design output is "not necessarily AI slop, but definitely not incredibly unique" — front-end/design did not improve proportionally. He calls the BridgeAgent marketing site "pretty much like the Apple website" but generic.

## BridgeAgent — what he built with Fable 5

- **What it is**: a specialized autonomous software-development agent (positioned against "Hermes Agent," which is general-purpose). Goal: an agent that builds software autonomously and improves with every task. Waitlist live at bridgeagent.app.
- **Built with Fable 5**: the complete MVP from scratch, plus the marketing site (including a correctly configured Cloudflare Turnstile on the request-access form).
- **Core concepts in the MVP**:
  - **Responsibilities** — assignable units of ongoing duty (e.g., "DDoS protection"). AI can author them, or you pick from a library.
  - **Integrations** — GitHub, Sentry, Cloudflare, AWS. A responsibility activates only once its integrations are connected.
  - **Self-improvement loop** — connected integrations + responsibilities = "a recursive, self-improving agent that works as a software developer for you."
  - **Per-integration skills** — he prompts Fable 5 to build a dedicated skill per integration so the agent operates each surface well.

## Benchmarks he cites

| Benchmark | Fable 5 | Comparison |
|---|---|---|
| SWE-Bench Pro | 80.3 | Opus 4.8: 69.2 |
| Frontier code | 29.3 | Opus 4.8: 13.4 |
| CursorBench | 72.9 | GPT 5.5: 64.3; Opus 4.7 Max: 64.8 |
| Artificial Analysis coding | 62 | Opus 4.8: 56.7 |

He frames these as the largest single-generation jump he's tracked, and the moment Claude passed GPT on coding across boards.

## Usage economics + practical tips (his numbers)

- **API price**: $10/M input, $50/M output — 2x Opus 4.8 (but below the rumored $25/$125).
- **He burned a $200 Max plan's limit in under 30 minutes**; a viral X post (735K views) suggests this is widespread.
- **Tips**: run effort at high/extra-high, not max (max is overkill and slow); **explicitly prompt against launching sub-agents** — one security-audit prompt spawned five Explore sub-agents and pushed usage from 10% to 31% across four agents.
- **June 22 deadline**: Fable 5 is included in Pro/Max/Team plans only through 2026-06-22, then moves to usage credits (effectively API pricing). Anthropic's blog says they aim to restore it to subscriptions "when sufficient capacity allows."

## Relevance to Justin / AIOS

1. **Token economics doc is directly affected.** `references/` just got a Claude Code token-economics calibration from the 2026-06-09 overnight run. This creator's numbers (sub-agent multiplication, effort-level guidance, <30min to cap a $200 Max plan) are corroborating field data — and the **June 22 subscription cutoff** is a date that should be on the radar for any overnight-run planning.
2. **BridgeAgent's shape rhymes with the AIOS dispatcher vision.** Responsibilities (standing duties) + per-integration skills + staged self-improvement is close to the "routines over manual triggers" direction already recorded for AIOS. Worth a skim of bridgeagent.app before the next `/level-up`.
3. **One-shot asymmetry matters for BGD delivery.** Backend one-shots = faster automation builds for the AI services line. Design still needs Justin's eye — which is the BGD differentiation anyway (designer eye is the niche; the models aren't taking that yet).

## Caveats on the source

Creator monetizes the vibe-coding ecosystem he's reviewing within (Discord, courses, Product Hunt launches), and the video doubles as a BridgeAgent waitlist funnel. Benchmark figures are read off third-party dashboards on stream, not independently verified here. Treat capability claims as enthusiastic-practitioner anecdotes, not measurements.
