## Purpose

ResearchSpec exposes a complete first-version public CLI surface and the
machine- and human-facing result contract that all public commands share. This
capability is the user-facing command layer over the framework-core workspace,
agent-tool-delivery, and derived context artifacts.
## Requirements
### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `start`,
`submit`, `advance`, `check`, `list`, `show`, `handoff`, `pack`, `propose`,
`decide`, `archive`, `doctor`, and `plugin` as the complete public CLI command
set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all seventeen public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands
- **AND** it SHALL display a link to the documentation website at the end of
  the help output
- **AND** the link SHALL point to `https://leike0813.github.io/ResearchSpec/`

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
- **AND** execution SHALL derive the current plan under read preconditions
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
- **THEN** the result SHALL include workflow/stage, pending items, blocking Gates,
  recent artifacts, installed tools, literature adapters, selected/available/projected plugins, and
  validation summary when available
- **AND** literature-adapter connection state SHALL remain `unchecked`

#### Scenario: Check targets are composable

- **WHEN** the user runs `researchspec check [all|contracts|runtime|artifacts|tools|plugins|literature-adapters]`
- **THEN** the CLI SHALL run the selected validators
- **AND** `all` SHALL include plugin and literature-adapter validation
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
`plugin instructions <skill-id>` while retaining `plugin` as one top-level
command.

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

ResearchSpec SHALL expose `submit work:<id>` with semantic-only provenance
input, actor identity, descriptor-declared execution policy, optional dry-run,
and versioned JSON results.

#### Scenario: Non-interactive execution follows submission policy

- **WHEN** Submit executes without an interactive TTY
- **THEN** it SHALL require only the confirmation or plan binding declared by
  its action descriptor
- **AND** `--yes` SHALL NOT imply academic acceptance, Gate pass, Decision, or stage transition

#### Scenario: Success states are stable

- **WHEN** Submit is previewed, first committed, or exactly retried
- **THEN** JSON data SHALL respectively report `would_submit`, `submitted`, or `already_submitted`
- **AND** it SHALL explicitly report that state, Gate, and Decision were not written

#### Scenario: Submit failures use stable exit classes

- **WHEN** selector, semantic input, actor, or declared policy input is invalid
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
- **AND** it SHALL include candidate path, semantic input shape, execution
  policy, optional dry-run command, required confirmation or plan binding, and
  explicit state/Gate/Decision non-effects

### Requirement: Public Subflow Start Command
ResearchSpec SHALL expose `start subflow:<template-id>` with semantic input,
actor/confirmation identity, descriptor-declared execution policy, optional
dry-run, and versioned JSON results.

#### Scenario: Non-interactive Start follows descriptor policy
- **WHEN** Start executes without an interactive TTY
- **THEN** it SHALL require the named confirmation or approved plan hash declared
  by the selected action descriptor
- **AND** it SHALL derive the current route, template, prerequisite, and state
  facts from authority

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

ResearchSpec SHALL dispatch `submit gate:<instance>/<node>` through a semantic
input, plan-bound, receipt-backed Gate transaction while preserving `submit
work:` behavior.

#### Scenario: Non-interactive Gate submit is fully bound

- **WHEN** Gate submit runs outside an interactive TTY
- **THEN** it SHALL require descriptor-declared semantic input, validator actor,
  `confirmed_by`, matching `--expected-plan-sha256`, and `--yes`
- **AND** `--yes` SHALL NOT substitute for the named human confirmation

#### Scenario: Gate results use stable classes

- **WHEN** Gate submit is previewed, committed or exactly retried
- **THEN** JSON data SHALL report `would_submit`, `submitted` or `already_submitted`
- **AND** usage, domain and conflict failures SHALL retain exit classes 2, 1 and 3

### Requirement: Public Transition Advance Command

ResearchSpec SHALL expose `advance` for descriptor-authorized strict
`transition:`, adaptive `completion:`, and accepted `patch:` state effects.

#### Scenario: Advance follows its execution policy

