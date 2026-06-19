# Phase 5: End-of-Session State Hook - Research

**Researched:** 2026-06-04
**Domain:** Claude Code hooks system, session lifecycle, transcript parsing, LLM summarization
**Confidence:** HIGH

## Summary

This phase ships a Claude Code hook that auto-generates `STATE.md` in project wikis at session end, with a copy synced to `claude-os/state/<slug>.md`. The technical domain is well-understood: Claude Code v2.1.162 provides both `Stop` (fires after each agent turn) and `SessionEnd` (fires once at session termination) hook events. Both are documented in the official hooks reference with clear input schemas.

The recommended architecture uses a **two-hook design**: a `Stop` command hook that runs after each turn to accumulate session metrics (edits, commits, messages) in a temp file, and a `SessionEnd` command hook that reads those metrics, applies the substance threshold, and -- if met -- invokes `claude -p --bare` to generate the LLM summary, then writes STATE.md to both target locations. This separates metric collection (cheap, runs every turn) from summarization (expensive, runs once at session end). The `--bare` flag on the `claude -p` call prevents recursive hook firing.

**Primary recommendation:** Use a `SessionEnd` command hook (Node.js script) that reads the transcript JSONL to assess session substance, invokes `claude -p --bare` for LLM summarization when the threshold is met, and writes to both the project wiki and `claude-os/state/<slug>.md`. Project identification uses a cwd-to-`clients.yaml` reverse lookup.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STATE-01 | End-of-session hook generates STATE.md in project wiki with status, accomplishments, next steps, blockers, and key dates | SessionEnd hook event fires at session termination; `transcript_path` field provides the JSONL conversation history; `claude -p --bare` generates the LLM summary |
| STATE-02 | End-of-session hook syncs STATE.md copy to claude-os `state/<slug>.md` | Hook receives `cwd` in stdin JSON; reverse-lookup against `clients.yaml` `docs_paths` resolves the project slug; `fs.copyFileSync` after wiki write |
| STATE-03 | Hook is gated on session substance (skips trivial sessions based on edits/messages/commits threshold) | Transcript JSONL contains all tool_use entries (Bash, Edit, Write); count user messages, tool uses by type, and git commits; threshold logic in the hook script |
| STATE-04 | LLM summarizes session context into tight STATE.md when substance threshold is met | `claude -p --bare` with system prompt containing the transcript summary and STATE.md template; non-interactive, no hooks fire recursively |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Session substance detection | Hook script (Node.js) | -- | Transcript JSONL parsing is local file I/O; no network or LLM needed |
| LLM summarization | Claude CLI subprocess | -- | `claude -p --bare` provides single-turn LLM call; the hook script orchestrates |
| Wiki path resolution | Hook script (Node.js) | -- | Reads `clients.yaml` and matches `cwd` against `docs_paths` entries |
| File writes (STATE.md) | Hook script (Node.js) | -- | Two `fs.writeFileSync` calls to wiki root and `state/<slug>.md` |
| Project identification | Hook script (Node.js) | -- | Reverse-lookup: cwd -> docs_paths -> client/project slug |
| Idempotency check | Hook script (Node.js) | -- | Compare generated content hash against existing STATE.md; skip write if identical |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js (built-in fs, path, child_process) | v24.x (installed) | Hook script runtime, file I/O, subprocess spawning | Already used by all existing GSD hooks; no external deps needed [VERIFIED: local `node --version` returns v24.14.1] |
| js-yaml | (project dep) | Parse `clients.yaml` for cwd-to-project mapping | Already a project dependency in `aios-ui/`; used by `lib/data/clients.ts` [VERIFIED: codebase grep] |
| claude CLI | v2.1.162 | Non-interactive LLM summarization via `claude -p --bare` | Already installed; `--bare` flag prevents recursive hook firing [VERIFIED: `claude --version`] |
| jq | (system) | Optional: quick JSON extraction in bash fallback | Available at `/usr/bin/jq` [VERIFIED: `which jq`] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| crypto (Node.js built-in) | -- | SHA-256 hash for idempotency check | Compare generated STATE.md content against existing file to avoid no-op writes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `claude -p --bare` for summarization | Anthropic API directly via `fetch` | API key management, more code, but avoids CLI dependency; CLI is simpler and already installed |
| Node.js hook script | Bash shell script | Bash is harder to maintain for YAML parsing and JSON manipulation; Node.js matches existing hooks |
| `SessionEnd` hook | `Stop` hook with prompt type | Prompt hooks are single-turn evaluations returning ok/block JSON; they cannot write files as side effects |
| `SessionEnd` hook | `Stop` hook with command type (every turn) | Would run the summarization on every turn, not just session end; wasteful and disruptive |

