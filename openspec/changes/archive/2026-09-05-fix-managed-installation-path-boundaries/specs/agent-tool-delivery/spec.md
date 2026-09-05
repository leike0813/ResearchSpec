## ADDED Requirements

### Requirement: Managed installation targets are bounded by their provenance

ResearchSpec SHALL validate each installation target against its scope, owner, source namespace and registered tool or Adapter destination before reading target contents as ownership evidence. Project targets SHALL be canonical nonempty POSIX relative file paths without traversal, absolute paths, drive prefixes, backslashes, NUL or empty segments. Framework and plugin profiles SHALL target the corresponding `researchspec/profiles/<profile_id>.yaml`. Agent resources SHALL remain inside the corresponding tool and source package namespace; commands and markers SHALL use their defined destinations. Shared-global targets SHALL use the owning tool's defined global namespace, and workspace reconciliation SHALL NOT remove shared-global Skill files.

#### Scenario: Matching hash does not authorize an escaped target
- **WHEN** a manifest claims a project-external path or a file outside its source namespace with a matching hash
- **THEN** ResearchSpec reports a blocking diagnostic before reading its contents or planning removal
- **AND** the referenced file remains unchanged

#### Scenario: Valid profiles and global Skills remain supported
- **WHEN** a manifest identifies a correctly located profile or MiniMax global Skill resource
- **THEN** its path passes the corresponding target rules
- **AND** deselection preserves shared-global Skill files

### Requirement: Unsafe manifests do not authorize mutations

An existing malformed, non-regular, symlinked or unsafe installation manifest SHALL block init, update and plugin lifecycle mutations before config, manifest or projection writes. Missing manifests SHALL remain distinguishable from invalid manifests. Read-only inspection SHALL report the invalid contract without repairing it.

#### Scenario: Invalid manifest is not replaced by empty ownership
- **WHEN** a mutation encounters an existing invalid installation manifest
- **THEN** it fails with a structured blocking diagnostic
- **AND** config, manifest and projection bytes remain unchanged even with force authorization

### Requirement: Managed filesystem operations reject symlink components

ResearchSpec SHALL check managed paths against trusted roots before planning reads and before executing writes, moves or removals. Every descendant component, including the projection root and target, SHALL be free of symbolic links; the trusted project root itself MAY resolve through a symbolic link. Execution SHALL recheck the boundary after planning and SHALL apply the same boundary to temporary files, backups, cleanup and rollback.

#### Scenario: Parent directory redirects a projection
- **WHEN** a target or descendant ancestor is a symbolic link, including one pointing within the permitted root
- **THEN** the operation is blocked without following that link to read or mutate projected content

#### Scenario: Parent changes after planning
- **WHEN** a parent directory becomes a symbolic link between planning and execution
- **THEN** execution rejects the operation
- **AND** cleanup and rollback do not modify files through that link
