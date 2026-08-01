## MODIFIED Requirements

### Requirement: Auto-Generated CLI Command Reference
The documentation generator SHALL derive a bilingual reference for exactly sixteen current top-level
commands and their current selector and option contracts.

#### Scenario: Documentation drift is checked
- **WHEN** generated CLI documentation differs from the command catalog
- **THEN** documentation checking fails without rewriting the checked-in file

### Requirement: User-Facing Documentation Content
Current documentation SHALL describe the hard-cut workspace, stable specs, project profile,
per-subflow controls, handoffs and project changes without presenting removed runtime behavior as
supported.

#### Scenario: User reads lifecycle guidance
- **WHEN** documentation describes init, update, resume, verification or export
- **THEN** it uses the same current contract and sixteen-command surface as the packaged CLI

