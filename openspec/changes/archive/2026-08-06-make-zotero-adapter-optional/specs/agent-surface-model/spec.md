## MODIFIED Requirements

### Requirement: Minimal User-Visible Skill Surface

The fixed user-visible surface SHALL contain exactly four ARSU Skills, two Core
Skills and four Companion Skills. The seven Zotero literature Adapter Skills
and reviewed domain Skills SHALL remain optional additions.

#### Scenario: Default surface is projected

- **WHEN** a registered Agent host receives ResearchSpec Skills without optional selections
- **THEN** exactly ten fixed Skills SHALL be projected

#### Scenario: Zotero Adapter is selected

- **WHEN** the workspace selects `zotero-library`
- **THEN** its seven catalog-owned Skills SHALL be added to each selected Agent host

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the
fixed ten-Skill surface from four ARSU, two Core and four Companion Skills, and
derive optional Zotero and domain Skill projections from their separate
catalog-backed selections.

#### Scenario: Target delivery matrix is generated

- **WHEN** target Agent assets are projected to the supported tool catalog
- **THEN** all 31 tools SHALL be capable of receiving ten fixed Skills plus selected optional Skills
- **AND** the 28 command-capable tools SHALL receive exactly sixteen thin command wrappers

#### Scenario: Wrapper does not own workflow semantics

- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Dependency-resolved domain Skills and selected literature Adapter Skills SHALL
remain optional additions to the exact ten-Skill fixed base surface and SHALL
NOT add command wrappers.

#### Scenario: Optional installation preserves wrapper frontier

- **WHEN** any combination of domains and literature Adapters is selected
- **THEN** supported tools SHALL retain the ten fixed base Skills plus the selected optional Skills
- **AND** command-capable tools SHALL retain exactly sixteen fixed wrappers

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard
dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool SHALL receive seventeen Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** ForgeCode, Kimi, or Mistral Vibe and `zotero-library` are selected
- **THEN** the tool SHALL receive all seventeen selected Skills
- **AND** command absence SHALL remain a non-blocking diagnostic
