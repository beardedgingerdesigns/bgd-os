---
name: load-project
description: "DEPRECATED -- previously used when Justin says /load {project}, load the {project} project, switch to {project}, give me everything on {project}, hydrate {project} context, or any variant of I'm working on {X} now bring me up to speed. Now prints a deprecation notice directing the operator to the project wiki."
bike-method-phase: retired
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## This skill is deprecated

`/load-project` was retired as of 2026-06-04. Project wikis are now self-sufficient.

### What to do instead

1. **Open the project repo directly:** `cd ~/repos/<project-slug>/`
2. **Claude Code reads context automatically.** The project's `CLAUDE.md` and `docs/wiki/WIKI-CLAUDE.md` are picked up without any manual load step.
3. **The wiki contains everything.** All decisions, state, and context that `/load-project` used to hydrate now lives in the project's own wiki. The Phase 5 SessionEnd hook auto-generates `STATE.md` after every session.

### Why this changed

The llm-wiki pattern makes each project's wiki the canonical knowledge home. Every project repo now has its own `docs/wiki/` with decisions, log entries, and context that Claude reads natively when you open the repo. The Phase 5 `state-session-end.js` hook auto-generates a `STATE.md` summary after every session, so project state persists without needing to hydrate from claude-os.

Loading context into the AIOS session is no longer necessary. Work happens in project repos, not from claude-os.

### Cross-project status

If you need a view across all projects, use `/weekly-project-status` instead. It synthesizes status from all registered projects without requiring per-project loads.

---

> *Adapted from The Three Ms of AI™. (c) 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
