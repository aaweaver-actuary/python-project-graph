# What is the WU-05 viewport focus contract for App and GraphCanvas

## Answer
- There is no spec-level requirement that viewport focus must use `ReactFlow` `fitView`; `spec.md` requires search result action behavior (`zoom to node`, `highlight node`, `open detail panel`) but does not mandate a specific API.
- Current WU-05 contract-in-tests is **fitView-specific** for `GraphCanvas`: tests mock `useReactFlow().fitView` and expect it to be called for a new focus request.
- Expected `focusRequest` shape is `{ requestId, nodeId }` passed from `App` to `GraphCanvas`.
- `requestId` semantics in WU-05 tests: replay guard/idempotency token. If `requestId` is unchanged across rerenders, focus must not replay; repeated user focus actions should emit a new `requestId`.
- Duration/padding enforcement in tests is presence/type-level only (`expect.any(Number)`), not exact numeric values.
- Fresh implementation status: these WU-05 viewport-focus expectations are currently represented in tests (`src/App.focus-first-match.viewport.test.tsx`, updated `src/graph/graph-canvas.test.tsx`) while `src/App.tsx` and `src/graph/graph-canvas.tsx` do not yet implement `focusRequest`.

## Freshness
- Status: verified against repository (contract defined in tests; implementation currently behind contract)
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (FR-8 search result actions)
  - `src/App.tsx`
  - `src/graph/graph-canvas.tsx`
  - `src/graph/graph-canvas.test.tsx`
  - `src/App.focus-first-match.viewport.test.tsx`
- Refresh when:
  - WU-05 viewport focus implementation is merged into `App`/`GraphCanvas`
  - focus request prop/type or request replay rules change
  - tests stop requiring `fitView` specifically or begin enforcing exact `duration`/`padding` values
