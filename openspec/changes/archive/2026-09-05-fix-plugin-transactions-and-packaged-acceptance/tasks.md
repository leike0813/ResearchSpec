## 1. Plugin transaction

- [x] 1.1 Combine projection, config and manifest in one existing write plan with snapshot read preconditions; verify install/update/uninstall and unchanged-snapshot conflicts.
- [x] 1.2 Remove independent writers and cover caught-error rollback across all three file categories; run focused plugin and write-plan tests.

## 2. Installed acceptance

- [x] 2.1 Complete the installed academic-pipeline journey with children, Gates, Decisions, two revision rounds and resume; verify persisted completion through fresh CLI processes.
- [x] 2.2 Correct compiled-CLI naming and document transaction and acceptance boundaries; review changed documentation against implemented behavior.
- [x] 2.3 Fix initial revision reachability discovered by installed acceptance; verify an earlier-entry graph reaches round 1 and later rounds still require continue.

## 3. Integration verification

- [x] 3.1 Run typecheck, lint, existing full tests, strict OpenSpec validation and diff checks; record results.
- [x] 3.2 Run the authorized real tarball installation and release verifier; record complete pipeline and minimal journey results without changing dependency declarations.

## Verification

- Initial full suite: 347 passed, zero failures (before the final subset-update and first-round regression refinements).
- Plugin transaction and subset-force focused suite: 14 passed.
- Final runtime, conflict, advanced-round and write-plan regression suites: 47 passed, including the extended first-round journey. TypeScript test compilation passed.
- `pnpm check`, `pnpm lint`, `git diff --check`, strict change validation and all 49 main-spec validations passed. Main specs retain their existing advisory long-requirement notices.
- `pnpm release:verify`: passed after fixing first-revision reachability. The actual npm tarball was installed with scripts disabled; the minimal graph and full academic pipeline (root plus eight children, two revision/re-review rounds, all Gates and Decisions, resume, final completion and strict checking) completed. Existing all-tool delivery and package checks also passed.
- Verified tarball: `researchspec-0.1.0.tgz`, 5,399 files, 107,885,447 bytes unpacked.
