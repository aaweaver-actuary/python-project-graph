# Repository Memory Index

This folder stores atomic quick-reference memories for future agents.

## Rules

- Start here before reading individual memories.
- Use `00template.md` when creating or updating question or declarative-statement memories.
- Each memory answers one question or records one durable repository fact.
- Memory files use plain-language question or declarative-statement names.
- Memory Finder reads from this folder. Memory Researcher verifies and writes to it.

## Entries

- [00template.md](00template.md): template for atomic memory files and freshness signals.
- [How do agents use the repository memory system](How do agents use the repository memory system.md): startup, lookup, and write rules for `.memories/`.
- [How do we validate work in this project](How do we validate work in this project.md): primary validation commands and test setup facts.
- [Precommit blocks direct commits to main limits commit size and runs lint-staged](Precommit blocks direct commits to main limits commit size and runs lint-staged.md): branch protection, commit size limits, and staged-file checks.
- [The current graph slice lives in src graph and centers on bootstrap and validation contracts](The current graph slice lives in src graph and centers on bootstrap and validation contracts.md): historical baseline note about where initial graph contracts and bootstrap logic were implemented.
- [All Slice S1 acceptance criteria are complete with 60 tests across 10 files](All Slice S1 acceptance criteria are complete with 60 tests across 10 files.md): historical completion record for S1 (AC-S1-01–05) and associated visual-state test patterns.
- [What remaining work units are required to fully complete the project and what dependencies do they have](What remaining work units are required to fully complete the project and what dependencies do they have.md): dependency-ordered roadmap including explicit WU-10 traceability to issues #5+#7, with PR-AESTH-01 as the smallest synchronized slice and PR-AESTH-02/03 marked as deferred residual #7 scope.
- [How should an agent team execute the remaining work to production in one shot](How should an agent team execute the remaining work to production in one shot.md): operational playbook with coherent delivery sequencing through WU-09 plus explicit post-release WU-10/WU-11/WU-12 ordering and parallelization guidance.
- [What production-ready gates must pass before release](What production-ready gates must pass before release.md): final release gates across functional, quality, performance, UX, and operability dimensions.
- [Where must temporary files be written in this repository](Where must temporary files be written in this repository.md): temporary file policy requiring project-local `.tmp/` usage and cleanup expectations.
- [What is WU-05 scope and which dependencies and prior decisions are currently verified](What is WU-05 scope and which dependencies and prior decisions are currently verified.md): verified WU-05 scope, dependency chain, and implemented-vs-spec search/focus actions.
- [What viewport zoom and pan behavior contracts are currently specified and implemented](What viewport zoom and pan behavior contracts are currently specified and implemented.md): current zoom/pan requirements, implemented defaults, and explicit control gaps.
- [What are the search filter and detail panel contracts and integration boundaries](What are the search filter and detail panel contracts and integration boundaries.md): contracts for filter/search/detail plus App-level data-flow boundaries.
- [What testing conventions apply to viewport search filter and detail behavior](What testing conventions apply to viewport search filter and detail behavior.md): testing stack, contract patterns, and current area-specific coverage status.
- [What are requestId boundaries in bootstrap and App flow](What are requestId boundaries in bootstrap and App flow.md): verified that no requestId contract exists; bootstrap boundaries are runBootstrap DI, state union, and StrictMode-safe promise memoization.
- [What is the WU-05 viewport focus contract for App and GraphCanvas](What is the WU-05 viewport focus contract for App and GraphCanvas.md): test-defined App→GraphCanvas focusRequest contract (`{requestId,nodeId}`), fitView-specific expectation, replay semantics, and duration/padding assertion scope.
- [Is GitHub issue #8 explicitly represented with traceability in canonical roadmap and planning artifacts](Is GitHub issue #8 explicitly represented with traceability in canonical roadmap and planning artifacts.md): verification that issue #8 is now explicitly trace-linked as WU-11 in canonical roadmap and one-shot planning memories.
- [Is GitHub issue #9 explicitly represented with traceability in canonical roadmap and planning artifacts](Is GitHub issue #9 explicitly represented with traceability in canonical roadmap and planning artifacts.md): verification that issue #9 is now explicitly mapped as WU-12 with FR-2-first precedence, dependencies, sequencing placement, and PR-SPRING-01..03 done criteria.
- [What conventions in spec.md are used for requirement IDs issue traceability and non-goals future extensions](What conventions in spec.md are used for requirement IDs issue traceability and non-goals future extensions.md): verified `spec.md` naming/structure conventions for requirement IDs, inline GitHub issue traceability, and V1/Slice non-goals vs Future V2 extensions layout.
- [What frontend styling constraints govern PR-AESTH-01 hand-drawn aesthetic work](What frontend styling constraints govern PR-AESTH-01 hand-drawn aesthetic work.md): verified PR-AESTH-01 styling contract, deferment boundaries for PR-AESTH-02/03, and implementation-facing constraints to preserve existing node/edge visual semantics and comprehension-first behavior.
