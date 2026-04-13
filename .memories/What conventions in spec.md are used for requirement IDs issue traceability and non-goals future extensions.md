# What conventions in spec.md are used for requirement IDs issue traceability and non-goals future extensions

## Answer

- Requirement IDs are section-scoped prefixes, not one global scheme:
  - Functional requirements use `FR-<n>` (for example `FR-1` through `FR-9`).
  - Slice acceptance criteria use `AC-S1-<nn>` (for example `AC-S1-01` to `AC-S1-05`).
  - Slice TDD checks use `TDD-<nn>` (for example `TDD-01` to `TDD-05`).
  - Post-release aesthetic requirements use `PR-AESTH-<nn>` under a named post-release requirement unit.
- GitHub issue traceability is written inline with explicit issue numbers:
  - In `spec.md`, traceability appears as direct `#<issue>` references (for example `issue traceability: #7, includes #5`).
  - Planning instructions require explicit issue-to-plan-and-spec mapping, with unambiguous links between issue numbers and plan items.
- Non-goals/future structure is explicit and layered:
  - `## Non-Goals (V1)` lists project-level out-of-scope bullets.
  - Slice-specific exclusions live under `### Slice S1 Non-Goals / Guardrails`.
  - `## Future V2 Extensions` captures reserved capabilities, including a trace-linked post-release requirement unit plus additional future-capability subsections.

## Freshness

- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `spec.md` (`FR-*`, `AC-S1-*`, `TDD-*`, `PR-AESTH-*`, V1 non-goals, Slice S1 non-goals/guardrails, Future V2 Extensions, issue references)
  - `.github/agents/Issue Tracker.agent.md` (explicit issue-to-plan/spec coverage and preference for unambiguous issue-number links)
  - `.github/agents/Issue Plan Integrator.agent.md` (requires issue-number traceability in roadmap/spec representation)
  - `.github/copilot-instructions.md` (issue synchronization and requirement-delta integration into `spec.md` and roadmap)
- Refresh when:
  - requirement identifier blocks or naming patterns in `spec.md` change
  - issue-reference style in `spec.md` changes
  - issue-to-plan/spec synchronization policy in `.github/agents` or `.github/copilot-instructions.md` changes
