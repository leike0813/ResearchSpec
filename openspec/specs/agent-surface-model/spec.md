## Purpose

Define the minimal user-visible ARSU, Companion, CLI, and adapter-delivery surface.

## Requirements

### Requirement: Minimal User-Visible Skill Surface
The fixed user-visible surface SHALL contain exactly four ARSU Skills, four Companion Skills and seven
Zotero literature Adapter Skills; optional reviewed domain Skills SHALL remain additive helpers.

#### Scenario: Fixed surface is projected
- **WHEN** a registered Agent host receives ResearchSpec Skills
- **THEN** exactly fifteen fixed Skills are projected before optional domain selections

### Requirement: Minimal CLI Surface
The product SHALL expose exactly sixteen top-level CLI capabilities and SHALL NOT create another
command for a low-level control transaction.

#### Scenario: Command-capable tool is projected
- **WHEN** ResearchSpec installs command wrappers
- **THEN** the wrapper set reflects the sixteen-command catalog and excludes `submit`

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
