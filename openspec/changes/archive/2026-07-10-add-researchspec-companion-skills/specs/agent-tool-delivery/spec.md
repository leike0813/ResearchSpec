## ADDED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected tool SHALL receive generated copies of all eight canonical
ResearchSpec companion skills at its registered project-local skill root.

#### Scenario: Every tool receives self-contained companion skills

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive `researchspec-explore`, `researchspec-propose`,
  `researchspec-check`, `researchspec-verify`, `researchspec-next`,
  `researchspec-context`, `researchspec-decide`, and `researchspec-archive`
- **AND** each installed companion SHALL contain one self-contained `SKILL.md`
- **AND** all files SHALL participate in the existing installation manifest,
  hashing, drift protection, force refresh, and stale cleanup rules

#### Scenario: Obsolete generated references are cleaned safely

- **WHEN** an installed `references/cli-discipline.md` is manifest-owned but no
  longer desired
- **THEN** update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified reference SHALL be preserved and reported as generated drift

## MODIFIED Requirements

### Requirement: Capability-Aware Command Delivery

ResearchSpec SHALL render typed ARSU and companion wrapper intents through the
registered tool-specific command format without conflating their metadata or
installed skill IDs.

#### Scenario: Command-capable tools receive both wrapper families

- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for the four ARSU skill groups and all eight
  ResearchSpec companion skills at the registered command paths and syntax
- **AND** each companion wrapper SHALL route to its installed skill instead of
  duplicating the workflow
- **AND** companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its ARSU and all eight companion skills SHALL be installed
- **AND** the CLI SHALL report a non-blocking `commands_not_supported`
  diagnostic instead of inventing a command format
