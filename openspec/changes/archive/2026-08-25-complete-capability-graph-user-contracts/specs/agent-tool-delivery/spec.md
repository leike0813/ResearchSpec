## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected Skill-capable tool SHALL receive five generated ResearchSpec Companion Skills together with the four ARSU Skills and all registered capability packages projected for that tool. ResearchSpec SHALL deliver no separate Core Skill group. The handbook content SHALL be delivered as the `SKILL.md` of `researchspec-cli-handbook`; no Navigate-local `references/cli-handbook.md` file SHALL be generated.

#### Scenario: Every tool receives the fixed base surface

- **WHEN** any registered tool is selected without optional Adapter selection
- **THEN** it SHALL receive four ARSU Skills, five Companion Skills, and the registered capability packages supported by its delivery mode
- **AND** desired projection counts and files SHALL be derived from their owning catalogs

#### Scenario: Selected Adapter reaches every tool

- **WHEN** `zotero-library` and one or more Agent tools are selected
- **THEN** all seven Adapter Skills SHALL be projected to every selected tool
- **AND** their complete trees SHALL use the normal managed ownership records

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error
