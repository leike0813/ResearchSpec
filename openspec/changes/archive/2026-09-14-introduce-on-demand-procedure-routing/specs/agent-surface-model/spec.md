## MODIFIED Requirements

### Requirement: Minimal User-Visible Skill Surface

The fixed base Agent surface SHALL contain only `researchspec-navigate`. Selecting the `zotero-library` Adapter SHALL add its seven catalog-owned Skills unchanged. Hidden procedures SHALL remain discoverable and activatable through Navigate and the CLI without projection into host Skill roots.

#### Scenario: Default surface is projected
- **WHEN** a Skill-capable tool is selected without the optional literature Adapter
- **THEN** it receives exactly one base Skill named `researchspec-navigate`

#### Scenario: Zotero Adapter is selected
- **WHEN** the workspace selects `zotero-library`
- **THEN** its seven catalog-owned Skills are added to the Navigate Skill

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat the Navigate Skill and Navigate command wrapper as thin discovery adapters. ARSU, Companion, core, and plugin procedures SHALL be runtime-resolved product capabilities rather than separately projected host entries.

#### Scenario: Target delivery matrix is generated
- **WHEN** target Agent assets are planned
- **THEN** `skills` produces one Navigate Skill, `commands` produces one Navigate wrapper for command-capable hosts, and `both` produces one of each
- **AND** a Skill-only host selected under `commands` receives the Navigate Skill as a fallback

#### Scenario: Adapter does not own workflow semantics
- **WHEN** Navigate dispatches a procedure
- **THEN** it delegates to CLI discovery or activation contracts without introducing another state machine

#### Scenario: Wrapper does not own workflow semantics
- **WHEN** the Navigate wrapper is invoked
- **THEN** it delegates to Navigate and the CLI contracts without owning workflow state

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Domain selection SHALL preserve registry resolution, installation consent, and profile availability without adding host-visible Skills or wrappers.

#### Scenario: Optional domain is installed
- **WHEN** any available domain selection is committed
- **THEN** the selected Agent hosts retain the same base catalog size

#### Scenario: Optional installation preserves wrapper frontier
- **WHEN** domains or literature Adapters are selected
- **THEN** domain selection adds no wrapper and Zotero selection adds only its seven Skills

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve optional Zotero Adapter role, visibility, capability, dependency, runtime metadata, and ownership without creating a Zotero command wrapper.

#### Scenario: Command-capable tool and Adapter are selected
- **WHEN** one command-capable tool uses `both` with `zotero-library`
- **THEN** it receives one Navigate Skill, one Navigate wrapper, and seven Zotero Skills

#### Scenario: Skills-only tool and Adapter are selected
- **WHEN** one Skill-only tool uses `commands` with `zotero-library`
- **THEN** it receives the fallback Navigate Skill and seven Zotero Skills
