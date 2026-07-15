## Why

ResearchSpec currently admits non-native upstream projects through vendor-specific converters without a shared definition of an executable, self-contained Skill. HistAgent exposed the resulting failure mode: short generated wrappers, critical instructions hidden in shallow references, and a private runner/schema convention presented as though it were a ResearchSpec runtime contract.

## What Changes

- Define a common authoring and review standard for converting non-native upstream projects into complete ResearchSpec-maintained Skills.
- Add a baseline `SKILL.md` authoring scaffold with optional script-assisted, stateful, and resource-backed extensions; converters consume fully authored vendor-specific trees instead of assembling generic prose fragments.
- Add a maintainer-only typed definition and validator that bind every advertised capability to an executable agent procedure, bundled script, bundled resource, or explicitly configured external tool.
- Make critical workflow, authority, output, and failure rules mandatory in `SKILL.md`; reserve `references/` for substantial context-saving detail that is directly routed from the main file.
- Reject implicit use of the private `runner.json` plus generic input/output schema convention when no actual ResearchSpec consumer exists.
- Record a non-blocking baseline assessment and migration order for HistAgent, FinRobot, and Materials-Science-Skills-For-LLM while leaving their current production or draft trees unchanged.
- Keep `ingest-histagent` paused until its three proposed Skills are redesigned against this standard and reviewed again.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `vendor-skill-conversion`: Add authoring, executability, progressive-disclosure, capability-mapping, validation, and migration requirements for Skills derived from non-native upstream projects.

## Impact

The change adds maintainer documentation, authoring scaffolds, an internal TypeScript validation module, focused tests, and a cross-vendor baseline report. It updates project guidance but adds no dependency, public CLI command, runtime protocol, generated production Skill, registry entry, domain membership, or package script. Existing native Skill upstream converters remain outside this mandatory rewrite standard.
