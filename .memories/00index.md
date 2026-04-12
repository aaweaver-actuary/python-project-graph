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
- [The current graph slice lives in src graph and centers on bootstrap and validation contracts](The current graph slice lives in src graph and centers on bootstrap and validation contracts.md): where the current feature slice and core graph contracts live.
- [All Slice S1 acceptance criteria are complete with 60 tests across 10 files](All Slice S1 acceptance criteria are complete with 60 tests across 10 files.md): S1 (AC-S1-01–05) done; documents the dual-mechanism visual state patterns for nodes and edges.
