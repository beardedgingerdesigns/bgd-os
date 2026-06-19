# Ask the Board — Design Spec

A skill that lets Justin pose questions to a board of advisors built from real creators' ingested content. Advisors deliberate amongst themselves and return a unified response — not individual reports.

## Core Concept

Create advisor-inspired decision lenses from public content. Each advisor agent uses a thin persona file plus curated knowledge notes from public videos, posts, podcasts, and articles. The goal is not to impersonate the creator, but to apply their documented frameworks and recurring patterns to Justin's business decisions. When asked a question, the board runs a structured deliberation and returns a synthesized perspective.

Inspired by Austin Marchese's "ask-the-board" skill (Skill 4 from "The ONLY 6 Skills You Need to 10x Your Claude Projects") and the c-level-advisor open-source pattern (three-phase deliberation: frame, isolate, debate).

## Initial Board

Two advisors to start. Roster is configurable — add more over time.

| Advisor | Lens | Source |
|---------|------|--------|
| Nate Herk | AI business strategy, 3Ms framework, leveraging AI as a business operator | youtube/@nateherk |
| Matt Pocock | AI-assisted development, LLM skill design, developer tooling, building with Claude Code | youtube/@mattpocockuk |

## Advisor Storage

### Location & Resolution

The skill checks for advisors in two places, in order:

1. **Project-local:** `docs/wiki/advisors/roster.yaml` in the current working directory's wiki
2. **Global fallback:** `/Users/justinlobaito/repos/claude-os/docs/wiki/advisors/roster.yaml`

If the project has its own board, use it entirely. If not, fall back to claude-os. No merging for v1.

### Roster File

```yaml
advisors:
  nate-herk:
    name: Nate Herk
    lens: "AI business strategy, the 3Ms framework, leveraging AI as a business operator"
    sources:
      - youtube: "@nateherk"
    knowledge_path: docs/wiki/advisors/nate-herk/

  matt-pocock:
    name: Matt Pocock
    lens: "AI-assisted development, LLM skill design, developer tooling, building effectively with Claude Code"
    sources:
      - youtube: "@mattpocockuk"
    knowledge_path: docs/wiki/advisors/matt-pocock/
```

### Per-Advisor Directory

```
docs/wiki/advisors/nate-herk/
├── persona.md          # lightweight lens description, voice notes, known biases
├── knowledge/          # pre-analyzed ingested content (the real training data)
│   ├── 3ms-framework.md
│   ├── ai-business-positioning.md
│   └── ...
└── raw/                # staging for new content
    └── research/
```

`persona.md` stays thin — a few paragraphs covering the advisor's lens, communication style, and known positions. The ingested `knowledge/` files carry the weight. When the advisor agent is constructed, it gets persona.md as role framing and knowledge/ files as reference material.

### Ingestion

Content gets into advisor knowledge via existing pipelines:

- `/wiki research` pointed at the advisor's directory
- Direct drops into `raw/research/` followed by `/wiki ingest`
- Batch bootstrap (fetch 10-20 top videos/posts) to seed a usable persona on day one
- Continuous drip as new content is consumed

## Deliberation Model

Three phases, adapted from the c-level-advisor pattern.

### Phase 1 — Frame

Before advisors touch the question, the skill frames it and surfaces missing decision context.

**Reframe the question:**
- Restate clearly
- Identify what kind of decision this is (pricing, positioning, architecture, workflow, etc.)
- Set success criteria — what would a good answer look like?

