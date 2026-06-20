# Compounding & Self-Improving Meta-Loops
## Loop Research — Lens 05

**Date:** 2026-06-20
**Researcher lens:** Compounding & Self-Improving Meta-Loops
**For:** Justin Lobaito — solo operator, BGD/BrandOS/AIOS
**Companion files:** 01 (engineering mechanics), 02 (business/growth), 03 (design/product), 04 (human-in-loop governance)

---

## (a) The Lens

Standard loop engineering says: write loops that run work so you don't have to. Compounding meta-loops say something harder and more important — the output of a loop should be a **better loop**. Not just a shipped feature, a closed ticket, a sent email. A system that, after each cycle, makes the next cycle faster, cheaper, or smarter. The distinction matters because most "loops" a solo operator builds are open: value flows out, but nothing flows back in to improve the engine. This research is about closing that gap. For Justin specifically, the question is not "can I automate more?" — he already has deep automation primitives. It is: "do those primitives feed each other, or do they each start from zero?" A real flywheel has no zero-start cycles. Every session teaches the system. Every failure encodes a guardrail. Every retro generates a skill. Every skill compresses the next retro. This is the loop whose output is a better loop.

---

## (b) Core Frameworks

### 1. Compound Engineering (Kieran Klaassen / Every)
**Source:** https://every.to/guides/compound-engineering (Updated May 2026) and https://github.com/EveryInc/compound-engineering-plugin

**Definition:** Each unit of engineering work makes subsequent units easier, not harder. Traditional codebases accumulate complexity; compound codebases accumulate capability. The seven-step loop is: Ideate → Brainstorm → Plan → Work → Review → Polish → **Compound**. The compound step — documenting learnings, updating CLAUDE.md, tagging solutions for retrieval — is the one traditional development skips. That step is where the gains live.

**The 50/50 rule:** 50% of engineering time on features, 50% on improving the system. Traditional teams run 90/10 and wonder why they accrue debt. The key mechanism: `/ce-compound` spawns six parallel agents (context analyzer, solution extractor, related-docs finder, prevention strategist, category classifier, documentation writer) and writes searchable markdown with YAML frontmatter to `docs/solutions/`. Future agents find past solutions automatically — institutional knowledge that activates at the moment of relevance.

**Key principle:** "Teach the system, don't do the work yourself. Time spent giving agents more context pays exponential dividends, but time spent typing code only solves the task in front of you."

**When it applies:** Any time Justin ships something. The compound step takes 5 minutes and makes the next related task 20% faster. Over 50 shipped things, the effect is enormous.

---

### 2. Recursive Self-Improvement (Anthropic Institute)
**Source:** https://www.anthropic.com/institute/recursive-self-improvement ("When AI Builds Itself")

**Definition:** Systems where AI improves the tools used to build AI — applied here at the operator level, not the lab level. The progression: humans write code → agents suggest code → agents write code → agents review code → agents improve the agents that write code. Justin is already at step 3-4. Step 5 (agents improve agents) is accessible right now via the retro → skill-creation loop.

**The hard number that matters most for a solo operator:** Anthropic went from low single-digit AI-authored code (pre-2025) to 80%+ by May 2026. The slope steepened **twice** — once when Claude ran its own code, once when it worked over longer time horizons. The bottleneck is no longer production; it is review. The lesson: design your system to minimize what needs human review, not to minimize what agents do.

**When it applies:** The AIOS is already a recursive self-improvement system in embryo — `/retro` mines sessions to improve skills, `/level-up` ships the improvement. The gap is that this loop runs weekly at best and requires Justin to manually kick it off. The recursive version runs automatically.

---

### 3. Self-Improving Session Mining (Zack Proser)
**Source:** https://zackproser.com/blog/keep-shipping-when-you-walk-away ("How to Keep Shipping When You Walk Away from Your Desk," AI Engineering London, June 2026)