- **WHEN** Advance runs non-interactively
- **THEN** it SHALL require actor identity and the confirmation or matching plan
  hash declared by its action descriptor

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
- **THEN** status and instructions expose its scoped selector and Start SHALL
  follow the delegated child's declared direct execution policy

### Requirement: Public command surface remains fixed

The CLI SHALL expose exactly the canonical seventeen top-level commands after
adaptive runtime and recovery support is added.

#### Scenario: Help is rendered

- **WHEN** top-level help is requested
- **THEN** it lists init, update, status, instructions, start, submit, advance,
  check, doctor, list, show, handoff, pack, propose, decide, archive, and plugin
  exactly once

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

### Requirement: Literature Adapter Status Is Static
The existing status and check command surface SHALL report fixed literature-adapter installation health without adding a top-level command or live connection probe.

#### Scenario: Status runs against adapter files
- **WHEN** adapter runtime or Skill files are missing, drifted, unsupported, or conflicted
- **THEN** status SHALL return the corresponding structured adapter state and diagnostics
- **AND** it SHALL NOT execute the runtime, connect to Host Bridge, access the network, or read credentials

### Requirement: Bounded Agent Runtime Protocol

Default `status` SHALL return a bounded `CaseStatusSummary` containing run and
instance identity, unsatisfied hard obligations, blockers, recommended and
other allowed actions, pending case-action counts, diagnostic counts and next
detail selectors. Growing collections SHALL be available only through directed
or paginated `instructions`, `show` and `list` views.

#### Scenario: Long run status is requested

- **WHEN** a run contains many historical instances, attempts and artifacts
- **THEN** `status --json` SHALL NOT embed the complete workflow or unbounded
  histories
- **AND** it SHALL identify selectors for requested detail

### Requirement: Schema-Derived Action Descriptors

Instructions for every Agent-callable write SHALL expose an action descriptor
derived from the command's validator schema. The descriptor SHALL identify the
canonical selector, availability basis and expiry, CLI-derived mechanical
fields, required semantic inputs, constraints, dry-run/execute requirements
and possible next selectors.

#### Scenario: Agent prepares a write

- **WHEN** an Agent requests instructions for an allowed write selector
- **THEN** it SHALL receive a minimal valid input template without supplying a
  schema version or reconstructing mechanical identities

#### Scenario: Input validation fails

- **WHEN** submitted input violates the action schema
- **THEN** the CLI SHALL return a stable error code, field path, expectation and
  action-schema reference
- **AND** it SHALL NOT require trial submissions to discover the contract

### Requirement: Compact Transaction Results

Successful Start, Submit, Advance, Decide and repair transactions SHALL return
only receipt or plan identity, an effects summary and next selectors.

#### Scenario: Writing transaction succeeds

- **WHEN** an Agent executes an approved writing transaction
- **THEN** the response SHALL NOT embed the complete post-write workflow
- **AND** current detail SHALL be obtained through the returned selectors

### Requirement: Public Doctor Command

`doctor` SHALL diagnose runtime damage read-only by default and SHALL expose
plan-bound deterministic repair as an explicit mode under the same command.

#### Scenario: Doctor repair executes non-interactively

- **WHEN** a caller executes an approved repair without an interactive prompt
- **THEN** it SHALL provide `--yes` and the matching
  `--expected-plan-sha256`
- **AND** the CLI SHALL reject missing or stale approval

### Requirement: Patch And Change Case-Action Selectors

The existing `submit`, `decide`, `advance` and `propose` commands SHALL operate
pending patch and contract-change case actions through canonical selectors.

#### Scenario: Draft patch progresses

- **WHEN** a revision producer creates a patch candidate
- **THEN** `submit patch:<selector>` SHALL create the pending patch
- **AND** `decide patch:<id>` and `advance patch:<id>` SHALL govern acceptance
  and controlled application without a new top-level command

### Requirement: Action Descriptor V2 And Execution Policy

