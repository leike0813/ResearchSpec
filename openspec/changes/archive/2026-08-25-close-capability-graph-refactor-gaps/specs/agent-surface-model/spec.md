## MODIFIED Requirements

### Requirement: Minimal User-Visible Skill Surface

The fixed base surface SHALL contain four ARSU Skills, five Companion Skills and every package registered in the bundled capability registry. Selecting the seven-Skill Zotero Adapter SHALL add those seven Skills. Command-capable tools SHALL continue to receive exactly sixteen wrappers when commands are selected.

#### Scenario: Default surface is projected

- **WHEN** a tool is selected without an optional literature Adapter
- **THEN** it receives four ARSU Skills, five Companion Skills and all currently registered capability packages
- **AND** the expected count is derived from those registries rather than a duplicated literal

#### Scenario: Zotero Adapter is selected

- **WHEN** the workspace selects `zotero-library`
- **THEN** its seven catalog-owned Skills are added to the registry-derived fixed base surface

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the fixed base surface from four ARSU Skills, five Companion Skills and the capability registry, and derive optional Zotero and domain Skill projections from their separate catalog-backed selections.

#### Scenario: Target delivery matrix is generated

- **WHEN** target Agent assets are projected to the supported tool catalog
- **THEN** all Skill-capable tools receive the registry-derived fixed base surface plus selected optional Skills
- **AND** the 28 command-capable tools receive exactly sixteen thin command wrappers when delivery includes commands

#### Scenario: Wrapper does not own workflow semantics

- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper delegates to the corresponding Skill or CLI protocol
- **AND** it does not introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Dependency-resolved domain Skills and selected literature Adapter Skills SHALL remain optional additions to the registry-derived fixed base surface and SHALL NOT add command wrappers.

#### Scenario: Optional installation preserves wrapper frontier

- **WHEN** any combination of domains and literature Adapters is selected
- **THEN** supported tools retain the registry-derived fixed base Skills plus selected optional Skills
- **AND** command-capable tools retain exactly sixteen fixed wrappers

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool receives the registry-derived fixed base surface plus seven Adapter Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism remains available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** a Skill-only tool and `zotero-library` are selected
- **THEN** the tool receives the registry-derived fixed base surface plus all seven Adapter Skills
- **AND** command absence remains a non-blocking diagnostic