**Definition:** Every week, a scheduled task scans all Claude Code JSONL session logs. It extracts patterns — tasks done more than once, repeated instructions, workflows that could be automated. The output is a list of new skills to build and inefficiencies missed. One week it flagged that Proser had reformatted blog images for CDN upload four separate times without noticing.

**The mechanism:** "Look for patterns where you had to spend significant thinking tokens to get something right, or you and the agent had to go back and forth to eliminate ambiguity. Figure out the skills that are missing. What's the delta — if you had these tools, these MCPs, these skills, how could we tighten that loop so it doesn't happen next week?"

**Critical point:** Justin already has `/retro` doing exactly this. The gap is the automation of the handoff from retro finding → new skill shipped. Right now Justin must read the retro, judge the top candidate, and manually run `/level-up`. The compounding version auto-generates the skill draft from the retro and queues it for Justin's approval.

**When it applies:** Every Friday. More importantly, the session-end hook (Proser's "Phase 2" — distilling key bits + struggles to a clean store at session end) would mean retro reads summaries instead of raw JSONL. Justin's `/retro` SKILL.md mentions this exact gap under "Phase 2 (not yet built)."

---

### 4. Second Brain / Knowledge Compounding (Tiago Forte, CODE/PARA)
**Source:** https://fortelabs.com/blog/basboverview/ and https://fortelabs.com/blog/progressive-summarization-vi-core-principles-of-knowledge-capture/

**Definition:** CODE (Capture, Organize, Distill, Express) is the knowledge compounding loop. PARA (Projects, Areas, Resources, Archives) is the organization layer. The critical insight for AI systems: **Progressive Summarization** — compress knowledge across multiple passes so the distilled signal compounds while the raw noise archives. The tacit knowledge that lives in an expert's head (judgment, taste, when-to-do-it wisdom) is the hardest to transfer but the most valuable to encode.

**The AI extension:** What Forte designed for human second brains applies directly to CLAUDE.md, skills, and decisions logs. Each `/wrap` session is a Capture pass. `/dispatch` is Organize. The decisions log is Distill. Skills are Express — the encoded, executable form of knowledge that can activate at the moment of relevance.

**When it applies:** Every time Justin builds a routing rule, writes a SKILL.md, or appends to decisions/log.md. The question to ask: "Is this knowledge going into a form that an agent can activate, or is it going into a form that only a human reading it can access?" The latter evaporates. The former compounds.

---

### 5. Encoded Procedures / Skills as Compounding Assets
**Source:** https://www.petervanhees.com/your-prompts-evaporate-skills-compound-the-knowledge-layer-agents-were-missing/ and https://bosio.digital/articles/skills-vs-agents

**Definition:** "Every organization already has institutional knowledge. The question is whether that knowledge is trapped in people's heads and prompt libraries, where it evaporates, or encoded in skills, where it compounds." A skill is not documentation humans read. It is a procedure agents execute. Improvement to one skill propagates automatically to every future use. An improvement to a prompt must be re-applied every session from scratch.

**The strategic inversion:** The AI model is the commodity. The skills library is the moat. "The companies that encode are building the Company as Computer. The companies that prompt are hiring a new intern every session." For Justin, this means his skills directory is a competitive asset that grows — not just a convenience tool. Each skill encodes taste, judgment, and failure-mode avoidance that compounds across every future agent run.

**When it applies:** Every time Justin re-explains something to Claude for the second time. If Justin said it once, the system should know it. If Justin said it twice, there is a missing SKILL.md or CLAUDE.md rule.

---

### 6. Postmortem-to-Guardrail / Error-to-Test Loop (Google SRE Culture)
**Source:** https://sre.google/sre-book/postmortem-culture/ and https://devdigest.org/articles/post-mortems-and-rcas-how-to-make-incidents-count

**Definition:** Blameless postmortems convert incidents into permanent system improvements. The formula: incident → document root causes → write a test that would have caught it → merge the test → every future near-miss is caught automatically. "A postmortem without a test is incomplete." The SRE extension: error budgets make trade-offs explicit — burn the budget, do reliability work; have budget, ship features.

**The compounding mechanism:** "Incidents are inevitable, but repeated incidents from the same root cause are a choice." Each test added after an incident is a permanent guardrail. Over 100 incidents and 100 tests, the system becomes structurally incapable of making the same class of mistake. The knowledge doesn't wait to be read. It enforces itself.

**When it applies:** Every time something breaks in BrandOS, or a dealer onboarding fails, or a routing rule sends something to the wrong place. The question is not "what went wrong?" but "what test or rule, if it existed, would have made this impossible?"

---

### 7. The Compounding Math
**Source:** Compound interest formula applied to system improvement, synthesized from Every / Anthropic / Forte

**The math:** If each work cycle makes the system 1% more effective, after 72 cycles the system is 2x as effective (Rule of 72). After 144 cycles, 4x. After 288 cycles, 8x. A weekly retro-to-skill cycle runs 52 times per year. A 1% improvement per cycle = 1.67x more effective by year-end. A 2% improvement per cycle (modest for a focused operator) = 2.8x. The solo operator who compounds beats the team that doesn't by a widening margin, not a fixed one.

**The failure mode:** The math only works if the loop closes. An open loop — where learnings evaporate after each session — compounds at 0%. Every skill not written, every pattern not encoded, every retro not acted on is a cycle that returns 0% instead of 2%.

---

## (c) The 7 Use Cases Through the Compounding Lens

### 1. Code Review & Fix Loop

**Asset that accumulates each cycle:** Lint rules, review agent patterns, CLAUDE.md entries that catch recurrent issues automatically.

**How to close the loop:** After every code review finding, ask: "Is this a one-time fix or a class of bugs?" If class, encode it. For BrandOS: when the review agent catches a pattern (e.g., "unvalidated dealer config field"), write a new lint rule or update the BrandOS CLAUDE.md so the next PR doesn't make the same mistake. The Every `/ce-compound` pattern does this explicitly — six agents extract the reusable learning from each review session.

**Failure mode (open loop):** Review catches the bug. Bug gets fixed. Nothing is encoded. Six months later, a different PR reintroduces the same class of bug. The review catches it again. Permanent re-teaching of a lesson that should be permanent knowledge.

**Recommendation for Justin:** After each BrandOS code review cycle, run a micro-compound step: one sentence to CLAUDE.md (if this project has one) and one entry to `docs/solutions/` tagged with the pattern category. This takes 2 minutes and prevents the same catch 10 more times over the life of the project.

---

### 2. Inbox / Triage Loop

**Asset that accumulates each cycle:** Better routing rules, updated mute filters (`triage-mutes.md`), pattern-matched templates for common reply types.

**How to close the loop:** Each `/daily-inbox-triage` run that produces a draft should also surface one routing insight: "This type of thread keeps landing in the inbox unanswered — should it auto-draft?" The triage skill should append routing candidates to a lightweight `state/inbox-triage.md` enrichment file, not just overwrite the current triage. After 4-6 runs, a `/level-up` pass reviews those routing candidates and encodes the best as a new triage rule.

**Failure mode (open loop):** Triage runs, drafts are created, nothing about the pattern is retained. Next run starts from the same baseline. The same type of thread requires the same context reconstruction every time. The skill doesn't get smarter.

**Recommendation for Justin:** Add a `## Routing Patterns Observed` section to each triage run that writes 1-3 recurring pattern notes. Feed those into the next `/level-up` pass. The triage loop is currently the most open-loop system in the AIOS — it overwrites state rather than accumulating pattern knowledge.

---

### 3. Growth / Content Loop

**Asset that accumulates each cycle:** Reusable content templates, voice-calibrated copy patterns, a growing library of high-performing structural moves.

**How to close the loop:** Each piece of content produced (LinkedIn post, email, proposal section) that gets positive response should be tagged and stored with the structural pattern that worked. "Hook was a vulnerability share. Body was before/after contrast. CTA was soft question." Over 20 pieces, patterns emerge. Those patterns become templates that make the next piece faster and more likely to work.

**Failure mode (open loop):** Content is written, published, moves on. The skill that produced it starts from scratch next time. No memory of what worked. The "voice" stays tacit, never executable.

**Recommendation for Justin:** The `references/voice.md` file is the right destination. After any content piece that lands well, append the structural pattern (2-3 sentences, not the full piece) to a `## Patterns That Work` section. The content loop is currently the most underutilized compounding opportunity in BGD's toolset given that content is Justin's primary brand-building surface.

---

### 4. Design Iteration Loop

**Asset that accumulates each cycle:** A growing pattern library, documented design decisions that explain the "why," component reuse rules.

**How to close the loop:** After each design iteration cycle (for BrandOS UI, dealer portal, client sites), extract the decision that was hardest to make and encode it. "We chose X over Y because of Z constraint." That decision, encoded in an ADR or CLAUDE.md entry, prevents the same debate next cycle and trains future agents to arrive at the same conclusion faster.

**Failure mode (open loop):** Design decisions live in Figma comments and Slack threads. The next design session restarts the debate. The AIOS UI v2 work on this branch has ADRs (0003, 0004) — that's the right pattern. The gap is making it habitual, not exceptional.

**Recommendation for Justin:** The ADR pattern already exists in `docs/adr/`. Make it a norm to write a 5-line ADR after any design decision that took more than 20 minutes to reach. This is where BrandOS UI patterns live long-term.

---

### 5. Planning / Roadmap Loop

**Asset that accumulates each cycle:** Better GSD plan templates, refined phase breakdown patterns, accumulated knowledge of what scope estimates were wrong and why.

**How to close the loop:** After each GSD phase completes, the `/gsd-complete-milestone` or wrap pass should append one "planning calibration note" to a file: "Phase 09 estimated 3 tasks, required 7. Root cause: didn't account for data migration validation." Over 10 phases, those notes become a calibration dataset that makes the next plan more accurate.

**Failure mode (open loop):** Plans are written, executed, closed. The retrospective knowledge about planning accuracy evaporates. Every new phase starts from scratch estimation-wise. Scopes keep being wrong in the same ways.

**Recommendation for Justin:** Add a `## Planning Calibration` section to `decisions/log.md` entries when a phase wraps, capturing estimated vs. actual and one root cause. The `/retro` skill already mines for some of this, but a dedicated planning accuracy signal would be more targeted and actionable for the next plan.

---

### 6. Monitoring / Self-Audit Loop

**Asset that accumulates each cycle:** A growing library of automated checks, each representing a failure mode that was caught manually and then encoded as permanent detection.

**How to close the loop:** Pocock's "buy a lock" principle applies here precisely: "If someone keeps stealing your bike, maybe buy a lock." Every time the AIOS `/audit` or a BrandOS health check catches something manually, the next step is: "What automated check, if it existed, would have surfaced this without me?" Then build that check. After 10 audits and 10 checks built, the system catches its own problems.

**Failure mode (open loop):** The audit runs, issues are fixed, the same issues reappear next audit. No checks were added. The audit is a treadmill, not a staircase.

**Recommendation for Justin:** The AIOS `/audit` skill should have a mandatory last step: for every finding, classify it as either (a) one-time issue or (b) recurring class. For recurring classes, open a todo to build an automated detection hook before the next audit. This is the postmortem-to-guardrail loop applied to AIOS health.

---

### 7. Learning / Knowledge-Compounding Loop (The Central One)

**Asset that accumulates each cycle:** Encoded skills, updated CLAUDE.md/routing rules, decisions log entries, advisor board knowledge — each cycle produces an artifact that makes the next cycle's starting state higher.

**How to close the loop:** This is the meta-loop. The loop structure is:
1. Work happens (any of the 6 loops above)
2. `/wrap` captures session knowledge
3. `/retro` mines sessions for patterns
4. `/level-up` surfaces the highest-leverage pattern
5. The 3Ms interview produces a skill, rule, or hook
6. That artifact is installed into the AIOS
7. Next cycle's work starts with better starting state → go to 1

**The compounding happens when step 6 reduces the pattern count in step 3.** If the skill was built correctly, `/retro` should never flag that pattern again. If it does, the skill is wrong or incomplete.

**Failure mode (open loop):** `/retro` runs, finds 5 patterns. `/level-up` ships 1 skill. But the next `/retro` still finds 4 of those same 5 patterns, because the skill addressed the symptom (this specific ask) rather than the class (this type of ask). The other 4 never get addressed because the cycle only ships one artifact per week. The backlog of unencoded patterns grows.

**Recommendation for Justin:** The knowledge loop needs a **pattern backlog** — a dedicated file (suggest `state/pattern-backlog.md`) where each `/retro` deposits unfixed patterns with evidence counts, and each `/level-up` marks one as "addressed." The backlog provides continuity across weeks so patterns don't re-surface from zero. A pattern appearing for the third consecutive week without a fix is a signal that either the fix is wrong or the loop is broken.

---

## (d) Honest Audit of Justin's AIOS Primitives

### Already Compounding (genuinely closed loops)

**`/retro` → `/level-up` chain:** This is the real flywheel. `/retro` mines JSONL for patterns, writes evidence-backed candidates to `retros/`. `/level-up` reads the latest retro as primary input instead of cold recall. When it runs weekly, this is a genuine compounding loop: each week's friction becomes next week's encoded fix. The existence of 4 retro files in `retros/` shows it's running. The origin (Zack Proser's talk) is the right model.

