## MODIFIED Requirements

### Requirement: Read Commands Use Current Workspace State
`status`, `check`, `list`, and `show` SHALL derive results from the same current workspace snapshot without modifying files, while `plugin list` and `plugin show` SHALL also support package-only inspection without a workspace.

#### Scenario: Status summarizes the current run
- **WHEN** the user runs `researchspec status`
- **THEN** the result SHALL include workflow/stage, pending items, blocking Gates, recent artifacts, installed tools, literature adapters, selected/available/projected plugins, and validation summary when available
- **AND** literature-adapter connection state SHALL remain `unchecked`

#### Scenario: Check targets are composable
- **WHEN** the user runs `researchspec check [all|contracts|runtime|artifacts|tools|plugins|literature-adapters]`
- **THEN** the CLI SHALL run the selected validators
- **AND** `all` SHALL include plugin and literature-adapter validation
- **AND** `--strict` SHALL promote warnings to a failing result

#### Scenario: List and show resolve stable items
- **WHEN** the user lists changes, artifacts, Gates, Decisions, or tools and then shows a canonical selector
- **THEN** the CLI SHALL return the indexed item and its source path
- **AND** an ambiguous bare ID SHALL return candidate canonical selectors with exit code 2

## ADDED Requirements

### Requirement: Literature Adapter Status Is Static
The existing status and check command surface SHALL report fixed literature-adapter installation health without adding a top-level command or live connection probe.

#### Scenario: Status runs against adapter files
- **WHEN** adapter runtime or Skill files are missing, drifted, unsupported, or conflicted
- **THEN** status SHALL return the corresponding structured adapter state and diagnostics
- **AND** it SHALL NOT execute the runtime, connect to Host Bridge, access the network, or read credentials

