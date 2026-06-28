# Video capture — "7 INSANE loops you need to try right now" (Matthew Berman)

**Date ingested:** 2026-06-21
**Source:** https://www.youtube.com/watch?v=F4a8aMLb678 (Matthew Berman, 16:11, pub 2026-06-19)
**Why it matters:** Berman is the creator of the [Loop Library](loop-library-forward-future-2026-06-21.md) — this video is its launch walkthrough. Pairs with the [Nate Herk capture](video-nate-herk-agent-loops-explained-2026-06-19.md). Focusing this note on what Berman adds beyond the library page: the **trigger taxonomy**, the **goal taxonomy**, the `/goal` command, loop chaining, and the hard caveats.

---

## The two taxonomies (the useful new structure)

A loop needs exactly two things: a **trigger** and a **goal**.

**Trigger — how it kicks off (3 kinds):**
1. **Manual** — you tell the agent "go run this loop." (Sometimes required, but doesn't remove the human.)
2. **Scheduled** — fixed time or repeating (e.g. nightly).
3. **Action** — fires on an event (e.g. PR opened).

Full autonomy = move off manual toward scheduled/action triggers.

**Goal — how it knows it's done (2 kinds):** *(this is the "goal engineering" axis)*
1. **Verifiable** — concrete, deterministic, testable. *e.g. "100% test coverage," "every page loads <50ms."* **Best case for a loop.**
2. **LLM-as-judge** — the model decides when satisfied. *e.g. "refactor until satisfied."* Works, but **brittle** — you're handing taste/judgment to the model. Tighten it with explicit criteria ("be strict about simplicity," "every line DRY").

Mechanics: in **Codex and Claude Code**, prepend/append **`/goal`** to the prompt — it runs until the condition is met (10 min to 10+ hours). Watch token spend.

## The 7 loops (detail lives in the Loop Library page)

1. **sub-50ms page-load** (verifiable, his favorite) — optimize every page until all load <50ms under repeatable test conditions.
2. **overnight docs sweep** (LLM-judge, scheduled) — nightly, sync docs to code changes, open a PR.
3. **architecture satisfaction** (LLM-judge) — "refactor until happy with the architecture"; live-test + autoreview + commit each step; track progress in a markdown file. *Steinberger uses this often.*
4. **logging coverage** (LLM-judge) — add logging until every important path produces useful, tested logs.
5. **production error sweep** (verifiable-ish, scheduled) — nightly, scan prod logs, root-cause + fix + verify + PR, ping Slack with findings.
6. **SEO/GEO visibility** (weekly) — audit crawlability/indexation/structured data/answer-first content, rank gaps, fix highest-leverage, rerun until no critical issues.
7. **full product evaluation** (LLM-judge, his most "handwavy" but works) — generate N realistic scenarios, define success criteria + consistent eval method, run all, fix root causes, rerun until every scenario clears the bar. Can run 12h+.

**Loops chain.** logging coverage → production error sweep is the worked example: build the logs, then a second loop consumes them. This composition is where the leverage compounds.

## The two caveats (the part to actually heed)

1. **Not every problem fits — and the goal is the hard part.** Verifiable goals are great; LLM-as-judge is shakier. **Feature-building from scratch does NOT work well** — "loop until you build a full permissioning system" fails because you can't predict which direction the AI takes or which features it'll deem worthwhile. (His Excel-clone-via-computer-use loop ran for *days* before he killed it. Cautionary.)
2. **Loops are expensive.** They churn tokens autonomously until the goal hits — minutes to days. Great for token-maxers; a real constraint if you're budget-bound.

## How this lands for the AIOS

- **The trigger × goal grid is the planning tool.** Before building any AIOS routine, place it: which trigger (manual / scheduled / action), and is the goal **verifiable** or **LLM-judge**? Push goals toward verifiable; if stuck on LLM-judge, add a dedicated scorer + explicit criteria (Nate's fix).
- **Feature work is the no-go zone** — matches Justin's reality (client builds, BrandOS features) where a loop would wander. Loops fit the *maintenance/quality/audit* surfaces: docs sync, error sweeps, SEO/GEO, perf, eval suites — exactly the recurring AIOS chores.
- **SEO/GEO + production-error + docs-sweep are directly portable** to client retainers (Wild Rose, ISF, Partners For Sight) and to the AIOS itself.
- Reinforces the standing behavior in memory (`feedback_loop_goal_engineering_proactive`): the first question on any candidate loop is *"is the done-criteria verifiable, and what triggers it?"*
