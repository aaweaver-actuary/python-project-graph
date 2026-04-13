# Completion Ledger

## Request Summary
- Request id: TBD
- User goal: TBD
- Current state: intake
- Last state change: YYYY-MM-DD
- State owner: Project Manager

## Allowed Request States
- intake
- requirements_defined
- slice_ready
- slice_in_progress
- slice_review
- blocked
- awaiting_issue_sync
- project_review
- complete

## State Transition Log
| From | To | Changed by | Date | Reason |
| --- | --- | --- | --- | --- |
| intake | intake | Project Manager | YYYY-MM-DD | Request created |

## Criteria Status
| Criterion id | Criterion | Source | Status (pass/fail/unknown/waived) | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |

## Remaining Slices
| Slice id | Objective | Owner lane | Status | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |

## Blockers And Waivers
| Type | Description | Impact | Owner | Resolution path |
| --- | --- | --- | --- | --- |

## Issue Sync Status
- Last Issue Tracker run: YYYY-MM-DD
- Coverage status: unknown
- Delta summary: TBD

## Completion Gate
- Project Reviewer verdict: pending
- Issue Tracker final pass: pending
- PM completion decision: pending

## Ownership Rules
- The Project Manager is the only role that may mark a request complete.
- Other roles may propose updates, but only the Project Manager may finalize state transitions.
- No supervisor may report project done; supervisors may only report slice complete.
