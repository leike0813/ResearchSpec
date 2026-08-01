## MODIFIED Requirements

### Requirement: Universal ARSU profile covers every supported route
The converter SHALL publish one `academic-pipeline` project profile covering the pipeline entries,
children, dependencies, parallel/join policies, Gates, branches, transitions, override policy and
dynamic revision-round template required by supported pipeline routes.

#### Scenario: Profile coverage is checked
- **WHEN** converter validation examines every supported pipeline entry and child route
- **THEN** each has one profile node with all declared formal boundaries

### Requirement: Workflow data has a single converter-owned source
The converter workflow source SHALL be the only authored source for the project pipeline profile;
the workspace YAML SHALL be a manifest-owned static projection.

#### Scenario: Project profile drifts
- **WHEN** update detects modified projected bytes
- **THEN** it reports drift and preserves the file unless `--force` is explicit

## REMOVED Requirements

### Requirement: Profile Authority And Playbook Are Separate
**Reason**: The current project profile does not use adaptive playbooks or case profiles.
**Migration**: Encode only the visible pipeline graph in the current converter-owned profile.

### Requirement: Strict Profiles Preserve Process Guarantees
**Reason**: Strict/adaptive profile modes are removed.
**Migration**: Formal Gates and graph rules are expressed directly in `academic-pipeline`.

