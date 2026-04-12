# What are requestId boundaries in bootstrap and App flow

## Answer
- There is no `requestId` contract in the current bootstrap/App flow.
- `App` boundary is `runBootstrap: () => Promise<GraphBootstrapState>`; no request token/ID is passed in or returned.
- Duplicate bootstrap invocation protection is by memoizing the bootstrap promise in a `WeakMap` keyed by the `runBootstrap` function reference (supports StrictMode replay).
- Graph bootstrap orchestration boundary is dependency injection of `{ dataSource, validator }`; results are only `loading | ready | invalid-payload`.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/graph/bootstrap.contracts.ts`
  - `src/graph/bootstrap.orchestrator.ts`
  - `src/App.bootstrap-gating.integration.test.tsx`
  - `src/graph/bootstrap.orchestrator.test.ts`
  - repository search: `grep -RIn "requestId" src .memories README.md spec.md` (no matches)
- Refresh when:
  - bootstrap/App signatures or bootstrap state union changes
  - StrictMode/bootstrap memoization strategy in `App.tsx` changes
  - any `requestId`-style field is introduced in bootstrap contracts, orchestrator, or app wiring
