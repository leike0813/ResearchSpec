## REMOVED Requirements

### Requirement: Tolerant Runtime Observation
**Reason**: Doctor diagnoses current files but does not reconstruct legacy runtime authority.
**Migration**: Use source control or explicit human repair of the owning file.

### Requirement: Fixed Recovery Finding Taxonomy
**Reason**: The receipt-oriented recovery taxonomy is removed.
**Migration**: Report ordinary current schema, drift and unsupported-format diagnostics.

### Requirement: Deterministic Repair Planning
**Reason**: Doctor is read-only and has no repair plan.
**Migration**: Apply an explicit user-approved edit or recreate a generated projection with update.

### Requirement: Receipt-Bound Repair Commit
**Reason**: Runtime repair receipts are removed.
**Migration**: Generated projection replacement uses manifest ownership; semantic files are manual.

### Requirement: Evidence-First Repair Is Retryable
**Reason**: Multi-file runtime repair transactions are removed.
**Migration**: Resolve each owning file directly using trusted evidence.

### Requirement: Doctor Guidance Is Bounded And Non-Semantic
**Reason**: This requirement is replaced by the current read-only Doctor contract in CLI capability.
**Migration**: Use the current Doctor diagnostics without repair actions.

### Requirement: Adaptive receipt v2 exact recovery
**Reason**: Adaptive receipts do not exist in the current contract.
**Migration**: No receipt migration is provided.

### Requirement: Bidirectional runtime reconciliation
**Reason**: There is no registry/ledger/state authority set to reconcile.
**Migration**: Validate each current owner and report contradictions without guessing.

