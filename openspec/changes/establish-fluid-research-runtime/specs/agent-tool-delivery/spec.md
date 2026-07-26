## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected tool SHALL receive generated copies of all four canonical
ResearchSpec Companion Skills together with the fixed ARSU and seven-Skill
Literature Adapter surface at its registered project-local Skill root.

#### Scenario: Every tool receives the target fifteen-Skill surface

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive four ARSU Skills, `researchspec-navigate`,
  `researchspec-propose`, `researchspec-decide`, `researchspec-verify`, and the
  seven fixed Zotero Adapter Skills
- **AND** desired projection counts and files SHALL be derived from the ARSU,
  Companion and Literature Adapter catalogs rather than a second member list

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the
  recorded hash
- **AND** a modified file SHALL be preserved, reported as
  `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

## ADDED Requirements

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

