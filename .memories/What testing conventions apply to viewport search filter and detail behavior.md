# What testing conventions apply to viewport search filter and detail behavior

## Answer
- Test stack conventions:
  - `vitest` + `@testing-library/react` + `jsdom`
  - setup file is `src/test.setup.ts` via `vite.config.ts`
- Environment conventions for canvas tests:
  - `ResizeObserver`, `SVGElement.getBBox`, and `SVGElement.getScreenCTM` are shimmed in test setup
  - `cleanup` runs after each test
- Contract-testing conventions:
  - WU-tagged describe blocks (e.g., `(WU-04)`, `(WU-05)`) for feature traceability
  - compile-time contract checks use `expectTypeOf` where boundary types are critical
  - compatibility assertions rely on `data-testid` plus `data-selected`/`data-highlighted`
- Coverage status for requested areas:
  - search: unit coverage in `src/graph/search.test.ts` + integration focus behavior in `src/App.bootstrap-gating.integration.test.tsx`
  - filter/detail: unit and integration coverage in `filters.test.ts`, `node-details.test.ts`, and app integration tests
  - viewport zoom/pan: no dedicated explicit zoom/pan behavior tests yet
- Run path conventions:
  - full suite: `npm run test` (`vitest run`)
  - changed TS/TSX in staged commits trigger `vitest related --run --passWithNoTests`

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `package.json`
  - `vite.config.ts`
  - `src/test.setup.ts`
  - `src/graph/search.test.ts`
  - `src/graph/filters.test.ts`
  - `src/graph/node-details.test.ts`
  - `src/graph/graph-canvas.test.tsx`
  - `src/App.bootstrap-gating.integration.test.tsx`
- Refresh when:
  - test runner/setup/tooling changes
  - test-id or compatibility-layer conventions change
  - explicit zoom/pan tests are added
