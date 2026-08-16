## 0. Catalog And Script

- [x] 0.1 Add `audits/own-vendors/catalog.json` with paper-humanizer and revision-master entries.
- [x] 0.2 Add `scripts/own-vendor-maintenance.mjs` with artifacts, records, baseline, check, and
  diff commands plus all-vendor iteration.

## 1. First Anchors

- [x] 1.1 Generate records 01–04 and parity slices for both vendors.
- [x] 1.2 Author and preserve `05-semantic-review.md` for both vendors.
- [x] 1.3 Baseline and check both manifests.

## 2. Agent Skill

- [x] 2.1 Add `.agents/skills/own-vendor-maintenance/SKILL.md` with maintenance modes and
  `add-vendor`.
- [x] 2.2 Add audit record template and semantic review checklist references.

## 3. Scripts And Regression

- [x] 3.1 Add package scripts `own-vendor-maintenance:{artifacts,records,baseline,check}`.
- [x] 3.2 Add `tests/own-vendor-maintenance.test.ts` covering skill, catalog, anchors, semantic
  gate, package scripts, and check success.
- [x] 3.3 Pass typecheck, lint, parity, OpenSpec validation, and the full test suite.
