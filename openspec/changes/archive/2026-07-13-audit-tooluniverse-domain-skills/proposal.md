## Why

ResearchSpec now has a production-ready domain Skill plugin framework, but it has not yet established a reviewable upstream baseline for its first real plugin source. ToolUniverse exposes a large and internally coupled Skill collection whose published catalog, actual tree, platform metadata, runtime dependencies, and Open Agent Skills conformance must be audited before any content is admitted to the package registry.

## What Changes

- Add ToolUniverse as a maintainer-only submodule at `vendor/tooluniverse`, pinned to the immutable commit behind release `v1.3.1`.
- Add a versioned machine-readable audit that accounts for every top-level ToolUniverse Skill exactly once and records scope, domain, readiness, resources, dependencies, coupling, and findings.
- Add a human audit report covering the source baseline, domain model, exclusions, standards gaps, runtime and safety risks, and recommendations for a later ingest change.
- Add deterministic tests that keep the pinned source, audit inventory, known findings, and npm exclusion boundary aligned.
- Keep the production plugin registry empty; do not add an ingest adapter, runtime bridge, plugin dependency model, or generated plugin assets in this change.

## Capabilities

### New Capabilities

- `tooluniverse-domain-skill-audit`: Defines the pinned upstream baseline, complete Skill audit contract, domain classification, evidence requirements, and separation between audit findings and production plugin admission.

### Modified Capabilities

None.

## Impact

- Repository maintenance inputs: `.gitmodules` and `vendor/tooluniverse`.
- Repository-only audit artifacts and tests.
- Project guidance in `AGENTS.md`.
- No public CLI, workspace schema, plugin Registry Schema 1, npm dependency, or runtime delivery behavior changes.
