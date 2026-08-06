## MODIFIED Requirements

### Requirement: Minimal User-Visible Skill Surface

The fixed base surface SHALL contain four ARSU Skills, two Core Skills, and five Companion Skills, for exactly eleven Skills. Selecting the seven-Skill Zotero Adapter SHALL produce eighteen Skills. Command-capable tools SHALL continue to receive exactly sixteen wrappers when commands are selected.

#### Scenario: Default surface is projected

- **WHEN** a tool is selected without an optional literature Adapter
- **THEN** it SHALL receive eleven fixed Skills

#### Scenario: Zotero Adapter is selected

- **WHEN** the workspace selects `zotero-library`
- **THEN** its seven catalog-owned Skills SHALL be added to each selected Agent host

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the fixed eleven-Skill surface from four ARSU, two Core and five Companion Skills, and derive optional Zotero and domain Skill projections from their separate catalog-backed selections.

#### Scenario: Target delivery matrix is generated

- **WHEN** target Agent assets are projected to the supported tool catalog
- **THEN** all 37 tools SHALL be capable of receiving eleven fixed Skills plus selected optional Skills
- **AND** the 28 command-capable tools SHALL receive exactly sixteen thin command wrappers when delivery includes commands

#### Scenario: Wrapper does not own workflow semantics

- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Dependency-resolved domain Skills and selected literature Adapter Skills SHALL remain optional additions to the exact eleven-Skill fixed base surface and SHALL NOT add command wrappers.

#### Scenario: Optional installation preserves wrapper frontier

- **WHEN** any combination of domains and literature Adapters is selected
- **THEN** supported tools SHALL retain the eleven fixed base Skills plus selected optional Skills
- **AND** command-capable tools SHALL retain exactly sixteen fixed wrappers

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool SHALL receive eighteen Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** ForgeCode, Kimi, or Mistral Vibe and `zotero-library` are selected
- **THEN** the tool SHALL receive all eighteen selected Skills
- **AND** command absence SHALL remain a non-blocking diagnostic
