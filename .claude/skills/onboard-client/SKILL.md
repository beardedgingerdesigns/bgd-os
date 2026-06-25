---
name: onboard-client
description: Use when Justin says "/onboard-client", "add a new client", "set up a new project", "register {company} in the AIOS", "we have a new client", or any variant of intake/registration for a new client or new project under an existing client. Walks an interactive intake (8-10 questions), writes the new client/project into clients.yaml, scaffolds a memory file and reference doc, and logs the onboarding to decisions/log.md. Full lifecycle: intake interview, clients.yaml entry, /kickoff-project wiki seed, initial STATE.md, decisions log entry.
bike-method-phase: 1
three-ms-attribution: |
  Adapted from The Three Ms of AI™ © 2026 Nate Herk. All rights reserved.
  The Three Ms of AI™ is a trademark of Nate Herk.
---

## What this skill does

Onboards a **new client** (or a new project under an existing client) into claude-os in a single guided interview. Writes everything to the canonical surfaces so the project is immediately reachable by `/load-project`, `/weekly-project-status`, and `/daily-inbox-triage`.

This skill is the **intake counterpart to `/load-project`**. `/load-project` reads project context; `/onboard-client` writes the registry that makes that read possible.

Closes the rough edge surfaced today during the IowaEverywhere addition — the manual scattershot of "add to clients.yaml, create memory file, scaffold reference doc, log decision" becomes one command.

## When to run

- **First contact with a new client.** After a discovery call or signed contract.
- **New project under an existing client.** E.g., Wild Rose adds a third site under their account.
- **Backfilling a missed onboarding.** A client that's been in active work for a while but never got registered. (IowaEverywhere was one of these earlier today.)

## Today's context

- **Date:** {today}
- **Canonical registry:** [clients.yaml](../../../clients.yaml)
- **Memory dir:** `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/`
- **Reference docs:** [references/](../../../references/)

## Execution

### Step 0 — Prospect doc detection

Before the interview starts, check if a prospect doc exists for the client being onboarded.

1. If the user provided a slug (e.g., `/onboard-client revolution`), check if `prospects/<slug>.md` exists
2. If the user said "new client" and provided a slug in Phase 1 Q1a, check after Q1a

**If a prospect doc is found:**

Read the full prospect doc. Parse YAML frontmatter (contacts map, first_seen, source) and body sections (Timeline, Problem Map, Notes, Pricing Strategy). Build a prospect context:

```
Found prospect doc: prospects/<slug>.md
  First seen: <first_seen>
  Source: <source>
  Contacts: <count> tracked
  Timeline entries: <count>

Pre-filling from prospect intelligence. You'll confirm each answer.
```

Then apply to the interview phases:
- **Phase 1 Q1b (Display name):** pre-fill from the doc's H1 heading. Show and confirm.
- **Phase 1 Q1c (Bucket):** pre-fill as `active` with note "Converting from prospect. Set to 'paying' after first invoice."
- **Phase 2 (Project scope):** pre-fill from Problem Map section. Show: "Based on prospect intel, here's what they need: [summary]. Correct, or want to adjust?"
- **Phase 3 Q8 (Contacts):** pre-fill from frontmatter contacts map (all tracked contacts with roles). Show and confirm.
- **Phase 3 (Source tracking):** note "Originally sourced as prospect via: <source>"

Key rule: NEVER silently assume a pre-filled answer is correct. Always show the pre-filled value and ask for confirmation. Questions not answerable from the prospect doc are asked normally (these are the gaps).

**Conversion mode:** If the prospect doc has `status: converting` (set by `/convert-prospect`), this is a conversion. In conversion mode:
- Q1a (slug): SKIP (already known)
- Q1c (bucket): SKIP (will be set to `active` by /convert-prospect Phase B after this completes)
- Do NOT append a new clients.yaml entry. UPDATE the existing entry (add project, update contacts). Detect existing entry by matching slug regardless of bucket value.
- Search for prospect doc in order: `prospects/<slug>.md` first, then `prospects/converted/<slug>.md` (handles re-run after partial conversion)

**If no prospect doc found:** proceed with normal interview unchanged.

---

### Phase 1 — Client identity (only if new client)

Start with the meta-question:

**Q1:** Is this a new client, or are we adding a project to a client already in `clients.yaml`?

Use `AskUserQuestion` with two options:
- "New client (and first project)" — runs Phase 1 then Phase 2
- "Adding project to existing client" — skips Phase 1, jumps to Phase 2 with `client_slug` already known

**If new client, ask in sequence:**

**Q1a — Client slug** (free-text). Recommend kebab-case, lowercase, no spaces. Validate uniqueness against `clients.yaml`. If a collision exists, prompt for a different slug. Example: `bearded-ginger`, `crash-champions`.

**Q1b — Display name** (free-text). The human-readable name. Example: "Crash Champions" or "Bearded Ginger Designs".

