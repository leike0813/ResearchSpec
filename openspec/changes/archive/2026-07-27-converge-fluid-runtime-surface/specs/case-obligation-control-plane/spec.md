## ADDED Requirements

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

