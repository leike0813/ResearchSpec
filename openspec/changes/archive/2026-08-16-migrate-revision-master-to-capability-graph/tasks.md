## 0. Extraction

- [x] 0.1 Add `docs/revision-master_extraction/` with 45 byte-verified stage, knowledge, script and
  asset artifacts and `extraction-index.json`.
- [x] 0.2 Add a reproducibility test that verifies every indexed artifact against the pinned
  `vendor/revision-master` snapshot.

## 1. Authoring

- [x] 1.1 Add `src/arsu-converter/authoring/revision-master-sources.ts` with five capability
  sources and shared runtime package assets.
- [x] 1.2 Add a dedicated revision-master authoring CLI and package script.
- [x] 1.3 Curate intake, analysis, atomization, workboard, and round procedures from the extracted
  stage files.

## 2. Capability Packages And Graph

- [x] 2.1 Author the five capability packages and registry entries under `skills/capabilities/`.
- [x] 2.2 Add the `review-response` graph profile and project it with the other presets.
- [x] 2.3 Add graph and registry regression coverage for the new profile and packages.

## 3. Retire Schema-1 Surface

- [x] 3.1 Remove the schema-1 `review-response` route, workflow profile, and projections.
- [x] 3.2 Remove the old `src/vendor-converters/revision-master` converter and package scripts.
- [x] 3.3 Remove `skills/review-response` and the old `review-response` Core Skill ID.
- [x] 3.4 Update ARSU routing, docs, and audit provenance references.

## 4. Acceptance

- [x] 4.1 Rewrite review-response tests for extraction, authored packages, and the graph profile.
- [x] 4.2 Pass parity, typecheck, lint, ARSU converter checks, maintenance checks, OpenSpec
  validation, and the full test suite.
