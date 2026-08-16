## 0. Maintenance Surface

- [x] 0.1 Add `.agents/skills/arsu-maintenance/SKILL.md` with the five-stage path, four modes and
  audit file format.
- [x] 0.2 Add `references/audit-record-template.md` and
  `references/semantic-review-checklist.md` for human and Agent reviewers.
- [x] 0.3 Add `scripts/arsu-maintenance.mjs` with `records`, `baseline`, `check`, `artifacts`,
  and `diff` commands.

## 1. First Anchor Audit

- [x] 1.1 Generate machine records 01–04 from the current upstream and conversion state for
  `v3.19.0-828ef3b`.
- [x] 1.2 Author `05-semantic-review.md` with per-obligation preserved / adapted / removed / gap
  judgments and a `declared-fit-with-notes` conclusion.
- [x] 1.3 Baseline `manifest.json` with upstream, extraction, conversion, parity, HTML artifact,
  maintenance Skill and record SHA-256 values.
- [x] 1.4 Add `audits/arsu/README.md` documenting artifact generation and incremental maintenance.

## 2. Artifact Relocation

- [x] 2.1 Change the three HTML generator defaults to
  `audits/arsu/<anchor>/artifacts/` with `ARSU_ANCHOR` selection and retain explicit output
  argument support.
- [x] 2.2 Update the assessment subtitle to the anchor-generic audit path.
- [x] 2.3 Generate the three HTML artifacts into the first anchor audit directory.
- [x] 2.4 Delete the old root `artifacts/arsu-mode-capability-review.html`,
  `artifacts/arsu-mode-graph-match-assessment.html`, and
  `artifacts/arsu-mode-gap-semantic-review.html`.

## 3. Semantic Review Gate

- [x] 3.1 Make `records` preserve an existing `05-semantic-review.md` and create a
  `[NOT-COMPLETED]` placeholder only when absent.
- [x] 3.2 Make `baseline` reject a missing, placeholder, or conclusion-less semantic review before
  writing the manifest.
- [x] 3.3 Include `05-semantic-review.md` in the manifest record hash set.

## 4. Scripts And Regression

- [x] 4.1 Replace hard-coded generator output arguments in `package.json` with
  `arsu-maintenance:artifacts` and add `arsu-maintenance:records`, `arsu-maintenance:baseline`,
  and `arsu-maintenance:check`.
- [x] 4.2 Add `tests/arsu-maintenance.test.ts` covering the Skill path, semantic review gate,
  anchor record content, HTML artifact location and `check` success.
- [x] 4.3 Pass `pnpm check`, `pnpm lint`, the ARSU maintenance check and the full test suite
  (263/263).
