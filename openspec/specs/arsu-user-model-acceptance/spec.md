## Purpose
Define black-box acceptance at the packaged CLI and installed Agent surface.

## Requirements

### Requirement: Current User Model Acceptance

Packaged CLI journeys SHALL validate the current schema `"2"` workspace, sixteen-command surface,
registry-derived fixed Skill surface, optional seven-Skill Zotero Adapter and graph-authorized child runs.

#### Scenario: Fresh default journey is exercised

- **WHEN** acceptance starts from an empty project through the packaged CLI without Adapter selection
- **THEN** every authoritative mutation SHALL be performed by a fresh CLI process
- **AND** every graph run and node instance uses only schema `"2"` files and selectors
- **AND** the workspace SHALL contain no `.zotero-bridge` runtime or Adapter Skill projection

#### Scenario: Fresh Zotero journey is exercised

- **WHEN** acceptance initializes with explicit `zotero-library` selection
- **THEN** the selected Agent host SHALL receive all seven Adapter Skills and the project SHALL receive the current-platform runtime and profile template
- **AND** test helpers SHALL not execute Adapter assets or contact Zotero

### Requirement: Hard-Cut Acceptance
Acceptance SHALL prove that old or unknown workspaces are rejected without mutation and without
legacy projection.

#### Scenario: Legacy runtime is presented
- **WHEN** a journey contains old state, registry, ledger, receipt or Passport files
- **THEN** status/check/doctor report unsupported format
- **AND** no command migrates, archives or repairs those files

### Requirement: User journeys expose format intake and final delivery order
The packaged CLI and installed Skills SHALL make format selection part of writing intake, allow QMD writing when Quarto is unavailable, block formatting when probe status is `unavailable` or `unknown`, route formatting before final-integrity, and keep manuscript/rendered files external and excluded from `pack`.

#### Scenario: QMD writing is possible without Quarto
- **WHEN** the user selects QMD and the probe reports `unavailable`
- **THEN** writing may start with the unavailable probe recorded, while the formatting child remains blocked

#### Scenario: Formatting precedes final integrity
- **WHEN** the user follows an accepted review or dynamic revision round
- **THEN** the route summary and frontier require formatting before the final-integrity Gate

#### Scenario: Pack excludes external deliverables
- **WHEN** a workspace contains the QMD source and rendered output outside `researchspec/`
- **THEN** `pack` does not copy or register either file

### Requirement: Packaged mid-entry journeys can start the selected child
Packaged CLI acceptance SHALL cover every declared academic-pipeline mid-entry point and SHALL prove that a confirmed parent exposes only the selected first child-profile node and starts exactly one bound child run without a second run-level confirmation.

#### Scenario: Existing research materials enter at writing
- **WHEN** a packaged CLI journey confirms the academic-pipeline writing entry and starts its eligible child-profile node
- **THEN** exactly one writing child run is frozen at the declared child entry
- **AND** the child records the parent run and graph binding

#### Scenario: Every declared entry is exercised
- **WHEN** acceptance parameterizes academic-pipeline start over all declared entry points
- **THEN** each parent begins at the selected checkpoint and exposes only the corresponding first child
- **AND** revision and re-review entries begin at local round 1

#### Scenario: Existing end-to-end and standalone journeys run
- **WHEN** the packaged acceptance suite exercises end-to-end, formatting, final-integrity and standalone profiles
- **THEN** all work progresses through current node, Gate, Decision and child-run selectors

### Requirement: Canonical User Model Matches The Graph Product

The canonical user model SHALL explain ResearchSpec as a file-based capability-graph control plane.
It SHALL cover initialization, dialogue routing, route-bound entry summaries, root-run confirmation,
inherited child-run authorization, separate Gate and Decision confirmations, capability execution,
delivery snapshots, resume, static health, plugins, Adapters, and bounded export.

#### Scenario: A new user reads the mental model

- **WHEN** they need to understand how work begins and advances
- **THEN** the documentation presents one lifecycle from conversation to completion
- **AND** it identifies the file owner and CLI authority at each mutation boundary

#### Scenario: Documentation describes child work

- **WHEN** a profile node binds a child graph
- **THEN** the model states that the child inherits the confirmed frozen parent graph authorization
- **AND** it states that formal child Gates, Decisions, model review, plugin installation, and render
  execution retain their own consent boundaries

### Requirement: Installed pipeline acceptance reaches persisted completion

Release verification SHALL complete an academic-pipeline root and its bound child runs through the installed npm tarball, using fresh public CLI processes for authoritative mutations. The journey SHALL include human Gates, Decisions, two revision and re-review rounds, resume and final delivery. Test material SHALL remain external producer output; the harness SHALL NOT edit workflow authority or generated profiles.

#### Scenario: Pipeline resumes across revisions

- **WHEN** installed-package acceptance completes review and two revision rounds
- **THEN** the first revision outcome SHALL continue and the second SHALL complete through public Decisions
- **AND** fresh status and instructions calls SHALL recover the eligible work at child, Gate and round boundaries

#### Scenario: Root and child runs finish

- **WHEN** the final required integrity Gate completes
- **THEN** new CLI processes SHALL observe all participating root and child runs as persistently complete, with no active runs and an empty frontier
- **AND** strict workspace checking SHALL succeed

#### Scenario: Acceptance evidence identifies its execution boundary

- **WHEN** tests or release documentation describe a CLI journey
- **THEN** they SHALL distinguish source-compiled CLI execution from installed-tarball execution
- **AND** automated workflow fixtures SHALL NOT be presented as human research-quality acceptance
