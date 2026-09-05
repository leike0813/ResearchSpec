## ADDED Requirements

### Requirement: Plugin lifecycle validates managed target boundaries

Plugin install, update and uninstall SHALL enforce the shared managed-installation path and filesystem boundary rules for raw Skills, extension capabilities and extension profiles. Validation SHALL occur before target hash reads and removal planning, including for records whose source is no longer admitted by the current registry. A valid content hash SHALL NOT substitute for target authorization.

#### Scenario: Unavailable plugin can be retired within its namespace
- **WHEN** an unavailable plugin has valid saved ownership records for regular files inside its tool and source namespace
- **THEN** uninstall can retire hash-clean project projections under the existing selection and drift rules

#### Scenario: Plugin profile record claims an ordinary file
- **WHEN** a plugin-profile record points outside its corresponding profile destination
- **THEN** lifecycle planning returns a blocking diagnostic and produces no removal for that record
- **AND** the lifecycle mutation preserves config, manifest and projected files
