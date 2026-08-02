## 1. Admit ARS v3.19.0

- [x] 1.1 Pin `vendor/ars` to v3.19.0, verify the clean commit/tag and unchanged upstream license, and regenerate the 230-file upstream manifest.
- [x] 1.2 Update the contract-anchor audit commit, retain all matching anchors, and add `REVIEW-016` for deterministic panel validation and Gate authority.

## 2. Build the runtime-policy SSOT

- [x] 2.1 Add typed runtime-policy catalog, validation, loading, reporting, and current-state replacement assets for every classified v3.19.0 policy match.
- [x] 2.2 Add a shared source-rewrite planner that rejects missing, ambiguous, unordered, or overlapping anchor/runtime-policy edits before generated output is touched.
- [x] 2.3 Enforce host-native subagent-only model delegation and reject active credential, endpoint, SDK, HTTP, curl, direct-API, or environment-variable enablement guidance.

## 3. Package the panel-checker closure

- [x] 3.1 Admit only the two approved reviewer checker scripts and rewrite the sprint checker schema lookup to the existing packaged schema.
- [x] 3.2 Validate closure completeness, script placement, inert converter behavior, and user-managed Python/jsonschema prerequisite guidance.

## 4. Integrate metadata and guidance

- [x] 4.1 Upgrade the converter to 0.9.0 and extend its manifest/report with runtime-policy catalog, adaptation, closure, and rule identities.
- [x] 4.2 Update Companion navigation guidance, canonical user-model documentation, release/audit documentation, and project constraints for separate per-instance alternate-model consent.
- [x] 4.3 Update focused anchor, converter, and Companion rendering tests without brittle fixed-count or prose assertions.

## 5. Regenerate converter-owned output

- [x] 5.1 Regenerate `skills/arsu/**` only through the converter and review the runtime-policy report and generated manifest.
- [x] 5.2 Confirm no unapproved root script, direct model-service instruction, or generated-file drift remains.

## 6. Verify the change

- [x] 6.1 Run upstream checker tests and a generated sprint-contract smoke test in the shared `$HOME/.ar` Python environment.
- [x] 6.2 Run type, lint, test, anchor, runtime-policy, ARSU, idempotence, docs, release, strict OpenSpec, and whitespace validation.
