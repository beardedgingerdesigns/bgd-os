# Loop Library (Forward Future) — capture

**Date:** 2026-06-21
**Source:** https://signals.forwardfuture.ai/loop-library/ (updated Jun 21 2026; 50 loops)
**Repo / skill:** https://github.com/Forward-Future/loop-library
**Why it matters here:** This is the *productized* version of the thing the [loop-engineering synthesis](research-loop-engineering-synthesis-2026-06-20.md) argued for — "stop writing prompts, design the thing that prompts." It's a public, categorized, copy-paste library of agent loops with the exact discipline that corpus said separates a real loop from a runaway: every entry ships a **check** and a **stopping condition**.

---

## What it is

A searchable catalog of 50 reusable agent prompts ("loops"), each one a short paragraph you paste into a coding agent. Self-described: *"Copy practical AI agent prompts with clear checks and stopping conditions."* Categorized: **Engineering / Evaluation / Operations / Content / Design**. Authors are named practitioners (Matthew Berman, Peter Steinberger, Donn Felker, Alex Burkhart, etc.).

It also ships as an installable agent skill:

```
npx skills add Forward-Future/loop-library --skill loop-library -g
```

The skill does four things, which is the actually-interesting part: **find** a loop for a task, **audit** an existing loop, **adapt** a loop to your repo, and **design** a new loop. That's a meta-loop — a loop for making loops — which is exactly the compounding/self-improving layer in the synthesis.

## The shared anatomy (the part worth internalizing)

Every loop on the page follows the same skeleton. This is the reusable template, more valuable than any single loop:

1. **Trigger** — when it runs ("whenever a docs pass is needed", "after changing a version").
2. **Action** — one bounded change per cycle, not a big-bang.
3. **Check** — a *verified* signal, often by an **independent** reviewer (separate Claude session / git worktree) that tries to break the fix, not confirm it.
4. **Stopping condition** — clean pass, OR progress stalls, OR a bounded retry limit, OR "if it returns for two rounds, stop and find what's regenerating it."
5. **Finish report** — what changed, evidence, what's left, attribution.

Plus a recurring safety rail: **"ask before production, sensitive data, or destructive actions."** That's the human-at-Orient node from the governance lens, written into the prompt itself.

This maps 1:1 onto the synthesis's framing — setpoint / verified feedback / damping, and goal → verifier → gate.

## Loops most relevant to Justin's stack

- **The docs sweep** (Berman) — review the whole codebase, fix stale docs, verify, open a PR. Direct analog to `/wrap` + wiki ingest, but as a scheduled overnight loop.
- **The propagation compliance loop** (Felker) — after one value changes (version, name, rule), find every stale copy and fix it; stop if a value keeps regenerating. This is the MRR-snapshot / pricing-restated-in-multiple-files problem the AIOS router test exists to catch.
- **The artifact-to-skill loop** (Burkhart) — extract the *method* behind a strong artifact, have an independent reviewer prove it on a fresh case, ship only if it generalizes. This is `/level-up` and `write-a-skill` formalized with a generalization gate.
- **The Loop Harness verification loop** — scheduled repo work (CI triage, dep updates, docs sync) in an isolated worktree, one session stages, a second session verifies, ship only on pass. The pattern behind a hardened scheduled-triage / Cowork routine.
- **The autonomy builder-reviewer loop** — builder and reviewer in separate worktrees, builder makes one bounded change with a red→green test, reviewer proves the test by mutating the fix; park protected/repeat-failure work for a human. This is the codex-review adversarial loop, generalized to execution.
- **The full product evaluation loop** — rebuild prod locally, inventory every surface, define acceptance criteria, log bugs with repro, fix by shared root cause, rerun. A real QA loop for client launches (Wild Rose, Thermal Kitchen).

Other categories worth a skim when the need arises: sub-50ms page-load loop, 100% test coverage loop, production error sweep, repository cleanup loop, SEO/GEO visibility loop, War Loops frontend reconstruction.

## So what — for the AIOS

1. **Install the skill and try its "design" mode** as the front-end to writing future scheduled routines, instead of hand-authoring prompts. It bakes in the check + stop discipline the corpus says is the failure point.
2. **Steal the anatomy as a house template.** Any new AIOS skill that runs unattended should declare trigger / action / check / stop / report explicitly — the propagation and loop-harness loops are good models.
3. **The propagation compliance loop is the missing enforcement for the router test.** Stale dated facts across `context/`, `state/`, memory, and CLAUDE.md are exactly its target.
4. **Validates the existing direction.** This is independent confirmation of the synthesis's core moves — queue-with-human-at-Orient, verified feedback, bounded retries, asset-per-cycle. Nothing here contradicts the corpus; it operationalizes it.

## Caveat

The library is a curated set of *prompts*, not a runtime. The loops are only as safe as their stopping conditions and the human gate — paste-and-walk-away on anything touching production or client data is the obvious foot-gun. Treat each as a starting template to adapt, which is what the skill's "audit/adapt" modes are for.
