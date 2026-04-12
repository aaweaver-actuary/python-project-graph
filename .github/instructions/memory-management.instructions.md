---
name: "Repository Memory Management"
description: "Use for all project workflows that need repository memory management, record-keeping, durable discoveries, or quick reference lookup in the .memories folder."
applyTo: "**"
---

# Repository Memory Management

## Startup Protocol
- At the start of each workflow, look for `.memories/` at the repository root.
- If `.memories/` does not exist, create it and create `.memories/00index.md` and `.memories/00template.md`.
- Treat `.memories/00index.md` as the entry point to repository memory.

## Memory Structure
- Keep each memory as one atomic markdown file that answers one question or records one durable fact.
- Name memory files as plain-language questions or declarative statements, such as `How do we validate work in this project.md` or `Precommit blocks direct commits to main and runs staged checks.md`.
- Reserve `00index.md` for the memory catalog and `00template.md` for the standard memory shape.
- Keep `00index.md` updated with one-line summaries and links to each memory.

## Memory Template
- Every question or declarative-statement memory should follow the `00template.md` structure.
- Use an `## Answer` section for the quick-reference content.
- Use an `## Freshness` section with at least:
	- `Status: verified against repository`
	- `Last verified: YYYY-MM-DD`
	- `Verified from:` followed by the files, commands, or evidence checked
	- `Refresh when:` followed by the main conditions that would make the memory stale

## Roles
- Agents other than Memory Finder and Memory Researcher must not read or write `.memories/` directly.
- Use Memory Finder when you need an answer from existing repository memories.
- Use Memory Researcher when a memory is missing, stale, or needs to be created or updated.

## Recording Process
- When an agent discovers a durable repository fact, workflow rule, architecture quirk, or useful command, emit a memory candidate instead of editing `.memories/` directly.
- Memory Finder should answer from existing memory when possible. If the answer is missing, uncertain, or stale according to its `## Freshness` section, it should escalate to Memory Researcher.
- Memory Researcher must verify the current answer against the repository, write or update the atomic memory file using `00template.md`, and refresh `00index.md` before returning the result.

## Quality Bar
- Prefer short, high-signal memories over long narrative documents.
- Keep memory content specific, current, and easy to scan.
- Prefer a few strong bullets in `## Answer` over narrative prose.
- Keep `## Freshness` current enough that another agent can decide whether to trust the memory immediately.
- Update or replace stale memories rather than creating near-duplicate files.