Every Agent-callable write instruction SHALL expose a version-2 action descriptor
whose public input template contains only semantic fields. The descriptor SHALL
declare exactly one execution policy: `direct`, `human_confirmed`, or
`plan_bound`; the CLI SHALL derive mechanical identities, hashes, dependency
facts, receipt fields, and current basis from the selected action.

#### Scenario: Direct action receives semantic input

- **WHEN** a caller executes a currently allowed `direct` action with the
  descriptor's semantic input
- **THEN** the CLI SHALL plan, validate, and commit under current read
  preconditions in that invocation
- **AND** it SHALL NOT require an externally replayed plan hash

#### Scenario: Caller supplies a mechanical field

- **WHEN** a caller includes a CLI-derived identity, hash, receipt, dependency,
  schema-version, or basis field in a version-2 semantic input
- **THEN** the CLI SHALL reject the input before creating any runtime write

#### Scenario: Plan-bound action is executed

- **WHEN** a descriptor declares `plan_bound`
- **THEN** the CLI SHALL require an approved current plan hash and the explicit
  execution confirmation required by that action
- **AND** a direct or human-confirmed execution path SHALL NOT bypass that
  requirement

### Requirement: Status And Transaction Continuation Are Directed

Default status SHALL remain bounded and SHALL expose recommended actions, other
allowed actions, blockers, pending counts, and directed detail selectors. A
successful write transaction SHALL return compact effects and next selectors so
that a caller can continue with a directed read instead of requiring a complete
status round trip after every mechanical action.

#### Scenario: A durable action succeeds

- **WHEN** Start, Submit, Advance, Decide, Propose, Doctor repair, or runtime
  migration completes successfully
- **THEN** its result SHALL identify its receipt or plan, effects, and next
  selectors without embedding an unbounded post-write workflow snapshot

### Requirement: Catalog-Backed Static CLI Discovery

ResearchSpec SHALL maintain one typed static CLI catalog for the seven global
options, the exact seventeen top-level commands, and the `plugin` subcommands.
The catalog SHALL provide the stable synopsis and help metadata used by
Commander help and by the deterministic packaged CLI handbook. Handler binding
and command execution MAY remain explicit, but they SHALL consume the same
catalog identity rather than define a second public command surface.

#### Scenario: Root, command, and plugin help require no workspace

- **WHEN** a user runs `researchspec --help`, `researchspec <command> --help`,
  or `researchspec plugin --help` outside a ResearchSpec workspace
- **THEN** the CLI SHALL render the applicable catalog-backed help without
  attempting workspace discovery or mutation
- **AND** root help SHALL list each of the seventeen top-level commands exactly
  once
- **AND** plugin help SHALL list only its declared subcommands

#### Scenario: Packaged handbook is derived static discovery

- **WHEN** ResearchSpec packages its public documentation
- **THEN** it SHALL include a deterministic CLI handbook derived from the
  static catalog
- **AND** the handbook SHALL identify global options, command and plugin
  synopsis, selector-family discovery, and the boundary to runtime
  instructions
- **AND** it SHALL not require a workspace or encode live action availability

### Requirement: Contextual Usage And Complete Selector-Family Hints

Usage failures SHALL retain exit code 2 and provide a help target appropriate
to the invoked root command or plugin subcommand. Invalid runtime-action
selectors SHALL additionally identify every supported selector family:
`subflow:`, `obligation:`, `gate:`, `completion:`, `case-action:`, `patch:`,
`change:`, `work:`, and `transition:`.

#### Scenario: Invalid action selector is discoverable across profiles

- **WHEN** a caller supplies an invalid selector to `researchspec instructions`
- **THEN** the CLI SHALL return the stable invalid-selector usage error and
  exit code 2
- **AND** its hint SHALL direct the caller to `researchspec instructions --help`
  and identify the complete selector-family set
- **AND** the hint SHALL not imply that every family is currently available in
  the caller's workspace

#### Scenario: Plugin usage failure remains contextual