**`decisions/log.md`:** Append-only, linked to from `/level-up`. This is working as institutional memory. The entries are terse and capture the "why." This compounds because future sessions can read it to avoid re-litigating closed questions.

**The skills library itself:** Each SKILL.md is a write-once, reuse-forever asset. `/dispatch`, `/retro`, `/level-up`, `/wrap`, `/brief`, `/daily-inbox-triage` are all encoded procedures. They start each relevant session at a higher baseline than a promptless session would. These are the most direct embodiment of "prompts evaporate, skills compound."

**Advisory board (`docs/wiki/advisors/`):** Three encoded advisors with deep knowledge files. `/ask-the-board` deliberates from their actual positions. When new primary-source material gets ingested (as happened with the Pocock digest), the advisor becomes more accurate. This is a compounding knowledge asset — each ingested source makes future board deliberations sharper.

---

### Open Loops Leaking Value

**`/wrap` → nowhere specific:** `/wrap` captures session state but there is no systematic mechanism ensuring wrap output flows into the next session's starting context. If a wrap entry captures a decision, it may or may not make it to `decisions/log.md`. If it captures a pattern, it may or may not make it to the retro signal stream. The wrap is a Capture step without a guaranteed Organize step. Leaks value.

**`/daily-inbox-triage` → no routing accumulation:** Each run overwrites `state/inbox-triage.md`. Routing patterns observed during triage are not accumulated anywhere. The triage skill gets no smarter over time. This is the most concrete open loop in the AIOS.

