# What frontend styling constraints govern PR-AESTH-01 hand-drawn aesthetic work

## Answer

- PR-AESTH-01 is a post-release requirement in Future V2 (not V1 scope).
- PR-AESTH-01 contract: when the post-release aesthetic theme is enabled, node/table borders and edge arrows must share a reusable pencil-treatment style with slight hand-drawn wiggle and subtle particle-gap texture across supported border/line contexts.
- PR-AESTH-02 (dotted-paper background) and PR-AESTH-03 (post-it-note-like color tokens with readable contrast) are explicitly deferred residual scope and are not required to complete PR-AESTH-01.
- Existing frontend style contracts that PR-AESTH-01 must preserve:
  - node-kind distinction must not rely only on color (`shape`/`border style`/`icon`/`label prefix` are required semantics),
  - color usage remains theme-safe,
  - core product principle stays “structural comprehension speed,” not aesthetic-first diagramming.
- Current code baseline to integrate with:
  - per-kind border semantics are centralized in `src/graph/styles.ts` and applied in `src/graph/graph-canvas.tsx`,
  - directed edge arrows are rendered via `markerEnd: { type: MarkerType.ArrowClosed }` in `src/graph/graph-canvas.tsx`,
  - no PR-AESTH theme enablement implementation is currently present in `src/` (spec-defined contract only at this time).

## Freshness

- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (Non-Goals V1, FR-3 styling constraints, Future V2 PR-AESTH-01/02/03, core principle)
  - `src/graph/styles.ts`
  - `src/graph/styles.test.ts`
  - `src/graph/graph-canvas.tsx`
  - `src/graph/graph-canvas.graph-engine-foundation.test.tsx`
- Refresh when:
  - PR-AESTH requirements, issue traceability, or deferment boundaries change in `spec.md`
  - theme enablement or pencil-treatment implementation lands in `src/`
  - node-kind visual semantics or edge marker contracts change
