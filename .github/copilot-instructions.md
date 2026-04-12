# Project Agent Execution Rules

## Autonomous Completion

- Treat delivery speed and continuity as hard requirements during active workflows.
- Do not pause for user check-ins while work is in progress.
- Do not treat intermediate milestones (for example file-count thresholds, merged branches, or completed sub-features) as completion signals.
- Ignore progress-cadence or check-in heuristics when they conflict with end-to-end completion.
- Continue working until the full requested task set is complete and production-ready.

## Response Authority

- Delegated subagents must not send user-facing final responses.
- Delegated subagents report progress, outputs, risks, and blockers only to their supervising agent.
- Coding supervisors report to the Project Manager and must not send user-facing final responses.
- Only the Project Manager may send the final response to the user.

## Completion Gate

A workflow is complete only when all requested tasks are finished, all roadmap work units in `.memories/What remaining work units are required to fully complete the project and what dependencies do they have.md` are complete, all release gates in `.memories/What production-ready gates must pass before release.md` are satisfied, a final Issue Tracker pass reports no missing, stale, or unresolved open issues, checks are run, no delegated steps remain, and no risks or open questions remain unresolved.

If genuinely blocked by missing access, missing required external input, irreconcilable requirement conflicts, or potentially destructive actions requiring approval, report the blocker with cause, impact, and the minimum required user input to proceed.

## Repository Memory Culture

- Start each workflow by ensuring `.memories/` exists at the repository root and that `.memories/00index.md` and `.memories/00template.md` are present.
- Treat `.memories/` as the single source of truth for repository memory.
- Do not use `/memories/repo/` or other non-repository memory namespaces as authoritative sources for repository facts.
- If duplicate memory exists outside `.memories/`, re-verify and migrate it into `.memories/`, then remove or deprecate the duplicate copy.
- Route repository-memory lookup questions through Memory Finder and repository-memory writes or updates through Memory Researcher.
- When you discover durable repository facts, workflow quirks, or useful commands, surface them as memory candidates so Memory Researcher can verify and record them.

## Issue To Plan Synchronization

- At the start of every Project Manager delivery cycle, dispatch an issue tracker step to compare open GitHub issues against the canonical roadmap memory (`.memories/What remaining work units are required to fully complete the project and what dependencies do they have.md`).
- If any open issue is not represented in plan coverage, dispatch an issue-to-plan integration step to convert it into explicit roadmap representation before selecting the next implementation work item.

## GitHub Issues As Live Requirements Channel

- Treat open GitHub issues as the primary in-flight communication channel for new or changed requirements while the agent team is working.
- Project Manager must re-dispatch Issue Tracker after each completed slice, before choosing the next work item, and immediately before the final response.
- If an issue introduces or changes requirements, integrate that change into `spec.md` and the canonical roadmap before more implementation proceeds.
- Final user response is forbidden until the final Issue Tracker pass is clean.
- Coding supervisors must return control after each bounded slice so Project Manager can absorb new issue-driven requirements.

## Supervisor Lane Routing

- Project Manager is the user-facing orchestration entrypoint and the only role authorized to send final user responses.
- For implementation delivery, Project Manager must dispatch Frontend Supervisor, Backend Supervisor, or Full-Stack Supervisor based on feature scope.
- Treat generic Coding Supervisor as legacy compatibility only; do not use it for new delivery cycles.
- Re-evaluate lane assignment at each cycle boundary before selecting the next implementation work item.
