# ADR 0009 — Interactive choice rendering

**Date:** 2026-06-25
**Status:** Accepted

## Problem

The AIOS UI chat renders all assistant output as plain text (`whitespace-pre-wrap` in `chat-message.tsx`). When claude presents numbered options, yes/no prompts, or other decision-based choices — as grill-me, brainstorming, and planning skills routinely do — the user has to read the options, mentally map them, then manually type a response. The IDE extension (VS Code) renders these same patterns as clickable buttons. The terminal shows raw text and expects "1" or "2". The AIOS UI should match or exceed the IDE experience since it's the primary planning surface.

## Decision

### 1. Pattern-match assistant text for choice structures

Parse completed assistant messages for recognizable choice patterns:

- **Numbered options:** `1. Option text`, `2. Option text`, etc. (the most common — grill-me, brainstorm, CE plan prompts all use this)
- **Yes/No prompts:** Detectable from trailing questions with binary framing ("Does that capture it?", "Ready to proceed?", "Should we X or Y?")
- **Lettered options:** `a)`, `b)`, `c)` variants (less common but appears in some skills)

Detection runs client-side after streaming completes (`status === 'done'`). No parsing during streaming — wait for the full message.

### 2. Render choices as clickable UI elements

When a choice pattern is detected, render the options as styled buttons below the message text. The message text stays visible as-is (context matters); the buttons are an affordance layer on top, not a replacement.

Button click auto-submits the selection as the next user message. For numbered options, send the number and a brief echo (e.g., "1 — Option A") so the conversation reads naturally in the transcript. For yes/no, send "Yes" or "No".

### 3. Pure frontend — no backend changes

The `chat.ts` subprocess plumbing, API routes, and streaming protocol stay untouched. This is entirely in `chat-message.tsx` (detection + rendering) and `chat-panel.tsx` (click-to-submit wiring). The `ChatMessage` type does not need new fields — detection is derived from `content` at render time.

## What we are NOT building

- **Structured output protocol.** No custom markup, no skill-side changes, no `<!-- choices -->` delimiters. Pattern-match what claude already outputs. If detection needs to get smarter later, that's a follow-up.
- **In-stream choice rendering.** Choices only render after `status === 'done'`. No partial detection during streaming.
- **Backend choice extraction.** The subprocess (`extractTextDelta`) stays unchanged. Detection is purely in the React component.
- **Grill-me-to-ADR pipeline.** This ADR covers the interactive rendering. The `/write-adr` skill and the planning workflow that uses it are separate concerns.
- **Markdown rendering.** The chat currently renders plain text. Full markdown rendering is a separate, larger decision. This ADR adds one specific interactive pattern on top of the existing plain text renderer.

## Consequences

### Positive

- Planning sessions (grill-me, brainstorm, CE plan) become one-click interactions instead of manual typing
- Reduces friction for the most common AIOS UI workflow: discuss → decide → ADR
- No risk to existing chat — detection is additive, buttons overlay existing text

### Negative / accepted trade-offs

- Pattern matching is heuristic — false positives possible (e.g., a numbered list that isn't a choice prompt). Acceptable: a misdetected button click just sends a message; no destructive action.
- Detection regex/logic will need tuning as we see real skill output. Start simple, iterate.

### Reversibility

Fully reversible. It's a rendering enhancement in one component. Remove the detection logic and buttons, and you're back to plain text. Zero data model or backend impact.

## Implementation notes

**Files to touch:**

- `components/chat-message.tsx` — Add choice detection function and button rendering. The component already receives the full `ChatMessage` with `content` and `status`. Add detection when `status === 'done'` and `role === 'assistant'`.
- `components/chat-panel.tsx` — Wire button clicks to the existing `submit()` function. The submit path (`fetch → /api/chat/aios/message → runChatMessage`) already handles arbitrary user text. No changes needed to the submit plumbing itself — just expose it to the buttons via a callback prop or context.

**Detection approach (start simple):**

1. Split message content by lines
2. Look for consecutive lines matching `/^\d+\.\s+.+/` (numbered options)
3. Require 2+ consecutive matches to trigger (avoid false positives on single numbered items)
4. For yes/no: detect trailing question + binary framing words in the last ~2 sentences

**Existing patterns to follow:**

- `ChatMessageDropButton` in `chat-message-drop-button.tsx` is the closest analog — a conditional UI element rendered on completed assistant messages. Follow the same pattern: conditional render, same styling tokens.
- `SlashCommand` autocomplete in `chat-panel.tsx` shows the existing click-to-submit pattern (menu item → auto-fill input → submit).

**Styling:** Use existing `Button` from `components/ui/button` with `variant="outline"` and `size="sm"`. Stack vertically for numbered options, inline for yes/no.

## Success criteria

1. A grill-me session in the AIOS UI renders numbered options as clickable buttons
2. Clicking a button submits the choice and continues the conversation without manual typing
3. Yes/No prompts render as two inline buttons
4. No regressions in plain-text message rendering for messages without choice patterns
5. No backend or API route changes required

## Cross-references

- ADR 0001 — AIOS UI architecture (chat subprocess model)
- ADR 0008 — Todo card actions (prior UI interaction pattern)
- `/write-adr` skill — the downstream consumer; this ADR makes planning sessions more interactive, which feeds richer context into `/write-adr`