**Q1c — Bucket** (`AskUserQuestion`, 4 options):
- `paying` — recurring revenue client (e.g., Inside Out, Wild Rose, ToneQuest, IowaEverywhere)
- `prospects` — in pipeline, not yet contracted (e.g., Revolution Drones)
- `internal` — BGD's own work (e.g., BGD HQ projects)
- `partners` — strategic partnership, not direct client (e.g., LMG/Jon Liebl as collaborator if ever needed)

### Phase 2 — Project identity (always)

**Q2 — Project slug** (free-text). Validate **globally unique** across `clients.yaml`. If a collision exists, prompt for a different slug. Example: `thermal-kitchen`, `crash-champions-ai-build`.

**Q3 — Project name** (free-text). Example: "Thermal Kitchen redesign", "AI integration discovery & build".

**Q4 — Status** (`AskUserQuestion`, 4 options):
- `active` — in flight, current work
- `pending` — onboarded but waiting on something (contract, payment, kickoff date)
- `paused` — work has stopped temporarily; retain in registry
- `archived` — closed/completed; retain for history

**Q5 — Contract label** (free-text, optional). Example: "$250/mo Bonsai", "Project + AMC", "$5K fixed + $200/mo hosting", "Discovery phase, no contract yet". Leave blank if unknown.

### Phase 3 — Sources

**Q6 — Existing docs to register** (free-text, optional, multi-line). Ask:
*"Paste any existing paths to docs/reference materials for this project, one per line. Can be:*
*- Internal: `references/{filename}.md`*
*- External: `/Users/justinlobaito/repos/{repo}/` or specific file paths*
*- Or skip if you'll add later."*

Validate each path exists. For paths that don't exist, prompt — typo, or path-not-yet-created? Keep only verified or explicitly-skipped paths.

**Q7 — Scaffold a new reference doc?** (`AskUserQuestion`, 2 options):
- "Yes, create `references/{project-slug}-project.md` stub" — creates a templated file
- "No, I'll add docs later or via other paths" — skips

**Q8 — Primary contacts** (free-text, optional, multi-line). Ask:
*"Paste primary contact emails for this project, one per line. Examples:*
*- `firstname.lastname@clientco.com` (specific person)*
*- `@clientco.com` (catch-all domain for any contact at that company)*
*Or skip if you don't have them yet."*

Don't validate email format — trust the user. Just collect.

### Phase 4 — Preview + confirm

Show the user a preview of all changes that will be made:

```markdown
## Preview — onboarding {client-name} / {project-name}

**clients.yaml addition:**
```yaml
- slug: {client-slug}
  name: {client-name}
  bucket: {bucket}
  projects:
    - slug: {project-slug}
      name: {project-name}
      status: {status}
      contract: {contract or omitted}
      docs_paths:
        - {path 1}
        - {path 2}
      contacts:
        - {email 1}
        - "{domain 1}"
```

**Files to create:**
- `memory/project_{project-slug}_onboarding.md` (status stub)
- `references/{project-slug}-project.md` (if Q7 = yes)

**decisions/log.md entry:**
- "{date} — Onboarded {client-name} / {project-name}: {bucket}, {status}, {contract}"

**MEMORY.md index entry added.**
```

Then `AskUserQuestion`: "Apply these changes?"
- "Yes, write everything"
- "Let me edit something first" → loop back to whichever phase
- "Cancel" → exit, nothing written

### Phase 5 — Write

If confirmed, perform all writes in sequence:

1. **`clients.yaml`** — append the new client (or new project under existing client) at the appropriate position. Preserve existing structure and comments at top of file.

2. **Memory file** — `memory/project_{project-slug}_onboarding.md` with this template:

   ```markdown
   ---
   name: {project-name} — onboarded {date}
   description: >-
     {brief description from intake — Phase 2/3 answers in one sentence}
   type: project
   client: {client-slug}
   project: {project-slug}
   ---
   **Current state ({date}):**

   - Status: {status}
   - Contract: {contract or "not yet defined"}
   - Onboarded into AIOS via /onboard-client.

   **Stakeholders:**

   - {contact 1 with role if known}

   **Pre-flight notes:**

   - {anything Justin mentioned during intake worth capturing}

   **How to apply:**

   - Run `/load {project-slug}` to verify context loads cleanly.
   - Capture first decision in `decisions/log.md` after kickoff.
   - Update this memory as project state evolves.
   ```

3. **Reference doc** (if Q7 = yes) — `references/{project-slug}-project.md` with this template:

   ```markdown
   ---
   client: {client-slug}
   project: {project-slug}
   type: project-reference
   created: {date}
   ---
   # {project-name}

   *Onboarded via /onboard-client on {date}.*

   ## What it is

   {placeholder for description}

   ## Stakeholders

   | Person | Contact | Role |
   |---|---|---|
   {placeholder rows from Q8 contacts}

   ## Activity log

   | Date | Event |
   |---|---|
   | {date} | Onboarded into claude-os registry |

   ## Open questions

   *None yet.*
   ```

