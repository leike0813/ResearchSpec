## Why

ResearchSpec currently delivers only its fixed ARSU and Companion surface, so it
has no governed way to distribute reviewed domain knowledge Skills without
turning third-party projects into runtime dependencies. A package-owned registry
is needed to add optional domain Skills while preserving the existing workflow,
Gate, Decision, and artifact-registry authority boundaries.

## What Changes

- Add a package-owned domain Skill plugin registry and static plugin tree using
  Open Agent Skills as the Skill-content contract.
- Add `researchspec plugin` lifecycle commands for listing, inspecting,
  installing, updating, and uninstalling workspace-selected plugins.
- Extend workspace configuration, installation ownership evidence, delivery,
  validation, status, and Navigate advisory behavior for optional plugin Skills.
- Preserve the fixed four ARSU plus four Companion base surface and its eight
  command wrappers; plugins add Skills only.
- Add canonical plugin documentation, package/release verification, and test
  fixtures without shipping a production plugin.

## Capabilities

### New Capabilities

- `domain-skill-plugin-registry`: Defines the bundled registry, provenance,
  Open Agent Skills validation, workspace selection, lifecycle, projection,
  drift safety, and core authority boundaries for domain Skill plugins.

### Modified Capabilities

- `agent-tool-delivery`: Projects selected plugin Skill trees through existing
  tool delivery and manifest ownership without adding wrappers.
- `cli-interface`: Evolves the public CLI to sixteen top-level commands and adds
  plugin lifecycle and validation surfaces.
- `agent-surface-model`: Distinguishes the fixed eight-Skill base surface from
  optional registry-driven plugin Skills.
- `framework-core`: Stores workspace-level plugin selection and reports plugin
  projection state without changing the existing workspace schema version.
- `companion-skills`: Allows Navigate to recommend semantically matching
  installed plugin Skills as advisory guidance only.
- `arsu-user-model-acceptance`: Adds acceptance coverage for plugin discovery,
  installation, projection, and non-authoritative recommendations.

## Impact

The change affects packaged Skills, CLI registration and result DTOs, workspace
configuration parsing/rendering, tool delivery planning, installation manifests,
status/check validation, Navigate guidance, package contents, release checks,
OpenSpec contracts, tests, and canonical product documentation. It introduces no
new dependency, remote registry, runtime script execution, converter ABI, agent
API, workflow profile, Gate, Decision, or artifact-registry authority.
