## Why

`revision-master` was absorbed as the monolithic `review-response` Core Skill with a schema-1
six-checkpoint profile. Its workflow authority still lives in the upstream Python state machine and
in stage prose: the host Agent has to read `instruction_payload`, infer stage gates, and follow a
prose recovery loop. In the capability-graph engine, stage transitions, coverage Gates, and the
continue/complete revision loop belong in graph data. Revision-Master therefore needs the same
vendor absorption already applied to ARS and Paper Humanizer: byte-verified extraction, atomic
capability packages, a preset graph profile, and thin node-local procedures.

## What Changes

- Add `docs/revision-master_extraction/extraction-index.json` with byte-verified stage, knowledge,
  script, schema, localization, and template artifacts from the pinned
  `vendor/revision-master` snapshot.
- Add a dedicated revision-master authoring source set and CLI using the generalized vendor
  authoring engine.
- Author five capability packages:
  - `cap-design-review-response-intake`
  - `cap-analysis-review-response-manuscript-analysis`
  - `cap-transform-review-response-comment-atomization`
  - `cap-design-review-response-workboard-planning`
  - `cap-generation-review-response-round` (Stage 5 strategy execution plus Stage 6 final review
    and export in one repeatable graph round)
- Add the `review-response` capability graph profile:
  `intake -> manuscript-analysis -> comment-atomization -> comment-coverage Gate -> workboard ->
  strategy Gate -> round -> evidence/response-coverage/final-assembly Gates -> outcome Decision`
  with a revision-round template continuing back to `round` or closing the run.
- Keep the pinned Python SQLite runtime and templates as package-local tools; the graph engine owns
  stage, Gate, Decision, and revision-round authority.
- Remove the schema-1 `review-response:full` route/profile, the old
  `src/vendor-converters/revision-master` converter, the old `skills/review-response` tree, and the
  `revision-master:{convert,check,idempotence}` scripts.
- Update ARSU routing, workspace projections, docs, specs, and tests to the capability surface.

## Impact

- **BREAKING**: the fixed user-visible Core Skill `review-response` is replaced by the five projected
  `cap-*` capability packages; the `review-response:full` selector is retired.
- The immutable `audits/revision-master/snapshot-13e69610` audit remains historical provenance and is
  referenced by the new extraction index and package provenance.
- No public CLI command is added or removed.

## Capabilities

### New Capabilities

- `review-response`: five capability-node procedures and the `review-response` preset graph.

### Modified Capabilities

- `arsu-converter`: ARSU routing no longer exposes a schema-1 review-response route; the authoring
  engine's vendor-index support is reused unchanged.
- `revision-master-domain-skill-audit`: the snapshot audit remains provenance, while production
  conversion moves to extraction + capability authoring.

### Removed Capabilities

None.
