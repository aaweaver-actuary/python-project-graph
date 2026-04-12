# What production-ready gates must pass before release

## Answer
- Functional gates
  - FR-1 through FR-9 behavior is implemented and verifiably tested.
  - Graph exploration flows cover load, select, details, filters, search, neighborhood controls, drag, and persistence.

- Quality gates
  - CI requires lint, test, and build to pass on every merge.
  - Commit conventions, branch safety, and pre-commit checks remain enforced.
  - Validation tests cover valid payloads, invalid payloads, and schema-drift regressions.

- Performance gates
  - Benchmark dataset includes at least one 1000-node case and one higher-stress case.
  - Initial render and interaction latencies meet thresholds defined in `spec.md`.

- UX and robustness gates
  - Invalid payload handling is explicit and non-crashing.
  - Empty or no-result states for filtering and search are clear and actionable.
  - Core user questions can be answered in under 10 seconds through the UI.

- Operability gates
  - Telemetry or structured logs exist for load time, validation failures, and expensive graph interactions.
  - Deployment and rollback steps are documented and rehearsed at least once.
  - Release checklist is signed off with known risks and mitigations.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md`
  - `.husky/pre-commit`
  - `.husky/commit-msg`
  - `commitlint.config.cjs`
  - `package.json`
- Refresh when:
  - release criteria change in product or engineering planning
  - CI or quality gate policy changes
  - performance targets in `spec.md` change