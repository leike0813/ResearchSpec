## Purpose

ResearchSpec exposes a complete first-version public CLI surface and the
machine- and human-facing result contract that all public commands share. This
capability is the user-facing command layer over the framework-core workspace,
agent-tool-delivery, and derived context artifacts.
## Requirements
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

### Requirement: Plugin Command Group
The CLI SHALL expose `plugin list [--installed] [--summary]`,
`plugin show <domain-id> [--summary]`, `plugin install <domain-ids...>`,
`plugin uninstall <domain-ids...>`, `plugin update [domain-ids...]`, and
`plugin instructions <skill-id>` while retaining `plugin` as the single
sixteenth top-level command.

#### Scenario: Domain catalog is listed outside a workspace
- **WHEN** a user runs normal `plugin list` without a workspace
- **THEN** the CLI SHALL list only stable non-empty domains without vendor names
- **AND** empty internal domains SHALL be absent from human and JSON output

#### Scenario: Empty domain is not installable
- **WHEN** a user shows or installs an internally registered domain with no reviewed Skills
- **THEN** the CLI SHALL reject it as unavailable without changing workspace state

#### Scenario: Installed unavailable domain remains recoverable
- **WHEN** an already selected domain is missing or empty and the user runs installed list or status
- **THEN** machine and human output SHALL identify the selection as unavailable
- **AND** uninstall SHALL remain available through saved resolution evidence while update SHALL block

#### Scenario: Domain details expose provenance
- **WHEN** a user runs `plugin show <domain-id>` for an available domain
- **THEN** the CLI SHALL distinguish direct and resolved Skills
- **AND** it MAY expose domain type, ANZSRC Group code, vendor, revision, license, and dependency provenance

#### Scenario: Machine output distinguishes intent and projection
- **WHEN** plugin lifecycle or status JSON is requested
- **THEN** it SHALL distinguish selected domains, available domains, unavailable selections, resolved Skills, and projected Skills

#### Scenario: Compact catalog views are requested
- **WHEN** `--summary` is used for list or show
- **THEN** output SHALL omit full license and upstream provenance
- **AND** it SHALL retain identity, availability, installation, projection,
  counts, descriptions, dependencies, and entry hashes needed for Agent
  discovery

#### Scenario: Exact installed instructions are requested
- **WHEN** the caller requests an eligible installed Skill
- **THEN** the command SHALL return one versioned read-only instruction packet
- **AND** it SHALL not enter the runtime selector protocol or modify workspace

### Requirement: Agent-Bound Plugin Install
Non-interactive plugin installation SHALL bind execution to the exact current
dry-run plan.

#### Scenario: Install preview is produced
- **WHEN** plugin install runs with `--dry-run --json`
- **THEN** output SHALL include a deterministic `plan_sha256`, selected domain
  versions, resolved Skills, projected tools, and summarized writes

#### Scenario: Non-interactive install executes
- **WHEN** plugin install runs outside an interactive terminal
- **THEN** it SHALL require `--yes` and a matching
  `--expected-plan-sha256`
- **AND** mismatch or omission SHALL write nothing

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
from the same snapshot and evaluator used by generalized instructions and Submit.

#### Scenario: Instance workflow reports a generalized frontier

- **GIVEN** a valid workflow with subflow templates and zero or more instances
- **WHEN** the user runs `researchspec status --json`
- **THEN** `workflow_control` SHALL include frontier, startable subflows, instances, parallel groups, scoped work states, ready work selectors, blockers, warnings and unlocks
- **AND** stage identity SHALL be reported per subflow instance

#### Scenario: Unconfigured workflow remains inspectable

- **GIVEN** a valid workflow without typed work items
- **WHEN** the user runs `researchspec status --json`
- **THEN** the command SHALL succeed with `workflow_control.configured` equal to
  false
- **AND** it SHALL NOT write or migrate workspace files

### Requirement: Dynamic Work-Item Instructions

ResearchSpec SHALL expose read-only instructions for available subflow templates, active subflow instances and scoped work through canonical runtime selectors.

#### Scenario: Template selector returns route packet

- **GIVEN** a subflow template is available for confirmation
- **WHEN** the user requests `instructions subflow:tpl-<id> --json`
- **THEN** the packet SHALL include catalog route summary, prerequisites, template/parallel scope, instruction basis and Start contract

#### Scenario: Instance selector returns resume packet

- **GIVEN** a subflow instance exists
- **WHEN** the user requests its instructions
- **THEN** the packet SHALL include parent/round/lifecycle, active stage, blockers and current frontier

#### Scenario: Ready scoped work returns separated instructions

- **GIVEN** an instance work item is dispatchable
- **WHEN** the user requests `instructions work:<instance>/<node> --json`
- **THEN** it SHALL include the established work packet fields plus instance provenance, submission policy and authorization
- **AND** it SHALL not write the workspace

#### Scenario: Selector syntax and availability are constrained

- **WHEN** a selector is unsafe, unknown, blocked, done, capacity-deferred, or belongs to the unavailable Gate/transition layer
- **THEN** instructions SHALL return the corresponding stable usage/domain error
- **AND** it SHALL not infer a packet

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

### Requirement: Public Subflow Start Command
ResearchSpec SHALL expose `start subflow:<template-id>` with strict input, actor/confirmation identity, dry-run, expected-plan binding and versioned JSON results.