4. **`MEMORY.md` index** — append one-liner pointing to the new memory file.

5. **`decisions/log.md`** — append a dated entry:

   ```markdown
   ## {date} — Onboarded {client-name} / {project-name} (full lifecycle)

   **Decision:** Registered new {client-or-project} in the AIOS via /onboard-client.

   **Details:**
   - Client: {client-name} (slug: `{client-slug}`)
   - Project: {project-name} (slug: `{project-slug}`)
   - Bucket: {bucket}
   - Status: {status}
   - Contract: {contract or "not yet defined"}
   - Wiki: seeded at ~/repos/{project-slug}/docs/wiki/ (or "not seeded -- kickoff deferred")
   - STATE.md: initial version written to wiki root + state/{project-slug}.md (or "not written -- kickoff deferred")
   - docs_paths registered: {count}
   - Contacts registered: {count}

   **Owner:** Justin (BGD).

   **How to apply:**
   - Open ~/repos/{project-slug}/ in a new terminal. Claude reads CLAUDE.md + wiki automatically.
   - Capture first project decision under a separate log entry after kickoff.

   ---
   ```

### Phase 6 — Kickoff (chained)

Core onboard writes are complete (clients.yaml, memory, reference doc, decisions log). This phase chains into `/kickoff-project` to seed the project wiki.

**Before starting, confirm with the operator:**

> Core onboard writes are complete (clients.yaml, memory, reference doc, decisions log). Ready to run `/kickoff-project {project-slug}` to seed the wiki. Continue, or skip for now?

Use `AskUserQuestion` with two options:
- "Continue with kickoff" — proceed to invoke `/kickoff-project`
- "Skip for now" — note in the closing summary that kickoff was deferred; the operator should run `/kickoff-project {project-slug}` manually when ready

**If operator says continue:**

Now run `/kickoff-project {project-slug}`. Follow the kickoff-project skill instructions (11 phases: resolve, gather, interview, seed wiki, write CLAUDE.md, gut-check, dump raw docs, ingest, sync clients.yaml, git commit, report).

**If operator says skip:**

Print: "Kickoff deferred. Run `/kickoff-project {project-slug}` manually when ready." Continue to Phase 7 (which will also be skipped since kickoff was deferred).

**Graceful failure handling (CRITICAL):**

If `/kickoff-project` errors at any point (repo creation fails, user cancels the interview, filesystem error, sub-agent failure), catch the failure and continue to Phase 7 and Phase 8. The core onboard writes from Phase 5 are already on disk and committed. Print:

> Kickoff encountered an issue: {error context}. Core onboard is complete. Run `/kickoff-project {project-slug}` manually when ready.

Do NOT roll back Phase 5 writes because of a Phase 6 failure. The operator has a fully registered client/project regardless of what happens here.

### Phase 7 — Initial STATE.md

**Skip condition:** If Phase 6 (Kickoff) was skipped or failed, skip this phase. Print: "STATE.md skipped because kickoff was deferred/failed. The SessionEnd hook will generate STATE.md automatically after the first working session in the project repo."

**If kickoff succeeded (wiki was seeded):**

Write an initial STATE.md to the project wiki root at `~/repos/{project-slug}/docs/wiki/STATE.md` using the EXACT format from `scripts/state-hook/state-prompt.md`:

```markdown
# Project State: {project-name}

**Updated:** {YYYY-MM-DD} | **Status:** On track

## Current Status
Newly onboarded via /onboard-client. Wiki seeded by /kickoff-project. Ready for first working session.

## Next Steps
- [ ] Run first working session in the project repo
- [ ] Verify wiki seed accuracy
- [ ] Capture first project decision in the wiki

## Key Dates
- {YYYY-MM-DD}: Onboarded into AIOS
```

Omit "## Accomplishments" and "## Blockers" sections (per the state-prompt.md rule: "Omit any section that has no content").

Then copy the STATE.md to `state/{project-slug}.md` in the claude-os repo root. Both writes should be atomic (write to a temp file first, then rename to the final path).

### Phase 8 — Final Close

Print one-screen summary:

