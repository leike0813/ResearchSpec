## ADDED Requirements

### Requirement: Minimal User-Visible Skill Surface
ResearchSpec SHALL target exactly four ARSU Skills and four ResearchSpec Companion Skills as the user-visible agent capability surface.

#### Scenario: ARSU semantic Skills are exposed
- **WHEN** ResearchSpec projects its target Skill set to a supported agent tool
- **THEN** it SHALL expose `deep-research`, `academic-paper`, `academic-paper-reviewer`, and `academic-pipeline`

#### Scenario: Companion intents are exposed
- **WHEN** ResearchSpec projects its target Companion set
- **THEN** it SHALL expose `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, and `researchspec-verify`

#### Scenario: Transaction helpers do not become Companions
- **WHEN** an Agent needs checking, candidate submit, context packaging, or archive primitives
- **THEN** it SHALL use the CLI directly or through Navigate orchestration
- **AND** the system SHALL NOT require separate Check, Submit, Context, Next, Explore, or Archive Companion products

### Requirement: Minimal CLI Surface
ResearchSpec SHALL target fifteen top-level CLI commands with lifecycle actions separated from query and governance actions.

#### Scenario: Target command set is projected
- **WHEN** a user or Agent inspects the target CLI surface
- **THEN** it SHALL consist of `init`, `update`, `status`, `instructions`, `start`, `submit`, `advance`, `check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, and `archive`

#### Scenario: Selectors distinguish runtime entities
- **WHEN** `instructions`, `start`, `submit`, or `advance` acts on a runtime entity
- **THEN** the command SHALL use a canonical selector namespace rather than adding entity-specific top-level commands

### Requirement: Adapter Delivery Does Not Define Product Capabilities
ResearchSpec SHALL treat command wrappers as thin tool adapters and SHALL keep Skill/command delivery counts derived from the eight target Skills.

#### Scenario: Target delivery matrix is generated
- **WHEN** target agent assets are projected to the supported tool catalog
- **THEN** all 31 tools SHALL receive 8 Skills
- **AND** the 28 command-capable tools SHALL receive 8 thin command wrappers

#### Scenario: Wrapper does not own workflow semantics
- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine
