---
source: youtube-transcript
advisor: nate-herk
captured: 2026-06-10
status: ingested
ingested_date: 2026-06-10
title: I Turned Claude Fable Into The Ultimate Second Brain
url: https://www.youtube.com/watch?v=8QQ_INxAhRs
channel: Nate Herk | AI Automation
published: 2026-06-09
ingest_target: docs/wiki/advisors/nate-herk/knowledge/
synthesized_to:
  - docs/wiki/concepts/aios-second-brain-principles.md  # general/tool-agnostic principles (primary output of this ingest)
related_knowledge:
  - knowledge/four-cs-aios-architecture.md
  - knowledge/llm-wiki-and-knowledge-systems.md
  - knowledge/three-ms-framework.md
---

# Digest — "I Turned Claude Fable Into The Ultimate Second Brain"

Raw source digest, ready for ingestion into the Nate Herk advisor knowledge base.
This is the most complete walkthrough Nate has published of how his actual AIOS
("Herk 2") is laid out and operated day to day. It restates the Four Cs and ties
them to concrete folder/file practice plus a set of usage tips.

## Framing note (read first)

Nate frames the video around "Claude Fable," which he describes as a just-dropped
Anthropic model — a variant of "Claude Mythos 5" with extra cyber guardrails baked
in, two times the price of Opus ($10/M input, $50/M output), subscription-available
only June 9–22 then moving to usage credits. Treat the model name and pricing as
the video's topical hook, not the takeaway. The model is "the engine"; everything
durable in the video is about the **system** (the second brain + AIOS), which is
tool- and model-agnostic. That distinction is itself one of his core points.

## Core thesis

Your second brain and your AIOS are just **folders, markdown files, skills, and
routing logic** — not a product tied to any one model or harness. Build the system;
swap the engine (Claude Code, Codex, Sonnet, an open-source model) whenever you want.
"You're not building a Claude Code AIOS. You're building your own personal operating
system."

## The two layers

Nate splits the stack into two distinct layers:

1. **Second brain** = your knowledge. Does the system actually know what's going on
   in your business, your life, your clients, your channel — and can you ask it
   questions and get a teammate-quality answer? You cannot have an AIOS without this.
2. **AIOS** = the operating layer built on top of the second brain — skills, agents,
   automations, pipelines. The place you *work from* instead of macOS/Windows.

## The Four Cs (build in order)

The framework for building and maintaining the AIOS. First two Cs = the second brain.
Last two Cs = the AIOS proper.

### 1. Context — "who you are"
- Static knowledge: background, processes, goals, 2025 progress, meeting transcripts.
- The `CLAUDE.md` file is a **router / routing tree**, not a dumping ground. It mostly
  *points* the agent to where files live — rules, references, skills, other projects,
  wikis — plus a bit of goal/role/process context.
- He gives the agent: the exact wiki path, the **hot cache**, the **master index**,
  and the method for crawling the knowledge base. Then tools, API keys, where skills
  live, how skills are structured, what's active and when to use what.
- **Architecture engineering** is an emerging discipline alongside context/prompt/
  harness engineering. There's no single right answer.
- **Pulse check for "too much context":** Is it intuitive to *you*? Could you manually
  drill through the folders and find what you need — and can the agent? If the agent
  searches 5+ minutes for a file you know the location of, the architecture needs work.
  Wasted tokens / long searches are the signal, not file count.
- His main `Herk 2` repo opens at only ~40k tokens via `/context` (mostly system
  tools), despite holding very large nested projects.

### 2. Connections — "live data"
- The difference from Context is **static vs constantly-changing** data. Connections
  reach out for live data: ClickUp messages, emails, QuickBooks P&L, Stripe, etc.
- **Tier-one heuristic for what to connect first:** On a weekly basis, what apps do
  you open? What Chrome bookmarks? Where do you text/talk to people (internal +
  external)? Those high-frequency reaches are highest priority.
- Buckets to map: revenue, customers, calendar, comms, tasks/project management,
  meetings, knowledge. Note that one app can span multiple buckets (e.g. Skool =
  revenue + customers; Google Workspace = calendar + comms).
