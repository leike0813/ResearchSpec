## MODIFIED Requirements

### Requirement: Complete ARSU Skill Delivery

ARSU workflow packages SHALL remain bundled and available to procedure activation but SHALL NOT be copied to selected Agent Skill roots.

#### Scenario: Agent delivery is planned
- **WHEN** a tool installation is reconciled
- **THEN** no ARSU workflow package becomes a host-visible Skill entry

#### Scenario: Skill trees are installed recursively
- **WHEN** an ARSU procedure is activated
- **THEN** its complete bundled tree remains available inside the ResearchSpec package without host-root projection

### Requirement: Complete Companion Skill Delivery

Every selected Agent host SHALL receive only the Navigate Companion for Skill delivery. Propose, Decide, Verify, and the CLI handbook SHALL remain bundled on-demand procedures.

#### Scenario: Every tool receives the base surface
- **WHEN** a registered Skill-capable tool is selected
- **THEN** its base Skill tree contains `researchspec-navigate` and no other Companion

#### Scenario: Every tool receives the fixed base surface
- **WHEN** a registered tool receives Skill delivery
- **THEN** its fixed base surface is the single Navigate Skill

#### Scenario: Selected Adapter reaches every tool
- **WHEN** `zotero-library` and Agent tools are selected
- **THEN** all seven Adapter Skills are projected through normal managed ownership

#### Scenario: Obsolete generated projections are cleaned safely
- **WHEN** a previously managed ARSU, hidden Companion, core capability, plugin Skill, or obsolete wrapper is no longer desired
- **THEN** reconciliation removes it only when its bytes match the recorded hash
- **AND** preserves and diagnoses modified files under the existing drift policy

### Requirement: Capability-Aware Command Delivery

Each command-capable tool SHALL receive one Navigate wrapper when delivery includes commands. Skill-only tools SHALL receive a Navigate Skill fallback in commands mode and report a non-blocking command-capability diagnostic.

#### Scenario: Commands delivery follows tool capability
- **WHEN** `commands` selects one command-capable tool and one Skill-only tool
- **THEN** the first receives one Navigate wrapper and the second receives one Navigate Skill

### Requirement: Optional Plugin Skill Delivery

Domain plugin selection SHALL retain resolution snapshots, package availability, graph profiles, and managed configuration without projecting raw vendor Skills or extension capability packages to Agent roots.

#### Scenario: Domain is selected
- **WHEN** one or more available non-empty domains are installed
- **THEN** no plugin Skill files are added to any configured Agent root
- **AND** their procedures become activation-eligible through the package registry

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** available domains are selected
- **THEN** plugin procedures become eligible without writing to Agent Skill roots

#### Scenario: New tool receives prior selections
- **WHEN** a tool is added after domains were selected
- **THEN** domain selection remains available through procedure activation without new plugin projections

#### Scenario: Unavailable selection blocks refresh
- **WHEN** a selected domain is missing or empty
- **THEN** its last resolution snapshot is retained and its procedures are not activation-eligible

### Requirement: Plugin Delivery Adds No Wrappers

Optional plugin procedures SHALL NOT create tool command wrappers or Skill entries.

#### Scenario: Command-capable tool has selected domains
- **WHEN** selected plugins are available to a command-capable host
- **THEN** the host retains only its one Navigate wrapper for command delivery

#### Scenario: Command-capable tool receives plugins
- **WHEN** selected plugin procedures are available to a command-capable tool
- **THEN** the tool still receives only its one Navigate wrapper

### Requirement: Independent CLI Handbook Skill Delivery

The CLI handbook SHALL be an on-demand Companion procedure and SHALL NOT be delivered as an independent host-visible Skill.

#### Scenario: Handbook help is requested
- **WHEN** Navigate needs detailed CLI payload guidance
- **THEN** it activates the bundled CLI handbook procedure through the same procedure instruction API

#### Scenario: Selected tool receives the handbook Skill
- **WHEN** a selected tool receives Skill delivery
- **THEN** the handbook remains hidden and Navigate is the only projected Companion Skill

#### Scenario: Handbook Skill has drifted
- **WHEN** an obsolete managed handbook projection differs from its recorded bytes
- **THEN** update preserves and diagnoses it under the common drift policy

### Requirement: Core Capability And Profile Projections Share Managed Ownership

Graph profiles SHALL remain project-level managed projections. Core capability packages SHALL remain bundled runtime inputs and SHALL NOT be projected to Agent Skill roots.

#### Scenario: Core projection succeeds
- **WHEN** bootstrap reconciliation succeeds
- **THEN** every framework profile is managed in the workspace and no core capability Skill is copied to an Agent root

#### Scenario: Re-init encounters a modified capability Skill
- **WHEN** an obsolete managed capability projection differs from its recorded bytes
- **THEN** re-init preserves and diagnoses it rather than deleting it

### Requirement: Delivery Modes

`config.yaml.agent_tools.delivery` SHALL remain `skills`, `commands`, or `both`. New workspaces SHALL default to `skills`; existing values SHALL be preserved unless explicitly changed.

#### Scenario: Delivery mode is planned
- **WHEN** a selected host supports Skills and commands
- **THEN** `skills` plans one Navigate Skill, `commands` plans one Navigate wrapper, and `both` plans one of each

#### Scenario: Command-only delivery targets a Skill-only host
- **WHEN** `commands` selects a host without command support
- **THEN** the host receives one Navigate Skill fallback without changing configured delivery intent

#### Scenario: Commands-only keeps Codex Skills
- **WHEN** a workspace uses `commands` delivery with Codex
- **THEN** Codex receives the Navigate Skill in `.agents/skills` and no custom prompt target