```markdown
# Onboarded — {client-name} / {project-name}

## What was created
- ✅ clients.yaml updated
- ✅ memory/project_{project-slug}_onboarding.md
- ✅ references/{project-slug}-project.md (if applicable)
- ✅ MEMORY.md index updated
- ✅ decisions/log.md entry appended
- ✅ wiki seeded at ~/repos/{project-slug}/docs/wiki/ via /kickoff-project (or "⏭️ skipped -- run /kickoff-project {project-slug} manually")
- ✅ STATE.md written to wiki root + state/{project-slug}.md (or "⏭️ skipped -- kickoff was deferred")

## Verify it works

Open ~/repos/{project-slug}/ in a new terminal. Claude reads CLAUDE.md + wiki automatically. Check:
- All registered docs_paths reachable
- Contacts surface correctly
- Wiki overview matches your understanding of the project
- No collisions or errors

## What's next

- Open the project repo and start your first working session. The wiki has everything.
- As stakeholders confirmed, add to references/{project-slug}-project.md table
- Next /weekly-project-status will pick up this project automatically
```

## Output contract

Every successful run produces:

1. **One updated `clients.yaml`** with new client or new project
2. **One new memory file** with frontmatter + onboarding stub
3. **One new reference doc** (optional, by user choice)
4. **One updated `MEMORY.md` index entry**
5. **One new `decisions/log.md` entry** documenting the full lifecycle completion (onboard + kickoff + STATE.md status)
6. **One closing summary** in chat
7. **One initial STATE.md** in the project wiki root at `~/repos/{project-slug}/docs/wiki/STATE.md` (if kickoff completed)
8. **One synced STATE.md copy** at `state/{project-slug}.md` in claude-os (if kickoff completed)

## Critical implementation rules

1. **Validate slug uniqueness BEFORE writing.** Both client slug and project slug. Project slugs must be globally unique across all clients (per `/load-project` convention).
2. **Preview before write.** Always show the full diff in Phase 4 and require explicit confirmation.
3. **Atomic-ish writes.** If any write fails, surface the error and stop — don't leave partial state. Order: clients.yaml first (since that's the canonical truth), then memory, then reference doc, then decisions log.
4. **Don't auto-add to CLAUDE.md.** That file is hand-curated for the operator-brain. Adding new clients there is a manual decision.
5. **Trust user-provided emails.** Don't validate email format — they may be using `@domain.com` catch-alls or have weird-looking valid emails.
6. **Verify external paths exist.** If a user-provided `docs_paths` entry doesn't resolve, prompt for confirmation (typo vs path-not-yet-created). Register either way once confirmed; graceful-skip handles missing paths at `/load` time.
7. **Idempotent for "existing client" path.** If the user picks "adding to existing client," show the existing client's projects so they can confirm they're not duplicating an existing project name.
8. **No external network calls.** Skill is purely local file operations.
9. **One client per run, one project per run.** If they have 3 new projects under a new client, run the skill 3 times. Composable, not multi-project per call.
10. **Graceful chain degradation.** Phase 5 (Write) completes ALL core registry writes before Phase 6 (Kickoff) begins. If kickoff fails or is skipped, the operator has a fully registered client/project. Never roll back Phase 5 writes because of a Phase 6 failure.
11. **STATE.md format parity.** The initial STATE.md written in Phase 7 MUST match the format from `scripts/state-hook/state-prompt.md` exactly so the Phase 5 SessionEnd hook can update it seamlessly in future sessions.

## KPI (Method spec)

- **Bucket:** Less cost (less time-per-client-onboarding) + More customers (lower friction onboarding = faster pipeline movement).
- **Metric:** Time from "we have a new client" to "the AIOS knows about them and can `/load` them" drops from 20-30 min (manual scattershot) to <5 min (single interview).
- **Baseline:** 2026-05-18 — manual IowaEverywhere backfill took ~10 minutes spread across 4 tools.
- **Target:** First end-to-end run completes in <5 min with one fresh client.

## Bike Method phasing

- **Phase 1 (current):** Manual interactive run. Requires user input for every field. No auto-fill, no pre-population from external sources.
- **Phase 2:** Pre-populate from Gmail. If the user provides a contact domain, skill scans recent Gmail threads for known contacts at that domain and offers them as suggested `contacts:` entries.
- **Phase 3:** Pre-populate from a signed Bonsai contract. If a contract reference is provided (URL or PDF path), parse client + project + contract value automatically.
- **Phase 4:** Auto-trigger on first Gmail thread from a new domain. Skill notices "you're emailing with someone at `@newcompany.com` who isn't registered" and proactively suggests `/onboard-client`.

Advance phases by editing the frontmatter `bike-method-phase` value. Do not auto-advance.

## First-run notes

The first `/onboard-client` run should be on a **safe test case** — a client/project you don't mind re-doing if the flow surfaces issues. Crash Champions (pending pipeline opportunity per memory) or a new BrandOS dealer would be appropriate first runs.

Things to watch for:
- YAML indentation correctness after write (run `/load {new-project-slug}` immediately to verify)
- Memory frontmatter format matches existing pattern
- Reference doc stub renders cleanly in IDE preview

---

> *Adapted from The Three Ms of AI™. © 2026 Nate Herk. All rights reserved.*
> *The Three Ms of AI™ is a trademark of Nate Herk.*
