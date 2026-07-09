# Tasks

## 1. OpenSpec And Repository Setup

- [x] 1.1 Validate this change with `openspec validate migrate-arsu-converter-contract-layer --type change --strict`.
- [x] 1.2 Add `vendor/ars` as the ARS upstream git submodule.
- [x] 1.3 Update ignore/package hygiene only where needed for generated `skills/arsu` and TypeScript outputs.
- [x] 1.4 Confirm generated `skills/arsu` is treated as converter-owned output, not hand-maintained source.

## 2. Converter Entrypoints And Configuration

- [x] 2.1 Add internal TypeScript converter modules under `src/arsu-converter/`.
- [x] 2.2 Add developer script entrypoints for conversion and generated-output validation.
- [x] 2.3 Add package scripts `arsu:convert` and `arsu:check`.
- [x] 2.4 Ensure converter scripts use fixed source `vendor/ars` and fixed output `skills/arsu`.
- [x] 2.5 Reject any normal source-directory option in the developer converter CLI.
- [x] 2.6 Keep ARSU converter commands out of public `researchspec --help`.

## 3. Upstream Checkout Validation

- [x] 3.1 Resolve the repository root and fixed `vendor/ars` path.
- [x] 3.2 Fail conversion when `vendor/ars` is missing.
- [x] 3.3 Fail conversion when `vendor/ars` is not a valid initialized git checkout or submodule.
- [x] 3.4 Record the upstream commit in conversion results.
- [x] 3.5 Fail conversion when `vendor/ars` is dirty.
- [x] 3.6 Fail conversion when required skill groups or required `SKILL.md` entrypoints are missing.

## 4. ARSU Converter Port

- [x] 4.1 Port source inventory and classification for required skill groups, shared resources, exclusions, and unclassified files.
- [x] 4.2 Port dependency discovery for text and Markdown resources.
- [x] 4.3 Port dependency copy planning for shared and cross-skill references.
- [x] 4.4 Port text transformation, path rewrite, and unresolved-link handling.
- [x] 4.5 Port deterministic skill-group emission into `skills/arsu/<skill-group>/`.
- [x] 4.6 Port hash calculation and generated file record creation.

## 5. ResearchSpec Contract Compatibility Layer

- [x] 5.1 Define the first-slice compatibility profile for each generated ARSU skill group.
- [x] 5.2 Inject a generated `Contract Preflight` block into every generated `SKILL.md`.
- [x] 5.3 Generate `skills/arsu/researchspec-contracts.json`.
- [x] 5.4 Record contract injection summary in `conversion-manifest.json`.
- [x] 5.5 Ensure Material Passport is described only as a compatibility artifact, not runtime SSOT.
- [x] 5.6 Keep full per-stage and per-mode matrix injection out of this change.

## 6. Manifest, Report, Validation, And Drift Control

- [x] 6.1 Generate `skills/arsu/conversion-manifest.json`.
- [x] 6.2 Generate `skills/arsu/conversion-report.md` from the manifest.
- [x] 6.3 Validate required generated groups and entrypoints.
- [x] 6.4 Validate generated metadata parseability.
- [x] 6.5 Validate generated file hashes.
- [x] 6.6 Validate generated Markdown links.
- [x] 6.7 Validate required contract compatibility metadata.
- [x] 6.8 Preserve upstream version/history/changelog/schema-version text as non-blocking diagnostics.
- [x] 6.9 Block overwrite when existing generated output has manifest drift.
- [x] 6.10 Allow explicit force regeneration.
- [x] 6.11 Add idempotence comparison that ignores declared volatile metadata fields.

## 7. Tests

- [x] 7.1 Add fixture upstream checkout tests for successful four-skill-group generation.
- [x] 7.2 Add missing `vendor/ars` failure test.
- [x] 7.3 Add invalid or uninitialized checkout failure test.
- [x] 7.4 Add dirty checkout blocking test.
- [x] 7.5 Add missing required skill group failure test.
- [x] 7.6 Add shared and cross-skill dependency copy/rewrite test.
- [x] 7.7 Add adapter-only exclusion test.
- [x] 7.8 Add non-blocking upstream history marker diagnostic test.
- [x] 7.9 Add contract preflight injection test.
- [x] 7.10 Add `researchspec-contracts.json` parseability/content test.
- [x] 7.11 Add broken generated link validation failure test.
- [x] 7.12 Add generated hash drift validation failure test.
- [x] 7.13 Add protected overwrite and explicit force regeneration tests.

## 8. Verification

- [x] 8.1 Run `openspec validate migrate-arsu-converter-contract-layer --type change --strict`.
- [x] 8.2 Run `openspec validate --all --strict`.
- [x] 8.3 Run `pnpm run build`.
- [x] 8.4 Run `pnpm run lint`.
- [x] 8.5 Run `pnpm run test`.
- [x] 8.6 Initialize/update `vendor/ars` submodule.
- [x] 8.7 Run `pnpm arsu:convert`.
- [x] 8.8 Verify `skills/arsu` contains expected generated skill groups.
- [x] 8.9 Run `pnpm arsu:check`.
