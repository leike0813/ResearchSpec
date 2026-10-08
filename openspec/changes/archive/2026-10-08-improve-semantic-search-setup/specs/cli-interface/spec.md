## ADDED Requirements

### Requirement: Doctor Exposes Shared Search Cache Maintenance

The CLI SHALL expose workspace-independent `doctor search-cache` read-only inspection and explicit `--clear` maintenance without adding a top-level command. Inspection SHALL report the cache root, managed entries, total bytes and retained paths. JSON SHALL use the existing doctor envelope. Interactive clearing SHALL disclose shared-project impact and default to refusal; non-interactive clearing SHALL require `--yes`.

#### Scenario: Cache is inspected outside a workspace
- **WHEN** a caller runs `doctor search-cache --json` from an ordinary directory
- **THEN** it returns a single doctor envelope describing the shared cache without installing, loading, downloading or writing anything

#### Scenario: Clearing lacks confirmation
- **WHEN** a non-interactive caller requests `doctor search-cache --clear` without `--yes`
- **THEN** it returns a stable confirmation-required error and leaves the cache unchanged

#### Scenario: Clearing is confirmed
- **WHEN** a user confirms the preview or supplies `--clear --yes`
- **THEN** the command clears only the managed search cache and reports completed and unfinished deletions
- **AND** no project preference or workflow state changes

#### Scenario: Clearing is declined
- **WHEN** the user declines the default-negative clearing confirmation
- **THEN** the command reports cancellation without deleting anything

#### Scenario: Cache is absent
- **WHEN** a caller inspects or confirms clearing an absent cache
- **THEN** it reports an empty cache without creating its directory

#### Scenario: Clearing is previewed
- **WHEN** a caller supplies `--clear --dry-run`
- **THEN** it reports the deletion plan without requiring confirmation or modifying files
