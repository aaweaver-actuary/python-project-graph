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

---

### Decision
- Id: DEC-003
- Date: 2026-04-14
- Owner: Requirements Planner
- Related request id: REQ-ISSUE-SEPARATE-PRS-02

### Context
- Problem statement: Prior request `REQ-ISSUE-BUNDLE-01` defined completion through one bundled PR, but current user intent requires separate PRs per issue with merge-triggered auto-closure.
- Trigger: New request goal explicitly changes completion contract to per-issue PR closure.
- Constraints: Keep existing implemented scope intact while changing delivery semantics; do not alter completion ledger ownership.

### Options Considered
1. Keep bundled PR closure semantics and treat new goal as advisory.
2. Keep bundled implementation semantics but add post-merge manual issue closing.
3. Re-baseline request contract to one issue per PR with mandatory auto-close references.

### Selected Option
- Selection: Option 3.
- Rationale: It directly matches current user-defined definition of done and produces testable closure behavior for each open issue.

### Accepted Risks
- Risk 1: Increased PR count increases review/coordination overhead.
- Risk 2: Sequential issue-level merges may lengthen total cycle time.

### Reversal Conditions
- Condition 1: If user explicitly reverts to bundled closure semantics in a future request.
- Condition 2: If platform/process constraints make one-issue-per-PR infeasible and PM approves a revised contract.

### Evidence
- Spec reference: `spec.md` -> "Active Issue Integration Scope (Current Request)" for `REQ-ISSUE-SEPARATE-PRS-02`
- Criteria reference: `AC-SEP-PR-01`, `AC-SEP-PR-02`
- Tests or command output reference: To be provided by Implementer/Reviewer lanes
- Reviewer note reference: Pending

---

### Decision
- Id: DEC-004
- Date: 2026-04-14
- Owner: Requirements Planner
- Related request id: REQ-ISSUE-SEPARATE-PRS-02

### Context
- Problem statement: Active issue scope expanded from #5 #7 #8 #9 to include #14 through #25, requiring explicit traceability and completion gating.
- Trigger: Issue Tracker delta reports open issues #5 #7 #8 #9 #14 #15 #16 #17 #18 #19 #20 #21 #22 #23 #24 #25.
- Constraints: Requirements must stay explicit/testable even when issue details vary by thread.

### Options Considered
1. Keep explicit criteria only for #5 #7 #8 #9 and defer #14-#25.
2. Add one aggregate criterion for #14-#25 without per-issue traceability.
3. Add per-issue acceptance criteria and a full traceability matrix for all open issues.

### Selected Option
- Selection: Option 3.
- Rationale: Provides unambiguous issue-to-criterion mapping and prevents hidden scope gaps during implementation/review.

### Accepted Risks
- Risk 1: Criteria list grows and increases planning/verification verbosity.
- Risk 2: Some issue threads may contain evolving acceptance details, requiring additional sync passes.

### Reversal Conditions
- Condition 1: If issue set is reduced by closure or reprioritization before implementation begins.
- Condition 2: If PM approves regrouping into a new bounded request with revised issue set.

### Evidence
- Spec reference: `spec.md` -> `AC-SEP-ISSUE-05`, `AC-SEP-ISSUE-07`, `AC-SEP-ISSUE-08`, `AC-SEP-ISSUE-09`, `AC-SEP-ISSUE-14`..`AC-SEP-ISSUE-25`
- Criteria reference: `AC-SEP-STYLING-01` + "Issue Traceability Matrix (Current Request)"
- Tests or command output reference: To be provided by Implementer/Reviewer lanes
- Reviewer note reference: Pending

---

### Decision
- Id: DEC-005
- Date: 2026-04-14
- Owner: Requirements Planner
- Related request id: REQ-ISSUE-SEPARATE-PRS-02

### Context
- Problem statement: Per-issue PR closure contract changes lane routing and validation duties versus prior bundled workflow.
- Trigger: New completion contract requires repeated issue-level validation and closure metadata correctness.
- Constraints: Project Manager remains sole authority for completion-ledger state transitions.

### Options Considered
1. Preserve prior bundled lane routing and validate closure only at final packaging.
2. Use per-issue implementation lanes but defer closure metadata checks to final project review.
3. Route work as one bounded issue slice at a time with per-PR closure metadata validation during each slice review.

### Selected Option
- Selection: Option 3.
- Rationale: Catches closure-reference and scope-boundary defects early, reducing end-of-cycle rework and preventing non-compliant merges.

### Accepted Risks
- Risk 1: More frequent issue sync/checkpoints can slow throughput.
- Risk 2: Strict scope boundaries may require small follow-up PRs for incidental fixes.

### Reversal Conditions
- Condition 1: If tooling is introduced to automate per-PR closure compliance checks centrally.
- Condition 2: If PM authorizes a different routing strategy with equivalent closure guarantees.

### Evidence
- Spec reference: `spec.md` -> `AC-SEP-PR-03` and "PR Metadata Contract (for validation consistency)"
- Criteria reference: `AC-SEP-PR-01`..`AC-SEP-PR-03`
- Tests or command output reference: To be provided by Implementer/Reviewer lanes
- Reviewer note reference: Pending
