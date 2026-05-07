---
name: Bootstrap component-library research cache
routineId: trig_01HHCdoRM8XStgzeuttgyu2o
schedule:
  runOnceAt: "2026-05-01T05:35:00Z"
  human: "One-shot fired 2026-05-01 00:35 America/Chicago. Reusable as a seed job for a new spoke hub."
enabled: false
model: claude-opus-4-7
repo: https://github.com/beardedgingerdesigns/terraplex-site-builder
connectors:
  - Gmail
  - Google-Calendar
  - Google-Drive
status: fired
notes: |
  Seed job that pre-populated the component-library research cache from existing dealers' design.md
  files BEFORE the recurring curator pass took over. Useful as a template the next time we
  bootstrap a new component library — adjust the dealer list, archetype slugs, and section names
  for the new domain.
---

You're bootstrapping a new component-library cache from the existing dealers' design.md files. This is a one-time seed job. Today's date is 2026-05-01.

## Step 1 — Read the schema

First, read `hubs/terraplex/component-library/README.md` end-to-end. The frontmatter schema, body sections, library-worthy criteria, and filename conventions are all there. Your output must follow it exactly.

## Step 2 — Read source material per dealer

For each of these six dealers under `sites/`, read `sites/<slug>/design.md` and `sites/<slug>/_archetype.md`:

- prairie-aerial (archetype: field)
- pyro-ag (archetype: forge)
- black-knight (archetype: tactical)
- great-river (archetype: clean)
- new-heights (archetype: terrain)
- longhorn-aerial (archetype: patriot)

## Step 3 — Extract design moves into research notes

For each distinct, library-worthy design move you find applicable to one of these sections (hero, product-block, services, contact), write a research note to `hubs/terraplex/component-library/<section>/research/`.

**Filename:** `seed-<dealer-slug>-<short-slug>.md` (since these are extracted from production, not Refero).

**Frontmatter deviations from the README schema (because there's no Refero source):**
- `referoScreenId: null`
- `referoUrl: null`
- All other fields per README — `applicableArchetypes`, `incompatibleArchetypes`, `savedFor: <dealer-slug>`, `savedAt: 2026-05-01`, `tags: [...]`

**applicableArchetypes:** Always include the source dealer's archetype. If you can articulate plausible adaptation for sibling archetypes (e.g., a FIELD warm-photo hero might inform a CLEAN dealer with palette adjustments), add those too AND write a clear adaptation note in the body's "Adaptation notes (cross-archetype)" section explaining how to translate it. Do not add archetypes if you can't articulate the adaptation.

**incompatibleArchetypes:** Fill in archetypes whose anti-patterns this clearly violates. Be specific in the body. Example: a no-video photographic hero is incompatible with TACTICAL/FORGE because their archetype rules require full-bleed video.

**Body language:** Write `What to take` archetype-neutrally so future dealers of any archetype can adapt the move. Avoid dealer-specific or archetype-specific phrasing in `What to take` — that's what `Adaptation notes` is for.

## Step 4 — Library-worthy criteria (gate)

Skip moves that don't meet ALL of these:
- Specific, transferable design move (a layout pattern, typography pairing, or interaction) — not 'looks nice' or 'use a CTA'
- Articulable in archetype-neutral terms
- Not a near-duplicate of an entry you already wrote for this section (across dealers)

**Target volume:** 2–4 notes per dealer across hero/services/product-block. Contact is optional — only include if the dealer's design.md says something distinctive about it.

## Step 5 — Commit

After writing all notes, create a feature branch:

```
git checkout -b chore/bootstrap-component-library
```

Stage only the files you wrote (do not `git add -A`):

```
git add hubs/terraplex/component-library/
```

Commit with message:

```
chore(component-library): bootstrap research-note cache from existing dealers
```

Push the branch and open a PR against `main` titled `Bootstrap component-library research cache` with a summary that lists how many notes were written per section (hero / product-block / services / contact). Use `gh pr create`.

## Step 6 — Final report

When done, report:
- Per-section count: hero=N, product-block=N, services=N, contact=N
- Per-dealer count: prairie-aerial=N, pyro-ag=N, black-knight=N, great-river=N, new-heights=N, longhorn-aerial=N
- Any dealers/sections you skipped and why (e.g., 'longhorn-aerial design.md doesn't specify a distinctive product-block treatment')
- The PR URL
