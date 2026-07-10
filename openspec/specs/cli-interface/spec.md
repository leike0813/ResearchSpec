## Purpose

ResearchSpec exposes a complete first-version public CLI surface and the
machine- and human-facing result contract that all public commands share. This
capability is the user-facing command layer over the framework-core workspace,
agent-tool-delivery, and derived context artifacts.

## Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `submit`,
`check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, and `archive`
as the complete first-version public CLI command set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all thirteen public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting
  option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface

### Requirement: Public Contract Change Proposal Command

ResearchSpec SHALL expose `propose <change-id>` with required `--input`,
`--actor-kind`, and `--actor-name` options for deterministic pending contract
change creation.

#### Scenario: Dry run and execution share one proposal plan

- **WHEN** a valid proposal is invoked with `--dry-run`
- **THEN** the command SHALL return the three create operations in JSON envelope
  version 1 and SHALL write nothing
- **AND** confirmed execution SHALL apply the same plan
- **AND** the created change SHALL be visible to `list`, `show`, and `check`

#### Scenario: Creation confirmation is not semantic acceptance

- **WHEN** interactive proposal creation has not been confirmed
- **THEN** no proposal files SHALL be written
- **AND** `--yes` SHALL only skip this creation confirmation
- **AND** neither confirmation nor `--yes` SHALL accept or apply the proposal

#### Scenario: Proposal failures use stable exit classes

- **WHEN** arguments, actor, ID, or payload schema are invalid
- **THEN** the command SHALL return exit code 2
- **WHEN** a target, current value, selector, or evidence reference conflicts
- **THEN** the command SHALL return exit code 1
- **WHEN** an output target exists or a filesystem write conflicts
- **THEN** the command SHALL return exit code 3
- **AND** JSON mode SHALL emit exactly one parseable failure envelope

### Requirement: Common Command Context

ResearchSpec SHALL apply `--cwd`, `--workspace`, `--json`, `--dry-run`,
`--force`, `--yes`, and `--quiet` consistently to commands that support those
behaviors.

#### Scenario: Explicit workspace takes precedence

- **WHEN** both cwd and an explicit workspace path are supplied
- **THEN** the CLI SHALL use the explicit workspace after validating it

#### Scenario: Machine mode never prompts

- **WHEN** a command is run with `--json` or without a TTY
- **THEN** the CLI SHALL NOT wait for interactive input
- **AND** missing required selections SHALL return exit code 2

#### Scenario: Dry run shares the write plan

- **WHEN** a writing command is run with `--dry-run`
- **THEN** it SHALL report the same planned operations that execution would use
- **AND** it SHALL NOT modify files

### Requirement: Versioned Machine Result Contract

Every command supporting `--json` SHALL return one `CliEnvelope` containing
`schema_version`, `command`, `ok`, `data`, `diagnostics`, and an optional
structured `error`.

#### Scenario: JSON success is isolated

- **WHEN** a JSON command succeeds
- **THEN** stdout SHALL contain exactly one valid envelope with
  `schema_version` equal to `1`
- **AND** human progress SHALL NOT be mixed into stdout

#### Scenario: JSON expected failure remains parseable

- **WHEN** a JSON command encounters a domain, usage, or write conflict
- **THEN** stdout SHALL contain exactly one valid failure envelope
- **AND** the process SHALL return the mapped exit class

### Requirement: Read Commands Use Current Workspace State

`status`, `check`, `list`, and `show` SHALL derive results from the same current
workspace snapshot without modifying files.

#### Scenario: Status summarizes the current run

- **WHEN** the user runs `researchspec status`
- **THEN** the result SHALL include workflow/stage, pending items, blocking gates,
  recent artifacts, installed tools, and validation summary when available

#### Scenario: Check targets are composable

- **WHEN** the user runs `researchspec check [all|contracts|runtime|artifacts|tools]`
- **THEN** the CLI SHALL run the selected validators
- **AND** `--strict` SHALL promote warnings to a failing result

#### Scenario: List and show resolve stable items

- **WHEN** the user lists changes, artifacts, gates, decisions, or tools and then
  shows a canonical selector
- **THEN** the CLI SHALL return the indexed item and its source path
- **AND** an ambiguous bare ID SHALL return candidate canonical selectors with
  exit code 2

### Requirement: Derived Handoff And Context Pack

ResearchSpec SHALL render handoff and context-pack outputs from authoritative
contracts and runtime records without changing research semantics.

#### Scenario: Handoff defaults to the current run

- **WHEN** the user runs `researchspec handoff`
- **THEN** the CLI SHALL render `runs/current/handoff.md`
- **AND** `--stdout` SHALL print the same view without writing it

#### Scenario: Pack is deterministic and auditable

- **WHEN** the user runs `researchspec pack`
- **THEN** the CLI SHALL create a deterministic ZIP containing contracts,
  runtime state, ledgers, registry, handoff, and a SHA-256 manifest
- **AND** `--include-artifacts` SHALL add only registered files within allowed
  project roots

### Requirement: Explicit Human Decisions

ResearchSpec SHALL make `decide` the only public command that accepts, rejects,
or postpones a pending high-impact item.

#### Scenario: Non-interactive decision records a human actor

- **WHEN** a user supplies an item, `--decision`, `--actor-name`, and required
  reason
- **THEN** the CLI SHALL validate the item and decision before writing
- **AND** it SHALL append the decision ledger only after accepted changes and
  registry updates succeed

#### Scenario: Yes does not accept a decision

- **WHEN** a pending high-impact decision exists and the user supplies only
  `--yes`
- **THEN** the CLI SHALL NOT accept the decision

### Requirement: Resolved Item Archive

ResearchSpec SHALL archive only resolved contract changes and draft patches.

#### Scenario: Resolved item is archived

- **WHEN** an item has the required decision, gate, applied-patch, and receipt
  evidence
- **THEN** `archive` SHALL move it to a dated archive directory
- **AND** historical ledgers and stable specs SHALL remain unchanged

#### Scenario: Pending item is blocked

- **WHEN** an item is unresolved or has a blocking gate
- **THEN** `archive` SHALL make no changes and return a domain-blocked result

### Requirement: Dynamic Workflow Status Contract

`researchspec status` SHALL expose one read-only workflow-control view derived
from the same current workspace snapshot and workflow evaluator used by
instructions.

#### Scenario: Configured workflow reports a frontier

- **GIVEN** a valid workflow with typed work items
- **WHEN** the user runs `researchspec status --json`
- **THEN** `data.workflow_control` SHALL include profile, active stage, control
  state, canonical ready-item selectors, work-item states, missing dependencies,
  warnings, outputs, and unlocks
- **AND** existing status fields SHALL remain available
- **AND** work items SHALL NOT be duplicated at another top-level data field

#### Scenario: Unconfigured workflow remains inspectable

- **GIVEN** a valid workflow without typed work items
- **WHEN** the user runs `researchspec status --json`
- **THEN** the command SHALL succeed with `workflow_control.configured` equal to
  false
- **AND** it SHALL NOT write or migrate workspace files

### Requirement: Dynamic Work-Item Instructions

ResearchSpec SHALL expose `instructions work:<id>` as a read-only CLI primitive
for a ready work item.

#### Scenario: Ready item returns a separated instruction packet

- **GIVEN** a work item is ready
- **WHEN** the user runs `researchspec instructions work:<id> --json`
- **THEN** the result SHALL include the canonical selector, work-item and stage
  IDs, producer Skill, description, context, rules, dependency metadata, candidate
  output paths, resolved ARSU template, validation profile, completion policy,
  forbidden writes, and unlocks as separate fields
- **AND** completion SHALL explicitly report `submit_available: false`
- **AND** the command SHALL NOT modify workspace files

#### Scenario: Selector syntax is constrained

- **WHEN** the user supplies a bare, empty, path-like, or otherwise unsafe
  work-item selector
- **THEN** the command SHALL return `invalid_work_item_selector` with exit code 2

#### Scenario: Runtime frontier prevents invalid instruction use

- **WHEN** the workflow is unconfigured or invalid, the work item is unknown,
  blocked, or already done, or its template resource cannot be resolved
- **THEN** the command SHALL return the corresponding stable domain error
- **AND** it SHALL NOT infer or fabricate instructions

### Requirement: Public Artifact Submit Command

ResearchSpec SHALL expose `submit work:<id>` with strict provenance input, actor identity, dry-run, expected-hash binding, confirmation, and versioned JSON results.

#### Scenario: Non-interactive execution binds previewed content

- **WHEN** Submit executes without an interactive TTY
- **THEN** it SHALL require `--expected-sha256` and `--yes`
- **AND** the expected hash SHALL match the candidate at execution time
- **AND** `--yes` SHALL NOT imply academic acceptance, Gate pass, Decision, or stage transition

#### Scenario: Success states are stable

- **WHEN** Submit is previewed, first committed, or exactly retried
- **THEN** JSON data SHALL respectively report `would_submit`, `submitted`, or `already_submitted`
- **AND** it SHALL explicitly report that state, Gate, and Decision were not written

#### Scenario: Submit failures use stable exit classes

- **WHEN** selector, input, actor, or expected hash syntax is invalid
- **THEN** Submit SHALL return exit code 2
- **WHEN** workflow readiness, candidate validation, or dependency trust fails
- **THEN** Submit SHALL return exit code 1
- **WHEN** content, provenance, receipt, ID, registry, or plan preconditions conflict
- **THEN** Submit SHALL return exit code 3

### Requirement: Instructions Advertise Submit Capability

Dynamic work-item instructions SHALL advertise whether the runtime can submit the node's validation profile.

#### Scenario: Supported ready item includes Submit contract

- **WHEN** a ready work item uses a supported validation profile
- **THEN** instructions SHALL retain existing fields and set `submit_available: true`
- **AND** it SHALL include candidate path, input shape, dry-run command, confirmation/hash requirements, and explicit state/Gate/Decision non-effects
