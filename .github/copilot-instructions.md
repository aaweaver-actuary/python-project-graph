# Project Agent Execution Rules

## Autonomous Completion

- Treat delivery speed and continuity as hard requirements during active workflows.
- Do not pause for user check-ins while work is in progress.
- Do not treat intermediate milestones (for example file-count thresholds, merged branches, or completed sub-features) as completion signals.
- Ignore progress-cadence or check-in heuristics when they conflict with end-to-end completion.
- Continue working until the full requested task set is complete and production-ready.

## Response Authority

- Delegated subagents must not send user-facing final responses.
- Delegated subagents report progress, outputs, risks, and blockers only to the supervisor or orchestrator.
- Only the supervisor or orchestrator may send the final response to the user.

## Completion Gate

A workflow is complete only when all requested tasks are finished, checks are run, no delegated steps remain, and no risks or open questions remain unresolved.

If genuinely blocked by missing access, missing required external input, irreconcilable requirement conflicts, or potentially destructive actions requiring approval, report the blocker with cause, impact, and the minimum required user input to proceed.

## Repository Memory Culture

- Start each workflow by ensuring `.memories/` exists at the repository root and that `.memories/00index.md` and `.memories/00template.md` are present.
- Route repository-memory lookup questions through Memory Finder and repository-memory writes or updates through Memory Researcher.
- When you discover durable repository facts, workflow quirks, or useful commands, surface them as memory candidates so Memory Researcher can verify and record them.
