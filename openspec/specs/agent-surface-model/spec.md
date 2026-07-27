## Purpose

Define the minimal user-visible ARSU, Companion, CLI, and adapter-delivery surface.

## Requirements

### Requirement: Minimal User-Visible Skill Surface

ResearchSpec SHALL target exactly four ARSU Skills, four ResearchSpec Companion
Skills, and seven fixed Zotero Adapter Skills as the base Agent capability
surface, with optional domain plugin Skills kept as a distinct registry-driven
extension.

#### Scenario: ARSU semantic Skills are exposed

- **WHEN** ResearchSpec projects its target Skill set to a supported Agent tool
- **THEN** it SHALL expose `deep-research`, `academic-paper`,
  `academic-paper-reviewer`, and `academic-pipeline`

#### Scenario: Companion intents are exposed

- **WHEN** ResearchSpec projects its target Companion set
- **THEN** it SHALL expose `researchspec-navigate`,
  `researchspec-propose`, `researchspec-decide`, and `researchspec-verify`

#### Scenario: Literature Adapter Skills are exposed

- **WHEN** ResearchSpec projects its fixed Skill set to a supported Agent tool
- **THEN** it SHALL expose `zotero-library-agent`, `zotero-library-query`,
  `zotero-literature-acquisition`, `zotero-literature-analysis`,
  `zotero-research-synthesis`, `zotero-library-curation`, and
  `zotero-bridge-cli`
- **AND** role and visibility SHALL distinguish router, task and mechanism
  discovery

#### Scenario: Optional domain Skills do not redefine the base surface

- **WHEN** one or more domain plugins are selected
- **THEN** their Skills SHALL be added from the plugin registry
- **AND** fixed ARSU, Companion and Literature Adapter membership SHALL remain
  unchanged

#### Scenario: Transaction helpers do not become Companions

- **WHEN** an Agent needs checking, submission, recovery, context packaging or
  archive primitives
- **THEN** it SHALL use the CLI directly or through Navigate orchestration
- **AND** the system SHALL NOT require additional Companion products

### Requirement: Minimal CLI Surface

ResearchSpec SHALL target seventeen top-level CLI commands with recovery,
plugin lifecycle, workflow query and governance actions kept explicit.

#### Scenario: Target command set is projected

- **WHEN** a user or Agent inspects the target CLI surface
- **THEN** it SHALL consist of `init`, `update`, `status`, `instructions`,
  `start`, `submit`, `advance`, `check`, `doctor`, `list`, `show`, `handoff`,
  `pack`, `propose`, `decide`, `archive`, and `plugin`

#### Scenario: Selectors distinguish runtime entities

- **WHEN** an existing command acts on a runtime entity
- **THEN** it SHALL use a canonical selector namespace rather than adding
  entity-specific top-level commands

### Requirement: Adapter Delivery Does Not Define Product Capabilities
ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the fixed fifteen-Skill surface from four ARSU, four Companion, and seven fixed Zotero Adapter Skills, and derive optional Skill projections independently from the plugin registry.

#### Scenario: Target delivery matrix is generated
- **WHEN** target agent assets are projected to the supported tool catalog
- **THEN** all 31 tools SHALL receive 15 fixed Skills plus any selected plugin Skills
- **AND** the 28 command-capable tools SHALL receive exactly 8 thin command wrappers

#### Scenario: Wrapper does not own workflow semantics
- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface
Dependency-resolved domain Skills SHALL remain optional additions to the exact four ARSU, four Companion, and seven fixed Zotero Adapter Skill base surface and SHALL NOT add command wrappers.

#### Scenario: Domain installation preserves wrapper frontier
- **WHEN** any combination of domains is installed
- **THEN** all supported tools SHALL retain exactly the fifteen fixed base Skills and optional resolved domain Skills
- **AND** command-capable tools SHALL retain exactly eight fixed wrappers

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard
dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool is selected

- **WHEN** one of the 28 command-capable tools is installed
- **THEN** it SHALL receive fifteen fixed Skills and exactly eight ResearchSpec
  wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather
  than a ninth wrapper

#### Scenario: Skills-only tool is selected

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** it SHALL receive all fifteen fixed Skills
- **AND** command absence SHALL remain a non-blocking diagnostic

### Requirement: Adapter Runtime Metadata Is Delivered Statically

Each projected Zotero Skill SHALL retain its admitted `runner.json` and
`output.schema.json` when present, with ownership and hashes managed like other
generated Skill files.

#### Scenario: Projected runner has drifted

- **WHEN** a projected runner differs from its recorded bytes
- **THEN** update SHALL preserve the user-modified file under the common drift
  policy
- **AND** it SHALL report degraded projection without executing the file