**Installation:**
```bash
# No new packages needed -- all dependencies are already available
# The hook script goes in ~/.claude/hooks/ (user-level, all projects)
# Configuration goes in ~/.claude/settings.json (user-level hooks section)
```

## Architecture Patterns

### System Architecture Diagram

```
Session active
    |
    v
[PostToolUse hook] ---> accumulate metrics in /tmp/claude-state-{session_id}.json
    |                    (count: edits, writes, bash calls, user messages)
    |
Session ends (user exits / Ctrl+C / /exit / /clear)
    |
    v
[SessionEnd hook fires]
    |
    +--> Read /tmp/claude-state-{session_id}.json
    |
    +--> Apply substance threshold
    |     (edits + writes >= 1 OR user_messages >= 3 OR commits >= 1)
    |
    +--[below threshold]--> exit 0 (no STATE.md written)
    |
    +--[above threshold]--> Parse transcript JSONL for context
    |                        |
    |                        v
    |                   [claude -p --bare] with system prompt + transcript excerpt
    |                        |
    |                        v
    |                   Generated STATE.md content
    |                        |
    |                        +--> Hash compare with existing STATE.md
    |                        |     |
    |                        |     +--[identical]--> exit 0 (no diff)
    |                        |     |
    |                        |     +--[different]--> Write to wiki + state/<slug>.md
    |                        |
    +--> Resolve cwd -> project via clients.yaml reverse lookup
    |     |
    |     +--> Find wiki root via docs_paths + wiki detection
    |     |
    |     +--> Determine slug for state/<slug>.md
    |
    +--> Clean up /tmp/claude-state-{session_id}.json
```

### Recommended Project Structure

```
~/.claude/hooks/
├── state-session-metrics.js    # PostToolUse hook: accumulate session metrics
├── state-session-end.js        # SessionEnd hook: substance check + summarize + write
└── lib/
    └── (existing shared utilities)

~/repos/claude-os/
├── state/                       # NEW: synced STATE.md copies (one per project slug)
│   ├── mr-gym-online-store.md
│   ├── wild-rose-redesign.md
│   └── ...
├── scripts/
│   └── state-hook/              # NEW: supporting scripts (if needed)
│       └── state-prompt.md      # System prompt template for LLM summarization
└── clients.yaml                 # Existing: cwd -> project reverse lookup source
```

### Pattern 1: PostToolUse Metrics Accumulator

**What:** A lightweight PostToolUse hook that increments counters in a temp file every time a substantive tool is used (Edit, Write, Bash with `git commit`).
**When to use:** Every tool call during a session.
**Example:**
```javascript
// Source: Pattern derived from existing gsd-context-monitor.js hook
const fs = require('fs');
const os = require('os');
const path = require('path');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 5000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;
    if (!sessionId || /[/\\]|\.\./.test(sessionId)) process.exit(0);

    const metricsPath = path.join(os.tmpdir(), `claude-state-${sessionId}.json`);
    let metrics = { edits: 0, writes: 0, bash: 0, commits: 0, user_messages: 0, cwd: data.cwd };
    try { metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8')); } catch {}

    const toolName = data.tool_name;
    if (toolName === 'Edit' || toolName === 'MultiEdit') metrics.edits++;
    else if (toolName === 'Write') metrics.writes++;
    else if (toolName === 'Bash') {
      metrics.bash++;
      const cmd = data.tool_input?.command || '';
      if (cmd.includes('git commit')) metrics.commits++;
    }

    fs.writeFileSync(metricsPath, JSON.stringify(metrics));
  } catch {}
  process.exit(0);
});
```

