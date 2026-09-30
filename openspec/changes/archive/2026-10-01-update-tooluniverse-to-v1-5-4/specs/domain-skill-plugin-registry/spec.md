## MODIFIED Requirements

### Requirement: Stable Overlapping Domain Catalog
ResearchSpec SHALL provide one source-neutral catalog containing all 213 ANZSRC Group domains and five ResearchSpec tool domains whose reviewed membership lists may be empty or overlap without duplicating Skill assets.

#### Scenario: ToolUniverse domain membership is assembled
- **WHEN** the audited ToolUniverse bundle and domain catalog are assembled
- **THEN** all 130 admitted Skills SHALL remain reachable from at least one non-empty domain
- **AND** the public catalog SHALL initially contain 28 discipline and two tool domains

#### Scenario: Vendor update does not move domain membership
- **WHEN** the pinned ToolUniverse release changes and the admitted Skill set stays the same
- **THEN** domain membership SHALL remain the reviewed projection of that set
- **AND** no new public domain, command, wrapper or registry schema version SHALL be introduced by the update

