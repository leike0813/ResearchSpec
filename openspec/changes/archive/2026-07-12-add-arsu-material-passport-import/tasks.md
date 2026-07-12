## 1. Contracts And Projection

- [x] 1.1 Add strict Material Passport import, projection, imported-evidence and runtime-context schemas.
- [x] 1.2 Extend the current run state, registry and snapshot contracts with explicit import variants.

## 2. Runtime Transaction

- [x] 2.1 Implement contained JSON/YAML loading, hashes, deterministic projection and immutable evidence artifacts.
- [x] 2.2 Compose import into mid-entry Start with idempotency, boundary conflict checks and state-last writes.
- [x] 2.3 Exclude imported Gate/Decision evidence from current authority.

## 3. Instructions, CLI And Validation

- [x] 3.1 Expose scoped runtime context to subflow, work and Gate instructions.
- [x] 3.2 Return `material_passport_import` in Start summaries and envelopes.
- [x] 3.3 Cover projector, transaction, authority, context and public resume behavior and run the full validation gate.
