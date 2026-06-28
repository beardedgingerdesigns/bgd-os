# AIOS State Write-Back: Design Spec

When AIOS reads an email during triage and learns something that contradicts a project's `state/<slug>.md` (a launch date moved, a status changed, a blocker cleared), it drafts the corrected state update and queues it for one-tap review. A new **Sync** surface in the UI shows each proposal as a current-vs-proposed diff that Justin applies, edits, or dismisses. The goal: AIOS keeps the dashboard's source of truth current on its own instead of waiting for Justin to go touch each project.

## The Problem

`state/<slug>.md` files feed the dashboard, the brief, and decisions. Today they only change when Justin (or a project `/wrap`) edits them. AIOS already *notices* drift (the brief flags stale files and reads email context) but has no path to fix it:

- `/dispatch` **does** write state (Step 4: bump Updated, adjust Status, revise Next Steps, gated by "does this change what the project knows about itself?"), but only for drops in `archives/raw/`.
- `/scheduled-triage` detects launch-date and status changes (Step 8 classification) but routes them only to the project *wiki's* `raw/aios/` staging, never to `state/`.
- `/brief` is read-only by design.

So a "Wild Rose launch slips to mid-July" email lands, triage files it to the wiki, and `state/wild-rose.md` stays wrong until a human edits it. This spec closes that gap by giving triage the state-write power dispatch already has, behind a human-reviewed Sync queue.

## How It Works

```
triage run ──(contradiction)──▶ draft proposal ──▶ pending-state-updates.json
                                                          │
                                              UI: Sync queue (review)
                                                          │
                                   ┌──────────┬───────────┴──────────┐
                                 Apply       Edit                 Dismiss
                                   │           │                     │
                          write state/<slug>.md │              record dedupeKey
                          (thin delta)     edit then Apply     (no re-propose)
```

One detector (triage), one store (a JSON cache), one surface (Sync), one write path (apply endpoint).

## Components

### 1. Detector: triage "Reconcile state" step

`scheduled-triage` gains a step after Step 8 (Reconcile state). For each project a thread matched to (it already resolves `project_slug` in Step 4), it reads `state/<slug>.md`, compares the email intelligence against the relevant fields, and on a genuine contradiction drafts a proposal and appends it to the store. `/daily-inbox-triage` runs the same reconciliation on demand. Detection lives in the skill prompt (the LLM already understands the email and the state file); the skill writes the proposal JSON directly, the same way it writes `triage-latest.json` and `todos/pending.md`.

`/brief` stays read-only. It reads the store and announces the pending count ("3 updates proposed, see Sync") but never writes state. Triage is the writer; the brief is the reader.

The "don't invent outcomes" rule from `/dispatch` carries over: if an email *implies* but does not *state* a change, it is a low-confidence proposal, never a silent write.

### 2. Proposal store

`aios-ui/.aios-cache/pending-state-updates.json` (same cache family as `triage-latest.json` and the pending-todos pattern):

```json
{
  "proposals": [
    {
      "id": "su-<8 hex>",
      "slug": "wild-rose",
      "field": "current_status",        // status | current_status | next_step | blocker
      "current": "Launch window mid/late June",
      "proposed": "Launch slipped to mid-July (Meghan Wymore, 6/19)",
      "evidence": { "source": "triage", "threadId": "<gmail id>", "sender": "meghan@...", "date": "2026-06-19" },
      "confidence": "high",             // high = explicit attributable fact; low = inference
      "stateUpdatedAt": "2026-06-09",   // state file's **Updated:** date when drafted (clobber guard)
      "dedupeKey": "wild-rose:current_status:<hash(proposed)>",
      "createdAt": "2026-06-19T13:45:00Z"
    }
  ],
  "dismissed": ["<dedupeKey>", "..."]   // dismissed proposals never re-propose
}
```

A proposal targets one field for a clean diff. A project can have several. `field` maps to the existing `parseStateFile` schema in `aios-ui/lib/data/state.ts` (`**Status:**`, `## Current Status`, `## Next Steps`, `## Blockers`). `**Updated:**` is not a proposable field; Apply always bumps it to today as a side effect.

