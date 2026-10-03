## ADDED Requirements

### Requirement: Stable Installation Does Not Preemptively Remove The CLI

Stable installation SHALL obtain the packed filename from npm metadata, replace without pre-uninstalling, handle supported platform executable conventions, and verify the actual installed CLI. Failure SHALL retain real diagnostics and SHALL NOT be represented as rollback or successful replacement.

#### Scenario: Replacement installation fails
- **WHEN** npm cannot install the new package
- **THEN** the installer fails without having issued an earlier uninstall and does not announce a successful installation

### Requirement: Pre-Live Reliability Acceptance Is Deterministic

Pre-live verification SHALL exercise material inspection, eligibility, recovery and distribution through existing tests, package journeys and all-target projection checks. Natural behaviour scenarios SHALL cover the new advisory paths without treating static checks as academic or live-host acceptance.

#### Scenario: Only deterministic acceptance has run
- **WHEN** package and static projection verification succeeds
- **THEN** real-host behaviour and academic acceptance remain unsigned

