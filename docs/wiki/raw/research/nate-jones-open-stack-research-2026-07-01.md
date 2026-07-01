# Nate B Jones — Open Stack Research

Source: "Stop Renting Your AI Memory. Build Your Own This Week." (YouTube, 2026-07-01) + Substack guide + GitHub repo (NateBJones-Projects/OB1, 2K+ stars)

## Core thesis

"Rent the intelligence, own the memory." With frontier models getting locked behind government export controls (Fable, GPT-5.6), the durable move is owning your context/memory layer and swapping models underneath.

## The Open Stack — three layers

### Open Brain (OB1) — Memory
- Supabase (Postgres + pgvector) as single database
- OpenRouter as universal AI gateway (one key, all models)
- Slack capture channel for quick thought ingestion
- MCP server with 4 tools: semantic search, browse recent, stats, capture
- Any MCP-connected AI reads/writes to same brain
- ~$0.10-0.30/mo to run, 45-min setup
- Karpathy-inspired wiki-style connections added later

### Open Skills — Method
- Portable SKILL.md files that travel across Claude Code, Codex, Cursor, ChatGPT
- Thesis: skills leaving your hands should be yours, not rented
- Published as community-contributed library in OB1 repo
- Includes OpenClaw skill packs for agent memory recall/write-back

### Open Engine — Orchestration
- Agent-to-agent task handoff framework
- Shared task list + 7-part task record carrying jobs across tools
- Copy-paste templates, not code
- Receipt vocabulary for agent accountability

## The "Responsible Utility" loop (5 parts)

1. Memory — agent starts from your context, not zero
2. Method — agent follows your way of working (skills)
3. Boundary — agent knows what it can and can't do
4. Receipt — agent proves what it did and why
5. Judgment — human approves before irreversible action

## Key evolution: Feb → July 2026

- February: required SQL, config, MCP wiring, CLI fluency
- July: point Claude Code or Codex at the repo, agent builds 80% of the stack through conversation
- "A fifth as technical as February"

## AIOS comparison

| Nate's concept | AIOS equivalent | Delta |
|---|---|---|
| Open Brain (Supabase + vectors) | context/ + state/ + docs/wiki/ + graphify-out/ | Flat files + knowledge graph vs vector DB. More portable, no infra cost, but no semantic search across raw captures. |
| Open Skills | ~/.claude/skills/ + project skills | Same concept, same format. AIOS is deeper (GSD, dispatch, triage, board, retro, level-up). His are more cross-platform portable. |
| Open Engine (agent handoffs) | /dispatch + /scheduled-triage + nightshift | AIOS has working orchestration. His is a protocol spec. |
| Memory → Method → Boundary → Receipt → Judgment | CLAUDE.md rules + hooks + draft-only Gmail + /wrap handoffs | Same loop, different mechanisms. His is framework-level; AIOS is baked into daily ops. |
| "Rent intelligence, own memory" | Model-agnostic AIOS design | Philosophically identical. AIOS more Claude-native in practice. |

## Stealable ideas

1. **Receipt vocabulary.** His agent accountability pattern (provenance, recall-trace, use-policy on memories) is more formalized. Could harden /dispatch routing with explicit provenance on routed items.
2. **Cross-platform portability framing.** If BGD skills or AIOS ever need to work with Codex/Cursor/open-source, his Open Skills format is closest to a standard.
3. **"One repeated task" onboarding pitch.** "Pick one repeated part of your life, build the loop for that one thing." Killer client-facing framing for the AI automation service line. Simpler than explaining the full AIOS.

## Lemonade insurance story (cautionary tale)

Nikita's OpenClaw agent beat Lemonade insurance by sending an email without permission. The agent misinterpreted silence as approval. Great outcome, terrible mechanism. Nate uses this as the case for why boundaries and receipts are non-negotiable in agent design.

## Links

- Video: https://youtu.be/HgAQOkG_v8c
- Substack guide (paid): https://natesnewsletter.substack.com/p/build-your-own-ai-memory
- GitHub: https://github.com/NateBJones-Projects/OB1
- Open Skills article: https://natesnewsletter.substack.com/p/claude-codex-agent-skills
- Open Engine article: https://natesnewsletter.substack.com/p/ai-agent-handoffs
- /loop heartbeat article: https://natesnewsletter.substack.com/p/your-ai-agent-needs-three-things
