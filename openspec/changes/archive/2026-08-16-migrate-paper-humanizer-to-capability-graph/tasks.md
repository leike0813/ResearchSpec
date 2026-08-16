## 0. Extraction

- [x] 0.1 Add `docs/paper-humanizer_extraction/` with nine byte-verified artifacts and
  `extraction-index.json`.
- [x] 0.2 Add a reproducibility test that verifies every indexed artifact against
  `vendor/paper-humanizer`.

## 1. Authoring Engine

- [x] 1.1 Generalize `authorCapabilityPackage` for a caller-supplied extraction index and
  `vendor-derived` provenance.
- [x] 1.2 Add package assets support for non-validator script files such as
  `scripts/document_pipeline.py`.
- [x] 1.3 Add `src/arsu-converter/authoring/paper-humanizer-sources.ts` and a dedicated authoring CLI.

## 2. Capability Packages

- [x] 2.1 Curate reference, review, revision, and verification procedures from the extracted artifacts.
- [x] 2.2 Author the four capability packages and registry entries under `skills/capabilities/`.
- [x] 2.3 Add the `paper-humanizer` graph profile and project it with the other presets.

## 3. Retire Schema-1 Surface

- [x] 3.1 Remove the schema-1 `paper-humanizer` route, workflow profile, and projections.
- [x] 3.2 Remove the old `src/vendor-converters/paper-humanizer` converter and package scripts.
- [x] 3.3 Remove `skills/paper-humanizer` and the old `paper-humanizer` Core Skill ID.
- [x] 3.4 Point ARSU contract injection and Revision-Master adaptation evidence to the new
  capability entrypoint.

## 4. Regression

- [x] 4.1 Rewrite `tests/paper-humanizer.test.ts` for extraction, authored packages, and the graph
  profile.
- [x] 4.2 Add package scripts `paper-humanizer:author`.
- [x] 4.3 Pass typecheck, lint, ARSU converter checks, capability registry checks, and the full test
  suite.
