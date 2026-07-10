## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Dynamic Workflow Status Contract

`researchspec status` SHALL expose one read-only workflow-control view derived from the same snapshot and evaluator used by generalized instructions and Submit.

#### Scenario: Instance workflow reports a generalized frontier

- **GIVEN** a valid workflow with subflow templates and zero or more instances
- **WHEN** the user runs `researchspec status --json`
- **THEN** `workflow_control` SHALL include frontier, startable subflows, instances, parallel groups, scoped work states, ready work selectors, blockers, warnings and unlocks
- **AND** existing status fields and legacy work views SHALL remain available

#### Scenario: Unconfigured workflow remains inspectable

- **GIVEN** a valid workflow without work items or subflow templates
- **WHEN** the user runs status
- **THEN** it SHALL succeed with `configured: false`
- **AND** it SHALL not migrate or write workspace files

### Requirement: Dynamic Work-Item Instructions

ResearchSpec SHALL expose read-only instructions for available subflow templates, active subflow instances, scoped work and legacy work through canonical runtime selectors.

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

