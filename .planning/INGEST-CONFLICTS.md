## Conflict Detection Report

### BLOCKERS (0)

(none)

### WARNINGS (0)

(none)

### INFO (3)

[INFO] Auto-resolved: ADR 0004 > v3 SPEC on capture write-target
  Note: docs/superpowers/specs/2026-05-19-aios-ui-v3-design.md §Architecture describes the `/capture` skill as "routes the content to the right filesystem destination (memory, wiki, decisions log)" — implying direct writes to curated wiki/memory/decisions paths. ADR 0004 (LOCKED, 2026-05-21) restricts AIOS writes to `{wikiPath}/raw/aios/<kind>-YYYY-MM-DD-<slug>.md` only, with promotion delegated to the llm-wiki ingest pass. Precedence: ADR > SPEC and ADR 0004 is locked. The SPEC's capture pipeline plumbing (subprocess, SSE route, CaptureBox component) remains valid; the write target is now `raw/aios/capture-…md` instead of direct-to-curated. Synthesized constraints.md → CON-v3-capture-pipeline reflects this correction.

[INFO] Locked ADR supersession: ADR 0005 refines ADR 0001 §6 mechanism (not a contradiction)
  Note: ADR 0001 §6 (LOCKED, 2026-05-19) specifies project chat fires `claude --print "/load {slug}"` on first drawer expand and injects the resulting brief as opening context, reusing the session on subsequent expansions. ADR 0005 (LOCKED, 2026-05-21) Context section explicitly states the v1 wiring "never landed" — operator has to drop to CLI before UI chat works. ADR 0005 adopts pre-built indexed briefs: a background indexer + chokidar watcher keeps `.aios-cache/briefs/<slug>.md` fresh; chat reads the cached brief on every session bootstrap. Both ADRs are locked but ADR 0005 is the later refinement of the same flow (same `/load-project` subprocess produces the content; only the trigger moves from request-time to background). Treated as supersession-by-newer-locked-ADR per ADR 0005's own Context framing, NOT a LOCKED-vs-LOCKED contradiction. decisions.md → DEC-project-chat-auto-load-on-first-expand carries the supersession note pointing to DEC-chat-hydration-indexed-briefs.

[INFO] Auto-resolved: ADR 0001 §4 "no persistent cache" scope clarified vs v3 cache layout
  Note: ADR 0001 §4 states "No SQLite, no persistent cache, no database. The filesystem is the source of truth; the index is derived and rebuilt on server restart." The v3 SPEC introduces `.aios-cache/rituals/<slug>.json` per-ritual cache files (and ADR 0005 introduces `.aios-cache/briefs/<slug>.md`). These are skill-output snapshots/caches for UI badges + chat hydration, not derived indices of the filesystem corpus. ADR 0001's "no persistent cache" applies to the in-memory file index (clients.yaml + references + memory + wiki). The `.aios-cache/` sidecar for session IDs and skill outputs is already present in ADR 0001 §3 ("Session IDs persist in a `.aios-cache/` sidecar so chats survive UI restarts"). No contradiction — different layers. Recorded for transparency.
