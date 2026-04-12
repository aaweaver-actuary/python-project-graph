# How should an agent team execute the remaining work to production in one shot

## Answer
- Use this playbook together with:
  - `What remaining work units are required to fully complete the project and what dependencies do they have`
  - `What production-ready gates must pass before release`

- Preflight (once)
  - confirm canonical memory source is `.memories/`
  - confirm repository baseline is green enough to start (run test and build)
  - confirm branch protections and commit hooks are active
  - load spec requirements and current completion status

- Standard work-unit loop (repeat for each WU)
  - create branch `feat/<wu-id>-<short-name>`
  - write or update failing tests for the specific WU acceptance criteria
  - implement minimum code to pass the failing tests
  - run peer review focusing on bugs, regressions, interface drift, and complexity
  - readability refactor only if it improves clarity without behavior change
  - run quality checks: lint, test, build, and targeted integration checks
  - merge to main with conventional commit-compliant messages
  - update durable memory if workflow facts or architecture decisions changed

- Delivery order under deadline
  - 1) WU-01 Graph engine foundation
  - 2) WU-02 Deterministic DAG layout
  - 3) WU-04 Filter model and sidebar UX
  - 4) WU-05 Search and focus actions
  - 5) WU-06 Neighborhood exploration controls
  - 6) WU-03 Node visual semantics by kind (parallel lane after WU-01)
  - 7) WU-07 Manual layout override and persistence (parallel lane after WU-02)
  - 8) WU-08 Scale and performance hardening
  - 9) WU-09 Production operations and release readiness

- Parallelization guidance
  - run WU-03 in parallel with WU-04 and WU-05 once WU-01 is merged
  - run WU-07 in parallel with WU-05 and WU-06 once WU-02 is merged
  - begin CI scaffolding from WU-09 after WU-01, then tighten continuously

- Required evidence to close each WU
  - tests proving the WU acceptance criteria
  - reviewer verdict with no unresolved high-severity findings
  - green quality checks for changed scope
  - merged PR or merge commit reference

- Final completion protocol
  - execute Project Reviewer against:
    - spec goals and acceptance criteria
    - all WU done criteria
    - all production-ready gates
  - only declare complete when all three are satisfied and no unresolved blockers remain

- Failure and recovery protocol
  - if a WU stalls, split it into smaller dependency-preserving tasks but keep parent WU ownership
  - if quality gates fail, block merge and remediate before advancing to downstream dependencies
  - if memory or instruction conflicts appear, treat `.memories/` and `.github/instructions/` as canonical and reconcile immediately

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `.memories/What remaining work units are required to fully complete the project and what dependencies do they have.md`
  - `.memories/What production-ready gates must pass before release.md`
  - `.github/agents/Coding Supervisor.agent.md`
  - `.github/agents/Project Reviewer.agent.md`
  - `.github/instructions/autonomous-delivery-no-checkins.instructions.md`
  - `.github/instructions/autonomous-delivery-supervisor-authority.instructions.md`
- Refresh when:
  - work-unit dependencies or done criteria change
  - production-ready gate policy changes
  - supervisor workflow or completion rules change