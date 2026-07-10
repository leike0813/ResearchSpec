## ADDED Requirements

### Requirement: Converter generates the universal runtime profile
The converter SHALL generate a marked runtime projection from its workflow and artifact catalogs and SHALL fail check mode when the projection differs from source data.

#### Scenario: Workflow source changes without regeneration
- **WHEN** converter check detects a stale runtime projection or generated guidance
- **THEN** it reports drift and exits unsuccessfully without rewriting in check mode

### Requirement: Converter cross-validates routing and workflow catalogs
The converter SHALL reject missing, duplicate, unknown, owner-mismatched, artifact-incomplete, or Gate-inconsistent external route templates.

#### Scenario: External template coverage is duplicated
- **WHEN** two complete external templates claim the same operational route
- **THEN** conversion validation fails with that route identified

### Requirement: Generated guidance follows the runtime frontier
Generated Skill instructions SHALL direct Agents to dispatch only selectors returned by the CLI and SHALL describe delegated child starts, explicit branch Decisions, formal Gate confirmation, and dynamic revision rounds.

#### Scenario: Another revision is requested
- **WHEN** generated pipeline guidance handles a revision branch after re-review
- **THEN** it directs the Agent to use the next CLI-provided round selector rather than inventing or limiting a round number
