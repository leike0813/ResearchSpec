# Tasks

## 1. OpenSpec Artifacts

- [x] 1.1 Fix the archived `arsu-converter` main spec format so repo-wide
  strict validation can pass.
- [x] 1.2 Create proposal, design, spec delta, and tasks for
  `audit-arsu-contract-anchors`.
- [x] 1.3 Validate the new change with
  `openspec validate audit-arsu-contract-anchors --type change --strict`.
- [x] 1.4 Validate all specs with `openspec validate --all --strict`.

## 2. Upstream Contract Audit

- [x] 2.1 Audit `vendor/ars/deep-research`.
- [x] 2.2 Audit `vendor/ars/academic-paper`.
- [x] 2.3 Audit `vendor/ars/academic-paper-reviewer`.
- [x] 2.4 Audit `vendor/ars/academic-pipeline`.
- [x] 2.5 Audit `vendor/ars/shared`.
- [x] 2.6 Document findings in `docs/arsu_contract_anchor_audit.md`.

## 3. Anchor And Manifest Assets

- [x] 3.1 Add curated anchor table at
  `src/arsu-converter/anchors/contract-anchors.json`.
- [x] 3.2 Add upstream manifest at
  `src/arsu-converter/anchors/upstream-manifest.json`.
- [x] 3.3 Ensure required anchors include replacement intent and future template
  id.
- [x] 3.4 Ensure anchors use robust hints rather than line-number-only
  matching.

## 4. Anchor Validation Tooling

- [x] 4.1 Add lightweight TypeScript validation for anchor table parseability and
  source-path existence.
- [x] 4.2 Validate manifest commit, file tree, and normalized hashes against the
  current `vendor/ars` checkout.
- [x] 4.3 Add package script `pnpm arsu:anchors:check`.
- [x] 4.4 Keep anchor validation out of the public `researchspec` CLI.

## 5. Tests And Verification

- [x] 5.1 Add focused tests for anchor/manifest validation.
- [x] 5.2 Run `pnpm run build`.
- [x] 5.3 Run `pnpm run lint`.
- [x] 5.4 Run `pnpm run test`.
- [x] 5.5 Run `pnpm arsu:anchors:check`.
