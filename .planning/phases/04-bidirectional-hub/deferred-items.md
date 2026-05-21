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
