# What is WU-05 scope and which dependencies and prior decisions are currently verified

## Answer
- WU-05 scope is **Search and focus actions**:
  - search by symbol name, partial symbol name, module path, and file path
  - result actions should support zoom-to, highlight, and detail-panel open
- Verified dependency decision: **WU-05 depends on WU-01, WU-02, and WU-04**.
- Current implementation and tests cover:
  - search matching over `name`, `module`, `file_path`, and `id`
  - “Focus first match” sets selection to first result and opens detail panel via selection-derived details
- Current implementation does **not** add an explicit zoom-to-node action yet.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (FR-8 Search)
  - `.memories/What remaining work units are required to fully complete the project and what dependencies do they have.md`
  - `src/graph/search.ts`
  - `src/graph/search.test.ts`
  - `src/App.tsx`
  - `src/App.bootstrap-gating.integration.test.tsx`
- Refresh when:
  - WU dependency mapping changes
  - FR-8 search/focus action requirements change
  - search/focus UI behavior or APIs in `App.tsx`/`search.ts` change