**`/dispatch` → project wikis via staging:** The staging path (`{wiki}/raw/aios/`) is correct per ADR 0004. But there is no feedback loop from the wiki's ingest pass back to AIOS. If staged content is repeatedly ignored or restructured by the wiki's curator, AIOS never learns to route better. One-directional flow, no learning signal.

**The pattern backlog gap:** There is no persistent record of which `/retro` patterns have been addressed vs. remain open across weeks. Each retro starts fresh. Patterns that appear for the third week get no special flag. The compounding math breaks down if high-frequency patterns go unaddressed because the loop has no memory of its own backlog.

**BrandOS has no `docs/solutions/` analog:** The compound engineering pattern relies on `docs/solutions/` as an accumulating knowledge store tagged for agent retrieval. BrandOS phases produce plans, ADRs, and code — but no solved-problem library that future agents search before planning. Each phase starts from scratch contextually.

---

### The ONE Missing Closure That Would Turn the AIOS into a Real Flywheel

**The session-end distillation hook.**

Justin's `/retro` SKILL.md identifies it explicitly as "Phase 2 (not yet built)": a hook that fires at session end and writes a compact "key decisions + struggles" summary to a clean store, so retro reads distilled summaries instead of 150MB of raw JSONL.

Right now the retro pipeline does:
```
150MB raw JSONL → Python extraction → analysis agents → ranked patterns
```

