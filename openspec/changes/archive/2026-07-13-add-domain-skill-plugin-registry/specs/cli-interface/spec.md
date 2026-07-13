## MODIFIED Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `start`,
`submit`, `advance`, `check`, `list`, `show`, `handoff`, `pack`, `propose`,
`decide`, `archive`, and `plugin` as the complete public CLI command set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all sixteen public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting
  option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface

### Requirement: Read Commands Use Current Workspace State

`status`, `check`, `list`, and `show` SHALL derive results from the same current
workspace snapshot without modifying files, while `plugin list` and `plugin show`
SHALL also support package-only inspection without a workspace.

#### Scenario: Status summarizes the current run

- **WHEN** the user runs `researchspec status`
- **THEN** the result SHALL include workflow/stage, pending items, blocking gates,
  recent artifacts, installed tools, selected/available/projected plugins, and
  validation summary when available

#### Scenario: Check targets are composable

- **WHEN** the user runs `researchspec check [all|contracts|runtime|artifacts|tools|plugins]`
- **THEN** the CLI SHALL run the selected validators
- **AND** `all` SHALL include plugin validation
- **AND** `--strict` SHALL promote warnings to a failing result

#### Scenario: List and show resolve stable items

- **WHEN** the user lists changes, artifacts, gates, decisions, or tools and then
  shows a canonical selector
- **THEN** the CLI SHALL return the indexed item and its source path
- **AND** an ambiguous bare ID SHALL return candidate canonical selectors with
  exit code 2

## ADDED Requirements

### Requirement: Plugin Command Group
ResearchSpec SHALL expose `plugin list [--installed]`, `plugin show <plugin-id>`, `plugin install <plugin-ids...>`, `plugin uninstall <plugin-ids...>`, and `plugin update [plugin-ids...]` under the sixteenth top-level command.

#### Scenario: List and show work without a workspace
- **WHEN** a user invokes package catalog list or show outside a workspace
- **THEN** the CLI SHALL report bundled plugin metadata
- **AND** installation state SHALL be false or unavailable rather than requiring initialization

#### Scenario: Writing subcommands use global policy flags
- **WHEN** install, update, or uninstall is invoked with `--dry-run`, `--yes`, `--force`, `--json`, or `--quiet`
- **THEN** the subcommand SHALL follow the common write plan, confirmation, output, and error contracts

#### Scenario: Multiple plugin IDs are incremental
- **WHEN** a user installs or uninstalls multiple valid plugin IDs
- **THEN** the operation SHALL preserve selections outside the requested IDs
- **AND** duplicate IDs SHALL be normalized

#### Scenario: JSON plugin output is isolated
- **WHEN** any plugin subcommand is invoked with `--json`
- **THEN** stdout SHALL contain exactly one versioned CLI envelope
- **AND** diagnostics SHALL remain structured
