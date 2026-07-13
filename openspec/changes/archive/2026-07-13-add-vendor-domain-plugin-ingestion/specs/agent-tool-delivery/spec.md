## ADDED Requirements

### Requirement: Dependency-Resolved Domain Delivery
Agent delivery SHALL project the sorted union of direct and transitive Skills resolved from selected domains and SHALL write each Skill at most once per configured tool.

#### Scenario: Overlapping domain installation is deduplicated
- **WHEN** multiple selected domains directly or transitively require the same Skill
- **THEN** every configured Agent tool SHALL receive one copy of that Skill tree
- **AND** the manifest SHALL retain its vendor and Skill ownership evidence

### Requirement: Domain Resolution Snapshot Delivery
Delivery reconciliation SHALL commit per-domain resolution snapshots with the installation manifest last.

#### Scenario: New Agent tool receives current closure
- **WHEN** init or update adds a configured Agent tool after domains were selected
- **THEN** the tool SHALL receive every currently resolvable Skill in the selected-domain closure

