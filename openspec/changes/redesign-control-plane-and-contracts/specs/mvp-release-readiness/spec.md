## ADDED Requirements

### Requirement: Current Contract Release Gate
A release SHALL be blocked until fresh packaged CLI journeys, generated Skills, Companion guidance,
canonical documentation and package verification all use the same current workspace contract.

#### Scenario: Legacy control-plane behavior remains published
- **WHEN** release verification finds a public `submit`, strict/adaptive runtime, migration, registry,
  ledger, receipt, Passport or generic Draft Patch authority
- **THEN** the release fails

## MODIFIED Requirements

### Requirement: Release Surface And Guidance Are Converged
The release SHALL contain the fixed fifteen-Skill surface, sixteen-command CLI, current profile and
current user guidance, with no generated or packaged path depending on legacy runtime authority.

#### Scenario: Package is verified
- **WHEN** the packed tarball is installed and exercised in a fresh environment
- **THEN** init creates only the current workspace and all documented base journeys are executable

