## Why

FinRobot, HistAgent, and Materials-Science now have complete new-mode surfaces and maintenance suites. ToolUniverse is the next vendor in the agreed order. Its 130 reviewed production Skills are the largest vendor bundle and currently exist only as advisory vendor-bundle Skills.

## What Changes

- Add 130 extension capability packages derived one-to-one from the reviewed ToolUniverse Skills, each named `plugin-tooluniverse-<reviewed-skill-suffix>`.
- Package every reviewed non-SKILL resource file (scripts, references, examples, templates, and data files) as a hash-bound knowledge ref under its original relative path.
- Add one one-node graph profile per capability.
- Add a shared `validate_tooluniverse_brief.py` evidence validator contract to every package with generic evidence-bearing fields: `scope`, `source_ledger`, `method_plan`, `work_products`, `validation_results`, and `conclusions`.
- Assign the extensions to the same 30 domains as the raw Skills by deriving assignments from the source-neutral domain catalog.
- Add registry-level coverage for all 130 packages, end-to-end graph coverage for representative package shapes, and bulk maintenance checks for every package.
- Add the ToolUniverse maintenance suite: `scripts/tooluniverse-maintenance.mjs`, `.agents/skills/tooluniverse-maintenance`, package commands, maintenance tests, and the `v1.3.1` anchor records (01–05), artifacts, and hash-bound `manifest.json`.

## Impact

- No public CLI command changes and no engine changes.
- Installing a ToolUniverse domain now projects the corresponding extension capability and profile pairs alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

One hundred thirty `plugin-tooluniverse-*` capabilities, one per reviewed production Skill.

### Modified Capabilities

None.