With a session-end hook, it becomes:
```
Per-session distillation hook → clean 200-word summaries → retro agents read summaries → ranked patterns
```

The effect: retro runs faster, catches more signal, works across longer time windows (can look back 30 days instead of 7), and the distillation itself forces Justin to crystallize what mattered in each session — which is itself a compounding knowledge act.

This is the missing link because everything else in the AIOS is present: the retro runs, the level-up ships skills, the decisions log captures reasoning, the advisors deliberate. The bottleneck is signal quality going into the retro. Better signal in → better patterns → better skills → measurably less repeated work.

---

## (e) Top 5 Systematic Changes to Make Justin's Work Compound Across All Repos

### 1. Ship the session-end distillation hook
**What:** A hook that fires when a Claude Code session ends (or when `/wrap` runs) and writes a 150-200 word structured summary to `archives/session-summaries/YYYY-MM-DD-HH-{project}.md`. Fields: key decisions made, patterns observed, friction encountered, what was taught to the system this session.
**Why it compounds:** The retro moves from mining noise to reading signal. Patterns surface faster and cleaner. The 7-day window can extend to 30 days without overwhelming the analysis agents. This is Proser's Phase 2 made concrete for Justin's setup.
**How:** A Claude Code hook on session-end (or on `/wrap` invocation) that runs a lightweight extraction prompt against the current session transcript before it closes. Write to `archives/session-summaries/`. Update `/retro` Phase 1 to read those summaries in addition to raw JSONL.

