# Phase 8: Scheduled Triage Automation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 08-scheduled-triage-automation
**Areas discussed:** Schedule & trigger, Draft reply depth, Action item extraction, Dispatch routing

---

## Schedule & Trigger

### Q1: How should the triage routine fire on schedule?

| Option | Description | Selected |
|--------|-------------|----------|
| Claude Code /schedule | Use the built-in /schedule command to create a cron-style routine. Runs as a remote agent on Anthropic's infra — fires even if laptop is closed. | ✓ |
| Local cron + claude -p | System-level crontab entry that runs `claude -p` with the triage prompt. Only fires when machine is on. | |
| You decide | Let Claude pick the best mechanism based on what's available and reliable. | |

**User's choice:** Claude Code /schedule
**Notes:** None

### Q2: What should 'waking hours' mean for the schedule?

| Option | Description | Selected |
|--------|-------------|----------|
| 7am-9pm CT weekdays | Standard business+ hours, Mon-Fri only. Weekends stay manual-trigger only. | ✓ |
| 7am-9pm CT every day | Same hours but includes weekends. | |
| 8am-6pm CT weekdays | Tighter business hours. | |

**User's choice:** 7am-9pm CT weekdays
**Notes:** None

### Q3: Should the first morning run behave differently from mid-day runs?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, wider lookback | The 7am run looks back further (overnight + weekend gap) and produces a more comprehensive morning briefing. | ✓ |
| No, all runs identical | Every run scans since last run, regardless of time gap. | |
| You decide | Let Claude pick based on what makes the output most useful. | |

**User's choice:** Yes, wider lookback
**Notes:** None

### Q4: Where should triage output land so you can review it?

| Option | Description | Selected |
|--------|-------------|----------|
| Push notification + file | Write results to cache file AND send a push notification summary. File is the record, notification is the nudge. | ✓ |
| File only, check on demand | Write results to cache. No interruptions. | |
| You decide | Let Claude pick based on what the /schedule infrastructure supports best. | |

**User's choice:** Push notification + file
**Notes:** User asked how push notifications work before selecting. Clarified: PushNotification tool in Claude Code remote agents sends native OS notifications. Flow = agent finishes → calls PushNotification with summary → user sees system notification.

---

## Draft Reply Depth

### Q1: How polished should auto-generated draft replies be?

| Option | Description | Selected |
|--------|-------------|----------|
| Full draft, your voice | Ready-to-send drafts that match voice.md register. Review and hit send. Higher token cost. | ✓ |
| Bullet-point summary | Key points to hit in a reply. User writes the actual email. | |
| Adaptive by urgency | High-urgency = full drafts, low-urgency = bullet summaries. | |

**User's choice:** Full draft, your voice
**Notes:** None

### Q2: Should every unanswered thread get a draft reply?

| Option | Description | Selected |
|--------|-------------|----------|
| All actionable threads | Every thread that needs a reply gets one. Auto-skip newsletters and no-reply senders. | |
| Top 5 by urgency | Only the most urgent/overdue threads get drafts. Rest get a one-line mention. | |
| You decide | Let Claude pick a sensible threshold. | ✓ |

**User's choice:** You decide
**Notes:** None

### Q3: Where should the draft reply live?

| Option | Description | Selected |
|--------|-------------|----------|
| Gmail draft via MCP | Create an actual Gmail draft on the thread using create_draft. Open Gmail and it's ready to send. | ✓ |
| Triage output file only | Draft text in cache file. Copy-paste to reply. No Gmail writes. | |
| Both | Create Gmail draft AND include text in triage output. Belt and suspenders. | |

**User's choice:** Gmail draft via MCP
**Notes:** None

---

## Action Item Extraction

### Q1: How should triage decide what's a to-do vs. email conversation?

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit commitments | Only concrete commitments or requests with clear actions. | |
| Broad extraction | Anything that could require follow-up, even soft mentions. | |
| You decide | Let Claude pick the right threshold. | ✓ |

**User's choice:** You decide
**Notes:** None

### Q2: Should extracted action items auto-assign priority?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-assign by signals | Infer priority from urgency cues. User can override later. | |
| All medium, you triage | Everything starts at medium. Manual bump during review. | |
| You decide | Let Claude pick a reasonable priority strategy. | ✓ |

**User's choice:** You decide
**Notes:** None

### Q3: Should triage check for duplicates before adding a to-do?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, skip duplicates | Scan pending.md for similar items (same client + similar description). Skip if already tracked. | ✓ |
| No, always append | Every extraction gets appended. Manual cleanup. | |
| You decide | Let Claude pick. | |

**User's choice:** Yes, skip duplicates
**Notes:** None

---

## Dispatch Routing

### Q1: How should project-relevant intelligence land in wiki staging?

| Option | Description | Selected |
|--------|-------------|----------|
| One file per thread | Each dispatched thread gets its own file in raw/aios/. Clean separation. | ✓ |
| Batched per triage run | One file per run with all dispatched threads. Fewer files. | |
| You decide | Let Claude pick based on wiki ingest pipeline fit. | |

**User's choice:** One file per thread
**Notes:** None

### Q2: What happens with multi-project threads?

| Option | Description | Selected |
|--------|-------------|----------|
| Dispatch to all matched | Write to each matched project's raw/aios/. Some duplication accepted. | ✓ |
| Primary project only | Pick best-match project. Others don't see it. | |
| You decide | Let Claude pick based on rarity. | |

**User's choice:** Dispatch to all matched
**Notes:** None

### Q3: What metadata should travel with dispatched files?

| Option | Description | Selected |
|--------|-------------|----------|
| Frontmatter with context | YAML frontmatter (thread ID, sender, date, subject, matched contacts, urgency). Body = project-relevant summary. | ✓ |
| Minimal + raw excerpt | Thread ID + date in frontmatter. Body = verbatim email excerpt. | |
| You decide | Let Claude pick the right balance. | |

**User's choice:** Frontmatter with context
**Notes:** None

---

## Claude's Discretion

- Draft reply coverage threshold (which threads get full drafts vs. brief mention)
- Action item extraction sensitivity (explicit commitments vs. broader follow-up signals)
- Action item auto-priority assignment (deadline = high, routine = medium, soft = low)
- Dispatch metadata balance (frontmatter structure vs. body content depth)

## Deferred Ideas

None — discussion stayed within phase scope
