## Why

FinRobot and HistAgent now have complete new-mode surfaces and maintenance suites. Materials-Science-Skills-For-LLM is the next vendor in the agreed order. Its seven reviewed production Skills are instruction-led external-tool workflows and currently exist only as advisory vendor-bundle Skills.

## What Changes

- Add seven extension capability packages derived one-to-one from the reviewed Materials-Science Skills:
  - `plugin-materials-apex-alloy-workflows`
  - `plugin-materials-atomsk-cli`
  - `plugin-materials-deeptb-helper`
  - `plugin-materials-dpgen-workflow`
  - `plugin-materials-gpumd-workflow`
  - `plugin-materials-phonopy-workflows`
  - `plugin-materials-unimol-ops`
- Package the six conditionally read references as hash-bound knowledge refs; Atomsk remains a Tier 1 tree without references.
- Add one one-node graph profile per capability.
- Add evidence-bound `validate_materials_brief.py` script validators for all seven packages; execution remains `llm` because the semantic work is Agent procedure and external tools are user-managed.
- Assign extensions to the same domains as the raw Skills: six to `materials-engineering`, two to `macromolecular-and-materials-chemistry`, and all seven to `computational-modeling-and-simulation`.
- Add end-to-end graph coverage for all seven profiles and invalid-then-valid validator paths.
- Add the Materials-Science maintenance suite: `scripts/materials-science-maintenance.mjs`, `.agents/skills/materials-science-maintenance`, package commands, maintenance tests, and the `snapshot-fafd3ab` anchor records (01–05), artifacts, and hash-bound `manifest.json`.

## Impact

- No public CLI command changes and no engine changes.
- Installing the three materials-related domains now projects the corresponding extension capability and profile pairs alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

- `plugin-materials-apex-alloy-workflows`
- `plugin-materials-atomsk-cli`
- `plugin-materials-deeptb-helper`
- `plugin-materials-dpgen-workflow`
- `plugin-materials-gpumd-workflow`
- `plugin-materials-phonopy-workflows`
- `plugin-materials-unimol-ops`

### Modified Capabilities

None.
