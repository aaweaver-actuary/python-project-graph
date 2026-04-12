# What remaining work units are required to fully complete the project and what dependencies do they have

## Answer

- Purpose: this is the canonical one-shot completion roadmap for the remaining project work.
- Baseline already complete:
  - bootstrap and contract validation flow
  - selection and detail panel behavior
  - immediate edge highlighting
  - pre-commit and commit-message enforcement

- Canonical execution protocol for every work unit:
  - define or confirm interfaces and data contracts first
  - write failing tests first for the selected work unit
  - implement minimum code to pass tests
  - peer review for correctness and complexity
  - readability refactor without behavior changes
  - rerun validation, merge, and record durable memory updates

- Dependency map (authoritative):
  - WU-01 has no upstream dependency.
  - WU-02 depends on WU-01.
  - WU-03 depends on WU-01.
  - WU-04 depends on WU-01 and WU-02.
  - WU-05 depends on WU-01, WU-02, and WU-04.
  - WU-06 depends on WU-04 and WU-05.
  - WU-07 depends on WU-01 and WU-02.
  - WU-08 depends on WU-03, WU-04, WU-05, WU-06, and WU-07.
  - WU-09 depends on WU-08 for final signoff (CI scaffolding can start after WU-01).
  - Deferred post-release backlog item (GitHub issue #5 pencil-style borders) depends on WU-03 and follows WU-09 release signoff.

- Work units and done criteria:
  - WU-01 Graph engine foundation
    - build React Flow rendering adapter that preserves current selected and highlighted semantics
    - define canvas contracts for node identity, edge identity, and selection/highlight state
    - done when baseline integration tests pass on the new adapter path
  - WU-02 Deterministic DAG layout
    - implement dagre-based layout service with left-to-right default and top-to-bottom fallback
    - use topological rank when present in payload
    - done when deterministic layout tests and fixture snapshots pass
  - WU-03 Node visual semantics by kind
    - implement per-kind visual mapping using non-color affordances (shape, icon/prefix, border)
    - preserve selected/highlighted visual states and existing testing hooks
    - done when node-kind rendering tests pass and accessibility checks show non-color distinction
  - WU-04 Filter model and sidebar UX
    - implement filter state and selectors for kind, module/package, file-path substring, and disconnected-node suppression
    - wire filter sidebar controls to centralized filter model
    - done when filter integration tests pass for each filter dimension and combined mode
  - WU-05 Search and focus actions
    - implement search over symbol, partial symbol, module path, and file path
    - add actions for zoom-to, highlight, and detail-panel open
    - done when search behavior tests pass for hit, miss, and multi-match scenarios
  - WU-06 Neighborhood exploration controls
    - implement upstream and downstream one-hop controls
    - implement recursive depth controls (1, 2, 3, all)
    - implement isolate-path mode for selected node and reachable neighbors
    - done when graph-neighborhood behavior tests pass for each control
  - WU-07 Manual layout override and persistence
    - implement drag repositioning and manual-layout state
    - persist layout for session and optional localStorage mode
    - add reset-to-auto-layout action
    - done when persistence tests pass across reload and reset paths
  - WU-08 Scale and performance hardening
    - benchmark at target graph sizes and optimize render/interaction path
    - enforce performance budgets for initial render and interactions
    - done when benchmark evidence meets targets from spec.md
  - WU-09 Production operations and release readiness
    - finalize CI gates, regression coverage, observability, deployment runbook, and rollback rehearsal
    - done when all production-ready gates memory checks pass and release candidate can be cut

- Critical path under deadline:
  - WU-01 -> WU-02 -> WU-04 -> WU-05 -> WU-06 -> WU-08 -> WU-09
- Parallel lanes:
  - WU-03 can run after WU-01
  - WU-07 can run after WU-02
  - CI scaffolding from WU-09 can begin after WU-01 and harden continuously

- One-shot handoff sequence for another agent team:
  - Step 1 lock contracts for WU-01 and WU-02
  - Step 2 deliver WU-01 then WU-02
  - Step 3 deliver WU-04 then WU-05 then WU-06 (core exploration path)
  - Step 4 deliver WU-03 and WU-07 in parallel where safe
  - Step 5 deliver WU-08 after feature behavior stabilizes
  - Step 6 deliver WU-09 and run final production gate review

- Do not declare project complete until:
  - all WU-01 through WU-09 done criteria are satisfied
  - production-ready gates in the dedicated memory are all satisfied
  - Project Reviewer reports no unresolved gaps

## Freshness

- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md`
  - `src/App.tsx`
  - `src/graph/graph-canvas.tsx`
  - `src/graph/bootstrap.orchestrator.ts`
  - `src/graph/contracts.ts`
  - `.husky/pre-commit`
  - `package.json`
  - `.github/agents/Coding Supervisor.agent.md`
  - `.github/agents/Project Reviewer.agent.md`
- Refresh when:
  - functional requirements in `spec.md` change
  - graph rendering stack choice changes
  - production SLO or release gate expectations change
  - supervisor or reviewer completion policy changes
