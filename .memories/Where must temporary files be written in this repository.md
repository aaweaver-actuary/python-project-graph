# Where must temporary files be written in this repository

## Answer
- Write all temporary files under project-local `.tmp/`.
- Do not write temporary workflow files to system temp locations such as `/tmp`.
- Create `.tmp/` if missing before using it.
- Remove temporary files at the end of the workflow unless explicitly retained for debugging.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `.github/instructions/temp-files.instructions.md`
  - `.github/copilot-instructions.md`
- Refresh when:
  - temporary file policy changes in repository instructions
  - new workflow tooling changes temp-file behavior