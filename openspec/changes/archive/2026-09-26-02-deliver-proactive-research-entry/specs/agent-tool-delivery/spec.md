## ADDED Requirements

### Requirement: Project Research Entry Agreement

Every registered target SHALL describe its documented project-entry mechanism or an explicit discovery-only fallback. Selected targets with a supported mechanism SHALL receive a concise research task agreement independently of skills, commands or both delivery mode. The agreement SHALL reference only delivered entry assets and SHALL NOT add model configuration or runtime permissions.

#### Scenario: Commands mode receives an agreement
- **WHEN** a command-capable host selects commands delivery
- **THEN** its agreement references the delivered Navigate command rather than an absent Navigate Skill

#### Scenario: Commands-only work receives the current Navigate contract
- **WHEN** the selected host receives only the Navigate command entry
- **THEN** that entry exposes the canonical Navigate execution guidance including current continuity and collaboration rules
- **AND** it does not depend on an uninstalled Skill or unavailable Skill-relative reference

#### Scenario: Native rule support is not verified
- **WHEN** a registered target has no reviewed project-rule mapping
- **THEN** it retains its existing discovery entry and reports native-rule support as unverified without writing a guessed rule path

### Requirement: Shared Instruction Regions Preserve User Content

Shared instruction content SHALL be owned by an installation-manifest record identifying a fixed region and its exact bytes. Markers alone SHALL NOT authorize replacement or removal. Updates SHALL preserve bytes outside the owned region and validate the whole-file planning snapshot before writing. Dedicated entry files SHALL retain whole-file ownership.

#### Scenario: User edits outside an owned region
- **WHEN** the user changes shared-file content outside an unchanged owned region before planning
- **THEN** update refreshes only the owned region and preserves the user content

#### Scenario: Optional entry content cannot be safely reconciled
- **WHEN** a safe regular entry file contains modified, malformed or unowned entry content
- **THEN** the content is preserved and a nonblocking diagnostic is returned while other safe projections proceed
- **AND** unsafe paths, symbolic links and invalid manifests remain blocking

#### Scenario: Instruction file changes before commit preflight
- **WHEN** another writer changes the shared file after its snapshot was read and before transaction preflight
- **THEN** the transaction rejects the stale write without replacing the concurrent content

#### Scenario: Shared entry consumers change
- **WHEN** one selected host stops using a shared entry destination while another selected host still requires it
- **THEN** the entry is retained and planned once for the remaining consumers
- **AND** removal of the last consumer removes only unmodified owned content

#### Scenario: Markers lack ownership
- **WHEN** an entry region exists without its manifest record
- **THEN** identical content or force does not authorize adoption, replacement or removal

## MODIFIED Requirements

### Requirement: Safe Reconciliation
Init and update SHALL calculate one ownership-aware plan, migrate known Codex/Kimi legacy trees, remove only unmodified ResearchSpec-owned content, preserve drift and user files, and perform zero writes when any blocking conflict exists. Safe regular-file content conflicts limited to optional project-entry instructions SHALL be nonblocking; invalid ownership manifests and filesystem boundaries SHALL remain blocking.

#### Scenario: Blocking conflict is zero-write
- **WHEN** a planned generated target is a symlink or an unowned conflicting file outside the optional project-entry content exception
- **THEN** init or update SHALL return a blocking diagnostic before changing config, manifest, or any projection

### Requirement: Managed installation targets are bounded by their provenance

ResearchSpec SHALL validate each installation target against its scope, owner, source namespace and registered tool or Adapter destination before reading target contents as ownership evidence. Project targets SHALL be canonical nonempty POSIX relative file paths without traversal, absolute paths, drive prefixes, backslashes, NUL or empty segments. Framework and plugin profiles SHALL target the corresponding researchspec/profiles/<profile_id>.yaml. Agent resources SHALL remain inside the corresponding tool and source package namespace; commands, markers and project-entry instruction files or regions SHALL use their registered destinations. Shared-global Agent targets SHALL be unsupported and rejected before their files are read or removed.

#### Scenario: Matching hash does not authorize an escaped target
- **WHEN** a manifest claims a project-external path or a file outside its source namespace with a matching hash
- **THEN** ResearchSpec reports a blocking diagnostic before reading its contents or planning removal
- **AND** the referenced file remains unchanged

#### Scenario: Valid profiles and global Skills remain supported
- **WHEN** a manifest identifies a correctly located framework or plugin profile or a historical shared-global Agent resource
- **THEN** the profile path passes the corresponding target rules
- **AND** the shared-global Agent record is rejected without reading or removing its target
