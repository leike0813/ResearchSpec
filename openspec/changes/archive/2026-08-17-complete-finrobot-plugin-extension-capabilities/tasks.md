## 1. Package Authoring

- [x] 1.1 Author five new `plugin-financial-*` capability packages with manifest, SKILL, tools where reviewed, validators, and profiles.
- [x] 1.2 Refactor `plugin-financial-statement-analysis` to the shared `validate_financial_brief.py` contract.
- [x] 1.3 Update the extension registry with hashes and the two finance domain assignments.

## 2. Runtime Coverage

- [x] 2.1 Extend extension registry loader coverage to seven capabilities and seven profiles.
- [x] 2.2 Add end-to-end coverage for every FinRobot extension profile through the graph CLI.
- [x] 2.3 Cover invalid-then-valid script validator paths for all four mixed capabilities.

## 3. Maintenance Suite

- [x] 3.1 Author `audits/finrobot/catalog.json` and `scripts/finrobot-maintenance.mjs`.
- [x] 3.2 Author `.agents/skills/finrobot-maintenance` with references.
- [x] 3.3 Add package commands and maintenance tests.
- [x] 3.4 Produce anchor records 01–05, artifacts, and `manifest.json`; pass `check`.

## 4. Documentation And Acceptance

- [x] 4.1 Update FinRobot and domain plugin documentation plus AGENTS.md.
- [x] 4.2 Pass typecheck, lint, and targeted plugin/graph tests.
- [x] 4.3 Run full test suite and archive the OpenSpec change.
