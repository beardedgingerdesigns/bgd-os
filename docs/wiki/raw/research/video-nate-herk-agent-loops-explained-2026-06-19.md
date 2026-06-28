# Video capture — "Agent Loops Clearly Explained" (Nate Herk)

**Date ingested:** 2026-06-21
**Source:** https://www.youtube.com/watch?v=EuzYhzB0vbI (Nate Herk | AI Automation, 14:33, pub 2026-06-19)
**Why it matters:** Nate Herk is on Justin's [advisory board](../docs/wiki/advisors/). This is the grounded, *knowledge-worker* take on loop engineering — the counterweight to the maximalist [loop corpus](research-loop-engineering-synthesis-2026-06-20.md). It also demos directly from [Matthew Berman's Loop Library](loop-library-forward-future-2026-06-21.md), tying the two captures together.

---

## The definition (cleaner than the corpus's)

**Loop engineering = replacing yourself as the person who prompts the agent. You design the system that prompts instead.** A loop is a **recursive goal**: define a purpose, the AI iterates until complete.

Two load-bearing pillars (this is the "goal engineering" half Justin asked about):

1. **The goal** — the actual objective. Get it as **objective, not subjective** as possible.
2. **Verification** — how the agent knows the stop condition: how it checks and iterates.

Mechanically a loop is **trigger → action → stop condition**, run as **reason → act → observe, repeat** until the done-criteria is met. Mental model: *a smart intern you don't micromanage* — you hand them a goal, they figure out next steps, check their own work, iterate, and only come back when done.

## The core insight: verification is the point, not architecture

- Quality-vs-attempts curve: AI never one-shots. The human normally drives the feedback/iterate climb from 50% → 90%. **A loop outsources that climb to the agent**, so you land much higher on the first hand-back.
- **"Agent loops aren't for 100% perfect output — they get you much closer on the first try."**
- **Most tasks don't need a big agent architecture.** Nate builds loops for *most* of his tasks anyway — but only for the **verification**, usually as a single terminal session + a good prompt. Don't conflate "loop" with "fleet of 24/7 agents."

## Three ways to build a loop

1. **Solo loop** — one agent reasons/acts/observes/repeats. His most common. Fastest.
2. **Maker–checker** — one agent does the thing, a second grades it and gives feedback.
3. **Manager + helpers** — one orchestrator agent runs sub-agents.

## A loop is only as good as its done-check

Two questions **before** building any loop or goal:

1. **What does "done" mean?** Best: *"iterate until X metric = Y result."* Weak: *"until you're satisfied"* / *"until 100% confident"* (subjective — sometimes unavoidable, but minimize it). To harden a subjective check, spin up a **dedicated scorer sub-agent** and run it through evals so you trust its grades.
2. **How will it check?** The verification method depends on the artifact — a game checks visually + functionally + by playing levels; a script checks flow/tone, not pixels. **Your job is to give the agent the right tools to run those checks.** Always pair the done-criteria with a **hard stop** (e.g. "stop at avg ≥ 9, hard cap 8 passes") or it can run for 12h+ chasing an unreachable bar.

**What makes a loop actually work (his checklist):** checkable goal · hard stop · good tools · memory · separate checker · planning first · logging · cost that makes sense.

## The "does this apply to you?" caveat (important for Justin)

Steinberger/Cherny run fleets because they're hardcore coders shipping software daily — that doesn't auto-transfer. Nate uses Cloud Code 24/7 but for **knowledge work**, not constant codebase refactors, so he runs loops on a **cadence or event trigger**, not 24/7. Practical pattern: **shoot off a chunky loop before bed → wake to a 4–8h result → feed that output into more loops or iterate by hand.** Match loop ambition to the actual use case.

## How this lands for the AIOS

- This is the **operator-grade framing** to lean on when deciding whether a task deserves a loop: most don't need fleets, but most *do* benefit from an explicit **goal + verification + hard stop**.
- Reinforces the synthesis's goal→verifier→gate, but lowers the activation energy: a solo loop in one session is the default, not an exotic architecture.
- Direct line to the standing behavior Justin set (see memory `feedback_loop_goal_engineering_proactive`): when a task is iterative and checkable, frame it as a goal with a done-check before starting.
