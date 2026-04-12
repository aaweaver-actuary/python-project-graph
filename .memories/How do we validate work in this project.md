# How do we validate work in this project

## Answer
- Primary validation commands:
  - `npm run test`
  - `npm run build`
  - `npm run lint`
  - `npm run format:check`
- `npm run test` runs `vitest run`.
- Test setup lives in `src/test.setup.ts` and is configured from `vite.config.ts`.
- `npm run build` runs `tsc -b && vite build`.
- Staged changes under `src/**/*.{ts,tsx}` trigger `vitest related --run --passWithNoTests` through `lint-staged`.

## Freshness
- Status: verified against repository
- Last verified: 2026-04-12
- Verified from:
  - `package.json`
  - `vite.config.ts`
- Refresh when:
  - package scripts change
  - vitest setup configuration changes
  - lint-staged validation rules change