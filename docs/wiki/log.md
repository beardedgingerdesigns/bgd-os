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

## [2026-06-28] log | day/night shift workflow research

- **Created**: `insights/day-night-shift-workflow.md` — feature development workflow modeled on Matt Pocock's video. Day shift (grill → PRD → issues), night shift (AFK agent loop pulls issues), next day (QA + bug filing). Retires `/ship`, `ce-brainstorm`, `ce-plan`, `ce-work`. Keeps CE back half (code-review, compound, simplify, debug). AFK runner is the missing build piece.
- **Updated**: `index.md` — added insights entry.

## [2026-06-28] log | full session wrap — v2.0 shipped, day/night shift workflow designed

Major session covering infrastructure fixes, milestone close, and operational research.

**Infrastructure:**
- AIOS UI chat: fixed date awareness (system clock with day name), added midnight session expiry with queued message carry-through.
- Wiki: fixed WIKI-CLAUDE.md "inbox" → "source archive", fixed 2 broken skill references in wiki-ingest pipeline (`/ingest-aios-drops` → `/wiki ingest`, `/llm-wiki` → `/wiki ingest`).
- CLAUDE.md: split staged ingestion rule (remote wikis stage to `raw/aios/`, claude-os writes directly).
- Curated 3 client pages: Wild Rose (launch → July 13), Thermal Kitchen (launch → Mon 7/6), ToneQuest (meetings → Wed, website replaces Mailchimp).

**Milestone v2.0:**
- Audited via `/gsd-audit-milestone` (24/31 requirements, 2 blockers found and fixed).
- Completed via `/gsd-complete-milestone` — archived to `.planning/milestones/`, tagged `v2.0`, pushed.

**Day/night shift workflow (operational research):**
- Researched Matt Pocock's feature-building process from video + skills repo.
- Designed 3 new skills: `/nightshift` (AFK agent loop), `/dev-feedback` (in-app bug button), updated `/wrap` (review before compound, claude-os writes directly).
- 5-round Codex adversarial review converged the design: timestamped branches, checkpoint resets, close-after-push, `execFileSync`, server-only API gate.
- Installed Matt's skills globally (35 skills to `~/.claude/skills/`). Key additions: `grilling`, `domain-modeling`, `codebase-design`, `to-prd`, `to-issues`, `prototype`, `qa`, `implement`.
- Updated `grill-me` to Matt's latest (delegates to `/grilling`).
