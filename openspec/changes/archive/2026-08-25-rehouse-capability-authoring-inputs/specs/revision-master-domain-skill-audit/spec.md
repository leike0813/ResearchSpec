## MODIFIED Requirements

### Requirement: Revision-Master Extraction Is Authoring Authority

Revision-master capability definitions, knowledge, scripts, schemas, templates, and extraction metadata SHALL be consumed from `authoring/revision-master`. Generated capability packages and the graph profile remain derived production output.

#### Scenario: Revision-response capabilities are regenerated

- **WHEN** the revision-master authoring command runs
- **THEN** all five capability packages resolve their reviewed inputs from `authoring/revision-master`
- **AND** no runtime or maintainer path depends on `docs/revision-master_extraction`
