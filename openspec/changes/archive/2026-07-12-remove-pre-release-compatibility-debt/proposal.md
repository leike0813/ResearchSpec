## Why

ResearchSpec has not been released, but its current contracts and runtime still preserve pre-instance workflow schemas, unscoped selectors, retired Agent projections, transitional profiles, and API aliases. Those branches duplicate the current control plane and force every new feature to maintain states that no supported user should create.

## What Changes

- **BREAKING** Make `arsu-v0-1` the only workspace profile and Schema 0.2 subflow instances the only workflow/run-state model.
- **BREAKING** Accept only instance-scoped work and Gate selectors; remove static workflow evaluation and legacy artifact submission.
- **BREAKING** Replace the `research-artifact` validation alias with explicit `text-artifact` and `binary-file-artifact` profiles.
- **BREAKING** Rename Material Passport Start input and state from compatibility terminology to explicit ARS import terminology.
- Remove product-specific cleanup for never-released Companion projections while retaining generic ownership and drift protection.
- Replace compatibility-oriented converter metadata and generated guidance with ResearchSpec contract integration and one-way ARS evidence import language.
- Remove current specs and documentation that require old ResearchSpec inputs or preserve retired product history.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `framework-core`: Require the single current workflow, run-state, profile, registry, Gate and Decision contract family.
- `subflow-instance-control-plane`: Remove static workspace execution and singleton-stage compatibility behavior.
- `artifact-submit`: Require scoped submission, current confirmation policies and explicit text/binary validation profiles.
- `cli-interface`: Make init profile-free and remove old selector and migration behavior.
- `agent-tool-delivery`: Remove product-retirement reconciliation while preserving generic ownership and drift safety.
- `companion-skills`: Remove retired workflow history and legacy submission guidance from the current Skill contract.
- `arsu-converter`: Rename compatibility metadata and generated runtime guidance to current contract integration and ARS import semantics.

## Impact

The change affects core Zod contracts, workspace loading, workflow evaluation, artifact submission, CLI initialization, status/handoff rendering, Agent delivery reconciliation, ARSU converter metadata and replacement templates, generated Skills, OpenSpec main specs, current design documents and tests. Existing pre-instance workspaces and old request fields will fail validation without migration or deprecation aliases.
