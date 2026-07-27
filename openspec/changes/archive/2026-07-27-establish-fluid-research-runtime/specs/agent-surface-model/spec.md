## MODIFIED Requirements

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

