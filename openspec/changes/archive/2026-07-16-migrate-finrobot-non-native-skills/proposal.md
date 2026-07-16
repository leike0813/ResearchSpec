## Why

The six published FinRobot-derived Skills predate the non-native vendor Skill
standard and expose fragmented prompts, provider adapters, dependency manifests,
and Python resources without a single complete runtime controller. They need to
be migrated to reviewed authored trees whose instructions, deterministic tools,
provenance, side effects, and approval boundary are explicit and portable.

## What Changes

- Replace fragment-composed FinRobot output with six complete authored Skill
  trees: two baseline Agent procedures and four script-assisted Skills.
- Consolidate shared deterministic JSON, number, date, unit, hashing, atomic
  write, and command-error behavior in one converter-owned Python support file.
- Replace AgentSpec, prompt-factory, provider-wrapper, dependency-manifest, and
  unused contract assets with capability-specific scripts and complete main
  instructions.
- Map every admitted capability surface to one primary `agent-procedure`,
  `bundled-script`, or `external-tool` mechanism while preserving the immutable
  audit, fixed Skill IDs, source-neutral memberships, empty hard dependencies,
  Apache-2.0 licensing, and advisory relationships.
- Introduce hash-bound candidate review so an approved published tree remains
  authoritative until the complete replacement tree receives explicit human
  approval, then switch production atomically.
- Upgrade the FinRobot converter and generated release assets to the approved
  non-native tree shape without changing the public CLI or domain taxonomy.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `finrobot-vendor-conversion`: Replace resource-fragment output and its approval
  model with complete authored non-native Skill trees, explicit implementation
  mappings, copied-tree executable validation, and published/candidate hash
  review state.
- `mvp-release-readiness`: Require the approved authored FinRobot trees,
  capability scripts, shared support library, derivation, license, and notice
  files while excluding obsolete runtime and maintainer inputs.

## Impact

The change affects FinRobot converter policy, authored sources, preview and
production rendering, source/surface/resource/derivation decisions, review
metadata, focused converter tests, generated FinRobot vendor assets, the
assembled registry, release verification, adapter documentation, root
attribution, and maintainer guidance. It adds no dependency, runtime LLM
integration, public command, Companion Skill, domain, hard Skill dependency,
automatic installation, credential lookup, or converter-time execution.
