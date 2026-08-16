## Why

`paper-humanizer` was absorbed as one monolithic Core Skill with a schema-1 route/subflow profile.
Its internal review-plan-execute-verify loop lives in prose (`agents/full.md`) and a Python state
machine (`full_workflow.py`) owns plan approval, candidate identity, and acceptance. In the
capability-graph engine, workflow authority must live in graph data while Skills execute exactly one
node and return control. Paper Humanizer therefore needs the same four-way absorption already used
for ARS: verified extraction artifacts, atomic capability packages, preset graph profiles, and thin
node-local procedures.

## What Changes

- Add `docs/paper-humanizer_extraction/extraction-index.json` with seven byte-verified artifacts
  (`PH-CAP-01/02/03`, `PH-KP-01/02`, `PH-SCRIPT-01/02`) sliced from `vendor/paper-humanizer`.
- Generalize the capability authoring engine to read a caller-supplied extraction index and emit
  `origin: vendor-derived` provenance.
- Author four capability packages into `skills/capabilities/`:
  - `cap-generation-humanization-reference`: instruction-only Reference mode for surrounding prose
    work.
  - `cap-check-paper-humanization-review`: read-only diagnosis and revision-plan authoring.
  - `cap-transform-paper-humanization-revision`: approved plan execution through the
    `document_pipeline.py` prose-only editing contract.
  - `cap-check-paper-humanization-verification`: candidate validation, protected-content and
    bidirectional information-unit preservation check.
- Add a `paper-humanizer` capability graph profile (`review -> plan-gate -> revision -> verification
  -> acceptance decision`, with a revision-round template for rejection loops).
- Remove the schema-1 `paper-humanizer` route/profile, the old `src/vendor-converters/paper-humanizer`
  converter, the old `skills/paper-humanizer` tree, and the `paper-humanizer:{convert,check,idempotence}`
  scripts.
- Update ARSU contract injection and Revision-Master evidence to reference the new capability package
  entrypoint instead of `paper-humanizer/SKILL.md`.
- Add `paper-humanizer:author` and extraction reproducibility tests.

## Impact

- **BREAKING**: the fixed user-visible Skill ID `paper-humanizer` is replaced by the four projected
  `cap-*` capability packages; schema-1 `paper-humanizer:review` / `paper-humanizer:full` route
  selectors are retired.
- The Python analysis scripts remain packaged as deterministic node tools; lifecycle, plan approval,
  and acceptance state move to the ResearchSpec graph engine.
- Revision-Master keeps its current `review-response` Skill until its own migration in the next
  change.

## Capabilities

### New Capabilities

- `paper-humanization`: cap-* node procedures and the `paper-humanizer` preset graph.

### Modified Capabilities

- `arsu-converter`: generalized authoring engine supports vendor-derived extraction indexes; ARSU
  contract injection points to the new capability entrypoint.

### Removed Capabilities

None.

## Non-Goals

- Revision-Master migration is a separate change and remains byte-identical in this one.
- No new public CLI command; graph profile and capability packages are projected through existing
  init/update/start/advance/decide commands.