- **WHEN** a caller supplies invalid syntax to a `plugin` subcommand
- **THEN** the CLI SHALL direct the caller to the corresponding plugin help
  surface
- **AND** it SHALL not redirect the caller to an unrelated runtime selector or
  require a workspace merely to render usage guidance

### Requirement: Static Discovery Does Not Authorize Runtime Actions

Static help and the CLI handbook SHALL describe command shape and discovery
only. They SHALL NOT expand the runtime selector grammar, create an action
descriptor, reveal a live frontier, construct a semantic payload, or authorize
a write. `status` and `instructions <runtime-selector>` remain the only public
sources for current runtime action availability and descriptor-owned execution
requirements.

#### Scenario: Handbook precedes a runtime write

- **WHEN** a user reads static help or the handbook and then intends a
  workspace-bound write
- **THEN** the guidance SHALL direct the caller to current `status` and the
  selected runtime `instructions` packet
- **AND** no `cli:<command>` selector or additional public command SHALL be
  introduced

### Requirement: Policy-derived execution requirements
Action Descriptor v2 SHALL expose `execution_requirements` derived from its catalog-owned `execution_policy`, and every `plan_bound` CLI execution SHALL enforce the same preview, basis, plan-hash, and confirmation contract.

#### Scenario: Interactive plan-bound execution
- **WHEN** an interactive caller executes a Gate, Decision, or patch-apply action
- **THEN** the CLI SHALL preview the bound plan and hash and require confirmation before any authority write

#### Scenario: Non-interactive plan-bound execution
- **WHEN** a non-interactive caller executes a plan-bound action
- **THEN** the CLI SHALL require matching action basis and plan hash plus `--yes`, and SHALL perform no write when any requirement is absent or stale

### Requirement: Catalog-aware contextual help
The CLI SHALL parse contextual help targets by skipping recognized option values and matching the longest catalog command path.

#### Scenario: Option value resembles a command
- **WHEN** a global option value equals a top-level command name in either separated or equals syntax
- **THEN** the value SHALL NOT be treated as the help target

#### Scenario: Plugin subcommand help
- **WHEN** the positional path identifies a registered plugin subcommand
- **THEN** the usage hint SHALL target that longest registered command path

### Requirement: Annotation Selector Command Integration

ResearchSpec SHALL support canonical `annotation:<safe-id>` selectors through
the existing `instructions`, `submit`, and `show` commands, and SHALL support
`list annotations`, without adding a top-level command.

#### Scenario: Annotation action is discovered

- **WHEN** a normalized candidate session exists or a frozen Annotation Set is
  registered
- **THEN** status SHALL expose only the bounded `list:annotations` discovery
  entry
- **AND** instructions and show SHALL resolve current annotation metadata
  without embedding annotation bodies in status

#### Scenario: Non-interactive annotation submit is confirmed

- **WHEN** an Agent submits `annotation:<id>` outside a TTY
- **THEN** it SHALL provide the current action basis, `--confirmed-by`, and
  `--yes`
- **AND** it SHALL not require a plan hash

#### Scenario: Annotation command fails

- **WHEN** selector syntax, confirmation, candidate content, target evidence, or
  retry state is invalid
- **THEN** the CLI SHALL return the stable usage, domain, or write-conflict exit
  class and one parseable JSON failure envelope in JSON mode

### Requirement: Annotation Instructions Expose Intake Working Paths
`instructions annotation:<id>` SHALL expose the fixed session, review-copy,
interpretation, derived-delta, content-addressed source, and candidate locations
plus their schema references without adding a command or authorizing a write.

#### Scenario: Adapter requests intake instructions
- **WHEN** an adapter or Agent requests instructions for a valid annotation selector
- **THEN** the packet SHALL return contained workspace-relative working paths and the current Annotation Set candidate schema
- **AND** the existing action descriptor SHALL remain the only submission authorization

#### Scenario: Public surface is enumerated
- **WHEN** static CLI discovery or release acceptance enumerates commands
- **THEN** the surface SHALL remain exactly seventeen top-level commands
