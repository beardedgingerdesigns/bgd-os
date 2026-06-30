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

## [2026-06-29] log | nightshift hardened + research sweep + ToneQuest Marker PRD

**Nightshift skill hardened (7 additions to `~/.claude/skills/nightshift/SKILL.md`):**
- `progress.md` — cross-issue sprint memory. Each agent reads + appends. Ephemeral per run.
- `fix_plan.md` — discovered work that isn't the current task. Auto-filed as GitHub issues after the loop.
- Health check between issues (step 4a) — run test suite cold before starting each issue. Abort if foundation is rotten.
- AIOS state signal (step 3) — writes "nightshift active" to `state/<slug>.md` at loop start so `/brief` knows a run is in flight.
- Wiki synthesis epilogue (step 7) — stages learnings from progress.md to project wiki `raw/aios/` if worth keeping.
- Auto-file discovered work (step 6) — reads fix_plan.md, creates GitHub issues labeled `ready-for-agent`.
- Dynamic dependency re-evaluation — fixed bug where the loop resolved blockers once at start. Now re-evaluates after each issue completes so newly unblocked issues enter the queue.

**Retro skill updated (`claude-os/.claude/skills/retro/SKILL.md`):**
- Added HARNESS FAILURE as 5th signal type — agent needed human help because repo lacked context/guardrails. Fix type: encode into repo (CLAUDE.md rule, structural test, lint rule, CONTEXT.md term).
- Added Garbage Collection section in report — quick-apply harness fixes, distinct from `/level-up` candidates. Origin: Ryan Lopopolo's "Garbage Collection Day" at OpenAI.

**Research sweep (6 sources scraped and evaluated):**
- Matt Pocock — Ralph Wiggum video: progress.txt pattern (applied), human-in-the-loop variant, PRD-as-checklist.
- Austin Marchese — BUILD framework: beginner-level, nothing applicable. 3-bucket improvement loop interesting but already covered by retro+level-up.
- Boris Cherny (Claude Code creator) — practical tips talk: beginner-level for Justin's setup. Notable quote: "by end of year, people aren't using IDEs anymore."
- Ryan Lopopolo (OpenAI) — Harness Engineering keynote: Garbage Collection Day (applied to retro), structural tests concept (new guardrail type), "every continue is a harness failure" framing, non-functional requirements per-expertise.
- Geoffrey Huntley — "Everything is a Ralph loop": philosophy/manifesto, reverse-mode concept (audit loops). No skill changes.
- Kun Chen (L8 Principal) — risk-tiered PR review, First Mate pattern (future nightshift evolution), skills can hurt agents warning, token/iteration caps.
- Anthropic — Effective harnesses for long-running agents: initializer+coding agent pattern, feature list as JSON with passes flag, start-of-session health check (applied), progress file (applied).

**ToneQuest Marker integration:**
- Grilled Marker (VikParuchuri/marker) as replacement for ToneQuest's PyPDF2 text extraction. Conclusion: replace Stage 0 (preprocessing), not the whole pipeline. Claude shifts from vision-interpreting images to converting markdown → structured HTML.
- 10 design decisions locked via `/grill-me`.
- PRD posted: beardedgingerdesigns/toneuqest#2.
- 8 vertical-slice issues filed (#3-#10) via `/to-issues`. #3 (marker_extract.py) starts immediately. #4 (spike) is the quality gate.
- Setup Matt Pocock skills on ToneQuest repo (labels, docs/agents/, CLAUDE.md updated).

## [2026-06-29] ingest | BrandOS sequencing shift, Revolution re-engaged, Wild Rose QA

**Processed 8 raw/aios/ drops (2026-06-24 through 2026-06-29). 3 promoted, 5 skipped (already curated).**

**Revolution Drones** (`clients/revolution-drones-project.md`):
- Status updated from dormant (2026-05-02) to re-engaged (2026-06-29). Justin emailed Russell to restart manufacturer website. Jon nudging Russell same day. Now the near-term BrandOS manufacturer-tier entry point.

**Terraplex** (`clients/terraplex-platform.md`):
- Added "Relationship dynamics" section: investment freeze from Jon (2026-06-29), Cherity cost anxiety, engagement model update. Pricing conversation on ice.
- Productized checklist: pricing tiers and participation fee marked as frozen.

**Wild Rose** (`clients/wild-rose-project.md`):
- Added pre-launch QA section (2026-06-25 drop): July 13 launch confirmed, QA week of 7/7, HR printable app, SEO mapping, URL stability, Indeed integration.

**Skipped:**
- `2026-06-28-session-wrap-0900` — already curated in [2026-06-28] log entry.
- `2026-06-26-tonequest-checkin` — already curated into ToneQuest wiki page (status updated 2026-06-26).
- `2026-06-26-thermal-kitchen-launch` — already curated into TK timeline in [2026-06-28] log entry.
- `2026-06-25-session-wrap-0840` and `0910` — AIOS UI internals, already in [2026-06-28] log entry.
- `2026-06-24-refuge-sales-kickoff` — already curated into `clients/refuge-sales-project.md` in [2026-06-25] ingest.

**Other:**
- Fixed `.planning/STATE.md` — v2 progress stuck at 83% (5/6 phases). Updated to 100% (6/6) so statusline progress bar disappears.