#### Scenario: Non-interactive start binds the previewed plan
- **WHEN** Start executes without an interactive TTY
- **THEN** it SHALL require `--expected-plan-sha256` and `--yes`
- **AND** the expected hash SHALL match the current route/template/prerequisite/state plan

#### Scenario: Start success states are stable
- **WHEN** Start is previewed, first committed or exactly retried
- **THEN** JSON data SHALL report `would_start`, `started` or `already_started`
- **AND** it SHALL explicitly report that artifacts, Gates, Decisions and semantic work were not written

#### Scenario: Start failures use stable exit classes
- **WHEN** selector, input, actor, confirmer or plan hash syntax is invalid
- **THEN** Start SHALL return exit code 2
- **WHEN** workflow, route, prerequisites, parent or run lifecycle blocks start
- **THEN** Start SHALL return exit code 1
- **WHEN** receipt, instance, plan or read preconditions conflict
- **THEN** Start SHALL return exit code 3

### Requirement: Public Gate Submit Command

ResearchSpec SHALL dispatch `submit gate:<instance>/<node>` through a strict, dry-runnable and receipt-backed Gate transaction while preserving `submit work:` behavior.

#### Scenario: Non-interactive Gate submit is fully bound

- **WHEN** Gate submit runs outside an interactive TTY
- **THEN** it SHALL require strict input, validator actor, `confirmed_by`, matching `--expected-plan-sha256` and `--yes`
- **AND** `--yes` SHALL NOT substitute for the named human confirmation

#### Scenario: Gate results use stable classes

- **WHEN** Gate submit is previewed, committed or exactly retried
- **THEN** JSON data SHALL report `would_submit`, `submitted` or `already_submitted`
- **AND** usage, domain and conflict failures SHALL retain exit classes 2, 1 and 3

### Requirement: Public Transition Advance Command

ResearchSpec SHALL expose `advance transition:<instance>/<node>` as the only public state-transition transaction.

#### Scenario: Advance binds the previewed state plan

- **WHEN** Advance runs non-interactively
- **THEN** it SHALL require actor identity, a matching expected plan hash and `--yes`

#### Scenario: Advance reports scoped effects

- **WHEN** Advance previews, commits or exactly retries
- **THEN** JSON data SHALL report plan, receipt, from/to state, basis, state effect and post-transaction workflow control

### Requirement: Gate And Transition Instructions Are Executable

`researchspec instructions` SHALL return executable packets for ready scoped Gate and transition selectors.

#### Scenario: Unavailable selector is rejected

- **WHEN** a Gate or transition is unknown, blocked, stale, ambiguous or already complete
- **THEN** instructions SHALL return a stable domain error and SHALL NOT infer missing workflow facts

### Requirement: New workspaces use the universal profile
`researchspec init` SHALL always create an unstarted `arsu-v0-1` workspace and SHALL expose no profile selection option.

#### Scenario: Init receives a profile option
- **WHEN** a caller supplies `--profile`
- **THEN** CLI parsing SHALL reject the unknown option without writing a workspace

### Requirement: Existing commands expose child-aware workflow state
`status`, `instructions`, and `start` SHALL render and accept parent-scoped child subflow candidates without adding a public top-level command.

#### Scenario: Pipeline child becomes ready
- **WHEN** a parent stage makes one child node ready
- **THEN** status and instructions expose its scoped selector and start can dry-run and execute it with normal plan-hash safeguards

### Requirement: Public command surface remains fixed
The CLI SHALL continue to expose exactly the canonical sixteen top-level commands after workflow profile support is added.

#### Scenario: Help is rendered
- **WHEN** top-level help is requested
- **THEN** it lists init, update, status, instructions, start, submit, advance, check, list, show, handoff, pack, propose, decide, archive, and plugin exactly once

### Requirement: Init And Update Reconcile Generated Agent Projections

`init` for an existing workspace and `update` SHALL use the same ownership-aware reconciliation for desired and obsolete project-local Agent projections.

#### Scenario: Existing workspace converges through either command

- **WHEN** a workspace manifest records clean project-local projections that are no longer desired
- **THEN** init and update SHALL install the four-Companion desired surface and remove those stale project-local files
- **AND** both commands SHALL produce equivalent manifest ownership facts

#### Scenario: Reconciliation preserves user changes

- **WHEN** an obsolete projection is unmanifested or differs from its recorded hash
- **THEN** init and update SHALL leave it unchanged and report the applicable ownership or drift boundary
- **AND** repeated reconciliation SHALL be idempotent

#### Scenario: Public command surface is unchanged

- **WHEN** agent projections are consolidated
- **THEN** CLI help SHALL continue to expose exactly init, update, status, instructions, start, submit, advance, check, list, show, handoff, pack, propose, decide, archive, and plugin

### Requirement: Mid-Entry Material Passport Input
Start SHALL accept an optional strict `material_passport_import` object without adding a public command.

#### Scenario: Import is previewed and executed
- **WHEN** a caller supplies a valid Passport import to the mid-entry Start
- **THEN** dry-run SHALL expose hashes, projected evidence, diagnostics and writes
- **AND** execution SHALL require the identical plan hash and current read basis

### Requirement: Imported-Evidence Runtime Context
Subflow, work and Gate instructions SHALL expose typed scoped import references.

#### Scenario: Imported evidence changes
- **WHEN** registered import evidence or its hashes change
- **THEN** the prior instruction basis SHALL become stale

