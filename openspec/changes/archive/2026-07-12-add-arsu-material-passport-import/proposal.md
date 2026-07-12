## Why

ARS Material Passports contain useful external provenance, reset, compliance, audit and experiment evidence, but ResearchSpec needs a deterministic one-way import that preserves its own state and authority model.

## What Changes

- Add strict hash-bound JSON/YAML Material Passport import on confirmed `academic-pipeline:mid-entry` Start.
- Project the immutable source into imported artifacts, resume metadata and non-authoritative Gate/Decision evidence.
- Expose scoped imported references through runtime context without mutating the Passport or stable contracts.

## Capabilities

### New Capabilities

- `material-passport-import`: Defines validation, projection, trust boundaries, idempotency and runtime context.

### Modified Capabilities

- `subflow-instance-control-plane`: Composes one optional import into the current Start transaction.
- `cli-interface`: Adds the `material_passport_import` Start field and result.
- `arsu-run-usage`: Defines the external-Passport mid-entry journey.

## Impact

Core import contracts, snapshots, Start planning, runtime context, CLI envelopes, converter guidance and tests change. No export, migration, public command or stable-contract mutation is introduced.
