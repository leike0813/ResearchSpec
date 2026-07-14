## Why

Scientific Agent Skills v2.53.0 has been pinned and audited, but none of its 147 Skills can currently be distributed or selected through ResearchSpec. Formal ingestion now requires a source-specific converter and complete, reviewable admission decisions so that the second vendor strengthens discipline and tool domains without importing prohibited content, duplicate ToolUniverse capabilities, workflow authority, or unresolved risk.

## What Changes

- Add a Scientific Agent Skills v2.53.0 converter that consumes the immutable audit plus complete admission, dependency, overlap, license, security, content, domain, and resource decisions.
- Review all 139 business candidates, retain the eight hard exclusions, and generate only Skills that pass every applicable decision.
- Normalize admitted Open Agent Skills, use globally unique `scientific-agent-skills-<upstream-id>` IDs, preserve reviewed resources with explicit exceptions, and add accurate Skill-level licenses and notices.
- Refactor converter staging so ToolUniverse and Scientific Agent Skills remain isolated while the central assembler validates and publishes their combined registry.
- Add admitted Skills to the source-neutral ANZSRC/tool domain catalog through explicit reviewed membership; installation remains domain-only and resolves reviewed cross-vendor hard dependencies.
- Package the generated vendor tree, bundle, manifest, report, registry, and canonical documentation without packaging either vendor checkout or executing upstream assets.
- Keep Registry Schema 1, the sixteen-command CLI, the five tool domains, all 213 ANZSRC Group domains, the eight base Skills, and the eight wrapper frontier unchanged.

## Capabilities

### New Capabilities

- `scientific-agent-skills-vendor-conversion`: Defines complete production admission, deterministic conversion, reviewed resource handling, and generated outputs for the pinned v2.53.0 vendor.

### Modified Capabilities

- `scientific-agent-skills-domain-skill-audit`: Connects every audited record and finding to an explicit production admission resolution without weakening the immutable audit evidence.
- `vendor-skill-conversion`: Requires isolated converters to stage against every published vendor before central assembly and prevents one converter from overwriting another vendor.
- `domain-skill-plugin-registry`: Adds the reviewed second-vendor Skills, licenses, provenance, and cross-vendor dependency closure to the production registry.
- `domain-taxonomy`: Adds manually reviewed Scientific Agent Skills membership without deriving domains automatically from Field metadata or creating new domains.
- `mvp-release-readiness`: Requires the npm package and installed CLI to contain and validate the admitted second-vendor assets while excluding maintainer-only source and audit inputs.

## Impact

- Adds one vendor-specific TypeScript converter, reviewed policy catalogs, generated vendor assets, maintenance commands, tests, and canonical adapter documentation.
- Updates the shared converter staging path, source-neutral domain catalog, central registry output, release verifier, package whitelist, README, architecture documents, and project guidance.
- Does not add dependencies, change public CLI arguments, update the workspace schema, execute plugin scripts, configure credentials, or add a runtime bridge.
