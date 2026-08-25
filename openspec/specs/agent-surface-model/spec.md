## Purpose

Define the minimal user-visible ARSU, Companion, CLI, and adapter-delivery surface.

## Requirements

### Requirement: Minimal User-Visible Skill Surface

The fixed base surface SHALL contain four ARSU Skills, five Companion Skills and every package registered in the bundled capability registry. Selecting the seven-Skill Zotero Adapter SHALL add those seven Skills. Command-capable tools SHALL continue to receive exactly sixteen wrappers when commands are selected.

#### Scenario: Default surface is projected

- **WHEN** a tool is selected without an optional literature Adapter
- **THEN** it receives four ARSU Skills, five Companion Skills and all currently registered capability packages
- **AND** the expected count is derived from those registries rather than a duplicated literal

#### Scenario: Zotero Adapter is selected

- **WHEN** the workspace selects `zotero-library`
- **THEN** its seven catalog-owned Skills SHALL be added to each selected Agent host

### Requirement: Minimal CLI Surface
The product SHALL expose exactly sixteen top-level CLI capabilities and SHALL NOT create another
command for a low-level control transaction.

#### Scenario: Command-capable tool is projected
- **WHEN** ResearchSpec installs command wrappers
- **THEN** the wrapper set reflects the sixteen-command catalog and excludes `submit`

### Requirement: Adapter Delivery Does Not Define Product Capabilities

ResearchSpec SHALL treat command wrappers as thin tool adapters, derive the fixed base surface from four ARSU Skills, five Companion Skills and the capability registry, and derive optional Zotero and domain Skill projections from their separate catalog-backed selections.

#### Scenario: Target delivery matrix is generated

- **WHEN** target Agent assets are projected to the supported tool catalog
- **THEN** all Skill-capable tools receive the registry-derived fixed base surface plus selected optional Skills
- **AND** the 28 command-capable tools SHALL receive exactly sixteen thin command wrappers when delivery includes commands

#### Scenario: Wrapper does not own workflow semantics
- **WHEN** a command wrapper invokes a Skill
- **THEN** the wrapper SHALL delegate to the corresponding Skill or CLI protocol
- **AND** it SHALL NOT introduce an independent product capability or state machine

### Requirement: Optional Domain Skills Do Not Expand Fixed Base Surface

Dependency-resolved domain Skills and selected literature Adapter Skills SHALL remain optional additions to the registry-derived fixed base surface and SHALL NOT add command wrappers.

#### Scenario: Optional installation preserves wrapper frontier

- **WHEN** any combination of domains and literature Adapters is selected
- **THEN** supported tools retain the registry-derived fixed base Skills plus selected optional Skills
- **AND** command-capable tools SHALL retain exactly sixteen fixed wrappers

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard
dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool receives the registry-derived fixed base surface plus seven Adapter Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** a Skill-only tool and `zotero-library` are selected
- **THEN** the tool receives the registry-derived fixed base surface plus all seven Adapter Skills
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

### Requirement: Fixed Surface
The public catalog SHALL expose 37 tools, of which 28 have command adapters and the remainder are Skill-only. The command matrix SHALL use current Devin, ZCode, Qwen, CodeArts, Hermes, Rovo Dev, MiniMax, and shared `.agents` paths.

#### Scenario: Capability matrix is exact
- **WHEN** the registry is loaded
- **THEN** it SHALL contain 37 unique IDs and exactly 28 command-backed definitions

### Requirement: Shared Writer
Selecting Codex and `agents` together SHALL generate one shared Skill tree and SHALL not duplicate writes or manifest entries.

#### Scenario: Codex owns the shared projection
- **WHEN** Codex and `agents` are selected for Skill delivery
- **THEN** the planner SHALL emit one physical Skill tree with a ResearchSpec target marker