### 3. Sync view (UI)

A new toolbar item (⟳ Sync) with a count badge, alongside Dashboard / Triage / Projects / Todos in `components/app-shell.tsx`. `components/views/sync-view.tsx` lists proposals grouped by project. Each is a diff card:

- `− current` / `+ proposed`
- evidence line (sender, date, source)
- confidence label; low-confidence is visually flagged and not pre-emphasized
- actions: `[Apply]` `[Edit]` `[Dismiss]`

`Edit` opens the `proposed` value in an inline textarea before applying. `Dismiss` discards and records the `dedupeKey` so triage will not raise it again.

### 4. Apply write path

`POST /api/state-updates/[id]/apply`:

1. Re-read `state/<slug>.md`.
2. **Clobber guard:** if the file's current `**Updated:**` date differs from the proposal's `stateUpdatedAt`, the state changed since drafting (e.g., a project `/wrap` got there first). Do not clobber. Mark the proposal stale and return a "state changed, re-review" result; the card prompts a fresh look.
3. Otherwise apply a **field-targeted thin delta**, the same surgery `/dispatch` Step 4 performs: set `**Updated:**` to today, replace `**Status:**` if the proposal changes it, prepend a dated line to `## Current Status`, or revise the matching `## Next Steps` / `## Blockers` line. Write the file, remove the proposal. The dashboard re-reads and the card is current.

`GET /api/state-updates` lists the store. `DELETE /api/state-updates/[id]` dismisses (removes from `proposals`, adds `dedupeKey` to `dismissed`). Store I/O lives in `aios-ui/lib/cache/state-updates.ts`; the thin-delta merge is a pure function in `aios-ui/lib/data/state-merge.ts` (given a state file plus a proposal, return the updated markdown).

### 5. Confidence, dedup, audit

- **Confidence.** High = the email states an explicit attributable fact ("we're pushing to mid-July"). Low = inference ("sounds like they're behind"). Low-confidence proposals appear flagged and are never pre-checked.
- **Dedup.** Before appending, the skill skips any proposal whose `dedupeKey` already exists in `proposals` or `dismissed`.
- **Audit.** Applied lines carry `Source: triage` so they are distinguishable from `/wrap` edits and reversible via git.

### 6. Sync now (manual refresh)

A `Sync now` button in the Sync view triggers an on-demand reconciliation pass (a one-shot reconcile over recently-matched threads) for when Justin wants a fresh check without waiting for the 2-hour schedule. Convenience on top of the ambient detector, not the primary path.

## Scope

**In (v1):** contradictions of *existing* state fields, surfaced as drafted diffs in the Sync queue, applied to the AIOS `state/` layer only.

**Out (v1):**
- Creating state files for projects that lack one (triage flags it for `/dispatch` or `/kickoff-project` instead).
- Whole-file rewrites; proposals are field-targeted.
- Any change to wiki dispatch. ADR 0004 stands: triage Step 8 still stages to `{wiki}/raw/aios/` unchanged. This spec touches `state/` only.

## ADR

Applying a proposal is the first time the UI writes a `state/` file, which nuances the "editing happens outside in the operator's editor" principle. Add a short ADR recording the decision: the UI may apply AIOS-drafted, human-approved state diffs (not freeform editing), with a clobber guard and git as the audit trail.

## Testing

Vitest is already wired in `aios-ui`. Unit-test the pure logic:

- `state-merge`: state file + proposal per `field` → expected markdown (status replace, Updated bump, Current Status prepend, Next Steps / Blockers revise).
- clobber guard: mismatched `stateUpdatedAt` returns stale, does not write.
- dedup: a `dedupeKey` present in `proposals` or `dismissed` is skipped.

## Open Questions / Future

- New-project state creation from triage (deferred).
- Whether low-confidence proposals should expire if untouched for N days.
- Whether `/weekly-project-status` should also feed proposals (it already runs per-project researchers).
