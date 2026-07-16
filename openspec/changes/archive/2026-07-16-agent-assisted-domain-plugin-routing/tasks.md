## 1. OpenSpec Contracts

- [x] 1.1 Add the augmentation capability and modify plugin, CLI, Companion,
  ARSU converter, run-usage, and acceptance contracts.

## 2. Plugin Discovery And Installation

- [x] 2.1 Centralize packaged Skill frontmatter metadata and reuse it from the
  registry, runtime catalog views, and Skill Harness.
- [x] 2.2 Add compact list/show output with Skill descriptions and entry hashes.
- [x] 2.3 Add deterministic plugin install plan SHA-256 preview and
  non-interactive expected-plan enforcement.

## 3. Immediate Activation And Agent Guidance

- [x] 3.1 Add `plugin instructions <skill-id>` with selection, availability,
  projection, and manifest-hash validation.
- [x] 3.2 Extend Navigate with discovery, batch consent, installation,
  invocation, failure fallback, and bounded helper rules.
- [x] 3.3 Extend the converter-owned ARSU preflight and regenerate all four
  packaged ARSU trees and manifests.

## 4. Documentation And Tests

- [x] 4.1 Update canonical user, plugin, CLI, README, and AGENTS documentation.
- [x] 4.2 Extend plugin, adapter, converter, CLI, and user-journey tests for
  compact discovery, plan binding, rejection, fallback, and immediate use.

## 5. Verification

- [x] 5.1 Run strict OpenSpec validation, focused and full tests, typecheck,
  lint, build, release verification, converter checks/idempotence, and
  `git diff --check`.
- [x] 5.2 Run `openspec-verify-change` and resolve all critical or warning-level
  implementation gaps.