### Pattern 2: SessionEnd State Generator

**What:** The main SessionEnd hook that checks substance, generates STATE.md via LLM, and writes to both locations.
**When to use:** Fires once at session termination.
**Example:**
```javascript
// Source: Official docs SessionEnd hook pattern + codebase clients.yaml parsing
// Pseudocode for the main flow:

// 1. Read metrics from /tmp/claude-state-{session_id}.json
// 2. Apply substance threshold
// 3. If below threshold, exit 0
// 4. Read transcript JSONL (last N entries for context)
// 5. Resolve cwd -> project slug via clients.yaml
// 6. If no project match, exit 0 (not a tracked project)
// 7. Find wiki root via docs_paths + wiki detection
// 8. Invoke: claude -p --bare --model haiku "Generate STATE.md..." < transcript_excerpt
// 9. Hash-compare result with existing STATE.md
// 10. If different, write to wiki/STATE.md and state/<slug>.md
// 11. Clean up temp metrics file
```

### Pattern 3: CWD-to-Project Reverse Lookup

**What:** Given a session's `cwd` (e.g., `/Users/justinlobaito/repos/mr-gym-online-store`), find the matching client/project slug in `clients.yaml`.
**When to use:** Every SessionEnd invocation to determine where to write STATE.md.
**Example:**
```javascript
// Source: Derived from clients.yaml structure analysis
function findProjectByCwd(clients, cwd) {
  // Strategy: check if cwd is a prefix of any docs_path,
  // or if any docs_path is under cwd
  for (const client of clients) {
    for (const project of client.projects || []) {
      for (const dp of project.docs_paths || []) {
        const resolved = dp.startsWith('/') ? dp : path.join(CLAUDE_OS_ROOT, dp);
        // Check if the docs_path is under the cwd
        if (resolved.startsWith(cwd + '/') || resolved === cwd) {
          return { clientSlug: client.slug, projectSlug: project.slug, docsPath: resolved };
        }
      }
    }
  }
  return null;
}
```

### Anti-Patterns to Avoid

- **Running `claude -p` on every Stop event:** Stop fires after every agent turn. Summarization is expensive and disruptive. Only summarize at SessionEnd.
- **Parsing the entire transcript JSONL into memory:** Transcripts can be very large (hundreds of MB for long sessions). Read only the last N lines or stream-parse for metrics.
- **Writing STATE.md without idempotency check:** If the session didn't change anything meaningful, the hook should produce no diff. Hash-compare before writing.
- **Using prompt-type hooks for file writes:** Prompt hooks return JSON decisions; they cannot perform side effects like file writes. Use command hooks.
- **Hardcoding project paths:** Always resolve via `clients.yaml` so new projects are automatically supported.
- **Firing hooks recursively:** The `claude -p` call MUST use `--bare` to skip hooks, or the SessionEnd hook will trigger itself.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML parsing | Custom regex parser | `js-yaml` npm package (already in project) | YAML has edge cases (multiline strings, anchors, special chars) that regex misses [VERIFIED: already used in aios-ui/lib/data/clients.ts] |
| LLM summarization | Direct Anthropic API calls with `fetch` | `claude -p --bare` CLI subprocess | Handles auth, rate limiting, model selection; `--bare` prevents recursive hooks [VERIFIED: `claude --help`] |
| Session transcript parsing | Full in-memory JSON parse of JSONL | Line-by-line streaming with `readline` | Transcripts can be hundreds of MB; streaming avoids OOM [ASSUMED] |
| Wiki root detection | Path heuristics | Reuse `detectWiki()` pattern from `aios-ui/lib/data/wiki.ts` | Already handles WIKI-CLAUDE.md detection, structural markers [VERIFIED: codebase] |
| File write atomicity | Direct `writeFileSync` | Temp file + rename (`fs.renameSync`) | Prevents half-written STATE.md if process is interrupted [ASSUMED] |

**Key insight:** The hook script lives in `~/.claude/hooks/` (user-level, outside aios-ui), so it cannot `import` from `aios-ui/lib/`. The YAML parsing and wiki detection logic must be self-contained in the hook script or extracted into `~/.claude/hooks/lib/`.

## Common Pitfalls

### Pitfall 1: SessionEnd Timeout (1.5s default)
**What goes wrong:** SessionEnd hooks have a default timeout of 1.5 seconds. An LLM summarization call via `claude -p` takes 5-15 seconds. The hook times out and the STATE.md is never written.
**Why it happens:** SessionEnd's default timeout is deliberately short to avoid blocking session exit.
**How to avoid:** Set an explicit `timeout` in the hook configuration. The docs state: "If a hook needs more time, set a per-hook timeout in the hook configuration. The overall budget is automatically raised to the highest per-hook timeout configured in settings files, up to 60 seconds." Set `"timeout": 30` (30 seconds). Alternatively, set `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=30000` environment variable.
**Warning signs:** STATE.md files are never created despite substantive sessions.
[CITED: https://code.claude.com/docs/en/hooks — SessionEnd input section]

### Pitfall 2: Recursive Hook Firing
**What goes wrong:** The `claude -p` subprocess used for LLM summarization triggers its own hooks, including the SessionEnd hook, creating infinite recursion.
**Why it happens:** `claude` CLI fires hooks by default on every invocation.
**How to avoid:** Use `claude -p --bare` which "skips hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and CLAUDE.md auto-discovery."
**Warning signs:** Multiple STATE.md writes per session, or process hangs.
[CITED: `claude --help` output — --bare flag description]

### Pitfall 3: CWD Mismatch for claude-os Sessions
**What goes wrong:** When working in claude-os itself (`cwd = /Users/justinlobaito/repos/claude-os`), the hook should NOT write a STATE.md to a project wiki -- claude-os has its own `.planning/STATE.md`. Writing to `state/claude-os.md` would create circular self-reference.
**Why it happens:** claude-os is in `clients.yaml` under `bgd-hq` but the hook's target is project wikis, not the AIOS itself.
**How to avoid:** Skip hook execution when `cwd` matches the claude-os root path. Or treat claude-os sessions specially (update `.planning/STATE.md` instead of `state/<slug>.md`).
**Warning signs:** Duplicate or conflicting state files for claude-os.

### Pitfall 4: Stop Hook Fires Every Turn, Not Just Session End
**What goes wrong:** Developer uses a Stop hook for summarization, and it runs after every single agent turn (every time Claude stops responding), not just at session exit.
**Why it happens:** Per the official docs: "Stop: When Claude finishes responding" -- this is per-turn, not per-session. The `stop_hook_active` field can be true when Claude is already continuing from a prior Stop block.
**How to avoid:** Use `SessionEnd` for the summarization step, not `Stop`. Use `PostToolUse` only for lightweight metric accumulation.
**Warning signs:** Multiple STATE.md writes within a single session, LLM costs spike.
[CITED: https://code.claude.com/docs/en/hooks — Stop section, SessionEnd section]

### Pitfall 5: Transcript Path Not Available in SessionEnd
**What goes wrong:** The `transcript_path` field may not contain the expected data, or the transcript file may have been partially written.
**Why it happens:** SessionEnd fires during session teardown; the transcript may still be flushing.
**How to avoid:** Read the transcript immediately (it should be available as a JSONL file at `transcript_path`). The Stop hook input explicitly documents `transcript_path` and `last_assistant_message`; SessionEnd also receives `transcript_path` as part of common input fields. If the file doesn't exist or is empty, skip gracefully.
**Warning signs:** Empty or truncated STATE.md files.
[CITED: https://code.claude.com/docs/en/hooks — Common input fields]

### Pitfall 6: Non-Tracked Project Sessions
**What goes wrong:** User starts a Claude Code session in a repo not listed in `clients.yaml`. The hook fails trying to resolve the project.
**Why it happens:** Not every repo has a corresponding entry in `clients.yaml` (e.g., personal experiments, 2RM work).
**How to avoid:** The cwd-to-project lookup must return null gracefully, and the hook must exit 0 without writing anything. Log a debug message to stderr if desired.
**Warning signs:** Hook errors in Claude Code output for non-tracked repos.

## Code Examples

### SessionEnd Hook Configuration (settings.json)
```json
// Source: Official docs hook configuration pattern
// Add to ~/.claude/settings.json under "hooks"
{
  "SessionEnd": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "\"/Users/justinlobaito/.nvm/versions/node/v24.14.1/bin/node\" \"/Users/justinlobaito/.claude/hooks/state-session-end.js\"",
          "timeout": 30
        }
      ]
    }
  ]
}
```
[CITED: https://code.claude.com/docs/en/hooks]

### PostToolUse Metrics Hook Configuration
```json
// Source: Derived from existing PostToolUse hooks in settings.json
// Add to the existing PostToolUse array in ~/.claude/settings.json
{
  "matcher": "Edit|Write|MultiEdit|Bash",
  "hooks": [
    {
      "type": "command",
      "command": "\"/Users/justinlobaito/.nvm/versions/node/v24.14.1/bin/node\" \"/Users/justinlobaito/.claude/hooks/state-session-metrics.js\"",
      "timeout": 5
    }
  ]
}
```

### SessionEnd Input Schema
```json
// Source: Official docs SessionEnd input section
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/Users/justinlobaito/repos/mr-gym-online-store",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```
[CITED: https://code.claude.com/docs/en/hooks — SessionEnd input]

### Stop Hook Input Schema (for reference)
```json
// Source: Official docs Stop input section
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "auto",
  "hook_event_name": "Stop",
  "stop_hook_active": false,
  "last_assistant_message": "Analysis complete. Found 3 potential issues...",
  "background_tasks": [],
  "session_crons": []
}
```
[CITED: https://code.claude.com/docs/en/hooks — Stop input]

### STATE.md Template
```markdown
# Project State: {project-name}

**Updated:** {ISO date}
**Session:** {session_id}
**Status:** {On track | At risk | Blocked | Wrapping up}

## Accomplishments (this session)
- {what was done}

## Current Status
{1-2 sentence summary of where the project stands}

## Next Steps
- [ ] {actionable next step with context}

## Blockers
- {blocker or "None"}

## Key Dates
- {date}: {what's happening}
```

### Transcript JSONL Entry Types
```javascript
// Source: Verified by parsing actual transcript file
// Types found in transcript JSONL:
// - "queue-operation": session queue management
// - "attachment": session metadata (cwd, version, gitBranch, slug)
// - "user": user messages (has .message field)
// - "assistant": Claude responses (has .message.content[] with type: "text" or "tool_use")
// - "file-history-snapshot": file state checkpoints
// - "last-prompt": prompt tracking
// - "ai-title": auto-generated session title
```
[VERIFIED: parsed actual transcript file at ~/.claude/projects/-Users-justinlobaito-repos-mr-gym-online-store/8f036d8b.jsonl]

### Substance Threshold Logic
```javascript
// Source: Requirements analysis + practical heuristics
function isSubstantive(metrics) {
  // A session is "substantive" if any of these are true:
  // 1. At least 1 file edit or write occurred
  // 2. At least 1 git commit was made
  // 3. At least 3 user messages were sent (indicates meaningful conversation)
  return (
    (metrics.edits + metrics.writes) >= 1 ||
    metrics.commits >= 1 ||
    metrics.user_messages >= 3
  );
}
```
[ASSUMED — threshold values are a design decision; these are reasonable defaults]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No session state persistence | Claude Code hooks system (SessionStart, Stop, SessionEnd) | Claude Code v2.1.x (2025-2026) | Enables automated workflows at session lifecycle points |
| Stop hook only (per-turn) | SessionEnd hook (per-session) | Added to Claude Code hooks reference | Clean separation of per-turn vs per-session logic |
| Prompt hooks for side effects | Command hooks for file I/O, prompt hooks for decisions only | Claude Code hooks docs clarification | Prompt hooks cannot write files; they return JSON decisions |

**Deprecated/outdated:**
- Using `Stop` for session-end tasks: `Stop` fires per-turn, not per-session. Use `SessionEnd` for cleanup and state persistence. [CITED: https://code.claude.com/docs/en/hooks]
- Writing escape sequences to `/dev/tty`: Use `terminalSequence` JSON field instead. [CITED: https://code.claude.com/docs/en/hooks]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Substance threshold of edits >= 1 OR commits >= 1 OR user_messages >= 3 is appropriate | Substance Threshold Logic | Too low = noisy state files; too high = missed updates. Easily tunable post-deploy. |
| A2 | `claude -p --bare --model haiku` will complete within 30 seconds for transcript summarization | Pitfall 1 | If too slow, the SessionEnd timeout kills the hook. Mitigation: increase timeout or use a smaller context window. |
| A3 | Transcripts may be hundreds of MB for long sessions; streaming parse is needed | Don't Hand-Roll | If transcripts are always small, a full in-memory parse would be simpler. Defensive approach is safer. |
| A4 | Temp file + rename is needed for atomic writes of STATE.md | Don't Hand-Roll | If process interruption during STATE.md write is rare, direct writeFileSync is simpler. Defensive approach is safer. |
| A5 | The hook should live at user level (`~/.claude/hooks/`) not project level (`.claude/hooks/`) | Architecture | If it's project-level, it only works for repos that include the hook file. User-level means it works for all tracked projects automatically. |
| A6 | Using Haiku model for summarization keeps cost and latency low | Code Examples | If Haiku produces insufficient quality, may need to use Sonnet. Cost difference is significant over many sessions. |

## Open Questions

1. **claude-os self-referential state**
   - What we know: claude-os is in `clients.yaml` under `bgd-hq`. Sessions in claude-os have `cwd = /Users/justinlobaito/repos/claude-os`.
   - What's unclear: Should the hook update `.planning/STATE.md` (the existing GSD planning state) or `state/claude-os.md` or both? The existing `.planning/STATE.md` has a different format and purpose (GSD phase tracking, not session-based project status).
   - Recommendation: Skip claude-os sessions entirely. The `.planning/STATE.md` is managed by the GSD workflow, not by end-of-session hooks. The `state/` directory is for project wikis.

2. **Multi-project sessions (site-builder-phase2)**
   - What we know: `site-builder-phase2` maps to multiple projects in `clients.yaml` (terraplex-hub, brandos). A session's `cwd` of `/Users/justinlobaito/repos/site-builder-phase2` could map to either.
   - What's unclear: Should the hook write STATE.md for all matching projects, or pick the most specific match?
   - Recommendation: Pick the first match. The cwd-to-project lookup should be ordered by specificity (longer docs_path prefix = more specific match).

3. **SessionEnd timeout budget**
   - What we know: Default is 1.5s. Per-hook timeout can be set up to 60s. `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` overrides.
   - What's unclear: Will 30 seconds be enough for `claude -p --bare` to complete the summarization?
   - Recommendation: Start with 30s timeout. If insufficient, increase to 45s. The hook should handle timeout gracefully (partial writes are worse than no writes).

4. **Existing PostToolUse hooks performance**
   - What we know: There are already 4 PostToolUse hook groups. Adding a 5th (metrics accumulator) adds latency to every tool call.
   - What's unclear: How much latency does each hook add? Is there a practical limit?
   - Recommendation: Keep the metrics hook extremely lightweight (< 5ms). File write to /tmp should be fast. The `timeout: 5` setting matches existing hooks.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Hook scripts | Yes | v24.14.1 | -- |
| claude CLI | LLM summarization | Yes | v2.1.162 | -- |
| jq | Optional JSON parsing | Yes | /usr/bin/jq | Node.js JSON.parse |
| js-yaml (npm) | clients.yaml parsing | Yes (in aios-ui) | -- | Inline YAML parsing in hook script (or vendored copy) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- `js-yaml` is available in `aios-ui/node_modules` but the hook script lives in `~/.claude/hooks/` outside the project. Options: (a) inline a minimal YAML parser for the simple `clients.yaml` structure, (b) require `js-yaml` from the aios-ui `node_modules` path, (c) install `js-yaml` globally, (d) use a simpler format (JSON) for the project lookup config. Recommendation: require from the aios-ui path since it's a known stable location, or bundle a self-contained YAML parser since `clients.yaml` uses only simple structures.

## Security Domain

This phase has minimal security surface. The hook processes local files only.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | -- |
| V3 Session Management | No | -- |
| V4 Access Control | No | -- |
| V5 Input Validation | Yes | Sanitize `session_id` from stdin to prevent path traversal (already patterned in existing hooks) |
| V6 Cryptography | No | -- |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via session_id | Tampering | Reject session_id containing `/`, `\`, or `..` (pattern from gsd-context-monitor.js) |
| Arbitrary file write via crafted cwd | Tampering | Validate cwd against known repo paths from clients.yaml; never write outside known wiki roots |
| Transcript content injection | Information Disclosure | Transcript is read-only for the hook; LLM prompt uses system prompt with clear boundaries |

## Sources

### Primary (HIGH confidence)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) — Full event lifecycle, SessionEnd input schema, Stop input schema, matcher patterns, timeout behavior, `--bare` flag documentation
- Existing codebase: `~/.claude/settings.json` — Current hook configuration with SessionStart, PreToolUse, PostToolUse patterns
- Existing codebase: `~/.claude/hooks/gsd-context-monitor.js` — Reference implementation for PostToolUse hook with stdin parsing, session_id sanitization, temp file metrics
- Existing codebase: `aios-ui/lib/data/clients.ts` — `loadClients()`, `getProject()` functions
- Existing codebase: `aios-ui/lib/data/wiki.ts` — `detectWiki()`, `resolveProjectWikiPath()` functions
- Existing codebase: `clients.yaml` — Full client/project registry with `docs_paths` entries

### Secondary (MEDIUM confidence)
- [GitHub Issue #29881](https://github.com/anthropics/claude-code/issues/29881) — Stop hook not firing on silent tool stops (closed)
- [GitHub Issue #34954](https://github.com/anthropics/claude-code/issues/34954) — SessionEnd hook feature request (closed as duplicate of #16886, SessionEnd now exists)
- [Stop Hook for Multi-Agent Collaboration](https://dev.to/agent-room/how-a-claude-code-stop-hook-unlocks-async-multi-agent-collaboration-no-polling-required-2e0e) — Practical Stop hook patterns

### Tertiary (LOW confidence)
- [Claude Code Session Lifecycle Hooks](https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks) — Community guide with practical examples

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed and verified; hook system documented in official reference
- Architecture: HIGH — two-hook pattern (PostToolUse metrics + SessionEnd summarize) is clean separation; all components verified
- Pitfalls: HIGH — SessionEnd timeout, recursive hooks, Stop-vs-SessionEnd distinction all documented in official sources
- CWD-to-project mapping: MEDIUM — reverse lookup from cwd to clients.yaml docs_paths is the right approach but multi-project repos need careful ordering

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (stable domain; Claude Code hooks API unlikely to break in 30 days)
