## Purpose

Define the case-level obligation tracking control plane that owns hard
obligations, action availability, adaptive and strict evaluation, scoped
attempts, evidence separation, and explicit run completion.

## Requirements

### Requirement: Case Authority Contains Only Durable Commitments

ResearchSpec SHALL represent a run as hard obligations, justified hard
dependencies, accepted evidence, formal Gates and Decisions, pending case
actions, completion effects and receipts. Converter-owned playbooks,
Agent-selected plans, working material and failed attempts SHALL NOT become
runtime authority merely because they exist.

#### Scenario: Agent changes its working plan

- **WHEN** an Agent reorders or replaces work without changing a hard obligation
- **THEN** the Agent SHALL NOT need to rewrite CaseState
- **AND** accepted evidence and formal authority SHALL remain unchanged

### Requirement: Shared Action Availability

ResearchSpec SHALL use one evaluator for action availability in Status,
instructions and every writing command. Each result SHALL distinguish
`allowed`, `recommended` and `blocked`, identify a canonical selector, and bind
its basis and expiry conditions.

#### Scenario: Read and write surfaces evaluate the same action

- **WHEN** unchanged workspace facts are evaluated by Status, instructions and
  the target writing command
- **THEN** all three surfaces SHALL return the same availability result
- **AND** a soft recommendation SHALL NOT be reported as the only legal action

#### Scenario: Availability basis expires

- **WHEN** a read precondition used by an action descriptor has changed
- **THEN** execution SHALL reject the stale action
- **AND** it SHALL direct the caller to obtain a new descriptor

### Requirement: Adaptive And Strict Evaluation

An adaptive profile SHALL declare hard obligations, justified hard edges,
formal policies, completion criteria and a default playbook without enumerating
every legal work order. A strict profile SHALL additionally enforce its
declared graph, parallel groups, joins, Gates and transitions.

#### Scenario: Adaptive work is reordered

- **WHEN** two obligations have no declared hard dependency
- **THEN** the Agent MAY execute either first or work on them concurrently
- **AND** ResearchSpec SHALL still reject evidence that violates either
  obligation

#### Scenario: Strict graph is selected

- **WHEN** a run uses a strict profile
- **THEN** graph readiness, parallel joins, Gates and transitions SHALL remain
  authoritative

### Requirement: Scoped Attempts And Local Recovery

Attempts, retry, replacement, pause, waive and not-applicable effects SHALL be
scoped to their owning obligation or subflow unless a declared hard dependency
propagates the block.

#### Scenario: One producer attempt fails

- **WHEN** an attempt fails for one obligation and an unrelated obligation is
  otherwise allowed
- **THEN** the failed obligation SHALL retain its local diagnostics
- **AND** the unrelated obligation SHALL remain executable

#### Scenario: Required obligation is waived

- **WHEN** a user requests waiver of a non-optional hard obligation
- **THEN** ResearchSpec SHALL require the formal policy or Decision declared by
  the profile
- **AND** it SHALL NOT treat an Agent note as authority

### Requirement: Working And Accepted Evidence Are Distinct

ResearchSpec SHALL keep candidates and working evidence outside accepted
authority until a durable commit validates their identity, scope, provenance
and required receipt. Multiple mechanical outputs MAY be committed as one
bundle at a declared obligation boundary.

#### Scenario: Working material is inspected

- **WHEN** an Agent has produced intermediate notes or provider results
- **THEN** those files SHALL NOT satisfy a hard obligation
- **AND** only a validated accepted-evidence commit SHALL affect availability

### Requirement: Run Completion Is Explicit

`complete_subflow` SHALL terminate only its selected instance.
`complete_run` SHALL be the only effect that makes the enclosing run terminal.

#### Scenario: Standalone subflow completes

- **WHEN** a standalone subflow receives `complete_subflow`
- **THEN** its instance SHALL become terminal
- **AND** the run SHALL remain open for another allowed subflow or case action

#### Scenario: Strict pipeline reaches its declared final transition

- **WHEN** a strict pipeline satisfies its final completion policy
- **THEN** that transition MAY emit `complete_run`
- **AND** the run SHALL become terminal only after the effect is committed

### Requirement: Adaptive Case Actions Are Descriptor-Governed

Adaptive attempt, evidence, pause, retry, replacement, waiver,
not-applicable, formal Gate, completion, patch, and contract-change actions
SHALL be exposed through current action descriptors. A descriptor SHALL bind the
action to its hard-obligation scope, availability basis, expiry conditions, and
declared execution policy.

#### Scenario: Obligation needs a waiver or not-applicable resolution

- **WHEN** an adaptive producer requests a resolution for a non-optional hard
  obligation
- **THEN** the CLI SHALL create or expose a scoped `case-action:` requiring the
  declared formal Decision or policy
- **AND** an Agent note or failed attempt SHALL NOT waive the obligation

#### Scenario: Completion criterion is satisfied

- **WHEN** all obligations and Gates required by an adaptive
  `completion:` descriptor are satisfied
- **THEN** the CLI SHALL apply only the completion effects declared by that
  criterion
- **AND** `complete_subflow` SHALL not terminalize the enclosing run unless a
  declared `complete_run` effect is also committed

## ADDED Requirements

### Requirement: Decision-qualified obligation readiness
An accepted waiver or not-applicable Decision SHALL make its bound obligation ready for Gate evaluation while preserving the formal Gate requirement.

#### Scenario: Waived obligation reaches Gate readiness
- **WHEN** a current accepted Decision waives an obligation and all other Gate prerequisites are satisfied
- **THEN** the Gate SHALL be ready for Verify without treating the waiver as a Gate pass

#### Scenario: Decision evidence is recorded
- **WHEN** Verify evaluates readiness based on a waiver or not-applicable Decision
- **THEN** Gate evidence SHALL include the Decision ID, Decision event ID, and receipt path, hash, and plan hash
