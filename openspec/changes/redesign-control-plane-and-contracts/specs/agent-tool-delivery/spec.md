## MODIFIED Requirements

### Requirement: Capability-Aware Command Delivery
Each command-capable registered tool SHALL receive wrapper projections for the sixteen current public
commands, while Skill-only tools SHALL receive only the fixed Skills.

#### Scenario: Tool installation is planned
- **WHEN** a user selects Agent tools during init or update
- **THEN** delivery is derived from the current command and Skill catalogs without `submit`

### Requirement: Generated File Drift Protection
ResearchSpec SHALL create missing manifest-owned projections and preserve modified generated files
unless an explicit force operation authorizes replacement.

#### Scenario: Project profile was edited
- **WHEN** update compares the profile with its converter-owned source
- **THEN** it reports drift and does not overwrite the profile without `--force`

## ADDED Requirements

### Requirement: Framework Profile Projection Ownership
The installation manifest SHALL identify `academic-pipeline.yaml` as a project-level
`framework-profile` projection with its source version and generated content identity.

#### Scenario: Fresh workspace is initialized
- **WHEN** init projects the current workspace
- **THEN** the manifest contains exactly one owner record for the project pipeline profile

