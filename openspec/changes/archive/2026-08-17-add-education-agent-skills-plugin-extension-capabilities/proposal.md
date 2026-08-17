## Why

FinRobot, HistAgent, Materials-Science, ToolUniverse, and Scientific Agent Skills now have complete new-mode surfaces and maintenance suites. Education Agent Skills is the final vendor in the agreed order. Its 136 reviewed production Skills are static `SKILL.md` + `LICENSE` + `NOTICE.md` trees and currently exist only as advisory vendor-bundle Skills.

## What Changes

- Add 136 extension capability packages derived one-to-one from the reviewed Education Agent Skills, each named `plugin-education-agent-skills-<reviewed-skill-suffix>`.
- Add one one-node graph profile per capability.
- Add a shared `validate_education_brief.py` evidence validator to every package with generic evidence-bearing fields: `scope`, `source_ledger`, `method_plan`, `work_products`, `validation_results`, and `conclusions`.
- Assign the extensions to the same three reviewed domains as the raw Skills: `curriculum-and-pedagogy`, `education-systems`, and `specialist-studies-in-education`.
- Add registry-level coverage for all 136 packages, end-to-end graph coverage for representative package shapes, and bulk maintenance checks.
- Add the Education Agent Skills maintenance suite: `scripts/education-agent-skills-maintenance.mjs`, `.agents/skills/education-agent-skills-maintenance`, package commands, maintenance tests, and the `snapshot-32fce5c` anchor records (01–05), artifacts, and hash-bound `manifest.json`.
- Raise the plugin extension registry version to `0.7.0` and keep the ToolUniverse and Scientific Agent Skills generators on the same version so maintenance baselines do not regress.

## Impact

- No public CLI command changes and no engine changes.
- Installing an education domain now projects the corresponding extension capability and profile pairs alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

One hundred thirty-six `plugin-education-agent-skills-*` capabilities, one per reviewed production Skill.

### Modified Capabilities

None.
