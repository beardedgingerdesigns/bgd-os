---
name: convert-prospect
description: Use when Justin says "convert prospect X", "X is now a client", "close the deal on X", "onboard X from prospect", or any variant of converting a prospect to an active client. Reads prospect dossier, flips bucket, archives doc, seeds wiki, chains to /onboard-client.
---

## What this skill does

Converts a prospect into an active client. Reads the full prospect dossier, chains to `/onboard-client` with pre-filled context, seeds the new project wiki with accumulated intelligence, flips the bucket in `clients.yaml`, and archives the prospect doc. Explicit and intentional. Never automatic.

## When to run

- Justin decides to take on a prospect as a client
- A deal closes and it's time to set up the project

## Execution

Two-phase commit pattern. Phase A is reversible. Phase B only runs after all Phase A steps succeed.

### Phase A: Prepare

#### Step 1 -- Validate prospect

1. Accept slug as argument: `/convert-prospect <slug>`
2. Check `prospects/<slug>.md` exists. If not: error with suggestion to use `/register-prospect`
3. Read the full prospect doc (frontmatter + body)
4. Check frontmatter status:
   - `converted`: error "Already converted. See `prospects/converted/<slug>.md`"
   - `converting`: this is a retry. Check what completed and resume from the last successful step
   - `dead`: warn "This prospect is marked dead. Convert anyway?" (AskUserQuestion: Yes/Cancel)
   - `active`, `warm`, `cold`: proceed normally
5. Display prospect summary:
   ```
   CONVERTING PROSPECT

   Prospect: <display_name>
   First seen: <first_seen>
   Source: <source>
   Contacts: <count> tracked
   Timeline entries: <count>

   This will:
   1. Mark prospect as 'converting' (prevents triage race)
   2. Run /onboard-client with pre-filled context
   3. Seed new project wiki with prospect intelligence
   4. Flip bucket from 'prospects' to 'active'
   5. Archive prospect doc to prospects/converted/

   Convert <display_name> to active client?
   ```
6. AskUserQuestion: "Yes, convert" / "Cancel"

#### Step 2 -- Mark converting

Update prospect doc frontmatter: `status: converting`. This prevents triage from dispatching to a doc mid-conversion (triage defers dispatch for status: converting).

Do NOT flip the clients.yaml bucket yet. Keep `bucket: prospects` during conversion so triage doesn't try wiki dispatch with no wiki.

#### Step 3 -- Chain to /onboard-client

Invoke `/onboard-client <slug>`. Since the prospect doc is still at `prospects/<slug>.md` with status: converting, onboard-client's Step 0 detects it and enters conversion mode:
- Updates existing clients.yaml entry (no duplicate)
- Pre-fills from prospect intel
- Chains to `/kickoff-project` which creates the wiki

If /onboard-client or /kickoff-project fails: prospect doc stays at original location, bucket stays `prospects`, status is `converting`. Recovery: reset status to `active` and retry.

#### Step 4 -- Seed wiki with prospect knowledge

After /kickoff-project creates the wiki, extract from the prospect doc and stage into `{wiki}/raw/aios/`:

- Timeline section → `prospect-timeline-<slug>.md` (frontmatter: `source: prospect-conversion, type: timeline`)
- Problem Map section → `prospect-problems-<slug>.md` (frontmatter: `source: prospect-conversion, type: problem-map`)
- Pricing Strategy section (if non-empty) → `prospect-pricing-<slug>.md` (frontmatter: `source: prospect-conversion, type: pricing-strategy`)

Staged per ADR-0004. The wiki's ingest pipeline curates.

Verify `state/<slug>.md` exists (created by the onboard/kickoff chain). If MISSING: blocking failure. Do not proceed to Phase B.

### Phase B: Finalize

Only runs after all Phase A steps succeed.

#### Step 5 -- Flip bucket

1. Read clients.yaml
2. Find entry with matching slug
3. Change `bucket: prospects` to `bucket: active` (not paying -- active means signed but not yet invoicing)
4. Validate YAML parses correctly
5. Write updated clients.yaml

Delayed bucket flip ensures triage never sees `bucket: active` with no wiki.

#### Step 6 -- Archive prospect doc

1. Copy `prospects/<slug>.md` to `prospects/converted/<slug>.md`
2. Update archived copy frontmatter: `status: converted`, `converted_date: <today>`
3. Delete original `prospects/<slug>.md`
4. Log to `decisions/log.md`:
   ```
   | <today> | Converted prospect <slug> to active client | prospect-pipeline | LOCKED |
   ```

### Output

```
PROSPECT CONVERTED

<display_name> is now an active client.

  Bucket: prospects → active
  Archived: prospects/converted/<slug>.md
  Wiki seeded: <wiki_path>/raw/aios/ (files staged)
  Onboarded via /onboard-client
  STATE.md synced to state/<slug>.md

Next: bucket moves to 'paying' when first invoice is sent.
```

## Recovery

If conversion fails mid-way:
- Prospect doc stays at `prospects/<slug>.md` with `status: converting`
- Bucket stays `prospects` in clients.yaml
- Re-run `/convert-prospect <slug>` to resume from last successful step
- To abort: manually set status back to `active` in the prospect doc frontmatter

## What this skill does NOT do

- Auto-convert (always requires explicit `/convert-prospect` invocation)
- Set bucket to `paying` (that happens when the first invoice goes out)
- Write directly to curated wiki pages (uses raw/aios/ staging per ADR-0004)
