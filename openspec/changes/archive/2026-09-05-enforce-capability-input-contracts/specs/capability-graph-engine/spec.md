## ADDED Requirements

### Requirement: Capability Input Contracts Are Enforced

Profile admission, root and child run creation, profile/run checking, node instructions and node
submission SHALL reject missing required input bindings, undeclared roles, disallowed sources and
unresolvable producer output-role mappings. Diagnostics SHALL identify the affected node and role.
Only an explicit from_role SHALL rename a node-output role. Static inspection SHALL not read external
material contents or run validators. Existing frozen graphs SHALL not be repaired automatically.

#### Scenario: Required role is omitted

- **WHEN** a graph binds rq_brief to a report capability requiring synthesis_report and methodology_blueprint
- **THEN** admission and submission fail with input-contract diagnostics before any state writes

#### Scenario: Producer role is explicitly renamed

- **WHEN** a binding selects an existing producer output using from_role
- **THEN** that output is resolved under the consumer's declared role
- **AND** an unknown producer output role is rejected

### Requirement: Node Inputs Resolve Before Consumption

Instructions and execution SHALL use the same role and source resolution. Submission SHALL require
all bound inputs to resolve from declared stable specs, handoff descriptors, completed node outputs
of the applicable round, or explicit parameter values before running output validators. Actual
consumption SHALL check external materials through the existing safe path and readability contract,
including supported directory inputs. A failure, including dry-run failure, SHALL leave workflow
state and external files unchanged.

#### Scenario: Upstream material disappears

- **WHEN** a completed upstream node references a file that is absent at downstream submission
- **THEN** submission fails without marking the downstream node complete

#### Scenario: Required material is available

- **WHEN** every bound input resolves and all output validations pass
- **THEN** the node completes through the existing runtime write plan

### Requirement: Presets Supply Their Capability Inputs

The minimal profile SHALL compose research-question formulation, methodology design, literature
search, source grading, evidence synthesis and report compilation without formal Gates. Both minimal
and research-main SHALL supply synthesis and methodology to report compilation. Writing SHALL receive
bibliography and synthesis, including explicit research-to-writing child handoffs. Specialist and
editorial review SHALL receive manuscript and declared reviewer configuration. Route metadata SHALL
describe the resulting work and outputs.

#### Scenario: Minimal run completes

- **WHEN** a user completes the minimal research chain through public CLI commands
- **THEN** report instructions expose both required input roles and the completed run is persisted

#### Scenario: Writing consumes research outputs

- **WHEN** the pipeline starts the writing child after research
- **THEN** bibliography and synthesis are available under the writing capability's declared roles
