## 1. Contracts and runtime

- [x] 1.1 Extend manifest source policies and shared graph input validation; verify table-driven registry/schema tests.
- [x] 1.2 Enforce admission for core/plugin profiles, starts and checks; verify invalid profiles and frozen runs fail with structured diagnostics.
- [x] 1.3 Share bounded role resolution across instructions and consumption, preserving rounds and directory inputs; verify missing materials fail with zero writes.

## 2. Authoring and integration

- [x] 2.1 Repair minimal/research/writing/reviewer profile and capability sources and pipeline mappings; verify every preset satisfies its manifest inputs.
- [x] 2.2 Regenerate ARSU projections and semantic review/maintenance records; verify deterministic generation and anchor checks.
- [x] 2.3 Update user model, route metadata and project constraints; verify generated documentation consistency.

## 3. Acceptance

- [x] 3.1 Extend existing CLI journeys and fixtures for full minimal completion, writing handoffs and failure cases; verify fresh-process runtime persistence.
- [x] 3.2 Run typecheck, lint, full tests, strict OpenSpec validation and packaged CLI acceptance without installing dependencies; record results.

## Verification

- `pnpm check`, `pnpm lint`, authored whitespace and `git diff --check`: passed.
- `pnpm exec tsc -p tsconfig.test.json` and `node scripts/run-tests.mjs`: 344 passed, zero failures.
- `openspec validate enforce-capability-input-contracts --strict` and all 49 main specs: passed.
- ARSU authoring byte comparison, converter check/idempotence, generated docs check and `arsu-maintenance.mjs check v3.19.0-828ef3b`: passed.
- Packaged acceptance: the `verify-package.mjs` checks passed against the unpacked tarball, including the complete minimal journey and all-tool delivery. A temporary verifier replaced dependency installation with links to existing workspace dependencies; no dependency-resolution/install verification is claimed. Tarball: 5,399 files, 107,882,103 bytes unpacked.
- Fresh-process writing/pipeline acceptance also covers the research-question Gate before downstream work; the RQ node does not depend on its own Gate.
