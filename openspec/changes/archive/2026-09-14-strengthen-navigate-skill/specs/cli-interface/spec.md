## MODIFIED Requirements

### Requirement: Catalog-Backed Static CLI Discovery

The CLI SHALL expose bounded static procedure discovery through `list procedures [--query <text>]`, stable pagination, and `show procedure:<id>` without requiring a workspace. Discovery SHALL read packaged catalogs and files only and SHALL NOT execute procedure content.

#### Scenario: Procedures are listed globally
- **WHEN** a caller runs `list procedures` outside a workspace
- **THEN** the result returns compact cards with total, truncation, and opaque next cursor fields

#### Scenario: Procedure metadata is shown globally
- **WHEN** a caller runs `show procedure:<id>` outside a workspace
- **THEN** the result returns bounded metadata and supported modes without the full procedure body

#### Scenario: Root, command, and plugin help require no workspace
- **WHEN** help is requested for any public command path
- **THEN** catalog-backed usage remains available without workspace discovery or mutation

#### Scenario: Packaged handbook is derived static discovery
- **WHEN** the Navigate Skill tree is rendered
- **THEN** `references/cli-handbook.md` uses the same command and payload catalogs as static help

### Requirement: Static Discovery Does Not Authorize Runtime Actions

Global procedure discovery and generated handbook guidance SHALL remain read-only. `instructions procedure:<id>` SHALL require a current schema `"2"` workspace and SHALL validate plugin-domain selection before returning an executable packet.

#### Scenario: Activation is requested outside a workspace
- **WHEN** a caller requests procedure instructions without a current workspace
- **THEN** the CLI returns a workspace-required diagnostic without writing files

#### Scenario: Handbook precedes a runtime write
- **WHEN** generated handbook guidance leads to a requested graph mutation
- **THEN** the caller must still obtain current status and exact graph instructions

### Requirement: Generated CLI Documentation Has One Durable Owner

The typed command and payload catalogs SHALL generate the canonical handbook at `docs/user/cli-handbook.md` and the byte-identical Navigate reference at `references/cli-handbook.md`. Package verification and user-facing links SHALL resolve those generated projections; no hand-maintained handbook or handbook procedure SHALL exist.

#### Scenario: The CLI catalog changes

- **WHEN** command or payload metadata changes
- **THEN** the handbook check compares generated content with `docs/user/cli-handbook.md`
- **AND** Navigate delivery and package verification compare its local reference with the same generated content
