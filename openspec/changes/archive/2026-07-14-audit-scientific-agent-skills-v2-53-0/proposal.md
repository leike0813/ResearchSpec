## Why

ResearchSpec now supports multiple vendor-owned Skills assembled into user-selected domains, but its second proposed upstream contains mixed licenses, security findings, platform/runtime assumptions, and broad scientific coverage that cannot be admitted safely from repository metadata alone. A pinned, complete audit is required before a source-specific converter can make reviewable ingestion decisions.

The existing ToolUniverse audit capability also remains in delta-spec form after archival and still describes an empty production registry, so the OpenSpec baseline must be repaired before adding another vendor audit.

## What Changes

- Add `K-Dense-AI/scientific-agent-skills` as a maintainer-only submodule pinned to release `v2.53.0` commit `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`.
- Add a versioned machine audit that accounts for all 147 top-level Skills and records source classification, fit to existing domains, resources, cross-Skill relationships, licensing, security, runtime, authority, and ingest readiness.
- Add a human audit report and freeze the later source-specific adapter design, including central multi-vendor registry assembly and Skill-level license provenance.
- Add shared audit contracts and read-only validation helpers without introducing a generic converter ABI.
- Correct the current ToolUniverse audit specification so it describes the admitted production vendor and validates as a current-state spec.
- Keep scientific-agent-skills out of the production registry, npm package, workspace delivery, and public CLI in this change.

## Capabilities

### New Capabilities

- `scientific-agent-skills-domain-skill-audit`: Defines the immutable source baseline, complete Skill audit, classification and risk evidence, adapter-design boundary, and separation between audit findings and production admission.

### Modified Capabilities

- `tooluniverse-domain-skill-audit`: Replaces the obsolete empty-registry audit scenario with the current separation between audit evidence and the independently admitted ToolUniverse production vendor.

## Impact

- Repository maintenance inputs: `.gitmodules` and `vendor/scientific-agent-skills`.
- Repository-only audit contracts, audit artifacts, tests, and project guidance.
- OpenSpec current-state repair for the existing ToolUniverse audit capability.
- No public CLI, workspace schema, runtime delivery, production registry entry, npm dependency, or generated scientific-agent-skills asset.
