## Purpose

Define the minimal user-visible ARSU, Companion, CLI, and adapter-delivery surface.

## Requirements

### Requirement: Minimal User-Visible Skill Surface
ResearchSpec SHALL target exactly four ARSU Skills and four ResearchSpec Companion Skills as the fixed base agent capability surface, with optional domain plugin Skills kept as a distinct registry-driven extension.

#### Scenario: ARSU semantic Skills are exposed
- **WHEN** ResearchSpec projects its target Skill set to a supported agent tool
- **THEN** it SHALL expose `deep-research`, `academic-paper`, `academic-paper-reviewer`, and `academic-pipeline`

#### Scenario: Companion intents are exposed
- **WHEN** ResearchSpec projects its target Companion set
- **THEN** it SHALL expose `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, and `researchspec-verify`

#### Scenario: Optional domain Skills do not redefine the base surface
- **WHEN** one or more domain plugins are selected
- **THEN** their Skills SHALL be added from the plugin registry
- **AND** the fixed ARSU and Companion membership SHALL remain unchanged

#### Scenario: Transaction helpers do not become Companions
- **WHEN** an Agent needs checking, candidate submit, context packaging, or archive primitives
- **THEN** it SHALL use the CLI directly or through Navigate orchestration
- **AND** the system SHALL NOT require separate Check, Submit, Context, Next, Explore, or Archive Companion products

### Requirement: Minimal CLI Surface
ResearchSpec SHALL target sixteen top-level CLI commands with plugin catalog lifecycle separated from workflow query and governance actions.

#### Scenario: Target command set is projected
- **WHEN** a user or Agent inspects the target CLI surface
- **THEN** it SHALL consist of `init`, `update`, `status`, `instructions`, `start`, `submit`, `advance`, `check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, `archive`, and `plugin`

#### Scenario: Selectors distinguish runtime entities
- **WHEN** `instructions`, `start`, `submit`, or `advance` acts on a runtime entity
- **THEN** the command SHALL use a canonical selector namespace rather than adding entity-specific top-level commands

### Requirement: Adapter Delivery Does Not Define Product Capabilities
ResearchSpec SHALL treat command wrappers as thin tool adapters, keep base Skill and wrapper counts derived from the eight fixed Skills, and derive optional Skill projections independently from the plugin registry.

#### Scenario: Target delivery matrix is generated
- **WHEN** target agent assets are projected to the supported tool catalog
- **THEN** all 31 tools SHALL receive 8 base Skills plus any selected plugin Skills
- **AND** the 28 command-capable tools SHALL receive exactly 8 thin command wrappers

#### Scenario: Wrapper does not own workflow semantics
- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface
Dependency-resolved domain Skills SHALL remain optional additions to the exact four ARSU and four Companion Skill base surface and SHALL NOT add command wrappers.

#### Scenario: Domain installation preserves wrapper frontier
- **WHEN** any combination of domains is installed
- **THEN** all supported tools SHALL retain exactly the eight fixed base Skills and optional resolved domain Skills
- **AND** command-capable tools SHALL retain exactly eight fixed wrappers
