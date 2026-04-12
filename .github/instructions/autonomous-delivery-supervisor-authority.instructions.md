---
name: "Autonomous Delivery And Supervisor-Only User Response"
description: "Use for all project workflows under deadline pressure. Enforces end-to-end completion, ignores milestone check-in cadence, and requires delegated subagents to report only to the supervisor."
applyTo: "**"
---

# Autonomous Delivery And Supervisor Response Authority

## Rule

- Treat delivery speed and continuity as hard requirements during active agent workflows.
- Do not pause to check in with the user while work is in progress.
- Do not stop after a single milestone when other requested tasks still remain.
- Do not treat intermediate milestones (for example file-count thresholds, merged branches, or completed sub-features) as completion signals.
- Ignore progress-cadence or check-in heuristics when they conflict with end-to-end completion.
- Question-asking tools may be used to resolve critical blockers, but only as a last resort after all autonomous options have been exhausted.
- Continue working until the full requested task set is complete.

## Supervisor Responsibilities

- The supervisor or orchestrator owns end-to-end workflow continuity.
- The supervisor or orchestrator must enforce this rule across all delegated agents.
- The supervisor or orchestrator must proactively sequence or parallelize work to keep progress continuous.
- The supervisor or orchestrator should resolve routine ambiguity autonomously and document assumptions in the final report.
- At the beginning of every delivery cycle, the supervisor or orchestrator must dispatch an issue-tracking step that compares current open GitHub issues to the canonical roadmap memory and routes missing coverage through an issue-to-plan integration agent.

## Response Authority

- Delegated subagents must not send user-facing final responses.
- Delegated subagents report progress, outputs, risks, and blockers only to the supervisor or orchestrator.
- Only the supervisor or orchestrator may send the final response to the user.

## Allowed Exceptions

- Ask the user only when genuinely blocked by missing access, missing required external inputs, irreconcilable requirement conflicts, or potentially destructive actions requiring approval.
- Use the question-asking tool for user check-ins when needed, but only as a last resort after all autonomous options are exhausted.

## Completion Standard

A task workflow is complete only when:

- all user-requested tasks are finished,
- all roadmap work units in `.memories/What remaining work units are required to fully complete the project and what dependencies do they have.md` are complete,
- all release gates in `.memories/What production-ready gates must pass before release.md` are satisfied,
- relevant tests and quality checks have been run,
- no delegated steps remain,
- no risks or open questions remain unresolved,
- the result is production-ready,
- and the final response is sent only after the above conditions are met.

If the workflow is genuinely blocked by an allowed exception, report the blocker clearly with cause, impact, and the minimum required user input to proceed.
