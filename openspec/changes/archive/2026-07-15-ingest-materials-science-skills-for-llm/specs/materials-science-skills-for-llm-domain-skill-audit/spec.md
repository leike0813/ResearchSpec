## ADDED Requirements

### Requirement: Production Ingestion SHALL Resolve Every Audit Recommendation
The `ingest-materials-science-skills-for-llm` change SHALL bind its production catalogs to the complete `snapshot-fafd3ab` audit and SHALL resolve all twelve recommendations as exactly seven admitted and five excluded Skills without altering the immutable audit evidence.

#### Scenario: Audit and production catalogs are compared
- **WHEN** production policy is validated
- **THEN** every audited Skill maps to exactly one production decision
- **AND** audit readiness remains evidence rather than automatic admission

## REMOVED Requirements

### Requirement: Future ingestion SHALL remain a separate non-executing change
**Reason**: The separately reviewed ingestion change now exists and resolves the previously deferred production decisions.

**Migration**: Preserve the non-executing converter, explicit-decision, eligible-domain, and no-automatic-Field-membership boundaries in the new vendor-conversion capability and production catalogs.
