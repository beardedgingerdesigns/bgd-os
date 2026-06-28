# Log

Append-only chronological record of wiki activity. Newest at the bottom.

Format: `## [YYYY-MM-DD] <op> | <subject>` followed by a short note.

## [2026-06-25] init | AIOS wiki scaffolded

Wiki created at `docs/wiki/`. 67 raw files ingested into 13+ curated pages across identity/, strategy/, research/, frameworks/, clients/, insights/, advisors/, concepts/.

## [2026-06-25] ingest | dispatch routing — Wild Rose, Refuge Sales, Osmani paper

Ingested 3 files staged by `/dispatch` from `/gemini-sweep` + inbox processing:

- **Updated**: `clients/wild-rose-project.md` — added Meghan Wymore and Katrina Williams to stakeholders table. Source: `raw/aios/2026-06-25-wild-rose-redesign-pre-launch-qa.md`.
- **Created**: `clients/refuge-sales-project.md` — new client brief for Thomas Rindfuss / Agrilogix water tech distributor. Source: `raw/aios/2026-06-24-refuge-sales-kickoff.md`.
- **Skipped**: `raw/research/2026-06-25-new-sdlc-vibe-coding-osmani.md` — `research/new-sdlc-vibe-coding.md` already exists and is curated. Routing stub is redundant.
- **Updated**: `index.md` — added Refuge Sales client entry.

## [2026-06-28] log | v2.0 milestone closed + client updates + wiki governance fix

**Milestone v2.0 shipped.** 6 phases, 15 plans, 24 days (2026-06-04 → 2026-06-28). Session state hooks, persistent todos, wiki filtering, scheduled triage, prospect pipeline, UI dispatcher cleanup. Tagged `v2.0`, archived to `.planning/milestones/`.

- **Updated**: `clients/wild-rose-project.md` — launch date → July 13, QA week of 7/7, HR printable app request, 3 bugs to fix before QA. Source: `raw/aios/2026-06-25-wild-rose-redesign-pre-launch-qa.md`.
- **Updated**: `clients/thermal-kitchen-project-plan.md` — launch date → Mon 7/6, social promos Wed 7/8, 98% complete, 7/1 review meeting. Source: `raw/aios/2026-06-26-thermal-kitchen-launch-confirmed.md`.
- **Updated**: `clients/tonequest-project.md` — meetings moved to Wed, website replaces Mailchimp as delivery channel, archive engine testing in year-clusters, Pelcro international subscriber issues. Source: `raw/aios/2026-06-26-tonequest-checkin.md`.
- **Fixed**: `WIKI-CLAUDE.md` — changed "inbox" language to "read-only source archive" for `raw/`. Was the only wiki using "inbox" framing; all project wikis and the template say "immutable/read-only." The mismatch caused a raw/ file deletion incident this session.
