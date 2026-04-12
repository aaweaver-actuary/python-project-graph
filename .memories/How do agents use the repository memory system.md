# How do agents use the repository memory system

## Answer
- `.memories/` is the repository-local quick-reference store and the only authoritative memory source for this repository.
- `.memories/00index.md` is the entry point and catalog.
- `.memories/00template.md` defines the standard shape and freshness markers for question or declarative-statement memories.
- Each memory file should answer one question or capture one durable repository fact.
- Memory files should use plain-language question or declarative-statement names.
- Memory Finder reads and answers from existing memory.
- Memory Researcher verifies current repository state, writes or updates memories, and refreshes `00index.md`.
- Other agents should surface memory candidates instead of reading or writing `.memories/` directly.
- `/memories/repo/`, `/memories/session/`, and other non-repository memory namespaces are non-authoritative for repository decisions.
- If duplicate or conflicting memory exists outside `.memories/`, verify against the repository, update `.memories/`, and remove or deprecate the duplicate copy.
- If `.memories/`, `00index.md`, or `00template.md` is missing, Memory Researcher or the startup hook should create it before proceeding.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
	- `.github/copilot-instructions.md`
	- `.github/instructions/memory-management.instructions.md`
	- `.github/agents/Memory Finder.agent.md`
	- `.github/agents/Memory Researcher.agent.md`
	- `.github/agents/Coding Supervisor.agent.md`
- Refresh when:
	- repository memory rules change
	- memory agent responsibilities change
	- the memory bootstrap hook changes