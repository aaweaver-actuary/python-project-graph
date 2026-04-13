# Decision Log

## Decision Record Template

### Decision
- Id: DEC-000
- Date: YYYY-MM-DD
- Owner: Requirements Planner
- Related request id: TBD

### Context
- Problem statement:
- Trigger:
- Constraints:

### Options Considered
1. Option A:
2. Option B:
3. Option C:

### Selected Option
- Selection:
- Rationale:

### Accepted Risks
- Risk 1:
- Risk 2:

### Reversal Conditions
- Condition 1:
- Condition 2:

### Evidence
- Spec reference:
- Criteria reference:
- Tests or command output reference:
- Reviewer note reference:

---

### Decision
- Id: DEC-001
- Date: 2026-04-13
- Owner: Requirements Planner
- Related request id: REQ-ISSUE-BUNDLE-01

### Context
- Problem statement: The current spec defers issue scopes #5 #7 #8 #9 as post-release, but the active user goal requires integrating all of them now in one PR.
- Trigger: Issue Tracker sync status is NOT CLEAN with open issues #5 #7 #8 #9.
- Constraints: Keep architecture direction intact; do not weaken existing FR-1..FR-9 behavior.

### Options Considered
1. Keep deferments and deliver only baseline V1 behavior.
2. Activate only styling issues (#5, #7) and continue deferring #8/#9.
3. Activate #5 #7 #8 #9 together as one bounded request with explicit acceptance criteria and issue traceability.

### Selected Option
- Selection: Option 3.
- Rationale: It directly satisfies the user goal and resolves issue coverage gaps while preserving existing core architecture requirements.

### Accepted Risks
- Risk 1: Bundled scope may increase review and merge complexity in one PR.
- Risk 2: Cross-cutting UI/layout changes can introduce regressions without strict criterion-level validation.

### Reversal Conditions
- Condition 1: If issue scopes cannot be delivered without violating core FR behavior, split into multiple PRs under PM direction.
- Condition 2: If Issue Tracker shows new deltas mid-cycle that materially change scope, return to requirements planning.

### Evidence
- Spec reference: `spec.md` -> "Active Issue Integration Scope (Current Request)"
- Criteria reference: `AC-BUNDLE-01` through `AC-BUNDLE-08`
- Tests or command output reference: To be provided by Implementer/Reviewer lanes
- Reviewer note reference: Pending

---

### Decision
- Id: DEC-002
- Date: 2026-04-13
- Owner: Requirements Planner
- Related request id: REQ-ISSUE-BUNDLE-01

### Context
- Problem statement: Spring-force behavior (#9) can conflict with FR-2 layered DAG readability if treated as a replacement layout.
- Trigger: Explicit ambiguity called out in request ("especially FR-2 vs spring force").
- Constraints: FR-2 directional layering remains architectural baseline.

### Options Considered
1. Replace FR-2 with full spring layout whenever spring is enabled.
2. Run FR-2 then unrestricted spring relaxation.
3. Run FR-2 first, then constrained spring refinement with hard guardrails; clamp/skip spring moves that violate FR-2 readability.

### Selected Option
- Selection: Option 3.
- Rationale: Preserves core comprehension-oriented layout while still enabling issue #9 behavior as refinement.

### Accepted Risks
- Risk 1: Constraint tuning may reduce visible spring effect.
- Risk 2: Over-constrained movement may require iterative parameter balancing.

### Reversal Conditions
- Condition 1: If constrained spring fails to improve edge readability or spacing in measurable scenarios, disable by default.
- Condition 2: If a future architecture decision adopts a different primary layout strategy, revisit FR-2 precedence.

### Evidence
- Spec reference: `spec.md` -> FR-2 precedence rule + `AC-BUNDLE-06` and `AC-BUNDLE-07`
- Criteria reference: Issue #9 traceability in Active Issue Integration Scope
- Tests or command output reference: To be provided by Implementer/Reviewer lanes
- Reviewer note reference: Pending
