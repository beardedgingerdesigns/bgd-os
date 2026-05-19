# Partners For Sight (RDPFS) — project reference

Site maintenance + hosting for Partners For Sight (partnersforsight.org), a foundation supporting publications for the visually impaired. Work is contracted through **NPS Media Group**, the agency that bills BGD and routes change requests from the foundation. Project is in **maintenance mode** at **$200/mo** through Bonsai.

Created 2026-05-19 during `/onboard-client` intake. To be expanded as more context surfaces.

## What Partners For Sight does

Partners For Sight is a foundation that supports publications for the visually impaired. They also operate a significant grant-writing function — **grant submittal and application process is a major component of the website**. The site needs to handle both the public-facing content (mission, programs, publications) and the grant workflow surface.

> *Justin's note 2026-05-19: "Right now there's probably lots of information I should drop in. I just don't have it well organized." This page is a scaffold — expand over time.*

## Engagement structure

| Layer | Who | Role |
|---|---|---|
| **Foundation (RDPFS)** | Elizabeth, Soja, Matthew | The actual client at Partners For Sight |
| **Agency (NPS Media Group)** | Natalie, Lori | Routes work and pays BGD |
| **BGD** | Justin | Does the work |

Justin gets change requests from Natalie (NPS) most often; the underlying content/direction comes from Elizabeth or Soja at the foundation. NPS is on the invoice; Partners For Sight is the relationship.

## Contacts

### Partners For Sight (RDPFS — day-to-day project)

- **Elizabeth Atkinson** — `elizabeth@partnersforsight.org`. Most change requests come from her.
- **Soja Orlowski** — `soja@partnersforsight.org`. Elizabeth's boss.
- **Matthew Krieger** — `matt@partnersforsight.org`. Board chair. Justin's initial contact at project kickoff.

### NPS Media Group (agency / billing)

- **Natalie Sorge** — `nsorge@npsmediagroup.com`. Main contact for routing work from NPS to BGD.
- **Lori Masaoay** — `lmasaoay@npsmediagroup.com`. Occasional NPS contact, in the loop on some changes.

### Explicitly NOT in scope

- **Frank Lama** (`flama@npsmediagroup.com`) — NPS general fallback per Natalie's OOO replies; not a Partners For Sight contact.
- **Jamie Fallon** (`JFallon@npsmediagroup.com`) — Lori's immediate-help fallback; not a Partners For Sight contact.

## Subject-line shorthand

NPS uses **"RD PFS"** as internal shorthand for the project (e.g., subject line *"RD PFS Web Page - Changes to make"*). Translate to "Partners For Sight" in external-facing copy. The "RD" prefix is internal-only convention.

## Architecture (TBD — needs ground-truth pass)

Site is at https://partnersforsight.org/. Stack details unknown to this doc — should be filled in next time Justin opens the codebase or does an HTTP-level recon. Likely Craft CMS based on BGD's standard stack, but unconfirmed.

Things to capture once known:

- [ ] CMS + version
- [ ] Hosting (BGD infrastructure on DigitalOcean? other?)
- [ ] Grant submittal flow — how is it built? Custom Craft forms? A third-party form integration? Specific entry types?
- [ ] Publications surface — how is content organized?
- [ ] Email capture / mailing list integration (if any)
- [ ] Accessibility-specific tooling (this is a visually-impaired-advocacy org — accessibility considerations should be load-bearing)

## Open questions to surface as work allows

- **Accessibility baseline.** Given the audience, what's the current WCAG conformance level? Should be at least AA. Worth an audit if not recent.
- **Grant submittal infrastructure.** Is this a Craft-native flow, a third-party form (Freeform, Formie, Typeform), or something else? Could be a year-two improvement target.
- **Foundation-side contact cadence.** Justin's relationship runs primarily through NPS — is there value in opening a direct Foundation channel for strategic conversations, or does that disrupt the NPS billing relationship?
- **Project growth potential.** Currently maintenance mode at $200/mo. Is there a year-two feature direction the foundation has been quietly wanting that hasn't been pitched?

## Wiki candidate

This project is a candidate for the **llm-wiki pattern** (see `site-builder-phase2/docs/wiki/` and `iowa-everywhere/docs/wiki/` for examples) once it grows past "maintenance mode" into a year-two scope conversation. Bootstrap then.

## Related

- Client registry: [clients.yaml](../clients.yaml) → `nps-media-group/partners-for-sight`
- Memory: `~/.claude/projects/-Users-justinlobaito-repos-claude-os/memory/project_partners_for_sight.md`
- Decisions log entry: `2026-05-19` (onboarding)
