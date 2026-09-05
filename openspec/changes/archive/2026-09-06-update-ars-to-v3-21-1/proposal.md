## Why

ResearchSpec pins ARS v3.19.0 while v3.21.1 changes research guidance, review criteria, revision authorization and disclosure procedures. Updating only the source pointer would leave extracted capabilities and ResearchSpec-owned contracts inconsistent.

## What Changes

- Pin ARS v3.21.1 at `127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb` and refresh affected extraction sources and generated packages.
- Adapt upstream reviewer v2 and revision authorization semantics while retaining ResearchSpec workflow and patch-contract ownership. **BREAKING**: current review outputs follow the revised role-scoped criteria and decision rules.
- Refresh source, contract-anchor and runtime-policy admission with no upstream model runtime or workflow authority.
- Record semantic review and deterministic validation in a new maintenance audit, preserving the historical audit.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-converter`: admit and adapt ARS v3.21.1 with coherent current contracts and reviewed capability generation.

## Impact

Changes affect `vendor/ars`, `authoring/ars`, converter sources and policies, generated Skills, maintenance artifacts, documentation and relevant tests. No dependency installation, public CLI addition, model-service integration or research workspace migration is introduced.
