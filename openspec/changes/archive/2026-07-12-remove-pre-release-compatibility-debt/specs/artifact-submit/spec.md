## ADDED Requirements

### Requirement: Current Scoped Artifact Submission
Artifact submission SHALL accept only instance-scoped work selectors, `automatic|manual` submission policy, `subflow_start|per_artifact` confirmation basis, and explicit text or binary validation.

#### Scenario: Removed alias is submitted
- **WHEN** a caller uses an unscoped work selector or `research-artifact` validation profile
- **THEN** submission SHALL fail before any registry or receipt write

## REMOVED Requirements

### Requirement: Automatic Registration Confirmation Policy
**Reason**: Its legacy branch is replaced by the current scoped policy.
**Migration**: Use automatic or manual instance work.

### Requirement: Artifact submission supports controlled text and binary files
**Reason**: The requirement preserves the removed `research-artifact` alias.
**Migration**: Use `text-artifact` or `binary-file-artifact`.
