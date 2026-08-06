## MODIFIED Requirements

### Requirement: Canonical Five-Workflow Manifest

ResearchSpec SHALL define exactly five Companion workflows named `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, `researchspec-verify`, and `researchspec-cli-handbook` in one typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** Companion Skills or command wrappers are projected
- **THEN** all five unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide an installed Skill ID, description, name, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

## RENAMED Requirements

- FROM: `### Requirement: Canonical Four-Workflow Manifest`
- TO: `### Requirement: Canonical Five-Workflow Manifest`

## ADDED Requirements

### Requirement: Independent CLI Handbook Companion

`researchspec-cli-handbook` SHALL provide the generated static CLI command, payload, selector, and workspace-contract reference. Its description SHALL require loading whenever an Agent uses, invokes, explains, inspects, troubleshoots, or modifies ResearchSpec CLI or workspace behavior.

#### Scenario: ResearchSpec use triggers the handbook Skill

- **WHEN** an Agent works with ResearchSpec commands, payloads, selectors, status, checks, workspace contracts, or generated projections
- **THEN** it SHALL load `researchspec-cli-handbook`
- **AND** Navigate SHALL remain responsible for workflow routing rather than owning the handbook tree

## REMOVED Requirements

### Requirement: Navigate CLI Handbook Is Optional Progressive Disclosure
**Reason**: CLI reference material is now an independently triggered Companion Skill.
**Migration**: Load `researchspec-cli-handbook`; do not look for a Navigate-local reference.
