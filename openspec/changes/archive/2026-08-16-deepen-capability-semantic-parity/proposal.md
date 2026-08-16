## Why

The capability graph refactor produced 38 operational capability packages, but the first authoring
pass left many `SKILL.md` files as thin wrappers around knowledge refs. Generated Skills described
the node contract but not enough node-local semantic guidance to reproduce the pre-refactor ARSU
execution guidance. A new graph engine therefore risked losing research, writing, review, revision
and side-branch guidance thickness at exactly the places where the host Agent needs it.

"Deepening" was previously a subjective feeling. The project needed a measurable, regression-capable
definition of semantic parity between each generated capability Skill and its verified upstream
extraction artifacts.

## What Changes

- Add a curated procedure authoring path: every capability authoring source binds a
  `procedure_path` markdown file, the authoring converter inlines it under `## Procedure`, and the
  manifest records `maturity: operational` when a curated procedure exists (`skeleton` otherwise).
- Add `maturity` (`skeleton` / `operational` / `deprecated`) to capability manifest schema `"1"`.
- Deepen all 38 capability procedures from the verified `docs/ars_extraction/` artifacts while
  excluding upstream phase flow, mode registry and agent-team orchestration text.
- Add `scripts/audit-capability-parity.mjs` with checked-in thresholds:
  - semantic section coverage >= 0.7
  - upstream MUST/never/always rule coverage >= 0.6
  - output-format section preserved where the upstream artifact defines one
  - every provenance knowledge-pack artifact covered by a manifest knowledge ref
  - every knowledge-ref path referenced by `SKILL.md`
  - no flow/mode/orchestration headings retained in generated Skills
- Wire the audit as `pnpm capability:parity` / `pnpm capability:parity:report` and add a regression
  test that fails the suite when any package falls below threshold.
- Regenerate all capability packages, manifests and registry hashes from the converter.

## Impact

- Generated `skills/capabilities/**` content and registry hashes change; capability IDs, typed
  roles, validator entries, graph profiles and public CLI behavior do not change.
- The converter's authoring source format gains an optional `procedure_path`; sources without a
  curated procedure continue to author as `skeleton`.
- The parity audit becomes the release-gate lower bound for semantic guidance thickness. It is a
  lexical proxy and does not claim formal semantic equivalence.
- No workspace schema, CLI command surface, runtime protocol or boundary-file ownership change.
