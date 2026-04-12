# The current graph slice lives in src graph and centers on bootstrap and validation contracts

## Answer
- The primary feature area is `src/graph/`.
- `contracts.ts` defines node kinds, edge kinds, graph payload types, validation results, and the `GraphValidator` interface.
- `bootstrap.contracts.ts` defines `GraphDataSource`, `GraphBootstrapState`, and `GraphBootstrapDependencies`.
- The slice includes bootstrap orchestration, fixture data-source loading, graph canvas rendering, node details, and payload validation.
- Tests in `src/graph/` cover contracts, bootstrap orchestration, fixture loading, node details, and validator happy and error paths.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
	- `src/graph/contracts.ts`
	- `src/graph/bootstrap.contracts.ts`
	- `src/graph/`
- Refresh when:
	- the `src/graph/` layout changes
	- bootstrap contracts move or change meaning
	- the validation and graph rendering responsibilities shift
*** Add File: /Users/andy/python-project-graph/.memories/00template.md
# Memory Template

Use this structure for question or declarative-statement memories.

```md
# <Question or declarative statement>

## Answer
- Concise quick-reference bullets only.

## Freshness
- Status: verified against repository
- Last verified: YYYY-MM-DD
- Verified from:
	- path/to/file
- Refresh when:
	- the underlying workflow, file layout, contract, or command changes
```

Guidelines:
- Keep each memory atomic and single-topic.
- Prefer a few strong bullets over prose.
- Update `## Freshness` whenever the answer is re-verified.
*** Add File: /Users/andy/python-project-graph/.github/hooks/ensure-memories.sh
#!/usr/bin/env sh
set -eu

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
memories_dir="$repo_root/.memories"
index_file="$memories_dir/00index.md"
template_file="$memories_dir/00template.md"

mkdir -p "$memories_dir"

if [ ! -f "$template_file" ]; then
	cat > "$template_file" <<'EOF'
# Memory Template

Use this structure for question or declarative-statement memories.

```md
# <Question or declarative statement>

## Answer
- Concise quick-reference bullets only.

## Freshness
- Status: verified against repository
- Last verified: YYYY-MM-DD
- Verified from:
	- path/to/file
- Refresh when:
	- the underlying workflow, file layout, contract, or command changes
```

Guidelines:
- Keep each memory atomic and single-topic.
- Prefer a few strong bullets over prose.
- Update `## Freshness` whenever the answer is re-verified.
EOF
fi

if [ ! -f "$index_file" ]; then
	cat > "$index_file" <<'EOF'
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
EOF
fi
*** Add File: /Users/andy/python-project-graph/.github/hooks/memory-bootstrap.json
{
	"hooks": {
		"SessionStart": [
			{
				"type": "command",
				"command": "sh .github/hooks/ensure-memories.sh",
				"timeout": 10
			}
		],
		"SubagentStart": [
			{
				"type": "command",
				"command": "sh .github/hooks/ensure-memories.sh",
				"timeout": 10
			}
		]
	}
}