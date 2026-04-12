# Precommit blocks direct commits to main limits commit size and runs lint-staged

## Answer
- The pre-commit hook blocks non-merge commits on `main` after the repository has an initial `HEAD`.
- The same hook rejects commits with more than 20 staged files or more than 600 total changed lines.
- After those safety checks, the hook runs `npx --no -- lint-staged`.
- `lint-staged` runs `eslint --max-warnings=0` and `prettier --write` for staged JS and TS files.
- `lint-staged` runs `vitest related --run --passWithNoTests` for staged files under `src/**/*.{ts,tsx}`.
- `lint-staged` runs `prettier --write` for staged CSS, HTML, JSON, and Markdown files.
- The commit-message hook runs `npx --no -- commitlint --edit "$1"`.
- Commitlint requires a non-empty scope and restricts commit types to `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
	- `.husky/pre-commit`
	- `.husky/commit-msg`
	- `package.json`
	- `commitlint.config.cjs`
- Refresh when:
	- Husky hook scripts change
	- commitlint rules change
	- lint-staged rules change