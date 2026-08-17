## Why

FinRobot, HistAgent, Materials-Science, and ToolUniverse now have complete new-mode surfaces and maintenance suites. Scientific Agent Skills is the next vendor in the agreed order. Its 49 reviewed production Skills currently exist only as advisory vendor-bundle Skills.

## What Changes

- Add 49 extension capability packages derived one-to-one from the reviewed Scientific Agent Skills, each named `plugin-scientific-agent-skills-<reviewed-skill-suffix>`.
- Package every reviewed non-SKILL resource file as a byte-level SHA-256 knowledge ref under its original relative path, including the reviewed TimesFM binary example assets.
- Add one one-node graph profile per capability.
- Add a shared `validate_scientific_brief.py` evidence validator to every package with generic evidence-bearing fields: `scope`, `source_ledger`, `method_plan`, `work_products`, `validation_results`, and `conclusions`.
- Assign extensions to the same 24 domains as the raw Skills by deriving assignments from the source-neutral domain catalog.
- Add registry-level coverage for all 49 packages, end-to-end graph coverage for representative package shapes, and bulk maintenance checks.
- Add the Scientific Agent Skills maintenance suite: `scripts/scientific-agent-skills-maintenance.mjs`, `.agents/skills/scientific-agent-skills-maintenance`, package commands, maintenance tests, and the `v2.53.0` anchor records (01–05), artifacts, and hash-bound `manifest.json`.

## Impact

- No public CLI command changes.
- Capability and extension registry knowledge-ref verification now computes SHA-256 over file bytes instead of UTF-8-decoded text. UTF-8 text hashes are unchanged, and reviewed binary assets can now be projected and verified.
- Installing a Scientific Agent Skills domain now projects the corresponding extension capability and profile pairs alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

Forty-nine `plugin-scientific-agent-skills-*` capabilities, one per reviewed production Skill.

### Modified Capabilities

None.
