# Phase 04 — Deferred Items

Out-of-scope discoveries logged during plan execution. Not fixed; tracked
for later cleanup.

## TypeScript errors in unrelated Next.js route files (discovered during 04-02)

Pre-existing on the phase branch baseline (`24dad93`, before any 04-02
changes). `tsc --noEmit` flags two unresolved globals supplied by
Next.js 16 codegen:

```
app/clients/[client]/layout.tsx(5,51): error TS2304: Cannot find name 'LayoutProps'.
app/clients/[client]/page.tsx(26,49): error TS2304: Cannot find name 'PageProps'.
```

`LayoutProps` / `PageProps` are types Next.js writes into `.next/types/`
during a build. They appear in the project under "Next.js 16 typed
routes." Standalone `tsc --noEmit` cannot see them unless `next build`
has been run (or `.next/types/**/*.ts` is present and included).

Not a 04-02 regression. Likely fixed by running `next build` once or by
adopting Next 16's recommended `RouteContext`/explicit type imports in
a follow-up plan.

**Owner:** later plan (route-types cleanup).
**Discovered by:** 04-02.

## Cross-plan test failure: `tests/lib/indexer/watcher.test.ts` (discovered during 04-03)

While running `npm test` from `aios-ui/` to verify 04-03 had no
regressions, one test file failed to load:

```
FAIL  tests/lib/indexer/watcher.test.ts
Error: Cannot find package '@/lib/indexer/watcher' imported from
  /…/aios-ui/tests/lib/indexer/watcher.test.ts
```

`tests/lib/indexer/watcher.test.ts` is committed on the phase branch
(05c5884 — `test(04-06): add failing tests for brief watcher`) but the
matching `aios-ui/lib/indexer/watcher.ts` implementation file is
untracked in this worktree — it lives on the sibling agent's working
tree for plan 04-06, which is still in flight.

This is the parallel-execution cross-talk the 04-03 prompt flagged:
"A sibling agent is running 04-06 in parallel — they touch different
files (lib/indexer/* and instrumentation.ts), no overlap with your
project-page edits."

**Important:** all 196 individual test cases that DID load pass — the
file failure is a load-time `import` error, not a behavioral
regression. It will resolve automatically when 04-06 merges/commits
its `lib/indexer/watcher.ts` implementation.

**Owner:** 04-06 (will resolve when its impl lands).
**Discovered by:** 04-03.
