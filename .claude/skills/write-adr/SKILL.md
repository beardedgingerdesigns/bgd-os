---
name: write-adr
description: Capture a decision from conversation into a numbered ADR at docs/adr/ and auto-append to decisions/log.md. Output only — writes documentation, never runs implementation pipelines. Use when Justin says "/write-adr", "write an ADR for this", "capture this as an ADR", "ADR this", or after a discussion reaches a clear architectural decision worth locking down.
---

# Write ADR

Extract the decision from conversation context and produce two artifacts:

1. **ADR file** at `docs/adr/NNNN-<slug>.md`
2. **Decision log entry** appended to `decisions/log.md`

This is a documentation skill. It writes files and stops. No code, no pipelines, no implementation. The ADR is a handoff artifact for a terminal or cloud code session running the CE pipeline.

## Steps

### 1. Determine the next ADR number

Read `docs/adr/` and find the highest existing number. Next = highest + 1, zero-padded to 4 digits.

### 2. Confirm scope with Justin

Before writing, present a one-paragraph summary of what you'll capture:
- **Title** (short, kebab-case slug)
- **Problem** (1-2 sentences)
- **Decision** (the choice, in one sentence)
- **Key alternatives rejected** (names only)

Wait for approval or correction. Don't write until confirmed.

### 3. Write the ADR

Use the established format from existing ADRs in `docs/adr/`. The structure:

```markdown
# ADR NNNN — <Title>

**Date:** YYYY-MM-DD
**Status:** Accepted

## Problem

<What triggered this decision. What's broken, missing, or ambiguous.>

## Decision

<The choice, with numbered sub-decisions if the decision has multiple parts.>

### 1. <Sub-decision title>

<Detail. Include rejected alternatives inline when they clarify the choice.>

## What we are NOT building

<Explicit scope cuts. Things someone might assume are included but aren't.>

## Consequences

### Positive

<What gets better.>

### Negative / accepted trade-offs

<What gets worse or harder. Be honest.>

### Reversibility

<How hard is it to undo this? What's the blast radius?>

## Implementation notes

<Enough context for a CE session to pick this up and build it. Reference existing patterns, files, or ADRs. This section is the handoff — make it actionable.>

## Success criteria

<How do we know this worked? Verifiable conditions.>

## Cross-references

<Related ADRs, decisions log entries, or wiki pages.>
```

Omit sections that don't apply — don't write empty headings. "What we are NOT building" and "Implementation notes" are the most important sections for the handoff use case.

### 4. Append to decisions/log.md

Add a compact entry at the bottom of `decisions/log.md`:

```markdown
## YYYY-MM-DD — <Title>

**Decision:** <One-paragraph summary.>

**Why:** <The rationale.>

**ADR:** `docs/adr/NNNN-<slug>.md`

**Owner:** Justin.
```

### 5. Report

Tell Justin:
- The ADR path
- The decision log was updated
- Suggest: "Take this to a terminal session with CE to implement."

## Constraints

- Never run implementation code, CE skills, or GSD skills. This skill writes markdown only.
- Match the voice and density of existing ADRs — scan 1-2 before writing.
- If the conversation doesn't contain a clear decision yet, say so and help sharpen it instead of writing a vague ADR.
- The "Implementation notes" section should reference specific files, patterns, and existing ADRs so the receiving session has real starting points.
