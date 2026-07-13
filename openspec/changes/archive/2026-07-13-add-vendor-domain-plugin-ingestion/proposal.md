## Why

The current plugin registry conflates upstream provenance with the user-facing installation unit and cannot express Skill dependencies. The completed ToolUniverse v1.3.1 audit provides the evidence needed to separate maintainer-owned vendor conversion from stable domain installation and safely admit its 130 research Skills.

## What Changes

- **BREAKING** Redefine unpublished Registry Schema 1 around `vendors` and stable `domains`, with globally unique vendor-owned Skills and reviewed Skill dependencies.
- Add an internal vendor bundle contract and a deterministic ToolUniverse-specific converter that consumes the pinned submodule and audit inventory.
- Generate and distribute 130 adapted ToolUniverse Skills across three vendor-neutral installable domains while retaining overlap without duplicating Skill assets.
- Resolve domain Skill dependency closures for install, update, tool backfill, status, and drift-safe uninstall.
- Keep vendor identities out of normal domain lifecycle commands while exposing detailed provenance through `plugin show`.
- Preserve the fixed eight-Skill ResearchSpec base surface, wrapper count, offline runtime, and workflow-authority boundary.

## Capabilities

### New Capabilities

- `vendor-skill-conversion`: Maintainer-owned vendor admission, deterministic conversion, dependency review, generated bundle validation, and ToolUniverse ingestion.

### Modified Capabilities

- `domain-skill-plugin-registry`: Replace source/plugin ownership with vendor/domain ownership and dependency-aware lifecycle semantics.
- `agent-tool-delivery`: Project resolved domain Skill closures without adding wrappers or executing vendor resources.
- `cli-interface`: Make domain IDs the only public plugin lifecycle selection unit and expose resolved Skill status.
- `agent-surface-model`: Preserve the fixed base surface while allowing dependency-resolved optional domain Skills.
- `companion-skills`: Restrict Navigate recommendations to resolved installed domain Skills.
- `tooluniverse-domain-skill-audit`: Connect the immutable audit inventory to a separately generated and validated production vendor bundle.

## Impact

The change affects the plugin registry and status types, delivery and manifest reconciliation, plugin CLI JSON output, checks, generated Skill packaging, release verification, and canonical plugin documentation. It adds no runtime dependency, public converter ABI, remote registry, wrapper, workflow node, or schema migration because the existing plugin contract has not been released.
