# Project State: Wild Rose Casinos

**Updated:** 2026-06-19 | **Status:** On track

## Accomplishments (this session)
- Extracted semantic knowledge graph from entire codebase using 24 parallel agents (861 nodes, 913 edges, 37 hyperedges)
- Identified critical architectural patterns: `body-block-open` base class (18 blocks depend on it), property-scoping pattern across filters, content builder dispatch mechanism
- Discovered design system contradiction: branding docs mandate pink as primary, but SASS tokens still use navy (#161f48)
- Mapped god nodes (most-connected entities): Kickoff meeting (30 edges), `body-block-open` partial (20 edges), `_layout.html` (17 edges)
- Generated interactive graph visualization and structured audit report with community detection analysis

## Current Status
- 2026-06-19: Go-live moved July 1 → July 13 (Aaron prefers not to launch during the holiday week) (via triage)

The graphify knowledge graph is complete and indexed. The graph reveals the full dependency chain for property scoping, the content builder dispatch pattern, and the competing hero systems coexisting in the codebase. All 24 extraction agents completed successfully with no data loss.

## Next Steps
- [ ] Open `/Users/justinlobaito/repos/wild-rose/graphify-out/graph.html` in browser to explore the interactive graph
- [ ] Use graph queries to map the property-scoping refactor impact (slug-suffix model → potential multi-site migration)
- [ ] Verify which body blocks extend `body-block-open` and plan refactoring order (highest impact first)
- [ ] Reconcile the pink-as-primary brand decision with SASS token upgrades (currently navy in code)
- [ ] Document the `wr_default_location` cookie pattern shared across three Sprig filter components

## Blockers
None

## Key Dates
- 2026-02-02: Kickoff meeting (brand direction locked: pink as primary)
- 2026-03-11: Banquets meeting (V1 architecture decisions locked)
- 2026-05-12: Craft 5 upgrade and Vite migration completed; foundation audits concluded