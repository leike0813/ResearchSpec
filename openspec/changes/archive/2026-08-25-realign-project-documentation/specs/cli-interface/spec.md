## ADDED Requirements

### Requirement: Generated CLI Documentation Has One Durable Owner

The typed command and payload catalogs SHALL generate the canonical handbook at `docs/user/cli-handbook.md`. Package verification and user-facing links SHALL resolve that path; no second maintained handbook SHALL exist.

#### Scenario: The CLI catalog changes

- **WHEN** command or payload metadata changes
- **THEN** the handbook check compares the generated content with `docs/user/cli-handbook.md`
- **AND** documentation navigation points to that file