- **Preferred connection method: CLIs and APIs over MCP servers** — more control,
  generally cheaper. MCP is fine if you prefer it.
- **No database needed to start.** He runs on markdown files using Karpathy's LLM
  wiki pattern with Obsidian.
- **Gut check for whether your second brain is real:** Ask Claude something about you
  and your business. Does the answer sound like a *stranger* or like a *co-founder*?

### 3. Capabilities — "what can it actually do"
- Skills, workflows, automations built on top of context + connections. This is
  where you cross into AIOS territory.
- **Adoption is the hard part.** Default to *doing the task inside the AIOS* (open VS
  Code / Claude Code) instead of opening a Chrome tab to send the email or pull the
  report. Stop using it only for brainstorming/scripts — use it to *do things*.
- **Skills don't have to be big.** A repeated prompt is a skill. If you write the same
  prompt every Monday morning or Friday evening, turn it into a skill.
- **Skills are never finished.** Every use is data: "here's what I liked, here's what
  I didn't, update the skill, run again." He has ~20 project skills plus global skills
  and iterates on every one each time he uses it — even a 4-month-old image-gen skill.
- **Assembly-line / specialized-agent mindset:** one AI doing one thing really well.
  Work in phases — research in one session, `/clear`, feed that output into a drafting
  session, then a polishing session — to avoid context rot from doing everything in
  one blurred session. Skills inject subject-matter expertise into any session instantly.
- **Delegation for parallel work:** with an expensive model, delegate parallel tasks
  to cheaper workers (Sonnet, Haiku) and get one clean summary back.

### 4. Cadence — "runs while you sleep"
- The final C, and **you have to earn it.** Skills must be battle-tested first.
- As you add autonomy, **cost, risk, and maintenance all go up.** Automating something
  doesn't mean forgetting it — you still need visibility, check-ins, and an owner.
- **Triggers:** manual (you ask), event (new email / new booked call), or schedule
  (every Monday, every Sunday night).
- **Deploy options:** Claude Code routines, loops, deterministic scripts on Modal or
  TypeScript, or have your Cloud Code OS build an n8n automation and push it to n8n.

## The permission-layer lesson (the most important safety point)

- **"A prompt is never a permission layer."** Assume: *if it can, it will.* If the
  agent can send an email, it might. If it can read a database, it will.
- War story: an agent proactively pulled a task from a list, misinterpreted it, wrote
  a discount code, and emailed it to ~150–200k subscribers. Forced a public apology.
- Fix: **keys, not prompts.** Use scoped API keys so the agent literally cannot enter
  the room. Example: a key that can only *read* meeting transcripts — can't edit,
  delete, or touch the team.
- Reframe failures as data: "fix the instruction, it never happens again." They turned
  the incident into a team case study, not a blame exercise.

## Usage tips

1. **Treat it as a thought partner — with a grain of salt.** Brainstorm, have it play
   devil's advocate (and you play it back). Spin up multiple sub-agents / agent teams
   to debate and surface different perspectives, then decide with your gut. Watch for
   sycophancy — models tend to please and say yes.
2. **Have it interview you ("grill me" skill).** Originally Matt Pocock's skill, adapted
   to write brainstorm docs into a `brainstorm/` folder. It asks 15–30 questions to
   extract knowledge from your head into the AIOS. He used it to plan this very video.
   You can literally tell a fresh AIOS: "Use grill me to figure out everything about
   my business."
