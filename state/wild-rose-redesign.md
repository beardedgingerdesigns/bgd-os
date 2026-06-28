# Project State: Wild Rose Casinos

**Updated:** 2026-06-26 | **Status:** On track

## Accomplishments (this session)
- Extracted semantic knowledge graph from entire codebase using 24 parallel agents (861 nodes, 913 edges, 37 hyperedges)
- Identified critical architectural patterns: `body-block-open` base class (18 blocks depend on it), property-scoping pattern across filters, content builder dispatch mechanism
- Discovered design system contradiction: branding docs mandate pink as primary, but SASS tokens still use navy (#161f48)
- Mapped god nodes (most-connected entities): Kickoff meeting (30 edges), `body-block-open` partial (20 edges), `_layout.html` (17 edges)
- Generated interactive graph visualization and structured audit report with community detection analysis

## Current Status
- 2026-06-25: Pre-launch sync meeting — backend content alignment confirmed for July 13. QA session planned week of 7/7. HR printable application requested (PDF template approach). Entertainment category bugs + thumbnail workflow to fix. Krystal out 6/27–7/6.
- 2026-06-19: Go-live moved July 1 → July 13 (Aaron prefers not to launch during the holiday week) (via triage)
- 2026-06-21: Servd hosting billing RESOLVED — card updated; renewal no longer failing, site not at risk (prior "offline June 23" warning cleared)
- 2026-06-22: Meghan Wymore staging backend access RESOLVED — she can reach the staging `/admin` and begin content entry (prior error-page block cleared)

The graphify knowledge graph is complete and indexed. The graph reveals the full dependency chain for property scoping, the content builder dispatch pattern, and the competing hero systems coexisting in the codebase. All 24 extraction agents completed successfully with no data loss.

## Next Steps
- [x] Email Aaron — project housekeeping summary (draft sent 6/26)
- [ ] Schedule content review meeting (next week, before Krystal returns)
- [ ] Schedule QA walkthrough (week of 7/7, after Krystal returns 7/6)
- [ ] Fix entertainment category preview bug
- [ ] Fix thumbnail save-before-upload workflow (entertainment section)
- [ ] Update location display to comma-separated list
- [ ] Map SEO image auto-population from content blocks
- [ ] Build printable PDF template for HR applications (samples received 6/25; confirmed current by Katrina)
- [ ] Add recruiter Becca to HR application auto-notifications
- [ ] Flesh out remaining content for team review before QA

## Blockers
None

## Key Dates
- 2026-02-02: Kickoff meeting (brand direction locked: pink as primary)
- 2026-03-11: Banquets meeting (V1 architecture decisions locked)
- 2026-05-12: Craft 5 upgrade and Vite migration completed; foundation audits concluded