---

### 2. Build `state/pattern-backlog.md` as a persistent retro accumulator
**What:** A file that `/retro` appends to (never overwrites) with each new unfixed pattern, including: pattern name, type, first seen date, times seen, proposed fix, and status (open/in-progress/closed). `/level-up` marks one "in-progress" per run and moves it to "closed" when the skill ships.
**Why it compounds:** Prevents high-value patterns from falling through the cracks when a single weekly `/level-up` can only ship one artifact. Creates a visible backlog of compounding opportunities. Makes the "is the loop working?" question answerable: if patterns stay open for 3+ weeks, the loop is broken.
**Effort:** Low. New file + small additions to `/retro` and `/level-up` skill logic.

---

### 3. Make `/daily-inbox-triage` accumulate routing patterns
**What:** Add a `## Routing Observations` section to each triage run that writes 1-3 recurring patterns to a dedicated `state/triage-routing-patterns.md` (append, never overwrite). Each observation: thread type, current handling, suggested automation, times seen.
**Why it compounds:** The triage skill currently starts each run with no memory of what it learned yesterday. After 30 days of accumulated observations, the routing patterns file becomes a rich signal for the next `/level-up` pass to encode as permanent triage rules. This transforms triage from a daily task into a self-improving classifier.
**Effort:** Low. Add one section to the triage skill output format + create the accumulator file.

---

