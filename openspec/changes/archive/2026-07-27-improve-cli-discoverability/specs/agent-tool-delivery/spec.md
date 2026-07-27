## ADDED Requirements

### Requirement: Navigate CLI Handbook Reference Delivery

ResearchSpec SHALL project the generated CLI handbook as an optional
manifest-owned reference inside every selected tool's
`researchspec-navigate` Skill tree. The reference SHALL be produced by the same
renderer that produces the packaged CLI handbook; it SHALL NOT be copied from a
separate hand-maintained command description.

#### Scenario: Selected tool receives Navigate guidance

- **WHEN** any registered tool is selected during init or update
- **THEN** its `researchspec-navigate` Skill tree SHALL include the generated
  CLI handbook reference at the documented Navigate-local reference path
- **AND** the reference SHALL be recorded as a generated `companion-skill` file
  with normal manifest ownership and SHA-256 evidence
- **AND** no other Companion is required to carry the reference

#### Scenario: Handbook reference has drifted

- **WHEN** init or update finds that a manifest-owned Navigate handbook
  reference differs from its recorded bytes
- **THEN** it SHALL preserve and report that file under the existing generated
  file drift policy
- **AND** `--force` MAY refresh the desired generated reference
- **AND** a missing or drifted optional reference SHALL NOT prevent delivery of
  the Navigate core `SKILL.md` or the remaining fixed Skill surface

#### Scenario: Reference delivery does not expand the agent surface

- **WHEN** the Navigate handbook reference is projected to selected tools
- **THEN** every tool SHALL still receive exactly the fixed fifteen Skills
- **AND** every command-capable tool SHALL still receive exactly the eight base
  ARSU and Companion wrappers
- **AND** the handbook reference SHALL NOT create a new Skill, command wrapper,
  public CLI command, or Literature Adapter projection
