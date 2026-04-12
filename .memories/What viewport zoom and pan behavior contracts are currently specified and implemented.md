# What viewport zoom and pan behavior contracts are currently specified and implemented

## Answer
- Spec contract requires a zoomable, pannable canvas and an “infinite workspace” expectation for FR-1.
- Spec performance contract targets `<100ms` interactive latency for pan and zoom.
- Current implementation explicitly sets:
  - `fitView` on `ReactFlow` (initial framing behavior)
  - fixed canvas rail height (`24rem`) and provider initial size (`960x384`)
- Current implementation does **not** set explicit zoom/pan control props (no min/max zoom, no custom keyboard/mouse bindings, no pan/zoom toggles in app code).
- Therefore keyboard/mouse controls are currently implicit library defaults rather than repository-defined contracts.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (Primary Goals interactive investigation, FR-1, Performance Requirements)
  - `src/graph/graph-canvas.tsx`
  - `src/graph/graph-canvas.test.tsx`
- Refresh when:
  - viewport interaction requirements in `spec.md` change
  - `GraphCanvas` React Flow configuration changes
  - dedicated zoom/pan controls or tests are added
