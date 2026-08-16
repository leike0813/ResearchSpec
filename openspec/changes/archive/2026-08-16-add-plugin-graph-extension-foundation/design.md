## Context

The capability graph engine already has contracts for atomic capability packages and graph profiles. Plugin Skills remain schema-1 raw Open Agent Skills. A separate extension registry allows graph-native plugin assets to be reviewed and validated incrementally without breaking the six-vendor raw plugin registry or its converters.

## Goals / Non-Goals

**Goals:**

- Define a stable, hash-bound extension registry for plugin capability packages and graph profiles.
- Validate every extension package with the existing capability-manifest and capability-graph schemas.
- Map stable domain IDs to extension capability/profile IDs.
- Make `check plugins` prove extension registry health and collision safety.

**Non-Goals:**

- Projecting extension capabilities or profiles into graph workspaces.
- Executing plugin graph profiles through `start`/`advance`.
- Converting all raw plugin vendors to capability packages.

## Decisions

### Separate registry, shared contracts

`skills/plugins/extensions/registry.json` is schema 1 and contains `registry_version`, `capabilities`, `profiles`, and `domains`. Capability entries bind `source_path` and manifest SHA-256; profile entries bind profile text SHA-256. The loader reuses `CapabilityManifestSchema` and `CapabilityGraphProfileSchema` rather than defining a second semantic contract.

### Pilot extension is vendor-derived and advisory

`plugin-ecology-biodiversity` is derived from the reviewed ToolUniverse `tooluniverse-ecology-biodiversity` Skill. Its capability is an LLM producer with `task_request -> research_brief`, an engine policy validator, and vendor-derived provenance. Its profile is one end-to-end node with no Gates or Decisions.

### Check plugins owns extension validation

`check plugins` loads the extension registry, resolves extensions for selected domains, validates graph references against base plus extension capability IDs, and rejects collisions with base capabilities or raw plugin Skill IDs. Registry load or validation failure is blocking.

### No projection yet

This stage deliberately does not project extension capabilities or profiles. The next stage will add manifest ownership for `plugin-capability` and `plugin-profile` projections and the runtime capability-registry overlay.

## Risks

- The pilot package duplicates the semantic surface of the existing raw ecology Skill. Accepted as a graph-native migration pilot; raw Skill projection remains available until extension projection and runtime execution replace it.
- The extension registry is small and hand-maintained in this stage. Later vendor converters SHALL own extension generation.
