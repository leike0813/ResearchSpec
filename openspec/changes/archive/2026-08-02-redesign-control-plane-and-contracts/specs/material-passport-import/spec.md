## REMOVED Requirements

### Requirement: Strict Material Passport Import
**Reason**: Material Passport and strict compatibility are outside the current contract.
**Migration**: Preserve useful files outside ResearchSpec and introduce them through explicit inputs.

### Requirement: Imported Evidence Has No Authority
**Reason**: The Passport import operation itself is removed.
**Migration**: Record accepted stable facts in specs and boundary files in handoffs.

### Requirement: Idempotent Import
**Reason**: There is no Passport import transaction.
**Migration**: Reuse explicit external input paths without creating imported runtime state.

