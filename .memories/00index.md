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
- [What remaining work units are required to fully complete the project and what dependencies do they have](What remaining work units are required to fully complete the project and what dependencies do they have.md): dependency-ordered one-shot execution roadmap for completing the rest of the project under deadline.
- [How should an agent team execute the remaining work to production in one shot](How should an agent team execute the remaining work to production in one shot.md): operational playbook with branch-level delivery sequence, validation gates, and handoff checkpoints.
- [What production-ready gates must pass before release](What production-ready gates must pass before release.md): final release gates across functional, quality, performance, UX, and operability dimensions.
- [Where must temporary files be written in this repository](Where must temporary files be written in this repository.md): temporary file policy requiring project-local `.tmp/` usage and cleanup expectations.