### 4. Add a `docs/solutions/` analog to BrandOS (and template it for all project repos)
**What:** A structured knowledge store in each project repo at `docs/solutions/` with subdirectories matching common problem categories (architecture-patterns, bug-classes, integration-issues, performance-issues, conventions). After each BrandOS phase, run a micro-compound pass that writes one solved-problem entry per significant decision or bug class encountered.
**Why it compounds:** BrandOS phases currently produce plans and code but no searchable institutional memory of what was hard and how it was solved. Each new phase or new dealer migration starts from contextual scratch. A `docs/solutions/` library means future agents searching before planning find past solutions automatically. This is the Every compound engineering pattern applied to Justin's project repos.
**Effort:** Medium. Create the directory structure + add a `/ce-compound` equivalent step to the GSD phase completion flow.

---

### 5. Close the advisor board feedback loop
**What:** After each `/ask-the-board` deliberation that reaches a decision, append a 2-3 sentence "outcome note" to the relevant advisor's knowledge file: "Board recommended X on [date]. Justin chose Y. Outcome: Z." Over time, each advisor's knowledge files contain not just their encoded positions but a track record of how their recommendations played out in Justin's specific context.
**Why it compounds:** The advisors currently reason from their general positions (Nate Herk on systems, Pocock on harnesses, Chris Do on design business). They don't have any signal about which of their advice proved correct vs. wrong in Justin's context. Adding outcome notes makes them calibrate to Justin's specific reality — a compounding personalization that no off-the-shelf advisory tool can replicate.
**Effort:** Low. One 2-3 sentence append per `/ask-the-board` session that reaches a decision.

---

## (f) Sources

1. **Kieran Klaassen / Every** — "Compound Engineering" (Guide, Updated May 2026) — https://every.to/guides/compound-engineering
2. **Kieran Klaassen / Every** — "Compound Engineering: How Every Codes with Agents" — https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents
3. **Kieran Klaassen / Every** — "My AI Had Already Fixed the Code Before I Saw It" — https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it
4. **EveryInc GitHub** — Compound Engineering Plugin (38 skills, 43 agents) — https://github.com/EveryInc/compound-engineering-plugin
5. **Anthropic Institute** — "When AI Builds Itself" (Recursive Self-Improvement) — https://www.anthropic.com/institute/recursive-self-improvement
6. **Zachary Proser** — "How to Keep Shipping When You Walk Away from Your Desk" (AI Engineering London talk, June 2026) — https://zackproser.com/blog/keep-shipping-when-you-walk-away
7. **Tiago Forte / Forte Labs** — "Building a Second Brain: The Definitive Introductory Guide" — https://fortelabs.com/blog/basboverview/
8. **Tiago Forte / Forte Labs** — "Progressive Summarization VI: Core Principles of Knowledge Capture" — https://fortelabs.com/blog/progressive-summarization-vi-core-principles-of-knowledge-capture/
9. **Peter van Hees** — "Your Prompts Evaporate. Skills Compound." — https://www.petervanhees.com/your-prompts-evaporate-skills-compound-the-knowledge-layer-agents-were-missing/
10. **Bosio Digital** — "AI Skills vs AI Agents: Why Skills-First Architecture Outperforms" — https://bosio.digital/articles/skills-vs-agents
11. **Google SRE Book** — "Postmortem Culture: Learning from Failure" — https://sre.google/sre-book/postmortem-culture/
12. **Devdigest** — "Post-Mortems and RCAs: How to Make Incidents Count" — https://devdigest.org/articles/post-mortems-and-rcas-how-to-make-incidents-count
13. **Amitrix / DEV Community** — "Skills as Institutional Memory" — https://dev.to/amitrix/skills-as-institutional-memory-why-individual-craft-doesnt-compound-without-distribution-57hk
14. **Background files (internal)** — `brainstorm/research-loop-engineering-2026-06-19.md` (Theo Browne / Boris Cherny / Addy Osmani / Anthropic Institute) and `brainstorm/research-matt-pocock-agentic-workflow-2026-06-19.md` (Matt Pocock / queues vs loops)
