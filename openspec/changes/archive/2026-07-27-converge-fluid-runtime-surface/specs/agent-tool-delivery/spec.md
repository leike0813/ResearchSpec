## MODIFIED Requirements

### Requirement: Capability-Aware Command Delivery

ResearchSpec SHALL render typed ARSU and Companion wrapper intents through the
registered tool-specific command format without creating wrappers for Literature
Adapter Skills or conflating metadata and installed Skill IDs.

#### Scenario: Command-capable tools receive the target eight-wrapper surface

- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for four ARSU Skills and four Companion Skills
  at the registered command paths and syntax
- **AND** it SHALL receive no wrapper for any fixed Zotero Adapter Skill
- **AND** each Companion wrapper SHALL route to its installed Skill instead of
  duplicating the workflow
- **AND** Companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its four ARSU, four Companion, and seven fixed Zotero Adapter Skills
  SHALL be installed
- **AND** the CLI SHALL report a non-blocking `commands_not_supported`
  diagnostic instead of inventing a command format
