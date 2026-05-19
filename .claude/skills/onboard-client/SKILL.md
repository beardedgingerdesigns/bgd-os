---
name: onboard-client
description: Use when Justin says "/onboard-client", "add a new client", "set up a new project", "register {company} in the AIOS", "we have a new client", or any variant of intake/registration for a new client or new project under an existing client. Walks an interactive intake (8-10 questions), writes the new client/project into clients.yaml, scaffolds a memory file and reference doc, and logs the onboarding to decisions/log.md.
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

## Execution — three phases

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
   ## {date} — Onboarded {client-name} / {project-name}

   **Decision:** Registered new {client-or-project} in the AIOS via /onboard-client.

   **Details:**
   - Client: {client-name} (slug: `{client-slug}`)
   - Project: {project-name} (slug: `{project-slug}`)
   - Bucket: {bucket}
   - Status: {status}
   - Contract: {contract or "not yet defined"}
   - docs_paths registered: {count}
   - Contacts registered: {count}

   **Owner:** Justin (BGD).

   **How to apply:**
   - Run `/load {project-slug}` to verify context hydrates correctly.
   - Capture first project decision under a separate log entry after kickoff.

   ---
   ```

### Phase 6 — Close

Print one-screen summary:

```markdown
# Onboarded — {client-name} / {project-name}

## What was created
- ✅ clients.yaml updated
- ✅ memory/project_{project-slug}_onboarding.md
- ✅ references/{project-slug}-project.md (if applicable)
- ✅ MEMORY.md index updated
- ✅ decisions/log.md entry appended

## Verify it works

Run `/load {project-slug}` now and check:
- All registered docs_paths reachable
- Contacts surface correctly in Gmail step
- No collisions or errors

## What's next

- First kickoff/discovery call → log it in decisions/log.md
- As stakeholders confirmed, add to references/{project-slug}-project.md table
- Next /weekly-project-status will pick up this project automatically
```

## Output contract

Every successful run produces:

1. **One updated `clients.yaml`** with new client or new project
2. **One new memory file** with frontmatter + onboarding stub
3. **One new reference doc** (optional, by user choice)
4. **One updated `MEMORY.md` index entry**
5. **One new `decisions/log.md` entry** documenting the onboarding
6. **One closing summary** in chat

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
