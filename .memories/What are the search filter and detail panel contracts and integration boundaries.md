# What are the search filter and detail panel contracts and integration boundaries

## Answer
- Filter contract (`GraphFilterState`) is centralized with:
  - `kindSelection`
  - `moduleQuery`
  - `filePathQuery`
  - `hideDisconnected`
- Filter boundary:
  - `applyGraphFilters(payload, filterState)` returns filtered nodes/edges only
  - edges are pruned to visible node IDs; optional disconnected-node removal runs after edge pruning
- Search contract:
  - `searchGraphNodes(payload, query)` returns sorted matching nodes for `name`, `module`, `file_path`, or `id`
  - blank query returns empty results
- Detail panel contract:
  - `deriveSelectedNodeDetails(payload, selectedNodeId)` returns `NodeDetails | null`
  - `DetailPanel` renders only when `details !== null`
- Integration boundary in `App`:
  - bootstrap payload -> filter model -> search results from filtered payload
  - focus action sets `selectedNodeId` from search results
  - detail model is derived from filtered payload + effective selected node
  - selection is cleared if the selected node is filtered out

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (FR-5, FR-6, FR-8, Slice S1 contracts)
  - `src/graph/filters.ts`
  - `src/graph/search.ts`
  - `src/graph/node-details.tsx`
  - `src/App.tsx`
  - `src/graph/filters.test.ts`
  - `src/graph/search.test.ts`
  - `src/App.bootstrap-gating.integration.test.tsx`
- Refresh when:
  - filter/search/detail interfaces or behavior change
  - selection derivation and visibility rules in `App.tsx` change
  - FR-5/FR-6/FR-8 requirements change
