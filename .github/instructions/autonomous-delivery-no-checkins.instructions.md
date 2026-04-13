---
description: 'Use for all agent workflows under deadline pressure. Enforces autonomous execution without user check-ins until the full requested task set is complete.'
name: 'Autonomous Delivery No Check-Ins'
applyTo: '**'
---

# Autonomous Delivery Under Time Pressure

## Rule

- Treat delivery speed and continuity as hard requirements during active agent workflows.
- Do not pause to check in with the user while work is in progress.
- Do not stop after a single milestone when other requested tasks still remain.
- Do not treat intermediate milestones (for example file-count thresholds, merged branches, or completed sub-features) as completion signals.
- Ignore progress-cadence or check-in heuristics when they conflict with end-to-end completion.
- Question-asking tools may be used to resolve critical blockers, but only as a last resort after all autonomous options have been exhausted.
- Continue working until the full requested task set is complete.

## Supervisor Responsibilities

- The Project Manager owns end-to-end workflow continuity and the bigger-picture user outcome.
- The Project Manager must enforce this rule across all delegated agents and lane supervisors.
- The Project Manager must proactively sequence or parallelize work to keep progress continuous.
- The Project Manager should resolve routine ambiguity autonomously and document assumptions in the final report.
- At the beginning of every delivery cycle, the Project Manager must dispatch an issue-tracking step that compares current open GitHub issues to active request criteria and routes deltas through Requirements Planner.
- The Project Manager must treat open GitHub issues as a live requirements channel during execution, re-run issue tracking after each completed slice and immediately before the final response, and route requirement deltas into the spec and plan before more implementation proceeds.

## Response Authority

- Delegated subagents must not send user-facing final responses.
- Delegated subagents report progress, outputs, risks, and blockers only to their supervising agent.
- Lane supervisors must report to the Project Manager and must not send user-facing final responses.
- Only the Project Manager may send the final response to the user.

## Allowed Exceptions

- Ask the user only when genuinely blocked by missing access, missing required external inputs, irreconcilable requirement conflicts, or potentially destructive actions requiring approval.
- Use the question-asking tool for user check-ins when needed, but only as a last resort after all autonomous options are exhausted.

## Completion Standard

A task workflow is complete only when:

- all user-requested tasks are finished,
- all required criteria in `completion-ledger.md` are pass or explicitly waived,
- a final Issue Tracker pass reports no missing, stale, or unresolved open issues,
- Project Reviewer returns done,
- relevant tests and quality checks have been run,
- no delegated steps remain,
- no risks or open questions remain unresolved,
- the result is production-ready,
- and the final response is sent only after the above conditions are met.

If the workflow is genuinely blocked by an allowed exception, report the blocker clearly with cause, impact, and the minimum required user input to proceed.
