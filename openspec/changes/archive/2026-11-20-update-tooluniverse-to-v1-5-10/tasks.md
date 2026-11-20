# Tasks

## 1. Source audit

- [x] 1.1 Verify the official tag and pin, then reconcile all canonical Skill records against the pinned checkout.
- [x] 1.2 Record upstream file and tool-contract deltas and audit the existing callers, new exclusions, license, and resource decisions.

## 2. Conversion and review

- [x] 2.1 Update converter policies and regenerate the admitted vendor and extension projections. Verify stable IDs, domains, and unaffected bytes.
- [x] 2.2 Record generated-content semantic review for all 130 capabilities. Seal the new baseline and archive the manifest comparison.
- [x] 2.3 Update the project and maintainer references and run the existing targeted audit, converter, adaptation, and extension suites.

## 3. Integration verification

- [x] 3.1 Run TypeScript, lint, full tests, converter check and idempotence, active anchor check, and npm distribution inventory verification.

The targeted ToolUniverse and plugin extension run passed all 32 tests. The full suite passed 608 tests and skipped the optional DOCX test because `python-docx` was unavailable. The active anchor check, whitespace check, npm package inventory and converter idempotence passed.
