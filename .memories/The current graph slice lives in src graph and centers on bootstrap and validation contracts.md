# The current graph slice lives in src graph and centers on bootstrap and validation contracts

## Answer

- The primary feature area is `src/graph/`.
- `contracts.ts` defines node kinds, edge kinds, graph payload types, validation results, and the `GraphValidator` interface.
- `bootstrap.contracts.ts` defines `GraphDataSource`, `GraphBootstrapState`, and `GraphBootstrapDependencies`.
- The slice includes bootstrap orchestration, fixture data-source loading, graph canvas rendering, node details, and payload validation.
- Tests in `src/graph/` cover contracts, bootstrap orchestration, fixture loading, node details, and validator happy and error paths.

## Freshness

- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `src/graph/contracts.ts`
  - `src/graph/bootstrap.contracts.ts`
  - `src/graph/`
- Refresh when:
  - the `src/graph/` layout changes
  - bootstrap contracts move or change meaning
  - the validation and graph rendering responsibilities shift
