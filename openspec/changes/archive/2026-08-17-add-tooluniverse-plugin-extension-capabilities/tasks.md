## 1. Package Generation

- [x] 1.1 Implement the ToolUniverse extension generator from the reviewed vendor bundle and domain catalog.
- [x] 1.2 Generate 130 `plugin-tooluniverse-*` capability packages with SKILL, manifest, validator, copied resources, and profile.
- [x] 1.3 Update the extension registry with 130 capabilities, 130 profiles, and 30 domain assignments.

## 2. Runtime Coverage

- [x] 2.1 Extend extension registry loader coverage to 147 capabilities and 147 profiles.
- [x] 2.2 Add bulk package, hash, profile, and domain consistency tests for all 130 packages.
- [x] 2.3 Add end-to-end graph coverage for representative package shapes with invalid-then-valid validator paths.

## 3. Maintenance Suite

- [x] 3.1 Author `audits/tooluniverse/catalog.json` and `scripts/tooluniverse-maintenance.mjs`.
- [x] 3.2 Author `.agents/skills/tooluniverse-maintenance` with references.
- [x] 3.3 Add package commands and maintenance tests.
- [x] 3.4 Produce anchor records 01–05, artifacts, and `manifest.json`; pass `check`.

## 4. Documentation And Acceptance

- [x] 4.1 Update ToolUniverse and domain plugin documentation plus AGENTS.md.
- [x] 4.2 Pass typecheck, lint, and targeted plugin/graph tests.
- [x] 4.3 Run full test suite and archive the OpenSpec change.
