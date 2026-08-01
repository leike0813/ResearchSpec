## ADDED Requirements

### Requirement: Current Workspace Contract
ResearchSpec SHALL recognize only schema `"1"` workspaces whose managed files follow the current
stable-spec, profile, subflow, handoff and change layout.

#### Scenario: Fresh workspace is initialized
- **WHEN** a user initializes an empty project
- **THEN** ResearchSpec creates only config, manifest, project profile, four stable spec skeletons,
  changes and subflows
- **AND** it does not create runs, registries, ledgers, receipts, playbooks or draft-patches

#### Scenario: Old or unknown workspace is encountered
- **WHEN** discovery finds an unsupported schema or an old control-plane marker
- **THEN** ResearchSpec reports an unsupported workspace without compatibility parsing or writes

### Requirement: Stable Research Specifications
ResearchSpec SHALL provide separate strict contracts for project intent, sources, claims and
manuscript structure while allowing incomplete early-research content.

#### Scenario: Early workspace is checked
- **WHEN** sources and claims are empty and manuscript details are incomplete
- **THEN** validation accepts the skeleton and validates only facts and references that are present

### Requirement: Current Workspace Index Is Derived
ResearchSpec SHALL derive status and validation views by scanning current files without persisting an
index or history projection.

#### Scenario: Workspace is inspected
- **WHEN** status, check or doctor scans a current workspace
- **THEN** no project file is created or modified
- **AND** duplicate machine IDs, unsafe paths and symlinked managed entries are diagnosed

## REMOVED Requirements

### Requirement: Universal Workflow Profile
**Reason**: Strict/adaptive runtime selection is replaced by one project pipeline profile and
standalone route metadata.
**Migration**: Create a fresh current workspace; old profiles are not migrated.

### Requirement: Explicit Runtime Migration
**Reason**: The current contract uses a deliberate hard cut.
**Migration**: Preserve useful materials outside ResearchSpec and reintroduce them explicitly.

### Requirement: Canonical dual-runtime boundary
**Reason**: Current workspaces have one runtime authority model.
**Migration**: No dual-runtime compatibility is provided.

