## MODIFIED Requirements

### Requirement: Current Workspace Contract

ResearchSpec SHALL recognize only schema `"2"` workspaces whose managed files follow the current
stable-spec, graph-profile, run, node, handoff and change layout. A current workspace contains
`config.yaml`, an installation manifest, four stable specs, projected graph profiles, run instance
files under `runs/<run-id>/`, node instance files under `runs/<run-id>/nodes/`, run handoffs, and
project changes.

#### Scenario: Fresh workspace is initialized

- **WHEN** a user initializes an empty project
- **THEN** ResearchSpec creates only config, manifest, stable spec skeletons, projected graph profiles,
  changes and empty runs root
- **AND** it does not create runs, registries, ledgers, receipts, playbooks or draft-patches until a
  run is explicitly confirmed

#### Scenario: Old or unknown workspace is encountered

- **WHEN** discovery finds schema `"1"`, subflow controls or another unsupported marker
- **THEN** ResearchSpec reports an unsupported workspace without compatibility parsing or writes

### Requirement: Current Workspace Index Is Derived

ResearchSpec SHALL derive status and validation views by scanning current stable specs, graph profiles,
run files, node files, handoffs and changes without persisting an index or history projection.

#### Scenario: Workspace is inspected

- **WHEN** status, check or doctor scans a current workspace
- **THEN** no project file is created or modified
- **AND** duplicate machine IDs, unsafe paths and symlinked managed entries are diagnosed
- **AND** run/node relationships are derived from owning files, never from a hidden index

## ADDED Requirements

### Requirement: Graph Profiles Are Current Project Authority

Projected graph profiles SHALL be the only authored source of executable workflow structure. Status,
instructions and advance SHALL derive legal actions from profiles and run/node files, and no Skill or
Agent surface SHALL add a second workflow authority.

#### Scenario: Profile is missing or drifted

- **WHEN** a current workspace lacks a projected profile or its bytes differ from the manifest-owned
  source
- **THEN** update reports drift and preserves the file unless `--force` is explicit

#### Scenario: Profile is not runtime state

- **WHEN** an Agent edits a projected profile to change an active run
- **THEN** the active run keeps its frozen graph and status reports the drift without applying the
  edit to the run