3. **Make it verify its own work.** Add explicit verification to prompts ("use a dynamic
   workflow to verify everything is accurate"). Have it open a Playwright browser and
   click around, or check from multiple personas (beginner, software engineer, business
   owner). Verification moves first-pass output from ~70% → ~92% of the way there, so
   you trust outputs more.
4. **Keep it tool-agnostic.** He maintains `CLAUDE.md`, `codex.md`, `AGENTS.md`,
   `claude.md` etc. so any coding agent can use the same folders/files. Switching models
   shouldn't mean rebuilding — "it's folders and files."

## Concrete architecture details from his setup ("Herk 2")

- **"Other worlds" folder:** other Claude Code projects (book project, website, video
  editing, token dashboard) moved *into* the main repo instead of separate repos.
  Reasons: (a) **syncing** — one `git push` to GitHub carries everything to his laptop;
  (b) the main OS now has context into all those projects and can `cd` around to reach
  them.
- **Projects folder:** new work = a new folder under `projects/` (e.g. YouTube videos),
  with deep nested drill-downs.
- **Demonstrated outputs (one-shot `/goal` prompts on the new model):**
  - A "who am I" explainer video generated from project knowledge in a single prompt
    (caught a stale static stat — listed ~620k subscribers vs ~800k actual — illustrating
    that static data goes stale and must be refreshed via live connections).
  - A clickable relationship-map interface (~21 min) linking ideas, tools/harnesses,
    and techniques across all his YouTube transcripts, with persona-based entry points
    ("I'm new," "I build things," "I run a business").

## Lightning-round Q&A

- **Cost to run all day?** On the $200/mo plan; mostly knowledge work, rarely hits the
  5-hour limit (occasionally the weekly session limit). Note he separately warns the
  "Fable" model burns sessions far faster than Opus.
- **Where does data go?** Closed-source Claude models → Anthropic. Don't use closed
  models for highly sensitive data.
- **Need to code?** No. Day one, empty folder — clone his AIOS GitHub repo (in his free
  Skool community) and you're running in a day.
- **When it confidently gets something wrong?** Check the work; the moment it errs, say
  "update your CLAUDE.md / update the skills so this never happens again," and always
  demand the exact source for any data.
- **How do live connections work?** APIs/CLIs. Search "<tool> API documentation," hand
  it to Claude Code (or have it research), give it the endpoints. Use scoped API keys
  for least privilege.
- **Ignore it for weeks?** Probably fine — just re-sync / pull fresh data.
- **Team — does everyone build their own?** Yes, but *you* learn it first so you can
  teach it. Share team-wide skills; decide where shared, read-only team knowledge lives
  (ClickUp / Slack / Notion / Drive). Biggest risk = duplicated knowledge/skills/work.
  **Adoption is the #1 challenge** — which is why you must learn the tech first and be
  able to explain it.

## Actionable takeaways for Justin's AIOS

- The Four Cs here map directly onto the existing `four-cs-aios-architecture.md` and the
  AIOS itself — this video is a richer, more operational restatement worth merging in.
- **Treat `CLAUDE.md` as a router**, not a content store. Justin's already trends this
  way; the "pulse check" (could *I* find the file manually, and does the agent find it
  fast?) is a clean heuristic to adopt for `references/` vs project-wiki graduation calls.
- **"Other worlds" pattern** is directly relevant to the multi-repo project-wiki setup
  (claude-os + per-project `repos/<slug>/`): consider whether frequently-touched repos
  should be reachable from one root for sync + cross-project context.
- **Keys, not prompts** is a hard rule to bake into `connections.md` before wiring any
  write-capable connection (Gmail is currently draft-only — good; keep that posture and
  use scoped keys as more connections come online).
- **"Grill me" skill** (Matt Pocock origin) is worth building — pairs naturally with the
  existing `/level-up` weekly interview and the brainstorm/ workflow Justin already uses.
- **Skills-are-never-finished + assembly-line phases** reinforce the per-skill feedback
  loop and phase-chaining already implied by the GSD planning system.
- **Tool-agnostic file layout** (CLAUDE.md + AGENTS.md + codex.md) is a cheap hedge worth
  adopting so the AIOS survives a harness switch.

## Open questions / things to verify before ingesting to knowledge/

- "Claude Fable" / "Claude Mythos 5" model naming and pricing are the video's hook and
  may be promotional/aspirational framing — do NOT enshrine the model claims as fact in
  the knowledge layer. Keep the durable system content; flag the model specifics as
  time-bound and unverified.
- Subscriber count (~800k) and team size (13) are Nate's stated figures as of 2026-06-09.
