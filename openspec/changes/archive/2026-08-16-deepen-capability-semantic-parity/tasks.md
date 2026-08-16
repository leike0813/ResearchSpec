## 0. Baseline

- [x] 0.1 Add `scripts/audit-capability-parity.mjs` that joins each capability manifest provenance
  to `docs/ars_extraction/extraction-index.json` and measures section coverage, rule coverage,
  output-format preservation, knowledge-pack coverage and retained flow headings.
- [x] 0.2 Record the pre-deepening baseline in `docs/capability-parity-report.json` and identify
  every package below the 0.7 / 0.6 thresholds.

## 1. Authoring Support

- [x] 1.1 Add `procedure_path` to `CapabilityAuthoringSource` and inline the curated markdown under
  the generated Skill `## Procedure` section with a dedicated `## Completion` return-control block.
- [x] 1.2 Add capability manifest `maturity` values `skeleton` / `operational` / `deprecated` and
  author `operational` only when a curated procedure is bound.
- [x] 1.3 Bind curated procedure files for every M1–M5 authoring source and fill the remaining
  no-knowledge packages with their extracted knowledge-pack references.

## 2. Semantic Deepening

- [x] 2.1 Deepen all M1 research capabilities (research question, methodology, search/screening,
  source grading, evidence synthesis, report compilation) from their CAP artifacts.
- [x] 2.2 Deepen all M2 writing capabilities (intake, structure, argument blueprint, drafting,
  abstract, citation-format compliance) from their CAP artifacts.
- [x] 2.3 Deepen all M3 integrity/review capabilities (reference integrity, review-panel config,
  editorial judgment, specialist review, devil's advocate, review synthesis, pre-submission
  self-check) from their CAP artifacts.
- [x] 2.4 Deepen all M4 revision/finalize capabilities (roadmap parsing, revision patching, format
  rendering, terminal-policy gate, temporal integrity) from their CAP artifacts.
- [x] 2.5 Deepen all M5 side-branch capabilities (meta-analysis, risk of bias, socratic mentoring,
  figure generation, literature monitoring, claim faithfulness, compliance, collaboration depth)
  from their CAP artifacts.
- [x] 2.6 Keep generated Skills free of next-node/next-phase instructions, upstream agent-team
  orchestration and legacy `Phase N` prose.

## 3. Parity Gate And Regression

- [x] 3.1 Add knowledge-pack coverage and knowledge-ref reference checks to the parity audit and
  fail when knowledge coverage or reference coverage is below 1.
- [x] 3.2 Add `capability:parity` and `capability:parity:report` package scripts.
- [x] 3.3 Add `tests/capability-parity.test.ts` that runs the audit and asserts all 38 packages are
  above threshold with zero flow sections retained.
- [x] 3.4 Regenerate `docs/capability-parity-report.json` and record the passing baseline
  (section coverage ~0.951, rule coverage ~0.966).

## 4. Acceptance

- [x] 4.1 Regenerate all capability packages and registry hashes via the authoring converter.
- [x] 4.2 Verify authoring idempotence byte-for-byte.
- [x] 4.3 Pass typecheck, lint, ARSU converter check, capability parity audit and the full test
  suite.