**Identify missing context that would materially change the answer:**
- Decision type (one-way door vs. reversible)
- Stakes (what's on the line)
- Time horizon (this week vs. this quarter vs. this year)
- Budget or revenue impact
- Reversibility (how hard to undo)
- Audience/customer (who this affects)
- Constraints (time, money, dependencies, contracts)
- What Justin is leaning toward
- What failure would look like

Do not block on missing info. Make reasonable assumptions and label them clearly so advisors can challenge the assumptions as part of their analysis.

The framing + assumptions get passed to all advisors so they respond to the same well-defined prompt.

### Phase 2 — Isolate

Each advisor gets their own agent with:

- Their `persona.md` as role framing
- Their `knowledge/` files as reference material
- The framed question from Phase 1

They produce independent analysis. No visibility into other advisors' responses. Prevents anchoring bias.

**Advisor agent rules:**
- Do not impersonate the advisor personally. Do not claim the advisor would definitely say something.
- Use the advisor's documented ideas, patterns, and public positions as a decision lens.
- When the ingested knowledge doesn't cover the topic, say so. Reason from adjacent principles the advisor has expressed, but label it as extrapolation.
- Never fabricate quotes, anecdotes, or positions not grounded in the ingested content.

### Phase 3 — Deliberate + Synthesize

Two modes, controlled by the user per question:

**Quick take (default):**
A synthesis agent reads all Phase 2 positions and produces the unified response. One pass, no back-and-forth. Lower cost.

**Deep deliberation (user says "deliberate deeply" or "deep"):**
Both advisors receive each other's Phase 2 positions via SendMessage and respond — agreements, pushbacks, refinements. Then the synthesis agent produces the unified response from the full exchange. Higher cost, multi-agent exchange.

### Output Format

```
## Bottom Line
[One sentence — what to do]

## The Thinking
[Narrative synthesis — where advisors aligned, where they diverged,
and how the tension resolved. Written as a unified perspective,
not "Nate said X, Matt said Y."]

## Stress Test
- What could be wrong about this
- The hidden assumption
- The risk if Justin is overconfident

## How to Act
[Concrete next steps]

## Your Call
[If there's a genuine fork the board can't resolve, frame it as
a clear choice with trade-offs. Omit if consensus is clear.]
```

## Skill Implementation

### Location

`~/.claude/skills/ask-the-board/SKILL.md` — user-level, available in any repo.

### Invocation

- **Slash command:** `/ask-the-board <question>`
- **Depth flag:** defaults to quick take. Include "deliberate deeply" or "deep" for full deliberation.
- **Natural language (stretch goal):** "run this by my board" / "ask my advisors about X" / "what would my board say about X"

### Orchestration — Agent Teams

Primary implementation uses `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`:

**Quick take:**
1. Load roster, resolve advisor paths (project-local first, then claude-os)
2. Frame the question (Phase 1)
3. Create team with a synthesis lead
4. Spawn one agent per advisor with persona + knowledge context
5. Each advisor produces independent analysis (Phase 2 — isolate)
6. Synthesis lead receives all positions, produces unified output (Phase 3)
7. Team shuts down

**Deep deliberation:**
1. Steps 1-5 same as quick take
2. Each advisor receives the other's Phase 2 position via SendMessage
3. Each advisor responds with agreements, pushbacks, refinements
4. Synthesis lead receives full exchange, produces unified output
5. Team shuts down

### Fallback — Parallel Agents

If agent teams aren't available (feature removed, experimental flag off), the skill falls back to the `Agent` tool:

- Parallel subagents for Phase 2 (independent advisor positions)
- One synthesis agent for Phase 3 (unified output)
- Same deliberation logic, different orchestration primitive
- Detection: attempt ToolSearch for TeamCreate at skill invocation time. If unavailable, use Agent tool path.

The advisor/persona/roster layer is identical in both paths — only the orchestration changes.

## What's Explicitly Out of Scope

- **Routing layer** — with two advisors, both always participate. No "Chief of Staff" router until the board grows.
- **Project/global board merging** — project board wins entirely or falls back to global. No mixing advisors across tiers.
- **Advisor-specific ingestion skill** — use existing `/wiki research` pipeline. A convenience wrapper ("add this to Nate's profile") can come later.
- **Continuous auto-update of training data** — manual ingestion only. No background polling of YouTube channels.
- **Internal focus group** — separate concept from the video (target audience simulation vs. expert advisors). Could be a future skill.

## Future Directions (not designing for now, but keeping the door open)

- **Project-specific advisors** — a Shopify expert for Mr Gym, a Craft CMS expert for legacy clients
- **Board merging** — inherit some advisors from claude-os, add project-specific ones
- **More advisors** — fractional CFO, channel sales strategist, mid-market buyer persona
- **Auto-ingestion** — watch YouTube channels and auto-ingest new content
- **Decision logging** — board responses logged to decisions/log.md for future reference
