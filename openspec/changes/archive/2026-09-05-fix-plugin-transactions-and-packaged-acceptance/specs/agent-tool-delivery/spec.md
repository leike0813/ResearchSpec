## ADDED Requirements

### Requirement: Plugin selection and ownership share the projection transaction

Plugin installation, update and uninstall SHALL commit their selected domains, generated files and ownership manifest within one failure-handling boundary, with the manifest committed last. They SHALL validate the config and manifest snapshots used to plan the operation, including unchanged snapshots. Existing ownership, drift and trusted-path protections SHALL apply throughout commit and rollback.

#### Scenario: Planning snapshots change before commit

- **WHEN** config or manifest bytes change after a plugin operation reads them and before its commit preflight
- **THEN** the operation SHALL report a conflict before changing projected files
- **AND** it SHALL preserve the concurrent edits, including when the operation did not plan to rewrite that snapshot

#### Scenario: A plugin commit fails

- **WHEN** a caught commit failure occurs after plugin changes have begun and paths remain safe to restore
- **THEN** projected files, selection and ownership SHALL be restored together to their pre-commit bytes and existence
- **AND** the command SHALL report failure

#### Scenario: A plugin commit succeeds

- **WHEN** the plugin operation succeeds
- **THEN** selected domains, projected files and the final ownership manifest SHALL describe the same committed selection
- **AND** manifest ownership and drift rules SHALL preserve shared and user-modified files

#### Scenario: Transaction guarantees are described

- **WHEN** developer documentation explains plugin consistency
- **THEN** it SHALL distinguish caught-error rollback and snapshot conflict detection from cross-file crash atomicity or cross-process locking

#### Scenario: Only some selected domains are updated

- **WHEN** the user requests an update for a subset of installed domains
- **THEN** the operation SHALL retain the complete selected-domain projection and ownership closure
- **AND** forced refresh SHALL be limited to resources resolved by the requested domains, preserving unrelated user edits
