## MODIFIED Requirements

### Requirement: Public Artifact Submit Command

ResearchSpec SHALL expose `submit work:<id>` with semantic-only provenance
input, actor identity, risk-tiered execution and versioned JSON results. The CLI
SHALL derive candidate, dependency, version and receipt identities.

#### Scenario: Automatic submission executes directly

- **WHEN** an automatic ready work item is submitted outside an interactive TTY
- **THEN** the CLI SHALL validate current availability and commit one internally
  planned transaction without requiring prior dry-run, plan hash or `--yes`
- **AND** optional expected basis or candidate hashes SHALL be enforced when
  supplied

#### Scenario: Manual submission is human-confirmed

- **WHEN** a work item declares per-artifact confirmation
- **THEN** execution SHALL require named human confirmation
- **AND** it SHALL NOT require external plan replay

#### Scenario: Submit failures use stable exit classes

- **WHEN** selector, semantic input, actor or optional hash syntax is invalid
- **THEN** Submit SHALL return exit code 2
- **WHEN** readiness, validation or dependency trust fails
- **THEN** Submit SHALL return exit code 1
- **WHEN** content, receipt, registry or read preconditions conflict
- **THEN** Submit SHALL return exit code 3

### Requirement: Public Subflow Start Command

ResearchSpec SHALL expose `start subflow:<template-id>` with semantic-only
input, actor identity, declared execution policy and versioned JSON results.
The CLI SHALL derive the canonical route, prerequisite, parent and basis fields.

#### Scenario: External route start uses named confirmation

- **WHEN** an available external template starts outside an interactive TTY
- **THEN** it SHALL require the route's named human confirmer
- **AND** it SHALL execute without mandatory prior dry-run, plan hash or `--yes`

#### Scenario: Delegated child starts directly

- **WHEN** a parent receipt authorizes one exact ready child
- **THEN** the child SHALL start in one invocation using current read
  preconditions
- **AND** an exact retry SHALL return the existing instance

#### Scenario: Start failures use stable exit classes

- **WHEN** selector, semantic input, actor or confirmer is invalid
- **THEN** Start SHALL return exit code 2
- **WHEN** workflow, route, prerequisites, parent or lifecycle blocks start
- **THEN** Start SHALL return exit code 1
- **WHEN** receipt, instance, optional basis or read preconditions conflict
- **THEN** Start SHALL return exit code 3

### Requirement: Public Transition Advance Command

ResearchSpec SHALL expose `advance transition:<instance>/<node>` as the public
workflow transition transaction and SHALL derive its input from the selector and
current authority state.

#### Scenario: Unique non-semantic transition executes directly

- **WHEN** exactly one non-semantic transition is currently eligible
- **THEN** Advance SHALL plan and commit it in one invocation without requiring
  prior dry-run, plan hash or `--yes`

#### Scenario: Formal boundary remains plan-bound

- **WHEN** advancement applies an accepted patch or other formal case action
- **THEN** it SHALL require the matching previewed plan and confirmation

#### Scenario: Advance reports scoped effects

- **WHEN** Advance previews, commits or exactly retries
- **THEN** JSON data SHALL report receipt identity, effects summary and next
  selectors without embedding full workflow control

### Requirement: Literature Adapter Status Is Static

The status and check command surface SHALL report fixed literature-Adapter
installation health from the static inspection SSOT without adding a command or
live connection probe.

#### Scenario: Status runs against adapter files

- **WHEN** Adapter runtime or Skill files are healthy, missing, drifted,
  unsupported or conflicted
- **THEN** status SHALL return a bounded summary with compact per-Adapter state,
  diagnostic counts and `check:literature-adapters`
- **AND** it SHALL NOT embed asset inventories, execute runtime code, connect to
  Host Bridge, access the network or read credentials

### Requirement: Schema-Derived Action Descriptors

Every Agent-callable write SHALL expose an action descriptor v2 generated from
its strict semantic validator, typed CLI-derived resolver and execution policy.
The descriptor SHALL identify the selector, availability basis and expiry,
semantic slots, valid minimal template, execution policy, optional dry-run and
next selectors.

#### Scenario: Agent prepares a write

- **WHEN** an Agent requests an allowed write descriptor
- **THEN** its minimal template SHALL pass the public semantic validator
- **AND** the caller SHALL NOT supply schema version, basis, dependency,
  identity, status, timestamp or receipt fields

#### Scenario: Mechanical fields are submitted

- **WHEN** a caller includes a CLI-derived field in a v2 payload
- **THEN** strict validation SHALL reject its field path with the action schema
  reference

#### Scenario: Execution policy is discoverable

- **WHEN** a descriptor represents a direct, human-confirmed or plan-bound action
- **THEN** it SHALL state that single policy and the exact required confirmation
  or hash bindings
- **AND** it SHALL NOT maintain independent dry-run and confirmation booleans

