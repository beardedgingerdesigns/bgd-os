---
name: register-prospect
description: Use when Justin says "register prospect X", "new prospect", "add X as a prospect", "track this lead", "new lead", or any variant of prospect registration. Interactive intake creates prospect doc at prospects/<slug>.md and adds clients.yaml entry under bucket prospects.
---

## What this skill does

Registers a new prospect in the AIOS. Creates a full-dossier markdown file at `prospects/<slug>.md` and adds a matching entry to `clients.yaml` under `bucket: prospects`. The prospect doc is immediately discoverable by scheduled triage, `/ask-the-board`, and `/weekly-project-status`.

## When to run

- Justin mentions a potential new client or lead
- A contact surfaces repeatedly in triage but isn't registered
- Justin explicitly says to track someone as a prospect

## Execution

### Step 1: Gather prospect identity

Use AskUserQuestion to collect:

1. **Slug** (kebab-case, e.g., `acme-corp`). Validate uniqueness against both `clients.yaml` slugs AND existing files in `prospects/`. If duplicate, ask for a different slug.
2. **Display name** (human-readable company or person name)
3. **Source** — AskUserQuestion with options: "Email thread", "Referral", "Cold outreach", "Other"
4. **Primary contact name** (free-text)
5. **Primary contact email** (free-text)
6. **Initial notes** (optional free-text — any context Justin has right now)

### Step 2: Scaffold prospect doc

Write `prospects/<slug>.md` with this structure:

```yaml
---
status: active
status_changed_at: <today YYYY-MM-DD>
previous_status: null
contacts:
  <email>:
    name: <name>
    email: <email>
    role: primary
    last_interaction: <today YYYY-MM-DD>
first_seen: <today YYYY-MM-DD>
last_activity: <today YYYY-MM-DD>
source: <source from Q3>
---
```

Body sections (in this order):

```markdown
# <Display Name>

## Timeline
<!-- Reverse-chrono: newest at top -->

### <today YYYY-MM-DD>
- Registered as prospect. Source: <source>.
<initial notes if provided>

## Pricing Strategy
<!-- Working surface for AIOS pricing conversations -->

## Problem Map
<!-- Business problems the prospect has mentioned -->

## Notes
<!-- Freeform manual observations -->

## Next Steps
<!-- What needs to happen to advance the deal -->
```

### Step 3: Add clients.yaml entry

Read `clients.yaml`. Append a new entry at the end:

```yaml
- slug: <slug>
  name: <display_name>
  bucket: prospects
  contacts:
    - <primary_contact_email>
  projects: []
```

IMPORTANT: `contacts` here are simple email strings (same format as `projects[].contacts` throughout clients.yaml). This is for triage matching. The richer contact map (name/role/last_interaction) lives in the prospect doc frontmatter only.

After editing, validate the YAML parses correctly. If parse fails, revert and report error.

### Output

```
Prospect registered: <display_name>
  Doc: prospects/<slug>.md
  Entry: clients.yaml (bucket: prospects)

Triage will now match emails from <email> to this prospect.
```

## Prospect lifecycle

Status values: `active` | `warm` | `cold` | `dead` | `converted`

Auto-flip rules (applied by scheduled triage on each pass):
- `last_activity` > 30 days and status is `active` or `warm` → flip to `cold`
- `last_activity` > 90 days and status is `cold` → flip to `dead`
- On any flip: update `previous_status` to old value, `status_changed_at` to today

These thresholds keep the pipeline clean without manual maintenance.

## What this skill does NOT do

- Convert prospects to clients (use `/convert-prospect`)
- Dispatch triage intel to prospect docs (scheduled triage handles that)
- Surface prospects in weekly status (weekly-project-status handles that)
