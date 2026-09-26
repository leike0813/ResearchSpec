## 1. Preconditions and catalog

- [x] 1.1 Confirm 01-reorient-research-task-usage is implemented and its product contracts are current; read this change's proposal, deltas and design before code edits.
- [x] 1.2 Add catalog entry metadata and the documented six-host rule mappings, with explicit discovery fallback for every remaining registered target and no invented host version guarantee.
- [x] 1.3 Implement one entry renderer with mode-correct installed entry references, documented shadowing/fallback protection, and shared-destination grouping.
- [x] 1.4 Update Navigate discovery description and invocation conditions for ordinary literature, manuscript, evidence and review requests; make command wrappers consume the canonical Navigate execution guidance with valid reference handling so commands-only delivery also receives changes 03/04 without a duplicate policy.

## 2. Managed entry lifecycle

- [x] 2.1 Extend the strict manifest source variant and managed-target resolver for exact catalog-owned project entry destinations and file/region mode.
- [x] 2.2 Implement byte-preserving marked-region planning through the existing whole-file snapshot transaction; preserve unowned, malformed and modified content regardless of force.
- [x] 2.3 Integrate creation, refresh, deselection and shared-consumer transfer into init/update reconciliation; keep optional content conflicts nonblocking while unsafe paths and invalid manifests remain blocking.
- [x] 2.4 Audit every installation hash consumer, including legacy reconciliation and managed-projection checks; use region-aware owned-byte hashing and prohibit whole-file removal for region records.

## 3. Inspection and documentation

- [x] 3.1 Extend list tools metadata and doctor structured/human output for entry delivery, absence, drift and statically known shadowing without runtime probes.
- [x] 3.2 Generate the full target delivery matrix from the catalog, documenting mechanism evidence and runtime-unverified status separately; update relevant CLI/user/developer documentation.
- [x] 3.3 Sync these deltas using the project-local OpenSpec sync skill after implementation, preserving unrelated main-spec requirements.

## 4. Validation

- [x] 4.1 Extend existing tests for all tool/delivery-mode combinations, shared consumer changes, region byte preservation/BOM/CRLF, unowned markers, drift, malformed markers, missing files, symlinks, unsafe manifests and concurrent edits.
- [x] 4.2 Verify doctor exposes warnings without mutations and list tools reports explicit discovery fallbacks; avoid assertions on exact instruction prose.
- [x] 4.3 Run `pnpm check`, `pnpm exec tsc -p tsconfig.test.json` followed by focused `node --test .test-dist/tests/<affected-suite>.test.js` runs, `pnpm lint`, `pnpm docs:check` and packaged install/update verification; record commands and outcomes. Use the built CLI or existing package-verification tooling without installing dependencies or globally linking the package.
- [x] 4.4 Run strict OpenSpec validation and hand the installed entry surfaces to change 05 for real-session evaluation; do not claim behavioral verification from static checks.

Validation record (all passed): `pnpm check`; `pnpm exec tsc -p tsconfig.test.json`; focused `node --test` runs for `adapters`, `managed-installation-paths`, and `graph-cli-main`; `pnpm lint`; `pnpm docs:check`; `openspec validate --specs --strict`; `openspec validate 02-deliver-proactive-research-entry --strict`; `npm pack --dry-run --json --ignore-scripts` inventory check; and built-CLI Codex/Claude init→update smoke checks in temporary projects. No dependency installation or global link was used. Change 05 consumes `researchspec list tools --json` and `docs/user/agent-entry-matrix.md`; real-session activation remains unverified there.
