## MODIFIED Requirements

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the
fixed fifteen-Skill surface from four ARSU, four Companion, and seven fixed
Zotero Adapter Skills, and derive optional Skill projections independently from
the plugin registry.

#### Scenario: Target delivery matrix is generated

- **WHEN** target agent assets are projected to the supported tool catalog
- **THEN** all 31 tools SHALL receive 15 fixed Skills plus any selected plugin Skills
- **AND** the 28 command-capable tools SHALL receive exactly 8 thin command wrappers

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Dependency-resolved domain Skills SHALL remain optional additions to the exact
four ARSU, four Companion, and seven fixed Zotero Adapter Skill base surface and
SHALL NOT add command wrappers.

#### Scenario: Domain installation preserves wrapper frontier

- **WHEN** any combination of domains is installed
- **THEN** all supported tools SHALL retain exactly the fifteen fixed base Skills
  and optional resolved domain Skills
- **AND** command-capable tools SHALL retain exactly eight fixed wrappers
