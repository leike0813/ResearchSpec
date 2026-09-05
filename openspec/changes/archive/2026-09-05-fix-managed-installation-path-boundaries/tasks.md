## 1. Managed target contract

- [x] 1.1 Implement scope and owner/source target validation and connect all retirement planners; verify malicious paths never produce a removal or target content read in focused behavioral tests.
- [x] 1.2 Distinguish missing and invalid manifests and block invalid mutation entrypoints; verify CLI zero-write tests and read-only diagnostics.

## 2. Filesystem execution boundary

- [x] 2.1 Carry trusted roots through generated plans and validate paths during planning, execution and rollback; verify write-plan tests for symlink parents, post-plan replacement, legitimate roots and rollback safety.
- [x] 2.2 Protect direct config/manifest writes and document the maintenance constraint in AGENTS.md; verify entrypoint tests and inspect all production write-plan call sites.

## 3. Integration verification

- [x] 3.1 Run typecheck, lint, test compilation and related delivery/CLI/security suites; confirm normal install/update/uninstall, drift handling and shared-global preservation.
- [x] 3.2 Run strict OpenSpec change validation and diff checks; record results and leave the completed change available for review.

## Verification

- Passed `pnpm check`, `pnpm lint`, `pnpm exec tsc -p tsconfig.test.json`, and `pnpm exec tsc -p tsconfig.build.json`. Subsequent edits also passed targeted ESLint checks.
- Passed all 28 tests across `managed-installation-paths`, `write-plan`, and `graph-security`.
- Related adapter, literature-adapter, graph-workspace, graph CLI/context/static, and plugin-extension suites passed in grouped runs. The final invalid-manifest diagnostic adjustment passed three focused security/context CLI tests.
- Passed `openspec validate fix-managed-installation-path-boundaries --strict --no-interactive` and `git diff --check`.
- Full vendor/audit and release suites were not run. The change remains active for review.
