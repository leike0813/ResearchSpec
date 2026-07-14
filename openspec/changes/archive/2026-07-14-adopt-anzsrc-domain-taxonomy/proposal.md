## Why

ResearchSpec's unpublished three-domain ToolUniverse catalog mixes broad scientific disciplines with methods and is owned by one vendor converter, so it cannot remain stable or source-neutral as additional vendors are audited. A canonical discipline taxonomy and explicit empty-domain visibility contract are needed before Scientific Agent Skills or any later vendor can be ingested coherently.

## What Changes

- **BREAKING** Replace the three unpublished ToolUniverse domain IDs directly with discipline domains based exclusively on ANZSRC 2020 Fields of Research Groups plus five coarse ResearchSpec-owned tool domains; no aliases or workspace migration layer are added.
- Add a versioned ANZSRC snapshot and canonical taxonomy documentation covering all 23 Divisions, 213 Groups, and 1,967 Fields. Group defines installable discipline domains; Field remains audit metadata only.
- Pre-create all 213 discipline domains and five tool domains internally, while exposing only domains with reviewed Skills through CLI, JSON, status, checks, and Navigate.
- Preserve previously selected domains that later become empty as unavailable recovery state: update blocks, installed status remains visible, snapshot-based uninstall remains safe, and repopulation restores availability.
- Separate vendor conversion from domain assembly: each converter emits an isolated bundle, a source-neutral catalog owns domain membership, and a central assembler alone writes the production registry.
- Migrate the 130 admitted ToolUniverse Skills to 28 ANZSRC Group domains and two non-empty tool domains without changing Skill bytes, dependencies, wrappers, or execution policy.
- Add ANZSRC Field audit metadata for all 150 ToolUniverse and 147 Scientific Agent Skills records, including explicit reasons when no primary Field applies; Scientific Agent Skills remains audit-only.
- Add `docs/domain_taxonomy.md` and synchronize product, architecture, plugin, adapter, release, README, and project-agent guidance.

## Capabilities

### New Capabilities
- `domain-taxonomy`: Defines the ANZSRC Group discipline taxonomy, ResearchSpec tool taxonomy, Field audit metadata, fixed internal catalog, and non-empty public visibility rule.

### Modified Capabilities
- `domain-skill-plugin-registry`: Adds taxonomy metadata, typed discipline/tool domains, empty internal domains, public availability derivation, and unavailable recovery semantics.
- `vendor-skill-conversion`: Replaces whole-registry vendor output with isolated vendor bundles and central source-neutral assembly.
- `tooluniverse-domain-skill-audit`: Replaces the legacy nine-domain audit classification with ANZSRC Field metadata and traces admitted Skills into the new domain catalog.
- `scientific-agent-skills-domain-skill-audit`: Adds complete ANZSRC Field metadata while preserving audit-only status and prohibiting implicit admission.
- `cli-interface`: Hides empty domains from normal plugin commands and exposes selected-empty domains only as unavailable installed recovery state.
- `agent-tool-delivery`: Resolves and projects only non-empty available domains while preserving snapshot-based uninstall for selected unavailable domains.
- `companion-skills`: Limits Navigate recommendations to installed, available, semantically matching non-empty domains.
- `arsu-user-model-acceptance`: Extends domain-plugin acceptance to cover empty-domain hiding and unavailable recovery without changing the fixed CLI frontier.

## Impact

- Registry contracts, plugin selection/status/check handlers, manifest snapshots, Navigate guidance, and package verification.
- ToolUniverse converter outputs and maintainer commands; generated Skill content remains static and non-executing.
- Versioned audit JSON for 297 upstream Skills and source-neutral taxonomy/catalog inputs.
- Canonical docs, README, AGENTS guidance, npm file whitelist, and release tarball assertions.
- No dependency, schema-version, public command, wrapper, workflow profile, runtime download, script execution, or Scientific Agent Skills production ingest change.
