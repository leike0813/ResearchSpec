## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery
Every selected tool SHALL receive generated copies of all four canonical ResearchSpec Companion Skills together with the fixed ARSU and Literature Adapter Skills at its registered project-local Skill root.

#### Scenario: Every tool receives the target ten-Skill surface
- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive four ARSU Skills, `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, `researchspec-verify`, `zotero-library-agent`, and `zotero-bridge-cli`
- **AND** each installed Companion SHALL contain one self-contained `SKILL.md`
- **AND** desired projection counts SHALL be derived from the ARSU, Companion, and Literature Adapter catalogs rather than a second member list

#### Scenario: Obsolete generated projections are cleaned safely
- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Capability-Aware Command Delivery
ResearchSpec SHALL render typed ARSU and Companion wrapper intents through the registered tool-specific command format without creating wrappers for Literature Adapter Skills or conflating metadata and installed Skill IDs.

#### Scenario: Command-capable tools receive the target eight-wrapper surface
- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for four ARSU Skills and four Companion Skills at the registered command paths and syntax
- **AND** it SHALL receive no wrapper for either Literature Adapter Skill
- **AND** each Companion wrapper SHALL route to its installed Skill instead of duplicating the workflow
- **AND** Companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking
- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its four ARSU, four Companion, and two Literature Adapter Skills SHALL be installed
- **AND** the CLI SHALL report a non-blocking `commands_not_supported` diagnostic instead of inventing a command format

### Requirement: Local Selection And Ownership Facts
ResearchSpec SHALL store selected tool intent in `researchspec/config.yaml` and all generated ownership evidence in the strict current-state `tool-installation-manifest.json` schema version `1`.

#### Scenario: Successful writes update the manifest last
- **WHEN** tool or literature-adapter files are installed or refreshed
- **THEN** the manifest SHALL record only successful paths through structured owner, source, target, executable, and SHA-256 evidence
- **AND** it SHALL record completed literature-adapter resolutions separately
- **AND** it SHALL be committed after generated files

#### Scenario: Previous development manifest shape is read
- **WHEN** the manifest contains a flat installation source or `adapter_version`
- **THEN** validation SHALL reject it as invalid schema version `1` content
- **AND** ResearchSpec SHALL NOT migrate, dual-write, or interpret the legacy shape

### Requirement: Installed Skill License Retention
ResearchSpec SHALL deliver applicable license and attribution files with every independently copied ARSU, Companion, and Literature Adapter Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed
- **WHEN** a selected tool receives an ARSU Skill tree
- **THEN** the tree SHALL include the converter-owned CC BY-NC 4.0 license and upstream attribution notice
- **AND** those files SHALL be recorded and reconciled through the normal installation manifest

#### Scenario: Companion Skill is installed
- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** the license file SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`

#### Scenario: Literature Adapter Skill is installed
- **WHEN** a selected tool receives a Zotero Adapter Skill
- **THEN** its approved AGPL-3.0 license, notice, and derivation evidence SHALL be delivered with the complete tree
- **AND** those files SHALL use the same managed ownership and drift rules

### Requirement: Plugin Projection Ownership Evidence
Plugin projection SHALL reuse the structured managed-installation manifest and record its domain, vendor release, Skill ID, Agent-tool owner, target path, executable contract, and SHA-256 without altering literature-adapter resolutions.

#### Scenario: Plugin writes commit manifest last
- **WHEN** plugin files are installed or refreshed successfully
- **THEN** their structured source SHALL identify the owning domain/vendor Skill and their owner SHALL identify the target Agent tool
- **AND** the manifest SHALL be committed after the resource writes
- **AND** existing literature-adapter installations and resolutions SHALL be preserved

