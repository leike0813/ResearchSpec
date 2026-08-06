## 1. OpenSpec and catalog contracts

- [x] 1.1 Add the payload documentation DTO/catalog and document every CLI command input form.
- [x] 1.2 Add bounded `CurrentStatus` DTO/projection and compact Adapter/tool/diagnostic summaries.

## 2. Renderers and delivery

- [x] 2.1 Render payload sections in handbook, MDX pages, and Commander help from the shared catalog.
- [x] 2.2 Add `researchspec-cli-handbook` to the Companion manifest and renderer.
- [x] 2.3 Remove Navigate handbook reference delivery and update safe reconciliation/package ownership.

## 3. Runtime behavior

- [x] 3.1 Update `status` to emit only the bounded snapshot and stop running all-target checks.
- [x] 3.2 Keep detailed diagnostics and Adapter inspection behind `list`, `check`, `show`, and `doctor`.

## 4. Surface and documentation synchronization

- [x] 4.1 Update fixed 11/18 Skill counts, routing guidance, release docs, and the change's OpenSpec delta specs.
- [x] 4.2 Regenerate packaged handbook and generated command pages.

## 5. Verification

- [x] 5.1 Add/update CLI payload/help, handbook parity, Companion delivery, harness, and compact-status regression tests.
- [x] 5.2 Run focused tests, typecheck, build, package verification, and the full test suite.
- [x] 5.3 Run OpenSpec validation and verify the change task list is complete.
